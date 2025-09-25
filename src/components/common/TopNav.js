import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import MobileNav from '../mobile/MobileNav';

function TopNav({ user, onLogout }) {
  const location = useLocation();

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        location.pathname === to
          ? 'bg-gray-200 text-gray-900'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );

  return (
    <>
      <MobileNav user={user} onLogout={onLogout} />
      <header className="w-full border-b bg-white/90 backdrop-blur sticky top-0 z-40 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-blue-600 font-semibold tracking-wide">
              Indian Army HQ
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <nav className="flex items-center gap-1">
              <NavLink to="/dashboard">Dashboard</NavLink>
              {user.role === 'Admin' && <NavLink to="/admin">Admin</NavLink>}
              <NavLink to="/logs">Logs</NavLink>
              <NavLink to="/links">Links</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded border">
              {user.role}
            </span>
            <span className="text-sm text-gray-600">
              {user.email}
            </span>
            <button
              onClick={onLogout}
              className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

export default TopNav;