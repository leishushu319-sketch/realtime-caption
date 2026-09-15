# Caption Pro — 即時語音字幕

使用 Web Speech API 的即時語音辨識字幕工具，支援多國語言、字幕編輯、關鍵字標籤與多種匯出格式。PWA，可安裝、可離線使用。

## 功能

- 即時語音辨識（Chrome / Edge），支援 8 種語言切換
- 字幕清單：星號標記、就地編輯、刪除、拖曳排序
- 錄音中音訊視覺化、暫停 / 繼續、計時器
- 搜尋字幕、關鍵字標籤篩選、僅顯示星號
- 自動捲動、字型大小調整、全螢幕
- 匯出 SRT / TXT（含重點整理）/ JSON，匯入 JSON（可用拖放式）
- 復原機制：刪除 / 清除 / 重置 / 匯入皆可按「復原」或 `Ctrl+Z`
- 資料存於 localStorage，可離線使用（Service Worker）

## 快捷鍵

| 按鍵      | 功能             |
| --------- | ---------------- |
| `Space`   | 開始 / 停止錄音  |
| `Esc`     | 取消編輯         |
| `Enter`   | 儲存編輯         |
| `Ctrl+F`  | 搜尋字幕         |
| `Ctrl+Z`  | 復原刪除 / 清除  |

## 開發

```bash
npm install
npm run dev       # 本地開發
npm run lint      # ESLint
npm run build     # 產出 dist/
npm run preview   # 預覽 build 結果
```

## 部署

推送到 `main` 分支即觸發 GitHub Actions（`.github/workflows/deploy.yml`）自動建置並部署到 GitHub Pages：

```bash
git push origin main
```

線上位置：https://leishushu319-sketch.github.io/realtime-caption/

注意事項：

- Pages 來源已設為 **GitHub Actions**（`build_type: workflow`），僅接受 workflow 產出的部署，請勿改回「Deploy from a branch」。
- `github-pages` 環境的部署分支保護規則需允許 `main`（目前已設定），否則 workflow 會被環境規則拒絕。
- PWA 為 `autoUpdate`，使用者下次開啟時會自動取得新版。