import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [name, setName] = useState('');
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoggingIn(true);
        const { success, error } = await login(name.trim());
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

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Enter your name..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" disabled={isLoggingIn}>
                            <ArrowRight size={24} />
                        </button>
                    </div>
                    {error && <p className="error-msg">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default Login;
