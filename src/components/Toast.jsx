export default function Toast({ toasts }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl backdrop-blur-2xl border text-sm shadow-2xl shadow-black/30 animate-in ${
            t.type === 'error'
              ? 'bg-red-500/20 border-red-500/30 text-red-200'
              : 'bg-gray-800/90 border-white/10 text-gray-200'
          }`}>
          <span>{t.message}</span>
          {t.action && (
            <button onClick={() => t.action()}
              className="shrink-0 px-3 py-1 rounded-lg bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 text-xs font-medium transition-all">
              {t.actionLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
