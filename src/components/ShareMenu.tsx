"use client";

import { useState, useRef, useEffect } from "react";

interface ShareMenuProps {
  podcastId: string;
  podcastTitle: string;
}

export default function ShareMenu({ podcastId, podcastTitle }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const url = typeof window !== "undefined"
    ? `${window.location.origin}/podcast/${podcastId}`
    : "";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`Listen to "${podcastTitle}" on PodCraft: ${url}`)}`,
      "_blank"
    );
    setOpen(false);
  };

  const handleEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(`Check out this podcast: ${podcastTitle}`)}&body=${encodeURIComponent(`I made a podcast with PodCraft. Listen here:\n\n${url}`)}`;
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-3 glass-card hover:bg-surface-hover transition-colors text-gray-300 text-sm font-medium flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-56 glass-card border border-brand-500/20 rounded-xl overflow-hidden shadow-xl z-50">
          <button
            onClick={handleCopy}
            className="w-full px-4 py-3 text-left text-sm hover:bg-surface-hover transition-colors flex items-center gap-3"
          >
            <span className="text-lg">{copied ? "\u2705" : "\u{1f517}"}</span>
            <span className={copied ? "text-green-400" : "text-gray-300"}>
              {copied ? "Copied!" : "Copy link"}
            </span>
          </button>
          <button
            onClick={handleWhatsApp}
            className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-surface-hover transition-colors flex items-center gap-3"
          >
            <span className="text-lg">{"\u{1f4ac}"}</span>
            <span>WhatsApp</span>
          </button>
          <button
            onClick={handleEmail}
            className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-surface-hover transition-colors flex items-center gap-3"
          >
            <span className="text-lg">{"\u2709\ufe0f"}</span>
            <span>Email</span>
          </button>
        </div>
      )}
    </div>
  );
}
