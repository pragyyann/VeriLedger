import { useState } from 'react';
import api from '../services/api';
import { PlusCircle } from 'lucide-react';
import { LiquidButton } from './ui/liquid-glass-button';

export default function TransactionForm({ onTransactionAdded }) {
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('INCOME');
    const [category, setCategory] = useState('Salary');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/transactions', { amount, type, category });
            setAmount('');
            if (onTransactionAdded) onTransactionAdded();
        } catch (err) {
            console.error(err);
            alert("Failed to add transaction");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="glass-panel p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <PlusCircle className="text-primary" /> New Transaction
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-xs text-gray-400 mb-1 tracking-wider uppercase">Amount ($)</label>
                    <input 
                        type="number" 
                        step="0.01" 
                        required 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)}
                        className="w-full bg-surface border border-gray-700 rounded p-2 focus:ring focus:ring-primary outline-none"
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
                    <LiquidButton type="submit" variant="default" size="default" className="w-full text-primary hover:text-white border border-primary/20 bg-primary/10">
                        Add to Ledger
                    </LiquidButton>
                </div>
            </div>
        </form>
    );
}
