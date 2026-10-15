/* 案件詳情：通報完成檔案與通知重寄展示。正式郵件服務需求見 vendor-handoff。 */
(function () {
  'use strict';

  function createHazardCompletionNotice(data, previousVersion = 0) {
    const { completionNotice, ...report } = data;
    const version = previousVersion + 1;
    const catalog = inspectionCaseCatalog.find(row => row.id === data.caseNo);
    return {
      version,
      submittedAt: data.submittedAt || data.reportDate || catalog?.submitDate || '未提供',
      filename: `${data.caseNo}_通報完成資料_第${version}版_展示.pdf`,
      report: JSON.parse(JSON.stringify(report))
    };
  }

  function ensureHazardCompletionNotice(data) {
    // 已存在案件沒有原始郵件附件；首次檢視只建立展示快照，不宣稱是原寄送檔案。
    if (!data.completionNotice) data.completionNotice = createHazardCompletionNotice(data);
    return data.completionNotice;
  }

  function getHazardCompletionActionsHtml(data) {
    const cancelled = data.status === '取消';
    return `<button class="btn-completion-download" type="button" onclick="downloadHazardCompletion(this)">下載通報完成檔案（PDF）</button>
      <button class="btn-completion-resend" type="button" onclick="toggleHazardResend(this, true)" aria-expanded="false" aria-controls="caseResendPanel"${cancelled ? ' disabled aria-describedby="caseCompletionNote"' : ''}>再次寄送通知</button>`;
  }

  function getHazardCompletionPanelHtml(data) {
    const notice = ensureHazardCompletionNotice(data);
    return `<p id="caseCompletionNote" class="completion-action-note">${data.status === '取消' ? '案件已取消，仍可下載通報資料；不再寄送通報完成通知。' : 'PDF 為展示案件資料；目前未啟用電子郵件寄送服務。'}</p>
      <section id="caseResendPanel" class="case-resend-panel" aria-labelledby="caseResendTitle" hidden>
        <h3 id="caseResendTitle">確認再次寄送通知</h3>
        <dl>
          <div><dt>案件編號</dt><dd>${portalEscape(data.caseNo)}</dd></div>
          <div><dt>收件者</dt><dd>${portalEscape(notice.report.email || '填報者登錄信箱（展示案件未提供）')}</dd></div>
          <div><dt>副本</dt><dd>${portalEscape(notice.report.adminOffice || '管轄勞動檢查機構')}指定信箱（正式平台帶入）</dd></div>
          <div><dt>隨信附件</dt><dd>${portalEscape(notice.filename)}</dd></div>
        </dl>
        <p>目前僅展示重寄確認流程，不會寄出電子郵件。正式服務將使用原通知的收件對象與同版本附件。</p>
        <div class="case-resend-actions">
          <button type="button" class="v-btn v-btn-cancel" onclick="toggleHazardResend(this, false)">取消重寄</button>
          <button type="button" class="v-btn v-btn-primary" onclick="confirmHazardResend(this)">確認重寄（展示）</button>
        </div>
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
      panel.querySelector('button').focus();
    } else trigger.focus();
  }

  function confirmHazardResend(button) {
    const { container, data } = caseContext(button);
    if (data.status === '取消') {
      showStatus(container, '案件已取消，無法再次寄送通報完成通知。', true);
      return;
    }
    toggleHazardResend(button, false);
    showStatus(container, '重寄確認展示已完成。目前未啟用寄信服務，未寄出電子郵件。');
  }

  // 使用瀏覽器中文字型繪製 A4 頁面，再封裝為 PDF；不需外部字型或 CDN。
  // 展示 PDF 為影像頁面；正式平台須保存可搜尋、可存取的原始郵件附件。
  function buildCompletionPdf(notice) {
    const width = 1240, height = 1754, margin = 88, lineHeight = 39;
    const pages = [];
    let canvas, ctx, y;
    function page() {
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('無法建立 PDF，請使用支援檔案下載的瀏覽器再試一次。');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#174d7e';
      ctx.fillRect(0, 0, width, 174);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 36px "Microsoft JhengHei", sans-serif';
      ctx.fillText('通報完成資料（展示）', margin, 80);
      ctx.font = '24px "Microsoft JhengHei", sans-serif';
      ctx.fillText(`${notice.report.caseNo}  /  第 ${notice.version} 版`, margin, 128);
      ctx.fillStyle = '#64748b';
      ctx.font = '20px "Microsoft JhengHei", sans-serif';
      ctx.fillText(`展示資料，非正式通報證明  |  第 ${pages.length + 1} 頁`, margin, height - 55);
      pages.push(canvas);
      y = 228;
    }
    function paragraph(text, heading = false) {
      y += heading ? 18 : 8;
      for (const part of String(text).split(/\r?\n/)) {
        let line = '';
        const draw = () => {
          if (y > height - 125) page();
          ctx.fillStyle = heading ? '#174d7e' : '#263746';
          ctx.font = `${heading ? 'bold 28px' : '25px'} "Microsoft JhengHei", sans-serif`;
          ctx.fillText(line, margin, y);
          y += lineHeight;
        };
        ctx.font = `${heading ? 'bold 28px' : '25px'} "Microsoft JhengHei", sans-serif`;
        for (const char of part) {
          if (ctx.measureText(line + char).width > width - margin * 2) {
            draw();
            ctx.font = `${heading ? 'bold 28px' : '25px'} "Microsoft JhengHei", sans-serif`;
            line = '';
          }
          line += char;
        }
        draw();
      }
    }
    const data = notice.report;
    const field = (label, value) => paragraph(`${label}：${value || '未提供'}`);
    const list = (label, values) => {
      paragraph(label, true);
      if (!values?.length) paragraph('無');
      else values.forEach((value, index) => paragraph(`${index + 1}. ${value}`));
    };
    page();
    paragraph('TOiRA 危險作業風險評估及通報平台', true);
    paragraph('本檔為展示案件的資料快照，未寄送電子郵件或送至主管機關；既有展示案件的快照於首次檢視時建立。');
    field('通報日期／時間（臺灣時間）', notice.submittedAt);
    field('案件類型', data.caseType === 'scale' || data.scaleItems ? '一定規模以上營造業通報' : '危險作業通報');
    field('作業名稱', data.workName);
    field('預期作業期間', `${data.startDate || '未提供'} 至 ${data.endDate || '未提供'}`);
    field('管轄機構', data.adminOffice);
    field('所在地區', `${data.city || ''}${data.dist || ''}`);
    field('產業園區', data.industrialPark || '否');
    paragraph('通報者與作業單位', true);
    field('通報者事業單位', data.notifierCompany);
    field('通報者電話', data.notifierPhone);
    field('電子郵件', data.email);
    field('通報關係', data.relation);
    field('作業單位', data.contractorUnit);
    field('統一編號', data.contractorTaxId);
    field('承攬商', data.contractors?.join('、') || '無');
    field('專屬單位', data.specialUnit);
    if (data.scaleItems) {
      field('通報種類', data.reportKind === 'major' ? '重大變更' : '新增通報');
      field('建造執照', data.buildingPermit);
      field('工程地號／地址', data.siteAddress);
    }
    list('作業類別', data.categories);
    list('完整通報項目', data.scaleItems || data.subItems);
    (data.locations || []).forEach((location, index) => {
      paragraph(index ? `附加點位 ${index}` : '主要作業地點', true);
      field('地址／說明', location.address);
      field('GPS 位置', location.gps);
      field('現場聯絡人', location.contact);
      field('聯絡電話', location.phone);
      field('作業人數', location.workers);
      field('跨轄區副知機關', location.crossAdmins?.join('、') || (location.isCross ? '未提供' : '無'));
      field('備註', location.note);
    });
    list('一般附件清單', data.attachments);
    list('風險評估附件清單', data.riskFiles);
    paragraph('附件清單僅列名稱；原始風險評估與佐證資料請於平台查閱。案件目前狀態以平台為準。');

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

  async function downloadHazardCompletion(button) {
    if (button.disabled) return;
    const container = button.closest('.case-detail-container');
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = '正在產生 PDF…';
    try {
      const { notice } = caseContext(button);
      await document.fonts.ready;
      const blob = buildCompletionPdf(notice);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = notice.filename.replace(/[\\/:*?"<>|\x00-\x1f]/g, '_');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      showStatus(container, '通報完成檔案已產生，請查看瀏覽器下載項目。');
    } catch (error) {
      console.error('通報完成檔案下載失敗', error);
      showStatus(container, '下載失敗，請再試一次；若持續失敗，請聯絡平台服務人員。', true);
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  }

  Object.assign(window, { createHazardCompletionNotice, ensureHazardCompletionNotice, getHazardCompletionActionsHtml, getHazardCompletionPanelHtml, downloadHazardCompletion, toggleHazardResend, confirmHazardResend });
})();
