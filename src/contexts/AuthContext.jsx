import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in, fetch profile
                try {
                    const userDocRef = doc(db, 'profiles', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        setUser({ id: firebaseUser.uid, ...userDoc.data() });
                    } else {
                        // Profile might not exist if created just now? 
                        // Or if anonymous auth persists but profile was deleted?
                        // For now, just set basic info
                        setUser({ id: firebaseUser.uid });
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async () => {
        try {
            const result = await signInAnonymously(auth);
            const user = result.user;

            // Link anonymous UID to 'George'
            const userDocRef = doc(db, 'profiles', user.uid);
            const userData = {
                username: 'George',
                status: 'Available',
                location: 'Unknown',
                last_updated: serverTimestamp(),
                is_online: true
            };

            await setDoc(userDocRef, userData, { merge: true });

            // State update will trigger via onAuthStateChanged, but we can optimistically set it to be faster?
            // onAuthStateChanged is fast, let's rely on it or return success.
            return { success: true };

        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error };
        }
    };

    const logout = async () => {
        try {
            if (user) {
                // Optional: set offline
                const userDocRef = doc(db, 'profiles', user.id);
                await updateDoc(userDocRef, { is_online: false });
            }
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const updateStatus = async (status, location, time) => {
        if (!user) return;

        try {
            const userDocRef = doc(db, 'profiles', user.id);
            const updates = {
                status,
                location,
                time_note: time || '',
                last_updated: serverTimestamp(),
            };

            await updateDoc(userDocRef, updates);

            // Optimistic update
            setUser(prev => ({ ...prev, ...updates }));

        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const value = {
        user,
        login,
        logout,
        updateStatus,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
