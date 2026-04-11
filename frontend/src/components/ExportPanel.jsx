import { Download, FileText, FileJson } from 'lucide-react';
import api from '../services/api';

export default function ExportPanel() {

    const downloadLedgerJson = async () => {
        try {
            const res = await api.get('/ledger');
            const json = JSON.stringify(res.data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `veriledger-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('Failed to export ledger data.');
        }
    };

    const downloadAuditReport = async () => {
        try {
            const res = await api.get('/audit');
            const audit = res.data;
            const lines = [
                `VeriLedger — Audit Report`,
                `Generated: ${new Date().toLocaleString()}`,
                ``,
                `Status: ${audit.intact ? '✔ PASSED' : '❌ FAILED'}`,
                `Chronological Order: ${audit.chronological ? '✔ VALID' : '❌ BROKEN'}`,
                `Hash Chain Integrity: ${audit.intact ? '✔ VALID' : '❌ BROKEN'}`,
                ``,
                `Summary: ${audit.errorMessage}`,
                audit.compromisedTransactionId ? `Compromised TX: ${audit.compromisedTransactionId}` : '',
            ].filter(Boolean).join('\n');
            const blob = new Blob([lines], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `veriledger-audit-${new Date().toISOString().split('T')[0]}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('Failed to export audit report.');
        }
    };

    return (
        <div className="glass-panel p-6">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Download className="text-primary w-5 h-5" /> Export Data
            </h2>
            <p className="text-gray-500 text-sm mb-6">Download verified ledger data and audit reports.</p>
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={downloadLedgerJson}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-sm font-semibold transition-all hover:scale-105 active:scale-95 duration-200"
                >
                    <FileJson size={16} /> Download Ledger JSON
                </button>
                <button
                    onClick={downloadAuditReport}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 text-sm font-semibold transition-all hover:scale-105 active:scale-95 duration-200"
                >
                    <FileText size={16} /> Download Audit Report
                </button>
            </div>
        </div>
    );
}
