import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BarChart3, PieChart, Users, ArrowUpRight } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    claimedItems: 0,
    categoryBreakdown: [],
    businesses: { generators: 0, recyclers: 0, total: 0 }
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/analytics', config);
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">City Administrator Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Waste Diverted</h3>
            <div className="p-2 bg-green-50 rounded-md">
              <ArrowUpRight className="h-5 w-5 text-brand-600" />
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-4xl font-extrabold text-gray-900">{stats.claimedItems}</span>
            <span className="ml-2 text-sm text-gray-500">transactions</span>
          </div>
          <p className="mt-2 text-xs text-brand-600 font-medium">Successfully claimed items this month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Active Businesses</h3>
            <div className="p-2 bg-blue-50 rounded-md">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-4xl font-extrabold text-gray-900">{stats.businesses.total}</span>
          </div>
          <p className="mt-2 text-xs text-gray-500 flex justify-between">
            <span>{stats.businesses.generators} Generators</span>
            <span>{stats.businesses.recyclers} Recyclers</span>
          </p>
        </div>

      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
          <PieChart className="h-5 w-5 mr-2 text-gray-400" />
          Material Category Breakdown
        </h3>
        
        {stats.categoryBreakdown.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No data available yet.</p>
        ) : (
          <div className="space-y-4">
            {stats.categoryBreakdown.map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{cat.name}</span>
                  <span className="text-gray-500">{cat.value} claims</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-brand-500 h-2.5 rounded-full" style={{ width: `${(cat.value / stats.claimedItems) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
