import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage on mount
        const storedUser = localStorage.getItem('get_out_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (name) => {
        try {
            // 1. Check if user exists
            let { data: existingUser, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('name', name)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                throw fetchError;
            }

            let profile;

            if (existingUser) {
                // User exists, log them in
                profile = existingUser;
            } else {
                // User doesn't exist, create new profile
                const { data: newUser, error: createError } = await supabase
                    .from('profiles')
                    .insert([{ name, status: 'available', location: 'Unknown' }])
                    .select()
                    .single();

                if (createError) throw createError;
                profile = newUser;
            }

            // 2. Save to state and local storage
            setUser(profile);
            localStorage.setItem('get_out_user', JSON.stringify(profile));
            return { success: true };

        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('get_out_user');
    };

    const updateStatus = async (status, location, time) => {
        if (!user) return;

        try {
            const updates = {
                status,
                location,
                time_note: time,
                last_updated: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;

            // Update local state optimistically
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            localStorage.setItem('get_out_user', JSON.stringify(updatedUser)); // Keep local storage in sync? Maybe not strictly necessary for status but good for coherence

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
