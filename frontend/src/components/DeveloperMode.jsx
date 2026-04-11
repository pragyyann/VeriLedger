import { useState } from 'react';
import { Code2, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';

export default function DeveloperMode() {
    const [isEnabled, setIsEnabled] = useState(() => localStorage.getItem('veriledger_devmode') === 'true');
    const [devData, setDevData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const toggle = async () => {
        const next = !isEnabled;
        setIsEnabled(next);
        localStorage.setItem('veriledger_devmode', String(next));
        if (next) {
            setLoading(true);
            try {
                const [txRes, auditRes, chainRes] = await Promise.all([
                    api.get('/ledger'),
                    api.get('/audit'),
                    api.get('/blockchain/verify'),
                ]);
                setDevData({ transactions: txRes.data, audit: auditRes.data, blockchain: chainRes.data });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className={`glass-panel p-5 border-2 transition-all duration-300 ${isEnabled ? 'border-amber-500/40 bg-amber-950/10' : 'border-white/5'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isEnabled ? 'bg-amber-500/20' : 'bg-white/5'}`}>
                        <Code2 className={`w-5 h-5 ${isEnabled ? 'text-amber-400' : 'text-gray-500'}`} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Developer Mode</h3>
                        <p className="text-xs text-gray-500">Expose raw hashes, JSON, and internals</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isEnabled && devData && (
                        <button onClick={() => setIsOpen(p => !p)} className="text-amber-400 text-xs flex items-center gap-1 hover:opacity-70 transition">
                            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {isOpen ? 'Collapse' : 'Expand'}
                        </button>
                    )}
                    <button
                        onClick={toggle}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isEnabled ? 'bg-amber-500' : 'bg-gray-700'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>

            {isEnabled && isOpen && (
                <div className="mt-5 space-y-4">
                    {loading ? (
                        <div className="text-amber-400 text-xs font-mono animate-pulse">Loading raw system data...</div>
                    ) : devData ? (
                        <>
                            <DevSection title="Local Ledger Hash" value={devData.blockchain?.localHash} />
                            <DevSection title="Blockchain Stored Hash (Sepolia)" value={devData.blockchain?.blockchainHash} />
                            <DevSection title="Last Transaction JSON" value={JSON.stringify(devData.transactions?.[devData.transactions.length - 1], null, 2)} isCode />
                            <DevSection title="Audit Result JSON" value={JSON.stringify(devData.audit, null, 2)} isCode />
                        </>
                    ) : null}
                </div>
            )}
        </div>
    );
}

function DevSection({ title, value, isCode }) {
    return (
        <div>
            <p className="text-xs text-amber-400/70 uppercase tracking-widest mb-1 font-semibold">{title}</p>
            <pre className="bg-black/60 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-300 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                {value || '—'}
            </pre>
        </div>
    );
}
