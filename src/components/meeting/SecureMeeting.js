import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import dlpManager from '../../utils/dlp';

function SecureMeeting({ token: propToken }) {
  const { token: paramToken } = useParams();
  const token = propToken || paramToken;
  const [activeChannel, setActiveChannel] = useState('general');
  const [isInVoice, setIsInVoice] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [stream, setStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [voiceRequests, setVoiceRequests] = useState([]);
  const [isHost, setIsHost] = useState(true);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState([
    { id: 1, name: 'Col. Rajesh Kumar', role: 'Host', userType: 'officer', rank: 'Colonel', inVoice: false, status: 'online' },
    { id: 2, name: 'Maj. Priya Singh', role: 'Member', userType: 'officer', rank: 'Major', inVoice: false, status: 'online' },
    { id: 3, name: 'Lt. Arjun Patel', role: 'Member', userType: 'officer', rank: 'Lieutenant', inVoice: false, status: 'away' },
    { id: 4, name: 'Mrs. Sunita Kumar', role: 'Member', userType: 'family', relation: 'Spouse', inVoice: false, status: 'online' },
    { id: 5, name: 'Capt. Meera Sharma', role: 'Member', userType: 'officer', rank: 'Captain', inVoice: false, status: 'online' },
    { id: 6, name: 'Arjun Kumar Jr.', role: 'Member', userType: 'family', relation: 'Child', inVoice: false, status: 'busy' }
  ]);
  const [voiceParticipants, setVoiceParticipants] = useState([]);
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  const [channelMembers, setChannelMembers] = useState({
    'general': [1, 2, 3, 4, 5, 6],
    'briefing': [1, 2, 3, 5], // Officers only
    'voice1': [1, 2, 5],
    'family': [1, 4, 6] // Family channel
  });
  
  const [userRole, setUserRole] = useState('officer'); // 'officer' or 'family'
  const [userRank, setUserRank] = useState('Colonel');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showMobileMembers, setShowMobileMembers] = useState(false);
  const fileInputRef = useRef(null);

  const channels = [
    { id: 'general', name: '# general-chat', type: 'text', access: ['officer', 'family'] },
    { id: 'briefing', name: '# briefing-room', type: 'text', access: ['officer'], restricted: true },
    { id: 'family', name: '# family-welfare', type: 'text', access: ['officer', 'family'] },
    { id: 'voice1', name: '🔊 Command Voice', type: 'voice', access: ['officer'] }
  ];
  
  const canAccessChannel = (channel) => {
    return channel.access.includes(userRole);
  };
  
  const canManageChannel = (channelId) => {
    return userRole === 'officer' && ['Colonel', 'Major'].includes(userRank);
  };

  useEffect(() => {
    // Enhanced DLP for meeting room
    const enhancedDLP = () => {
      // Block screen recording APIs
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
        navigator.mediaDevices.getDisplayMedia = function() {
          dlpManager.logViolation('Screen recording attempt blocked');
          dlpManager.showWarning('Screen recording not permitted in secure meetings');
          return Promise.reject(new Error('Screen recording blocked by DLP'));
        };
      }
      
      // Add sensitive content class to meeting elements
      setTimeout(() => {
        document.querySelectorAll('.meeting-content').forEach(el => {
          el.classList.add('sensitive-content');
        });
      }, 1000);
    };
    
    enhancedDLP();
    
    setMessages({
      'general': [
        { id: 1, sender: 'System', content: 'Welcome to Indian Army Secure Server', timestamp: new Date().toLocaleTimeString(), type: 'system' },
        { id: 2, sender: 'Col. Rajesh Kumar', content: 'Good morning everyone. Today\'s briefing starts at 1400 hours.', timestamp: new Date(Date.now() - 300000).toLocaleTimeString(), type: 'user' },
        { id: 3, sender: 'Maj. Priya Singh', content: 'Roger that, Sir. All units ready for briefing.', timestamp: new Date(Date.now() - 240000).toLocaleTimeString(), type: 'user' }
      ],
      'briefing': [
        { id: 1, sender: 'System', content: 'Classified briefing channel - authorized personnel only', timestamp: new Date().toLocaleTimeString(), type: 'system' },
        { id: 2, sender: 'Col. Rajesh Kumar', content: 'Operation Thunder - Phase 2 commencing tomorrow 0600 hours', timestamp: new Date(Date.now() - 180000).toLocaleTimeString(), type: 'user' }
      ],
      'family': [
        { id: 1, sender: 'System', content: 'Welcome to Family Welfare Channel', timestamp: new Date().toLocaleTimeString(), type: 'system' },
        { id: 2, sender: 'Mrs. Sunita Kumar', content: 'Reminder: Family day event this Saturday at 1500 hours', timestamp: new Date(Date.now() - 120000).toLocaleTimeString(), type: 'user' }
      ]
    });

    // Cleanup function for media streams
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };

    // Simulate activity
    const simulateActivity = () => {
      const activities = [
        () => {
          // Random chat message
          const senders = ['Lt. Arjun Patel', 'Capt. Meera Sharma', 'Mrs. Sunita Kumar'];
          const msgs = [
            'Status update: All systems operational',
            'Family event planning meeting scheduled',
            'Communication check - all clear',
            'Ready for orders, Sir',
            'Welfare committee meeting tomorrow'
          ];
          const sender = senders[Math.floor(Math.random() * senders.length)];
          const content = msgs[Math.floor(Math.random() * msgs.length)];
          
          setMessages(prev => ({
            ...prev,
            general: [...prev.general, {
              id: Date.now(),
              sender,
              content,
              timestamp: new Date().toLocaleTimeString(),
              type: 'user'
            }]
          }));
        },
        () => {
          // Voice join request
          if (Math.random() > 0.85 && voiceRequests.length === 0) {
            const requesters = ['Lt. Arjun Patel', 'Maj. Vikram Singh'];
            const requester = requesters[Math.floor(Math.random() * requesters.length)];
            setVoiceRequests(prev => [...prev, {
              id: Date.now(),
              user: requester,
              timestamp: new Date().toLocaleTimeString()
            }]);
          }
        },
        () => {
          // File sharing simulation
          if (Math.random() > 0.9) {
            const files = [
              { name: 'Operation_Report.pdf', type: 'file' },
              { name: 'Tactical_Map.jpg', type: 'image' },
              { name: 'Briefing_Video.mp4', type: 'video' }
            ];
            const file = files[Math.floor(Math.random() * files.length)];
            const sender = 'Maj. Priya Singh';
            
            // Simulate file with mock data URL for demo
            const mockUrls = {
              'Operation_Report.pdf': null,
              'Tactical_Map.jpg': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzMzNzNkYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkluZGlhbiBBcm15IFRhY3RpY2FsIE1hcDwvdGV4dD48L3N2Zz4=',
              'Briefing_Video.mp4': 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDE='
            };
            
            setMessages(prev => ({
              ...prev,
              general: [...(prev.general || []), {
                id: Date.now(),
                sender,
                content: file.name,
                timestamp: new Date().toLocaleTimeString(),
                type: 'file',
                fileType: file.type,
                fileUrl: mockUrls[file.name],
                fileSize: '2.3 MB'
              }]
            }));
          }
        },
        () => {
          // Someone joins voice automatically
          if (Math.random() > 0.8 && voiceParticipants.length < 6) {
            const names = ['Capt. Meera Sharma', 'Maj. Vikram Singh', 'Lt. Rohit Kumar', 'Capt. Ankit Verma'];
            const name = names[Math.floor(Math.random() * names.length)];
            if (!voiceParticipants.some(p => p.name === name)) {
              setVoiceParticipants(prev => [...prev, {
                id: Date.now(),
                name,
                isMuted: Math.random() > 0.5,
                isVideoOn: Math.random() > 0.7
              }]);
            }
          }
        },
        () => {
          // Simulate speaking activity
          if (voiceParticipants.length > 0 && Math.random() > 0.7) {
            const unmutedParticipants = voiceParticipants.filter(p => !p.isMuted);
            if (unmutedParticipants.length > 0) {
              const participant = unmutedParticipants[Math.floor(Math.random() * unmutedParticipants.length)];
              setSpeakingUsers(prev => new Set([...prev, participant.id]));
              setTimeout(() => {
                setSpeakingUsers(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(participant.id);
                  return newSet;
                });
              }, 1500 + Math.random() * 2500);
            }
          }
        }
      ];
      
      const activity = activities[Math.floor(Math.random() * activities.length)];
      activity();
    };

    const interval = setInterval(simulateActivity, 8000 + Math.random() * 12000);
    return () => clearInterval(interval);
  }, []);

  const joinVoiceChannel = () => {
    if (isHost || channelMembers['voice1']?.includes(1)) {
      setIsInVoice(true);
      setVoiceParticipants(prev => {
        if (!prev.some(p => p.id === 'user')) {
          return [...prev, { id: 'user', name: 'You', isMuted: true, isVideoOn: false }];
        }
        return prev;
      });
      setActiveChannel('voice1');
    } else {
      const request = {
        id: Date.now(),
        user: 'You',
        timestamp: new Date().toLocaleTimeString()
      };
      setVoiceRequests(prev => [...prev, request]);
    }
  };

  const approveVoiceRequest = (requestId) => {
    const request = voiceRequests.find(req => req.id === requestId);
    if (request) {
      setVoiceRequests(voiceRequests.filter(req => req.id !== requestId));
      setVoiceParticipants(prev => [...prev, { 
        id: requestId, 
        name: request.user, 
        isMuted: true, 
        isVideoOn: false 
      }]);
    }
  };

  const removeMember = (memberId, channelId) => {
    if (canManageChannel(channelId)) {
      if (channelId === 'voice1') {
        if (memberId === 1) {
          // Remove current user from voice
          leaveVoice();
        } else {
          // Remove other participants by matching ID or name
          setVoiceParticipants(prev => prev.filter(p => p.id !== memberId));
        }
      } else if (memberId !== 1) {
        setChannelMembers({
          ...channelMembers,
          [channelId]: channelMembers[channelId].filter(id => id !== memberId)
        });
      }
    }
  };

  const addMemberToChannel = (memberId, channelId) => {
    if (canManageChannel(channelId) && !channelMembers[channelId].includes(memberId)) {
      setChannelMembers({
        ...channelMembers,
        [channelId]: [...channelMembers[channelId], memberId]
      });
    }
  };

  const leaveVoice = () => {
    setIsInVoice(false);
    setIsMuted(true);
    setIsVideoOn(false);
    setIsScreenSharing(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    setVoiceParticipants(voiceParticipants.filter(p => p.id !== 'user'));
  };

  const toggleMute = async () => {
    if (!isMuted && !stream) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideoOn });
        setStream(mediaStream);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        return;
      }
    }
    setIsMuted(!isMuted);
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = isMuted;
    }
    // Simulate speaking when unmuting
    if (isMuted) {
      setTimeout(() => {
        setSpeakingUsers(prev => new Set([...prev, 'user']));
        setTimeout(() => {
          setSpeakingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete('user');
            return newSet;
          });
        }, 2000);
      }, 300);
    }
  };

  const toggleVideo = async () => {
    if (!isVideoOn && !stream) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: !isMuted });
        setStream(mediaStream);
      } catch (err) {
        console.error('Error accessing camera:', err);
        return;
      }
    }
    setIsVideoOn(!isVideoOn);
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = !isVideoOn;
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true, 
          audio: true 
        });
        setScreenStream(displayStream);
        setIsScreenSharing(true);
        
        // Handle screen share end
        displayStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setScreenStream(null);
        };
      } catch (err) {
        console.error('Error accessing screen:', err);
      }
    } else {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && activeChannel !== 'voice1') {
      const message = {
        id: Date.now(),
        sender: 'You',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString(),
        type: 'user'
      };
      setMessages({
        ...messages,
        [activeChannel]: [...(messages[activeChannel] || []), message]
      });
      setNewMessage('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && activeChannel !== 'voice1') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const message = {
          id: Date.now(),
          sender: 'You',
          content: file.name,
          timestamp: new Date().toLocaleTimeString(),
          type: 'file',
          fileType: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file',
          fileUrl: event.target.result,
          fileSize: (file.size / 1024).toFixed(1) + ' KB'
        };
        setMessages({
          ...messages,
          [activeChannel]: [...(messages[activeChannel] || []), message]
        });
      };
      
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        reader.readAsDataURL(file);
      } else {
        const message = {
          id: Date.now(),
          sender: 'You',
          content: file.name,
          timestamp: new Date().toLocaleTimeString(),
          type: 'file',
          fileType: 'file',
          fileSize: (file.size / 1024).toFixed(1) + ' KB'
        };
        setMessages({
          ...messages,
          [activeChannel]: [...(messages[activeChannel] || []), message]
        });
      }
    }
    e.target.value = '';
  };

  const renderMessage = (message) => {
    if (message.type === 'file') {
      if (message.fileType === 'image') {
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-blue-400">
              <span>🖼️</span>
              <span className="text-sm">{message.content}</span>
              <span className="text-xs text-gray-400">({message.fileSize})</span>
            </div>
            {message.fileUrl && (
              <img 
                src={message.fileUrl} 
                alt={message.content}
                className="max-w-xs max-h-64 rounded-lg border border-gray-600 cursor-pointer hover:opacity-90"
                onClick={() => window.open(message.fileUrl, '_blank')}
              />
            )}
          </div>
        );
      } else if (message.fileType === 'video') {
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-purple-400">
              <span>🎥</span>
              <span className="text-sm">{message.content}</span>
              <span className="text-xs text-gray-400">({message.fileSize})</span>
            </div>
            {message.fileUrl && (
              <video 
                src={message.fileUrl}
                controls
                className="max-w-xs max-h-64 rounded-lg border border-gray-600"
              />
            )}
          </div>
        );
      } else {
        return (
          <div className="flex items-center space-x-2 p-3 bg-gray-600 rounded-lg border border-gray-500 hover:bg-gray-500 cursor-pointer">
            <div className="flex items-center space-x-2">
              <span>📄</span>
              <div>
                <div className="text-sm font-medium text-blue-400">{message.content}</div>
                <div className="text-xs text-gray-400">{message.fileSize}</div>
              </div>
            </div>
            <button className="text-xs bg-blue-600 px-2 py-1 rounded hover:bg-blue-700">
              Download
            </button>
          </div>
        );
      }
    }
    return <span>{message.content}</span>;
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-800 p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="font-bold text-sm">🏛️ Indian Army HQ</h2>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-400">{channels.find(ch => ch.id === activeChannel)?.name}</span>
          </div>
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="p-2 rounded hover:bg-gray-700 touch-manipulation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Server Sidebar */}
      <div className={`w-full lg:w-60 bg-gray-800 flex flex-col ${showMobileSidebar ? 'block' : 'hidden lg:flex'}`}>
        {/* Server Header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-bold text-lg">🏛️ Indian Army HQ</h2>
          <p className="text-xs text-gray-400">Secure Communications</p>
        </div>

        {/* Channels */}
        <div className="flex-1 p-2">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Text Channels</h3>
            {channels.filter(ch => ch.type === 'text' && canAccessChannel(ch)).map(channel => (
              <button
                key={channel.id}
                onClick={() => {
                  setActiveChannel(channel.id);
                  setShowMobileSidebar(false);
                }}
                className={`w-full text-left p-3 lg:p-2 rounded mb-1 hover:bg-gray-700 active:bg-gray-600 flex items-center justify-between touch-manipulation ${
                  activeChannel === channel.id ? 'bg-gray-600' : ''
                }`}
              >
                <div className="flex items-center space-x-1">
                  <span>{channel.name}</span>
                  {channel.restricted && <span className="text-xs text-red-400">🔒</span>}
                </div>
                <span className="text-xs text-gray-400">{channelMembers[channel.id]?.length || 0}</span>
              </button>
            ))}
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Voice Channels</h3>
            {channels.filter(ch => ch.type === 'voice' && canAccessChannel(ch)).map(channel => (
              <div key={channel.id} className="mb-2">
                <button
                  onClick={() => {
                    setActiveChannel(channel.id);
                    setShowMobileSidebar(false);
                  }}
                  className={`w-full text-left p-3 lg:p-2 rounded hover:bg-gray-700 active:bg-gray-600 flex items-center justify-between touch-manipulation ${
                    activeChannel === channel.id ? 'bg-gray-600' : ''
                  }`}
                >
                  <span>{channel.name}</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-400">{channelMembers[channel.id]?.length || 0}</span>
                    {voiceParticipants.length > 0 && (
                      <span className="text-xs bg-green-600 px-1 rounded">{voiceParticipants.length}</span>
                    )}
                  </div>
                </button>
                
                {voiceParticipants.map(participant => (
                  <div key={participant.id} className="ml-4 p-1 text-sm flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>{participant.name}</span>
                    {participant.isMuted && <span>🔇</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Voice Controls */}
        {isInVoice && (
          <div className="p-3 lg:p-4 bg-gray-700 border-t border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm">🔊 Connected to Voice</span>
              <button
                onClick={leaveVoice}
                className="text-xs bg-red-600 px-3 py-2 rounded hover:bg-red-700 active:bg-red-800 touch-manipulation"
              >
                Leave
              </button>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={toggleMute}
                className={`flex-1 p-3 lg:p-2 rounded hover:opacity-80 active:opacity-60 touch-manipulation ${isMuted ? 'bg-red-600' : 'bg-gray-600'}`}
              >
                <span className="text-lg lg:text-base">{isMuted ? '🔇' : '🎤'}</span>
              </button>
              <button 
                onClick={toggleVideo}
                className={`flex-1 p-3 lg:p-2 rounded hover:opacity-80 active:opacity-60 touch-manipulation ${!isVideoOn ? 'bg-red-600' : 'bg-gray-600'}`}
              >
                <span className="text-lg lg:text-base">{isVideoOn ? '📹' : '📷'}</span>
              </button>
              <button 
                onClick={toggleScreenShare}
                className={`flex-1 p-3 lg:p-2 rounded hover:opacity-80 active:opacity-60 touch-manipulation ${isScreenSharing ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                <span className="text-lg lg:text-base">🖥️</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 meeting-content">
        {/* Channel Header */}
        <div className="p-3 lg:p-4 border-b border-gray-700 bg-gray-800 hidden lg:block">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold">
                {channels.find(ch => ch.id === activeChannel)?.name || '# general-chat'}
              </h1>
              <p className="text-sm text-gray-400">Token: {token?.substring(0, 8)}... | Encrypted Channel</p>
            </div>
            {canManageChannel(activeChannel) && voiceRequests.length > 0 && (
              <div className="bg-yellow-600 px-3 py-1 rounded text-sm">
                {voiceRequests.length} Voice Request(s)
              </div>
            )}
            <div className="flex items-center space-x-2 text-xs">
              <span className={`px-2 py-1 rounded ${
                userRole === 'officer' ? 'bg-blue-600' : 'bg-green-600'
              }`}>
                {userRole === 'officer' ? `🎖️ ${userRank}` : '👨‍👩‍👧‍👦 Family'}
              </span>
            </div>
          </div>
        </div>

        {/* Voice Requests (Authorized Only) */}
        {canManageChannel('voice1') && voiceRequests.length > 0 && (
          <div className="p-4 bg-yellow-900 border-b border-yellow-700">
            <h3 className="font-semibold mb-2">Voice Channel Requests:</h3>
            {voiceRequests.map(request => (
              <div key={request.id} className="flex items-center justify-between bg-yellow-800 p-2 rounded mb-2">
                <span>{request.user} wants to join voice channel</span>
                <div className="space-x-2">
                  <button
                    onClick={() => approveVoiceRequest(request.id)}
                    className="bg-green-600 px-3 py-1 rounded hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => setVoiceRequests(voiceRequests.filter(req => req.id !== request.id))}
                    className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 lg:p-4 min-h-0 meeting-content sensitive-content">
          {activeChannel === 'voice1' ? (
            isInVoice ? (
              <div className="h-full flex flex-col">
                {/* Voice Call Grid */}
                <div className={`flex-1 grid gap-2 lg:gap-4 p-2 lg:p-4 meeting-content sensitive-content ${
                  voiceParticipants.length + 1 <= 2 ? 'grid-cols-1 lg:grid-cols-2' :
                  voiceParticipants.length + 1 <= 4 ? 'grid-cols-2' :
                  voiceParticipants.length + 1 <= 6 ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'
                }`}>
                  {/* Current User */}
                  <div className={`bg-gray-700 rounded-lg relative overflow-hidden aspect-video transition-all duration-200 ${
                    !isMuted && speakingUsers.has('user') ? 'ring-4 ring-green-400 shadow-lg shadow-green-400/30 animate-pulse' : ''
                  } ${isScreenSharing ? 'col-span-2' : ''}`}>
                    {isScreenSharing && screenStream ? (
                      <video
                        ref={(video) => {
                          if (video && screenStream) video.srcObject = screenStream;
                        }}
                        autoPlay
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : isVideoOn && stream ? (
                      <video
                        ref={(video) => {
                          if (video && stream) video.srcObject = stream;
                        }}
                        autoPlay
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-xl">Y</span>
                          </div>
                          <p className="text-sm">You</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs flex items-center space-x-1">
                      <span>You</span>
                      {isMuted ? <span>🔇</span> : <span>🎤</span>}
                      {isScreenSharing && <span>🖥️</span>}
                    </div>
                  </div>

                  {/* All Voice Participants */}
                  {voiceParticipants.filter(p => p.id !== 'user').map(participant => (
                    <div key={participant.id} className={`bg-gray-700 rounded-lg relative overflow-hidden aspect-video transition-all duration-200 ${
                      !participant.isMuted && speakingUsers.has(participant.id) ? 'ring-4 ring-green-400 shadow-lg shadow-green-400/30 animate-pulse' : ''
                    }`}>
                      {participant.isVideoOn ? (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                              <span className="text-2xl">{participant.name.charAt(0)}</span>
                            </div>
                            <p className="text-sm opacity-80">Camera Active</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                              <span className="text-xl">{participant.name.charAt(0)}</span>
                            </div>
                            <p className="text-sm">{participant.name}</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs flex items-center space-x-1">
                        <span>{participant.name}</span>
                        {participant.isMuted ? <span>🔇</span> : <span>🎤</span>}
                        {participant.isVideoOn && <span>📹</span>}
                      </div>
                      {!participant.isMuted && speakingUsers.has(participant.id) && (
                        <div className="absolute top-2 right-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Voice Controls */}
                <div className="p-3 lg:p-4 bg-gray-800 border-t border-gray-700">
                  <div className="flex justify-center space-x-3 lg:space-x-4">
                    <button
                      onClick={toggleMute}
                      className={`p-4 lg:p-3 rounded-full touch-manipulation ${isMuted ? 'bg-red-600 hover:bg-red-700 active:bg-red-800' : 'bg-gray-600 hover:bg-gray-500 active:bg-gray-700'}`}
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      <span className="text-lg lg:text-base">{isMuted ? '🔇' : '🎤'}</span>
                    </button>
                    <button
                      onClick={toggleVideo}
                      className={`p-4 lg:p-3 rounded-full touch-manipulation ${!isVideoOn ? 'bg-red-600 hover:bg-red-700 active:bg-red-800' : 'bg-gray-600 hover:bg-gray-500 active:bg-gray-700'}`}
                      title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
                    >
                      <span className="text-lg lg:text-base">{isVideoOn ? '📹' : '📷'}</span>
                    </button>
                    <button
                      onClick={toggleScreenShare}
                      className={`p-4 lg:p-3 rounded-full touch-manipulation ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800' : 'bg-gray-600 hover:bg-gray-500 active:bg-gray-700'}`}
                      title={isScreenSharing ? 'Stop screen share' : 'Share screen'}
                    >
                      <span className="text-lg lg:text-base">🖥️</span>
                    </button>
                    <button
                      onClick={leaveVoice}
                      className="p-4 lg:p-3 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 touch-manipulation"
                      title="Leave call"
                    >
                      <span className="text-lg lg:text-base">📞</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 mt-10 lg:mt-20 px-4">
                <h3 className="text-lg lg:text-xl mb-4">🔊 Command Voice Channel</h3>
                <p className="text-sm lg:text-base mb-6">Join the voice channel to participate in audio communication</p>
                <button
                  onClick={joinVoiceChannel}
                  className="bg-green-600 px-6 py-3 rounded-lg hover:bg-green-700 active:bg-green-800 touch-manipulation font-medium"
                >
                  {isHost ? 'Join Voice Channel' : 'Request to Join'}
                </button>
              </div>
            )
          ) : (
            <div className="space-y-3">
              {(messages[activeChannel] || []).map(message => (
                <div key={message.id} className={`p-3 rounded ${
                  message.type === 'system' ? 'bg-blue-900' : 'bg-gray-700'
                }`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm">{message.sender}</span>
                    <span className="text-xs text-gray-400">{message.timestamp}</span>
                  </div>
                  <div className="text-sm">{renderMessage(message)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Input */}
        {activeChannel !== 'voice1' && (
          <div className="p-3 lg:p-4 border-t border-gray-700 bg-gray-800">
            <div className="flex space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-600 px-3 py-3 lg:py-2 rounded-lg hover:bg-gray-500 active:bg-gray-700 flex items-center space-x-1 touch-manipulation"
                title="Upload file"
              >
                <span className="text-lg lg:text-base">📎</span>
                <span className="text-xs">+</span>
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`Message #${activeChannel}`}
                className="flex-1 bg-gray-700 px-4 py-3 lg:py-2 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none text-base"
              />
              <button
                onClick={sendMessage}
                className="bg-green-600 px-4 py-3 lg:py-2 rounded-lg hover:bg-green-700 active:bg-green-800 touch-manipulation font-medium"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Members Sidebar */}
      <div className={`w-full lg:w-60 bg-gray-800 border-l border-gray-700 p-3 lg:p-4 ${showMobileMembers ? 'block' : 'hidden lg:block'}`}>
        <div className="flex items-center justify-between lg:block">
          <h3 className="font-semibold mb-3">
            {activeChannel === 'voice1' ? 'Voice Channel' : `#${activeChannel}`} — {
              activeChannel === 'voice1' ? 
                (isInVoice ? 1 : 0) + voiceParticipants.filter(vp => vp.id !== 'user').length :
                channelMembers[activeChannel]?.length || 0
            }
          </h3>
          <button
            onClick={() => setShowMobileMembers(false)}
            className="lg:hidden p-2 rounded hover:bg-gray-700 touch-manipulation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        
        {/* Channel Members */}
        <div className="space-y-2 mb-4">
          {(activeChannel === 'voice1' ? 
            // Show actual voice participants
            [...(isInVoice ? [{ id: 1, name: 'You (Host)', role: 'Host', status: 'online' }] : []),
             ...voiceParticipants.filter(vp => vp.id !== 'user').map(vp => ({
               id: vp.id,
               name: vp.name,
               role: 'Member',
               status: 'online'
             }))]
          : 
            // Show channel members for text channels
            participants.filter(p => channelMembers[activeChannel]?.includes(p.id))
          ).map(participant => (
            <div key={participant.id} className="flex items-center justify-between group py-1">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 lg:w-8 lg:h-8 bg-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {participant.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm lg:text-sm font-medium">{participant.name}</div>
                  <div className="text-xs text-gray-400 flex items-center space-x-1">
                    <span>
                      {participant.role === 'Host' ? '👑 Host' : 
                       participant.userType === 'officer' ? `🎖️ ${participant.rank}` : 
                       `👨‍👩‍👧‍👦 ${participant.relation}`}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      participant.status === 'online' ? 'bg-green-500' :
                      participant.status === 'away' ? 'bg-yellow-500' :
                      participant.status === 'busy' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    {activeChannel === 'voice1' && <span>🔊</span>}
                  </div>
                </div>
              </div>
              {canManageChannel(activeChannel) && participant.role !== 'Host' && (
                <button
                  onClick={() => removeMember(participant.id, activeChannel)}
                  className="opacity-0 group-hover:opacity-100 lg:opacity-100 text-red-400 hover:text-red-300 active:text-red-200 text-sm p-2 touch-manipulation"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Members (Authorized Only) */}
        {canManageChannel(activeChannel) && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Add Members</h4>
            <div className="space-y-1">
              {(activeChannel === 'voice1' ? 
                // For voice channel, show participants not in voice
                participants.filter(p => 
                  !voiceParticipants.some(vp => vp.name === p.name) && 
                  !(p.id === 1 && isInVoice)
                ) :
                // For text channels, show non-members
                participants.filter(p => !channelMembers[activeChannel]?.includes(p.id))
              ).map(participant => (
                <button
                  key={participant.id}
                  onClick={() => {
                    if (activeChannel === 'voice1') {
                      // Add voice request for voice channel
                      setVoiceRequests(prev => [...prev, {
                        id: Date.now(),
                        user: participant.name,
                        timestamp: new Date().toLocaleTimeString()
                      }]);
                    } else {
                      addMemberToChannel(participant.id, activeChannel);
                    }
                  }}
                  className="w-full flex items-center space-x-3 p-3 lg:p-2 rounded-lg hover:bg-gray-700 active:bg-gray-600 text-left touch-manipulation"
                >
                  <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs">
                    {participant.name.charAt(0)}
                  </div>
                  <span className="text-sm text-gray-300">{participant.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SecureMeeting;