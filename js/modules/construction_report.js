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

    function toggleScaleCivilItems() {
      const kind = document.getElementById('scaleReportKind')?.value;
      const newItems = document.getElementById('scaleItemsNew');
      const changeItems = document.getElementById('scaleItemsChange');
      if (newItems && changeItems) {
        newItems.style.display = (kind === 'major' ? 'none' : 'block');
        changeItems.style.display = (kind === 'major' ? 'block' : 'none');
      }
    }

    function toggleScaleReasonBox(cb) {
      const reasonKey = cb.getAttribute('data-reason');
      const ta = document.querySelector(`.scale-reason-textarea[data-for="${reasonKey}"]`);
      if (ta) {
        ta.style.display = cb.checked ? 'block' : 'none';
        if (!cb.checked) ta.value = '';
      }
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
        container.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
        container.querySelectorAll('textarea').forEach(t => { t.value = ''; t.style.display = 'none'; });
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
    }

    function switchScaleStep(targetStep) {
      closeHhDateRangePicker();

      // Step 1 -> Step 2 validation
      if (targetStep === 2 && currentScaleStep === 1) {
        const city = document.getElementById('scaleCitySelect')?.value;
        const primaryUnit = document.getElementById('scalePrimaryUnit')?.value;
        const contact = document.getElementById('scaleContact')?.value;
        const phone = document.getElementById('scalePhone')?.value;
        const notifierCompany = document.getElementById('scaleNotifierCompany')?.value;
        const notifierPhone = document.getElementById('scaleNotifierPhone')?.value;

        if (!city) {
          alert('請選擇工程所在監管縣市！');
          return;
        }
        const addrVal = document.getElementById('scaleEngineeringAddress')?.value?.trim();
        const gpsVal = document.getElementById('scaleEngineeringGps')?.value?.trim();
        if (!addrVal && !gpsVal) {
          alert('工程地址或 GPS 位置請擇一填寫！');
          return;
        }
        if (!primaryUnit) {
          alert('請輸入作業單位！');
          return;
        }
        if (!contact || !phone) {
          alert('請輸入現場聯絡人姓名與聯絡電話！');
          return;
        }
        if (!notifierCompany) {
          alert('請輸入通報者事業單位名稱！');
          return;
        }
      }

      // Step 2 -> Step 3 validation
      if (targetStep === 3 && currentScaleStep === 2) {
        const projName = document.getElementById('scaleProjectName')?.value?.trim();
        if (!projName) {
          alert('請輸入工程名稱！');
          document.getElementById('scaleProjectName')?.focus();
          return;
        }

        const siteAddress = document.getElementById('scaleSiteAddress')?.value?.trim();
        if (!siteAddress) {
          alert('請輸入基地地號/地址！');
          document.getElementById('scaleSiteAddress')?.focus();
          return;
        }

        const kind = document.getElementById('scaleReportKind')?.value;
        const groupContainer = (kind === 'major') ? document.getElementById('scaleItemsChange') : document.getElementById('scaleItemsNew');
        const checkedBoxes = groupContainer ? groupContainer.querySelectorAll('input[type="checkbox"]:checked') : [];
        if (checkedBoxes.length === 0) {
          alert('請至少勾選一項一定規模通報項目！');
          return;
        }

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

    function generateScaleFinalSummary() {
      const summaryContainer = document.getElementById('scaleSummaryContainer');
      const itemsContainer = document.getElementById('scaleSelectedItemsSummary');
      if (!summaryContainer || !itemsContainer) return;

      const projectName = document.getElementById('scaleProjectName')?.value || '未填寫';
      const buildingPermit = document.getElementById('scaleBuildingPermit')?.value || '無 (選填)';
      const siteAddress = document.getElementById('scaleSiteAddress')?.value || '未填寫';
      const isMajor = document.getElementById('scaleReportKind')?.value === 'major';
      const reportKindText = isMajor ? '重大變更' : '新增通報';
      const startDate = document.getElementById('scaleStartDate')?.value || '2026-09-25';
      const endDate = document.getElementById('scaleEndDate')?.value || '2027-03-31';

      const city = document.getElementById('scaleCitySelect')?.value || '';
      const dist = document.getElementById('scaleDistSelect')?.value || '';
      const admin = document.getElementById('scaleAdminUnit')?.value || '';
      const primaryUnit = document.getElementById('scalePrimaryUnit')?.value || '';
      const taxId = document.getElementById('scaleTaxId')?.value || '無統編/自營';
      const contact = document.getElementById('scaleContact')?.value || '';
      const phone = document.getElementById('scalePhone')?.value || '';
      const workers = document.getElementById('scaleWorkerCount')?.value || '1';

      const notifierCompany = document.getElementById('scaleNotifierCompany')?.value || '未填寫';
      const notifierPhone = document.getElementById('scaleNotifierPhone')?.value || '未填寫';
      const relation = document.getElementById('scaleRelation')?.value || '自行作業';

      // 彙整工程地址、GPS 與附加點位
      const locList = [];
      const mainAddr = document.getElementById('scaleEngineeringAddress')?.value?.trim() || '';
      const mainGps = document.getElementById('scaleEngineeringGps')?.value?.trim() || '';
      if (mainAddr || mainGps) {
        let str = '<strong>工程地址：</strong> ' + (mainAddr || '未填寫地址');
        if (mainGps) str += ` <span style="color:#0288d1; font-weight:600; font-size: 14.5px;">(GPS: ${mainGps})</span>`;
        locList.push(str);
      }
      document.querySelectorAll('#scaleExtraPointsContainer .extra-point-row').forEach((row, idx) => {
        const desc = row.querySelector('.extra-point-desc')?.value?.trim() || '';
        const gps = row.querySelector('.extra-point-gps')?.value?.trim() || '';
        if (desc || gps) {
          let str = `<strong>附加點位 ${idx + 1}：</strong> ${desc || '未填寫說明'}`;
          if (gps) str += ` <span style="color:#0288d1; font-weight:600; font-size: 14.5px;">(GPS: ${gps})</span>`;
          locList.push(str);
        }
      });
      const locationSummary = locList.length > 0 ? locList.join('<br>') : '未填寫施工地點';

      // 跨轄區
      const isCross = document.getElementById('scaleCrossCheck')?.checked;
      const crossAdmins = [];
      if (isCross) {
        document.querySelectorAll('#scaleCrossAdminContainer .cross-admin-cb:checked').forEach(cb => crossAdmins.push(cb.value));
      }

      

      summaryContainer.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:18px; font-size: 15.5px; line-height: 1.7;">
          <div><strong>工程名稱：</strong> <span style="color:#1d4ed8; font-weight:700; font-size: 17px;">${projectName}</span></div>
          <div><strong>建照字號：</strong> <span style="color:#334155; font-weight:600;">${buildingPermit}</span></div>
          <div style="grid-column:span 2;"><strong>基地地號/地址：</strong> <span style="color:#1e293b; font-weight:600;">${siteAddress}</span></div>
          <div><strong>通報種類：</strong> <span style="color:#0288d1; font-weight:600;">${reportKindText}</span></div>
          <div><strong>預定開始日：</strong> <span style="color:#059669; font-weight:600;">${startDate}</span></div>
          <div><strong>所在地區與管轄單位：</strong> <span style="color:#334155;">${city} ${dist} (${admin})</span></div>
          <div><strong>跨轄區副知機關：</strong> ${isCross ? (crossAdmins.length > 0 ? crossAdmins.join('、') : '<span style="color:#f59e0b;">已勾選跨轄區，未指定副知單位</span>') : '無 (非跨轄區)'}</div>
          <div style="grid-column:span 2;"><strong>工程地點與 GPS 座標：</strong> <div style="margin-top:6px; padding:12px 16px; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; line-height:1.75; font-size: 15px; color:#334155;">${locationSummary}</div></div>
          <div><strong>作業單位：</strong> ${primaryUnit} (統編: ${taxId})</div>
          <div><strong>現場聯絡人：</strong> ${contact} (電話: ${phone})</div>
          <div><strong>現場作業人數：</strong> 約 ${workers} 人</div>
          <div style="grid-column:span 2; border-top:1px dashed #cbd5e1; padding-top:10px; margin-top:6px;">
            <strong>通報者資訊：</strong> ${notifierCompany} (行動電話: ${notifierPhone || '未填寫'}，關係: ${relation})
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
        const items = [];
        document.querySelectorAll('#scaleItemsChange .checkbox-item').forEach(item => {
          const mainCb = item.querySelector('.main-category-label input[type="checkbox"]');
          if (mainCb && mainCb.checked) {
            const subList = [];
            item.querySelectorAll('.sub-items-container input[type="checkbox"]:checked').forEach(cb => {
              const label = cb.getAttribute('data-reason') || cb.parentNode.textContent.trim();
              const ta = item.querySelector(`.scale-reason-textarea[data-for="${label}"]`);
              const reason = ta?.value?.trim() || '未填寫原因說明';
              subList.push(`
                <li style="margin-bottom:8px;">
                  <strong style="font-size: 15.5px;">${label}</strong>
                  <div style="background:#f1f5f9; padding: 8px 12px; border-radius:4px; font-size: 14.5px; color:#475569; margin-top:3px;">變更原因：${reason}</div>
                </li>
              `);
            });
            if (subList.length > 0) {
              items.push(`
                <div style="margin-bottom:10px;">
                  <div style="font-weight:700; color:#1e293b; font-size: 16.5px;">一、變更規模相較以下情境達50%以上者：</div>
                  <ul style="margin:6px 0 0 24px; padding:0; color:#334155; font-size: 15px; line-height: 1.65;">
                    ${subList.join('')}
                  </ul>
                </div>
              `);
            }
          } else if (!mainCb) {
            const cb = item.querySelector('input[type="checkbox"]');
            if (cb && cb.checked) {
              items.push(`<div style="font-weight:600; color:#1e293b; margin-bottom:8px; font-size: 15.5px;">✔ ${item.textContent.trim()}</div>`);
            }
          }
        });
        selectedHtml = items.length > 0 ? items.join('') : '<span style="color:#64748b; font-size: 15px;">未勾選重大變更項目</span>';
      }

      itemsContainer.innerHTML = `
        <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:16px 20px; line-height:1.65; font-size: 15.5px;">
          ${selectedHtml}
        </div>
      `;
    }

    function submitScaleFlow() {
      const projName = document.getElementById('scaleProjectName')?.value || '一定規模營造工程標案';
      if (currentScaleMode === 'edit') {
        const caseNo = currentScaleCaseNo || 'SC-115-09005';
        alert(`🎉【一定規模作業案件資料已更新】！\n\n案件編號：${caseNo}\n工程名稱：${projName}\n資料異動已即時同步主管檢查機關列管！`);
      } else {
        const randomNo = 'SCALE-2026' + String(Math.floor(Math.random() * 9000 + 1000));
        alert(`🎉【一定規模以上營造業通報完成】！\n\n案件編號：${randomNo}\n工程名稱：${projName}\n主管檢查機構已即時收件列管備查！`);
      }
      closeVDialog();

      if (typeof renderView === 'function') {
        renderView('caseSearch');
      }
    }

    function populateScaleCaseData(data) {
      if (!data) return;

      // 1. 通報者資訊
      const notComp = document.getElementById('scaleNotifierCompany');
      if (notComp && data.notifierCompany) notComp.value = data.notifierCompany;
      const notPhone = document.getElementById('scaleNotifierPhone');
      if (notPhone && data.notifierPhone) notPhone.value = data.notifierPhone;
      const notRel = document.getElementById('scaleRelation');
      if (notRel && data.relation) notRel.value = data.relation;

      // 2. 縣市與單位
      const citySel = document.getElementById('scaleCitySelect');
      if (citySel && data.city) {
        citySel.value = data.city;
        const distSel = document.getElementById('scaleDistSelect');
        if (distSel && data.dist) distSel.value = data.dist;
      }
      const adminSel = document.getElementById('scaleAdminUnit');
      if (adminSel && data.adminOffice) adminSel.value = data.adminOffice;

      // 3. 作業單位
      const priUnit = document.getElementById('scalePrimaryUnit');
      if (priUnit && data.contractorUnit) priUnit.value = data.contractorUnit;
      const taxIdEl = document.getElementById('scaleTaxId');
      if (taxIdEl && data.contractorTaxId) taxIdEl.value = data.contractorTaxId;

      // 4. 地址與 GPS
      if (data.locations && data.locations.length > 0) {
        const loc0 = data.locations[0];
        const addrEl = document.getElementById('scaleEngineeringAddress');
        if (addrEl && loc0.address) addrEl.value = loc0.address;
        const gpsEl = document.getElementById('scaleEngineeringGps');
        if (gpsEl && loc0.gps) gpsEl.value = loc0.gps;
        const contactEl = document.getElementById('scaleContact');
        if (contactEl && loc0.contact) contactEl.value = loc0.contact;
        const phoneEl = document.getElementById('scalePhone');
        if (phoneEl && loc0.phone) phoneEl.value = loc0.phone;
        const workerEl = document.getElementById('scaleWorkerCount');
        if (workerEl && loc0.workers) workerEl.value = loc0.workers;
        const noteEl = document.getElementById('scaleNote');
        if (noteEl && loc0.note) noteEl.value = loc0.note;
      }

      // 5. 第二步：工程名稱、建照、通報種類
      const projNameEl = document.getElementById('scaleProjectName');
      if (projNameEl && (data.projectName || data.workName)) projNameEl.value = data.projectName || data.workName;
      const permitEl = document.getElementById('scaleBuildingPermit');
      if (permitEl && data.buildingPermit) permitEl.value = data.buildingPermit;
      const siteAddrEl = document.getElementById('scaleSiteAddress');
      if (siteAddrEl) siteAddrEl.value = data.siteAddress || (data.locations && data.locations[0] && data.locations[0].address) || '臺北市大安區復興段二小段120地號';
      const kindEl = document.getElementById('scaleReportKind');
      if (kindEl && data.reportKind) {
        kindEl.value = data.reportKind;
        toggleScaleCivilItems();
      }

      if (data.startDate) {
        const sDate = document.getElementById('scaleStartDate');
        if (sDate) sDate.value = data.startDate;
      }
    }

    /**
     * 一定規模作業線上通報主入口 (比照危險作業通報三階段模式)
     */
    function openScaleCaseDialog(mode = 'add', caseParam = null) {
      currentScaleMode = (mode === 'edit') ? 'edit' : 'add';
      currentScaleStep = 1;

      let caseData = null;
      let dialogTitle = '新增一定規模作業線上通報';
      let dialogMsg = '※ 依工程安全設計及統合管理辦法第三條及第十九條規定通報工程';
      let submitBtnText = '✔ 確認完成通報並送出';

      if (currentScaleMode === 'edit') {
        caseData = getHazardCaseData(caseParam);
        currentScaleCaseNo = caseData.caseNo;
        dialogTitle = `編輯一定規模作業線上通報 <span style="font-size: 12px; color:#2563eb; font-weight:normal;">(案件編號: ${caseData.caseNo})</span>`;
        dialogMsg = '※ 編輯修改已備查/審核中之一定規模營造工程通報資料與施工期程';
        submitBtnText = '✔ 確認儲存變更';
      } else {
        currentScaleCaseNo = '';
      }

      const bodyHtml = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <!-- 三階段進度條 -->
          <div class="flow-steps">
            <div class="flow-step active" id="scaleStep1Indicator">
              <span class="step-num">1</span>第一步：作業／填報者資訊
            </div>
            <div class="flow-step" id="scaleStep2Indicator">
              <span class="step-num">2</span>第二步：選擇通報作業
            </div>
            <div class="flow-step" id="scaleStep3Indicator">
              <span class="step-num">3</span>第三步：資料確認送出
            </div>
          </div>

          <!-- =========================================================
           * 第一步 Pane：作業／填報者資訊 (完全比照危險作業通報)
           * ========================================================= -->
          <div id="scaleStep1Pane" class="step-pane active">
            <div class="dispatch-tip">
              <strong>📋 步驟一說明：</strong> 請填寫通報者資訊、工程所在地與管轄單位、作業事業單位及作業位置。填寫完畢後點擊「下一步」設定工程標案資訊與通報項目。
            </div>

            <!-- 通報者資訊 -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
              <h4 style="margin:0 0 12px 0; color:#1e293b; font-size: 14.5px; display:flex; align-items:center; gap:8px;">
                <span style="display:inline-block; width:4px; height:16px; background:#2563eb; border-radius:2px;"></span>
                通報者資訊
              </h4>
              <div style="display:flex; flex-direction:column; gap:14px;">
                <div class="form-field-group">
                  <label>事業單位名稱 <span class="form-req">*</span></label>
                  <input type="text" class="search-input" id="scaleNotifierCompany" value="大安建設股份有限公司" placeholder="請輸入通報者事業單位名稱" required>
                </div>
                <div class="form-field-group">
                  <label>行動電話 <span style="font-size: 12px; font-weight:normal; color:#64748b;">(選填)</span></label>
                  <input type="tel" class="search-input" id="scaleNotifierPhone" value="0911-223-344" placeholder="請輸入行動電話">
                </div>
                <div class="form-field-group">
                  <label>通報關係 <span class="form-req">*</span></label>
                  <select class="search-input" id="scaleRelation">
                    <option value="自行作業" selected>自行作業</option>
                    <option value="交付承攬">交付承攬</option>
                  </select>
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
                  <label>監管單位（縣市） <span class="form-req">*</span></label>
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

            <!-- 作業單位資訊 -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
              <h4 style="margin:0 0 12px 0; color:#1e293b; font-size: 14.5px; display:flex; align-items:center; gap:8px;">
                <span style="display:inline-block; width:4px; height:16px; background:#2563eb; border-radius:2px;"></span>
                作業單位資訊
              </h4>
              <div style="display:flex; flex-direction:column; gap:14px;">
                <div class="form-field-group">
                  <label>作業單位 <span class="form-req">*</span></label>
                  <input type="text" class="search-input" id="scalePrimaryUnit" value="大安建設股份有限公司 (統包)" required>
                </div>
                <div class="form-field-group">
                  <label>統一編號</label>
                  <input type="text" class="search-input" id="scaleTaxId" value="12345678" placeholder="8碼統編">
                </div>
                
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
              <strong>📋 步驟二說明：</strong> 請輸入工程名稱、建照字號、選擇通報種類（新增／重大變更），設定預定開始日，並勾選符合之一定規模通報項目。
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
                  <label>基地地號/地址 <span class="form-req">*</span></label>
                  <input type="text" class="search-input" id="scaleSiteAddress" value="臺北市大安區復興段二小段120地號" placeholder="請輸入基地地號或地址" required>
                </div>
                <div class="form-field-group">
                  <label>通報種類 <span class="form-req">*</span></label>
                  <select class="search-input" id="scaleReportKind" onchange="toggleScaleCivilItems()">
                    <option value="new" selected>新增</option>
                    <option value="major">重大變更</option>
                  </select>
                </div>

                <!-- 預定開始日 (單選) -->
                <div class="form-field-group">
                  <label>預定開始日 <span class="form-req">*</span></label>
                  <input type="date" class="search-input" id="scaleStartDate" value="2026-09-25" style="max-width:240px; font-size:14px; padding: 6px 10px;" required>
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
                <!-- 一、變更規模相較以下情境達50%以上者： -->
                <div class="checkbox-item">
                  <label class="main-category-label">
                    <input type="checkbox" onchange="toggleScaleSubItems(this)" checked> 一、變更規模相較以下情境達50%以上者：
                  </label>
                  <div class="sub-items-container active" style="display:flex; flex-direction:column; gap:10px;">
                    <div>
                      <label><input type="checkbox" data-reason="工程金額" onchange="toggleScaleReasonBox(this)"> 工程金額</label>
                      <textarea class="form-control scale-reason-textarea" data-for="工程金額" maxlength="500" rows="2" placeholder="請說明變更原因（500字以內）" style="display:none; width:100%; margin-top:6px; box-sizing:border-box; border:1px solid #cbd5e1; border-radius:4px; padding: 6px 10px; font-size: 13px;"></textarea>
                    </div>
                    <div>
                      <label><input type="checkbox" data-reason="建築高度" onchange="toggleScaleReasonBox(this)"> 建築高度</label>
                      <textarea class="form-control scale-reason-textarea" data-for="建築高度" maxlength="500" rows="2" placeholder="請說明變更原因（500字以內）" style="display:none; width:100%; margin-top:6px; box-sizing:border-box; border:1px solid #cbd5e1; border-radius:4px; padding: 6px 10px; font-size: 13px;"></textarea>
                    </div>
                    <div>
                      <label><input type="checkbox" data-reason="開挖深度" onchange="toggleScaleReasonBox(this)"> 開挖深度</label>
                      <textarea class="form-control scale-reason-textarea" data-for="開挖深度" maxlength="500" rows="2" placeholder="請說明變更原因（500字以內）" style="display:none; width:100%; margin-top:6px; box-sizing:border-box; border:1px solid #cbd5e1; border-radius:4px; padding: 6px 10px; font-size: 13px;"></textarea>
                    </div>
                    <div>
                      <label><input type="checkbox" data-reason="基地面積" onchange="toggleScaleReasonBox(this)"> 基地面積</label>
                      <textarea class="form-control scale-reason-textarea" data-for="基地面積" maxlength="500" rows="2" placeholder="請說明變更原因（500字以內）" style="display:none; width:100%; margin-top:6px; box-sizing:border-box; border:1px solid #cbd5e1; border-radius:4px; padding: 6px 10px; font-size: 13px;"></textarea>
                    </div>
                    <div>
                      <label><input type="checkbox" data-reason="橋梁或隧道長度" onchange="toggleScaleReasonBox(this)"> 橋梁或隧道長度</label>
                      <textarea class="form-control scale-reason-textarea" data-for="橋梁或隧道長度" maxlength="500" rows="2" placeholder="請說明變更原因（500字以內）" style="display:none; width:100%; margin-top:6px; box-sizing:border-box; border:1px solid #cbd5e1; border-radius:4px; padding: 6px 10px; font-size: 13px;"></textarea>
                    </div>
                  </div>
                </div>

                <!-- 二、其他經中央主管機關指定公告之工程變更 -->
                <div class="checkbox-item">
                  <label><input type="checkbox" value="其他經中央主管機關指定公告之工程變更"> 二、其他經中央主管機關指定公告之工程變更</label>
                </div>
              </div>
            </div>

            <!-- 第二步底部按鈕 -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
              <button type="button" class="btn-search" style="background:#64748b; color:#ffffff;" onclick="switchScaleStep(1)">
                ⬅ 上一步：作業／填報者資訊
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
              <strong>⚠️ 步驟三確認：</strong> 請核對以下一定規模營造工程通報資料，確認無誤後點擊送出按鈕，主管勞檢機構將即時列管受理。
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
                ${submitBtnText}
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

      if (currentScaleMode === 'edit' && caseData) {
        setTimeout(() => {
          populateScaleCaseData(caseData);
        }, 30);
      }
    }

    window.openScaleCaseDialog = openScaleCaseDialog;
    window.switchScaleStep = switchScaleStep;
    window.toggleScaleCivilItems = toggleScaleCivilItems;
    window.toggleScaleReasonBox = toggleScaleReasonBox;
    window.toggleScaleSubItems = toggleScaleSubItems;
    window.addScaleExtraPoint = addScaleExtraPoint;
    window.generateScaleFinalSummary = generateScaleFinalSummary;
    window.submitScaleFlow = submitScaleFlow;


    /**
     * 編輯通報案件資料：同新增畫面，採用完整三階段危險作業線上通報流程
     */
    /**
     * 編輯通報案件資料：依案件類型自動對應「一定規模作業通報」或「危險作業線上通報」三階段流程
     */
    function openCaseEditDialog(caseNo, workName) {
      const caseData = getHazardCaseData(caseNo);
      if (caseData && (caseData.caseType === 'scale' || caseNo.includes('SCALE') || caseNo.includes('SC-') || caseNo.includes('005'))) {
        openScaleCaseDialog('edit', caseNo);
      } else {
        openHazardCaseDialog('edit', { caseNo, workName });
      }
    }

// =========================================================
// 全域函式與資料庫物件導出
// =========================================================
// window.HH_GEO_DATA already exported in geo_data.js
// window.DEMO_HAZARD_CASES already exported in dangerous_report.js
// window.getHazardCaseData already exported in dangerous_report.js
window.openCaseEditDialog = openCaseEditDialog;

// 全域導出
window.toggleScaleCivilItems = toggleScaleCivilItems;
window.toggleScaleReasonBox = toggleScaleReasonBox;
window.toggleScaleSubItems = toggleScaleSubItems;
window.addScaleExtraPoint = addScaleExtraPoint;
window.switchScaleStep = switchScaleStep;
window.generateScaleFinalSummary = generateScaleFinalSummary;
window.submitScaleFlow = submitScaleFlow;
window.populateScaleCaseData = populateScaleCaseData;
window.openScaleCaseDialog = openScaleCaseDialog;
