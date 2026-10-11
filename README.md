# TOiRA 危險作業風險評估及通報平台

危險作業通報平台的電腦版展示原型，使用 HTML、CSS 與 JavaScript。

- 展示網站：https://fefe9487.github.io/toira-reporting-platform/
- 常見問答：https://fefe9487.github.io/toira-reporting-platform/faq.html

## 展示範圍

首頁通報說明、四步驟通報流程、風險評估資料上傳介面、TOiRA 作業評估建議、Q1–Q31 常見問答，以及各勞動檢查機構通報入口。

案件狀態「待確認」表示勞檢尚未開啟資料；「已備查」表示勞檢已閱讀資料。展示流程已移除「退回」狀態，勞檢開啟案件後會更新閱讀狀態。

本專案供介面與流程展示。登入、案件資料、附件及管理功能仍為模擬或瀏覽器內的展示資料；未接上正式身分驗證、檔案儲存及主管機關通報服務。請以測試資料操作。

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
- `js/data/portal_config.js`：TOiRA 與地方通報入口的預設設定。
- `js/data/toira_work_catalog.js`：通報作業與 TOiRA 評估項目對照。

Q&A 的實際畫面內容位於 `faq.html`；`js/data/qa_content.json` 與 `js/data/qa_law_articles.json` 是交付用資料快照，單獨編輯 JSON 不會自動更新畫面。

## 資訊公司建置需求：通知郵件

正式平台須納入「通報完成通知郵件」功能：寄給填報者，並副知管轄勞動檢查機構。請資訊公司依[通知郵件交付文件](docs/vendor-handoff/email-notification/README.md)評估及實作後端寄送、通報資料 PDF、管轄機構收件設定與寄送紀錄。

交付文件包含郵件版型、格式規格及 Q32 草稿。寄件信箱與部分細節尚待核定；目前主系統未接入實際寄信功能，Q32 亦未登錄至公開 Q&A。

## GitHub Pages

Pages 從 `main` 分支的根目錄發布。`.nojekyll` 保留原本靜態檔案；更新網站後推送至 `main` 即可重新部署。

## 資料及素材

法規原文、機關名稱及連結依其來源使用；本專案所含機關識別、文件與圖片不另行授予使用授權。頁面與文案仍應於正式上線前完成機關確認。手機版未列入本次修改範圍。
