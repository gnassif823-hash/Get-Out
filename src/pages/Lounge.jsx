import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { Send, Smile, Paperclip } from 'lucide-react';
import './Lounge.css';

const Lounge = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const q = query(
            collection(db, 'messages'),
            orderBy('created_at', 'asc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Handle serverTimestamp which might be null initially
                created_at: doc.data().created_at?.toDate() || new Date()
            }));
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || !user) return;

        const text = inputText;
        setInputText('');

        try {
            await addDoc(collection(db, 'messages'), {
                user_id: user.id || user.uid,
                sender_name: user.username || 'Anonymous', // Fallback
                content: text,
                created_at: serverTimestamp()
            });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="page-container lounge-page">
            <div className="chat-container glass-panel">
                <header className="chat-header">
                    <h1>The Lounge</h1>
                    <span className="online-count">Global Chat</span>
                </header>

                <div className="messages-area">
                    {messages.length === 0 ? (
                        <div className="welcome-msg">
                            <p>Welcome to The Lounge! Start the conversation.</p>
                        </div>
                    ) : (
                        messages.map(msg => {
                            const isMe = msg.user_id === (user?.id || user?.uid);
                            const senderName = msg.sender_name || 'Unknown';
                            const time = msg.created_at ? msg.created_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                            return (
                                <div key={msg.id} className={`message-row ${isMe ? 'me' : 'other'}`}>
                                    {!isMe && <div className="message-avatar">{senderName[0]}</div>}
                                    <div className="message-bubble">
                                        {!isMe && <span className="sender-name">{senderName}</span>}
                                        <p>{msg.content}</p>
                                        <span className="timestamp">{time}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-area">
                    <button className="attach-btn"><Paperclip size={20} /></button>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button className="emoji-btn"><Smile size={20} /></button>
                    <button className="send-btn" onClick={handleSend}>
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Lounge;
