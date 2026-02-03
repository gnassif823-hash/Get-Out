import { Heart, MessageCircle, Share2 } from 'lucide-react';
import './Reels.css';

const Reels = () => {
    const reels = [
        { id: 1, user: 'Mike', desc: 'Skating at the park!', color: '#ef4444' },
        { id: 2, user: 'Sarah', desc: 'Latte Art ☕', color: '#eab308' },
        { id: 3, user: 'George', desc: 'New setup tour', color: '#3b82f6' },
    ];

    return (
        <div className="page-container reels-page">
            <div className="reels-container">
                {reels.map(reel => (
                    <div key={reel.id} className="reel-card" style={{ borderColor: reel.color }}>
                        <div className="reel-video-placeholder" style={{ background: `linear-gradient(to bottom, #1e293b, ${reel.color})` }}>
                            {/* This would be a <video> tag in real implementation */}
                            <h2>{reel.desc}</h2>
                        </div>

                        <div className="reel-sidebar">
                            <div className="reel-action">
                                <button><Heart size={28} /></button>
                                <span>124</span>
                            </div>
                            <div className="reel-action">
                                <button><MessageCircle size={28} /></button>
                                <span>12</span>
                            </div>
                            <div className="reel-action">
                                <button><Share2 size={28} /></button>
                            </div>
                            <div className="reel-user-avatar">
                                {reel.user[0]}
                            </div>
                        </div>

                        <div className="reel-info">
                            <h3>@{reel.user}</h3>
                            <p>{reel.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reels;
