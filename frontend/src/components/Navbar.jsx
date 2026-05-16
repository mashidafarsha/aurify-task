import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Activity, LogOut } from 'lucide-react';

const Navbar = ({ userRole }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Client Directory', path: '/clients', adminOnly: true },
    { name: 'Trade Ledger', path: '/trades' }
  ].filter(link => !link.adminOnly || userRole === 'Admin');

  return (
    <nav className="relative z-20 w-full px-8 py-5 border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-xl flex justify-between items-center">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold-DEFAULT to-gold-light flex items-center justify-center shadow-lg shadow-gold-DEFAULT/20">
            <Activity className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-medium tracking-tight">Aurify Desk</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => 
                `relative text-sm font-medium transition-all duration-300 ${
                  isActive ? 'text-gold-DEFAULT' : 'text-[#a1a1aa] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-[26px] left-0 right-0 h-0.5 bg-gold-DEFAULT shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-5">
        {userRole === 'Admin' && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold-DEFAULT/10 border border-gold-DEFAULT/20 shadow-[0_0_15px_rgba(212,175,55,0.05)]">
            <Shield className="w-4 h-4 text-gold-DEFAULT" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold-DEFAULT">Admin Mode</span>
          </div>
        )}
        
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 transition-all text-sm font-medium text-[#a1a1aa] hover:text-white group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
