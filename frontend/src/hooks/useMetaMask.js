import { useState, useCallback, useEffect } from 'react';

export function useMetaMask() {
    const [walletAddress, setWalletAddress] = useState(null);
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState(null);

    const isAvailable = typeof window !== 'undefined' && Boolean(window.ethereum);

    // Provide a way to silently check if already connected, 
    // but we won't do it automatically here since the user disabled auto-connect.
    // Instead, the user must explicitly click Connect.

    const connect = useCallback(async () => {
        if (!isAvailable) {
            setError('MetaMask not detected. Please install it from metamask.io');
            return null;
        }
        setConnecting(true);
        setError(null);
        try {
            // Force MetaMask to ask for permission every time
            await window.ethereum.request({
                method: 'wallet_requestPermissions',
                params: [{ eth_accounts: {} }]
            });
            
            // After permission is granted, get the accounts
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const address = accounts[0];
            setWalletAddress(address);
            return address;
        } catch (err) {
            setError(err.code === 4001 ? 'Connection rejected by user.' : 'Failed to connect MetaMask.');
            return null;
        } finally {
            setConnecting(false);
        }
    }, [isAvailable]);

    const disconnect = useCallback(() => {
        setWalletAddress(null);
    }, []);

    const signMessage = useCallback(async (message) => {
        if (!walletAddress) throw new Error('Wallet not connected');
        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, walletAddress],
        });
        return signature;
    }, [walletAddress]);

    // Cleanup listener on account change
    useEffect(() => {
        if (isAvailable) {
            const handleAccountsChanged = (accounts) => {
                if (accounts.length > 0) {
                    // Update state if user changes account inside MetaMask
                    setWalletAddress(accounts[0]);
                } else {
                    // User locked or disconnected their wallet
                    setWalletAddress(null);
                }
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);
            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, [isAvailable]);

    const shortAddress = walletAddress
        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        : null;

    return { walletAddress, shortAddress, connecting, error, isAvailable, connect, disconnect, signMessage };
}
