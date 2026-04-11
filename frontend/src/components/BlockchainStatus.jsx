import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link2, RefreshCw } from 'lucide-react';
import { LiquidButton } from './ui/liquid-glass-button';

export default function BlockchainStatus() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const checkBlockchain = async () => {
        setLoading(true);
        try {
            const res = await api.get('/blockchain/verify');
            setStatus(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const syncBlockchain = async () => {
        setSyncing(true);
        try {
            await api.post('/blockchain/sync');
            // Removed automatic checkBlockchain call to give user manual control
        } catch(err) {
            console.error(err);
        } finally {
            setSyncing(false);
        }
    }

    // Removed useEffect auto-load to ensure verification only happens on user click

    return (
        <div className="glass-panel p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Link2 className="text-primary" /> Ethereum Testnet Anchoring
                </h2>
                <div className="flex gap-2">
                    <LiquidButton onClick={syncBlockchain} disabled={syncing} variant="outline" className="text-secondary border-secondary/50 bg-secondary/10 flex items-center gap-2">
                        <RefreshCw size={14} className={syncing ? "animate-spin" : ""} /> Sync
                    </LiquidButton>
                    <LiquidButton onClick={checkBlockchain} disabled={loading} variant="default" className="text-white border border-primary/30 bg-primary/20">
                        Verify
                    </LiquidButton>
                </div>
            </div>

            {status ? (
                <div className="flex-grow flex flex-col justify-center space-y-5 text-sm mt-4">
                    <div className="flex justify-center items-center py-3 bg-black/40 rounded-xl border border-white/5">
                        {status.verified ? (
                            <div className="flex items-center gap-2 text-secondary font-black tracking-wide text-lg">
                                <span>✅</span> VERIFIED ON CHAIN
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-danger font-black tracking-wide text-lg">
                                <span>❌</span> HASH MISMATCH DETECTED
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-4">
                        <div className={`p-4 rounded-xl border transition-colors ${status.verified ? 'bg-secondary/5 border-secondary/20' : 'bg-danger/10 border-danger/30'}`}>
                            <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest font-semibold flex items-center justify-between">
                                Local Ledger Hash
                            </p>
                            <p className={`font-mono text-sm break-all ${status.verified ? 'text-secondary font-bold' : 'text-danger font-bold opacity-80'}`}>
                                {status.localHash}
                            </p>
                        </div>

                        <div className="p-4 rounded-xl border bg-primary/5 border-primary/20">
                            <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest font-semibold flex items-center justify-between">
                                Blockchain Stored Hash
                                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px]">SEPOLIA</span>
                            </p>
                            <p className="font-mono text-sm break-all text-primary font-bold">
                                {status.blockchainHash}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-gray-500 text-sm gap-4 py-12">
                    <div className="p-4 rounded-full bg-white/5 border border-white/10">
                        <Link2 className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="italic">Manual verification required to sync with Sepolia Testnet.</p>
                </div>
            )}
        </div>
    );
}
