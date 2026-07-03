import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Search, Heart, Award, MessageCircle, Star, Map as MapIcon, Bell } from 'lucide-react';
import ImpactCertificate from '../components/ImpactCertificate';
import ChatBox from '../components/ChatBox';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icon issue in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

const RecyclerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loadingId, setLoadingId] = useState(null);
  const [activeTab, setActiveTab] = useState('marketplace');
  const [activeChat, setActiveChat] = useState(null); // { listingId, receiverId, receiverName }
  const [reviewState, setReviewState] = useState({ listingId: null, rating: 5, comment: '' });
  const [alertCategories, setAlertCategories] = useState(JSON.parse(localStorage.getItem('wasteAlerts')) || []);

  useEffect(() => {
    fetchListings();
    fetchFavorites();
  }, [categoryFilter]);

  const toggleAlertCategory = (cat) => {
    let newAlerts;
    if (alertCategories.includes(cat)) {
      newAlerts = alertCategories.filter(c => c !== cat);
    } else {
      newAlerts = [...alertCategories, cat];
    }
    setAlertCategories(newAlerts);
    localStorage.setItem('wasteAlerts', JSON.stringify(newAlerts));
  };

  const fetchFavorites = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/auth/me', config);
      // Ensure favorites is an array of IDs
      setFavorites(data.favorites.map(f => typeof f === 'object' ? f._id : f) || []);
    } catch (error) {
      console.error('Failed to fetch favorites', error);
    }
  };

  const fetchListings = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/listings?category=${categoryFilter}`, config);
      setListings(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClaim = async (id) => {
    setLoadingId(id);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/listings/${id}/claim`, {}, config);
      
      // Update local state to show claimed status and generator contact
      setListings(listings.map(listing => 
        listing._id === id ? { ...listing, status: 'Claimed', generator: data.generator, _claimedNow: true } : listing
      ));
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error claiming listing');
    } finally {
      setLoadingId(null);
    }
  };

  const toggleFavorite = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/auth/favorites/${id}`, {}, config);
      setFavorites(data);
    } catch (error) {
      console.error('Failed to toggle favorite', error);
    }
  };

  const submitReview = async (e, listingId, generatorId) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/reviews', {
        rating: reviewState.rating,
        comment: reviewState.comment,
        generatorId,
        listingId
      }, config);
      alert('Review submitted successfully!');
      setReviewState({ listingId: null, rating: 5, comment: '' });
      fetchListings(); // refresh ratings
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting review');
    }
  };

  const displayedListings = activeTab === 'marketplace' 
    ? listings 
    : listings.filter(l => favorites.includes(l._id));

  // Determine if there are new matches based on alerts (last 24 hours)
  const newMatches = listings.filter(l => 
    alertCategories.includes(l.category) && 
    new Date(l.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) &&
    l.status === 'Available'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      {newMatches.length > 0 && activeTab !== 'alerts' && (
        <div className="bg-brand-50 border-l-4 border-brand-500 p-4 mb-6 rounded-r-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <Bell className="h-5 w-5 text-brand-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-brand-800 font-medium">
                Smart Alert: There are {newMatches.length} new materials matching your alerts! 
                <button onClick={() => setActiveTab('alerts')} className="ml-2 font-bold underline">View Alerts</button>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace Feed</h1>
          <p className="text-gray-600">Browse and claim available materials.</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'marketplace' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('marketplace')}
            >
              All Items
            </button>
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${activeTab === 'saved' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('saved')}
            >
              <Heart className="h-4 w-4" /> Saved
            </button>
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${activeTab === 'map' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('map')}
            >
              <MapIcon className="h-4 w-4" /> Map View
            </button>
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${activeTab === 'alerts' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('alerts')}
            >
              <Bell className="h-4 w-4" /> Alerts
            </button>
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${activeTab === 'certificate' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('certificate')}
            >
              <Award className="h-4 w-4" /> Impact
            </button>
          </div>
          
          {(activeTab === 'marketplace' || activeTab === 'saved' || activeTab === 'map') && (
            <div className="flex items-center bg-white rounded-md shadow-sm border border-gray-300 p-1">
              <Search className="h-5 w-5 text-gray-400 ml-2" />
              <select 
                className="ml-2 border-none focus:ring-0 text-sm py-2 pl-2 pr-8 bg-transparent text-gray-700"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {['All', 'Textiles', 'Metal Shavings', 'Wood', 'Plastics', 'E-Waste', 'Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'certificate' && <ImpactCertificate />}

      {activeTab === 'map' && (
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 mb-8" style={{ height: '600px' }}>
          <MapContainer center={[30.9009, 75.8573]} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%', borderRadius: '0.5rem', zIndex: 0 }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {displayedListings.map((listing, i) => {
              // Generate a pseudo-random coordinate near Ludhiana based on listing ID to avoid identical stacking
              const latOffset = (parseInt(listing._id.slice(-3), 16) / 4095 - 0.5) * 0.1;
              const lngOffset = (parseInt(listing._id.slice(-6, -3), 16) / 4095 - 0.5) * 0.1;
              const position = [30.9009 + latOffset, 75.8573 + lngOffset];
              
              return (
                <Marker key={listing._id} position={position}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{listing.title}</p>
                      <p className="text-gray-600">{listing.category} • {listing.quantity}</p>
                      <button 
                        className="mt-2 w-full bg-brand-600 text-white py-1 rounded text-xs"
                        onClick={() => {
                          setActiveTab('marketplace');
                          setCategoryFilter('All');
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-8 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Bell className="h-5 w-5" /> Smart Waste Alerts</h2>
          <p className="text-gray-600 mb-6">Select the waste categories you are interested in. We will notify you when new materials are listed.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {['Textiles', 'Metal Shavings', 'Wood', 'Plastics', 'E-Waste', 'Other'].map(cat => (
              <label key={cat} className="flex items-center gap-2 bg-gray-50 p-3 rounded-md border border-gray-200 cursor-pointer hover:bg-gray-100">
                <input 
                  type="checkbox" 
                  checked={alertCategories.includes(cat)} 
                  onChange={() => toggleAlertCategory(cat)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm font-medium">{cat}</span>
              </label>
            ))}
          </div>

          <h3 className="text-lg font-bold mb-4 border-t border-gray-200 pt-6">Recent Matches (Last 24 Hours)</h3>
          {newMatches.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent matches found for your alerts. Check back later!</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {newMatches.map(listing => (
                <div key={listing._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 flex flex-col relative">
                  <div className="h-48 w-full bg-gray-200 relative">
                    {listing.image ? (
                      <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-500 text-sm">No Image Available</div>
                    )}
                    <span className="absolute top-2 right-2 bg-brand-500 text-white text-xs px-2 py-1 rounded-full shadow-sm font-medium">New Match!</span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{listing.title}</h3>
                      <p className="text-sm text-brand-600 font-medium mb-3">{listing.category}</p>
                      <button onClick={() => { setActiveTab('marketplace'); setCategoryFilter('All'); }} className="text-brand-600 font-medium text-sm hover:underline">View in Marketplace &rarr;</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(activeTab === 'marketplace' || activeTab === 'saved') && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedListings.map((listing) => (
          <div key={listing._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 flex flex-col relative">
            <button 
              onClick={() => toggleFavorite(listing._id)}
              className="absolute top-2 left-2 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
            >
              <Heart className={`h-5 w-5 transition-colors ${favorites.includes(listing._id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
            </button>
            <div className="h-48 w-full bg-gray-200 relative">
              {listing.image ? (
                <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">No Image</div>
              )}
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-brand-700 shadow-sm">
                {listing.category}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-900 leading-tight">{listing.title}</h3>
              </div>
              <p className="mt-1 text-sm text-gray-500 flex-1">{listing.description}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">Quantity:</span>
                  <span>{listing.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">Location:</span>
                  <span>{listing.location}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium text-gray-900">Listed By:</span>
                  <div className="flex flex-col items-end">
                    <span>{listing.generator?.name}</span>
                    {listing.generator?.numReviews > 0 && (
                      <span className="flex items-center text-xs text-yellow-500 font-medium mt-0.5">
                        <Star className="h-3 w-3 fill-yellow-500 mr-1" />
                        {listing.generator.averageRating.toFixed(1)} ({listing.generator.numReviews})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                {(listing.status === 'Claimed' && listing.claimedBy === user._id) || listing._claimedNow ? (
                  <div className="bg-brand-50 rounded-md p-4 border border-brand-100 flex flex-col gap-3">
                    <div>
                      <p className="text-sm font-bold text-brand-800 mb-1">Successfully Claimed! 🎉</p>
                      <p className="text-xs text-brand-700">Contact to arrange pickup:</p>
                    </div>
                    <button 
                      onClick={() => setActiveChat({ listingId: listing._id, receiverId: listing.generator._id, receiverName: listing.generator.name })}
                      className="flex items-center justify-center gap-2 bg-brand-600 text-white text-sm font-medium py-2 rounded-md hover:bg-brand-700 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" /> Message Generator
                    </button>
                    
                    {reviewState.listingId === listing._id ? (
                      <form onSubmit={(e) => submitReview(e, listing._id, listing.generator._id)} className="mt-2 p-3 bg-white rounded border border-brand-100">
                        <p className="text-xs font-semibold mb-2">Leave a Review</p>
                        <select className="w-full text-sm p-1 border rounded mb-2" value={reviewState.rating} onChange={e => setReviewState({...reviewState, rating: e.target.value})}>
                          {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                        </select>
                        <input type="text" placeholder="Short comment..." className="w-full text-sm p-1 border rounded mb-2" value={reviewState.comment} onChange={e => setReviewState({...reviewState, comment: e.target.value})} />
                        <div className="flex gap-2">
                          <button type="submit" className="text-xs bg-brand-600 text-white px-2 py-1 rounded">Submit</button>
                          <button type="button" onClick={() => setReviewState({ listingId: null, rating: 5, comment: '' })} className="text-xs text-gray-500 px-2 py-1 rounded">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <button onClick={() => setReviewState({ listingId: listing._id, rating: 5, comment: '' })} className="text-xs text-brand-600 font-medium hover:underline text-left">
                        Already picked up? Leave a review
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleClaim(listing._id)}
                    disabled={loadingId === listing._id}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loadingId === listing._id ? 'Claiming...' : 'Claim Material'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {displayedListings.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-lg border border-dashed border-gray-300 text-gray-500">
            {activeTab === 'saved' ? 'No saved items found.' : 'No materials found in this category right now. Check back later!'}
          </div>
        )}
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

export default RecyclerDashboard;
