import { useState } from 'react';
import api from '../services/api';
import { PlusCircle, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { LiquidButton } from './ui/liquid-glass-button';
import { useMetaMask } from '../hooks/useMetaMask';

function buildSignatureMessage(amount, type, category) {
    return `VeriLedger Transaction\nAction: Add\nAmount: ${parseFloat(amount).toString()}\nType: ${type}\nCategory: ${category}`;
}

export default function TransactionForm({ onTransactionAdded }) {
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('INCOME');
    const [category, setCategory] = useState('Salary');
    const [loading, setLoading] = useState(false);
    
    const { walletAddress, shortAddress, signMessage } = useMetaMask();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return;
        
        setLoading(true);
        try {
            let walletAddr = null;
            let signature = null;

            if (walletAddress) {
                try {
                    const signatureMessage = buildSignatureMessage(amount, type, category);
                    signature = await signMessage(signatureMessage);
                    walletAddr = walletAddress;
                } catch (signErr) {
                    setLoading(false);
                    return alert("MetaMask signing was cancelled.");
                }
            }

            await api.post('/transactions', { 
                amount: parseFloat(amount), 
                type, 
                category,
                walletAddress: walletAddr,
                signature
            });
            
            setAmount('');
            if (onTransactionAdded) onTransactionAdded();
        } catch (err) {
            console.error(err);
            alert("Failed to add transaction");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <PlusCircle className="text-primary" /> New Transaction
                </h2>
                {walletAddress ? (
                    <div className="flex items-center gap-2 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                        <ShieldCheck size={14} /> Signed by {shortAddress}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-xs bg-gray-500/10 border border-gray-500/20 text-gray-500 px-3 py-1 rounded-full">
                        <ShieldAlert size={14} /> Unsigned
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-xs text-gray-400 mb-1 tracking-wider uppercase">Amount ($)</label>
                    <input 
                        type="number" 
                        step="0.01" 
                        required 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)}
                        className="w-full bg-surface border border-gray-700 rounded p-2 focus:ring focus:ring-primary outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1 tracking-wider uppercase">Type</label>
                    <select 
                        value={type} 
                        onChange={e => setType(e.target.value)}
                        className="w-full bg-surface border border-gray-700 rounded p-2 focus:ring focus:ring-primary outline-none"
                    >
                        <option value="INCOME">Income</option>
                        <option value="EXPENSE">Expense</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1 tracking-wider uppercase">Category</label>
                    <input 
                        type="text" 
                        required 
                        value={category} 
                        onChange={e => setCategory(e.target.value)}
                        className="w-full bg-surface border border-gray-700 rounded p-2 focus:ring focus:ring-primary outline-none"
                        placeholder="e.g. Salary, Rent"
                    />
                </div>
                <div>
                    <LiquidButton type="submit" disabled={loading} variant="default" size="default" className="w-full text-primary hover:text-white border border-primary/20 bg-primary/10 disabled:opacity-50 rounded-full">
                        {loading ? <Loader2 className="animate-spin min-w-5 min-h-5" /> : (walletAddress ? "Sign & Add" : "Add to Ledger")}
                    </LiquidButton>
                </div>
            </div>
        </form>
    );
}
