export const LANGUAGES = [
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { code: 'en-US', label: 'English', flag: '🇺🇸' },
  { code: 'ja-JP', label: '日本語', flag: '🇯🇵' },
  { code: 'ko-KR', label: '한국어', flag: '🇰🇷' },
  { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es-ES', label: 'Español', flag: '🇪🇸' },
];

export const STOP_WORDS = new Set([
  '的','了','在','是','我','有','和','就','不','人','都','一','一個','上','也','很','到',
  '說','要','去','你','會','看','好','自己','這','他','她','它','們','那','為','與','對',
  '能','之','而','及','被','讓','給','從','把','沒','又','可','以','還','但','多','大',
  '小','中','下','子','所','其','嗎','吧','啊','嗯','喔','哦','呀','呢','麼',
  'the','a','an','is','are','was','were','be','been','being','have','has','had',
  'do','does','did','will','would','can','could','shall','should','may','might',
  'must','i','you','he','she','it','we','they','me','him','her','us','them',
  'my','your','his','its','our','their','this','that','these','those','am','to',
  'of','in','for','on','with','at','by','from','as','into','through','during',
  'before','after','above','below','between','and','but','or','nor','not','so',
  'yet','both','either','neither','each','every','all','any','few','more','most',
  'other','some','such','no','only','own','same','up','down','out','off','over',
  'under','again','further','then','once','here','there','when','where','why',
  'how','which','who','whom','what','if','because','than','just','about',
]);

export const STORAGE_KEYS = {
  HISTORY: 'rtc_history',
  LANG: 'rtc_lang',
  AUTO_SCROLL: 'rtc_autoScroll',
  FONT_SIZE: 'rtc_fontSize',
};
