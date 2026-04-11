import { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, ShieldAlert, Activity, AlertTriangle, RefreshCcw, ChevronDown, ChevronUp } from 'lucide-react';

export default function AuditStatus() {
    const [audit, setAudit] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastChecked, setLastChecked] = useState(null);
    const [logsOpen, setLogsOpen] = useState(false);
    const [error, setError] = useState(null);

    const runAudit = async () => {
        setError(null);
        try {
            const res = await api.get('/audit');
            setAudit(res.data);
            setLastChecked(new Date().toLocaleTimeString());
        } catch (err) {
            setError('Unable to fetch audit data. Check if the backend is running.');
        }
    };

    useEffect(() => {
        runAudit();
        const intervalId = setInterval(runAudit, 3000);
        return () => clearInterval(intervalId);
    }, []);

    const simulateTampering = async () => {
        setLoading(true);
        await api.post('/tamper');
        await runAudit();
        setLoading(false);
    };

    const repairSystem = async () => {
        setLoading(true);
        await api.post('/repair');
        await runAudit();
        setLoading(false);
    };

    const isCorrupted = audit && !audit.intact;

    // Build audit log steps
    const auditSteps = audit ? [
        { label: 'Hash Chain Integrity', pass: audit.intact, detail: audit.intact ? 'Every hash validated against predecessor — chain verified.' : `Hash mismatch detected. ${audit.compromisedTransactionId ? `TX: ${audit.compromisedTransactionId.substring(0,16)}...` : ''}` },
        { label: 'Timestamp Ordering', pass: audit.chronological, detail: audit.chronological ? 'All transactions recorded in valid chronological order.' : 'Chronological ordering violation detected.' },
        { label: 'Balance Consistency', pass: audit.intact, detail: audit.intact ? 'Balance derivable from full replay — no data gaps.' : 'Balance may be inconsistent with corrupted chain.' },
    ] : [];

    return (
        <div className={`glass-panel p-6 border-2 transition-all duration-500 ease-in-out ${isCorrupted ? 'border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.3)] bg-red-950/10' : 'border-white/5'}`}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Activity className={isCorrupted ? 'text-red-500 animate-pulse' : 'text-primary'} />
                        Autonomous Audit Engine
                    </h2>
                    {lastChecked && (
                        <p className="text-xs text-gray-500 mt-1 font-mono tracking-widest uppercase">
                            Last checked: {lastChecked}
                        </p>
                    )}
                </div>
                <div className="flex gap-2">
                    {isCorrupted ? (
                        <button onClick={repairSystem} disabled={loading}
                            className="bg-secondary/20 hover:bg-secondary/40 text-secondary border border-secondary/50 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition hover:scale-105 active:scale-95">
                            <RefreshCcw size={16} /> Restore State
                        </button>
                    ) : (
                        <button onClick={simulateTampering} disabled={loading}
                            className="bg-red-500/10 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition hover:scale-105 active:scale-95">
                            <AlertTriangle size={16} /> Simulate Tampering
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-rose-900/20 border border-rose-500/30 text-rose-400 text-sm px-4 py-3 rounded-xl mb-4">
                    ⚠ {error}
                </div>
            )}

            {!audit && !error && (
                <div className="space-y-3 animate-pulse">
                    <div className="h-24 bg-white/5 rounded-xl" />
                    <div className="h-12 bg-white/5 rounded-xl" />
                </div>
            )}

            {audit && (
                <>
                    <div className={`p-5 rounded-xl border transition-colors duration-500 ${audit.intact ? 'bg-secondary/5 border-secondary/20' : 'bg-danger/20 border-danger shadow-inner'}`}>
                        <div className="flex items-start gap-4">
                            {audit.intact ? (
                                <div className="bg-secondary/20 p-2 rounded-full relative shrink-0">
                                    <div className="absolute inset-0 bg-secondary/30 rounded-full animate-ping opacity-50" />
                                    <ShieldCheck className="text-secondary relative z-10" size={30} />
                                </div>
                            ) : (
                                <ShieldAlert className="text-danger shrink-0 animate-bounce" size={30} />
                            )}
                            <div className="flex-1">
                                <h3 className={`font-black tracking-tight text-xl mb-1 ${audit.intact ? 'text-secondary' : 'text-danger'}`}>
                                    {audit.intact ? '🟢 LEDGER SECURE & VERIFIED' : '🔴 INTEGRITY FAILURE DETECTED'}
                                </h3>
                                <p className="text-gray-300 text-sm">{audit.errorMessage}</p>
                                {!audit.intact && audit.compromisedTransactionId && (
                                    <div className="font-mono text-xs bg-black p-3 mt-3 rounded-lg border border-red-500/30">
                                        <span className="text-red-400">CORRUPT_SIG_FOUND:</span> {audit.compromisedTransactionId}
                                    </div>
                                )}
                                <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-gray-400 bg-black/40 p-3 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span>Chronological Order</span>
                                        <span className={`font-bold ${audit.chronological ? 'text-secondary' : 'text-danger'}`}>{audit.chronological ? 'VERIFIED' : 'FAILED'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Hash Chain Linkage</span>
                                        <span className={`font-bold ${audit.intact ? 'text-secondary' : 'text-danger'}`}>{audit.intact ? 'VERIFIED' : 'BROKEN'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Collapsible Audit Trace */}
                    <div className="mt-4 border border-white/5 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setLogsOpen(p => !p)}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all"
                        >
                            <span className="font-semibold uppercase tracking-widest text-xs">Audit Trace Log</span>
                            {logsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        {logsOpen && (
                            <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
                                {auditSteps.map((step, i) => (
                                    <div key={i} className={`flex items-start gap-3 p-3 rounded-lg text-sm ${step.pass ? 'bg-secondary/5' : 'bg-danger/10'}`}>
                                        <span className={`mt-0.5 shrink-0 ${step.pass ? 'text-secondary' : 'text-danger'}`}>{step.pass ? '✔' : '❌'}</span>
                                        <div>
                                            <p className={`font-semibold ${step.pass ? 'text-secondary' : 'text-danger'}`}>{step.label}</p>
                                            <p className="text-gray-400 text-xs mt-0.5">{step.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
