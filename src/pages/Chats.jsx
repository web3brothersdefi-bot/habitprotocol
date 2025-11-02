import React, { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useMatches, useChatMessages } from '../hooks/useSupabase';
import { useAuthStore } from '../store/useStore';
import { formatAddress, getRoleIcon, getIPFSUrl, formatRelativeTime } from '../utils/helpers';

const Chats = () => {
  const { address, isConnected } = useAccount();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const withAddress = searchParams.get('with'); // Get 'with' query parameter
  const { matches, loading: matchesLoading } = useMatches();
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);

  const chatRoomId = selectedChat?.chat_room_id;
  const { messages, loading: messagesLoading, sendMessage } = useChatMessages(chatRoomId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-select chat when 'with' parameter is present
  useEffect(() => {
    if (withAddress && matches.length > 0 && !selectedChat) {
      const matchToSelect = matches.find(match => {
        const otherUserAddress = match.user_a.toLowerCase() === address?.toLowerCase()
          ? match.user_b.toLowerCase()
          : match.user_a.toLowerCase();
        return otherUserAddress === withAddress.toLowerCase();
      });
      
      if (matchToSelect) {
        setSelectedChat(matchToSelect);
      }
    }
  }, [withAddress, matches, selectedChat, address]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !chatRoomId || !address) return;

    try {
      await sendMessage(messageInput.trim(), address);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getOtherUser = (match) => {
    if (!address) return null;
    
    const isUserA = match.user_a.toLowerCase() === address.toLowerCase();
    return isUserA ? match.user_b_profile : match.user_a_profile;
  };

  if (!address || !user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 text-center">
            <p>Please connect your wallet and complete onboarding</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Chat List */}
          <Card className={`lg:col-span-1 ${selectedChat ? 'hidden lg:block' : 'block'} overflow-hidden`}>
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold gradient-text">Chats</h2>
              <p className="text-sm text-grey">Your connections</p>
            </div>

            <div className="overflow-y-auto h-full custom-scrollbar">
              {matchesLoading ? (
                <div className="flex justify-center p-8">
                  <div className="spinner"></div>
                </div>
              ) : matches.length === 0 ? (
                <div className="p-8 text-center text-grey">
                  <p>No matches yet</p>
                  <p className="text-sm mt-2">Start swiping to find connections!</p>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {matches.map((match) => {
                    const otherUser = getOtherUser(match);
                    if (!otherUser) return null;

                    const isActive = selectedChat?.id === match.id;

                    return (
                      <motion.div
                        key={match.id}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          onClick={() => setSelectedChat(match)}
                          className={`p-4 rounded-xl cursor-pointer transition-all ${
                            isActive
                              ? 'bg-primary/20 border border-primary'
                              : 'glass-card hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="avatar w-12 h-12">
                              {otherUser.image_url ? (
                                <img
                                  src={getIPFSUrl(otherUser.image_url)}
                                  alt={otherUser.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-xl">
                                  {getRoleIcon(otherUser.role)}
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{otherUser.name}</h3>
                              <p className="text-sm text-grey truncate">
                                {formatAddress(otherUser.wallet_address)}
                              </p>
                            </div>

                            <div className="text-xs text-grey">
                              {formatRelativeTime(new Date(match.matched_at).getTime() / 1000)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* Chat Window */}
          <Card className={`lg:col-span-2 ${selectedChat ? 'block' : 'hidden lg:flex'} flex flex-col overflow-hidden`}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-white/10 flex items-center gap-4">
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="lg:hidden glass-button p-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="avatar w-10 h-10">
                    {getOtherUser(selectedChat)?.image_url ? (
                      <img
                        src={getIPFSUrl(getOtherUser(selectedChat).image_url)}
                        alt={getOtherUser(selectedChat).name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-lg">
                        {getRoleIcon(getOtherUser(selectedChat)?.role)}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold">{getOtherUser(selectedChat)?.name}</h3>
                    <p className="text-sm text-grey capitalize">{getOtherUser(selectedChat)?.role}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {messagesLoading ? (
                    <div className="flex justify-center">
                      <div className="spinner"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-grey">
                      <p>No messages yet</p>
                      <p className="text-sm mt-2">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isSent = message.sender_wallet.toLowerCase() === address?.toLowerCase();

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={isSent ? 'chat-bubble-sent' : 'chat-bubble-received'}>
                            <p>{message.message}</p>
                            <p className="text-xs text-grey mt-1">
                              {formatRelativeTime(new Date(message.timestamp).getTime() / 1000)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-white/10">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 input-glass"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      icon={<Send className="w-5 h-5" />}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden lg:flex flex-1 items-center justify-center text-grey">
                <div className="text-center">
                  <p className="text-lg">Select a chat to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Chats;
