import React from 'react';

const Profile = () => {
    return (
        <div className="max-w-2xl mx-auto glass-card p-8 rounded-xl mt-8">
            <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-input flex items-center justify-center text-2xl font-bold">
                    U
                </div>
                <div>
                    <h2 className="text-2xl font-bold">User Name</h2>
                    <p className="text-secondary">Ready to hang out</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="group">
                    <label className="block text-sm text-secondary mb-1">Display Name</label>
                    <input
                        type="text"
                        defaultValue="User Name"
                        className="w-full bg-input rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div className="group">
                    <label className="block text-sm text-secondary mb-1">Status Message</label>
                    <input
                        type="text"
                        defaultValue="Ready to hang out"
                        className="w-full bg-input rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <button className="btn-primary w-full mt-4">
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default Profile;
