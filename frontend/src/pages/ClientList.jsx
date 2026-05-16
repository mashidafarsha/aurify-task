import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, User, Phone, Mail, Trash2, Edit2, X, AlertTriangle, Activity } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState('Trader');
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingClientId, setEditingClientId] = useState(null);
  const [clientToDelete, setClientToDelete] = useState(null);

  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    kycStatus: 'Pending'
  });

  useEffect(() => {
    const fetchClients = async () => {
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

        const response = await axios.get('http://localhost:5001/api/clients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setClients(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [navigate]);

  const openAddModal = () => {
    setEditingClientId(null);
    setFormData({ fullName: '', phone: '', email: '', kycStatus: 'Pending' });
    setShowModal(true);
  };

  const openEditModal = (client) => {
    setEditingClientId(client._id);
    setFormData({
      fullName: client.fullName,
      phone: client.phone,
      email: client.email,
      kycStatus: client.kycStatus
    });
    setShowModal(true);
  };

  const handleSubmitClient = async (e) => {
    e.preventDefault();

    // Email Regex Validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      return alert("Please enter a valid email address (e.g., name@domain.com)");
    }

    const token = localStorage.getItem('token');
    try {
      if (editingClientId) {
        const response = await axios.put(`http://localhost:5001/api/clients/${editingClientId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients(clients.map(c => c._id === editingClientId ? response.data : c));
      } else {
        const response = await axios.post('http://localhost:5001/api/clients', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients([response.data, ...clients]);
      }
      setShowModal(false);
      setEditingClientId(null);
      setFormData({ fullName: '', phone: '', email: '', kycStatus: 'Pending' });
    } catch (err) {
      console.error('Error saving client', err);
    }
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5001/api/clients/${clientToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(clients.filter(c => c._id !== clientToDelete));
      setClientToDelete(null);
    } catch (err) {
      console.error('Error deleting client', err);
      alert('Failed to delete client. Are you an Admin?');
      setClientToDelete(null);
    }
  };

  const filteredClients = clients.filter(c => 
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  const getKycBadge = (status) => {
    switch(status) {
      case 'Verified':
        return <span className="px-3 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">Verified</span>;
      case 'Pending':
        return <span className="px-3 py-1 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">Pending</span>;
      case 'Rejected':
        return <span className="px-3 py-1 text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] font-sans text-white relative overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gold-DEFAULT/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#2a2a2d]/30 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

      <Navbar userRole={userRole} />

      {/* Main Content */}
      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-8 py-12 flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Client Directory</h1>
            <p className="text-[#a1a1aa] font-light">Manage and monitor your trading clients.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#52525b] group-focus-within:text-gold-DEFAULT transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="w-64 pl-10 pr-4 py-2.5 bg-[#121214]/60 backdrop-blur-xl border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-DEFAULT/50 focus:border-gold-DEFAULT/50 transition-all text-white placeholder-[#52525b]"
              />
            </div>
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-gray-100 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] text-sm"
            >
              <Plus className="w-4 h-4" />
              New Client
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full bg-[#121214]/60 backdrop-blur-3xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-xs font-medium text-[#71717a] uppercase tracking-wider">Client Name</th>
                  <th className="px-6 py-4 text-xs font-medium text-[#71717a] uppercase tracking-wider">Contact Info</th>
                  <th className="px-6 py-4 text-xs font-medium text-[#71717a] uppercase tracking-wider text-right">KYC Status</th>
                  <th className="px-6 py-4 text-xs font-medium text-[#71717a] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-[#52525b]">Loading clients...</td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-[#52525b]">
                        <User className="w-12 h-12 mb-4 opacity-50" />
                        <p>No clients found. Add a new one to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={client._id} 
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <Link to={`/clients/${client._id}`} className="flex items-center gap-3 group/name">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2a2a2d] to-[#1a1a1c] flex items-center justify-center border border-white/5 font-medium text-sm group-hover/name:border-gold-DEFAULT/50 transition-colors">
                            {client.fullName.charAt(0)}
                          </div>
                          <span className="font-medium text-white/90 group-hover/name:text-gold-DEFAULT transition-colors">{client.fullName}</span>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-[#a1a1aa] flex items-center gap-1.5"><Phone className="w-3 h-3" /> {client.phone}</span>
                          <span className="text-xs text-[#71717a] flex items-center gap-1.5"><Mail className="w-3 h-3" /> {client.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {getKycBadge(client.kycStatus)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/clients/${client._id}`} className="p-2 rounded-lg hover:bg-white/10 text-[#a1a1aa] hover:text-white transition-colors" title="View Profile">
                            <Activity className="w-4 h-4" />
                          </Link>
                          <button onClick={() => openEditModal(client)} className="p-2 rounded-lg hover:bg-white/10 text-[#a1a1aa] hover:text-white transition-colors" title="Edit Client">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {userRole === 'Admin' && (
                            <button onClick={() => setClientToDelete(client._id)} className="p-2 rounded-lg hover:bg-rose-500/20 text-[#a1a1aa] hover:text-rose-400 transition-colors" title="Delete Client">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add / Edit Client Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a0b] border border-white/10 rounded-3xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-DEFAULT to-transparent" />
              
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold tracking-tight">{editingClientId ? 'Edit Client' : 'Add New Client'}</h2>
                <button type="button" onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-white/5 text-[#a1a1aa] hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitClient} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#71717a] uppercase tracking-wider">Full Name</label>
                  <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-3 bg-[#121214] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold-DEFAULT transition-colors" placeholder="e.g. Acme Jewellers" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#71717a] uppercase tracking-wider">Phone</label>
                    <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-[#121214] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold-DEFAULT transition-colors" placeholder="+1 234 567 8900" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#71717a] uppercase tracking-wider">Email</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-[#121214] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold-DEFAULT transition-colors" placeholder="client@example.com" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#71717a] uppercase tracking-wider">KYC Status</label>
                  <select value={formData.kycStatus} onChange={e => setFormData({...formData, kycStatus: e.target.value})} className="w-full px-4 py-3 bg-[#121214] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold-DEFAULT transition-colors appearance-none">
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 px-4 bg-[#1a1a1c] hover:bg-[#252528] text-white rounded-xl font-medium transition-colors text-sm">Cancel</button>
                  <button type="submit" className="flex-1 py-3 px-4 bg-white text-black hover:bg-gray-100 rounded-xl font-medium transition-colors text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    {editingClientId ? 'Update Client' : 'Create Client'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {clientToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setClientToDelete(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[#0a0a0b] border border-rose-500/20 rounded-3xl shadow-2xl p-6 text-center overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-transparent" />
              
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>
              
              <h2 className="text-xl font-semibold tracking-tight mb-2">Delete Client</h2>
              <p className="text-[#a1a1aa] font-light text-sm mb-6">
                Are you sure you want to permanently delete this client? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => setClientToDelete(null)}
                  className="flex-1 py-2.5 bg-[#1a1a1c] hover:bg-[#252528] text-white rounded-xl font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors text-sm shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ClientList;
