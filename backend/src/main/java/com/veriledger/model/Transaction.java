package com.veriledger.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    UUID id;
    LocalDateTime timestamp;
    BigDecimal amount;
    TransactionType type;
    String category;
    String previousHash;
    String hash;
    // MetaMask signing fields (optional - null if signed without wallet)
    String walletAddress;
    String signature;
}
