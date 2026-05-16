import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, DollarSign, Scale, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const TradeLedger = () => {
  const [clients, setClients] = useState([]);
  const [trades, setTrades] = useState([]);
  const [userRole, setUserRole] = useState('Trader');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Trade Form State
  const [formData, setFormData] = useState({
    client: '',
    tradeType: 'Buy',
    metal: 'Gold',
    weightInGrams: '',
    pricePerGram: '400'
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const payloadBase64 = token.split('.')[1];
        if (payloadBase64) {
          const decodedPayload = JSON.parse(atob(payloadBase64));
          if (decodedPayload.role) {
            setUserRole(decodedPayload.role);
          }
        }

        // Fetching clients from dedicated dropdown endpoint (Admin + Trader)
        const [clientsRes, tradesRes] = await Promise.all([
          axios.get('http://localhost:5001/api/trades/active-clients', { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          axios.get('http://localhost:5001/api/trades', { 
            headers: { Authorization: `Bearer ${token}` } 
          })
        ]);
        
        setClients(clientsRes.data);
        setTrades(tradesRes.data);
        
        // Auto-select the first client if available
        if (clientsRes.data.length > 0) {
          setFormData(prev => ({ ...prev, client: clientsRes.data[0]._id }));
        }
      } catch (err) {
        console.error("Critical error fetching trader-scoped data:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [navigate]);

  const handleCreateTrade = async (e) => {
    e.preventDefault();
    if (!formData.client) return alert('Please select a client first.');

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('http://localhost:5001/api/trades', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update state instantly with populated data
      setTrades([response.data, ...trades]);
      setFormData({
        ...formData,
        weightInGrams: '',
        pricePerGram: '400'
      });
    } catch (err) {
      console.error('Error recording trade:', err);
      alert('Failed to record trade. Please check your inputs.');
    }
  };

  const calculatePreview = () => {
    const w = parseFloat(formData.weightInGrams) || 0;
    const p = parseFloat(formData.pricePerGram) || 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(w * p);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] font-sans text-white relative overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gold-DEFAULT/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#2a2a2d]/30 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

      <Navbar userRole={userRole} />

      <main className="flex-1 relative z-10 w-full max-w-[1400px] mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Trade Ledger</h1>
          <p className="text-[#a1a1aa] font-light">Securely record and monitor your bullion trading operations.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Side A: Trade Ticket Entry */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#121214]/60 backdrop-blur-3xl border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gold-DEFAULT/20" />
              
              <h2 className="text-xl font-medium tracking-tight mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gold-DEFAULT" />
                Trade Ticket
              </h2>

              <form onSubmit={handleCreateTrade} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#71717a] uppercase tracking-wider">Client Selection</label>
                  <div className="relative">
                    <select 
                      required 
                      value={formData.client} 
                      onChange={e => setFormData({...formData, client: e.target.value})} 
                      className="w-full px-4 py-3 bg-[#1a1a1c] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold-DEFAULT transition-all appearance-none text-white/90"
                    >
                      {loading ? (
                        <option value="" disabled>Fetching your clients...</option>
                      ) : clients.length === 0 ? (
                        <option value="" disabled>No clients assigned to you yet</option>
                      ) : (
                        <>
                          <option value="" disabled>Select a client</option>
                          {clients.map(c => (
                            <option key={c._id} value={c._id}>{c.fullName}</option>
                          ))}
                        </>
                      )}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                       <svg className="w-4 h-4 text-[#52525b]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  {clients.length === 0 && !loading && (
                    <p className="text-[10px] text-rose-400/80 mt-1 pl-1 italic">Please create a client in the Directory first.</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#71717a] uppercase tracking-wider">Order Type</label>
                    <select 
                      value={formData.tradeType} 
                      onChange={e => setFormData({...formData, tradeType: e.target.value})} 
                      className="w-full px-4 py-3 bg-[#1a1a1c] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold-DEFAULT transition-colors appearance-none text-white/90"
                    >
                      <option value="Buy">Buy</option>
                      <option value="Sell">Sell</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#71717a] uppercase tracking-wider">Metal Type</label>
                    <select 
                      value={formData.metal} 
                      onChange={e => setFormData({...formData, metal: e.target.value})} 
                      className="w-full px-4 py-3 bg-[#1a1a1c] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold-DEFAULT transition-colors appearance-none text-white/90"
                    >
                      <option value="Gold">Gold</option>
                      <option value="Silver">Silver</option>
                      <option value="Platinum">Platinum</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#71717a] uppercase tracking-wider flex items-center gap-1"><Scale className="w-3 h-3"/> Weight (g)</label>
                    <input 
                      type="number" 
                      step="any"
                      required 
                      value={formData.weightInGrams} 
                      onChange={e => setFormData({...formData, weightInGrams: e.target.value})} 
                      className="w-full px-4 py-3 bg-[#1a1a1c] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold-DEFAULT transition-colors text-white placeholder-[#52525b]" 
                      placeholder="0.00" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#71717a] uppercase tracking-wider flex items-center gap-1"><DollarSign className="w-3 h-3"/> Price/g</label>
                    <input 
                      type="number" 
                      step="any"
                      required 
                      value={formData.pricePerGram} 
                      onChange={e => setFormData({...formData, pricePerGram: e.target.value})} 
                      className="w-full px-4 py-3 bg-[#1a1a1c] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold-DEFAULT transition-colors text-white placeholder-[#52525b]" 
                      placeholder="0.00" 
                    />
                  </div>
                </div>

                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-end shadow-inner mt-2">
                  <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest mb-1">Live Valuation</span>
                  <span className="text-3xl font-semibold text-white tracking-tight">{calculatePreview()}</span>
                </div>

                <button 
                  type="submit" 
                  disabled={clients.length === 0 || loading}
                  className={`w-full py-4 px-4 rounded-xl font-semibold transition-all text-sm mt-4 shadow-[0_0_25px_rgba(255,255,255,0.05)] 
                    ${(clients.length === 0 || loading) ? 'bg-[#1a1a1c] text-[#52525b] cursor-not-allowed opacity-50' : 'bg-white text-black hover:bg-gray-100 hover:scale-[1.01]'}`}
                >
                  {loading ? 'Fetching Desk Data...' : clients.length === 0 ? 'No Clients Available' : 'Execute Trade'}
                </button>
              </form>
            </div>
          </div>

          {/* Side B: Transactions Ledger */}
          <div className="lg:col-span-8">
            <div className="bg-[#121214]/60 backdrop-blur-3xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl h-full flex flex-col">
              <div className="p-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                <h2 className="text-xl font-medium tracking-tight">System Ledger</h2>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">Live Ledger</span>
                </div>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01]">
                      <th className="px-6 py-4 text-[10px] font-bold text-[#71717a] uppercase tracking-widest">Trade Date</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-[#71717a] uppercase tracking-widest">Client Name</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-[#71717a] uppercase tracking-widest">Type</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-[#71717a] uppercase tracking-widest">Metal</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-[#71717a] uppercase tracking-widest text-right">Total Settlement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                           <div className="flex flex-col items-center gap-3">
                              <div className="w-8 h-8 border-2 border-gold-DEFAULT/30 border-t-gold-DEFAULT rounded-full animate-spin" />
                              <span className="text-xs text-[#52525b]">Syncing with exchange ledger...</span>
                           </div>
                        </td>
                      </tr>
                    ) : trades.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center text-[#52525b]">
                            <Activity className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-sm">No transaction records found in your vault.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      trades.map((trade) => (
                        <motion.tr 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={trade._id} 
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="px-6 py-4 text-sm text-[#a1a1aa] font-light">
                            {formatDate(trade.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-white/90 block group-hover:text-gold-DEFAULT transition-colors">{trade.client?.fullName || 'Unknown Client'}</span>
                            {userRole === 'Admin' && <span className="text-[10px] text-[#52525b] uppercase tracking-tighter">TRADER ID: {trade.trader?.name || 'SYSTEM'}</span>}
                          </td>
                          <td className="px-6 py-4">
                            {trade.tradeType === 'Buy' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                                <TrendingUp className="w-3.5 h-3.5"/> BUY
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-xs font-semibold text-rose-400 border border-rose-500/20">
                                <TrendingDown className="w-3.5 h-3.5"/> SELL
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#a1a1aa]">
                            <span className="block font-medium text-white/70">{trade.metal}</span>
                            <span className="text-[10px] text-[#71717a] font-mono tracking-tighter">{trade.weightInGrams}g @ ${trade.pricePerGram}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-semibold text-white tracking-tight tabular-nums">
                              {formatCurrency(trade.totalValue)}
                            </span>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default TradeLedger;
