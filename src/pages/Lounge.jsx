import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { Send, Smile, Paperclip } from 'lucide-react';
import './Lounge.css';

const Lounge = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*, profiles(name)')
            .order('created_at', { ascending: true })
            .limit(50);

        if (data) setMessages(data);
    };

    useEffect(() => {
        fetchMessages();

        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                fetchMessages();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || !user) return;

        const text = inputText;
        setInputText('');

        const { error } = await supabase
            .from('messages')
            .insert([
                { user_id: user.id, content: text }
            ]);

        if (error) console.error('Error sending message:', error);
    };

    return (
        <div className="page-container lounge-page">
            <div className="chat-container glass-panel">
                <header className="chat-header">
                    <h1>The Lounge</h1>
                    <span className="online-count">Global Chat</span>
                </header>

                <div className="messages-area">
                    {messages.map(msg => {
                        const isMe = msg.user_id === user?.id;
                        const senderName = msg.profiles?.name || 'Unknown';
                        const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
                    })}
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
