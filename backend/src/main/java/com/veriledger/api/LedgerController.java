package com.veriledger.api;

import com.veriledger.auth.WalletVerifier;
import com.veriledger.analytics.AnalyticsEngine;
import com.veriledger.audit.AuditReport;
import com.veriledger.audit.LedgerAuditor;
import com.veriledger.blockchain.BlockchainService;
import com.veriledger.core.Ledger;
import com.veriledger.core.LedgerRegistry;
import com.veriledger.model.Transaction;
import com.veriledger.model.TransactionType;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class LedgerController {

    private final LedgerRegistry ledgerRegistry;
    private final BlockchainService blockchainService;
    private final AnalyticsEngine analyticsEngine;
    private final LedgerAuditor ledgerAuditor;
    private final WalletVerifier walletVerifier;

    private Ledger ledger(HttpServletRequest req) {
        String userId = (String) req.getAttribute("userId");
        return ledgerRegistry.getOrCreate(userId);
    }

    @PostMapping("/transactions")
    public ResponseEntity<?> addTransaction(@RequestBody TransactionRequest body, HttpServletRequest req) {
        // If a wallet signature was provided, verify it before proceeding
        if (body.getWalletAddress() != null && body.getSignature() != null) {
            String sigMessage = body.buildSignatureMessage();
            boolean valid = walletVerifier.verify(sigMessage, body.getSignature(), body.getWalletAddress());
            if (!valid) {
                return ResponseEntity.status(403).body(Map.of(
                    "error", "Invalid wallet signature. Transaction rejected.",
                    "recoveredAddress", "mismatch"
                ));
            }
        }
        Ledger l = ledger(req);
        Transaction tx = l.addTransaction(
            body.getAmount(), body.getType(), body.getCategory(),
            body.getWalletAddress(), body.getSignature()
        );
        new Thread(() -> blockchainService.sendLedgerHashToBlockchain(l)).start();
        return ResponseEntity.ok(tx);
    }

    @GetMapping("/ledger")
    public ResponseEntity<List<Transaction>> getLedger(HttpServletRequest req) {
        return ResponseEntity.ok(ledger(req).getTransactions());
    }

    @GetMapping("/balance")
    public ResponseEntity<Map<String, BigDecimal>> getBalance(HttpServletRequest req) {
        return ResponseEntity.ok(Map.of("balance", ledger(req).replayBalance()));
    }

    @GetMapping("/audit")
    public ResponseEntity<AuditReport> getAuditReport(HttpServletRequest req) {
        return ResponseEntity.ok(ledgerAuditor.performFullAudit(ledger(req)));
    }

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsEngine.AnalyticsReport> getAnalytics(HttpServletRequest req) {
        return ResponseEntity.ok(analyticsEngine.generateReport(ledger(req)));
    }

    @GetMapping("/blockchain/verify")
    public ResponseEntity<BlockchainService.BlockchainVerificationResult> verifyBlockchain(HttpServletRequest req) {
        return ResponseEntity.ok(blockchainService.verifyLedgerAgainstBlockchain(ledger(req)));
    }

    @PostMapping("/blockchain/sync")
    public ResponseEntity<Map<String, String>> triggerBlockchainSync(HttpServletRequest req) {
        String res = blockchainService.sendLedgerHashToBlockchain(ledger(req));
        return ResponseEntity.ok(Map.of("result", res));
    }

    @PostMapping("/tamper")
    public ResponseEntity<Map<String, Boolean>> simulateTampering(HttpServletRequest req) {
        return ResponseEntity.ok(Map.of("tampered", ledger(req).tamperLedger()));
    }

    @PostMapping("/repair")
    public ResponseEntity<Map<String, Boolean>> repairLedger(HttpServletRequest req) {
        ledger(req).repairLedger();
        return ResponseEntity.ok(Map.of("repaired", true));
    }

    @Data
    static class TransactionRequest {
        private BigDecimal amount;
        private TransactionType type;
        private String category;
        // MetaMask signing (optional)
        private String walletAddress;
        private String signature;

        /** Reconstructs the exact message string that was signed in the browser. */
        public String buildSignatureMessage() {
            return String.format("VeriLedger Transaction\nAction: Add\nAmount: %s\nType: %s\nCategory: %s",
                    amount.toPlainString(), type.name(), category);
        }
    }
}
