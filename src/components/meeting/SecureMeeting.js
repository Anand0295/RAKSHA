import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

// Discord 2023+ Color Palette
const discord = {
  blurple: '#5865F2',
  dark: '#36393F',
  darkerBg: '#2B2D31',
  lighterDark: '#313338',
  inputBg: '#383A40',
  green: '#3BA55D',
  yellow: '#FAA81A',
  red: '#ED4245',
  white: '#FFFFFF',
  grey: '#B5BAC1',
  greyText: '#949BA4',
};

// [business-logic] System Message Component - For DLP, approval, blockchain events
const SystemMessage = ({ type, message, timestamp }) => {
  const icons = {
    dlp: '🛡️',
    approval: '✅',
    blockchain: '⛓️',
    security: '🔒',
    warning: '⚠️',
  };
  
  const colors = {
    dlp: discord.blurple,
    approval: discord.green,
    blockchain: '#7289DA',
    security: discord.yellow,
    warning: discord.red,
  };

  return (
    <div className="flex items-start px-4 py-2 hover:bg-[#2E3035] group">
      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl"
           style={{ backgroundColor: colors[type] }}>
        {icons[type]}
      </div>
      <div className="ml-4 flex-1">
        <div className="flex items-baseline">
          <span className="font-semibold text-white mr-2">System</span>
          <span className="text-xs text-[#949BA4]">{timestamp}</span>
        </div>
        <div className="text-[#DCDDDE] text-sm mt-1">{message}</div>
      </div>
    </div>
  );
};

// [business-logic] User Message Bubble Component
const MessageBubble = ({ sender, content, timestamp, avatar, isCurrentUser }) => {
  return (
    <div className="flex items-start px-4 py-2 hover:bg-[#2E3035] group">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center font-semibold text-white">
        {avatar || sender.charAt(0)}
      </div>
      <div className="ml-4 flex-1">
        <div className="flex items-baseline">
          <span className="font-semibold text-white mr-2">{sender}</span>
          <span className="text-xs text-[#949BA4]">{timestamp}</span>
        </div>
        <div className="text-[#DCDDDE] text-sm mt-1 break-words">{content}</div>
      </div>
    </div>
  );
};

export default function SecureMeeting({ token: propToken }) {
  // [business-logic] Core state management
  const { token: paramToken } = useParams();
  const token = propToken || paramToken;
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState([
    { id: 1, name: 'Col. Rajesh Kumar', avatar: '👨‍✈️', status: 'online', rank: 'Colonel' },
    { id: 2, name: 'Maj. Priya Singh', avatar: '👩‍✈️', status: 'online', rank: 'Major' },
    { id: 3, name: 'Lt. Arjun Patel', avatar: '🎖️', status: 'away', rank: 'Lieutenant' },
  ]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // [security-event] Initialize with system messages on mount
  useEffect(() => {
    const initialMessages = [
      {
        id: 1,
        type: 'system',
        systemType: 'security',
        message: 'Secure meeting initialized. End-to-end encryption enabled.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: 2,
        type: 'system',
        systemType: 'dlp',
        message: 'DLP scan complete: No sensitive data leakage detected.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: 3,
        type: 'system',
        systemType: 'blockchain',
        message: 'Device verification complete. Blockchain hash: 0x7a9f2e...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: 4,
        type: 'user',
        sender: 'Col. Rajesh Kumar',
        avatar: '👨‍✈️',
        content: 'Meeting has started. Waiting for all participants to join.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(initialMessages);

    // [security-event] Simulate periodic security checks
    const securityInterval = setInterval(() => {
      const securityEvents = [
        { type: 'dlp', message: 'DLP monitoring: All activities within compliance.' },
        { type: 'approval', message: 'Access approval renewed for session.' },
        { type: 'blockchain', message: 'Device integrity verified via blockchain.' },
      ];
      
      const randomEvent = securityEvents[Math.floor(Math.random() * securityEvents.length)];
      
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          type: 'system',
          systemType: randomEvent.type,
          message: randomEvent.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 30000); // Every 30 seconds

    return () => clearInterval(securityInterval);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // [business-logic] Handle sending new message
  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        type: 'user',
        sender: 'You',
        avatar: '🙋',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCurrentUser: true,
      };
      setMessages([...messages, message]);
      setNewMessage('');
      
      // [security-event] Trigger DLP check on message send
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            type: 'system',
            systemType: 'dlp',
            message: 'Message scanned. No policy violations detected.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: discord.darkerBg }}>
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b" 
           style={{ backgroundColor: discord.lighterDark, borderColor: '#1E1F22' }}>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-lg"
               style={{ backgroundColor: discord.blurple }}>
            #
          </div>
          <div>
            <h1 className="text-white font-semibold">secure-meeting</h1>
            <p className="text-xs" style={{ color: discord.greyText }}>Token: {token?.substring(0, 8)}...</p>
          </div>
        </div>
        
        {/* [business-logic] Participant count and status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm" style={{ color: discord.greyText }}>Participants:</span>
            <div className="flex -space-x-2">
              {participants.map((p) => (
                <div key={p.id} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm"
                     style={{ backgroundColor: discord.blurple, borderColor: discord.lighterDark }}
                     title={p.name}>
                  {p.avatar}
                </div>
              ))}
            </div>
          </div>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: discord.green }}
               title="Connection secure"></div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: discord.darkerBg }}>
        <div className="py-4">
          {messages.map((message) => (
            message.type === 'system' ? (
              <SystemMessage
                key={message.id}
                type={message.systemType}
                message={message.message}
                timestamp={message.timestamp}
              />
            ) : (
              <MessageBubble
                key={message.id}
                sender={message.sender}
                content={message.content}
                timestamp={message.timestamp}
                avatar={message.avatar}
                isCurrentUser={message.isCurrentUser}
              />
            )
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input Area */}
      <div className="px-4 py-4" style={{ backgroundColor: discord.darkerBg }}>
        <div className="flex items-center space-x-3 px-4 py-3 rounded-lg"
             style={{ backgroundColor: discord.inputBg }}>
          <button className="text-2xl hover:opacity-80 transition" title="Add attachment">
            <span style={{ color: discord.grey }}>+</span>
          </button>
          
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message #secure-meeting"
            className="flex-1 bg-transparent outline-none text-white placeholder-[#6D6F78]"
          />
          
          <div className="flex items-center space-x-3">
            <button className="text-xl hover:opacity-80 transition" title="Emoji">
              <span style={{ color: discord.grey }}>😊</span>
            </button>
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="px-4 py-2 rounded font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: newMessage.trim() ? discord.blurple : discord.grey,
                color: discord.white 
              }}>
              Send
            </button>
          </div>
        </div>
        
        {/* [security-event] Security status footer */}
        <div className="flex items-center justify-between mt-3 px-2">
          <div className="flex items-center space-x-4 text-xs" style={{ color: discord.greyText }}>
            <span className="flex items-center space-x-1">
              <span>🛡️</span>
              <span>DLP Active</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>🔒</span>
              <span>E2E Encrypted</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>⛓️</span>
              <span>Blockchain Verified</span>
            </span>
          </div>
          <div className="text-xs" style={{ color: discord.greyText }}>
            © 2025 Military Secure Communications
          </div>
        </div>
      </div>
    </div>
  );
}
