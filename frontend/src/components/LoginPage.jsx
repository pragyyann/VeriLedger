import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { ShieldCheck, Loader2, UserCircle2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import api from '../services/api';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useUser();
    const [loading, setLoading] = useState(false);
    const [guestLoading, setGuestLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGoogleSuccess = async (tokenResponse) => {
        setLoading(true);
        setError(null);
        try {
            // Exchange Google access token for user info then send to backend
            // @react-oauth/google with useGoogleLogin gives us an access token
            // We need to get user info from Google
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });
            const userInfo = await userInfoRes.json();

            // Send to our backend which will verify and issue JWT
            const backendRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google-access`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sub: userInfo.sub,
                    email: userInfo.email,
                    name: userInfo.name,
                    picture: userInfo.picture,
                })
            });

            if (!backendRes.ok) throw new Error('Backend auth failed');
            const data = await backendRes.json();

            localStorage.setItem('veriledger_token', data.token);
            login({ name: data.name, email: data.email, picture: data.picture });
            navigate('/dashboard');
        } catch (err) {
            setError('Google login failed. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => setError('Google sign-in was cancelled or failed.'),
    });

    const handleGuestLogin = async () => {
        setGuestLoading(true);
        setError(null);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/guest`, { method: 'POST' });
            const data = await res.json();
            localStorage.setItem('veriledger_token', data.token);
            login({ name: data.name, email: data.email, picture: '' });
            navigate('/dashboard');
        } catch (err) {
            setError('Guest login failed. Is the backend running?');
        } finally {
            setGuestLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.08)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="glass-panel p-8 md:p-10 space-y-8">
                    {/* Logo */}
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4 shadow-[0_0_30px_rgba(14,165,233,0.2)]">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">VeriLedger</h1>
                        <p className="text-gray-400 text-sm mt-2">Cryptographically verified financial records</p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/5" />

                    <div className="space-y-4">
                        <p className="text-center text-xs text-gray-500 uppercase tracking-widest">Sign in to your ledger</p>

                        {/* Google Login */}
                        <button
                            onClick={() => googleLogin()}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                            )}
                            {loading ? 'Signing in...' : 'Continue with Google'}
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 border-t border-white/10" />
                            <span className="text-gray-600 text-xs">or</span>
                            <div className="flex-1 border-t border-white/10" />
                        </div>

                        {/* Guest Login */}
                        <button
                            onClick={handleGuestLogin}
                            disabled={guestLoading}
                            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 font-medium py-3 px-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-[1.01] active:scale-95 disabled:opacity-60"
                        >
                            {guestLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCircle2 className="w-4 h-4" />}
                            {guestLoading ? 'Loading...' : 'Continue as Guest'}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-rose-900/20 border border-rose-500/30 text-rose-400 text-sm px-4 py-3 rounded-xl text-center">
                            ⚠ {error}
                        </div>
                    )}

                    <p className="text-center text-xs text-gray-600">
                        Your ledger is cryptographically isolated &amp; private.
                    </p>
                </div>
            </div>
        </div>
    );
}
