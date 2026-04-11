import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('veriledger_user');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('veriledger_user', JSON.stringify(userData));
        localStorage.setItem('veriledger_auth', 'true');
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('veriledger_user');
        localStorage.removeItem('veriledger_auth');
        localStorage.removeItem('veriledger_token');
    };

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
