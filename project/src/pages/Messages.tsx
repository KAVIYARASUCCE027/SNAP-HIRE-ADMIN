import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { Search, Send, MoreVertical, Phone, Video, MessageCircle } from 'lucide-react';

export default function Messages() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  
  // Mock message history
  const [chatHistory, setChatHistory] = useState([
    { id: 1, sender: 'me', text: 'Hi! We reviewed your incredible NLP match score and would love to schedule an interview.', time: '10:00 AM' }
  ]);

  useEffect(() => {
    fetch('http://localhost:5000/api/resumes')
      .then(res => res.json())
      .then(data => {
        setCandidates(data);
        if (data.length > 0) setSelectedContact(data[0]);
      })
      .catch(err => console.error(err));
  }, []);

  const filteredContacts = candidates.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSend = () => {
    if (!messageText.trim()) return;
    setChatHistory([...chatHistory, { id: Date.now(), sender: 'me', text: messageText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setMessageText('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 flex-1">
      <Header title="Direct Messages" subtitle="Chat securely with shortlisted candidates" />
      
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Contacts Sidebar */}
        <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col hidden md:flex">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-gray-50 outline-none text-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredContacts.map(contact => (
              <div 
                key={contact._id} 
                onClick={() => setSelectedContact(contact)}
                className={`flex items-center p-4 border-b border-gray-50 cursor-pointer transition-colors ${selectedContact?._id === contact._id ? 'bg-purple-50 border-l-4 border-l-purple-600' : 'hover:bg-gray-50'}`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                  {contact.name ? contact.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="ml-3 overflow-hidden">
                  <h4 className="font-semibold text-gray-900 truncate text-sm">{contact.name || 'Unknown'}</h4>
                  <p className="text-xs text-gray-500 truncate">{contact.role || 'Applicant'}</p>
                </div>
              </div>
            ))}
            {filteredContacts.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">No matches found. Upload resumes to begin chatting!</div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
                    {selectedContact.name ? selectedContact.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-bold text-gray-900">{selectedContact.name || 'Unknown Candidate'}</h3>
                    <p className="text-xs text-gray-500">{selectedContact.email || 'No Email'} • NLP Match: {selectedContact.matchScore}%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <button className="hover:text-purple-600 transition-colors p-2"><Phone className="w-5 h-5"/></button>
                  <button className="hover:text-purple-600 transition-colors p-2"><Video className="w-5 h-5"/></button>
                  <button className="hover:text-purple-600 transition-colors p-2"><MoreVertical className="w-5 h-5"/></button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 custom-scrollbar">
                <div className="text-center text-xs text-gray-400 mb-6 font-medium uppercase tracking-wider">
                  You matched with {selectedContact.name} - Say Hello!
                </div>
                {chatMessageHistory(selectedContact.name)}
                {chatHistory.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${msg.sender === 'me' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'}`}>
                      <p className="text-sm">{msg.text}</p>
                      <span className={`text-[10px] mt-1 block ${msg.sender === 'me' ? 'text-purple-200' : 'text-gray-400'}`}>{msg.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={`Message ${selectedContact.name}...`}
                    className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-sm text-gray-700 mx-2"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!messageText.trim()}
                    className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white disabled:opacity-50 hover:bg-purple-700 transition-colors shadow-sm"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
               <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
               <p className="text-lg font-medium text-gray-600">No Candidate Selected</p>
               <p className="text-sm mt-1">Upload resumes or select a candidate from the left sidebar to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper to simulate incoming text
function chatMessageHistory(name: string) {
   return (
      <div className="flex justify-start">
         <div className="max-w-[70%] rounded-2xl px-5 py-3 shadow-sm bg-white border border-gray-100 text-gray-800 rounded-bl-none">
            <p className="text-sm">Hi, thank you for considering me! What are the next steps in the interview process?</p>
            <span className="text-[10px] mt-1 block text-gray-400">09:12 AM</span>
         </div>
      </div>
   )
}
