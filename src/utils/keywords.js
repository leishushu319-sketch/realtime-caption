import { STOP_WORDS } from '../constants/index.js';
import { formatDuration } from './format.js';

export function extractKeywords(texts, max = 12) {
  const freq = {};
  texts.forEach(text => {
    const tokens = [];
    const cleaned = text.replace(/[^\u4e00-\u9fff\w]/g, ' ');
    for (let i = 0; i < cleaned.length; i++) {
      if (/[\u4e00-\u9fff]/.test(cleaned[i])) {
        if (i + 2 <= cleaned.length) tokens.push(cleaned.slice(i, i + 2));
        if (i + 3 <= cleaned.length) tokens.push(cleaned.slice(i, i + 3));
      }
    }
    cleaned.split(/\s+/).forEach(w => {
      const lower = w.toLowerCase();
      if (/[a-z]{2,}/.test(lower)) tokens.push(lower);
    });
    tokens.forEach(w => {
      if (w.length >= 2 && !STOP_WORDS.has(w)) freq[w] = (freq[w] || 0) + 1;
    });
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, max)
    .map(([word]) => word);
}

export function generateSummary(items) {
  if (items.length === 0) return '';
  const texts = items.map(h => h.text);
  const allText = texts.join('\n');
  const totalWords = texts.reduce((a, t) => a + t.split(/\s+/).filter(Boolean).length, 0);
  const totalChars = texts.reduce((a, t) => a + t.length, 0);
  const firstTs = items[0].timestamp;
  const lastTs = items[items.length - 1].timestamp;
  const duration = lastTs - firstTs;
  const kw = extractKeywords(texts, 15);

  const lines = [
    '═══════════════════════════════════════',
    '            📋 重點整理',
    '═══════════════════════════════════════',
    '',
    `📊 基本統計`,
    `   • 總字幕數：${items.length} 條`,
    `   • 總詞數：${totalWords} 詞`,
    `   • 總字數：${totalChars} 字`,
    `   • 錄音時長：${formatDuration(duration)}`,
    '',
  ];
  if (kw.length > 0) {
    lines.push('🏷️ 關鍵主題', ...kw.map((w, i) => `   ${i + 1}. ${w}`), '');
  }
  const sentences = allText.split(/[。！？\n]+/).filter(s => s.trim().length > 4);
  if (sentences.length > 0) {
    const freq = {};
    sentences.forEach(s => {
      const t = s.trim();
      kw.forEach(k => { if (t.includes(k)) freq[k] = (freq[k] || []).length === 0 ? [t] : [...freq[k], t]; });
    });
    const topTopics = Object.entries(freq)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5);
    if (topTopics.length > 0) {
      lines.push('📝 內容摘要');
      topTopics.forEach(([topic, sents]) => {
        lines.push(`   • ${topic}（提及 ${sents.length} 次）`);
        lines.push(`     "${sents[0].slice(0, 50)}${sents[0].length > 50 ? '…' : ''}"`);
      });
      lines.push('');
    }
  }
  lines.push('═══════════════════════════════════════');
  return lines.join('\n');
}
