import { useEffect, useState } from 'react';
import api from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

const CUTE_COLORS = ['#FF8EAA', '#7CD0FF', '#85E8B6', '#FFD768', '#B89CFF', '#FFA27A'];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
                <p className="text-white font-bold text-sm mb-1 pb-1 border-b border-white/10">{payload[0].name}</p>
                <p className="text-gray-300 font-mono text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }}></span>
                    ${payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export default function AnalyticsCharts() {
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/analytics');
                setAnalytics(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchAnalytics();
    }, []);

    if (!analytics) return (
        <div className="glass-panel p-6 h-96 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="h-4 w-32 bg-white/10 rounded"></div>
                <div className="h-32 w-32 bg-white/10 rounded-full"></div>
                <div className="h-4 w-48 bg-white/10 rounded"></div>
            </div>
        </div>
    );

    const expenseData = Object.entries(analytics.expenseByCategory || {}).map(([name, value]) => ({ name, value }));
    const cashFlowData = analytics.cashFlowTimeline || [];

    return (
        <div className="space-y-6">
            {/* TOP ROW: LINE & DONUT */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Cash Flow Timeline (Line Chart) */}
                <div className="glass-panel p-6 xl:col-span-2">
                    <h3 className="text-sm font-bold text-gray-300 mb-6 flex items-center gap-2 uppercase tracking-widest">
                        <TrendingUp className="text-secondary w-4 h-4" /> Comprehensive Cash Flow
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={cashFlowData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                                <Tooltip contentStyle={{ backgroundColor: '#000000a0', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid #ffffff20' }} />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Line yAxisId="left" type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} activeDot={{ r: 6 }} />
                                <Line yAxisId="left" type="monotone" dataKey="expense" name="Expense" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: '#EF4444' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expenses by Category (Donut) */}
                <div className="glass-panel p-6">
                    <h3 className="text-sm font-bold text-gray-300 mb-6 flex items-center gap-2 uppercase tracking-widest">
                        <PieChartIcon className="text-primary w-4 h-4" /> Category Spending
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={expenseData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={60}
                                    outerRadius={85}
                                    paddingAngle={5}
                                    stroke="none"
                                >
                                    {expenseData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CUTE_COLORS[index % CUTE_COLORS.length]} cornerRadius={8} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36} 
                                    iconType="circle" 
                                    formatter={(value) => <span className="text-gray-400 text-xs ml-1">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* BOTTOM ROW: BAR CHART */}
            <div className="glass-panel p-6">
                <h3 className="text-sm font-bold text-gray-300 mb-6 flex items-center gap-2 uppercase tracking-widest">
                    <BarChart3 className="text-[#F59E0B] w-4 h-4" /> Monthly Income vs Expenses
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cashFlowData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barSize={30}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                            <Tooltip contentStyle={{ backgroundColor: '#000000a0', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid #ffffff20' }} cursor={{fill: '#ffffff10'}} />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                            <Bar dataKey="income" name="Gross Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" name="Gross Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
