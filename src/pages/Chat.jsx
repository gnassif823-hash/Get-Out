import React from 'react';

const Chat = () => {
    return (
        <div className="h-full flex flex-col glass-panel rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/5">
                <h2 className="text-xl font-semibold">Group Chat</h2>
            </div>
            <div className="flex-1 p-4 flex items-center justify-center text-muted">
                <p>Start a conversation...</p>
            </div>
            <div className="p-4 border-t border-white/5">
                <input
                    type="text"
                    placeholder="Type a message..."
                    className="w-full bg-input rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary"
                />
            </div>
        </div>
    );
};

export default Chat;
