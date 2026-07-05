import { generateSummary } from './keywords.js';

export function downloadFile(filename, content, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSrt(history) {
  let srt = '';
  history.forEach((h, i) => {
    const start = new Date(h.timestamp);
    const end = i < history.length - 1
      ? new Date(history[i + 1].timestamp)
      : new Date(h.timestamp + 3000);
    const fmt = (d) =>
      `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')},${String(d.getMilliseconds()).padStart(3, '0')}`;
    srt += `${i + 1}\n${fmt(start)} --> ${fmt(end)}\n${h.text}\n\n`;
  });
  downloadFile(`字幕_${new Date().toISOString().slice(0, 10)}.srt`, srt);
}

export function exportTxt(history) {
  const summary = generateSummary(history);
  const text = history.map(h => `[${h.time}] ${h.text}`).join('\n') + '\n\n' + summary;
  downloadFile(`字幕_${new Date().toISOString().slice(0, 10)}.txt`, text);
}

export function exportJson(history) {
  downloadFile(
    `字幕備份_${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(history, null, 2),
    'application/json'
  );
}

export function importJson(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) throw new Error();
        resolve(data);
      } catch {
        reject(new Error('匯入失敗，檔案格式不正確'));
      }
    };
    reader.onerror = () => reject(new Error('讀取檔案失敗'));
    reader.readAsText(file);
  });
}
