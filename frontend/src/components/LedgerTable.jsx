import { useState, useEffect } from 'react';
import api from '../services/api';
import { Table, Clock, ArrowUpRight, ArrowDownRight, ShieldCheck } from 'lucide-react';

function SkeletonRow() {
    return (
        <tr className="border-b border-white/5">
            {[...Array(5)].map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-4 bg-white/10 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
                </td>
            ))}
        </tr>
    );
}

function TimelineView({ transactions }) {
    if (transactions.length === 0) return (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500 gap-3">
            <Clock className="w-12 h-12 opacity-20" />
            <p className="text-sm italic">No transactions yet. Start your ledger to see the timeline.</p>
        </div>
    );

    return (
        <div className="relative pl-8 space-y-0">
            {/* Vertical line */}
            <div className="absolute left-3.5 top-0 bottom-0 w-px bg-white/10" />
            {transactions.map((tx, idx) => (
                <div key={tx.id} className="relative flex gap-4 items-start pb-6 group">
                    {/* Dot */}
                    <div className={`absolute -left-5 mt-1 w-3 h-3 rounded-full border-2 shrink-0 z-10 transition-transform group-hover:scale-125 duration-200
                        ${tx.type === 'INCOME' ? 'bg-emerald-400 border-emerald-400/50' : 'bg-rose-400 border-rose-400/50'}`}
                    />
                    {/* Card */}
                    <div className="ml-2 flex-1 bg-black/30 border border-white/5 hover:border-white/15 rounded-xl p-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                                {tx.type === 'INCOME'
                                    ? <ArrowUpRight className="text-emerald-400 shrink-0 w-4 h-4" />
                                    : <ArrowDownRight className="text-rose-400 shrink-0 w-4 h-4" />
                                }
                                <span className={`font-bold text-sm ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>{tx.category}</span>
                            </div>
                            <span className={`font-black font-mono text-sm ml-auto ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {tx.type === 'INCOME' ? '+' : '-'}${parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                            <span className="font-mono">{new Date(tx.timestamp).toLocaleString()}</span>
                            <span className="font-mono truncate max-w-[140px]" title={tx.hash}>#{tx.hash?.substring(0, 12)}...</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function LedgerTable({ refreshTrigger }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('table'); // 'table' | 'timeline'

    useEffect(() => {
        const fetchLedger = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get('/ledger');
                setTransactions(res.data);
            } catch (err) {
                setError('Unable to fetch ledger data. Is the backend running?');
            } finally {
                setLoading(false);
            }
        };
        fetchLedger();
    }, [refreshTrigger]);

    return (
        <div className="glass-panel p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Table className="text-primary" /> Immutable Ledger
                </h2>
                {/* Toggle */}
                <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/10">
                    {['table', 'timeline'].map(v => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200
                                ${view === v ? 'bg-primary/20 text-primary border border-primary/30' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {v === 'table' ? '⊞ Table View' : '○ Timeline View'}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-rose-900/20 border border-rose-500/30 text-rose-400 text-sm px-4 py-3 rounded-xl mb-4">
                    ⚠ {error}
                </div>
            )}

            {view === 'table' ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-surface text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 rounded-tl-lg">Timestamp</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Hash (SHA-256)</th>
                                <th className="px-4 py-3 rounded-tr-lg">Signature</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading
                                ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                                : transactions.length === 0
                                ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3 text-gray-500">
                                                <Table className="w-10 h-10 opacity-20" />
                                                <p className="text-sm italic">No transactions yet. Start by adding your first entry.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )
                                : transactions.map((tx) => (
                                    <tr key={tx.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors duration-150">
                                        <td className="px-4 py-3 whitespace-nowrap text-gray-400">{new Date(tx.timestamp).toLocaleString()}</td>
                                        <td className={`px-4 py-3 font-semibold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {tx.type}
                                        </td>
                                        <td className="px-4 py-3">{tx.category}</td>
                                        <td className="px-4 py-3 font-mono">${parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500 truncate max-w-[200px]" title={tx.hash}>
                                            {tx.hash}
                                        </td>
                                        <td className="px-4 py-3">
                                            {tx.walletAddress ? (
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                                                        <ShieldCheck size={11} /> Verified
                                                    </span>
                                                    <span className="font-mono text-[10px] text-gray-500">
                                                        {tx.walletAddress.slice(0,6)}...{tx.walletAddress.slice(-4)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-600 text-xs">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="pt-2">
                    {loading
                        ? <div className="space-y-4">{[...Array(4)].map((_, i) => (
                            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                        ))}</div>
                        : <TimelineView transactions={transactions} />
                    }
                </div>
            )}
        </div>
    );
}
