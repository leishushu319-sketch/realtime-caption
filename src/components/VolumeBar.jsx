export default function VolumeBar({ level }) {
  const pct = Math.max(0, Math.min(100, Math.round(level)));
  return (
    <div className="flex items-center gap-3 px-5 pt-3 max-w-7xl mx-auto w-full select-none">
      <span className="text-[10px] text-gray-500 shrink-0">音量</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-100 ease-linear"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg,#06b6d4,#8b5cf6,#ec4899)',
          }}
        />
      </div>
      <span className="text-[10px] text-gray-500 font-mono tabular-nums w-8 text-right shrink-0">
        {pct}%
      </span>
    </div>
  );
}