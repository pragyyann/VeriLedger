package com.veriledger.core;

import com.veriledger.model.Transaction;
import com.veriledger.model.TransactionType;
import com.veriledger.repository.TransactionRepository;
import com.veriledger.util.HashUtil;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

@Slf4j
public class Ledger {

    private final String userId;
    private final TransactionRepository repository;
    private final ReadWriteLock lock = new ReentrantReadWriteLock();

    public Ledger(String userId, TransactionRepository repository) {
        this.userId = userId;
        this.repository = repository;
    }

    public Transaction addTransaction(BigDecimal amount, TransactionType type, String category,
                                      String walletAddress, String signature) {
        lock.writeLock().lock();
        try {
            List<Transaction> transactions = getTransactions();
            String previousHash = transactions.isEmpty() ? "GENESIS" : transactions.get(transactions.size() - 1).getHash();
            UUID id = UUID.randomUUID();
            LocalDateTime timestamp = LocalDateTime.now();

            String rawData = id.toString() + timestamp.toString() + amount.toString() + type.name() + category + previousHash;
            String currentHash = HashUtil.calculateHash(rawData);

            Transaction tx = Transaction.builder()
                    .id(id)
                    .userId(userId)
                    .timestamp(timestamp)
                    .amount(amount)
                    .type(type)
                    .category(category)
                    .previousHash(previousHash)
                    .hash(currentHash)
                    .walletAddress(walletAddress)
                    .signature(signature)
                    .build();

            return repository.save(tx);
        } finally {
            lock.writeLock().unlock();
        }
    }

    public List<Transaction> getTransactions() {
        return repository.findByUserIdOrderByTimestampAsc(userId);
    }

    public BigDecimal replayBalance() {
        List<Transaction> transactions = getTransactions();
        BigDecimal balance = BigDecimal.ZERO;
        for (Transaction tx : transactions) {
            if (tx.getType() == TransactionType.INCOME) {
                balance = balance.add(tx.getAmount());
            } else if (tx.getType() == TransactionType.EXPENSE) {
                balance = balance.subtract(tx.getAmount());
            }
        }
        return balance;
    }

    public String computeCumulativeLedgerHash() {
        List<Transaction> transactions = getTransactions();
        if (transactions.isEmpty()) return "GENESIS";
        return transactions.get(transactions.size() - 1).getHash();
    }

    public String calculateActualCurrentHash() {
        List<Transaction> transactions = getTransactions();
        if (transactions.isEmpty()) return "GENESIS";
        Transaction lastTx = transactions.get(transactions.size() - 1);
        
        String rawData = lastTx.getId().toString() + 
                         lastTx.getTimestamp().toString() + 
                         lastTx.getAmount().toString() + 
                         lastTx.getType().name() + 
                         lastTx.getCategory() + 
                         lastTx.getPreviousHash();
                         
        return HashUtil.calculateHash(rawData);
    }

    public boolean tamperLedger() {
        lock.writeLock().lock();
        try {
            List<Transaction> transactions = getTransactions();
            if (transactions.isEmpty()) return false;
            
            Transaction target = transactions.get(transactions.size() - 1);
            
            // In a real DB, tampering means performing a rogue UPDATE
            // that bypasses standard hashing logic.
            target.setAmount(target.getAmount().add(BigDecimal.valueOf(999.00)));
            target.setCategory("HACKED_" + target.getCategory());
            
            // Save the tampered record to DB WITH the old valid hash. 
            // This forces the auditor to detect the mismatch!
            repository.save(target);
            return true;
        } finally {
            lock.writeLock().unlock();
        }
    }

    public void repairLedger() {
        lock.writeLock().lock();
        try {
            List<Transaction> transactions = getTransactions();
            if (transactions.isEmpty()) return;
            
            Transaction target = transactions.get(transactions.size() - 1);
            if (target.getCategory().startsWith("HACKED_")) {
                // To repair the hack, we can delete the hacked row for demonstration
                log.info("Repairing ledger by deleting hacked transaction: " + target.getId());
                repository.delete(target);
            }
        } finally {
            lock.writeLock().unlock();
        }
    }
}
