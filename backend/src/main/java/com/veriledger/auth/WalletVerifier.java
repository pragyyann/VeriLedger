package com.veriledger.auth;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Hash;
import org.web3j.crypto.Keys;
import org.web3j.crypto.Sign;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

/**
 * Verifies Ethereum personal_sign (EIP-191) signatures.
 *
 * MetaMask personal_sign prepends "\x19Ethereum Signed Message:\n{len}" before hashing.
 * This class manually implements that prefix logic and uses Web3j's ECKey recovery.
 */
@Slf4j
@Service
public class WalletVerifier {

    public boolean verify(String message, String signature, String claimedAddress) {
        try {
            String recoveredAddress = recoverAddress(message, signature);
            boolean matches = recoveredAddress.equalsIgnoreCase(claimedAddress);
            if (!matches) {
                log.warn("Signature mismatch! Claimed: {} | Recovered: {}", claimedAddress, recoveredAddress);
            }
            return matches;
        } catch (Exception e) {
            log.error("Signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    public String recoverAddress(String message, String hexSignature) throws Exception {
        byte[] messageBytes = message.getBytes(StandardCharsets.UTF_8);

        // EIP-191: prepend "\x19Ethereum Signed Message:\n" + length
        String prefix = "\u0019Ethereum Signed Message:\n" + messageBytes.length;
        byte[] prefixBytes = prefix.getBytes(StandardCharsets.UTF_8);

        // Concatenate and keccak256 hash
        byte[] combined = new byte[prefixBytes.length + messageBytes.length];
        System.arraycopy(prefixBytes, 0, combined, 0, prefixBytes.length);
        System.arraycopy(messageBytes, 0, combined, prefixBytes.length, messageBytes.length);
        byte[] msgHash = Hash.sha3(combined);

        // Decode the hex signature (65 bytes)
        byte[] sigBytes = Numeric.hexStringToByteArray(hexSignature);
        if (sigBytes.length < 65) throw new IllegalArgumentException("Signature too short: " + sigBytes.length);

        byte[] r = Arrays.copyOfRange(sigBytes, 0, 32);
        byte[] s = Arrays.copyOfRange(sigBytes, 32, 64);
        int v = sigBytes[64] & 0xFF;
        if (v < 27) v += 27;
        int recoveryId = v - 27; // must be 0 or 1

        Sign.SignatureData sigData = new Sign.SignatureData((byte) v, r, s);

        // Try both recovery IDs (0 and 1) — one will match the signer
        for (int i = 0; i <= 1; i++) {
            BigInteger publicKey = Sign.recoverFromSignature(i, ecPointFromSig(r, s), msgHash);
            if (publicKey != null) {
                String candidate = "0x" + Keys.getAddress(publicKey);
                if (candidate.equalsIgnoreCase("0x" + Keys.getAddress(
                        Sign.recoverFromSignature(recoveryId, ecPointFromSig(r, s), msgHash)))) {
                    // use the recoveryId from the signature
                    break;
                }
            }
        }

        BigInteger publicKey = Sign.recoverFromSignature(recoveryId, ecPointFromSig(r, s), msgHash);
        if (publicKey == null) throw new Exception("Could not recover public key from signature");
        return "0x" + Keys.getAddress(publicKey);
    }

    private org.web3j.crypto.ECDSASignature ecPointFromSig(byte[] r, byte[] s) {
        return new org.web3j.crypto.ECDSASignature(
                new BigInteger(1, r),
                new BigInteger(1, s)
        );
    }
}
