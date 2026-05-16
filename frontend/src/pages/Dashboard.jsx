import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Briefcase, TrendingUp, DollarSign, Users, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('Trader');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Extract role from JWT payload if present
        const payloadBase64 = token.split('.')[1];
        if (payloadBase64) {
          const decodedPayload = JSON.parse(atob(payloadBase64));
          if (decodedPayload.role) {
            setUserRole(decodedPayload.role);
          }
        }

        const response = await API.get('/dashboard/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setSummary(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { ease: [0.16, 1, 0.3, 1], duration: 0.6 } }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
  };

  const MetricCard = ({ title, value, icon: Icon, colorClass }) => (
    <motion.div variants={itemVariants} className="relative group p-6 rounded-3xl bg-[#121214]/60 backdrop-blur-2xl border border-white/5 shadow-2xl overflow-hidden hover:border-white/10 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-[#1a1a1c] border border-white/10 shadow-inner ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="relative z-10">
        <h3 className="text-[#a1a1aa] font-medium text-sm tracking-wide mb-1 uppercase">{title}</h3>
        <p className="text-3xl font-semibold text-white tracking-tight">{value}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0b] font-sans text-white relative overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gold-DEFAULT/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#2a2a2d]/30 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

      {/* Navbar */}
      <Navbar userRole={userRole} />

      {/* Main Content */}
      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-8 py-12 flex flex-col gap-8">
        
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#121214]/60 backdrop-blur-3xl border border-white/5 rounded-[32px] p-8 shadow-2xl"
        >
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Welcome back.</h1>
            <p className="text-[#a1a1aa] font-light">Here's your real-time trading overview for today.</p>
          </div>
          
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#1a1a1c] border border-white/10 shadow-inner">
            {userRole === 'Admin' ? (
              <Shield className="w-5 h-5 text-gold-DEFAULT" />
            ) : (
              <Briefcase className="w-5 h-5 text-blue-400" />
            )}
            <span className="font-medium tracking-wide text-sm text-white/90">
              {userRole === 'Admin' ? 'Admin Control Center' : 'Trader Desk'}
            </span>
          </div>
        </motion.div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Metrics Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[148px] rounded-3xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <MetricCard 
              title="Today's Trades" 
              value={summary?.todayTradeCount || 0} 
              icon={TrendingUp} 
              colorClass="text-emerald-400"
            />
            <MetricCard 
              title="Today's Volume" 
              value={formatCurrency(summary?.todayTotalValue)} 
              icon={DollarSign} 
              colorClass="text-gold-DEFAULT"
            />
            <MetricCard 
              title="Top VIP Client" 
              value={summary?.topClientName || 'None Yet'} 
              icon={Award} 
              colorClass="text-purple-400"
            />
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
