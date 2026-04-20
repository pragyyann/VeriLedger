package com.veriledger.core;

import com.veriledger.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class LedgerRegistry {

    private final TransactionRepository transactionRepository;
    private final Map<String, Ledger> ledgers = new ConcurrentHashMap<>();

    public Ledger getOrCreate(String userId) {
        return ledgers.computeIfAbsent(userId, id -> {
            Ledger ledger = new Ledger(id, transactionRepository);
            log.info("Initialized DB-backed ledger adapter for user: {}", id);
            return ledger;
        });
    }
}
