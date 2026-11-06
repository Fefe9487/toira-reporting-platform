/* 案件詳情：通報完成檔案與通知重寄展示。正式郵件服務需求見 vendor-handoff。 */
(function () {
  'use strict';

  function createHazardCompletionNotice(data, previousVersion = 0) {
    const { completionNotice, completionNoticeHistory, ...report } = data;
    const version = previousVersion + 1;
    const catalog = inspectionCaseCatalog.find(row => row.id === data.caseNo);
    return {
      version,
      recipient: data.email?.trim() || '',
      submittedAt: data.submittedAt || data.reportDate || catalog?.submitDate || '未提供',
      filename: getHazardReportFilename(data.caseNo, version),
      document: buildHazardReportDocument(report, version),
      report: JSON.parse(JSON.stringify(report))
    };
  }

  function ensureHazardCompletionNotice(data) {
    // 已存在案件沒有原始郵件附件；首次檢視只建立展示快照，不宣稱是原寄送檔案。
    if (!data.completionNotice) data.completionNotice = createHazardCompletionNotice(data);
    const notice = data.completionNotice;
    if (!notice.document) {
      notice.document = buildHazardReportDocument(notice.report, notice.version);
      // Older snapshots keep their original attachment name.
      notice.document.mailFiles[0].filename = notice.filename;
      notice.document.sections.find(section => section.id === 'notification').fields.find(field => field.key === 'mailFiles').values = [notice.filename];
    }
    return notice;
  }

  function getHazardCompletionActionsHtml(data) {
    const cancelled = data.status === '取消';
    return `<button class="btn-completion-download" type="button" onclick="downloadHazardCompletion(this)">下載通報完成檔案（PDF）</button>
      <button class="btn-completion-resend" type="button" onclick="toggleHazardResend(this, true)" aria-expanded="false" aria-controls="caseResendPanel"${cancelled ? ' disabled aria-describedby="caseCompletionNote"' : ''}>再次寄送通知</button>`;
  }

  function getHazardCompletionPanelHtml(data) {
    const notice = ensureHazardCompletionNotice(data);
    const defaultRecipient = roleMenuData[window.currentRole]?.email || '';
    return `<p id="caseCompletionNote" class="completion-action-note">${data.status === '取消' ? '案件已取消，仍可下載通報資料；不再寄送通報完成通知。' : 'PDF 為展示案件資料；目前未啟用電子郵件寄送服務。'}</p>
      <section id="caseResendPanel" class="case-resend-panel" aria-labelledby="caseResendTitle" hidden>
        <h3 id="caseResendTitle">確認再次寄送通知</h3>
        <form onsubmit="event.preventDefault(); confirmHazardResend(this)">
        <dl>
          <div><dt>案件編號</dt><dd>${portalEscape(data.caseNo)}</dd></div>
          <div><dt><label for="caseResendRecipient">收件者</label></dt><dd>
            <input type="email" class="v-input" id="caseResendRecipient" name="recipient" value="${portalEscape(defaultRecipient)}" required maxlength="254" autocomplete="email" placeholder="請輸入收件者電子郵件" aria-describedby="caseResendRecipientHelp">
            <small id="caseResendRecipientHelp">預設為個人資料的電子信箱，可修改本次收件地址。</small>
          </dd></div>
          <div><dt>隨信附件</dt><dd>${portalEscape(notice.filename)}</dd></div>
        </dl>
        <p>重寄僅寄送至上方指定的收件者，不副知勞檢機構。目前為展示流程，不會寄出電子郵件。</p>
        <div class="case-resend-actions">
          <button type="button" class="v-btn v-btn-cancel" onclick="toggleHazardResend(this, false)">取消重寄</button>
          <button type="submit" class="v-btn v-btn-primary">確認重寄（展示）</button>
        </div>
        </form>
      </section>
      <p class="completion-action-status" role="status" aria-live="polite"></p>`;
  }

  function caseContext(button) {
    const container = button.closest('.case-detail-container');
    const caseNo = container?.dataset.caseNo;
    const data = Object.prototype.hasOwnProperty.call(DEMO_HAZARD_CASES, caseNo) ? DEMO_HAZARD_CASES[caseNo] : null;
    if (!data) throw new Error('找不到案件，請關閉視窗後重新查詢。');
    return { container, data, notice: ensureHazardCompletionNotice(data) };
  }

  function showStatus(container, text, error = false) {
    if (!container?.isConnected) return;
    const status = container.querySelector('.completion-action-status');
    status.textContent = text;
    status.classList.toggle('is-error', error);
  }

  function toggleHazardResend(button, open) {
    const { container, data } = caseContext(button);
    if (open && data.status === '取消') return;
    const panel = container.querySelector('#caseResendPanel');
    const trigger = container.querySelector('.btn-completion-resend');
    panel.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
    if (open) {
      showStatus(container, '');
      panel.querySelector('input').focus();
    } else trigger.focus();
  }

  function confirmHazardResend(button) {
    const { container, data } = caseContext(button);
    if (data.status === '取消') {
      showStatus(container, '案件已取消，無法再次寄送通報完成通知。', true);
      return;
    }
    const recipientInput = container.querySelector('#caseResendRecipient');
    recipientInput.value = recipientInput.value.trim();
    if (!recipientInput.reportValidity()) return;
    const recipient = recipientInput.value;
    toggleHazardResend(button, false);
    showStatus(container, `重寄確認展示已完成。收件者：${recipient}。目前未啟用寄信服務，未寄出電子郵件。`);
  }

  // 使用瀏覽器中文字型繪製 A4 頁面，再封裝為 PDF；不需外部字型或 CDN。
  // 展示 PDF 為影像頁面；正式平台須保存可搜尋、可存取的原始郵件附件。
  function buildCompletionPdf(notice) {
    const width = 1240, height = 1754, margin = 78, lineHeight = 34;
    const pages = [];
    const doc = notice.document || buildHazardReportDocument(notice.report, notice.version);
    let canvas, ctx, y;
    function page() {
      canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
      ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('無法建立 PDF，請使用支援檔案下載的瀏覽器再試一次。');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#173e55'; ctx.fillRect(0, 0, width, 102);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 34px "Microsoft JhengHei", sans-serif';
      ctx.fillText('危險作業通報資料', margin, 65);
      ctx.fillStyle = '#425b6a'; ctx.font = '22px "Microsoft JhengHei", sans-serif';
      ctx.fillText(`${doc.caseNo}   /   第 ${doc.version} 版`, margin, 143);
      ctx.font = '20px "Microsoft JhengHei", sans-serif';
      ctx.fillText(`通報時間：${notice.submittedAt}（臺灣時間）`, margin, 177);
      ctx.strokeStyle = '#dce5ea'; ctx.beginPath(); ctx.moveTo(margin, height-100); ctx.lineTo(width-margin, height-100); ctx.stroke();
      ctx.fillStyle = '#657984'; ctx.font = '19px "Microsoft JhengHei", sans-serif';
      ctx.fillText('危險作業風險評估及通報平台  /  展示資料，未寄送電子郵件', margin, height-60);
      ctx.textAlign = 'right'; ctx.fillText(`第 ${pages.length+1} 頁`, width-margin, height-60); ctx.textAlign = 'left';
      pages.push(canvas); y = 212;
    }
    function wrap(value, maxWidth, font) {
      ctx.font = font;
      const lines = [];
      for (const part of String(value).split(/\r?\n/)) {
        let line = '';
        for (const char of part) {
          if (line && ctx.measureText(line+char).width > maxWidth) { lines.push(line); line = ''; }
          line += char;
        }
        lines.push(line);
      }
      return lines;
    }
    function row(label, value) {
      const labelWidth = 245, totalWidth = width-margin*2;
      const labelFont = 'bold 22px "Microsoft JhengHei", sans-serif';
      const valueFont = '24px "Microsoft JhengHei", sans-serif';
      const labels = wrap(label, labelWidth-30, labelFont);
      const values = wrap(value, totalWidth-labelWidth-38, valueFont);
      let index = 0;
      const count = Math.max(labels.length, values.length);
      while (index < count) {
        let room = Math.floor((height-122-y-24)/lineHeight);
        if (room < 2) { page(); room = Math.floor((height-122-y-24)/lineHeight); }
        const length = Math.min(room, count-index), rowHeight = length*lineHeight+24;
        ctx.fillStyle = '#f5f8fa'; ctx.fillRect(margin, y, labelWidth, rowHeight);
        ctx.strokeStyle = '#dce5ea'; ctx.strokeRect(margin, y, totalWidth, rowHeight);
        for (let n=0;n<length;n++) {
          const line = index+n, baseline=y+34+n*lineHeight;
          ctx.fillStyle='#506775'; ctx.font=labelFont;
          if (labels[line]) ctx.fillText(labels[line], margin+15, baseline);
          else if (n===0 && index) ctx.fillText('（續）', margin+15, baseline);
          ctx.fillStyle='#223b4a'; ctx.font=valueFont;
          if (values[line]) ctx.fillText(values[line], margin+labelWidth+18, baseline);
        }
        y += rowHeight; index += length;
      }
    }
    page();
    doc.sections.forEach((section,index) => {
      if (y+145 > height-122) page();
      y += 18;
      ctx.fillStyle='#eaf1f5'; ctx.fillRect(margin,y,width-margin*2,52);
      ctx.fillStyle='#284f65'; ctx.font='bold 27px "Microsoft JhengHei", sans-serif';
      ctx.fillText(`${String(index+1).padStart(2,'0')}  ${section.title}`,margin+16,y+35);
      y += 52;
      section.fields.forEach(field => row(field.label, field.values ? (field.values.length ? field.values.map((value,i)=>`${i+1}. ${value}`).join('\n') : field.empty) : field.value));
    });

    const encoder = new TextEncoder();
    const chunks = [], offsets = [0];
    let length = 0;
    const append = value => {
      const bytes = typeof value === 'string' ? encoder.encode(value) : value;
      chunks.push(bytes);
      length += bytes.length;
    };
    const object = (id, contents) => {
      offsets[id] = length;
      append(`${id} 0 obj\n${contents}\nendobj\n`);
    };
    append('%PDF-1.4\n');
    object(1, '<< /Type /Catalog /Pages 2 0 R >>');
    object(2, `<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_, i) => `${3 + i * 3} 0 R`).join(' ')}] >>`);
    pages.forEach((pageCanvas, index) => {
      const id = 3 + index * 3;
      object(id, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Image ${id + 1} 0 R >> >> /Contents ${id + 2} 0 R >>`);
      const jpeg = Uint8Array.from(atob(pageCanvas.toDataURL('image/jpeg', 0.94).split(',')[1]), char => char.charCodeAt(0));
      offsets[id + 1] = length;
      append(`${id + 1} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
      append(jpeg);
      append('\nendstream\nendobj\n');
      const commands = 'q 595.28 0 0 841.89 0 0 cm /Image Do Q\n';
      object(id + 2, `<< /Length ${commands.length} >>\nstream\n${commands}endstream`);
    });
    const xref = length;
    append(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
    for (let i = 1; i < offsets.length; i++) append(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
    append(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    return new Blob(chunks, { type: 'application/pdf' });
  }

  const completionPdfCache = new WeakMap();
  function saveCompletionPdf(notice) {
    let blob = completionPdfCache.get(notice);
    if (!blob) { blob = buildCompletionPdf(notice); completionPdfCache.set(notice,blob); }
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = notice.filename.replace(/[\\/:*?"<>|\x00-\x1f]/g, '_');
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  async function downloadHazardCompletion(button) {
    if (button.disabled) return;
    const container = button.closest('.case-detail-container'), originalText = button.textContent;
    button.disabled = true; button.textContent = '正在產生 PDF…';
    try {
      const {notice} = caseContext(button);
      await document.fonts.ready; saveCompletionPdf(notice);
      showStatus(container,'通報資料 PDF 已產生，請查看瀏覽器下載項目。');
    } catch (error) {
      console.error('通報資料下載失敗',error);
      showStatus(container,'下載失敗，請再試一次；若持續失敗，請聯絡平台服務人員。',true);
    } finally { button.disabled=false; button.textContent=originalText; }
  }
  async function downloadHazardReviewPdf(button) {
    if (button.disabled || !validateHhNotificationEmail()) return;
    const originalText=button.textContent, status=document.getElementById('hhReviewPdfStatus');
    button.disabled=true; button.textContent='正在產生 PDF…';
    try {
      const {data,version}=getHhReviewReportData();
      const notice=createHazardCompletionNotice(data,version-1);
      notice.submittedAt='送出前預覽';
      await document.fonts.ready; saveCompletionPdf(notice);
      status.textContent='已下載本頁資料的 PDF 預覽；目前尚未送出通報。';
    } catch(error) { console.error(error); status.textContent='PDF 預覽產生失敗，請再試一次。'; }
    finally { button.disabled=false; button.textContent=originalText; }
  }

  Object.assign(window, { createHazardCompletionNotice, ensureHazardCompletionNotice, getHazardCompletionActionsHtml, getHazardCompletionPanelHtml, downloadHazardCompletion, downloadHazardReviewPdf, toggleHazardResend, confirmHazardResend });
})();
