import { Video, Mic, PhoneOff, Monitor } from 'lucide-react';
import './CallCenter.css';

const CallCenter = () => {
    return (
        <div className="page-container call-page">
            <div className="call-stage">
                <div className="video-grid">
                    {/* Mock Participants */}
                    <div className="video-card">
                        <div className="avatar-placeholder">G</div>
                        <span className="participant-name">George</span>
                        <div className="mic-status"><Mic size={14} /></div>
                    </div>
                    <div className="video-card">
                        <div className="avatar-placeholder">S</div>
                        <span className="participant-name">Sarah</span>
                    </div>
                    <div className="video-card self">
                        <div className="avatar-placeholder">Me</div>
                        <span className="participant-name">Me</span>
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
