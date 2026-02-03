import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { MapPin, Clock, Circle } from 'lucide-react';
import './Home.css';

const Home = () => {
    const { user, updateStatus } = useAuth();
    const [myStatus, setMyStatus] = useState('available');
    const [location, setLocation] = useState('');
    const [time, setTime] = useState('');
    const [squad, setSquad] = useState([]);

    // Initialize local state from user profile
    useEffect(() => {
        if (user) {
            setMyStatus(user.status || 'available');
            setLocation(user.location || '');
            setTime(user.time_note || '');
        }
    }, [user]);

    // Fetch Squad & Subscribe to Changes
    useEffect(() => {
        const q = query(collection(db, 'profiles'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const profiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSquad(profiles);
        });

        return () => unsubscribe();
    }, []);

    const handleStatusChange = (status) => {
        setMyStatus(status);
        updateStatus(status, location, time);
    };

    const handleInputBlur = () => {
        updateStatus(myStatus, location, time);
    };

    return (
        <div className="page-container home-page">
            <header className="page-header">
                <h1>Live Status</h1>
                <p className="subtitle">Where's the squad at?</p>
            </header>

            {/* My Status Section */}
            <section className="my-status-card glass-panel">
                <h2>Set Your Status</h2>

                <div className="status-selector">
                    <button
                        className={`status-btn available ${myStatus === 'available' ? 'active' : ''}`}
                        onClick={() => handleStatusChange('available')}
                    >
                        <span className="dot"></span> Available
                    </button>
                    <button
                        className={`status-btn busy ${myStatus === 'busy' ? 'active' : ''}`}
                        onClick={() => handleStatusChange('busy')}
                    >
                        <span className="dot"></span> Busy
                    </button>
                    <button
                        className={`status-btn offline ${myStatus === 'offline' ? 'active' : ''}`}
                        onClick={() => handleStatusChange('offline')}
                    >
                        <span className="dot"></span> Ofaaaa
                    </button>
                </div>

                <div className="status-inputs">
                    <div className="input-group">
                        <MapPin size={20} className="input-icon" />
                        <input
                            type="text"
                            placeholder="Where are you?"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            onBlur={handleInputBlur}
                            disabled={myStatus === 'offline'}
                        />
                    </div>
                    <div className="input-group">
                        <Clock size={20} className="input-icon" />
                        <input
                            type="text"
                            placeholder="Looking to hang out at..."
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            onBlur={handleInputBlur}
                            disabled={myStatus === 'offline'}
                        />
                    </div>
                </div>
            </section>

            {/* Friends Grid */}
            <section className="squad-grid">
                {squad.length === 0 ? (
                    <div className="empty-state">
                        <p>Welcome! No one is here yet. Be the first!</p>
                    </div>
                ) : (
                    squad.filter(p => p.id !== user?.id).map((friend) => (
                        <div key={friend.id} className={`friend-card glass-panel status-${friend.status || 'offline'}`}>
                            <div className="card-header">
                                <div className="avatar">{friend.username?.[0] || '?'}</div>
                                <div className="friend-info">
                                    <h3>{friend.username || 'Unknown'}</h3>
                                    <span className="status-badge">
                                        <Circle size={8} fill="currentColor" /> {friend.status === 'offline' ? 'Ofaaaa' : friend.status}
                                    </span>
                                </div>
                            </div>

                            {friend.status !== 'offline' && (
                                <div className="card-details">
                                    <div className="detail-row">
                                        <MapPin size={16} />
                                        <span>{friend.location || 'Unknown location'}</span>
                                    </div>
                                    {friend.time_note && (
                                        <div className="detail-row highlight">
                                            <Clock size={16} />
                                            <span>Looking to hang @ {friend.time_note}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </section>
        </div>
    );
};

export default Home;
