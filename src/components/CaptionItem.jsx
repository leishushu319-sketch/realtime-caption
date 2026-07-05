import { Star, Edit3, X, Check } from 'lucide-react';

export default function CaptionItem({
  item, idx, dragIndex,
  editingId, editText,
  onToggleStar, onStartEdit, onSaveEdit,
  onDeleteEntry, onSetEditText, onCancelEdit,
  onDragStart, onDrop, onDragEnd,
  editInputRef,
}) {
  return (
    <div draggable={!editingId}
      onDragStart={() => onDragStart(idx)}
      onDragOver={(e) => { if (dragIndex !== null) e.preventDefault(); }}
      onDrop={() => {
        if (dragIndex === null || dragIndex === idx) { onDragEnd(); return; }
        onDrop(idx);
      }}
      onDragEnd={onDragEnd}
      className={`group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl px-5 py-4 transition-all duration-300 animate-in ${
        dragIndex === idx ? 'opacity-50 border-violet-500/30' : ''
      }`}>
      <div className="flex items-start gap-3">
        <button onClick={() => onToggleStar(item.id)}
          className={`mt-0.5 shrink-0 transition-all ${item.starred ? 'text-amber-400' : 'text-gray-600 opacity-0 group-hover:opacity-100'}`}
          aria-label={item.starred ? '取消星號' : '標記星號'}>
          <Star size={14} fill={item.starred ? 'currentColor' : 'none'} />
        </button>

        <div className="flex-1 min-w-0">
          {editingId === item.id ? (
            <div className="flex gap-2">
              <input ref={editInputRef} value={editText} onChange={e => onSetEditText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSaveEdit(item.id)}
                className="flex-1 bg-black/40 border border-violet-500/30 rounded-xl px-4 py-2 text-white outline-none" />
              <button onClick={() => onSaveEdit(item.id)}
                className="p-2 bg-violet-500/20 rounded-xl text-violet-300 hover:bg-violet-500/30 transition-all">
                <Check size={16} />
              </button>
              <button onClick={onCancelEdit}
                className="p-2 bg-white/5 rounded-xl text-gray-400 hover:bg-white/10 transition-all">
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2 cursor-pointer" onClick={() => onStartEdit(item.id, item.text)}>
                <span className="text-xs font-mono text-gray-500 mt-1 shrink-0">[{item.time}]</span>
                <span className="leading-relaxed text-gray-100">{item.text}</span>
              </div>
              <div className="text-[10px] text-gray-600 mt-1 ml-[3.8rem] font-mono">
                {item.text.length}字 · {item.text.split(/\s+/).filter(Boolean).length}詞
              </div>
            </>
          )}
        </div>

        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={() => onStartEdit(item.id, item.text)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            aria-label="編輯字幕">
            <Edit3 size={13} />
          </button>
          <button onClick={() => onDeleteEntry(item.id)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
            aria-label="刪除字幕">
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
