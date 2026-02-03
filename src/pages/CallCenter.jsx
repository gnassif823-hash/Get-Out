import { Video, Mic, PhoneOff, Monitor } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './CallCenter.css';

const CallCenter = () => {
    const { user } = useAuth();

    // In a real app, we'd fetch active calls from Supabase 'calls' table
    // For now, we simply show the user their own view and a Join button
    // No fake GEORGE or SARAH.

    return (
        <div className="page-container call-page">
            <div className="call-stage">
                <div className="video-grid">
                    {/* Self View */}
                    <div className="video-card self">
                        <div className="avatar-placeholder">{user?.name?.[0]}</div>
                        <span className="participant-name">{user?.name} (You)</span>
                    </div>

                    {/* Empty State / Waiting */}
                    <div className="video-card empty">
                        <p>Waiting for others to join...</p>
                    </div>
                </div>

                <div className="call-controls">
                    <button className="control-btn"><Mic size={24} /></button>
                    <button className="control-btn"><Video size={24} /></button>
                    <button className="control-btn end-call"><PhoneOff size={24} /></button>
                    <button className="control-btn"><Monitor size={24} /></button>
                </div>
            </div>
        </div>
    );
};

export default CallCenter;
