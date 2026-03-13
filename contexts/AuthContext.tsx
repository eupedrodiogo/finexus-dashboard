
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut,
    setPersistence,
    browserLocalPersistence,
    User
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { logDebug } from '../utils/debugLogger';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        logDebug("AuthContext Mounted. Checking redirect result...");

        // Check for redirect result on mount
        getRedirectResult(auth).then((result) => {
            logDebug(`getRedirectResult completed. Result: ${result ? 'FOUND' : 'NULL'}`);
            if (result) {
                logDebug(`User logged in via redirect: ${result.user.email}`);
                setUser(result.user);
                // alert(`Login Redirecionado Sucesso: ${result.user.displayName}`); 
            }
            setLoading(false);
        }).catch((error) => {
            logDebug(`Redirect Login Error: ${error.message}`);
            alert(`Erro no retorno do login: ${error.message}`);
            setLoading(false);
        });

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            logDebug(`AuthStateChanged: ${currentUser ? currentUser.email : 'No User'}`);
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async () => {
        try {
            logDebug("Login function called. Setting persistence...");
            await setPersistence(auth, browserLocalPersistence);

            // Check if mobile
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            logDebug(`Device check: isMobile=${isMobile}`);

            if (isMobile) {
                // Use popup for mobile too, to test persistence/state loss issue
                logDebug("TESTING: Attempting signInWithPopup on MOBILE...");
                await signInWithPopup(auth, googleProvider);
            } else {
                // Use popup for desktop
                logDebug("Attempting signInWithPopup...");
                await signInWithPopup(auth, googleProvider);
            }
        } catch (error: any) {

            // Helpful alerts for common errors
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
                const shouldRedirect = window.confirm("O login via popup falhou ou foi cancelado. Deseja tentar redirecionar a página para entrar?");
                if (shouldRedirect) {
                    try {
                        await signInWithRedirect(auth, googleProvider);
                        return;
                    } catch (redirectError: any) {
                        alert(`Erro ao redirecionar para login: ${redirectError.message}`);
                        throw redirectError;
                    }
                }
            } else if (error.code === 'auth/operation-not-allowed') {
                alert('Login com Google não está habilitado no Firebase Console.');
                throw new Error('Login com Google não está habilitado no Firebase Console.');
            } else if (error.code === 'auth/unauthorized-domain') {
                alert('Este domínio não está autorizado no Firebase Console. Verifique as configurações de autenticação.');
                throw new Error('Este domínio não está autorizado no Firebase Console.');
            } else {
                alert(`Erro ao fazer login: ${error.message}`);
            }
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
