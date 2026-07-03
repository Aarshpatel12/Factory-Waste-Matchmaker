import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Award, Download } from 'lucide-react';

const ImpactCertificate = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ divertedCount: 0, role: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5001/api/auth/impact-stats', config);
      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getMilestone = (count) => {
    if (count >= 50) return { title: 'Platinum Recycler', next: null };
    if (count >= 20) return { title: 'Gold Recycler', next: 50 };
    if (count >= 5) return { title: 'Silver Recycler', next: 20 };
    if (count >= 1) return { title: 'Bronze Recycler', next: 5 };
    return { title: 'Newcomer', next: 1 };
  };

  const downloadReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Report Type,User Name,Role,Total Claims/Diversions\n"
      + `ESG Impact Report,${user.name},${stats.role},${stats.divertedCount}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${user.name.replace(/\s+/g, '_')}_ESG_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="text-center py-10">Loading your impact...</div>;

  const milestone = getMilestone(stats.divertedCount);
  const roleText = stats.role === 'generator' ? 'supplying' : 'claiming';

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-3xl mx-auto my-8">
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 p-8 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <Award className="h-64 w-64 transform translate-x-16 -translate-y-16" />
        </div>
        <Award className="h-16 w-16 mx-auto mb-4 text-brand-100 relative z-10" />
        <h2 className="text-3xl font-extrabold tracking-tight relative z-10">Certificate of Sustainability</h2>
        <p className="mt-2 text-brand-100 text-lg relative z-10">Presented to</p>
        <h3 className="text-2xl font-bold mt-2 relative z-10">{user.name}</h3>
      </div>
      
      <div className="p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <p className="text-gray-600 text-lg mb-6 leading-relaxed max-w-xl mx-auto">
          In recognition of your commitment to the circular economy. You have successfully participated in {roleText} <span className="font-bold text-gray-900">{stats.divertedCount}</span> batches of factory waste, diverting them from landfills and promoting sustainable industrial practices in our city.
        </p>
        
        <div className="inline-block border-2 border-brand-200 bg-brand-50 rounded-lg px-6 py-4 mb-8 shadow-inner">
          <p className="text-sm text-brand-800 font-semibold uppercase tracking-wider mb-1">Current Status</p>
          <p className="text-2xl font-black text-brand-900">{milestone.title}</p>
        </div>

        {milestone.next && (
          <div className="w-full max-w-md mx-auto">
            <div className="flex justify-between text-xs text-gray-500 mb-1 font-medium">
              <span>{stats.divertedCount} claims</span>
              <span>Next goal: {milestone.next} claims</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 shadow-inner">
              <div 
                className="bg-brand-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${(stats.divertedCount / milestone.next) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <button 
            onClick={downloadReport}
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            <Download className="h-4 w-4" /> Download ESG Report (CSV)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImpactCertificate;
