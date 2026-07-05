export default function KeywordTags({ keywords, searchQuery, onSearchChange }) {
  if (keywords.length === 0) return null;
  return (
    <div className="px-5 pt-3 max-w-7xl mx-auto w-full">
      <div className="flex flex-wrap gap-1.5">
        {keywords.map(kw => (
          <button key={kw} onClick={() => onSearchChange(prev => prev === kw ? '' : kw)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
              searchQuery === kw
                ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                : 'bg-white/[0.03] text-gray-500 border-white/[0.06] hover:border-white/20 hover:text-gray-300'
            }`}>
            {kw}
          </button>
        ))}
      </div>
    </div>
  );
}
