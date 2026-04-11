package com.veriledger.audit;

import com.veriledger.core.Ledger;
import com.veriledger.model.Transaction;
import com.veriledger.util.HashUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LedgerAuditor {

    public AuditReport performFullAudit(Ledger ledger) {
        List<Transaction> transactions = ledger.getTransactions();
        
        if (transactions.isEmpty()) {
            return AuditReport.builder()
                    .isIntact(true)
                    .isChronological(true)
                    .errorMessage("Ledger is empty")
                    .build();
        }

        String previousHash = "GENESIS";
        
        for (int i = 0; i < transactions.size(); i++) {
            Transaction currentTx = transactions.get(i);
            
            // 1. Verify previous hash link matches
            if (!currentTx.getPreviousHash().equals(previousHash)) {
                return AuditReport.builder()
                        .isIntact(false)
                        .isChronological(false)
                        .compromisedTransactionId(currentTx.getId().toString())
                        .errorMessage("Chain broken! Previous hash mismatch at transaction index: " + i)
                        .build();
            }

            // 2. Chronology check (timestamp should be after or equal to previous)
            if (i > 0) {
                Transaction previousTx = transactions.get(i - 1);
                if (currentTx.getTimestamp().isBefore(previousTx.getTimestamp())) {
                    return AuditReport.builder()
                            .isIntact(false)
                            .isChronological(false)
                            .compromisedTransactionId(currentTx.getId().toString())
                            .errorMessage("Chronology error! Transaction timestamp precedes prior transaction at index: " + i)
                            .build();
                }
            }

            // 3. Recompute and verify current hash
            String rawData = currentTx.getId().toString() + 
                             currentTx.getTimestamp().toString() + 
                             currentTx.getAmount().toString() + 
                             currentTx.getType().name() + 
                             currentTx.getCategory() + 
                             currentTx.getPreviousHash();
                             
            String calculatedHash = HashUtil.calculateHash(rawData);
            
            if (!calculatedHash.equals(currentTx.getHash())) {
                return AuditReport.builder()
                        .isIntact(false)
                        .isChronological(true)
                        .compromisedTransactionId(currentTx.getId().toString())
                        .errorMessage("Data Tampering Detected! Payload hash mismatch at transaction index: " + i)
                        .build();
            }
            
            previousHash = currentTx.getHash();
        }

        return AuditReport.builder()
                .isIntact(true)
                .isChronological(true)
                .errorMessage("Audit passed. No tampering detected.")
                .build();
    }
}
