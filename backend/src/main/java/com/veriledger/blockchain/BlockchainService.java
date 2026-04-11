package com.veriledger.blockchain;

import com.veriledger.core.Ledger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.RawTransaction;
import org.web3j.crypto.TransactionEncoder;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthCall;
import org.web3j.protocol.core.methods.response.EthGetTransactionCount;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.http.HttpService;
import org.web3j.utils.Numeric;

import jakarta.annotation.PostConstruct;
import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BlockchainService {

    @Value("${blockchain.rpc.url}")
    private String rpcUrl;

    @Value("${blockchain.contract.address}")
    private String contractAddress;

    @Value("${blockchain.private.key}")
    private String privateKey;

    @Value("${blockchain.chain.id:1}")
    private long chainId;

    private Web3j web3j;
    private Credentials credentials;

    @PostConstruct
    public void init() {
        try {
            this.web3j = Web3j.build(new HttpService(rpcUrl));
            if(privateKey != null && !privateKey.equals("0xYourPrivateKeyHere") && !privateKey.isEmpty()){
                this.credentials = Credentials.create(privateKey);
                log.info("Connected to Ethereum node version: {}", web3j.web3ClientVersion().send().getWeb3ClientVersion());
            } else {
                log.warn("Ethereum Private Key not configured. Writes to blockchain will fail.");
            }
        } catch (Exception e) {
            log.error("Failed to connect to Blockchain node: {}", e.getMessage());
        }
    }

    public synchronized String sendLedgerHashToBlockchain(Ledger ledger) {
        if (credentials == null) {
            return "Failed: Private Key not configured.";
        }
        try {
            String currentHash = ledger.computeCumulativeLedgerHash();

            // Function: anchorLedgerHash(string _newHash)
            Function function = new Function(
                    "anchorLedgerHash",
                    Collections.singletonList(new Utf8String(currentHash)),
                    Collections.emptyList()
            );

            String encodedFunction = FunctionEncoder.encode(function);

            EthGetTransactionCount ethGetTransactionCount = web3j.ethGetTransactionCount(
                    credentials.getAddress(), DefaultBlockParameterName.LATEST).send();
            BigInteger nonce = ethGetTransactionCount.getTransactionCount();

            // Estimates or hardcoded values for Sepolia testnet
            BigInteger gasPrice = web3j.ethGasPrice().send().getGasPrice();
            BigInteger gasLimit = BigInteger.valueOf(100_000);

            RawTransaction rawTransaction = RawTransaction.createTransaction(
                    nonce, gasPrice, gasLimit, contractAddress, encodedFunction);

            byte[] signedMessage = TransactionEncoder.signMessage(rawTransaction, chainId, credentials);
            String hexValue = Numeric.toHexString(signedMessage);

            EthSendTransaction ethSendTransaction = web3j.ethSendRawTransaction(hexValue).send();

            if (ethSendTransaction.hasError()) {
                log.error("Error anchoring hash: {}", ethSendTransaction.getError().getMessage());
                return "Error: " + ethSendTransaction.getError().getMessage();
            }

            return "Transaction Hash: " + ethSendTransaction.getTransactionHash();
        } catch (Exception e) {
            log.error("Exception checking blockchain", e);
            return "Error: " + e.getMessage();
        }
    }

    public String fetchLedgerHashFromBlockchain() {
        try {
            // Function: getLatestLedgerHash() -> returns string
            Function function = new Function(
                    "getLatestLedgerHash",
                    Collections.emptyList(),
                    Arrays.asList(new TypeReference<Utf8String>() {})
            );

            String encodedFunction = FunctionEncoder.encode(function);

            Transaction transaction = Transaction.createEthCallTransaction(
                    "0x0000000000000000000000000000000000000000", contractAddress, encodedFunction);

            EthCall response = web3j.ethCall(transaction, DefaultBlockParameterName.LATEST).send();
            
            if(response.hasError()) return "Error: " + response.getError().getMessage();

            List<Type> decodedContent = FunctionReturnDecoder.decode(
                    response.getValue(), function.getOutputParameters());

            if (!decodedContent.isEmpty()) {
                return decodedContent.get(0).getValue().toString();
            }
            return "GENESIS";
        } catch (Exception e) {
            log.error("Failed to read from contract", e);
            return "Error reading from Blockchain";
        }
    }

    public BlockchainVerificationResult verifyLedgerAgainstBlockchain(Ledger ledger) {
        String localHash = ledger.calculateActualCurrentHash();
        String blockchainHash = fetchLedgerHashFromBlockchain();
        
        boolean isMatch = localHash.equals(blockchainHash);
        return new BlockchainVerificationResult(isMatch, localHash, blockchainHash);
    }
    
    public record BlockchainVerificationResult(boolean verified, String localHash, String blockchainHash) {}
}
