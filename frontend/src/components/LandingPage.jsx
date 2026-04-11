import { Web3HeroAnimated } from './ui/animated-web3-landing-page';
import { Database, ShieldCheck, BarChart3, Link2, Lock, Search, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const features = [
    { name: 'Immutable Ledger', description: 'Records are cryptographically chained and append-only, absolutely guaranteeing data permanence.', icon: Database },
    { name: 'Self-Auditing Engine', description: 'Internal algorithms continuously mathematically verify the validity of every transaction.', icon: ShieldCheck },
    { name: 'Financial Analytics', description: 'Real-time visualizations and historical accounting mapping directly from the secure ledger.', icon: BarChart3 },
    { name: 'Blockchain Verification', description: 'Ledger hashes are permanently anchored to the Ethereum Sepolia Testnet for zero-trust external verification.', icon: Link2 },
  ];

  const whyItems = [
    { icon: Lock, title: 'Prevent Financial Fraud', description: 'Every transaction is cryptographically sealed. One-bit change? Permanently detected and flagged — instantly.' },
    { icon: Search, title: 'Ensure Data Integrity', description: 'SHA-256 hash chains mean you can mathematically prove your ledger has never been tampered with.' },
    { icon: Zap, title: 'Enable Transparent Auditing', description: 'Anyone with a blockchain explorer can independently verify your financial record without trusting you.' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* 1. HERO SECTION */}
      <Web3HeroAnimated />

      {/* 2. TAGLINE STRIP */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-y border-white/5 py-5 text-center">
        <p className="text-white font-bold text-lg md:text-2xl tracking-tight">
          Don&rsquo;t just track your finances.{' '}
          <span className="text-secondary">Prove them.</span>
        </p>
      </div>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="py-24 relative z-10 px-6 max-w-7xl mx-auto w-full border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">Enterprise-Grade Security</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">VeriLedger combines standard accounting architecture with bulletproof cryptographic trust.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="flex flex-col items-center text-center p-8 rounded-2xl bg-[#0d1117] border border-[#1e2a3a] hover:border-primary/25 transition-colors duration-300 cursor-default group"
            >
              {/* Icon circle */}
              <div className="w-14 h-14 rounded-full bg-[#0f1f2e] border border-[#1e3a52] flex items-center justify-center mb-6 group-hover:border-primary/40 transition-colors duration-300">
                <f.icon className="w-6 h-6 text-primary/80" strokeWidth={1.75} />
              </div>
              <h3 className="text-white font-bold text-base mb-3 tracking-tight">{f.name}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. WHY VERILEDGER SECTION */}
      <section className="py-24 relative z-10 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">Why VeriLedger?</h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">The ledger built for a world where trust must be proven, not assumed.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {whyItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="flex flex-col gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-secondary/30 hover:-translate-y-1 hover:bg-white/8 transition-all duration-300 cursor-default"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.15)]">
                <item.icon className="text-secondary w-6 h-6" />
              </div>
              <h3 className="text-white font-bold text-lg">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="py-24 relative z-10 px-6 max-w-5xl mx-auto w-full">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center text-white mb-16">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {[
              "Transactions are recorded immutably into the system.",
              "A cryptographic Hash chain ensures historical integrity.",
              "The autonomous Audit Engine mathematically verifies correctness.",
              "The absolute Ledger Hash is anchored to the Ethereum blockchain."
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 items-start"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold font-mono border border-secondary/30">
                  {i + 1}
                </div>
                <p className="text-gray-300 text-lg">{step}</p>
              </motion.div>
            ))}
          </div>
          <div className="glass-panel p-8 bg-gradient-to-br from-surface to-black border-white/10 flex items-center justify-center rounded-3xl">
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 rounded-full bg-secondary/20 animate-ping opacity-50" />
                <ShieldCheck className="w-24 h-24 text-secondary relative z-10" />
              </div>
              <p className="text-secondary font-mono tracking-widest text-sm font-bold">VERIFIED FLOW</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BLOCKCHAIN SECTION */}
      <section className="py-24 relative z-10 px-6 max-w-7xl mx-auto w-full bg-white/5 rounded-[3rem] border border-white/5 my-12 backdrop-blur-md text-center">
        <div className="max-w-3xl mx-auto">
          <Link2 className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Zero-Trust Ethereum Anchoring</h2>
          <p className="text-gray-400 text-lg mb-8">
            Every calculation within VeriLedger culminates in a single cryptographic footprint. This ledger hash is periodically stored on the Ethereum Sepolia Testnet.
            Using MetaMask, any third-party auditor can interact with our smart contract for tamper-proof external validation, cryptographically proving your books haven&apos;t been altered.
          </p>
        </div>
      </section>

      {/* 7. CTA SECTION */}
      <section className="py-32 relative z-10 px-6 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15)_0%,transparent_70%)]" />
        <p className="text-secondary font-mono tracking-widest text-sm mb-4 uppercase">Start your verified financial record</p>
        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
          Don&rsquo;t just track.<br />
          <span className="text-secondary">Prove.</span>
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">Every entry provably yours. Every audit mathematically certain. No trust required.</p>
        <Link to="/login" className="inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-lg font-bold text-black shadow-[0_0_40px_rgba(255,255,255,0.3)] transition hover:bg-gray-200 hover:scale-105 active:scale-95 duration-300">
          Login / Connect Wallet
        </Link>
      </section>
    </div>
  );
}
