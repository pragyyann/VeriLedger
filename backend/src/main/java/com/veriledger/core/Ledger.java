package com.veriledger.core;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.veriledger.model.Transaction;
import com.veriledger.model.TransactionType;
import com.veriledger.util.HashUtil;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

@Slf4j
public class Ledger {

    private final List<Transaction> transactions = new ArrayList<>();
    private final ReadWriteLock lock = new ReentrantReadWriteLock();
    private final String ledgerFilePath;
    private final ObjectMapper mapper;

    public Ledger(String ledgerFilePath) {
        this.ledgerFilePath = ledgerFilePath;
        this.mapper = new ObjectMapper();
        this.mapper.registerModule(new JavaTimeModule());
    }

    @PostConstruct
    public void init() {
        loadLedgerFromFile();
    }

    @PreDestroy
    public void destroy() {
        saveLedgerToFile();
    }

    public Transaction addTransaction(BigDecimal amount, TransactionType type, String category,
                                      String walletAddress, String signature) {
        lock.writeLock().lock();
        try {
            String previousHash = transactions.isEmpty() ? "GENESIS" : transactions.get(transactions.size() - 1).getHash();
            UUID id = UUID.randomUUID();
            LocalDateTime timestamp = LocalDateTime.now();

            String rawData = id.toString() + timestamp.toString() + amount.toString() + type.name() + category + previousHash;
            String currentHash = HashUtil.calculateHash(rawData);

            Transaction tx = Transaction.builder()
                    .id(id)
                    .timestamp(timestamp)
                    .amount(amount)
                    .type(type)
                    .category(category)
                    .previousHash(previousHash)
                    .hash(currentHash)
                    .walletAddress(walletAddress)
                    .signature(signature)
                    .build();

            transactions.add(tx);
            saveLedgerToFile();
            return tx;
        } finally {
            lock.writeLock().unlock();
        }
    }

    public List<Transaction> getTransactions() {
        lock.readLock().lock();
        try {
            return Collections.unmodifiableList(new ArrayList<>(transactions));
        } finally {
            lock.readLock().unlock();
        }
    }

    public BigDecimal replayBalance() {
        lock.readLock().lock();
        try {
            BigDecimal balance = BigDecimal.ZERO;
            for (Transaction tx : transactions) {
                if (tx.getType() == TransactionType.INCOME) {
                    balance = balance.add(tx.getAmount());
                } else if (tx.getType() == TransactionType.EXPENSE) {
                    balance = balance.subtract(tx.getAmount());
                }
            }
            return balance;
        } finally {
            lock.readLock().unlock();
        }
    }

    public String computeCumulativeLedgerHash() {
        lock.readLock().lock();
        try {
            if (transactions.isEmpty()) return "GENESIS";
            return transactions.get(transactions.size() - 1).getHash();
        } finally {
            lock.readLock().unlock();
        }
    }

    /**
     * Recalculates the hash from the actual data of the last transaction,
     * ignoring the stored 'hash' field. This is used to detect tampering
     * in real-time comparison with the blockchain.
     */
    public String calculateActualCurrentHash() {
        lock.readLock().lock();
        try {
            if (transactions.isEmpty()) return "GENESIS";
            Transaction lastTx = transactions.get(transactions.size() - 1);
            
            String rawData = lastTx.getId().toString() + 
                             lastTx.getTimestamp().toString() + 
                             lastTx.getAmount().toString() + 
                             lastTx.getType().name() + 
                             lastTx.getCategory() + 
                             lastTx.getPreviousHash();
                             
            return HashUtil.calculateHash(rawData);
        } finally {
            lock.readLock().unlock();
        }
    }

    public boolean tamperLedger() {
        lock.writeLock().lock();
        try {
            if (transactions.isEmpty()) return false;
            Transaction target = transactions.remove(transactions.size() - 1);
            // Cryptographically flawed identical duplication
            Transaction tampered = Transaction.builder()
                    .id(target.getId())
                    .timestamp(target.getTimestamp())
                    .amount(target.getAmount().add(BigDecimal.valueOf(999.00))) // Hack the amount!
                    .type(target.getType())
                    .category("HACKED_" + target.getCategory()) // Obvious hack tag
                    .previousHash(target.getPreviousHash())
                    .hash(target.getHash()) // Keeping original hash forces Audit mismatch!
                    .build();
            transactions.add(tampered);
            return true; // We purposefully DO NOT saveToFile() so it remains a memory-only hack
        } finally {
            lock.writeLock().unlock();
        }
    }

    public void repairLedger() {
        lock.writeLock().lock();
        try {
            loadLedgerFromFile(); // Fetches the untouched truth from disk
        } finally {
            lock.writeLock().unlock();
        }
    }

    private void loadLedgerFromFile() {
        File file = new File(ledgerFilePath);
        if (file.exists()) {
            try {
                List<Transaction> loaded = mapper.readValue(file, new TypeReference<>() {});
                transactions.clear();
                transactions.addAll(loaded);
                System.out.println("Loaded " + transactions.size() + " transactions from " + ledgerFilePath);
            } catch (IOException e) {
                System.err.println("Error loading ledger: " + e.getMessage());
            }
        }
    }

    private void saveLedgerToFile() {
        try {
            mapper.writerWithDefaultPrettyPrinter().writeValue(new File(ledgerFilePath), transactions);
        } catch (IOException e) {
            System.err.println("Error saving ledger: " + e.getMessage());
        }
    }
}
