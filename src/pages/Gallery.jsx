import { Upload, Download, Heart } from 'lucide-react';
import './Gallery.css';

const Gallery = () => {
    const photos = [
        { id: 1, url: 'linear-gradient(45deg, #3b82f6, #8b5cf6)', user: 'George', date: '2 days ago' },
        { id: 2, url: 'linear-gradient(45deg, #10b981, #3b82f6)', user: 'Sarah', date: '5 days ago' },
        { id: 3, url: 'linear-gradient(45deg, #f59e0b, #ef4444)', user: 'Mike', date: '1 week ago' },
        { id: 4, url: 'linear-gradient(45deg, #ec4899, #8b5cf6)', user: 'Jessica', date: '1 week ago' },
        { id: 5, url: 'linear-gradient(45deg, #6366f1, #10b981)', user: 'George', date: '2 weeks ago' },
    ];

    return (
        <div className="page-container gallery-page">
            <header className="page-header">
                <h1>The Gallery</h1>
                <button className="upload-btn">
                    <Upload size={20} /> Upload Photo
                </button>
            </header>

            <div className="photo-grid">
                {photos.map(photo => (
                    <div key={photo.id} className="photo-card" style={{ background: photo.url }}>
                        <div className="photo-overlay">
                            <div className="photo-info">
                                <span className="photo-user">{photo.user}</span>
                                <span className="photo-date">{photo.date}</span>
                            </div>
                            <div className="photo-actions">
                                <button><Heart size={20} /></button>
                                <button><Download size={20} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Gallery;
