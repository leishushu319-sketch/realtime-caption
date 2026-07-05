import { useState, useRef, useEffect } from 'react';
import { Languages, Search, Maximize2, Minimize2, Check, Clock, ScrollText, X } from 'lucide-react';
import { LANGUAGES } from '../constants/index.js';
import { formatDuration } from '../utils/format.js';

export default function Header({
  isRecording, isPaused, recordingTime,
  hasHistory, searchQuery, onSearchChange,
  lang, onLangChange, fullscreen, onToggleFullscreen,
  searchRef,
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const mobileSearchRef = useRef(null);

  useEffect(() => {
    if (showMobileSearch && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [showMobileSearch]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-black/40 border-b border-white/5">
      <div className="flex items-center gap-2 px-3 py-2.5 sm:px-5 sm:py-3 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 sm:gap-3 mr-2 sm:mr-4">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/25 shrink-0">
            <ScrollText size={16} className="text-white sm:size-[18px]" />
          </div>
          <span className="font-bold text-base sm:text-lg tracking-tight hidden sm:block bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
            Caption Pro
          </span>
        </div>

        <div className={`flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all duration-500 shrink-0 ${
          isRecording
            ? isPaused
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
            : 'bg-gray-500/10 text-gray-400 border border-gray-500/10'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            isRecording
              ? isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
              : 'bg-gray-500'
          }`} />
          {isRecording ? (isPaused ? '已暫停' : '錄音中') : '待機'}
        </div>

        {isRecording && (
          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-300 font-mono shrink-0">
            <Clock size={11} className="text-violet-400 sm:size-[13px]" />
            {formatDuration(recordingTime)}
          </div>
        )}

        <div className="flex-1 min-w-0" />

        {hasHistory && (
          <>
            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input ref={searchRef} type="text" value={searchQuery} onChange={e => onSearchChange(e.target.value)}
                placeholder="搜尋字幕... (Ctrl+F)"
                className="w-40 bg-white/5 border border-white/10 rounded-xl py-1.5 pl-9 pr-3 text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500/50 transition-all" />
            </div>
            <button onClick={() => setShowMobileSearch(s => !s)}
              className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
              aria-label="搜尋字幕">
              {showMobileSearch ? <X size={16} className="text-gray-300" /> : <Search size={16} className="text-gray-300" />}
            </button>
          </>
        )}

        <div className="relative">
          <button onClick={() => setShowSettings(s => !s)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
            aria-label="選擇語言">
            <Languages size={16} className="text-gray-300" />
          </button>
          {showSettings && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-gray-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/50 dropdown-enter">
                <p className="text-xs text-gray-500 px-3 py-2 font-medium">辨識語言</p>
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => { onLangChange(l.code); setShowSettings(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                      lang === l.code
                        ? 'bg-violet-500/20 text-violet-300'
                        : 'text-gray-300 hover:bg-white/5'
                    }`}>
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                    {lang === l.code && <Check size={14} className="ml-auto text-violet-400" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button onClick={onToggleFullscreen}
          className="hidden sm:flex p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
          aria-label={fullscreen ? '退出全螢幕' : '全螢幕'}>
          {fullscreen ? <Minimize2 size={16} className="text-gray-300" /> : <Maximize2 size={16} className="text-gray-300" />}
        </button>
      </div>

      {showMobileSearch && (
        <div className="md:hidden px-3 pb-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input ref={mobileSearchRef} type="text" value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              onBlur={() => setTimeout(() => setShowMobileSearch(false), 200)}
              placeholder="搜尋字幕..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500/50 transition-all" />
          </div>
        </div>
      )}
    </header>
  );
}
