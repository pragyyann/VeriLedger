package com.veriledger.audit;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuditReport {
    private boolean isIntact;
    private boolean isChronological;
    private String compromisedTransactionId;
    private String errorMessage;
}
