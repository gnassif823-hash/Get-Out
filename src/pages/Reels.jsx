import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { Heart, MessageCircle, Share2, Upload } from 'lucide-react';
import './Reels.css';

const Reels = () => {
    const { user } = useAuth();
    const [reels, setReels] = useState([]);
    const [uploading, setUploading] = useState(false);

    const fetchReels = async () => {
        const { data, error } = await supabase
            .from('reels')
            .select('*, profiles(name)')
            .order('created_at', { ascending: false });

        if (data) setReels(data);
    };

    useEffect(() => {
        fetchReels();
        const channel = supabase
            .channel('public:reels')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reels' }, fetchReels)
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleUpload = async (event) => {
        if (!user || !event.target.files || event.target.files.length === 0) return;

        setUploading(true);
        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('reels')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('reels')
                .getPublicUrl(filePath);

            const { error: dbError } = await supabase
                .from('reels')
                .insert([{
                    user_id: user.id,
                    video_url: publicUrl,
                    description: 'Just posted a reel!' // Simple default
                }]);

            if (dbError) throw dbError;

        } catch (error) {
            console.error('Reel upload failed:', error.message);
            alert('Upload failed!');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="page-container reels-page">
            <div className="reels-header-overlay">
                <label htmlFor="reel-upload" className="reel-upload-btn">
                    <Upload size={24} /> {uploading ? '...' : ''}
                </label>
                <input
                    id="reel-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                />
            </div>

            <div className="reels-container">
                {reels.map(reel => (
                    <div key={reel.id} className="reel-card">
                        <div className="reel-video-wrapper">
                            <video
                                src={reel.video_url}
                                className="reel-video"
                                controls
                                loop
                                playsInline
                            />
                        </div>

                        <div className="reel-sidebar">
                            <div className="reel-action">
                                <button><Heart size={28} /></button>
                                <span>--</span>
                            </div>
                            <div className="reel-action">
                                <button><MessageCircle size={28} /></button>
                                <span>--</span>
                            </div>
                            <div className="reel-action">
                                <button><Share2 size={28} /></button>
                            </div>
                            <div className="reel-user-avatar">
                                {reel.profiles?.name[0]}
                            </div>
                        </div>

                        <div className="reel-info">
                            <h3>@{reel.profiles?.name}</h3>
                            <p>{reel.description}</p>
                        </div>
                    </div>
                ))}
                {reels.length === 0 && (
                    <div className="reel-card empty-state">
                        <p>No reels yet. Be the first!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reels;
