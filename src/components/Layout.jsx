import { Outlet, NavLink } from 'react-router-dom';
import {
    Home,
    Map,
    CalendarDays,
    MessageCircle,
    Phone,
    Image,
    Film
} from 'lucide-react';
import './Layout.css';

const Layout = () => {
    const navItems = [
        { path: '/', icon: Home, label: 'Status' },
        { path: '/map', icon: Map, label: 'Map' },
        { path: '/events', icon: CalendarDays, label: 'Events' },
        { path: '/lounge', icon: MessageCircle, label: 'Lounge' },
        { path: '/call', icon: Phone, label: 'Call' },
        { path: '/gallery', icon: Image, label: 'Gallery' },
        { path: '/reels', icon: Film, label: 'Reels' },
    ];

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="logo-area">
                    <div className="logo-dot"></div>
                </div>
                <nav className="nav-menu">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? 'active' : ''}`
                            }
                            title={item.label}
                        >
                            <item.icon size={26} />
                            <span className="tooltip">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
