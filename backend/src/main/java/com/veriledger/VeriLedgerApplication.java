package com.veriledger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class VeriLedgerApplication {

    public static void main(String[] args) {
        SpringApplication.run(VeriLedgerApplication.class, args);
        System.out.println("====== VERILEDGER BACKEND STARTED ======");
    }
}
