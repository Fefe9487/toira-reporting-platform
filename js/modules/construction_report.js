/* =========================================================
 * construction_report.js - 一定規模以上營造業作業線上通報流程
 * ========================================================= */
        /* =========================================================
     * 一定規模以上營造業作業線上通報 (三階段完整流程，比照危險作業通報)
     * 欄位規格完全對照 2026_hwri擴充/index.html 規範
     * ========================================================= */
    let currentScaleMode = 'add';
    let currentScaleCaseNo = '';
    let currentScaleStep = 1;
    const scaleReportTitle = '一定規模以上工程開工或重大變更通報';
    const scaleMajorCategory = '一、下列事項變更達原規模百分之五十以上者';
    const scaleMajorMeasures = [
      ['amount', '工程金額', '新臺幣元'],
      ['height', '建築高度', '公尺'],
      ['depth', '開挖深度', '公尺'],
      ['area', '基地面積', '平方公尺'],
      ['length', '橋梁或隧道長度', '公尺']
    ];
    const scaleValue = id => document.getElementById(id)?.value.trim() || '';

    function isScaleLargeProject(data) {
      return data.isAtLeast200Million ?? data.scaleItems?.some(item => [
        '工程造價達新台幣兩億元以上',
        '預算金額或契約價金達2億元以上且非為新建建築物工程者'
      ].includes(item)) ?? false;
    }

    function getScaleSiteHistory(siteAddress, draft) {
      const addressKey = value => (value || '').normalize('NFKC').replace(/\s/g, '');
      const key = addressKey(siteAddress);
      if (!key) return [];

      const reports = Object.values(DEMO_HAZARD_CASES);
      const editIndex = draft?.caseNo ? reports.findIndex(report => report.caseNo === draft.caseNo) : -1;
      if (editIndex >= 0) reports[editIndex] = draft;
      else if (draft) reports.push(draft);
      const matches = reports.filter(report =>
        report.caseType === 'scale' && report.status !== '取消' && addressKey(report.siteAddress) === key
      );
      const sortDate = report => report.reportKind === 'major' ? (report.majorDate || '\uffff') : '';
      // Stable sort uses the save order as a tie-breaker for changes on the same date.
      matches.sort((first, second) => sortDate(first).localeCompare(sortDate(second)));
      let number = 0;
      return matches.map(report => ({
        report,
        number: report.reportKind === 'major' && report.majorDate ? ++number : null
      }));
    }

    function getScaleChangeNumber(report) {
      if (report.reportKind !== 'major' || !report.majorDate) return null;
      return getScaleSiteHistory(report.siteAddress, report).find(entry => entry.report === report)?.number ?? null;
    }

    function updateScaleSiteHistory() {
      if (scaleValue('scaleReportKind') !== 'major') return;
      const siteAddress = scaleValue('scaleSiteAddress');
      const draft = {caseNo: currentScaleCaseNo, caseType: 'scale', siteAddress, reportKind: 'major', majorDate: scaleValue('scaleMajorDate')};
      const history = getScaleSiteHistory(siteAddress, draft);
      const number = history.find(entry => entry.report === draft)?.number;
      document.getElementById('scaleMajorNumber').value = number ? String(number) : '';
      const historyEl = document.getElementById('scaleSiteHistory');
      const related = history.filter(entry => entry.report !== draft);
      if (!related.length) {
        historyEl.textContent = siteAddress ? '目前沒有同一基地的其他展示通報。' : '輸入基地地號／地址後，可查看同一基地的展示通報。';
        return;
      }
      historyEl.innerHTML = `<strong>同一基地的其他通報</strong><ul>${related.map(({report, number}) => {
        const description = report.reportKind !== 'major' ? '開工' :
          number ? `第 ${number} 次重大變更（${portalEscape(report.majorDate)}）` : '重大變更（發生日未填）';
        return `<li>${portalEscape(report.caseNo)}　${description}　${portalEscape(report.projectName || report.workName)}</li>`;
      }).join('')}</ul>`;
    }

    function toggleScaleCivilItems() {
      const kind = document.getElementById('scaleReportKind')?.value;
      const newItems = document.getElementById('scaleItemsNew');
      const changeItems = document.getElementById('scaleItemsChange');
      const majorInfo = document.getElementById('scaleMajorInfo');
      if (majorInfo) majorInfo.hidden = kind !== 'major';
      if (newItems && changeItems) {
        newItems.style.display = (kind === 'major' ? 'none' : 'block');
        changeItems.style.display = (kind === 'major' ? 'block' : 'none');
      }
      updateScaleSiteHistory();
    }

    function toggleScaleChangeDetails(checkbox) {
      const details = checkbox.closest('.scale-change-item').querySelector('.scale-change-details');
      details.hidden = !checkbox.checked;
      if (details.hidden) details.querySelectorAll('input, textarea').forEach(field => { field.value = ''; });
    }

    function renderScaleChangeItem(id, label, unit) {
      const fieldId = `scale-change-${id}`;
      const numericFields = unit ? `
        <div class="scale-change-values">
          <label for="${fieldId}-before">變更前（${unit}）<input id="${fieldId}-before" class="search-input" type="number" min="0" step="any" data-change-field="before"></label>
          <label for="${fieldId}-after">變更後（${unit}）<input id="${fieldId}-after" class="search-input" type="number" min="0" step="any" data-change-field="after"></label>
          <label for="${fieldId}-percent">變更百分比（%）<input id="${fieldId}-percent" class="search-input" type="number" step="any" data-change-field="percent"></label>
        </div>` : '';
      return `
        <div class="scale-change-item" data-unit="${unit || ''}">
          <label for="${fieldId}"><input id="${fieldId}" type="checkbox" value="${label}" onchange="toggleScaleChangeDetails(this)"> ${label}</label>
          <div class="scale-change-details" hidden>
            ${numericFields}
            <label for="${fieldId}-reason">${unit ? '變更原因' : '變更說明'}</label>
            <textarea id="${fieldId}-reason" class="search-input" maxlength="500" rows="2" data-change-field="reason"></textarea>
          </div>
        </div>`;
    }

    function toggleScaleSubItems(mainCb) {
      const container = mainCb.closest('.checkbox-item')?.querySelector('.sub-items-container');
      if (!container) return;
      if (mainCb.checked) {
        container.style.display = 'flex';
        container.classList.add('active');
      } else {
        container.style.display = 'none';
        container.classList.remove('active');
        container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
          checkbox.checked = false;
          if (checkbox.closest('.scale-change-item')) toggleScaleChangeDetails(checkbox);
        });
      }
    }

    function addScaleExtraPoint() {
      const container = document.getElementById('scaleExtraPointsContainer');
      if (!container) return;
      const row = document.createElement('div');
      row.className = 'extra-point-row';
      row.style.cssText = 'display:flex; gap:10px; align-items:center;';
      row.innerHTML = `
        <input type="text" class="search-input extra-point-desc" placeholder="路段／附加說明" style="flex:1;">
        <input type="text" class="search-input extra-point-gps" placeholder="GPS 經度, 緯度" style="flex:1;">
        <button type="button" title="刪除此點位" onclick="this.closest('.extra-point-row').remove()" style="width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:#e2e8f0; color:#475569; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer; font-weight:bold; font-size:16px;">
          －
        </button>
      `;
      container.appendChild(row);
      return row;
    }

    function validateScalePeople() {
      if (!scaleValue('scaleCitySelect')) alert('請選擇工程所在地（縣市）！');
      else if (!scaleValue('scaleEngineeringAddress') && !scaleValue('scaleEngineeringGps')) alert('工程地址或 GPS 位置請擇一填寫！');
      else if (!scaleValue('scalePrimaryUnit')) alert('請輸入施工者名稱！');
      else if (!scaleValue('scaleContact') || !scaleValue('scalePhone')) alert('請輸入現場聯絡人姓名與聯絡電話！');
      else if (!scaleValue('scaleNotifierCompany')) alert('請輸入工程業主（代表）名稱！');
      else return true;
      return false;
    }

    function getScaleSelectedItems(reportKind) {
      const group = document.getElementById(reportKind === 'major' ? 'scaleItemsChange' : 'scaleItemsNew');
      return [...group.querySelectorAll('input[type="checkbox"]:checked:not(.main-category-label input)')];
    }

    function validateScaleProject() {
      if (!scaleValue('scaleProjectName')) {
        alert('請輸入工程名稱！');
        document.getElementById('scaleProjectName').focus();
        return false;
      }
      if (!scaleValue('scaleSiteAddress')) {
        alert('請輸入基地地號／地址！');
        document.getElementById('scaleSiteAddress').focus();
        return false;
      }
      const kind = scaleValue('scaleReportKind');
      if (!getScaleSelectedItems(kind).length) {
        alert('請至少勾選一項一定規模通報項目！');
        return false;
      }
      if (kind === 'major') {
        const majorFields = document.querySelectorAll('#scaleMajorDate, #scaleItemsChange .scale-change-details:not([hidden]) input');
        for (const field of majorFields) {
          if (!field.reportValidity()) return false;
        }
      }
      return true;
    }

    function switchScaleStep(targetStep) {
      closeHhDateRangePicker();
      if (targetStep === 2 && currentScaleStep === 1 && !validateScalePeople()) return;
      if (targetStep === 3 && currentScaleStep === 2) {
        if (!validateScaleProject()) return;
        generateScaleFinalSummary();
      }

      currentScaleStep = targetStep;

      for (let i = 1; i <= 3; i++) {
        const ind = document.getElementById(`scaleStep${i}Indicator`);
        const pane = document.getElementById(`scaleStep${i}Pane`);
        if (ind) {
          if (i === targetStep) ind.className = 'flow-step active';
          else if (i < targetStep) ind.className = 'flow-step completed';
          else ind.className = 'flow-step';
        }
        if (pane) {
          if (i === targetStep) pane.classList.add('active');
          else pane.classList.remove('active');
        }
      }

      const modalBody = document.querySelector('.v-dialog-body');
      if (modalBody) modalBody.scrollTop = 0;
    }

    function collectScaleReportData() {
      const reportKind = scaleValue('scaleReportKind');
      const selected = getScaleSelectedItems(reportKind);
      const isCross = document.getElementById('scaleCrossCheck').checked;
      const firstLocation = {
        address: scaleValue('scaleEngineeringAddress'),
        gps: scaleValue('scaleEngineeringGps'),
        contact: scaleValue('scaleContact'),
        phone: scaleValue('scalePhone'),
        workers: scaleValue('scaleWorkerCount'),
        note: scaleValue('scaleNote'),
        isCross,
        crossAdmins: isCross ? [...document.querySelectorAll('#scaleCrossAdminContainer .cross-admin-cb:checked')].map(box => box.value) : []
      };
      const extraLocations = [...document.querySelectorAll('#scaleExtraPointsContainer .extra-point-row')].map(row => ({
        ...row.savedLocation,
        address: row.querySelector('.extra-point-desc').value.trim(),
        gps: row.querySelector('.extra-point-gps').value.trim()
      })).filter(location => location.address || location.gps);
      return {
        caseNo: currentScaleCaseNo,
        caseType: 'scale',
        reportKind,
        projectName: scaleValue('scaleProjectName'),
        workName: scaleValue('scaleProjectName'),
        buildingPermit: scaleValue('scaleBuildingPermit'),
        siteAddress: scaleValue('scaleSiteAddress'),
        startDate: scaleValue('scaleStartDate'),
        city: scaleValue('scaleCitySelect'),
        dist: scaleValue('scaleDistSelect'),
        adminOffice: scaleValue('scaleAdminUnit'),
        notifierCompany: scaleValue('scaleNotifierCompany'),
        notifierPhone: scaleValue('scaleNotifierPhone'),
        isAtLeast200Million: document.getElementById('scaleLargeProject').checked,
        contractorUnit: scaleValue('scalePrimaryUnit'),
        contractorTaxId: scaleValue('scaleTaxId'),
        contractors: [...document.querySelectorAll('#scaleContractorRows .contractor-input')].map(input => input.value.trim()).filter(Boolean),
        locations: [firstLocation, ...extraLocations],
        scaleItems: selected.map(box => box.value),
        majorDate: reportKind === 'major' ? scaleValue('scaleMajorDate') : '',
        scaleChangeDetails: reportKind === 'major' ? selected.map(box => {
          const item = box.closest('.scale-change-item');
          const fields = [...item.querySelectorAll('[data-change-field]')].map(field => [field.dataset.changeField, field.value.trim()]);
          return {id: box.id, label: box.value, unit: item.dataset.unit, ...Object.fromEntries(fields)};
        }) : []
      };
    }

    function generateScaleFinalSummary() {
      const summaryContainer = document.getElementById('scaleSummaryContainer');
      const itemsContainer = document.getElementById('scaleSelectedItemsSummary');
      if (!summaryContainer || !itemsContainer) return;

      const data = collectScaleReportData();
      const isMajor = data.reportKind === 'major';
      const majorNumber = getScaleChangeNumber(data);
      const {contact, phone, workers, isCross, crossAdmins} = data.locations[0];
      const esc = portalEscape;
      const locationSummary = data.locations.map(({address, gps}, index) => {
        const label = index ? `附加點位 ${index}` : '工程地址';
        return `<strong>${label}：</strong> ${esc(address || '未填寫')}${gps ? `（GPS：${esc(gps)}）` : ''}`;
      }).join('<br>');

      summaryContainer.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:18px; font-size: 15.5px; line-height: 1.7;">
          <div><strong>工程名稱：</strong> <span style="color:#1d4ed8; font-weight:700; font-size: 17px;">${esc(data.projectName)}</span></div>
          <div><strong>建照字號：</strong> <span style="color:#334155; font-weight:600;">${esc(data.buildingPermit || '未填寫')}</span></div>
          <div style="grid-column:span 2;"><strong>基地地號／地址：</strong> <span style="color:#1e293b; font-weight:600;">${esc(data.siteAddress)}</span></div>
          <div><strong>通報種類：</strong> <span style="color:#0288d1; font-weight:600;">${isMajor ? '重大變更' : '開工'}</span></div>
          ${isMajor ? `<div><strong>重大變更次數：</strong> ${majorNumber ? `第 ${majorNumber} 次` : '未計算'}</div>
          <div><strong>變更發生日：</strong> ${esc(data.majorDate || '未填寫')}</div>` : ''}
          <div><strong>預定開始日：</strong> <span style="color:#059669; font-weight:600;">${esc(data.startDate || '未填寫')}</span></div>
          <div><strong>工程所在地與管轄單位：</strong> <span style="color:#334155;">${esc(data.city)} ${esc(data.dist)}（${esc(data.adminOffice)}）</span></div>
          <div><strong>跨轄區副知機關：</strong> ${isCross ? esc(crossAdmins.join('、') || '已勾選跨轄區，未指定副知單位') : '無（非跨轄區）'}</div>
          <div style="grid-column:span 2;"><strong>工程地點與 GPS 座標：</strong> <div style="margin-top:6px; padding:12px 16px; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; line-height:1.75; font-size: 15px; color:#334155;">${locationSummary}</div></div>
          <div><strong>施工者：</strong> ${esc(data.contractorUnit)}（統編：${esc(data.contractorTaxId || '未填寫')}）</div>
          <div><strong>承攬商：</strong> ${esc(data.contractors.join('、') || '未填寫')}</div>
          <div><strong>現場聯絡人：</strong> ${esc(contact)}（電話：${esc(phone)}）</div>
          <div><strong>現場作業人數：</strong> ${workers ? `約 ${esc(workers)} 人` : '未填寫'}</div>
          <div><strong>一定規模以上之工程：</strong> ${data.isAtLeast200Million ? '兩億以上規模工程' : '未勾選'}</div>
          <div style="grid-column:span 2; border-top:1px dashed #cbd5e1; padding-top:10px; margin-top:6px;">
            <strong>工程業主（代表）名稱：</strong> ${esc(data.notifierCompany)}（連絡方式：${esc(data.notifierPhone || '未填寫')}）
          </div>
        </div>
      `;

      // 彙整已勾選通報項目
      let selectedHtml = '';
      if (!isMajor) {
        const items = [];
        document.querySelectorAll('#scaleItemsNew .checkbox-item').forEach(item => {
          const mainCb = item.querySelector('.main-category-label input[type="checkbox"]');
          const isMainChecked = mainCb ? mainCb.checked : false;
          const subCbs = item.querySelectorAll('.sub-items-container input[type="checkbox"]:checked');

          if (isMainChecked && subCbs.length > 0) {
            const subTexts = Array.from(subCbs).map(cb => cb.parentNode.textContent.trim());
            items.push(`
              <div style="margin-bottom:10px;">
                <div style="font-weight:700; color:#1e293b; font-size: 16.5px;">${mainCb.parentNode.textContent.trim()}</div>
                <ul style="margin:6px 0 0 24px; padding:0; color:#334155; font-size: 15px; line-height: 1.65;">
                  ${subTexts.map(t => `<li style="margin-bottom:3px;">${t}</li>`).join('')}
                </ul>
              </div>
            `);
          } else if (!mainCb) {
            const cb = item.querySelector('input[type="checkbox"]');
            if (cb && cb.checked) {
              items.push(`<div style="font-weight:600; color:#1e293b; margin-bottom:8px; font-size: 15.5px;">✔ ${item.textContent.trim()}</div>`);
            }
          }
        });
        selectedHtml = items.length > 0 ? items.join('') : '<span style="color:#64748b; font-size: 15px;">未勾選項目</span>';
      } else {
        const measureRows = [];
        let otherRow = '';
        for (const item of data.scaleChangeDetails) {
          const unit = item.unit;
          const read = (key, suffix = '') => {
            const value = item[key];
            return value ? portalEscape(value) + suffix : '未填寫';
          };
          const label = portalEscape(item.label);
          if (unit) {
            measureRows.push(`<li class="scale-change-summary">
              <strong>${label}</strong>
              <div>變更前：${read('before', ' ' + unit)}　變更後：${read('after', ' ' + unit)}　變更百分比：${read('percent', '%')}</div>
              <div class="scale-change-note">變更原因：${read('reason')}</div>
            </li>`);
          } else {
            otherRow = `<div class="scale-change-summary"><strong>${label}</strong>
              <div class="scale-change-note">變更說明：${read('reason')}</div></div>`;
          }
        }
        const measures = measureRows.length ? `<div><strong>${scaleMajorCategory}</strong><ul>${measureRows.join('')}</ul></div>` : '';
        selectedHtml = measures + otherRow || '<span style="color:#64748b; font-size: 15px;">未勾選重大變更項目</span>';
      }

      itemsContainer.innerHTML = `
        <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:16px 20px; line-height:1.65; font-size: 15.5px;">
          ${selectedHtml}
        </div>
      `;
    }

    function submitScaleFlow() {
      if (currentScaleStep !== 3) return;
      const existing = DEMO_HAZARD_CASES[currentScaleCaseNo];
      if (currentScaleMode === 'edit' && (!existing || existing.status === '取消')) {
        alert('此案件不存在或已取消，無法儲存變更。');
        return;
      }
      if (!validateScalePeople()) { switchScaleStep(1); return; }
      if (!validateScaleProject()) { switchScaleStep(2); return; }
      const data = collectScaleReportData();
      const caseNo = currentScaleCaseNo || createHazardCaseNumber('SC');
      const status = existing?.status || '待確認';
      const now = new Date();
      const catalogRow = inspectionCaseCatalog.find(row => row.id === caseNo);
      const record = {
        ...existing, ...data, caseNo, status,
        submittedAt: existing?.submittedAt || catalogRow?.submitDate ||
          now.toLocaleString('zh-TW', {timeZone:'Asia/Taipei',hour12:false})
      };
      record.locations[0] = {...existing?.locations?.[0], ...record.locations[0]};
      DEMO_HAZARD_CASES[caseNo] = record;
      const workRange = [record.startDate, record.endDate].filter(Boolean).map(hhRocDate).join(' ~ ');
      const row = {
        id: caseNo, company: data.notifierCompany, unit: data.contractorUnit, workName: data.workName,
        region: data.city + data.dist, workRange, status, scale: true,
        submitDate: catalogRow?.submitDate || hhRocDate(now.toLocaleDateString('sv-SE', {timeZone:'Asia/Taipei'}))
      };
      if (catalogRow) Object.assign(catalogRow, row);
      else inspectionCaseCatalog.unshift(row);

      closeVDialog();
      renderView('caseSearch');
      openVDialog({
        title: '展示資料已儲存', maxWidth: '620px', hideFooter: true,
        bodyHtml: `<div class="report-completion">
          <p>展示案件編號：<strong>${portalEscape(caseNo)}</strong></p>
          <p class="completion-note">資料保留於目前頁面，尚未送至主管機關。</p>
          <button type="button" class="v-btn v-btn-primary" onclick="closeVDialog()">返回案件列表</button>
        </div>`
      });
    }

    function populateScaleCaseData(data) {
      if (!data) return;

      const [location = {}, ...extraLocations] = data.locations || [];
      const fields = {
        scaleNotifierCompany: data.notifierCompany, scaleNotifierPhone: data.notifierPhone,
        scaleCitySelect: data.city, scaleDistSelect: data.dist, scaleAdminUnit: data.adminOffice,
        scalePrimaryUnit: data.contractorUnit, scaleTaxId: data.contractorTaxId,
        scaleEngineeringAddress: location.address, scaleEngineeringGps: location.gps,
        scaleContact: location.contact, scalePhone: location.phone, scaleWorkerCount: location.workers, scaleNote: location.note,
        scaleProjectName: data.projectName || data.workName, scaleBuildingPermit: data.buildingPermit,
        scaleSiteAddress: data.siteAddress, scaleReportKind: data.reportKind || 'new',
        scaleStartDate: data.startDate, scaleMajorDate: data.majorDate
      };
      for (const [id, value] of Object.entries(fields)) document.getElementById(id).value = value ?? '';
      document.getElementById('scaleLargeProject').checked = isScaleLargeProject(data);
      for (const contractor of data.contractors || []) addContractorUnit(contractor, 'scaleContractorRows');
      for (const point of extraLocations) {
        const row = addScaleExtraPoint();
        row.savedLocation = point;
        row.querySelector('.extra-point-desc').value = point.address || '';
        row.querySelector('.extra-point-gps').value = point.gps || '';
      }
      const cross = document.getElementById('scaleCrossCheck');
      cross.checked = Boolean(location.isCross);
      cross.dispatchEvent(new Event('change'));
      document.querySelectorAll('#scaleCrossAdminContainer .cross-admin-cb').forEach(box => {
        box.checked = cross.checked && Boolean(location.crossAdmins?.includes(box.value));
      });
      const selected = new Set(data.scaleItems);
      document.querySelectorAll('#scaleItemsNew input[type="checkbox"]:not(.main-category-label input)').forEach(box => {
        box.checked = data.reportKind !== 'major' && selected.has(box.value);
      });
      const changes = new Map((data.scaleChangeDetails || []).map(item => [item.id, item]));
      document.querySelectorAll('#scaleItemsChange .scale-change-item input[type="checkbox"]').forEach(box => {
        const item = changes.get(box.id);
        box.checked = data.reportKind === 'major' && (changes.has(box.id) || selected.has(box.value));
        toggleScaleChangeDetails(box);
        if (box.checked && item) box.closest('.scale-change-item').querySelectorAll('[data-change-field]').forEach(field => {
          field.value = item[field.dataset.changeField] ?? '';
        });
      });
      toggleScaleCivilItems();
    }

    /**
     * 一定規模作業線上通報主入口 (比照危險作業通報三階段模式)
     */
    function openScaleCaseDialog(mode = 'add', caseParam = null) {
      currentScaleMode = (mode === 'edit') ? 'edit' : 'add';
      currentScaleStep = 1;

      let caseData = null;
      let dialogTitle = `新增${scaleReportTitle}`;
      let dialogMsg = '※ 依工程安全設計及統合管理辦法第三條及第十九條規定通報工程';

      if (currentScaleMode === 'edit') {
        const requestedCaseNo = typeof caseParam === 'string' ? caseParam : caseParam?.caseNo;
        caseData = Object.hasOwn(DEMO_HAZARD_CASES, requestedCaseNo) ? DEMO_HAZARD_CASES[requestedCaseNo] : null;
        if (caseData?.caseType !== 'scale' || caseData.status === '取消') {
          alert('此工程通報不存在或已取消，無法編輯。');
          return;
        }
        currentScaleCaseNo = caseData.caseNo;
        dialogTitle = `編輯${scaleReportTitle} <span style="font-size: 12px; color:#2563eb; font-weight:normal;">（案件編號：${portalEscape(caseData.caseNo)}）</span>`;
        dialogMsg = '';
      } else {
        currentScaleCaseNo = '';
      }

      const bodyHtml = `
        <div class="scale-report-flow" style="display:flex; flex-direction:column; gap:16px;">
          <!-- 三階段進度條 -->
          <div class="flow-steps">
            <div class="flow-step active" id="scaleStep1Indicator">
              <span class="step-num">1</span>第一步：工程業主與施工資訊
            </div>
            <div class="flow-step" id="scaleStep2Indicator">
              <span class="step-num">2</span>第二步：選擇通報作業
            </div>
            <div class="flow-step" id="scaleStep3Indicator">
              <span class="step-num">3</span>第三步：確認通報資料
            </div>
          </div>

          <!-- =========================================================
           * 第一步 Pane：作業／填報者資訊 (完全比照危險作業通報)
           * ========================================================= -->
          <div id="scaleStep1Pane" class="step-pane active">
            <div class="dispatch-tip">
              <strong>步驟一說明：</strong> 請填寫工程業主、施工者、工程所在地與管轄單位。有承攬商時，可逐一新增。
            </div>

            <!-- 通報者資訊 -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
              <h4 style="margin:0 0 12px 0; color:#1e293b; font-size: 14.5px; display:flex; align-items:center; gap:8px;">
                <span style="display:inline-block; width:4px; height:16px; background:#2563eb; border-radius:2px;"></span>
                通報者資訊
              </h4>
              <div style="display:flex; flex-direction:column; gap:14px;">
                <div class="form-field-group">
                  <label for="scaleNotifierCompany">工程業主（代表）名稱 <span class="form-req">*</span></label>
                  <input type="text" class="search-input" id="scaleNotifierCompany" value="大安建設股份有限公司" placeholder="請輸入工程業主（代表）名稱" required>
                </div>
                <div class="form-field-group">
                  <label for="scaleNotifierPhone">連絡方式 <span style="font-size: 12px; font-weight:normal; color:#64748b;">(選填)</span></label>
                  <input type="text" class="search-input" id="scaleNotifierPhone" value="0911-223-344" placeholder="請輸入連絡方式">
                </div>
                <div class="form-field-group">
                  <label id="scaleLargeProjectLabel">一定規模以上之工程</label>
                  <div role="group" aria-labelledby="scaleLargeProjectLabel">
                    <label class="scale-form-choice"><input type="checkbox" id="scaleLargeProject"> 兩億以上規模工程</label>
                  </div>
                </div>
              </div>
            </div>

            <!-- 所在地區與管轄單位 -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
              <h4 style="margin:0 0 12px 0; color:#1e293b; font-size: 14.5px; display:flex; align-items:center; gap:8px;">
                <span style="display:inline-block; width:4px; height:16px; background:#2563eb; border-radius:2px;"></span>
                所在地區與管轄單位
              </h4>
              <div style="display:flex; flex-direction:column; gap:14px;">
                <div class="form-field-group">
                  <label for="scaleCitySelect">工程所在地（縣市） <span class="form-req">*</span></label>
                  <select class="search-input" id="scaleCitySelect" required>
                    <option value="">請選擇縣市</option>
                    <option value="台北市" selected>臺北市</option>
                    <option value="新北市">新北市</option>
                    <option value="桃園市">桃園市</option>
                    <option value="台中市">臺中市</option>
                    <option value="台南市">臺南市</option>
                    <option value="高雄市">高雄市</option>
                    <option value="新竹市">新竹市</option>
                    <option value="新竹縣">新竹縣</option>
                    <option value="基隆市">基隆市</option>
                    <option value="苗栗縣">苗栗縣</option>
                    <option value="彰化縣">彰化縣</option>
                    <option value="南投縣">南投縣</option>
                    <option value="雲林縣">雲林縣</option>
                    <option value="嘉義市">嘉義市</option>
                    <option value="嘉義縣">嘉義縣</option>
                    <option value="屏東縣">屏東縣</option>
                    <option value="宜蘭縣">宜蘭縣</option>
                    <option value="花蓮縣">花蓮縣</option>
                    <option value="台東縣">臺東縣</option>
                    <option value="澎湖縣">澎湖縣</option>
                    <option value="金門縣">金門縣</option>
                    <option value="連江縣">連江縣</option>
                  </select>
                </div>
                <div class="form-field-group">
                  <label>鄉鎮市區 <span class="form-req">*</span></label>
                  <select class="search-input" id="scaleDistSelect" required>
                    <option value="大安區" selected>大安區</option>
                    <option value="信義區">信義區</option>
                    <option value="中正區">中正區</option>
                    <option value="中山區">中山區</option>
                    <option value="松山區">松山區</option>
                  </select>
                </div>
                <div class="form-field-group">
                  <label>所屬勞動檢查單位 <span class="form-req">*</span></label>
                  <select class="search-input" id="scaleAdminUnit" required>
                    <option value="臺北市勞動檢查處" selected>臺北市勞動檢查處</option>
                    <option value="新北市政府勞動檢查處">新北市政府勞動檢查處</option>
                    <option value="桃園市政府勞動檢查處">桃園市政府勞動檢查處</option>
                    <option value="臺中市勞動檢查處">臺中市勞動檢查處</option>
                    <option value="臺南市職安健康處">臺南市職安健康處</option>
                    <option value="高雄市政府勞工局勞動檢查處">高雄市政府勞工局勞動檢查處</option>
                    <option value="勞動部職業安全衛生署北區職業安全衛生中心">勞動部職業安全衛生署北區職業安全衛生中心</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 施工者及承攬商 -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
              <h4 style="margin:0 0 12px 0; color:#1e293b; font-size: 14.5px; display:flex; align-items:center; gap:8px;">
                <span style="display:inline-block; width:4px; height:16px; background:#2563eb; border-radius:2px;"></span>
                施工者及承攬商
              </h4>
              <div style="display:flex; flex-direction:column; gap:14px;">
                <div class="form-field-group">
                  <label for="scalePrimaryUnit">施工者名稱 <span class="form-req">*</span></label>
                  <div class="scale-contractor-control">
                    <input type="text" class="search-input" id="scalePrimaryUnit" value="大安建設股份有限公司 (統包)" required>
                    <button type="button" class="scale-add-contractor" title="新增承攬商" aria-label="新增承攬商" onclick="addContractorUnit('', 'scaleContractorRows')?.querySelector('input').focus()">＋</button>
                  </div>
                </div>
                <div class="form-field-group">
                  <label for="scaleTaxId">施工者統一編號</label>
                  <input type="text" class="search-input" id="scaleTaxId" value="12345678" placeholder="8碼統編">
                </div>
                <div id="scaleContractorRows"></div>
              </div>
            </div>

            <!-- 工程位置 -->
            <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:18px 20px; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
              <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                <h4 style="margin:0; color:#1d4ed8; font-size:16px; font-weight:700;">工程位置</h4>
                <span style="background:#fffbeb; color:#b45309; border:1px solid #fde68a; border-radius:4px; padding:3px 8px; font-size: 12px; font-weight:600;">
                  地址或 GPS 擇一必填
                </span>
              </div>
              <hr style="border:0; border-top:1px solid #e2e8f0; margin:0 0 16px 0;">

              <div style="display:flex; flex-direction:column; gap:16px;">
                <!-- 1. 工程地址 -->
                <div class="form-field-group">
                  <label>工程地址</label>
                  <input type="text" class="search-input" id="scaleEngineeringAddress" value="台北市大安區復興南路一段100號" placeholder="請輸入工程詳細基地地址或地號">
                </div>

                <!-- 2. GPS位置 -->
                <div class="form-field-group" style="align-items:flex-start !important;">
                  <label style="margin-top:7px !important;">GPS位置</label>
                  <div style="flex:1; display:flex; flex-direction:column; gap:6px;">
                    <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                      <input type="text" class="search-input" id="scaleEngineeringGps" value="25.033964, 121.543475" placeholder="經度, 緯度座標" style="max-width:280px; flex:1;">
                      <button type="button" class="btn-search" style="padding:7px 13px; background:#e2e8f0; color:#1e293b; font-size: 13px; font-weight:600; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer; white-space:nowrap;" onclick="getHhBrowserLocation()">
                        使用瀏覽器取得定位
                      </button>
                      <button type="button" style="padding:7px 13px; background:#f59e0b; color:#ffffff; font-size: 13px; font-weight:700; border:none; border-radius:6px; cursor:pointer; white-space:nowrap;" onclick="openGoogleMapSearch()">
                        開啟 Google 地圖
                      </button>
                    </div>
                    <div style="font-size: 12px; color:#64748b; line-height:1.4;">
                      可使用按鈕以瀏覽器／手機取得目前定位，或至 Google 地圖查詢座標後貼回欄位。
                    </div>
                  </div>
                </div>

                <!-- 3. 附加點位 -->
                <div class="form-field-group" style="align-items:flex-start !important;">
                  <label style="margin-top:7px !important;">附加點位</label>
                  <div style="flex:1; display:flex; flex-direction:column; gap:10px;">
                    <div id="scaleExtraPointsContainer" style="display:flex; flex-direction:column; gap:8px;"></div>
                    <div>
                      <button type="button" class="btn-search" style="padding:6px 14px; background:#e2e8f0; color:#1e293b; font-size: 13px; font-weight:600; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer;" onclick="addScaleExtraPoint()">
                        ＋ 新增路段／GPS點位
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 跨轄區工程 -->
                <div style="border-top:1px dashed #e2e8f0; padding-top:12px;">
                  <label style="display:inline-flex; align-items:center; gap:8px; cursor:pointer; font-size: 12px; font-weight:600; color:#1e293b;">
                    <input type="checkbox" id="scaleCrossCheck" onchange="const c = document.getElementById('scaleCrossAdminContainer'); if(c) c.style.display = this.checked ? 'block' : 'none';">
                    <span>本件為跨轄區工程（需副知其他主管勞檢機構）</span>
                  </label>
                  <div id="scaleCrossAdminContainer" style="display:none; margin-top:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:12px;">
                    <div style="font-size: 12.5px; color:#475569; margin-bottom:8px; font-weight:600;">請複選協同／副知管轄單位：</div>
                    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:6px;">
                      <label style="font-size: 13.5px; display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" class="cross-admin-cb" value="臺北市勞動檢查處"> 臺北市勞動檢查處</label>
                      <label style="font-size: 13.5px; display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" class="cross-admin-cb" value="新北市政府勞動檢查處"> 新北市政府勞動檢查處</label>
                      <label style="font-size: 13.5px; display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" class="cross-admin-cb" value="桃園市政府勞動檢查處"> 桃園市政府勞動檢查處</label>
                      <label style="font-size: 13.5px; display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" class="cross-admin-cb" value="臺中市勞動檢查處"> 臺中市勞動檢查處</label>
                    </div>
                  </div>
                </div>

                <!-- 現場管理人員與人數 -->
                <div style="border-top:1px dashed #e2e8f0; padding-top:14px;">
                  <h4 style="margin:0 0 10px 0; color:#1e293b; font-size:14px; display:flex; align-items:center; gap:6px;">
                    <span style="display:inline-block; width:4px; height:14px; background:#2563eb; border-radius:2px;"></span>
                    現場管理人員與人數
                  </h4>
                  <div style="display:flex; flex-direction:column; gap:14px;">
                    <div class="form-field-group">
                      <label>現場聯絡人 <span class="form-req">*</span></label>
                      <input type="text" class="search-input" id="scaleContact" value="林工程師" placeholder="請輸入現場聯絡人姓名" required>
                    </div>
                    <div class="form-field-group">
                      <label>聯絡電話 <span class="form-req">*</span></label>
                      <input type="tel" class="search-input" id="scalePhone" value="0912-345-678" placeholder="手機或現場電話" required>
                    </div>
                    <div class="form-field-group">
                      <label>現場作業人數 <span class="form-req">*</span></label>
                      <div style="display:flex; align-items:center; gap:6px;">
                        <input type="number" class="search-input" id="scaleWorkerCount" value="32" min="1" style="width:90px;">
                        <span style="color:#64748b;">人</span>
                      </div>
                    </div>
                    <div class="form-field-group">
                      <label>備註</label>
                      <textarea class="search-input" id="scaleNote" rows="2" placeholder="請填寫防護或施工備註說明...">地下室深開挖工程，工區鄰近捷運高架段，落實自動化監測與支撐安全巡檢。</textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 第一步底部按鈕 -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
              <button type="button" class="v-btn v-btn-cancel" onclick="closeVDialog()">取消</button>
              <button type="button" class="btn-add" style="padding:9px 24px; font-size:14px;" onclick="switchScaleStep(2)">
                下一步：設定工程標案與通報項目 ➔
              </button>
            </div>
          </div>

          <!-- =========================================================
           * 第二步 Pane：選擇通報作業 (欄位對照 index.html 規格)
           * ========================================================= -->
          <div id="scaleStep2Pane" class="step-pane">
            <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:12px 16px; border-radius:6px; color:#1e40af; font-size: 13px; line-height:1.6;">
              <strong>📋 步驟二說明：</strong> 請填寫工程資訊，選擇開工或重大變更，並勾選適用的通報項目。
            </div>

            <!-- 工程基本資訊 (對照 index.html: ce-project-name, ce-building-permit, ce-report-kind) -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
              <h4 style="margin:0 0 12px 0; color:#1e293b; font-size: 14.5px; display:flex; align-items:center; gap:8px;">
                <span style="display:inline-block; width:4px; height:16px; background:#2563eb; border-radius:2px;"></span>
                工程基本資訊
              </h4>
              <div style="display:flex; flex-direction:column; gap:14px;">
                <div class="form-field-group">
                  <label>工程名稱 <span class="form-req">*</span></label>
                  <input type="text" class="search-input" id="scaleProjectName" value="大安區復興段集合住宅新建工程" placeholder="請輸入工程名稱" required>
                </div>
                <div class="form-field-group">
                  <label>建照 <span style="font-size: 12px; font-weight:normal; color:#64748b;">(選填)</span></label>
                  <input type="text" class="search-input" id="scaleBuildingPermit" value="113建字第001234號" placeholder="請輸入建照字號">
                </div>
                <div class="form-field-group">
                  <label for="scaleSiteAddress">基地地號／地址 <span class="form-req">*</span></label>
                  <input type="text" class="search-input" id="scaleSiteAddress" value="臺北市大安區復興段二小段120地號" placeholder="請輸入基地地號或地址" oninput="updateScaleSiteHistory()" required>
                </div>
                <div class="form-field-group">
                  <label>通報種類 <span class="form-req">*</span></label>
                  <select class="search-input" id="scaleReportKind" onchange="toggleScaleCivilItems()">
                    <option value="new" selected>開工</option>
                    <option value="major">重大變更</option>
                  </select>
                </div>

                <!-- 預定開始日 (單選) -->
                <div class="form-field-group">
                  <label>預定開始日 <span class="form-req">*</span></label>
                  <input type="date" class="search-input" id="scaleStartDate" value="2026-09-25" style="max-width:240px; font-size:14px; padding: 6px 10px;" required>
                </div>
                <div id="scaleMajorInfo" hidden>
                  <div class="scale-change-values">
                    <label for="scaleMajorDate">變更發生日<input id="scaleMajorDate" class="search-input" type="date" oninput="updateScaleSiteHistory()"></label>
                    <label for="scaleMajorNumber">重大變更次數<input id="scaleMajorNumber" class="search-input" type="text" placeholder="依發生日排列" readonly></label>
                  </div>
                  <div id="scaleSiteHistory" class="scale-site-history" aria-live="polite"></div>
                </div>
              </div>
            </div>

            <!-- 通報項目區塊 (對照 index.html 項目規範) -->
            <div>
              <h4 style="margin:8px 0 10px 0; font-size: 14.5px; color:#1e293b; display:flex; align-items:center; gap:8px;">
                <span style="display:inline-block; width:4px; height:16px; background:#2563eb; border-radius:2px;"></span>
                通報項目 <span class="form-req">*</span>
              </h4>

              <!-- 通報種類 = 新增 (#scaleItemsNew) -->
              <div class="checkbox-group" id="scaleItemsNew">
                <!-- 一、新建建築物符合以下條件： -->
                <div class="checkbox-item">
                  <label class="main-category-label">
                    <input type="checkbox" onchange="toggleScaleSubItems(this)" checked> 一、新建建築物符合以下條件：
                  </label>
                  <div class="sub-items-container active" style="display:flex; flex-direction:column; gap:8px;">
                    <label><input type="checkbox" value="高度達50公尺以上" checked> (一) 高度達50公尺以上</label>
                    <label><input type="checkbox" value="開挖深度達15公尺以上且面積達500平方公尺"> (二) 開挖深度達15公尺以上且面積達500平方公尺</label>
                    <label><input type="checkbox" value="工程造價達新台幣兩億元以上" checked> (三) 工程造價達新台幣兩億元以上</label>
                  </div>
                </div>

                <!-- 二、預算金額或契約價金達2億元以上且非為新建建築物工程者 -->
                <div class="checkbox-item">
                  <label><input type="checkbox" value="預算金額或契約價金達2億元以上且非為新建建築物工程者"> 二、預算金額或契約價金達2億元以上且非為新建建築物工程者</label>
                </div>

                <!-- 三、其他經中央主管機關指定公告者 -->
                <div class="checkbox-item">
                  <label><input type="checkbox" value="其他經中央主管機關指定公告者"> 三、其他經中央主管機關指定公告者</label>
                </div>
              </div>

              <!-- 通報種類 = 重大變更 (#scaleItemsChange) -->
              <div class="checkbox-group" id="scaleItemsChange" style="display:none;">
                <div class="checkbox-item">
                  <label class="main-category-label">
                    <input type="checkbox" onchange="toggleScaleSubItems(this)" checked> ${scaleMajorCategory}
                  </label>
                  <div class="sub-items-container active" style="display:flex; flex-direction:column; gap:10px;">
                    ${scaleMajorMeasures.map(measure => renderScaleChangeItem(...measure)).join('')}
                  </div>
                </div>

                <!-- 二、其他經中央主管機關指定公告之工程變更 -->
                <div class="checkbox-item">
                  ${renderScaleChangeItem('other', '二、其他經中央主管機關指定公告之工程變更')}
                </div>
              </div>
            </div>

            <!-- 第二步底部按鈕 -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
              <button type="button" class="btn-search" style="background:#64748b; color:#ffffff;" onclick="switchScaleStep(1)">
                ⬅ 上一步：工程業主與施工資訊
              </button>
              <button type="button" class="btn-add" style="padding:9px 24px; font-size:14px;" onclick="switchScaleStep(3)">
                下一步：確認通報資料 ➔
              </button>
            </div>
          </div>

          <!-- =========================================================
           * 第三步 Pane：資料確認送出
           * ========================================================= -->
          <div id="scaleStep3Pane" class="step-pane">
            <div style="background:#fef3c7; border:1px solid #fde68a; padding:14px 18px; border-radius:6px; color:#92400e; font-size: 15px; line-height:1.65;">
              <strong>步驟三確認：</strong> 請核對下方通報資料。儲存後可在目前頁面的案件列表查看，資料尚未送至主管機關。
            </div>

            <!-- 基本資料彙整呈現容器 -->
            <div>
              <h4 style="margin:0 0 10px 0; color:#1e293b; font-size: 16.5px; display:flex; align-items:center; gap:8px;">
                <span style="display:inline-block; width:4px; height:18px; background:#2563eb; border-radius:2px;"></span>
                資訊確認
              </h4>
              <div id="scaleSummaryContainer"></div>
            </div>

            <!-- 已選通報項目 -->
            <div>
              <h4 style="margin:0 0 10px 0; color:#1e293b; font-size: 16.5px; display:flex; align-items:center; gap:8px;">
                <span style="display:inline-block; width:4px; height:18px; background:#059669; border-radius:2px;"></span>
                已選通報項目
              </h4>
              <div id="scaleSelectedItemsSummary"></div>
            </div>

            <!-- 第三步底部按鈕 -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px;">
              <button type="button" class="btn-search" style="background:#64748b; color:#ffffff; padding:10px 22px; font-size: 15px;" onclick="switchScaleStep(2)">
                ⬅ 上一步：修改通報項目
              </button>
              <button type="button" class="btn-add" style="background:#16a34a; color:#ffffff; padding:11px 32px; font-size: 16px; font-weight:700;" onclick="submitScaleFlow()">
                儲存展示資料
              </button>
            </div>
          </div>
        </div>
      `;

      openVDialog({
        title: dialogTitle,
        titleMsg: dialogMsg,
        maxWidth: '1080px',
        hideFooter: true,
        bodyHtml: bodyHtml
      });

      if (caseData) populateScaleCaseData(caseData);
    }

    window.openScaleCaseDialog = openScaleCaseDialog;
    window.switchScaleStep = switchScaleStep;
    window.toggleScaleCivilItems = toggleScaleCivilItems;
    window.toggleScaleChangeDetails = toggleScaleChangeDetails;
    window.toggleScaleSubItems = toggleScaleSubItems;
    window.addScaleExtraPoint = addScaleExtraPoint;
    window.generateScaleFinalSummary = generateScaleFinalSummary;
    window.submitScaleFlow = submitScaleFlow;


    function openCaseEditDialog(caseNo, workName) {
      if (DEMO_HAZARD_CASES[caseNo]?.caseType === 'scale') {
        openScaleCaseDialog('edit', caseNo);
      } else {
        openHazardCaseDialog('edit', { caseNo, workName });
      }
    }

    window.openCaseEditDialog = openCaseEditDialog;
