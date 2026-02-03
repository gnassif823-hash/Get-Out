import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Upload, Download, Heart } from 'lucide-react';
import './Gallery.css';

const Gallery = () => {
    const { user } = useAuth();
    const [photos, setPhotos] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const q = query(
            collection(db, 'gallery_posts'),
            orderBy('created_at', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const posts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                created_at: doc.data().created_at?.toDate() || new Date()
            }));
            setPhotos(posts);
        });

        return () => unsubscribe();
    }, []);

    const handleUpload = async (event) => {
        if (!user || !event.target.files || event.target.files.length === 0) return;

        setUploading(true);
        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
        const storageRef = ref(storage, `gallery/${user.id}/${fileName}`);

        try {
            // 1. Upload to Storage
            const snapshot = await uploadBytes(storageRef, file);

            // 2. Get Public URL
            const publicUrl = await getDownloadURL(snapshot.ref);

            // 3. Insert into Firestore
            await addDoc(collection(db, 'gallery_posts'), {
                user_id: user.id || user.uid,
                uploader_name: user.username || 'Anonymous',
                image_url: publicUrl,
                caption: '',
                created_at: serverTimestamp()
            });

        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed!');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="page-container gallery-page">
            <header className="page-header">
                <h1>The Gallery</h1>
                <div className="upload-wrapper">
                    <label htmlFor="photo-upload" className="upload-btn">
                        <Upload size={20} /> {uploading ? 'Uploading...' : 'Upload Photo'}
                    </label>
                    <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                    />
                </div>
            </header>

            <div className="photo-grid">
                {photos.length === 0 ? (
                    <div className="empty-state"><p>No photos yet. Share something!</p></div>
                ) : (
                    photos.map(photo => (
                        <div key={photo.id} className="photo-card" style={{ backgroundImage: `url(${photo.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                            <div className="photo-overlay">
                                <div className="photo-info">
                                    <span className="photo-user">{photo.uploader_name}</span>
                                    <span className="photo-date">{photo.created_at.toLocaleDateString()}</span>
                                </div>
                                <div className="photo-actions">
                                    <button><Heart size={20} /></button>
                                    <a href={photo.image_url} download target="_blank" rel="noreferrer" className="download-btn">
                                        <Download size={20} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Gallery;
