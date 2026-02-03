import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Map, MessageCircle, User } from 'lucide-react';

const MainLayout = () => {
    return (
        <div className="layout-container" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
            {/* Sidebar Navigation */}
            <nav className="glass-panel" style={{
                width: '80px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '24px 0',
                gap: '32px',
                position: 'fixed',
                height: '100vh',
                zIndex: 50
            }}>
                <div className="logo" style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, var(--primary), #4338ca)',
                    borderRadius: '12px',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 'bold',
                    fontSize: '24px',
                    color: 'white',
                    marginBottom: '20px'
                }}>
                    G
                </div>

                <NavItem to="/" icon={<Home size={24} />} label="Home" />
                <NavItem to="/map" icon={<Map size={24} />} label="Map" />
                <NavItem to="/chat" icon={<MessageCircle size={24} />} label="Chat" />
                <NavItem to="/profile" icon={<User size={24} />} label="Profile" />
            </nav>

            {/* Main Content Area */}
            <main style={{
                marginLeft: '80px',
                flex: 1,
                padding: '32px',
                maxWidth: '1600px',
                width: 'calc(100% - 80px)'
            }}>
                <Outlet />
            </main>
        </div>
    );
};

const NavItem = ({ to, icon, label }) => (
    <NavLink
        to={to}
        style={({ isActive }) => ({
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'grid',
            placeItems: 'center',
            color: isActive ? 'white' : 'var(--text-muted)',
            background: isActive ? 'var(--primary)' : 'transparent',
            transition: 'var(--transition-fast)',
            position: 'relative'
        })}
        title={label}
    >
        {icon}
    </NavLink>
);

export default MainLayout;
