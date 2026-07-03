import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Send, X } from 'lucide-react';

const ChatBox = ({ listingId, receiverId, receiverName, onClose }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Simple polling every 3 seconds
    return () => clearInterval(interval);
  }, [listingId]);

  const fetchMessages = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`$1/api/messages/${listingId}`, config);
      setMessages(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/messages', {
        receiverId,
        listingId,
        content: newMessage
      }, config);
      
      setMessages([...messages, data]);
      setNewMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-t-xl rounded-b-md shadow-2xl border border-gray-200 flex flex-col z-50">
      <div className="bg-brand-600 text-white px-4 py-3 rounded-t-xl flex justify-between items-center">
        <h3 className="font-semibold text-sm">Chat with {receiverName}</h3>
        <button onClick={onClose} className="text-white hover:text-brand-200">
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex-1 p-4 h-64 overflow-y-auto bg-gray-50 flex flex-col space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-xs text-gray-500 my-auto">Say hello to arrange pickup!</p>
        ) : (
          messages.map(msg => (
            <div key={msg._id} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${msg.sender._id === user._id ? 'bg-brand-500 text-white self-end rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 self-start rounded-bl-none'}`}>
              <p>{msg.content}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="p-2 border-t border-gray-200 bg-white rounded-b-md flex gap-2">
        <input 
          type="text" 
          placeholder="Type a message..." 
          className="flex-1 text-sm border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 p-2 border"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="bg-brand-600 text-white p-2 rounded-md hover:bg-brand-700">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
