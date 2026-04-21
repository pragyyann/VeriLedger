package com.veriledger.audit;

import com.veriledger.core.Ledger;
import com.veriledger.model.Transaction;
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
            
            // 1. Verify previous hash link: each tx must point to the prior tx's hash
            if (!currentTx.getPreviousHash().equals(previousHash)) {
                return AuditReport.builder()
                        .isIntact(false)
                        .isChronological(false)
                        .compromisedTransactionId(currentTx.getId().toString())
                        .errorMessage("Hash chain broken at transaction index: " + i +
                                ". Expected previousHash=" + previousHash +
                                " but found=" + currentTx.getPreviousHash())
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
                            .errorMessage("Chronology error at transaction index: " + i)
                            .build();
                }
            }

            // 3. Verify this tx's hash is actually referenced by the next tx's previousHash
            //    (implicitly done by the next iteration's previousHash check above)
            previousHash = currentTx.getHash();
        }

        return AuditReport.builder()
                .isIntact(true)
                .isChronological(true)
                .errorMessage("Audit passed. No tampering detected.")
                .build();
    }
}
