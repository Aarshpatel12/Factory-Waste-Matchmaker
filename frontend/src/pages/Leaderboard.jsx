import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Star, Medal } from 'lucide-react';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      const { data } = await axios.get('/api/auth/leaderboard');
      setLeaders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Sustainability Leaderboard</h1>
        <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
          Honoring the top factories in Ludhiana committed to the circular economy and zero-waste initiatives.
        </p>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading rankings...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <ul className="divide-y divide-gray-100">
            {leaders.length === 0 ? (
              <li className="p-8 text-center text-gray-500">No data available yet. Start recycling to get on the board!</li>
            ) : (
              leaders.map((leader, index) => (
                <li key={leader._id} className="p-6 flex items-center hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-12 text-center">
                    {index === 0 ? <Medal className="h-8 w-8 text-yellow-400 mx-auto" /> :
                     index === 1 ? <Medal className="h-8 w-8 text-gray-400 mx-auto" /> :
                     index === 2 ? <Medal className="h-8 w-8 text-amber-600 mx-auto" /> :
                     <span className="text-xl font-bold text-gray-400">#{index + 1}</span>}
                  </div>
                  <div className="ml-6 flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{leader.name}</h3>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium text-gray-700">{leader.averageRating.toFixed(1)}</span>
                      <span className="text-sm text-gray-500 ml-2">({leader.numReviews} Reviews)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      Eco-Champion
                    </span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
