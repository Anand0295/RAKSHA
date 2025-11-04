import React, { useState } from 'react';
import { 
  ChevronDown, 
  Hash, 
  Volume2, 
  Settings, 
  UserPlus, 
  Bell,
  Shield,
  Award,
  Lock,
  AlertTriangle
} from 'lucide-react';

/**
 * Discord 2023+ Styled Sidebar Component
 * Features: Vertical server/channel navigation, hover highlights, 
 * channel grouping, popover menus, Tailwind Discord palette
 * 
 * Security Annotations: Includes security logic popovers and military approval badges
 */

const Sidebar = () => {
  const [expandedGroups, setExpandedGroups] = useState(['text-channels', 'voice-channels']);
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [showSecurityPopover, setShowSecurityPopover] = useState(false);
  const [showApprovalBadge, setShowApprovalBadge] = useState(true);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const channelGroups = [
    {
      id: 'text-channels',
      name: 'TEXT CHANNELS',
      channels: [
        { id: 'general', name: 'general', type: 'text', securityLevel: 'public' },
        { id: 'announcements', name: 'announcements', type: 'text', securityLevel: 'restricted' },
        { id: 'operations', name: 'operations', type: 'text', securityLevel: 'classified', militaryApproval: true },
        { id: 'intel', name: 'intel', type: 'text', securityLevel: 'top-secret', militaryApproval: true }
      ]
    },
    {
      id: 'voice-channels',
      name: 'VOICE CHANNELS',
      channels: [
        { id: 'voice-general', name: 'General', type: 'voice', securityLevel: 'public' },
        { id: 'voice-briefing', name: 'Briefing Room', type: 'voice', securityLevel: 'classified', militaryApproval: true }
      ]
    }
  ];

  const getSecurityIcon = (securityLevel) => {
    switch(securityLevel) {
      case 'public': return null;
      case 'restricted': return <Lock className="w-3 h-3 text-yellow-400" />;
      case 'classified': return <Shield className="w-3 h-3 text-orange-500" />;
      case 'top-secret': return <AlertTriangle className="w-3 h-3 text-red-500" />;
      default: return null;
    }
  };

  const getSecurityColor = (securityLevel) => {
    switch(securityLevel) {
      case 'public': return 'text-gray-400';
      case 'restricted': return 'text-yellow-400';
      case 'classified': return 'text-orange-500';
      case 'top-secret': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="flex h-screen bg-[#2b2d31] text-[#dbdee1] font-['gg_sans']">
      {/* Server List - Left Bar */}
      <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 space-y-2">
        {/* Home Server Icon */}
        <div className="w-12 h-12 bg-[#5865f2] rounded-2xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer group relative">
          <Shield className="w-6 h-6 text-white" />
          {showApprovalBadge && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#1e1f22]">
              <Award className="w-3 h-3 text-white" />
            </div>
          )}
          {/* Military Approval Badge Tooltip */}
          <div className="absolute left-full ml-2 px-3 py-2 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            RAKSHA Command Center
            <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
              <Award className="w-3 h-3" />
              Military Approved
            </div>
          </div>
        </div>

        {/* Server Divider */}
        <div className="w-8 h-[2px] bg-[#35383e] rounded-full"></div>

        {/* Additional Servers */}
        {['OP', 'IN', 'CM'].map((server, idx) => (
          <div 
            key={idx}
            className="w-12 h-12 bg-[#313338] rounded-3xl hover:rounded-xl hover:bg-[#5865f2] transition-all duration-200 flex items-center justify-center cursor-pointer text-sm font-semibold group relative"
          >
            {server}
            <div className="absolute left-full ml-2 px-3 py-2 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              {server === 'OP' ? 'Operations' : server === 'IN' ? 'Intelligence' : 'Command'}
            </div>
          </div>
        ))}
      </div>

      {/* Main Sidebar - Channel List */}
      <div className="w-60 bg-[#2b2d31] flex flex-col">
        {/* Server Header */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-[#1e1f22] hover:bg-[#35383e] cursor-pointer transition-colors group">
          <h2 className="font-semibold text-white flex items-center gap-2">
            RAKSHA HQ
            {showApprovalBadge && (
              <Award className="w-4 h-4 text-yellow-500" title="Military Approved" />
            )}
          </h2>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto pt-4 px-2">
          {channelGroups.map(group => (
            <div key={group.id} className="mb-4">
              {/* Group Header */}
              <div 
                className="flex items-center justify-between px-2 mb-1 cursor-pointer group hover:text-white transition-colors"
                onClick={() => toggleGroup(group.id)}
              >
                <div className="flex items-center gap-1 text-xs font-semibold text-[#949ba4] uppercase">
                  <ChevronDown 
                    className={`w-3 h-3 transition-transform ${
                      expandedGroups.includes(group.id) ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                  {group.name}
                </div>
                <UserPlus className="w-4 h-4 text-[#949ba4] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Channels */}
              {expandedGroups.includes(group.id) && (
                <div className="space-y-0.5">
                  {group.channels.map(channel => (
                    <div 
                      key={channel.id}
                      className={`
                        relative flex items-center gap-2 px-2 py-1.5 mx-1 rounded cursor-pointer group
                        ${
                          selectedChannel === channel.id 
                            ? 'bg-[#404249] text-white' 
                            : 'text-[#949ba4] hover:bg-[#35383e] hover:text-[#dbdee1]'
                        }
                        transition-colors
                      `}
                      onClick={() => setSelectedChannel(channel.id)}
                      onMouseEnter={() => {
                        if (channel.securityLevel !== 'public') {
                          setShowSecurityPopover(channel.id);
                        }
                      }}
                      onMouseLeave={() => setShowSecurityPopover(false)}
                    >
                      {/* Channel Icon */}
                      {channel.type === 'text' ? (
                        <Hash className="w-5 h-5 flex-shrink-0" />
                      ) : (
                        <Volume2 className="w-5 h-5 flex-shrink-0" />
                      )}

                      {/* Channel Name */}
                      <span className="flex-1 text-sm font-medium truncate">
                        {channel.name}
                      </span>

                      {/* Security Icon */}
                      {getSecurityIcon(channel.securityLevel)}

                      {/* Military Approval Badge */}
                      {channel.militaryApproval && (
                        <Award className="w-3 h-3 text-green-500 flex-shrink-0" />
                      )}

                      {/* Settings Icon on Hover */}
                      <Settings className="w-4 h-4 text-[#949ba4] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />

                      {/* Security Logic Popover */}
                      {showSecurityPopover === channel.id && channel.securityLevel !== 'public' && (
                        <div className="absolute left-full ml-2 px-3 py-2 bg-[#111214] border border-[#1e1f22] rounded-md shadow-xl z-50 w-56 pointer-events-none">
                          <div className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                            {getSecurityIcon(channel.securityLevel)}
                            Security Clearance Required
                          </div>
                          <div className={`text-xs mb-2 ${getSecurityColor(channel.securityLevel)}`}>
                            Level: {channel.securityLevel.toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-400 mb-2">
                            This channel requires appropriate security clearance. Access is logged and monitored.
                          </div>
                          {channel.militaryApproval && (
                            <div className="flex items-center gap-1 text-xs text-green-400 pt-2 border-t border-[#1e1f22]">
                              <Award className="w-3 h-3" />
                              <span>Military Command Approval</span>
                            </div>
                          )}
                          {/* Security Logic Details */}
                          <div className="mt-2 pt-2 border-t border-[#1e1f22] text-xs text-gray-500">
                            <div className="font-mono text-[10px]">
                              Auth: MFA + Biometric
                            </div>
                            <div className="font-mono text-[10px]">
                              Encryption: AES-256-GCM
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* User Panel */}
        <div className="h-14 bg-[#232428] px-2 flex items-center gap-2 border-t border-[#1e1f22]">
          <div className="w-8 h-8 bg-[#5865f2] rounded-full flex items-center justify-center text-xs font-semibold">
            U
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">User</div>
            <div className="text-xs text-[#949ba4] truncate">#0000</div>
          </div>
          <button className="w-8 h-8 flex items-center justify-center hover:bg-[#35383e] rounded transition-colors">
            <Settings className="w-4 h-4 text-[#b5bac1]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
