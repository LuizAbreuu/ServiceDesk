import React from 'react';
import { Link } from 'react-router-dom';

interface NavItem {
    label: string;
    path: string;
}

const Navbar: React.FC = () => {
    const navItems: NavItem[] = [
        { label: 'Home', path: '/' },
        { label: 'Tickets', path: '/tickets' },
        { label: 'Settings', path: '/settings' },
    ];

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    Service Desk
                </Link>
                <ul className="navbar-menu">
                    {navItems.map((item) => (
                        <li key={item.path} className="navbar-item">
                            <Link to={item.path} className="navbar-link">
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;