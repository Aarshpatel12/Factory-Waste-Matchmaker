import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Award, MessageCircle, Star } from 'lucide-react';
import ImpactCertificate from '../components/ImpactCertificate';
import ChatBox from '../components/ChatBox';

const GeneratorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', category: 'Textiles', quantity: '', description: '', location: '', image: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('listings');
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/listings/my-listings', config);
      setListings(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/listings', formData, config);
      setShowForm(false);
      setFormData({ title: '', category: 'Textiles', quantity: '', description: '', location: '', image: '' });
      fetchMyListings();
    } catch (error) {
      console.error(error);
      alert('Error creating listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generator Dashboard</h1>
          {user.numReviews > 0 && (
            <div className="flex items-center text-yellow-500 font-medium mt-1">
              <Star className="h-4 w-4 fill-yellow-500 mr-1" />
              {user.averageRating?.toFixed(1)} Average Rating ({user.numReviews} Reviews)
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'listings' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('listings')}
            >
              My Listings
            </button>
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${activeTab === 'certificate' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('certificate')}
            >
              <Award className="h-4 w-4" /> Impact
            </button>
          </div>
          {activeTab === 'listings' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-500 transition-colors shadow-sm"
            >
              {showForm ? 'Cancel' : 'Post New Material'}
            </button>
          )}
        </div>
      </div>

      {activeTab === 'certificate' && <ImpactCertificate />}

      {activeTab === 'listings' && showForm && (
        <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6 mb-8 border border-gray-200">
          <h2 className="text-lg font-medium mb-4">Create a new Scrap Listing</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 py-2 px-3 border" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 py-2 px-3 border" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  {['Textiles', 'Metal Shavings', 'Wood', 'Plastics', 'E-Waste', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity (e.g., 50 kg)</label>
                <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 py-2 px-3 border" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location / PIN Code</label>
                <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 py-2 px-3 border" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea required rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 py-2 px-3 border" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Image (Optional)</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="mt-1 block w-full" />
              {formData.image && <img src={formData.image} alt="Preview" className="mt-2 h-32 object-cover rounded-md" />}
            </div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700">
              {loading ? 'Posting...' : 'Post Listing'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'listings' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">My Active & Past Listings</h2>
          </div>
        <ul className="divide-y divide-gray-200">
          {listings.length === 0 ? (
            <li className="px-5 py-6 text-center text-gray-500">No listings found. Start by posting one!</li>
          ) : (
            listings.map(listing => (
              <li key={listing._id} className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {listing.image ? (
                    <img src={listing.image} alt="" className="h-16 w-16 object-cover rounded-md" />
                  ) : (
                    <div className="h-16 w-16 bg-gray-100 flex items-center justify-center rounded-md text-gray-400">No Img</div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{listing.title}</h3>
                    <p className="text-sm text-gray-500">{listing.category} • {listing.quantity}</p>
                    <p className="text-xs text-gray-400 mt-1">Location: {listing.location}</p>
                    {listing.status !== 'Available' && (
                      <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Claimed by: {listing.claimedBy?.name || 'Recycler'}
                          </p>
                          <p className="text-xs text-gray-500">Contact: {listing.claimedBy?.email}</p>
                        </div>
                        {listing.claimedBy && (
                          <button
                            onClick={() => setActiveChat({ listingId: listing._id, receiverId: listing.claimedBy._id, receiverName: listing.claimedBy.name })}
                            className="flex items-center gap-2 bg-brand-100 text-brand-700 hover:bg-brand-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                          >
                            <MessageCircle className="h-4 w-4" /> Chat
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  {listing.status === 'Available' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Available
                    </span>
                  ) : (
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Claimed
                      </span>
                      <p className="text-xs text-gray-500 mt-1">By: {listing.claimedBy?.name}</p>
                    </div>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
      )}

      {activeChat && (
        <ChatBox 
          listingId={activeChat.listingId} 
          receiverId={activeChat.receiverId} 
          receiverName={activeChat.receiverName} 
          onClose={() => setActiveChat(null)} 
        />
      )}
    </div>
  );
};

export default GeneratorDashboard;
