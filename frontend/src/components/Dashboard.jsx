import { useEffect, useState } from 'react';
import api from '../services/api';
import { FinancialDashboard } from './ui/financial-dashboard';
import { ArrowLeftRight, Landmark, TrendingUp, SwitchCamera, ShieldCheck, Activity } from 'lucide-react';
import { useUser } from '../context/UserContext';
import TransferModal from './TransferModal';

const LogoIcon = ({ letter, className }) => (
  <div className={`w-9 h-9 flex items-center justify-center rounded-full font-bold text-white text-sm ${className}`}>
    {letter}
  </div>
);

export default function Dashboard({ refreshTrigger, onAnalyticsLoaded, onTransactionAdded }) {
    const [analytics, setAnalytics] = useState(null);
    const [recentTxs, setRecentTxs] = useState([]);
    const { user } = useUser();
    const [transferOpen, setTransferOpen] = useState(false);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/analytics');
                setAnalytics(res.data);
                if (onAnalyticsLoaded) onAnalyticsLoaded(res.data);

                const txRes = await api.get('/ledger');
                const txs = txRes.data.slice(-5).reverse();
                setRecentTxs(txs);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            }
        };
        fetchAnalytics();
    }, [refreshTrigger]);

    if (!analytics) return (
        <div className="space-y-4 p-6 animate-pulse">
            <div className="h-6 w-48 bg-white/10 rounded" />
            <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white/10 rounded-xl" />)}
            </div>
        </div>
    );

    const quickActionsData = [
      { icon: ArrowLeftRight, title: 'Transfer', description: 'New transaction', onClick: () => setTransferOpen(true) },
      { icon: Landmark, title: 'Balance', description: `$${analytics.netBalance?.toFixed(2) || '0.00'}` },
      { icon: TrendingUp, title: 'Income', description: `+$${analytics.totalIncome?.toFixed(2) || '0.00'}` },
      { icon: Activity, title: 'Expense', description: `-$${analytics.totalExpense?.toFixed(2) || '0.00'}` },
    ];

    const recentActivityData = recentTxs.map(tx => ({
      icon: <LogoIcon letter={tx.category.charAt(0).toUpperCase()} className={tx.type === 'INCOME' ? 'bg-secondary' : 'bg-danger'} />,
      title: tx.category,
      time: new Date(tx.timestamp).toLocaleDateString(),
      amount: tx.type === 'INCOME' ? tx.amount : -tx.amount,
    }));

    if (recentActivityData.length === 0) {
      recentActivityData.push({
        icon: <LogoIcon letter="N" className="bg-gray-600" />,
        title: 'No activity yet',
        time: 'Just now',
        amount: 0,
      });
    }

    const financialServicesData = [
      { icon: ShieldCheck, title: 'VeriLedger Immutable Vault', description: 'SHA-256 encrypted storage', isPremium: true },
      { icon: SwitchCamera, title: 'Realtime Blockchain Sync', description: 'Ethereum Sepolia Anchoring', hasAction: true },
    ];

    return (
        <div className="w-full mb-8 relative z-10">
            <TransferModal
                isOpen={transferOpen}
                onClose={() => setTransferOpen(false)}
                onSuccess={() => {
                    setTransferOpen(false);
                    onTransactionAdded?.();
                }}
            />
            {/* Welcome Greeting */}
            {user && (
                <div className="flex items-center gap-3 mb-6">
                    {user.picture ? (
                        <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border-2 border-primary/40" referrerPolicy="no-referrer" />
                    ) : null}
                    <div>
                        <p className="text-gray-400 text-sm">Welcome back,</p>
                        <h2 className="text-white font-bold text-xl tracking-tight">{user.name}</h2>
                    </div>
                </div>
            )}
            <FinancialDashboard
                quickActions={quickActionsData}
                recentActivity={recentActivityData}
                financialServices={financialServicesData}
            />
        </div>
    );
}
