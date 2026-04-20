package com.veriledger.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "transactions")
public class Transaction {
    
    @Id
    private UUID id;
    
    private String userId;
    
    private LocalDateTime timestamp;
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    private TransactionType type;
    
    private String category;
    private String previousHash;
    private String hash;
    
    // MetaMask signing fields (optional - null if signed without wallet)
    private String walletAddress;
    
    @Column(length = 2000)
    private String signature;
}
