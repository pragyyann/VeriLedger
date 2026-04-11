import { ShieldCheck, CheckCircle2, Lock, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SystemGuarantees() {
    const guarantees = [
        {
            title: "Immutable Transactions",
            description: "Data strictly append-only. Impossible to silently delete records.",
            icon: Lock
        },
        {
            title: "Hash Chain Integrity",
            description: "Every transaction mathematically binds to the preceding one.",
            icon: ShieldCheck
        },
        {
            title: "Deterministic Balance",
            description: "Auditor algorithms replay history from genesis to guarantee balances.",
            icon: CheckCircle2
        },
        {
            title: "Blockchain Anchored",
            description: "Cryptographic footprints stored persistently on Ethereum.",
            icon: Link2
        }
    ];

    return (
        <div className="glass-panel p-6 mb-8 w-full">
            <h2 className="text-xl font-bold mb-6 text-white tracking-wide border-b border-gray-800 pb-2">
                Core System Guarantees
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {guarantees.map((item, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-primary/30 transition-all group flex flex-col gap-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <item.icon className="text-primary w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-200 mb-1 leading-tight">{item.title}</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
