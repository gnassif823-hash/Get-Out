import React from 'react';

const Dashboard = () => {
    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-secondary">See who's around and what's happening.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder for Friend Cards */}
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">Active Friends</h3>
                    <p className="text-muted">No one is online right now.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
