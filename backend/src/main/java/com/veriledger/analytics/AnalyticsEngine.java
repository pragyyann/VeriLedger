package com.veriledger.analytics;

import com.veriledger.core.Ledger;
import com.veriledger.model.Transaction;
import com.veriledger.model.TransactionType;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsEngine {

    public AnalyticsReport generateReport(Ledger ledger) {
        List<Transaction> transactions = ledger.getTransactions();
        
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        Map<String, BigDecimal> expenseByCategory = new HashMap<>();
        Map<String, BigDecimal> incomeByCategory = new HashMap<>();
        
        // Timeline aggregation (Sort and group by Year-Month)
        Map<String, Map<String, BigDecimal>> timelineMap = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");

        for (Transaction tx : transactions) {
            String month = tx.getTimestamp().format(formatter);
            timelineMap.putIfAbsent(month, new HashMap<>(Map.of("income", BigDecimal.ZERO, "expense", BigDecimal.ZERO)));
            
            if (tx.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(tx.getAmount());
                incomeByCategory.put(tx.getCategory(), 
                    incomeByCategory.getOrDefault(tx.getCategory(), BigDecimal.ZERO).add(tx.getAmount()));
                
                timelineMap.get(month).put("income", timelineMap.get(month).get("income").add(tx.getAmount()));
            } else if (tx.getType() == TransactionType.EXPENSE) {
                totalExpense = totalExpense.add(tx.getAmount());
                expenseByCategory.put(tx.getCategory(), 
                    expenseByCategory.getOrDefault(tx.getCategory(), BigDecimal.ZERO).add(tx.getAmount()));
                
                timelineMap.get(month).put("expense", timelineMap.get(month).get("expense").add(tx.getAmount()));
            }
        }

        List<Map<String, Object>> cashFlowTimeline = timelineMap.entrySet().stream().map(e -> {
            Map<String, Object> data = new HashMap<>();
            data.put("date", e.getKey());
            data.put("income", e.getValue().get("income"));
            data.put("expense", e.getValue().get("expense"));
            return data;
        }).collect(Collectors.toList());

        return AnalyticsReport.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netBalance(totalIncome.subtract(totalExpense))
                .expenseByCategory(expenseByCategory)
                .incomeByCategory(incomeByCategory)
                .cashFlowTimeline(cashFlowTimeline)
                .build();
    }

    @Data
    @Builder
    public static class AnalyticsReport {
        private BigDecimal totalIncome;
        private BigDecimal totalExpense;
        private BigDecimal netBalance;
        private Map<String, BigDecimal> expenseByCategory;
        private Map<String, BigDecimal> incomeByCategory;
        private List<Map<String, Object>> cashFlowTimeline;
    }
}
