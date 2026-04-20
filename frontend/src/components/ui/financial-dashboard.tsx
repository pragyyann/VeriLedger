import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface FinancialDashboardProps {
  analytics: any; // Using any for simplicity or typing if available
}

const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f43f5e'];

const mockAssetData = [
  { name: 'Cash', value: 40 },
  { name: 'Investments', value: 35 },
  { name: 'Savings', value: 15 },
  { name: 'Expenses', value: 10 },
];

const mockTrendData = [
  { value: 100 }, { value: 120 }, { value: 110 }, { value: 140 }, { value: 130 }, { value: 160 }, { value: 155 }, { value: 180 }
];

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  analytics,
}) => {
  const [showAIInsight, setShowAIInsight] = React.useState(true);
  const [showSubscriptions, setShowSubscriptions] = React.useState(false);
  const [activeTimeframe, setActiveTimeframe] = React.useState('Month');
  
  const multipliers: Record<string, number> = {
    'Today': 0.03,
    'Week': 0.25,
    'Month': 1,
    'Year': 12,
  };
  const mult = multipliers[activeTimeframe] || 1;
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  const netBalance = analytics?.netBalance || 0;
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full flex-1 flex flex-col gap-6 font-sans relative z-10"
    >


      {/* Row 1: Hero Metrics & Audit Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0 z-20">
        {/* Balance Hero */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-[#111827]/80 backdrop-blur-md border border-gray-800 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between shadow-2xl hover:border-gray-700 transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-gray-400 text-sm font-medium mb-1 tracking-wide">Total Net Worth</p>
              <h1 className="text-5xl font-bold text-white tracking-tight flex items-baseline gap-1">
                <span className="text-gray-500 text-3xl font-medium">$</span>
                {netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>
              <div className="mt-4 flex items-center gap-3">
                <span className="bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                  +12.4% this month
                </span>
                <span className="text-gray-600 text-xs font-medium">vs last month</span>
              </div>
            </div>
            {/* Sparkline */}
            <div className="h-[72px] w-full mt-6 -mx-2 relative z-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockTrendData}>
                        <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={false} isAnimationActive={true} />
                    </LineChart>
                </ResponsiveContainer>
                {/* Fade out bottom of chart */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#111827]/80 to-transparent pointer-events-none" />
            </div>
        </motion.div>

        {/* Audit Status */}
        <motion.div variants={itemVariants} className="bg-[#111827]/80 backdrop-blur-md border border-green-500/20 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_30px_-5px_rgba(16,185,129,0.1)] flex flex-col justify-between hover:border-green-500/30 transition-colors">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mb-4 border border-green-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    <ShieldCheck className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-white font-semibold flex items-center gap-2">
                    Ledger Verified
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                </h3>
                <p className="text-gray-400 text-xs mt-1">Immutable record secured.</p>
            </div>
            
            <div className="mt-6 space-y-3 relative z-10">
                <div className="flex justify-between items-center text-sm border-b border-gray-800/50 pb-2">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Last audit</span>
                    <span className="text-gray-300 font-mono text-xs">10 sec ago</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-gray-800/50 pb-2">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Hash Integrity</span>
                    <span className="text-green-400 font-mono text-xs bg-green-500/10 px-1.5 py-0.5 rounded">100%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Blockchain Anchor</span>
                    <span className="text-blue-400 font-mono text-xs">Synced</span>
                </div>
            </div>
        </motion.div>
      </div>



      {/* Row 3 & 4 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Analytics Array */}
        <motion.div variants={itemVariants} className="lg:col-span-2 grid grid-cols-2 gap-4 auto-rows-max">
            {/* Quick Overview Tabs */}
            <div className="col-span-2 flex items-center justify-between mb-1">
                <h3 className="text-white font-medium text-sm">Financial Insights</h3>
                <div className="flex bg-[#111827]/80 border border-gray-800 p-1 rounded-lg backdrop-blur-sm shadow-sm">
                    {['Today', 'Week', 'Month', 'Year'].map((tab) => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTimeframe(tab)}
                            className={`text-xs px-3 py-1 rounded-md transition-colors font-medium ${activeTimeframe === tab ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
            
            {[
                { title: 'Spending', value: `$${((analytics?.totalExpense || 0) * mult).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, progress: 65, color: 'bg-rose-500', bg: 'bg-rose-500/20' },
                { title: 'Savings Rate', value: '38.4%', progress: 38, color: 'bg-blue-500', bg: 'bg-blue-500/20' },
                { title: 'Cash Flow', value: `${mult >= 1 ? '+' : ''}$${(12400 * mult).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, progress: 85, color: 'bg-emerald-500', bg: 'bg-emerald-500/20' },
                { title: 'Budget Health', value: '92/100', progress: 92, color: 'bg-indigo-500', bg: 'bg-indigo-500/20' }
            ].map((stat, i) => (
                <div key={i} className="bg-[#111827]/60 backdrop-blur-md border border-gray-800/80 hover:border-gray-700 rounded-2xl p-5 flex flex-col justify-center transition-colors group relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/[0.02] rounded-full -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform pointer-events-none" />
                    <p className="text-gray-500 text-xs mb-1 font-medium tracking-wide uppercase">{stat.title}</p>
                    <p className="text-gray-100 font-semibold text-2xl mb-4 tracking-tight">{stat.value}</p>
                    <div className={`w-full ${stat.bg} rounded-full h-1 mb-1 overflow-hidden`}>
                        <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${stat.progress}%` }} 
                            transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                            className={`h-1 flex rounded-full ${stat.color} shadow-[0_0_10px_currentColor]`} 
                        />
                    </div>
                </div>
            ))}
        </motion.div>

        {/* Wealth Visualization & AI Insights */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <div className="bg-[#111827]/60 backdrop-blur-md border border-gray-800/80 rounded-2xl p-5 flex-1 flex flex-col relative overflow-hidden group hover:border-gray-700 transition-colors">
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-gray-200 text-sm font-medium mb-1 z-10 flex justify-between items-center">
                    Asset Allocation
                    <span className="text-gray-500 text-xs cursor-pointer hover:text-white transition-colors">Details &rarr;</span>
                </h3>
                <div className="flex-1 flex items-center justify-center relative z-10 mt-2 mb-4">
                    <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                            <Pie
                                data={mockAssetData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                            >
                                {mockAssetData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity" />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
                        <span className="text-white font-bold text-xl tracking-tight">100%</span>
                        <span className="text-gray-500 text-[10px] uppercase font-medium">Mapped</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-auto z-10">
                    {mockAssetData.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] font-medium tracking-wide">
                            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i] }} />
                            <span className="text-gray-400 flex-1">{item.name}</span>
                            <span className="text-gray-200">{item.value}%</span>
                        </div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {showAIInsight && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0, scale: 0.9 }}
                        className="bg-gradient-to-br from-[#1e1b4b]/80 to-[#1e1b4b]/40 backdrop-blur-md border border-indigo-500/20 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_20px_-5px_rgba(99,102,241,0.15)] group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors pointer-events-none" />
                        <div className="flex items-center mb-3 gap-2 relative z-10">
                            <div className="bg-indigo-500/20 p-1.5 rounded-lg border border-indigo-500/30 text-indigo-400">
                                <span className="text-sm block leading-none">✨</span>
                            </div>
                            <h3 className="text-indigo-200 font-semibold text-sm tracking-wide">AI Insight</h3>
                        </div>
                        
                        {!showSubscriptions ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <p className="text-gray-300 text-sm leading-relaxed relative z-10">
                                    Your spending dropped <span className="text-emerald-400 font-semibold inline-flex px-1 bg-emerald-500/10 rounded tracking-tight">14%</span> this month. 
                                    You can save <span className="text-white font-semibold tracking-tight">$8,200</span> by consolidating active inactive subscriptions.
                                </p>
                                <div className="mt-4 flex gap-2 relative z-10">
                                    <button onClick={() => setShowSubscriptions(true)} className="text-[11px] bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-md font-medium transition-colors shadow-sm">Review Subscriptions</button>
                                    <button onClick={() => setShowAIInsight(false)} className="text-[11px] bg-[#111827] text-gray-400 hover:text-white px-3 py-1.5 rounded-md font-medium transition-colors border border-gray-700">Dismiss</button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 mt-2">
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between items-center bg-gray-900/50 p-2.5 rounded border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer">
                                        <span className="text-xs text-gray-300 font-medium">Netflix Ultra</span>
                                        <span className="text-xs text-rose-400 font-mono">$22.99</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-900/50 p-2.5 rounded border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer">
                                        <span className="text-xs text-gray-300 font-medium">Adobe Creative Cloud</span>
                                        <span className="text-xs text-rose-400 font-mono">$54.99</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowAIInsight(false)} className="text-[11px] flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-md font-medium transition-colors">Cancel Selected</button>
                                    <button onClick={() => setShowSubscriptions(false)} className="text-[11px] flex-1 bg-[#111827] text-gray-400 hover:text-white px-3 py-1.5 rounded-md font-medium transition-colors border border-gray-700">Back</button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};
