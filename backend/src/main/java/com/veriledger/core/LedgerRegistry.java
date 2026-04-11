package com.veriledger.core;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class LedgerRegistry {

    @Value("${ledger.file.path:ledger.json}")
    private String basePath;

    private final Map<String, Ledger> ledgers = new ConcurrentHashMap<>();

    public Ledger getOrCreate(String userId) {
        return ledgers.computeIfAbsent(userId, id -> {
            // Each user gets their own file: ledger-{userId}.json
            String filePath = "ledger-" + sanitize(id) + ".json";
            Ledger ledger = new Ledger(filePath);
            ledger.init();
            log.info("Created new ledger for user: {}", id);
            return ledger;
        });
    }

    private String sanitize(String userId) {
        // Remove characters invalid in filenames, keep it safe
        return userId.replaceAll("[^a-zA-Z0-9_\\-]", "_");
    }
}
