import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, Info } from 'lucide-react';

export default function BalanceBreakdown({ analytics }) {
    if (!analytics) return (
        <div className="glass-panel p-6 animate-pulse space-y-4">
            <div className="h-4 w-48 bg-white/10 rounded" />
            <div className="grid grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="h-24 bg-white/10 rounded-xl" />)}
            </div>
        </div>
    );

    const { totalIncome = 0, totalExpense = 0, netBalance = 0 } = analytics;
    const txCount = analytics.cashFlowTimeline?.reduce((sum, m) => sum + (m.income > 0 ? 1 : 0) + (m.expense > 0 ? 1 : 0), 0) || '—';

    const cards = [
        { label: 'Total Income', value: totalIncome, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', prefix: '+' },
        { label: 'Total Expenses', value: totalExpense, icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-400/10 border-rose-400/20', prefix: '-' },
        { label: 'Net Balance', value: netBalance, icon: Wallet, color: netBalance >= 0 ? 'text-sky-400' : 'text-rose-400', bg: netBalance >= 0 ? 'bg-sky-400/10 border-sky-400/20' : 'bg-rose-400/10 border-rose-400/20', prefix: '' },
    ];

    return (
        <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Info className="text-primary w-5 h-5" /> How is my balance calculated?
                    </h2>
                    <p className="text-gray-500 text-xs mt-1 font-mono uppercase tracking-widest">
                        Derived from {txCount} transaction periods
                    </p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {cards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-4 rounded-xl border ${card.bg} flex flex-col gap-2`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-xs uppercase tracking-wider">{card.label}</span>
                            <card.icon className={`w-4 h-4 ${card.color}`} />
                        </div>
                        <p className={`text-2xl font-black font-mono ${card.color}`}>
                            {card.prefix}${Math.abs(card.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Step-by-step derivation */}
            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Balance Derivation</p>
                <div className="flex flex-wrap items-center gap-2 text-sm font-mono">
                    <span className="text-emerald-400 font-bold">Income: ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span className="text-gray-600">−</span>
                    <span className="text-rose-400 font-bold">Expenses: ${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span className="text-gray-600">=</span>
                    <span className={`font-black text-base px-3 py-0.5 rounded-full border ${netBalance >= 0 ? 'text-sky-400 border-sky-400/30 bg-sky-400/10' : 'text-rose-400 border-rose-400/30 bg-rose-400/10'}`}>
                        Balance: ${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </div>
            </div>
        </div>
    );
}
