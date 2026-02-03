import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight } from 'lucide-react';
import './Login.css';

const Login = () => {
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async () => {
        setIsLoggingIn(true);
        const { success, error } = await login();
        if (!success) {
            setError('Failed to login. Check console.');
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card glass-panel">
                <div className="login-header">
                    <h1>Get Out</h1>
                    <p>Join the squad.</p>
                </div>

                <div className="login-actions">
                    <button
                        className="login-btn"
                        onClick={handleLogin}
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? 'Entering...' : 'Enter as George'} <ArrowRight size={24} />
                    </button>
                    {error && <p className="error-msg">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default Login;
