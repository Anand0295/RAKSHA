import React, { useState } from 'react';
import './MemberList.css';

/**
 * MemberList Component - Discord 2023+ Styled Member List
 * 
 * Features:
 * - Avatar display with presence indicator
 * - Username with role/rank badges
 * - Security status popover
 * - Military-specific status logic
 * - Modern Discord design aesthetics
 */

const MemberList = ({ members = [], onMemberClick }) => {
  const [hoveredMember, setHoveredMember] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  /**
   * Badge Placement Strategy:
   * - Primary badge (rank/role) positioned top-right of username
   * - Security status badge positioned with popover on hover
   * - Military rank indicators: VERIFIED, ADMIN, MOD, MEMBER
   */

  // Military-specific status mapping
  const getMilitaryStatus = (member) => {
    if (member.isVerified) return { label: 'VERIFIED', color: 'badge-verified', icon: '✓' };
    if (member.isAdmin) return { label: 'ADMIN', color: 'badge-admin', icon: '★' };
    if (member.isModerator) return { label: 'MOD', color: 'badge-mod', icon: '⚙' };
    return { label: 'MEMBER', color: 'badge-member', icon: '●' };
  };

  // Presence status logic
  const getPresenceStatus = (member) => {
    if (member.presence === 'online') return { label: 'Online', className: 'status-online' };
    if (member.presence === 'idle') return { label: 'Idle', className: 'status-idle' };
    if (member.presence === 'dnd') return { label: 'Do Not Disturb', className: 'status-dnd' };
    return { label: 'Offline', className: 'status-offline' };
  };

  // Security status popover data
  const getSecurityStatus = (member) => {
    return {
      verified: member.isVerified || false,
      twoFactorEnabled: member.twoFA || false,
      lastActive: member.lastActive || 'Unknown',
      joinDate: member.joinDate || 'Unknown',
      ipVerified: member.ipVerified || false,
    };
  };

  const handleMemberHover = (memberId) => {
    setHoveredMember(memberId);
  };

  const handleMemberLeave = () => {
    setHoveredMember(null);
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member.id);
    if (onMemberClick) {
      onMemberClick(member);
    }
  };

  return (
    <div className="member-list-container">
      <div className="member-list-header">
        <h2>Members</h2>
        <span className="member-count">{members.length}</span>
      </div>

      <div className="member-list">
        {members.map((member) => {
          const militaryStatus = getMilitaryStatus(member);
          const presenceStatus = getPresenceStatus(member);
          const securityStatus = getSecurityStatus(member);
          const isHovered = hoveredMember === member.id;
          const isSelected = selectedMember === member.id;

          return (
            <div
              key={member.id}
              className={`member-item ${isSelected ? 'selected' : ''}`}
              onMouseEnter={() => handleMemberHover(member.id)}
              onMouseLeave={handleMemberLeave}
              onClick={() => handleMemberClick(member)}
            >
              {/* Avatar with Presence Indicator */}
              <div className="member-avatar-wrapper">
                <img
                  src={member.avatar || 'https://via.placeholder.com/40'}
                  alt={member.username}
                  className="member-avatar"
                />
                {/* Presence indicator - positioned bottom-right */}
                <div className={`presence-indicator ${presenceStatus.className}`}>
                  <span className="presence-dot" title={presenceStatus.label} />
                </div>
              </div>

              {/* Member Info Section */}
              <div className="member-info">
                <div className="member-header">
                  {/* Username with Badge Placement */}
                  <div className="username-container">
                    <span className="member-username">{member.username}</span>
                    {/* Badge Placement: Top-right of username - Military rank indicator */}
                    <span className={`rank-badge ${militaryStatus.color}`}>
                      {militaryStatus.icon} {militaryStatus.label}
                    </span>
                  </div>
                </div>
                {/* Optional: Display status message or role */}
                {member.statusMessage && (
                  <div className="member-status-message">{member.statusMessage}</div>
                )}
              </div>

              {/* Security Status Popover - Shown on Hover */}
              {isHovered && (
                <div className="security-status-popover">
                  <div className="popover-content">
                    <h4>Security Status</h4>
                    <div className="security-item">
                      <span className="security-label">Account Verified:</span>
                      <span className={securityStatus.verified ? 'verified' : 'unverified'}>
                        {securityStatus.verified ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                    <div className="security-item">
                      <span className="security-label">2FA Enabled:</span>
                      <span className={securityStatus.twoFactorEnabled ? 'verified' : 'unverified'}>
                        {securityStatus.twoFactorEnabled ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                    <div className="security-item">
                      <span className="security-label">IP Verified:</span>
                      <span className={securityStatus.ipVerified ? 'verified' : 'unverified'}>
                        {securityStatus.ipVerified ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                    <div className="security-item">
                      <span className="security-label">Last Active:</span>
                      <span>{securityStatus.lastActive}</span>
                    </div>
                    <div className="security-item">
                      <span className="security-label">Join Date:</span>
                      <span>{securityStatus.joinDate}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {members.length === 0 && (
        <div className="empty-state">
          <p>No members to display</p>
        </div>
      )}
    </div>
  );
};

export default MemberList;

/**
 * ANNOTATION - Badge Placement Logic:
 * - Primary rank badge (.rank-badge) placed immediately after username
 * - Color-coded by military status (verified, admin, mod, member)
 * - Icons used for quick visual identification
 * 
 * ANNOTATION - Military-Specific Status Logic:
 * - isVerified: Highest privilege tier, shows VERIFIED badge with ✓ icon
 * - isAdmin: Administrative access, shows ADMIN badge with ★ icon
 * - isModerator: Moderation capabilities, shows MOD badge with ⚙ icon
 * - Default MEMBER status with ● icon for regular members
 * 
 * ANNOTATION - Presence Indicator:
 * - Displayed as colored dot at bottom-right of avatar
 * - Online (green), Idle (yellow), DND (red), Offline (gray)
 * - Synchronized with member presence status from backend
 * 
 * ANNOTATION - Security Status Popover:
 * - Triggered on member hover
 * - Shows: Account verification, 2FA status, IP verification, activity times
 * - Follows Discord 2023+ design with semi-transparent background
 * - Positioned to right of member item to avoid overflow
 */
