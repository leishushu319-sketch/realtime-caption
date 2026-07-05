import {
  Mic, MicOff, Play, Pause, Download, Copy, Trash2,
  FileText, Type, Clock, ScrollText, Star,
  HelpCircle, Plus, Minus, RotateCcw,
} from 'lucide-react';
import { formatDuration } from '../utils/format.js';

export default function Controls({
  isRecording, isPaused, isInitializing,
  history, stats, recordingTime,
  fontSize, autoScroll, starredOnly,
  hasStarred,
  onToggle, onTogglePause,
  onSetFontSize,
  onSetAutoScroll,
  onSetStarredOnly, onSetShowShortcuts,
  onExportSrt, onExportTxt, onExportJson,
  onImportJson, importRef, onCopyAll,
  onClearAll, onResetAll, handleImport,
}) {
  return (
    <footer className="sticky bottom-0 backdrop-blur-2xl bg-black/60 border-t border-white/5">
      <div className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-5 sm:py-3 max-w-7xl mx-auto w-full flex-wrap">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 rounded-2xl p-1 border sm:p-1.5 sm:border border-white/5 shrink-0">
          <button onClick={onToggle} disabled={isInitializing}
            className={`p-3 sm:p-3 rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center ${
              isRecording
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 shadow-lg shadow-red-500/10'
                : isInitializing
                  ? 'bg-gray-500/20 text-gray-400'
                  : 'bg-gradient-to-br from-cyan-500 to-violet-500 text-white hover:shadow-lg hover:shadow-violet-500/25'
            }`}
            aria-label={isRecording ? '停止錄音' : (isInitializing ? '初始化中' : '開始錄音')}>
            {isInitializing ? (
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" opacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            ) : isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          {isRecording && (
            <button onClick={onTogglePause}
              className={`p-3 rounded-xl transition-all min-w-[44px] min-h-[44px] flex items-center justify-center ${
                isPaused
                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
              }`}
              aria-label={isPaused ? '繼續錄音' : '暫停錄音'}>
              {isPaused ? <Play size={20} /> : <Pause size={20} />}
            </button>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-white/[0.03] rounded-xl border border-white/5 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <Type size={13} className="text-cyan-400" />
            <span>{stats.words} 詞</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText size={13} className="text-violet-400" />
            <span>{stats.chars} 字</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-pink-400" />
            <span>{formatDuration(recordingTime)}</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 px-2 py-2 bg-white/[0.03] rounded-xl border border-white/5">
          <button onClick={() => onSetFontSize(s => Math.max(11, s - 1))}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 transition-all"
            aria-label="縮小字型">
            <Minus size={14} />
          </button>
          <span className="text-xs text-gray-400 w-7 text-center tabular-nums">{fontSize}</span>
          <button onClick={() => onSetFontSize(s => Math.min(24, s + 1))}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 transition-all"
            aria-label="放大字型">
            <Plus size={14} />
          </button>
        </div>

        <div className="flex-1 min-w-0" />

        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar [-webkit-overflow-scrolling:touch]">
          <button onClick={() => { onSetAutoScroll(s => !s); }}
            className={`p-2 sm:p-2 rounded-xl transition-all min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center shrink-0 ${
              autoScroll ? 'bg-violet-500/20 text-violet-300' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`} aria-label={autoScroll ? '關閉自動捲動' : '開啟自動捲動'}>
            <ScrollText size={16} />
          </button>

          {hasStarred && (
            <button onClick={() => onSetStarredOnly(s => !s)}
              className={`p-2 sm:p-2 rounded-xl transition-all min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center shrink-0 ${
                starredOnly ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`} aria-label={starredOnly ? '顯示全部' : '僅顯示星號'}>
              <Star size={16} fill={starredOnly ? 'currentColor' : 'none'} />
            </button>
          )}

          <button onClick={() => onSetShowShortcuts(s => !s)}
            className="p-2 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center shrink-0"
            aria-label="快捷鍵說明">
            <HelpCircle size={16} />
          </button>

          <div className="w-px h-6 bg-white/10 mx-0.5 sm:mx-1 shrink-0" />

          <button onClick={onExportJson} disabled={history.length === 0}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center shrink-0" aria-label="匯出 JSON 備份">
            JSON
          </button>
          <button onClick={onImportJson}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all text-xs font-medium min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center shrink-0" aria-label="匯入 JSON 備份">
            <Download size={14} className="rotate-180" />
          </button>
          <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

          <button onClick={onCopyAll} disabled={history.length === 0}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center shrink-0" aria-label="複製全部">
            <Copy size={16} />
          </button>
          <button onClick={onExportTxt} disabled={history.length === 0}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center shrink-0" aria-label="匯出 TXT">
            <Download size={16} />
          </button>
          <button onClick={onExportSrt} disabled={history.length === 0}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center shrink-0" aria-label="匯出 SRT 字幕">
            SRT
          </button>
          <button onClick={onClearAll} disabled={history.length === 0}
            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center shrink-0" aria-label="清除全部">
            <Trash2 size={16} />
          </button>
          <button onClick={onResetAll}
            className="p-2 rounded-xl bg-white/5 hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 transition-all min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center shrink-0" aria-label="重置所有設定">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="px-5 pb-2 text-center text-[10px] text-gray-600/50 tracking-wide hidden sm:block">
        Space = 開始/停止  ·  Enter = 編輯完成  ·  Esc = 取消編輯  ·  Ctrl+F = 搜尋
      </div>
    </footer>
  );
}
