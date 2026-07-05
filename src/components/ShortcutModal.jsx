import { X } from 'lucide-react';

const SHORTCUTS = [
  { key: 'Space', desc: '開始 / 停止錄音' },
  { key: 'Esc', desc: '取消編輯' },
  { key: 'Enter', desc: '儲存編輯' },
];

export default function ShortcutModal({ show, onClose }) {
  if (!show) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-72 bg-gray-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/50 dropdown-enter">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">快捷鍵</h3>
          <button onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 transition-all">
            <X size={14} />
          </button>
        </div>
        <div className="space-y-3 text-sm">
          {SHORTCUTS.map(s => (
            <div key={s.key} className="flex items-center justify-between">
              <span className="text-gray-400">{s.desc}</span>
              <kbd className="px-2 py-1 rounded-lg bg-white/10 text-white text-xs font-mono">{s.key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
