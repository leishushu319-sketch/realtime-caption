import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Mic, MicOff, Pause } from 'lucide-react';
import { LANGUAGES, STORAGE_KEYS } from './constants/index.js';
import { formatTime } from './utils/format.js';
import { extractKeywords } from './utils/keywords.js';
import { exportSrt, exportTxt, exportJson, importJson as importJsonFile } from './utils/file.js';
import Header from './components/Header.jsx';
import CaptionItem from './components/CaptionItem.jsx';
import Controls from './components/Controls.jsx';
import Toast from './components/Toast.jsx';
import ShortcutModal from './components/ShortcutModal.jsx';
import KeywordTags from './components/KeywordTags.jsx';

export default function App() {
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]'); } catch { return []; }
  });
  const [interim, setInterim] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [supported] = useState(() => !!(window.SpeechRecognition || window.webkitSpeechRecognition));
  const [lang, setLang] = useState(() => localStorage.getItem(STORAGE_KEYS.LANG) || 'zh-TW');
  const [fullscreen, setFullscreen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(() => localStorage.getItem(STORAGE_KEYS.AUTO_SCROLL) !== 'false');
  const [recordingTime, setRecordingTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [starredOnly, setStarredOnly] = useState(false);
  const [fontSize, setFontSize] = useState(() => {
    const saved = parseInt(localStorage.getItem(STORAGE_KEYS.FONT_SIZE));
    return saved >= 11 && saved <= 24 ? saved : 15;
  });
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const isStartingRef = useRef(false);

  const addToast = useCallback((message, type = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const timerRef = useRef(null);
  const editInputRef = useRef(null);
  const userScrolledRef = useRef(false);
  const searchRef = useRef(null);
  const importRef = useRef(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LANG, lang); }, [lang]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AUTO_SCROLL, String(autoScroll)); }, [autoScroll]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.FONT_SIZE, String(fontSize)); }, [fontSize]);

  const stats = useMemo(() => ({
    words: history.reduce((a, h) => a + h.text.split(/\s+/).filter(Boolean).length, 0),
    chars: history.reduce((a, h) => a + h.text.length, 0),
  }), [history]);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1000), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused]);

  useEffect(() => {
    if (autoScroll && !userScrolledRef.current && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [history, interim, autoScroll]);

  useEffect(() => {
    if (editingId && editInputRef.current) editInputRef.current.focus();
  }, [editingId]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const handler = () => {
      const threshold = 80;
      userScrolledRef.current = el.scrollHeight - el.scrollTop - el.clientHeight > threshold;
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const { width } = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = 48 * dpr;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    recognitionRef.current?.abort();

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (e) => {
      if (isPausedRef.current) return;
      let interimText = "";
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      if (finalText) {
        setHistory(prev => {
          const last = prev[prev.length - 1];
          if (last && last.text.trim() === finalText.trim()) return prev;
          return [...prev, {
            id: crypto.randomUUID(),
            text: finalText,
            time: formatTime(),
            timestamp: Date.now(),
            starred: false,
          }];
        });
      }
      setInterim(interimText);
    };

    recognition.onend = () => {
      if (isRecordingRef.current && !isPausedRef.current) recognition.start();
    };

    recognition.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      addToast(`語音辨識錯誤: ${e.error}`, 'error');
    };

    recognitionRef.current = recognition;

    if (isRecordingRef.current && !isPausedRef.current) {
      try { recognition.start(); } catch (e) { console.warn('recognition.start in effect failed:', e); }
    }

    return () => {
      if (recognitionRef.current === recognition) {
        recognition.abort();
      }
    };
  }, [lang, addToast]);

  useEffect(() => {
    const onFS = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFS);
    return () => document.removeEventListener('fullscreenchange', onFS);
  }, []);

  const startVisualizer = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        noiseSuppression: true,
        echoCancellation: true,
        autoGainControl: true,
      },
    });
    streamRef.current = stream;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;
    const source = audioContext.createMediaStreamSource(stream);
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 2.5;
    source.connect(gainNode);
    const analyser = audioContext.createAnalyser();
    gainNode.connect(analyser);
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.85;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const NOISE_FLOOR = 0.06;

    const draw = () => {
      if (!isRecordingRef.current && !isPausedRef.current) { audioContext.close(); audioContextRef.current = null; return; }
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#06b6d4');
      gradient.addColorStop(0.3, '#8b5cf6');
      gradient.addColorStop(0.6, '#d946ef');
      gradient.addColorStop(1, '#ec4899');
      ctx.fillStyle = gradient;

      const w = canvas.width / bufferLength;
      for (let i = 0; i < bufferLength; i++) {
        const raw = dataArray[i] / 255;
        const v = raw < NOISE_FLOOR ? 0 : Math.min((raw - NOISE_FLOOR) / (1 - NOISE_FLOOR) * 1.2, 1);
        const h = v * canvas.height * 0.9;
        const x = i * w;
        const radius = w * 0.3;
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - h, w - 0.5, h, [radius, radius, 0, 0]);
        ctx.fill();
      }

      if (isRecordingRef.current || isPausedRef.current) requestAnimationFrame(draw);
    };
    draw();
  }, []);

  const startRecognition = useCallback(async () => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    isRecordingRef.current = true;
    isPausedRef.current = false;
    setIsInitializing(true);
    try {
      await startVisualizer();
      if (!recognitionRef.current) throw new Error('recognition not initialized');
      recognitionRef.current.start();
    } catch (err) {
      isRecordingRef.current = false;
      setIsRecording(false);
      recognitionRef.current?.abort();
      const msg = err.message === 'recognition not initialized' ? '語音辨識初始化失敗，請重新整理頁面'
        : err.message === 'timeout' ? '麥克風權限請求逾時，請檢查瀏覽器權限設定'
        : err.name === 'NotFoundError' ? '找不到麥克風，請確認裝置已連接且驅動程式正常'
        : '無法存取麥克風，請檢查權限設定';
      addToast(msg, 'error');
    } finally {
      setIsInitializing(false);
      isStartingRef.current = false;
    }
  }, [startVisualizer, addToast]);

  const toggle = useCallback(() => {
    if (isRecording) {
      isRecordingRef.current = false;
      isPausedRef.current = false;
      recognitionRef.current?.stop();
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      audioContextRef.current?.close();
      audioContextRef.current = null;
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      setInterim("");
    } else {
      setRecordingTime(0);
      setInterim("");
      startRecognition();
      setIsRecording(true);
      setIsPaused(false);
    }
  }, [isRecording, startRecognition]);

  const togglePause = useCallback(() => {
    if (isPaused) {
      isPausedRef.current = false;
      recognitionRef.current?.start();
      setIsPaused(false);
    } else {
      isPausedRef.current = true;
      recognitionRef.current?.stop();
      setInterim("");
      setIsPaused(true);
    }
  }, [isPaused]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.key === ' ' || e.key === 'Spacebar') && e.target === document.body) {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape' && editingId) {
        setEditingId(null);
        setEditText("");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle, editingId]);

  const [dragIndex, setDragIndex] = useState(null);

  const deleteEntry = useCallback((id) => setHistory(prev => prev.filter(h => h.id !== id)), []);
  const toggleStar = useCallback((id) => setHistory(prev => prev.map(h =>
    h.id === id ? { ...h, starred: !h.starred } : h
  )), []);
  const startEdit = useCallback((id, text) => { setEditingId(id); setEditText(text); }, []);
  const saveEdit = useCallback((id) => {
    setHistory(prev => prev.map(h => h.id === id ? { ...h, text: editText } : h));
    setEditingId(null);
    setEditText("");
  }, [editText]);

  const clearAll = useCallback(() => {
    if (history.length === 0) return;
    setHistory([]);
    setInterim("");
    addToast('已清除所有字幕', 'info');
  }, [history.length, addToast]);

  const resetAll = useCallback(() => {
    setHistory([]);
    setInterim("");
    setLang('zh-TW');
    setFontSize(15);
    setAutoScroll(true);
    setSearchQuery('');
    setStarredOnly(false);
    addToast('已重置所有設定', 'info');
  }, [addToast]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);

  const filteredHistory = useMemo(() => history.filter(h => {
    if (starredOnly && !h.starred) return false;
    if (searchQuery && !h.text.includes(searchQuery)) return false;
    return true;
  }), [history, starredOnly, searchQuery]);

  const keywords = useMemo(() => {
    if (history.length < 2) return [];
    return extractKeywords(history.map(h => h.text));
  }, [history]);

  const handleDrop = useCallback((targetIdx) => {
    setHistory(prev => {
      const ids = filteredHistory.map(h => h.id);
      const from = prev.findIndex(h => h.id === ids[dragIndex]);
      const to = prev.findIndex(h => h.id === ids[targetIdx]);
      if (from === -1 || to === -1) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
    setDragIndex(null);
  }, [dragIndex, filteredHistory]);

  if (!supported) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_#0a0a0f,_#000000)] flex items-center justify-center">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <MicOff size={28} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">瀏覽器不支援</h2>
          <p className="text-gray-400 mb-6">語音辨識需要 Chrome 或 Edge 瀏覽器</p>
          <a href="https://google.com/chrome" target="_blank" rel="noreferrer"
             className="inline-block px-6 py-3 bg-white/10 hover:bg-white/15 rounded-xl text-white transition-all">
            下載 Chrome
          </a>
        </div>
      </div>
    );
  }

  const hasStarred = history.some(h => h.starred);

  return (
    <div ref={containerRef}
      className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_#0c0c14,_#000000)] text-white flex flex-col font-sans selection:bg-violet-500/30">

      <Header
        isRecording={isRecording}
        isPaused={isPaused}
        recordingTime={recordingTime}
        hasHistory={history.length > 0}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        lang={lang}
        onLangChange={setLang}
        fullscreen={fullscreen}
        onToggleFullscreen={toggleFullscreen}
        searchRef={searchRef}
      />

      <div className="relative px-5 pt-4 max-w-7xl mx-auto w-full">
        <canvas ref={canvasRef}
          className="w-full h-12 rounded-2xl bg-black/40 border border-white/5" />
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/20 backdrop-blur-[2px]">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/20 text-amber-300 text-xs font-medium">
              <Pause size={12} /> 已暫停
            </div>
          </div>
        )}
      </div>

      <KeywordTags
        keywords={keywords}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div ref={listRef}
        className="flex-1 overflow-y-auto px-5 py-4 max-w-7xl mx-auto w-full space-y-2"
        style={{ scrollBehavior: 'smooth', fontSize: `${fontSize}px` }}>
        {isRecording && history.length === 0 && !interim && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
              <svg className="animate-pulse" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="9" width="4" height="12" rx="2" fill="#34d399" opacity="0.4" />
                <rect x="10" y="6" width="4" height="15" rx="2" fill="#34d399" opacity="0.6" />
                <rect x="14" y="8" width="4" height="13" rx="2" fill="#34d399" />
              </svg>
            </div>
            <h3 className="text-base font-medium text-gray-300 mb-1">正在聆聽...</h3>
            <p className="text-xs text-gray-500">請對著麥克風說話</p>
          </div>
        )}

        {!isRecording && filteredHistory.length === 0 && !interim && (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 via-violet-500/20 to-pink-500/20 flex items-center justify-center mb-6 border border-white/5">
              <Mic size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">按下麥克風開始辨識</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              支援 {LANGUAGES.length} 種語言 · 按空白鍵快速切換
            </p>
          </div>
        )}

        {filteredHistory.map((item, idx) => (
          <CaptionItem
            key={item.id}
            item={item}
            idx={idx}
            dragIndex={dragIndex}
            editingId={editingId}
            editText={editText}
            onToggleStar={toggleStar}
            onStartEdit={startEdit}
            onSaveEdit={saveEdit}
            onDeleteEntry={deleteEntry}
            onSetEditText={setEditText}
            onCancelEdit={() => { setEditingId(null); setEditText(""); }}
            onDragStart={setDragIndex}
            onDrop={handleDrop}
            onDragEnd={() => setDragIndex(null)}
            editInputRef={editInputRef}
          />
        ))}

        {interim && (
          <div className="bg-gradient-to-r from-violet-500/5 to-pink-500/5 border border-violet-500/10 rounded-2xl px-5 py-4">
            <div className="flex gap-3">
              <span className="text-xs font-mono text-violet-400 mt-1 shrink-0">[即時]</span>
              <span className="leading-relaxed text-gray-400 italic">{interim}</span>
            </div>
          </div>
        )}
      </div>

      <Controls
        isRecording={isRecording}
        isPaused={isPaused}
        isInitializing={isInitializing}
        history={history}
        stats={stats}
        recordingTime={recordingTime}
        fontSize={fontSize}
        autoScroll={autoScroll}
        starredOnly={starredOnly}
        hasStarred={hasStarred}
        onToggle={toggle}
        onTogglePause={togglePause}
        onSetFontSize={setFontSize}
        onSetAutoScroll={setAutoScroll}
        onSetStarredOnly={setStarredOnly}
        onSetShowShortcuts={setShowShortcuts}
        onExportSrt={() => exportSrt(history)}
        onExportTxt={() => exportTxt(history)}
        onExportJson={() => exportJson(history)}
        onImportJson={() => importRef.current?.click()}
        importRef={importRef}
        onCopyAll={() => {
          const text = history.map(h => `[${h.time}] ${h.text}`).join('\n');
          navigator.clipboard?.writeText(text).then(() => addToast('已複製到剪貼簿', 'info'));
        }}
        onClearAll={clearAll}
        onResetAll={resetAll}
        handleImport={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            const data = await importJsonFile(file);
            setHistory(data);
            addToast(`已匯入 ${data.length} 條字幕`, 'info');
          } catch {
            addToast('匯入失敗，檔案格式不正確', 'error');
          }
          e.target.value = '';
        }}
      />

      <ShortcutModal
        show={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      <Toast toasts={toasts} />
    </div>
  );
}
