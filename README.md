# TOiRA 危險作業風險評估及通報平台

危險作業通報平台的電腦版展示原型，使用 HTML、CSS 與 JavaScript。

- 展示網站：https://fefe9487.github.io/toira-reporting-platform/
- 常見問答：https://fefe9487.github.io/toira-reporting-platform/faq.html
- 下載專區：https://fefe9487.github.io/toira-reporting-platform/downloads.html

## 展示範圍

首頁通報說明、四步驟通報流程、風險評估資料上傳介面、TOiRA 作業評估建議、Q1–Q47 常見問答，以及通報第二步的勞檢機構特殊申報入口。

特殊申報網站維護只列出保留的機構，可新增、編輯、移除及撤銷移除；首頁不列出勞檢機構。移除特殊申報連結不會移除通報案件所需的管轄機構資料。原型設定仍保存於目前瀏覽器；正式設定須由後端共用資料庫維護。

案件狀態「待確認」表示勞檢尚未開啟資料；「已備查」表示勞檢已閱讀資料。展示流程已移除「退回」狀態，勞檢開啟案件後會更新閱讀狀態。

本專案供介面與流程展示。登入、案件資料、附件及管理功能仍為模擬或瀏覽器內的展示資料；未接上正式身分驗證、檔案儲存及主管機關通報服務。請以測試資料操作。

## 首頁操作教學影片

首頁登入區下方提供「TOiRA危險作業風險評估及通報平台 操作教學」YouTube 影片：https://youtu.be/ypbVTuK0TvY 。首頁導覽的「操作教學」可直接移至影片區。播放器採 16:9、延遲載入、不自動播放，可全螢幕觀看，並提供另開 YouTube 的連結。嵌入網址與標題維護於 `login.html` 的 `operation-tutorial` 區塊，樣式維護於 `css/login.css`。

## 本機預覽

在專案目錄啟動靜態網頁伺服器，例如：

```sh
python -m http.server 18767
```

開啟 `http://localhost:18767/`。本專案沒有建置步驟。

## 主要檔案

- `index.html`：首頁入口，轉至 `login.html`。
- `login.html`：登入封面及平台畫面。
- `dashboard.html`：平台畫面獨立入口。
- `faq.html`：常見問答，引用條文全文預設收合。
- `downloads.html`：前台下載專區；首頁與 Q&A 統一連至此頁。
- `js/data/downloads.json`：已定稿的下載文件清單，依清單順序顯示。
- `js/data/portal_config.js`：TOiRA 與地方通報入口的預設設定。
- `js/data/toira_work_catalog.js`：通報作業與 TOiRA 評估項目對照。

Q&A 內容維護於 `js/data/qa_content.json`，法條全文維護於 `js/data/qa_law_articles.json`。編輯後執行 `python scripts/render_qa.py` 產生 `faq.html`，並以 `python scripts/render_qa.py --check` 檢查同步。頁面仍為靜態 HTML，停用 JavaScript 時也能逐題閱讀及展開法條；頁首與導覽外框直接維護於 `faq.html`。

115 年 10 月 15 日依提供的 47 題 QA 編修稿及注意事項逐題核對補齊，採用可供操作手冊使用的問答文字。QA 頁面不放置編修、提供稿或原型建置狀態等註記；施行日期保留於法規依據題目及法條全文。通報的所有附件（一般附件、自行評估資料及 TOiRA 評估結果）依署內規定統一每檔 15 MB；正式後端仍須執行同一容量檢查。

## 下載文件維護

下載專區沿用靜態網站，無須登入。首頁不直接連到個別下載檔案，下載資訊集中維護於 `js/data/downloads.json`。

僅將已確認可公開的文件放入 `assets/documents/`，並在清單中新增下列資料（清單順序即顯示順序）：

```json
[
  {
    "title": "已定稿的文件名稱",
    "description": "文件用途說明",
    "updated": "115 年 10 月 13 日",
    "format": "PDF",
    "size": "256 KB",
    "file": "assets/documents/example.pdf"
  }
]
```

上例僅為格式說明，未發布示範文件。`file` 必須指向本站 `assets/documents/` 下的實際檔案；`title` 與 `file` 必填，其餘欄位可省略。名稱與說明以文字顯示，不解析為 HTML。

未定稿的「危險作業線上風險評估及通報注意事項1151008.docx」已撤下，包括首頁與 Q&A 的引用及下載連結，草稿保存在網站根目錄外。目前清單為空，顯示「目前尚無提供下載的文件」。下架文件時也應將檔案移出網站公開目錄，以停用直接下載網址。

## 資訊公司建置需求：通知郵件

正式平台須納入「通報完成通知郵件」功能：寄給填報者，並副知管轄勞動檢查機構。郵件主旨與內文須由既有「訊息範本維護」統一管理，寄信後端依範本代碼讀取及帶入案件資料。請資訊公司依[通知郵件交付文件](docs/vendor-handoff/email-notification/README.md)及[訊息範本連動規格](docs/vendor-handoff/email-notification/template-maintenance-integration.md)實作。

交付文件包含郵件版型與格式規格。Q32 說明通知內容與手動重寄的收件方式；寄件信箱與部分細節仍待核定，主系統未接入實際寄信功能。QA 採手冊用途的功能敘述，建置狀態由本文件與交付規格記錄。

案件詳情的「關閉」旁提供「下載通報完成檔案（PDF）」與「再次寄送通知」。PDF 為本次頁面中的展示資料快照，包含完整通報項目與附件清單；重寄收件者預設為目前登入者個人資料中的電子郵件，可自行修改，只寄至指定地址且不副知勞檢。重寄提供確認流程並明確標示未實際寄信，修改收件者不會改動個人資料。取消案件保留下載並停用完成通知重寄。正式平台須下載原郵件的同一份附件並由後端重寄，詳見[案件詳情操作交付規格](docs/vendor-handoff/email-notification/case-detail-actions.md)。

## GitHub Pages

Pages 從 `main` 分支的根目錄發布。`.nojekyll` 保留原本靜態檔案；更新網站後推送至 `main` 即可重新部署。

## 資料及素材

法規原文、機關名稱及連結依其來源使用；本專案所含機關識別、文件與圖片不另行授予使用授權。頁面與文案仍應於正式上線前完成機關確認。手機版未列入本次修改範圍。
