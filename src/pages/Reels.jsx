import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Heart, MessageCircle, Share2, Upload } from 'lucide-react';
import './Reels.css';

const Reels = () => {
    const { user } = useAuth();
    const [reels, setReels] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const q = query(
            collection(db, 'reels'),
            orderBy('created_at', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const posts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                created_at: doc.data().created_at?.toDate() || new Date()
            }));
            setReels(posts);
        });

        return () => unsubscribe();
    }, []);

    const handleUpload = async (event) => {
        if (!user || !event.target.files || event.target.files.length === 0) return;

        setUploading(true);
        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
        const storageRef = ref(storage, `reels/${user.id}/${fileName}`);

        try {
            // 1. Upload to Storage
            const snapshot = await uploadBytes(storageRef, file);

            // 2. Get Public URL
            const publicUrl = await getDownloadURL(snapshot.ref);

            // 3. Insert into Firestore
            await addDoc(collection(db, 'reels'), {
                user_id: user.id || user.uid,
                uploader_name: user.username || 'Anonymous',
                video_url: publicUrl,
                description: 'Just posted a reel!',
                created_at: serverTimestamp(),
                likes: 0
            });

        } catch (error) {
            console.error('Reel upload failed:', error);
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
                {reels.length === 0 ? (
                    <div className="reel-card empty-state">
                        <p>No reels yet. Be the first!</p>
                    </div>
                ) : (
                    reels.map(reel => (
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
                                    {reel.uploader_name?.[0] || 'U'}
                                </div>
                            </div>

                            <div className="reel-info">
                                <h3>@{reel.uploader_name || 'unknown'}</h3>
                                <p>{reel.description}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Reels;
