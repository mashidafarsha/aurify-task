import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Clock, TrendingUp, TrendingDown, ArrowLeft, Briefcase, ChevronRight } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const ClientProfile = () => {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('Trader');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const payloadBase64 = token.split('.')[1];
        if (payloadBase64) {
          const decodedPayload = JSON.parse(atob(payloadBase64));
          setUserRole(decodedPayload.role);
        }

        const response = await axios.get(`http://localhost:5001/api/clients/${id}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileData(response.data);
      } catch (err) {
        console.error("Error fetching client profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-DEFAULT/30 border-t-gold-DEFAULT rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-[#a1a1aa]">
        Client profile not found.
      </div>
    );
  }

  const { client, trades } = profileData;

  const HoldingCard = ({ label, stats, colorClass }) => {
    // Safety fallback for legacy data or missing objects
    const s = stats || { bought: 0, sold: 0 };
    const balance = (s.bought || 0) - (s.sold || 0);
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#121214]/60 backdrop-blur-3xl border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/5 to-transparent opacity-50" />
        <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest mb-4">{label}</p>
        
        <div className="flex items-end gap-2 mb-6">
          <span className={`text-4xl font-semibold tracking-tight ${colorClass}`}>{balance}</span>
          <span className="text-xs font-medium text-[#52525b] mb-2 uppercase">grams</span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div>
            <p className="text-[9px] font-bold text-[#52525b] uppercase tracking-tighter mb-1 flex items-center gap-1">
               <TrendingUp className="w-2.5 h-2.5 text-emerald-500" /> Total Bought
            </p>
            <p className="text-sm font-medium text-white/90">{s.bought || 0}g</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-[#52525b] uppercase tracking-tighter mb-1 flex items-center gap-1">
               <TrendingDown className="w-2.5 h-2.5 text-rose-500" /> Total Sold
            </p>
            <p className="text-sm font-medium text-white/90">{s.sold || 0}g</p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] font-sans text-white relative overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gold-DEFAULT/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

      <Navbar userRole={userRole} />

      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-8 py-10">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-[#52525b] mb-8 font-medium">
          <Link to="/clients" className="hover:text-white transition-colors">DIRECTORY</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gold-DEFAULT uppercase tracking-widest">CLIENT PROFILE</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Client Identity */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#121214]/60 backdrop-blur-3xl border border-white/5 rounded-[40px] p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <User className="w-32 h-32" />
              </div>

              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-gold-DEFAULT to-gold-light p-1 mb-5 shadow-2xl shadow-gold-DEFAULT/20">
                  <div className="w-full h-full rounded-full bg-[#0a0a0b] flex items-center justify-center text-4xl font-bold text-gold-DEFAULT">
                    {client.fullName.charAt(0)}
                  </div>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">{client.fullName}</h1>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                   {client.kycStatus} Status
                </div>
              </div>

              <div className="space-y-5 border-t border-white/5 pt-8">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-gold-DEFAULT/10 transition-colors"><Phone className="w-4 h-4 text-[#a1a1aa] group-hover:text-gold-DEFAULT transition-colors" /></div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold mb-0.5">Contact Phone</p>
                    <p className="text-sm font-medium text-white/90">{client.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-gold-DEFAULT/10 transition-colors"><Mail className="w-4 h-4 text-[#a1a1aa] group-hover:text-gold-DEFAULT transition-colors" /></div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold mb-0.5">Email Address</p>
                    <p className="text-sm font-medium text-white/90">{client.email}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Manager Details */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#121214]/60 backdrop-blur-3xl border border-white/5 rounded-[40px] p-8 shadow-2xl"
            >
              <h3 className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest mb-6 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Account Balance
              </h3>
              <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 group hover:border-gold-DEFAULT/20 transition-colors">
                 <p className="text-[10px] text-[#52525b] uppercase font-bold mb-2 tracking-tighter">Assigned Trader</p>
                 <p className="text-sm font-semibold text-white mb-1">{client.assignedTrader?.name}</p>
                 <p className="text-xs text-[#71717a]">{client.assignedTrader?.email}</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Metals & History */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Holdings Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <HoldingCard label="Gold Balance" stats={client.metalPreference?.gold} colorClass="text-gold-DEFAULT" />
              <HoldingCard label="Silver Balance" stats={client.metalPreference?.silver} colorClass="text-gray-400" />
              <HoldingCard label="Platinum Balance" stats={client.metalPreference?.platinum} colorClass="text-blue-300" />
            </div>

            {/* Transaction Ledger */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#121214]/60 backdrop-blur-3xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <h2 className="text-xl font-medium tracking-tight flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gold-DEFAULT" />
                  Transaction Ledger
                </h2>
                <div className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest px-4 py-2 rounded-xl bg-[#1a1a1c] border border-white/5">
                  {trades.length} Records Detected
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01]">
                      <th className="px-8 py-5 text-[10px] font-bold text-[#71717a] uppercase tracking-widest">Execution Date</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-[#71717a] uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-[#71717a] uppercase tracking-widest">Asset Details</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-[#71717a] uppercase tracking-widest text-right">Settlement Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {trades.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-8 py-16 text-center text-[#52525b] italic font-light">No transaction history detected for this client.</td>
                      </tr>
                    ) : (
                      trades.map((trade) => (
                        <tr key={trade._id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-5">
                            <span className="text-xs font-medium text-white/90 block mb-1">{formatDate(trade.createdAt)}</span>
                            <span className="text-[9px] text-[#52525b] uppercase font-bold">Via {trade.trader?.name}</span>
                          </td>
                          <td className="px-8 py-5">
                            {trade.tradeType === 'Buy' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                                <TrendingUp className="w-3 h-3" /> BUY
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 text-[10px] font-bold text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]">
                                <TrendingDown className="w-3 h-3" /> SELL
                              </span>
                            )}
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-xs font-semibold text-white/90 block mb-1">{trade.metal}</span>
                            <span className="text-[10px] text-[#71717a] font-medium">{trade.weightInGrams}g @ ${trade.pricePerGram}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span className="text-sm font-semibold text-white tabular-nums tracking-tight">{formatCurrency(trade.totalValue)}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientProfile;
