import { useState, useCallback } from 'react';

export function useMetaMask() {
    const [walletAddress, setWalletAddress] = useState(() => {
        return localStorage.getItem('veriledger_wallet') || null;
    });
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState(null);

    const isAvailable = typeof window !== 'undefined' && Boolean(window.ethereum);

    const connect = useCallback(async () => {
        if (!isAvailable) {
            setError('MetaMask not detected. Please install it from metamask.io');
            return null;
        }
        setConnecting(true);
        setError(null);
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const address = accounts[0];
            setWalletAddress(address);
            localStorage.setItem('veriledger_wallet', address);
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
        localStorage.removeItem('veriledger_wallet');
    }, []);

    const signMessage = useCallback(async (message) => {
        if (!walletAddress) throw new Error('Wallet not connected');
        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, walletAddress],
        });
        return signature;
    }, [walletAddress]);

    const shortAddress = walletAddress
        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        : null;

    return { walletAddress, shortAddress, connecting, error, isAvailable, connect, disconnect, signMessage };
}
