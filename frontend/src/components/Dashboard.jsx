import { useEffect, useState } from 'react';

import api from '../services/api';
import { FinancialDashboard } from './ui/financial-dashboard';
import { useUser } from '../context/UserContext';


export default function Dashboard({ refreshTrigger, onAnalyticsLoaded, onTransactionAdded }) {
    const [analytics, setAnalytics] = useState(null);
    const { user } = useUser();


    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/analytics');
                setAnalytics(res.data);
                if (onAnalyticsLoaded) onAnalyticsLoaded(res.data);
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
                {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-white/10 rounded-2xl" />)}
            </div>
        </div>
    );

    return (
        <div className="w-full relative z-10 flex flex-col h-full mb-0">

            {/* Welcome Greeting */}
            {user && (
                <div className="flex items-center gap-3 mb-4 shrink-0">
                    {user.picture ? (
                        <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border border-gray-700 shadow-sm" referrerPolicy="no-referrer" />
                    ) : null}
                    <div>
                        <p className="text-gray-400 text-xs">Overview</p>
                        <h2 className="text-white font-semibold text-lg tracking-tight hover:text-gray-200 transition-colors cursor-default">{user.name}'s Workspace</h2>
                    </div>
                </div>
            )}

            <FinancialDashboard
                analytics={analytics}
            />
        </div>
    );
}
