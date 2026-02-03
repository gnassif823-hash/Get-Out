import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { Upload, Download, Heart } from 'lucide-react';
import './Gallery.css';

const Gallery = () => {
    const { user } = useAuth();
    const [photos, setPhotos] = useState([]);
    const [uploading, setUploading] = useState(false);

    const fetchPhotos = async () => {
        const { data, error } = await supabase
            .from('gallery_posts')
            .select('*, profiles(name)')
            .order('created_at', { ascending: false });

        if (data) setPhotos(data);
    };

    useEffect(() => {
        fetchPhotos();

        // Subscribe to new posts
        const channel = supabase
            .channel('public:gallery_posts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gallery_posts' }, fetchPhotos)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleUpload = async (event) => {
        if (!user || !event.target.files || event.target.files.length === 0) return;

        setUploading(true);
        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        try {
            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('gallery')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('gallery')
                .getPublicUrl(filePath);

            // 3. Insert into Database
            const { error: dbError } = await supabase
                .from('gallery_posts')
                .insert([{
                    user_id: user.id,
                    image_url: publicUrl,
                    caption: '' // Can add caption input later
                }]);

            if (dbError) throw dbError;

        } catch (error) {
            console.error('Upload failed:', error.message);
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
                {photos.map(photo => (
                    <div key={photo.id} className="photo-card" style={{ backgroundImage: `url(${photo.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        <div className="photo-overlay">
                            <div className="photo-info">
                                <span className="photo-user">{photo.profiles?.name}</span>
                                <span className="photo-date">{new Date(photo.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="photo-actions">
                                <button><Heart size={20} /></button>
                                <a href={photo.image_url} download target="_blank" rel="noreferrer" className="download-btn">
                                    <Download size={20} />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Gallery;
