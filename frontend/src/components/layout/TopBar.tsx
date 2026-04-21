import { useLocation, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, BookOpen, ShieldCheck, Link2, PlusCircle, LogOut, User, Wallet } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useMetaMask } from '../../hooks/useMetaMask';
import { SpotlightNav } from '../ui/spotlight-nav';
import { useState } from 'react';
import TransferModal from '../TransferModal';

// Map pathname → spotlight index
const ROUTE_MAP: Record<string, number> = {
  '/dashboard': 0,
  '/ledger': 1,
  '/audit': 3,
  '/blockchain': 4,
};

const NAV_ROUTES = ['/dashboard', '/ledger', null, '/audit', '/blockchain'];

export default function TopBar({ setRefreshTrigger }: { setRefreshTrigger: (fn: (p: number) => number) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { walletAddress, shortAddress, connecting, connect, isAvailable } = useMetaMask();
  const [transferOpen, setTransferOpen] = useState(false);

  const isPublicRoute = ['/', '/login', '/demo'].includes(location.pathname);
  const activeIndex = ROUTE_MAP[location.pathname] ?? -1;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview',  onClick: () => navigate('/dashboard') },
    { icon: BookOpen,         label: 'Ledger',    onClick: () => navigate('/ledger') },
    { icon: PlusCircle,       label: 'Transfer',  accent: true, onClick: () => setTransferOpen(true) },
    { icon: ShieldCheck,      label: 'Audit',     onClick: () => navigate('/audit') },
    { icon: Link2,            label: 'Anchoring', onClick: () => navigate('/blockchain') },
  ];

  return (
    <>
      <TransferModal
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
        onSuccess={() => { setTransferOpen(false); setRefreshTrigger((p) => p + 1); }}
      />

      <header className="sticky top-0 z-50 px-4 md:px-8 py-3 flex items-center justify-between gap-4 bg-black/70 backdrop-blur-xl border-b border-white/5 mb-0 md:mb-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0">
          <span className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-tight">
            VeriLedger
          </span>
          <span className="hidden lg:block text-gray-600 text-[10px] font-mono uppercase tracking-widest border-l border-gray-700 pl-3">
            Immutable Infrastructure
          </span>
        </Link>

        {/* Centre: Spotlight Nav / Public Nav (Centred absolutely) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          {!isPublicRoute && user ? (
            <SpotlightNav
              items={navItems}
              activeIndex={activeIndex}
              onIndexChange={(i) => {
                const route = NAV_ROUTES[i];
                if (route) navigate(route);
              }}
            />
          ) : (
            /* Public nav links */
            <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <a href="#features" className="text-gray-400 hover:text-white px-4 py-2 text-sm font-medium transition-colors">Features</a>
              <Link to="/login" className="text-gray-400 hover:text-white px-4 py-2 text-sm font-medium transition-colors">Login</Link>
            </nav>
          )}
        </div>

        {/* Right: Wallet + Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* MetaMask status — only on internal pages */}
          {!isPublicRoute && isAvailable && (
            walletAddress ? (
              <div className="hidden sm:flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/25 rounded-full px-3 py-1.5 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-mono">{shortAddress}</span>
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={connecting}
                className="hidden sm:flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <Wallet size={11} />
                {connecting ? 'Connecting…' : 'MetaMask'}
              </button>
            )
          )}

          {user ? (
            <>
              {/* Refresh (only on internal) */}
              {!isPublicRoute && (
                <button
                  onClick={() => setRefreshTrigger((p) => p + 1)}
                  className="hidden sm:block text-xs text-gray-500 hover:text-gray-300 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Refresh
                </button>
              )}
              {/* Avatar pill */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-6 h-6 rounded-full border border-white/20"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-xs text-gray-200 font-medium hidden sm:inline max-w-[100px] truncate">
                  {user.name}
                </span>
              </div>
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-white/70 hover:text-white px-3 transition-colors">
                Log in
              </Link>
              <Link to="/login" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-200 transition-colors">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
