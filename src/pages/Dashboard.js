// Dashboard.js — Discord 2023+ style chat layout
// Military UI/business logic annotated inline
import React, { useState, useRef, useEffect } from "react";
// Tailwind Discord palette: https://tailwindcss.com/docs/customizing-colors

// Channel/system state mock
const CHANNEL = 'general';
const USER = {name: 'You', id: 1}; // Not real user session, for demo only
const SYSTEM_BANNERS = [
  {
    type: 'dlp',
    message: 'Data Loss Prevention: Sensitive info blocked',
    // Military logic - classified info banner
    logic: 'Military DLP policy triggers here on regex + user role.'
  },
  {
    type: 'blockchain',
    message: 'Blockchain Event: Transaction #248 succeeded',
    // Military/business logic annotation:/
    logic: 'Blockchain audit event, triggers secure logging.'
  },
  {
    type: 'device',
    message: 'Device Compliance: VPN offline',
    // Business logic:
    logic: 'Device/VPN status triggers forced logout if prolonged.'
  }
];

const TAILWIND_DISCORD_PALETTE = {
  bg: "bg-[#313338]", // Discord main bg
  header: "bg-[#2b2d31] border-b border-[#232428]",
  input: "bg-[#383a40] focus:ring-[#5865f2] text-gray-100",
  bubbleMe: "bg-[#5865f2] text-white",
  bubbleOther: "bg-[#43444b] text-gray-100",
  text: "text-gray-200",
  banner: "bg-[#23272a] text-[#faa61a]",
};

function Banner({ message, type, logic }) {
  // Popover for system events, annotated military logic
  return (
    <div className={`p-2 ${TAILWIND_DISCORD_PALETTE.banner} rounded-md mb-2 font-medium shadow`} title={logic}>
      <span>{message}</span>
      {/* <span className="text-xs ml-2 italic">({type}, {logic})</span> */}
    </div>
  );
}

function ChatBubble({ sender, text, me }) {
  return (
    <div className={`w-fit max-w-xl p-3 my-2 rounded-2xl shadow-sm ${me ? TAILWIND_DISCORD_PALETTE.bubbleMe : TAILWIND_DISCORD_PALETTE.bubbleOther}`}>
      <span className="font-semibold mr-2">{me ? "You" : sender}</span>
      <span>{text}</span>
    </div>
  );
}

export default function Dashboard() {
  const [chat, setChat] = useState([
    { sender: 'Alice', text: 'Hey 👋, this channel is military-compliant.' },
    { sender: 'System', text: 'Welcome to #general', sys: true },
    { sender: 'You', text: 'Is DLP active?' },
    { sender: 'Bob', text: 'Blockchain event received.' },
  ]);
  const [input, setInput] = useState("");
  const [banners, setBanners] = useState(SYSTEM_BANNERS);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  function handleSend() {
    // Military logic annotation: Secure send triggers DLP, then adds to bubble area
    setChat([...chat, { sender: USER.name, text: input }]);
    setInput("");
    // DLP logic would encrypt/run detection here
  }

  return (
    <div className={`h-screen w-full flex flex-col ${TAILWIND_DISCORD_PALETTE.bg}`}>
      {/* Channel header, annotated military/business logic */}
      <header className={`flex items-center justify-between px-6 py-3 ${TAILWIND_DISCORD_PALETTE.header}`}>
        <h1 className="font-bold text-xl text-white tracking-tight">#{CHANNEL}</h1>
        <div className="text-sm text-gray-400">Military Room – Events &amp; System UI</div>
        {/* Business logic: channel/permissions/UI badges here */}
      </header>

      {/* System banners, popovers for DLP/blockchain/device events (click to see logic) */}
      <section className="px-6 pt-3">
        {banners.map(b => (
          <Banner key={b.message} {...b} />
        ))}
      </section>

      {/* Main chat bubble area */}
      <main className="flex-1 overflow-y-auto px-6 pt-2 flex flex-col gap-1">
        {chat.map((msg, i) => (
          <ChatBubble key={i} sender={msg.sender} text={msg.text} me={msg.sender === USER.name} />
        ))}
      </main>

      {/* Input area, Discord style, Tailwind palette */}
      <footer className="p-4 border-t border-[#232428] flex items-center gap-2">
        <input
          ref={inputRef}
          className={`flex-1 rounded-lg px-4 py-2 ${TAILWIND_DISCORD_PALETTE.input}`}
          type="text"
          placeholder="Message #general"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button
          type="button"
          className="ml-2 px-4 py-2 rounded-lg bg-[#5865f2] text-white font-bold hover:bg-[#4752c4]"
          onClick={handleSend}
        >Send</button>
      </footer>
    </div>
  );
}
