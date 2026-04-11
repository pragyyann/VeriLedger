import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeftRight, TrendingUp, TrendingDown, Loader2, CheckCircle2, Wallet, ShieldCheck, ShieldAlert, Eye } from 'lucide-react';
import api from '../services/api';
import { useMetaMask } from '../hooks/useMetaMask';

const CATEGORIES = {
    INCOME: ['Salary', 'Freelance', 'Investment', 'Q1_Revenue', 'Q2_Revenue', 'Q3_Revenue', 'Q4_Revenue', 'Bonus', 'Dividend', 'Other Income'],
    EXPENSE: ['Rent', 'Grocery', 'Utilities', 'Subscriptions', 'Marketing', 'Travel', 'Equipment', 'Payroll', 'Tax', 'Other Expense'],
};

function buildSignatureMessage(amount, type, category) {
    return `VeriLedger Transaction\nAction: Add\nAmount: ${parseFloat(amount).toString()}\nType: ${type}\nCategory: ${category}`;
}

export default function TransferModal({ isOpen, onClose, onSuccess }) {
    const [type, setType] = useState('INCOME');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [sigStep, setSigStep] = useState(false); // show signature preview
    const [skipSigning, setSkipSigning] = useState(false);

    const { walletAddress, shortAddress, connecting, connect, signMessage, isAvailable } = useMetaMask();

    const reset = () => {
        setAmount('');
        setCategory('');
        setCustomCategory('');
        setError(null);
        setSuccess(false);
        setLoading(false);
        setSigStep(false);
        setSkipSigning(false);
    };

    const handleClose = () => { reset(); onClose(); };

    const finalCategory = category === '__custom__' ? customCategory.trim() : category;
    const signatureMessage = amount && finalCategory ? buildSignatureMessage(amount, type, finalCategory) : '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return setError('Enter a valid amount.');
        if (!finalCategory) return setError('Please select or enter a category.');

        // If wallet connected and not skipping — show preview step first
        if (walletAddress && !skipSigning && !sigStep) {
            setSigStep(true);
            return;
        }

        setError(null);
        setLoading(true);
        try {
            let walletAddr = null;
            let signature = null;

            if (walletAddress && !skipSigning) {
                try {
                    signature = await signMessage(signatureMessage);
                    walletAddr = walletAddress;
                } catch (signErr) {
                    setLoading(false);
                    setSigStep(false);
                    return setError('MetaMask signing was cancelled.');
                }
            }

            await api.post('/transactions', {
                amount: parseFloat(amount),
                type,
                category: finalCategory,
                walletAddress: walletAddr,
                signature,
            });

            setSuccess(true);
            setSigStep(false);
            setTimeout(() => { handleClose(); onSuccess?.(); }, 1300);
        } catch (err) {
            const msg = err.response?.data?.error || 'Transaction failed.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
                    >
                        <div className="w-full max-w-md bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                                        <ArrowLeftRight className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-white font-bold text-lg">New Transaction</h2>
                                        <p className="text-gray-500 text-xs">Record income or expense to your ledger</p>
                                    </div>
                                </div>
                                <button onClick={handleClose} className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            {success ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-4">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                                        <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                                    </motion.div>
                                    <p className="text-white font-bold text-lg">Transaction Recorded</p>
                                    <p className="text-gray-500 text-sm text-center px-8">
                                        {walletAddress && !skipSigning ? '✔ Cryptographically signed & chain updated.' : 'Hash generated & chain updated.'}
                                    </p>
                                </div>
                            ) : sigStep ? (
                                /* Signature preview step */
                                <div className="p-6 space-y-5">
                                    <div className="flex items-center gap-2 text-amber-400 mb-2">
                                        <Eye size={18} />
                                        <span className="font-semibold text-sm">Review before signing</span>
                                    </div>
                                    <div className="bg-black/60 border border-amber-400/20 rounded-xl p-4">
                                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Message to sign</p>
                                        <pre className="text-amber-300 text-xs font-mono whitespace-pre-wrap">{signatureMessage}</pre>
                                    </div>
                                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
                                        <Wallet size={16} className="text-primary shrink-0" />
                                        <div className="text-xs text-gray-300">
                                            Signing with: <span className="text-primary font-mono font-bold">{shortAddress}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">MetaMask will popup. Your signature cryptographically proves YOU authorized this transaction.</p>
                                    {error && <div className="bg-rose-900/20 border border-rose-500/30 text-rose-400 text-sm px-4 py-2.5 rounded-xl">⚠ {error}</div>}
                                    <div className="flex gap-3">
                                        <button onClick={() => setSigStep(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm font-semibold hover:bg-white/10 transition-colors">
                                            Back
                                        </button>
                                        <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 rounded-xl bg-primary/20 border border-primary/40 text-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/30 transition-colors disabled:opacity-60">
                                            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                            {loading ? 'Signing...' : 'Sign & Submit'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                    {/* Wallet status strip */}
                                    <div className={`flex items-center justify-between p-3 rounded-xl border text-xs ${walletAddress ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                                        <div className="flex items-center gap-2">
                                            {walletAddress ? <ShieldCheck size={14} className="text-emerald-400" /> : <ShieldAlert size={14} className="text-gray-500" />}
                                            <span className={walletAddress ? 'text-emerald-400 font-mono' : 'text-gray-500'}>
                                                {walletAddress ? `Signing with: ${shortAddress}` : 'No wallet connected'}
                                            </span>
                                        </div>
                                        {!walletAddress && isAvailable && (
                                            <button type="button" onClick={connect} disabled={connecting}
                                                className="text-primary text-xs font-semibold hover:underline">
                                                {connecting ? 'Connecting...' : 'Connect MetaMask'}
                                            </button>
                                        )}
                                        {walletAddress && (
                                            <label className="flex items-center gap-1.5 text-gray-500 cursor-pointer">
                                                <input type="checkbox" className="accent-gray-600" checked={skipSigning} onChange={e => setSkipSigning(e.target.checked)} />
                                                Skip signing
                                            </label>
                                        )}
                                    </div>

                                    {/* Type Toggle */}
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-widest mb-2 block">Transaction Type</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['INCOME', 'EXPENSE'].map((t) => (
                                                <button type="button" key={t} onClick={() => { setType(t); setCategory(''); }}
                                                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all duration-200
                                                        ${type === t
                                                            ? t === 'INCOME' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                                                            : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}
                                                >
                                                    {t === 'INCOME' ? <TrendingUp size={16} /> : <TrendingDown size={16} />} {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-widest mb-2 block">Amount (USD)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                            <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-primary/50 transition-colors" />
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-widest mb-2 block">Category</label>
                                        <select value={category} onChange={(e) => setCategory(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors">
                                            <option value="" disabled className="bg-gray-900">Select a category...</option>
                                            {CATEGORIES[type].map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                                            <option value="__custom__" className="bg-gray-900">+ Custom category</option>
                                        </select>
                                        {category === '__custom__' && (
                                            <input type="text" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)}
                                                placeholder="Enter custom category name"
                                                className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors" />
                                        )}
                                    </div>

                                    {error && <div className="bg-rose-900/20 border border-rose-500/30 text-rose-400 text-sm px-4 py-2.5 rounded-xl">⚠ {error}</div>}

                                    <button type="submit" disabled={loading}
                                        className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200
                                            ${type === 'INCOME'
                                                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30'
                                                : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30'
                                            } hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60`}
                                    >
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : walletAddress && !skipSigning ? <ShieldCheck size={16} /> : null}
                                        {loading ? 'Processing...' : walletAddress && !skipSigning ? 'Review & Sign' : `Record ${type.charAt(0) + type.slice(1).toLowerCase()}`}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
