let currentHhStep = 1;
/* =========================================================
 * dangerous_report.js - 危險作業線上通報四階段通報流程 (Step 1~4)
 * ========================================================= */
    function validateHhWorkInfo() {
        const city = document.getElementById('hhCitySelect')?.value?.trim();
        const primaryUnit = document.getElementById('hhPrimaryUnit')?.value?.trim();
        const contact = document.getElementById('hhContact')?.value?.trim();
        const phone = document.getElementById('hhPhone')?.value?.trim();
        const notifierCompany = document.getElementById('hhNotifierCompany')?.value?.trim();
        const notifierPhone = document.getElementById('hhNotifierPhone')?.value?.trim();


        if (!city) {
          alert('請選擇作業縣市！');
          return false;
        }
        const addrVal = document.getElementById('hhEngineeringAddress')?.value?.trim();
        const gpsVal = document.getElementById('hhEngineeringGps')?.value?.trim();
        if (!addrVal && !gpsVal) {
          alert('作業地址或 GPS 位置請擇一填寫！');
          return false;
        }
        if (!document.getElementById('hhDistSelect')?.value) {
          alert('請選擇鄉鎮市區');
          return false;
        }
        if (document.getElementById('hhInPark')?.checked && !document.getElementById('hhPark')?.value) {
          alert('請選擇與所在地縣市相符的產業園區');
          return false;
        }
        if (!document.getElementById('hhAdminUnit')?.value) {
          alert('請選擇所屬勞動檢查單位');
          return false;
        }
        if (!primaryUnit) {
          alert('請輸入實際作業者的事業單位名稱！');
          return false;
        }
        if (document.getElementById('hhRelation')?.checked) {
          const contractorNames = [...document.querySelectorAll('#hhContractorRows .contractor-input')]
            .map(inp => inp.value.trim()).filter(Boolean);
          if (!contractorNames.length) {
            alert('交付承攬時請先以＋新增至少一個承攬商');
            return false;
          }
        }
        if (!contact || !phone) {
          alert('請輸入工作場所負責人（聯絡人）姓名與聯絡電話！');
          return false;
        }
        if (!notifierCompany?.trim()) {
          alert('請輸入通報者事業單位名稱！');
          return false;
        }
        if (!notifierPhone?.trim()) {
          alert('請輸入通報者聯絡電話！');
          document.getElementById('hhNotifierPhone')?.focus();
          return false;
        }
        const notifierName = document.getElementById('hhNotifierName');
        if (!notifierName?.value.trim()) {
          alert('請輸入通報人（職稱）！');
          notifierName?.focus();
          return false;
        }
        const workers = document.getElementById('hhWorkerCount');
        if (!workers || !/^\d+$/.test(workers.value) || !Number.isSafeInteger(Number(workers.value)) || Number(workers.value) < 1) {
          alert('請輸入大於零的整數作業人數！');
          workers?.focus();
          return false;
        }
      return true;
    }

    function validateHhWorkSelection() {
        const workName = document.getElementById('hhWorkName')?.value;
        if (!workName || !workName.trim()) {
          alert('請輸入本次通報作業名稱！');
          document.getElementById('hhWorkName')?.focus();
          return false;
        }
        const periodStart = document.getElementById('hhStartDate')?.value;
        const periodEnd = document.getElementById('hhEndDate')?.value;
        if (!periodStart || !periodEnd) {
          alert('請選擇預期作業期間的起日與迄日');
          return false;
        }
        const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value+'T00:00:00Z')) && new Date(value+'T00:00:00Z').toISOString().slice(0,10) === value;
        if (!validDate(periodStart) || !validDate(periodEnd)) {
          alert('請選擇有效的作業起日與迄日');
          document.getElementById('hhDateRangeDisplay')?.focus();
          return false;
        }
        if (periodEnd < periodStart) {
          alert('作業迄日不得早於起日');
          return false;
        }

        const incompleteCategory = [...document.querySelectorAll('#hhItemsGroup .checkbox-item')].find(item => item.querySelector('.main-category-label input')?.checked && !item.querySelector('.sub-items-container input:checked'));
        if (incompleteCategory) {
          alert('請在已展開的危害類別中，至少勾選一項實際作業。');
          incompleteCategory.querySelector('.sub-items-container input')?.focus();
          return false;
        }
        const checkedBoxes = document.querySelectorAll('#hhItemsGroup .sub-items-container input[type="checkbox"]:checked');
        if (checkedBoxes.length === 0) {
          alert('請至少勾選一項危險作業！');
          return false;
        }


      return true;
    }

    function switchHazardStep(targetStep) {
      // 關閉日曆彈窗以防懸浮
      closeHhDateRangePicker();

      // 第一步前往第二步時基本驗證
      if (targetStep === 2 && currentHhStep === 1 && !validateHhWorkInfo()) return;

      // 第二步前往第三步時驗證
      if (targetStep === 3 && currentHhStep === 2) {
        if (!validateHhWorkSelection()) return;
        updateHhPeriodReminder();
      }

      if (targetStep === 2 && typeof renderHhLocalWorkTree === 'function') {
        renderHhLocalWorkTree();
      }

      if (targetStep === 4 && currentHhStep === 3) {
        if (!validateHhRiskAssessment()) return;
        generateHhFinalSummary();
      }
      if (targetStep === 3) { syncHhRiskContext(); renderHhRiskFiles('upload'); renderHhRiskFiles('toira'); }
      if (targetStep === 2) { renderPortalOfficeLinks(); updateHhPeriodReminder(); }
      currentHhStep = targetStep;

      // 切換進度列狀態
      for (let i = 1; i <= 4; i++) {
        const ind = document.getElementById(`hhStep${i}Indicator`);
        const pane = document.getElementById(`hhStep${i}Pane`);
        if (ind) {
          if (i === targetStep) ind.className = 'flow-step active';
          else if (i < targetStep) ind.className = 'flow-step completed';
          else ind.className = 'flow-step';
          if (i === targetStep) ind.setAttribute('aria-current', 'step');
          else ind.removeAttribute('aria-current');
        }
        if (pane) {
          if (i === targetStep) pane.classList.add('active');
          else pane.classList.remove('active');
        }
      }

      const modalBody = document.querySelector('.v-dialog-body');
      if (modalBody) modalBody.scrollTop = 0;
      const currentHeading = document.querySelector('#hhStep' + targetStep + 'Pane .dispatch-tip, #hhStep' + targetStep + 'Pane > div');
      if (currentHeading) { currentHeading.setAttribute('tabindex','-1'); currentHeading.focus({preventScroll:true}); }
    }

    /**
     * 生成第四步確認彙總清單 (已更新包含多地址、下拉主管單位、通報者資訊事業單位)
     */
    function getHhReviewReportData() {
      const data = collectHhReportData();
      if (!currentHazardCaseNo) currentHazardCaseNo = createHazardCaseNumber();
      data.caseNo = currentHazardCaseNo;
      const existing = DEMO_HAZARD_CASES[currentHazardCaseNo];
      return {data, version:(existing?.completionNotice?.version || 0) + 1};
    }

    function generateHhFinalSummary() {
      const container = document.getElementById('hhSummaryContainer');
      if (!container) return;
      const {data, version} = getHhReviewReportData();
      const doc = buildHazardReportDocument(data, version);
      container.innerHTML = renderHazardReportDocument(doc, {review:true, email:data.email});
    }

    // 當前危險作業通報模式 ('add' | 'edit') 與編輯中案件編號
    let currentHazardMode = 'add';
    let currentHazardCaseNo = '';
    let hhCaseSequence = 0;
    function createHazardCaseNumber() {
      const today = new Date().toLocaleDateString('sv-SE', {timeZone:'Asia/Taipei'});
      let candidate;
      do {
        candidate = 'RW-' + (Number(today.slice(0,4))-1911) + '-D' + Date.now() + String(++hhCaseSequence).padStart(3,'0');
      } while (Object.prototype.hasOwnProperty.call(DEMO_HAZARD_CASES,candidate) || inspectionCaseCatalog.some(row=>row.id===candidate));
      return candidate;
    }


    // 模擬案件詳細資料集（供編輯模式自動回填完整四步驟通報資料）
    var DEMO_HAZARD_CASES = {
      'RW-115-09001': {
        caseNo: 'RW-115-09001',
        status: '待確認',
        notifierCompany: '大陸工程股份有限公司',
        notifierPhone: '0912-345-678',
        relation: '自行作業',
        city: '新北市',
        dist: '板橋區',
        adminOffice: '新北市政府勞動檢查處',
        contractorUnit: '大陸工程股份有限公司 (統包)',
        contractorTaxId: '11223344',
        workName: '捷運環狀線地下段連續壁開挖作業',
        specialUnit: '新北捷運局工務所',
        startDate: '2026-09-10',
        endDate: '2026-09-25',
        locations: [
          {
            address: '新北市板橋區文化路二段100號 (雙基地出入口)',
            gps: '25.02154, 121.46789',
            contact: '陳主任',
            phone: '0933-112-233',
            workers: '18',
            note: '連續壁地下深度28米，開挖作業每日實施安全巡檢',
            isCross: false
          },
          {
            address: '新北市板橋區文化路二段180號 (通風井基地)',
            gps: '25.02312, 121.46910'
          }
        ],
        categories: ['倒塌'],
        subItems: ['(三)開挖深度達十八公尺以上，且面積達五百平方公尺之開挖作業、擋土支撐組立及拆除作業。'],
        attachments: ['作業安全計畫書核准函.pdf'],
        riskFiles: ['連續壁深開挖風險評估表_大陸工程.pdf', '基坑作業危害辨識檢核表.xlsx']
      },
      'RW-115-09002': {
        caseNo: 'RW-115-09002',
        status: '已備查',
        notifierCompany: '宏達工程帷幕實業股份有限公司',
        notifierPhone: '0922-556-778',
        relation: '交付承攬',
        contractors: ['協成營造工程行'],
        city: '臺中市',
        dist: '西屯區',
        adminOffice: '臺中市勞動檢查處',
        contractorUnit: '宏達工程帷幕實業股份有限公司',
        contractorTaxId: '88776655',
        workName: '高鐵特區商辦外牆帷幕高空吊裝作業',
        specialUnit: '',
        startDate: '2026-09-08',
        endDate: '2026-09-18',
        locations: [
          {
            address: '臺中市西屯區市政北七路99號 (A棟外牆)',
            gps: '24.16234, 120.64012',
            contact: '黃組長',
            phone: '0966-889-900',
            workers: '12',
            note: '外牆吊籠及高空作業車作業，地面已設警戒隔離區',
            isCross: false
          }
        ],
        categories: ['墜落'],
        subItems: ['(六)吊籠作業。'],
        attachments: ['吊籠合格證書及檢驗報告.pdf'],
        riskFiles: ['高空帷幕吊裝作業安全風險評估表.pdf']
      },
      'RW-115-09003': {
        caseNo: 'RW-115-09003',
        status: '待確認',
        notifierCompany: '台塑石化股份有限公司小港廠',
        notifierPhone: '0935-888-999',
        relation: '自行作業',
        city: '高雄市',
        dist: '小港區',
        adminOffice: '高雄市政府勞工局勞動檢查處',
        contractorUnit: '信託機電工程股份有限公司',
        contractorTaxId: '77665544',
        workName: '化學儲槽局限空間內部清掃作業',
        specialUnit: '臨海工業區服務中心',
        startDate: '2026-09-12',
        endDate: '2026-09-14',
        locations: [
          {
            address: '高雄市小港區大業南路36號 (T-102儲槽)',
            gps: '22.54120, 120.35410',
            contact: '張工程師',
            phone: '0910-667-889',
            workers: '6',
            note: '進入前實施通風換氣並測定氧氣及有害氣體濃度',
            isCross: false
          }
        ],
        categories: ['局限空間'],
        subItems: ['(二)廢（污）水處理設施。'],
        attachments: ['氣體測定合格報告單.pdf'],
        riskFiles: ['儲槽局限空間作業風險評估與緊急應變措施.pdf']
      },
      'RW-115-09004': {
        caseNo: 'RW-115-09004',
        status: '取消',
        notifierCompany: '正隆營造事業有限公司',
        notifierPhone: '0918-654-321',
        relation: '自行作業',
        city: '桃園市',
        dist: '龜山區',
        adminOffice: '北區職業安全衛生中心',
        contractorUnit: '正隆營造事業有限公司',
        contractorTaxId: '98765432',
        workName: '既有廠房鋼構屋頂太陽能板拆卸作業',
        specialUnit: '華亞科技園區管理服務中心',
        startDate: '2026-09-05',
        endDate: '2026-09-10',
        locations: [
          {
            address: '桃園市龜山區科技五路168號 (屋頂作業區)',
            gps: '25.04820, 121.36540',
            contact: '林工程師',
            phone: '0922-113-355',
            workers: '5',
            note: '原定高處拆卸作業因作業變更取消施作',
            isCross: false
          }
        ],
        categories: ['墜落'],
        subItems: ['(一)於石綿板、鐵皮板、瓦、木板、茅草、塑膠等易踏穿材料構築之屋頂從事作業。'],
        attachments: [],
        riskFiles: []
      },
      'SC-115-09005': {
        caseNo: 'SC-115-09005',
        caseType: 'scale',
        status: '待確認',
        projectName: '大安區復興段集合住宅新建工程',
        workName: '大安區復興段集合住宅新建工程',
        buildingPermit: '113建字第001234號',
        siteAddress: '臺北市大安區復興段二小段120地號',
        reportKind: 'new',
        notifierCompany: '大安建設股份有限公司',
        notifierPhone: '02-2771-8899',
        relation: '自行作業',
        city: '台北市',
        dist: '大安區',
        adminOffice: '臺北市勞動檢查處',
        contractorUnit: '大安建設股份有限公司 (統包)',
        contractorTaxId: '12345678',
        startDate: '2026-09-25',
        endDate: '2027-03-31',
        locations: [
          {
            address: '台北市大安區復興南路一段100號',
            gps: '25.033964, 121.543475',
            contact: '林工程師',
            phone: '0912-345-678',
            workers: '32',
            note: '地下室深開挖工程，工區鄰近捷運高架段。',
            isCross: false
          }
        ],
        categories: ['新建建築物'],
        scaleItems: ['高度達50公尺以上', '工程造價達新台幣兩億元以上'],
        attachments: ['建造執照核准本.pdf', '交通維持計畫書.pdf'],
        riskFiles: ['深開挖工程安全衛生管理計畫書.pdf']
      },
      'RW-115-09006': {
        caseNo: 'RW-115-09006',
        status: '待確認',
        notifierCompany: '台灣營造工程股份有限公司',
        notifierPhone: '0912-880-116',
        relation: '交付承攬',
        contractors: ['日勝吊裝工程行'],
        city: '新北市',
        dist: '板橋區',
        adminOffice: '新北市政府勞動檢查處',
        contractorUnit: '日勝吊裝工程行',
        contractorTaxId: '55667788',
        workName: '板橋文化路外牆吊掛塗裝作業',
        specialUnit: '',
        startDate: '2026-09-12',
        endDate: '2026-09-20',
        locations: [
          {
            address: '新北市板橋區文化路一段188號',
            gps: '25.01280, 121.46240',
            contact: '吳師傅',
            phone: '0912-888-999',
            workers: '6',
            note: '外牆吊掛塗裝，地面已設警戒',
            isCross: false
          }
        ],
        categories: ['墜落'],
        subItems: ['(六)吊籠作業。'],
        attachments: ['吊籠合格證書及檢驗報告.pdf'],
        riskFiles: ['外牆吊掛塗裝作業風險評估表.pdf']
      },
      'RW-115-09007': {
        caseNo: 'RW-115-09007',
        status: '待確認',
        notifierCompany: '宏達重工實業股份有限公司',
        notifierPhone: '0922-441-207',
        relation: '交付承攬',
        contractors: ['遠東基礎工程股份有限公司'],
        city: '臺中市',
        dist: '南屯區',
        adminOffice: '臺中市勞動檢查處',
        contractorUnit: '遠東基礎工程股份有限公司',
        contractorTaxId: '33445566',
        workName: '西屯廠房鋼構吊裝作業',
        specialUnit: '',
        startDate: '2026-09-16',
        endDate: '2026-09-28',
        locations: [
          {
            address: '臺中市南屯區工業區一路12號',
            gps: '24.14020, 120.62010',
            contact: '陳領班',
            phone: '0933-220-118',
            workers: '9',
            note: '廠房鋼構吊裝，吊掛範圍已淨空',
            isCross: false
          }
        ],
        categories: ['倒塌'],
        subItems: ['(二)高度五十公尺以上施工架組立及拆除作業。'],
        attachments: [],
        riskFiles: ['鋼構吊裝作業風險評估表.pdf']
      }
    };

    function getHazardCaseData(caseParam) {
      if (typeof caseParam === 'string' && DEMO_HAZARD_CASES[caseParam]) {
        return DEMO_HAZARD_CASES[caseParam];
      }
      if (caseParam && typeof caseParam === 'object') {
        if (caseParam.caseNo && DEMO_HAZARD_CASES[caseParam.caseNo]) {
          const matched = JSON.parse(JSON.stringify(DEMO_HAZARD_CASES[caseParam.caseNo]));
          if (!matched.workName && caseParam.workName) matched.workName = caseParam.workName;
          return matched;
        }
        return {
          caseNo: caseParam.caseNo || 'RPT-20260901-001',
          notifierCompany: '台灣營造事業單位股份有限公司',
          notifierPhone: '0911-223-344',
          relation: '自行作業',
          city: '新北市',
          dist: '板橋區',
          adminOffice: '新北市政府勞動檢查處',
          contractorUnit: '國光營造工程股份有限公司',
          contractorTaxId: '54321098',
          workName: caseParam.workName || '高架橋梁外牆防蝕吊掛塗裝作業',
          specialUnit: '交通部公路局第一區養護工程處',
          startDate: '2026-09-10',
          endDate: '2026-09-20',
          locations: [
            {
              address: '新北市板橋區文化路二段182號',
              gps: '25.02345, 121.46890',
              contact: '張工務長',
              phone: '0988-776-655',
              workers: '8',
              note: '高空防蝕噴塗作業，已設置下方交通錐及警戒防護網',
              isCross: false
            }
          ],
          categories: ['墜落'],
          subItems: ['(六)吊籠作業。'],
          attachments: ['高處作業合格防護用具清冊.pdf'],
          riskFiles: ['高架外牆吊掛作業風險評估表.pdf']
        };
      }
      return DEMO_HAZARD_CASES['RW-115-09001'];
    }

    /**
     * 編輯模式：自動回填通報案件資料
     */
    function populateHazardCaseData(data) {
      if (!data) return;

      // 1. 通報者資訊
      const notComp = document.getElementById('hhNotifierCompany');
      const notPhone = document.getElementById('hhNotifierPhone');
      const notName = document.getElementById('hhNotifierName');
      if (notName) notName.value = data.notifierName || '';
      if (notPhone) notPhone.value = data.notifierPhone || '';
      if (notComp) {
        if (data.notifierCompany) notComp.value = data.notifierCompany;
        notComp.dataset.userEdited = notComp.value.trim() ? '1' : '';
      }
      const rel = document.getElementById('hhRelation');
      if (rel) rel.checked = data.relation === '交付承攬';

      // 2. 所在地區與管轄單位
      const citySel = document.getElementById('hhCitySelect');
      if (citySel && data.city) {
        citySel.value = String(data.city).replace(/臺/g, '台');
        if (typeof onHhCityChange === 'function') onHhCityChange();
      }
      const distSel = document.getElementById('hhDistSelect');
      if (distSel && data.dist) distSel.value = String(data.dist).replace(/臺/g, '台');
      const adminUnit = document.getElementById('hhAdminUnit');
      if (adminUnit && data.adminOffice) adminUnit.value = data.adminOffice;

      const inPark = document.getElementById('hhInPark');
      const parkSel = document.getElementById('hhPark');
      if (inPark && data.industrialPark) {
        inPark.checked = true;
        if (typeof toggleHhParkPicker === 'function') toggleHhParkPicker();
        if (parkSel) parkSel.value = data.industrialPark;
      }

      // 3. 作業單位資訊
      const primUnit = document.getElementById('hhPrimaryUnit');
      if (primUnit) primUnit.value = data.contractorUnit || '';
      const taxId = document.getElementById('hhTaxId');
      if (taxId) taxId.value = data.contractorTaxId || '';
      const rows = document.getElementById('hhContractorRows');
      if (rows) {
        rows.innerHTML = '';
        const names = Array.isArray(data.contractors) ? data.contractors.filter(Boolean) : [];
        names.forEach(name => {
          if (typeof addContractorUnit === 'function') addContractorUnit();
          const inputs = rows.querySelectorAll('.contractor-input');
          const last = inputs[inputs.length - 1];
          if (last) last.value = name;
        });
      }

      onHhRelationChange();

      // 4. 作業位置 (第一工區與後續工區)
      if (data.locations && data.locations.length > 0) {
        const loc0 = data.locations[0];
        const firstAddr = document.querySelector('.hh-addr-val');
        if (firstAddr && loc0.address) firstAddr.value = loc0.address;
        const firstGps = document.querySelector('.hh-gps-val');
        if (firstGps && loc0.gps) firstGps.value = loc0.gps;
        const contact = document.getElementById('hhContact');
        if (contact) contact.value = loc0.contact || '';
        const phone = document.getElementById('hhPhone');
        if (phone) phone.value = loc0.phone || '';
        const count = document.getElementById('hhWorkerCount');
        if (count) count.value = loc0.workers || '';
        const note = document.getElementById('hhNote');
        if (note) note.value = loc0.note || '';

        // 主要地址與 GPS 回填
        const mainAddrEl = document.getElementById('hhEngineeringAddress');
        const mainGpsEl = document.getElementById('hhEngineeringGps');
        if (mainAddrEl) mainAddrEl.value = loc0.address || '';
        if (mainGpsEl) mainGpsEl.value = loc0.gps || '';

        // 若有後續工區，自動加入為附加點位
        const extraContainer = document.getElementById('hhExtraPointsContainer');
        if (extraContainer) {
          extraContainer.innerHTML = '';
          for (let i = 1; i < data.locations.length; i++) {
            const loc = data.locations[i];
            addExtraPoint(loc.address || '', loc.gps || '', loc);
          }
          if (data.locations.length <= 1) {
            addExtraPoint('', '');
          }
        }
      }

      const crossCheck = document.getElementById('hhCrossCheck');
      if (crossCheck) { crossCheck.checked = !!data.locations?.[0]?.isCross; toggleCrossAdminList(crossCheck); }
      document.querySelectorAll('.cross-admin-cb').forEach(cb=>{ cb.checked = (data.locations?.[0]?.crossAdmins || []).includes(cb.value); });
      // 一般附件
      const existingAttachmentList = document.getElementById('hhAttachmentList');
      if (existingAttachmentList) existingAttachmentList.innerHTML = '';
      if (data.attachments && data.attachments.length > 0) {
        const listEl = document.getElementById('hhAttachmentList');
        if (listEl) {
          listEl.innerHTML = '';
          data.attachments.forEach(fname => {
            const item = document.createElement('div');
            item.className = 'hh-att-item';
            item.style.cssText = 'display:inline-flex; align-items:center; gap:6px; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:4px; padding:3px 8px; font-size: 12px; color:#1e293b;';
            item.innerHTML = `📎 <span class="hh-att-name">${portalEscape(fname)}</span> <button type="button" onclick="this.parentElement.remove()" style="border:none; background:transparent; color:#ef4444; cursor:pointer; font-weight:bold; padding:0 2px;">×</button>`;
            listEl.appendChild(item);
          });
        }
      }

      // 5. 第二步：作業名稱、地方特色指定監管單位、預期作業期間
      const workName = document.getElementById('hhWorkName');
      if (workName && data.workName) workName.value = data.workName;
      if (data.startDate && data.endDate) {
        const sDate = document.getElementById('hhStartDate');
        const eDate = document.getElementById('hhEndDate');
        const dVal = document.getElementById('hhDateRangeVal');
        if (sDate) sDate.value = data.startDate;
        if (eDate) eDate.value = data.endDate;
        if (dVal) dVal.textContent = `${data.startDate} ～ ${data.endDate}`;
      }

      // 危險作業勾選回填
      if (data.categories || data.subItems) {
        document.querySelectorAll('#hhItemsGroup .checkbox-item').forEach(itemCard => {
          const cat = itemCard.getAttribute('data-category');
          const mainCb = itemCard.querySelector('.main-category-label input[type="checkbox"]');
          const subContainer = itemCard.querySelector('.sub-items-container');
          const isCatSelected = data.categories && data.categories.includes(cat);

          if (mainCb) {
            mainCb.checked = isCatSelected;
          }
          if (subContainer) {
            if (isCatSelected) {
              subContainer.classList.add('active');
              subContainer.style.display = 'flex';
            } else {
              subContainer.classList.remove('active');
              subContainer.style.display = 'none';
            }

            subContainer.querySelectorAll('label').forEach(subLabel => {
              const subCb = subLabel.querySelector('input[type="checkbox"]');
              const text = subLabel.textContent.trim();
              if (subCb) {
                const isSubSelected = data.subItems && data.subItems.some(sub => {
                  // Preserve reports saved before the rope-work label was aligned with the statute.
                  const savedText = sub.replace('設施規則第二百二十五條第二項所定之繩索作業', '第二百二十五條第二項所定之繩索作業');
                  return text.includes(savedText) || savedText.includes(text);
                });
                subCb.checked = isSubSelected;
              }
            });
          }
        });
      }

    }

    function validateHhNotificationEmail() {
      const input = document.getElementById('hhNotificationEmail');
      const error = document.getElementById('hhNotificationEmailError');
      input.value = input.value.trim();
      const message = !input.value ? '請輸入收件電子郵件。' : !input.validity.valid ? '請輸入單一有效的電子郵件地址。' : '';
      error.textContent = message;
      error.hidden = !message;
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (message) { input.scrollIntoView({block:'center'}); input.focus({preventScroll:true}); }
      return !message;
    }

    function submitHazardFlow() {
      if (currentHhStep !== 4) return;
      const existing = DEMO_HAZARD_CASES[currentHazardCaseNo];
      if (currentHazardMode === 'edit' && (!existing || existing.status === '取消')) {
        alert('此案件不存在或已取消，無法儲存變更。請返回案件列表重新查詢。');
        return;
      }
      if (currentHazardMode !== 'edit' && existing) {
        alert('案件編號已存在，未覆寫原案件。請重新開啟新增通報。');
        return;
      }
      if (!validateHhWorkInfo()) { switchHazardStep(1); if (!document.getElementById('hhNotifierName')?.value.trim()) document.getElementById('hhNotifierName')?.focus(); return; }
      if (!validateHhWorkSelection()) { switchHazardStep(2); return; }
      if (!validateHhRiskAssessment()) { switchHazardStep(3); return; }
      if (!validateHhNotificationEmail()) return;
      const data = collectHhReportData();
      const today = new Date().toLocaleDateString('sv-SE', {timeZone:'Asia/Taipei'});
      const caseNo = currentHazardCaseNo || createHazardCaseNumber();
      data.caseNo = caseNo;
      data.status = existing?.status || '待確認';
      DEMO_HAZARD_CASES[caseNo] = {...existing,...data};
      const submitted = DEMO_HAZARD_CASES[caseNo];
      submitted.submittedAt = new Date().toLocaleString('zh-TW', {timeZone:'Asia/Taipei',hour12:false});
      const history = Array.isArray(existing?.completionNoticeHistory) ? [...existing.completionNoticeHistory] : [];
      if (existing?.completionNotice && !history.some(notice=>notice.version===existing.completionNotice.version)) history.push(existing.completionNotice);
      submitted.completionNoticeHistory = history;
      submitted.completionNotice = createHazardCompletionNotice(submitted, existing?.completionNotice?.version || 0);
      const catalogRow = inspectionCaseCatalog.find(row=>row.id === caseNo);
      const row = {id:caseNo, company:data.notifierCompany, unit:data.contractorUnit, workName:data.workName, region:data.city + data.dist, workRange:hhRocDate(data.startDate) + ' ~ ' + hhRocDate(data.endDate), submitDate:catalogRow?.submitDate || hhRocDate(today), status:data.status, scale:false};
      if (catalogRow) Object.assign(catalogRow,row);
      else inspectionCaseCatalog.unshift(row);
      const completedTitle = currentHazardMode === 'edit' ? '展示通報資料已更新' : '展示通報已完成';
      closeVDialog();
      renderView('caseSearch');
      document.querySelector('#case-list-wrap tbody tr button')?.focus();
      openVDialog({title:completedTitle,maxWidth:'620px',hideFooter:true,bodyHtml:`<div class="report-completion"><p class="completion-check" aria-hidden="true">✓</p><h3>${completedTitle}</h3><p>案件編號：<strong>${portalEscape(caseNo)}</strong></p><p>作業名稱：${portalEscape(data.workName)}</p><p>通報完成通知收件信箱：${portalEscape(data.email)}</p><p class="completion-note">展示資料保留於本次預覽，尚未送至主管機關，也未寄送電子郵件。</p><button type="button" class="v-btn v-btn-primary" onclick="closeVDialog()">返回案件列表</button></div>`});
    }
    function hhRocDate(value) {
      const [year,month,day] = String(value).split('-');
      return (Number(year) - 1911) + '/' + month + '/' + day;
    }
    function collectHhReportData() {
      const value = id => document.getElementById(id)?.value.trim() || '';
      const riskAssessment = getHhRiskAssessmentData();
      const crossAdmins = document.getElementById('hhCrossCheck').checked ? [...document.querySelectorAll('.cross-admin-cb:checked')].map(cb=>cb.value) : [];
      const firstLocation = {address:value('hhEngineeringAddress'),gps:value('hhEngineeringGps'),contact:value('hhContact'),phone:value('hhPhone'),workers:value('hhWorkerCount'),note:value('hhNote'),isCross:document.getElementById('hhCrossCheck').checked,crossAdmins};
      const extraLocations = [...document.querySelectorAll('#hhExtraPointsContainer .extra-point-row')].map(row=>{
        let saved = {};
        try { saved = JSON.parse(row.dataset.savedLocation || '{}'); } catch { /* New points have no saved metadata. */ }
        return {...saved,address:row.querySelector('.extra-point-desc')?.value.trim() || '',gps:row.querySelector('.extra-point-gps')?.value.trim() || ''};
      }).filter(loc=>loc.address || loc.gps);
      return {email:value('hhNotificationEmail'),notifierCompany:value('hhNotifierCompany'),notifierName:value('hhNotifierName'),notifierPhone:value('hhNotifierPhone'),relation:document.getElementById('hhRelation').checked?'交付承攬':'自行作業',contractors:document.getElementById('hhRelation').checked?[...document.querySelectorAll('#hhContractorRows .contractor-input')].map(inp=>inp.value.trim()).filter(Boolean):[],city:value('hhCitySelect'),dist:value('hhDistSelect'),adminOffice:value('hhAdminUnit'),industrialPark:document.getElementById('hhInPark').checked?value('hhPark'):'',contractorUnit:value('hhPrimaryUnit'),contractorTaxId:value('hhTaxId'),workName:value('hhWorkName'),startDate:value('hhStartDate'),endDate:value('hhEndDate'),locations:[firstLocation,...extraLocations],categories:[...document.querySelectorAll('#hhItemsGroup .checkbox-item')].filter(item=>item.querySelector('.sub-items-container input:checked')).map(item=>item.dataset.category),subItems:[...document.querySelectorAll('#hhItemsGroup .sub-items-container input:checked')].map(cb=>cb.closest('label').textContent.trim()),attachments:[...document.querySelectorAll('#hhAttachmentList .hh-att-name')].map(el=>el.textContent.trim()),riskFiles:riskAssessment.files,riskAssessment};
    }

    /**
     * 危險作業線上通報主入口 (支援 mode = 'add' 新增模式 與 mode = 'edit' 編輯模式)
     */
    function openHazardCaseDialog(mode = 'add', caseParam = null) {
      currentHazardMode = (mode === 'edit') ? 'edit' : 'add';
      currentHhStep = 1;
      resetHhRiskAssessment();

      let caseData = null;
      let dialogTitle = '新增危險作業線上通報';
      let dialogMsg = '※ 依職業安全衛生設施規則第21條之3辦理';
      let submitBtnText = '✔ 確認完成通報並送出';

      if (currentHazardMode === 'edit') {
        const requestedCaseNo = typeof caseParam === 'string' ? caseParam : caseParam?.caseNo;
        if (!requestedCaseNo || !Object.prototype.hasOwnProperty.call(DEMO_HAZARD_CASES,requestedCaseNo)) { alert('找不到此案件，請返回案件列表重新查詢。'); return; }
        caseData = DEMO_HAZARD_CASES[requestedCaseNo];
        if (caseData.status === '取消') { alert('此案件已取消，僅供檢視，無法編輯。'); return; }
        currentHazardCaseNo = caseData.caseNo;
        dialogTitle = `編輯危險作業線上通報 <span style="font-size: 12px; color:#2563eb; font-weight:normal;">(案件編號: ${caseData.caseNo})</span>`;
        dialogMsg = '※ 編輯修改已備查/審核中之通報案件資料與作業防護配置';
        submitBtnText = '✔ 確認儲存變更';
      } else {
        currentHazardCaseNo = '';
      }
      window.__hazardSubmitBtnText = submitBtnText;
      const initialNotificationEmail = caseData?.email?.trim() || roleMenuData[window.currentRole]?.email?.trim() || '';

      let bodyHtml = `
        <div class="hazard-flow" style="display:flex; flex-direction:column; gap:16px;">
          <!-- 四階段進度條 -->
          <div class="flow-steps" aria-label="通報進度">
            <div class="flow-step active" id="hhStep1Indicator" aria-current="step">
              <span class="step-num">1</span>第一步：填報作業資訊
            </div>
            <div class="flow-step" id="hhStep2Indicator">
              <span class="step-num">2</span>第二步：選擇危險作業
            </div>
            <div class="flow-step" id="hhStep3Indicator">
              <span class="step-num">3</span>第三步：實施風險評估
            </div>
            <div class="flow-step" id="hhStep4Indicator">
              <span class="step-num">4</span>第四步：確認通報資料
            </div>
          </div>

          <!-- =========================================================
           * 第一步 Pane：填報作業相關資訊
           * ========================================================= -->
          <div id="hhStep1Pane" class="step-pane active">
            <div class="dispatch-tip">
              <strong>📋 步驟一說明：</strong> 請先填寫通報者資訊、作業者資訊、作業所在地與管轄單位及作業位置。填寫完畢後點擊「下一步」設定作業期間與選擇危險作業。
            </div>

            <!-- 通報者資訊 (移到最上面) -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
              <h4 style="margin:0 0 12px 0; color:#1e293b; font-size: 14.5px; display:flex; align-items:center; gap:8px;">
                <span style="display:inline-block; width:4px; height:16px; background:#2563eb; border-radius:2px;"></span>
                通報者資訊
              </h4>
              <div style="display:flex; flex-direction:column; gap:14px;">
                <div class="form-field-group">
                  <label>事業單位名稱 <span class="form-req">*</span></label>
                  <input type="text" class="search-input" id="hhNotifierCompany" value="台灣營造事業單位股份有限公司" placeholder="預設帶入第一個作業單位，可自行修改" oninput="this.dataset.userEdited='1'" required>
                </div>
                <div class="form-field-group">
                  <label>通報人(職稱) <span class="form-req">*</span></label>
                  <input type="text" class="search-input" id="hhNotifierName" placeholder="請輸入通報人及職稱" autocomplete="name" required>
                </div>
                <div class="form-field-group">
                  <label>聯絡電話 <span class="form-req">*</span></label>
                  <input type="tel" class="search-input" id="hhNotifierPhone" value="0911-223-344" placeholder="請輸入聯絡電話" required>
                </div>
                <div class="form-field-group" style="align-items:flex-start;">
                  <label style="margin-top:4px;">是否交付承攬</label>
                  <div style="flex:1;">
                    <label style="display:inline-flex; align-items:center; gap:8px; font-weight:500; cursor:pointer;">
                      <input type="checkbox" id="hhRelation" onchange="onHhRelationChange()"> 是
                    </label>
                    <div style="font-size:12px; color:#64748b; margin-top:4px;">未勾選為自行作業；勾選後為交付承攬。</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 作業者資訊與承攬清單 -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
              <h4 style="margin:0 0 12px 0; color:#1e293b; font-size: 14.5px; display:flex; align-items:center; gap:8px;">
                <span style="display:inline-block; width:4px; height:16px; background:#2563eb; border-radius:2px;"></span>
                作業者資訊
              </h4>
              <div style="display:flex; flex-direction:column; gap:14px;">
                <div class="form-field-group">
                  <label>事業單位名稱(實際作業者) <span class="form-req">*</span></label>
                  <div style="flex:1; display:flex; gap:8px; align-items:center;">
                    <input type="text" class="search-input" id="hhPrimaryUnit" value="台灣營造事業單位股份有限公司" oninput="syncHhCompanyFromUnit()" required style="flex:1;">
                    <button type="button" title="新增承攬商" onclick="document.getElementById('hhRelation').checked=true; onHhRelationChange(); addContractorUnit()" style="width:36px; height:36px; flex:none; display:flex; align-items:center; justify-content:center; background:#e2e8f0; color:#1e293b; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer; font-weight:700; font-size:18px;">＋</button>
                  </div>
                </div>
                <div id="hhContractorRows" style="display:flex; flex-direction:column; gap:8px;"></div>
                <div class="form-field-group">
                  <label>統一編號</label>
                  <input type="text" class="search-input" id="hhTaxId" value="16541333" placeholder="8碼統編">
                </div>
                <div class="form-field-group">
                  <label>工作場所負責人(聯絡人) <span class="form-req">*</span></label>
                  <input type="text" class="search-input" id="hhContact" value="陳主任" placeholder="請輸入現場聯絡人姓名" required>
                </div>
                <div class="form-field-group">
                  <label>聯絡電話 <span class="form-req">*</span></label>
                  <input type="tel" class="search-input" id="hhPhone" value="0933-112-233" placeholder="手機或現場電話" required>
                </div>
                <div class="form-field-group">
                  <label>作業人數 <span class="form-req">*</span></label>
                  <div style="display:flex; align-items:center; gap:6px;">
                    <input type="number" class="search-input" id="hhWorkerCount" value="18" min="1" style="width:90px;">
                    <span style="color:#64748b;">人</span>
                  </div>
                </div>
                <div class="form-field-group">
                  <label>備註</label>
                  <textarea class="search-input" id="hhNote" rows="2" maxlength="300" placeholder="300字以內">地下深度28米連續壁施作，每日派員確認支撐系統與地下水位。</textarea>
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
                  <label>作業縣市 <span class="form-req">*</span></label>
                  <select class="search-input" id="hhCitySelect" onchange="onHhCityChange()" required>
                    <option value="">請選擇縣市</option>
                    <option value="台北市">臺北市</option>
                    <option value="新北市" selected>新北市</option>
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
                  <select class="search-input" id="hhDistSelect" required>
                    <option value="板橋區" selected>板橋區</option>
                    <option value="三重區">三重區</option>
                    <option value="新莊區">新莊區</option>
                    <option value="中和區">中和區</option>
                    <option value="新店區">新店區</option>
                  </select>
                </div>
              </div>
              <div class="form-field-group" style="margin-top:12px;">
                <label>所屬勞動檢查單位 <span class="form-req">*</span></label>
                <select class="search-input" id="hhAdminUnit" required>
                  <option value="新北市政府勞動檢查處" selected>新北市政府勞動檢查處</option>
                  <option value="臺北市勞動檢查處">臺北市勞動檢查處</option>
                  <option value="桃園市政府勞動檢查處">桃園市政府勞動檢查處</option>
                  <option value="臺中市勞動檢查處">臺中市勞動檢查處</option>
                  <option value="臺南市職安健康處">臺南市職安健康處</option>
                  <option value="高雄市政府勞工局勞動檢查處">高雄市政府勞工局勞動檢查處</option>
                  <option value="勞動部職業安全衛生署北區職業安全衛生中心">勞動部職業安全衛生署北區職業安全衛生中心</option>
                  <option value="勞動部職業安全衛生署中區職業安全衛生中心">勞動部職業安全衛生署中區職業安全衛生中心</option>
                  <option value="勞動部職業安全衛生署南區職業安全衛生中心">勞動部職業安全衛生署南區職業安全衛生中心</option>
                  <option value="國家科學及技術委員會新竹科學園區管理局">國家科學及技術委員會新竹科學園區管理局</option>
                  <option value="國家科學及技術委員會中部科學園區管理局">國家科學及技術委員會中部科學園區管理局</option>
                  <option value="國家科學及技術委員會南部科學園區管理局">國家科學及技術委員會南部科學園區管理局</option>
                  <option value="經濟部產業園區管理局">經濟部產業園區管理局</option>
                </select>
              </div>
            </div>

            <!-- 作業位置 (需求 2: 作業地址和輸入框在同一行，GPS也是) -->
            <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:18px 20px; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
              <!-- 區塊標題與標籤 (地址或 GPS 擇一必填) -->
              <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                <h4 style="margin:0; color:#1d4ed8; font-size:16px; font-weight:700; display:flex; align-items:center; gap:6px;">
                  作業位置
                </h4>
                <span style="background:#fffbeb; color:#b45309; border:1px solid #fde68a; border-radius:4px; padding:3px 8px; font-size: 12px; font-weight:600;">
                  地址或 GPS 擇一必填
                </span>
              </div>
              <hr style="border:0; border-top:1px solid #e2e8f0; margin:0 0 16px 0;">

              <!-- 表單排版容器 -->
              <div style="display:flex; flex-direction:column; gap:16px;">
                <!-- 1. 作業地址 (作業地址和輸入框在同一行) -->
                <div class="form-field-group">
                  <label>作業地址</label>
                  <input type="text" class="search-input hh-addr-val" id="hhEngineeringAddress" value="新北市五股區五工一路3號" placeholder="請輸入作業地址（與 GPS 擇一）">
                </div>

                <div class="form-field-group" style="align-items:flex-start;">
                  <label style="margin-top:4px;">是否位於產業園區</label>
                  <div style="flex:1;">
                    <label style="display:inline-flex; align-items:center; gap:8px; font-weight:500; cursor:pointer;">
                      <input type="checkbox" id="hhInPark" onchange="toggleHhParkPicker()"> 是
                    </label>
                    <div style="font-size:12px; color:#64748b; margin-top:4px; line-height:1.5;">自行確認作業地點是否位於園區範圍；此欄不影響勞動檢查單位的選擇。</div>
                  </div>
                </div>
                <div class="form-field-group" id="hhParkRow" style="display:none;">
                  <label>產業園區名稱 <span class="form-req">*</span></label>
                  <select class="search-input" id="hhPark"><option value="">請先選擇縣市</option></select>
                </div>

                <!-- 2. GPS位置 (GPS和輸入框在同一行) -->
                <div class="form-field-group" style="align-items:flex-start !important;">
                  <label style="margin-top:7px !important;">GPS位置</label>
                  <div style="flex:1; display:flex; flex-direction:column; gap:6px;">
                    <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                      <input type="text" class="search-input hh-gps-val" id="hhEngineeringGps" value="25.0708356, 121.4504537" placeholder="緯度, 經度座標" style="max-width:280px; flex:1;">
                      <button type="button" class="btn-search" style="padding:7px 13px; background:#e2e8f0; color:#1e293b; font-size: 13px; font-weight:600; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer; white-space:nowrap;" onclick="getHhBrowserLocation()">
                        使用瀏覽器取得定位
                      </button>
                      <button type="button" style="padding:7px 13px; background:#f59e0b; color:#ffffff; font-size: 13px; font-weight:700; border:none; border-radius:6px; cursor:pointer; white-space:nowrap; box-shadow:0 1px 2px rgba(0,0,0,0.1);" onclick="openGoogleMapSearch()">
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
                    <!-- 附加點位動態容器 -->
                    <div id="hhExtraPointsContainer" style="display:flex; flex-direction:column; gap:8px;">
                      <div class="extra-point-row" style="display:flex; gap:10px; align-items:center;">
                        <input type="text" class="search-input extra-point-desc" placeholder="路段／說明" style="flex:1;">
                        <input type="text" class="search-input extra-point-gps" placeholder="GPS" style="flex:1;">
                        <button type="button" title="刪除此點位" onclick="removeExtraPoint(this)" style="width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:#e2e8f0; color:#475569; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer; font-weight:bold; font-size:16px;">
                          －
                        </button>
                      </div>
                    </div>

                    <!-- + 新增路段／GPS點位 按鈕 -->
                    <div>
                      <button type="button" class="btn-search" style="padding:6px 14px; background:#e2e8f0; color:#1e293b; font-size: 13px; font-weight:600; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer;" onclick="addExtraPoint()">
                        ＋ 新增路段／GPS點位
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 跨轄區作業勾選 (保留下方附加管轄設定) -->
                <div style="border-top:1px dashed #e2e8f0; padding-top:12px; margin-top:4px;">
                  <label style="display:inline-flex; align-items:center; gap:8px; cursor:pointer; font-size: 12px; font-weight:600; color:#1e293b;">
                    <input type="checkbox" id="hhCrossCheck" onchange="toggleCrossAdminList(this)">
                    <span>本件為跨轄區作業（需副知其他主管勞檢機構）</span>
                  </label>
                  <div id="hhCrossAdminContainer" style="display:none; margin-top:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:12px;">
                    <div style="font-size: 12.5px; color:#475569; margin-bottom:8px; font-weight:600;">請複選協同／副知管轄單位：</div>
                    <div id="hhCrossAdminList" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:6px;"></div>
                  </div>
                </div>

                <!-- 一般附件上傳 -->
                <div style="border-top:1px dashed #e2e8f0; padding-top:12px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <label style="font-size: 12px; font-weight:700; color:#1e293b; margin:0;">📎 一般附件</label>
                    <label class="btn-search" style="cursor:pointer; padding:4px 12px; font-size: 12px; background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; border-radius:4px; margin:0;">
                      選擇檔案上傳 (可複選)
                      <input type="file" id="hhAttachmentInput" multiple accept="image/*,.pdf" onchange="handleHhAttachmentUpload(this)" style="display:none;">
                    </label>
                  </div>
                  <div style="font-size:12px; color:#64748b; margin-bottom:8px;">可上傳 PDF、通風或測氣相片等；每個檔案上限 ${HH_ATTACHMENT_MAX_MB} MB（展示僅記錄檔名）。</div>
                  <p id="hhAttachmentUploadStatus" role="status" aria-live="polite" style="font-size:13px; line-height:1.7;"></p>
                  <div id="hhAttachmentList" style="display:flex; flex-direction:column; gap:6px;">
                    <div class="hh-attachment-item" style="display:flex; align-items:center; justify-content:space-between; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:6px 12px; font-size: 13px;">
                      <span style="display:flex; align-items:center; gap:6px; color:#334155;">
                        <span style="color:#0288d1;">📄</span>
                        <span class="hh-att-name">作業防護平面配置圖.pdf</span>
                        <span style="color:#64748b; font-size: 12px;">(2.4 MB)</span>
                      </span>
                      <button type="button" class="action-btn delete" title="刪除檔案" onclick="this.closest('.hh-attachment-item').remove()" style="width:24px; height:24px; display:flex; align-items:center; justify-content:center; border:none; background:none; color:#dc2626; cursor:pointer; font-weight:bold;">✕</button>
                    </div>
                  </div>
                </div>


              </div>
            </div>

            <!-- 第一步底部按鈕 -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
              <button type="button" class="v-btn v-btn-cancel" onclick="closeVDialog()">取消</button>
              <button type="button" class="btn-add" style="padding:9px 24px; font-size:14px;" onclick="switchHazardStep(2)">
                下一步：選擇危險作業 ➔
              </button>
            </div>
          </div>

          <!-- =========================================================
           * 第二步 Pane：選擇危險作業 (預期作業期間移至此: 需求 2; 選起訖後自動關閉: 需求 7)
           * ========================================================= -->
          <div id="hhStep2Pane" class="step-pane">
            <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:12px 16px; border-radius:6px; color:#1e40af; font-size: 13px; line-height:1.6;">
              <strong>📋 步驟二說明：</strong> 請設定作業名稱與預期作業期間，再選擇本次涉及的危險作業。勾選危害類別後，請勾選實際作業，可複選。
            </div>

            <div class="form-field-group">
              <label>作業名稱 <span class="form-req">*</span></label>
              <input type="text" class="search-input" id="hhWorkName" value="高架鋼構吊裝危險防蝕作業" placeholder="請輸入本次通報作業完整名稱" required>
            </div>

            <!-- 預期作業期間（月曆起迄，維持示範系統） -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
              <h4 style="margin:0 0 12px 0; color:#1e293b; font-size: 14.5px; display:flex; align-items:center; gap:8px;">
                <span style="display:inline-block; width:4px; height:16px; background:#2563eb; border-radius:2px;"></span>
                預期作業期間 <span class="form-req">*</span>
              </h4>
              <div style="position:relative;">
                <div id="hhDateRangeDisplay" role="button" tabindex="0" aria-label="選擇預期作業期間" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click();}" onclick="openHhCalendarPopup(this, { startId: 'hhStartDate', endId: 'hhEndDate', displayId: 'hhDateRangeVal', defaultStart: '2026-09-10', defaultEnd: '2026-09-15', onSelect: updateHhPeriodReminder })" style="display:flex; align-items:center; justify-content:space-between; padding:9px 14px; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer; font-size:14px; font-weight:500; color:#1e293b; user-select:none; transition:border-color 0.2s, box-shadow 0.2s;">
                  <span style="display:flex; align-items:center; gap:8px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span id="hhDateRangeVal">2026-09-10 ～ 2026-09-15</span>
                  </span>
                  <span style="font-size: 12px; color:#64748b; background:#f1f5f9; padding:3px 8px; border-radius:4px;">📅 點擊選擇起訖日</span>
                </div>
                <!-- 隱藏 input 維持相容性 -->
                <input type="hidden" id="hhStartDate" value="2026-09-10">
                <input type="hidden" id="hhEndDate" value="2026-09-15">
              </div>
              <small style="color:#64748b; margin-top:6px; display:block;">※ 依序點選起日與迄日。</small>
              <small id="hhPeriodReminder" class="period-reminder" role="status" hidden>應定期審視作業中風險，必要時重新進行風險評估</small>
            </div>

            <div>
              <h4 style="margin:8px 0 10px 0; font-size: 14.5px; color:#1e293b; display:flex; align-items:center; gap:8px;">
                <span style="display:inline-block; width:4px; height:16px; background:#2563eb; border-radius:2px;"></span>
                勾選欲通報的危險作業 <span class="form-req">*</span> <small style="color:#64748b; font-weight:normal;">(勾選危害類別後，選擇實際作業，可複選)</small>
              </h4>

              <div class="checkbox-group" id="hhItemsGroup">
                <div class="checkbox-item" data-category="墜落">
                  <label class="main-category-label">
                    <input type="checkbox" onchange="toggleSubItems(this)"> 具墜落危險之下列作業：
                  </label>
                  <div class="sub-items-container">
                    <label><input type="checkbox" data-work-id="roof"> (一)於石綿板、鐵皮板、瓦、木板、茅草、塑膠等易踏穿材料構築之屋頂從事作業。</label>
                    <label><input type="checkbox" data-work-id="rope"> (二)第二百二十五條第二項所定之繩索作業。</label>
                    <label><input type="checkbox" data-work-id="tower-crane"> (三)塔式起重機升高及拆卸作業。</label>
                    <label><input type="checkbox" data-work-id="derrick-crane"> (四)人字臂起重桿組拆作業。</label>
                    <label><input type="checkbox" data-work-id="construction-lift"> (五)營建用升降機組裝、維修作業。</label>
                    <label><input type="checkbox" data-work-id="gondola"> (六)吊籠作業。</label>
                    <label><input type="checkbox" data-work-id="filming-edge"> (七)高度在二公尺以上之工作場所邊緣及開口，未能設置護欄、護蓋之影視拍攝作業。</label>
                  </div>
                </div>
                <div class="checkbox-item" data-category="倒塌">
                  <label class="main-category-label">
                    <input type="checkbox" onchange="toggleSubItems(this)"> 具倒塌、崩塌危險之下列作業：
                  </label>
                  <div class="sub-items-container">
                    <label><input type="checkbox" data-work-id="formwork"> (一)模板支撐高度在七公尺以上，且面積達一百平方公尺以上之灌漿作業。</label>
                    <label><input type="checkbox" data-work-id="scaffold"> (二)高度五十公尺以上施工架組立及拆除作業。</label>
                    <label><input type="checkbox" data-work-id="deep-excavation"> (三)開挖深度達十八公尺以上，且面積達五百平方公尺之開挖作業、擋土支撐組立及拆除作業。</label>
                  </div>
                </div>
                <div class="checkbox-item" data-category="火災爆炸">
                  <label class="main-category-label">
                    <input type="checkbox" onchange="toggleSubItems(this)"> 具火災、爆炸危險之下列作業：
                  </label>
                  <div class="sub-items-container">
                    <label><input type="checkbox" data-work-id="petrochemical"> (一)石化業廠場之歲修作業。</label>
                    <label><input type="checkbox" data-work-id="filming-explosives"> (二)使用爆炸性物質、易燃液體或可燃性氣體從事爆破之影視拍攝作業。</label>
                  </div>
                </div>
                <div class="checkbox-item" data-category="局限空間">
                  <label class="main-category-label">
                    <input type="checkbox" onchange="toggleSubItems(this)"> 具缺氧、中毒危險之下列局限空間從事清理或維修作業：
                  </label>
                  <div class="sub-items-container">
                    <label><input type="checkbox" data-work-id="sewer"> (一)污水或雨水下水道。</label>
                    <label><input type="checkbox" data-work-id="wastewater"> (二)廢（污）水處理設施。</label>
                    <label><input type="checkbox" data-work-id="fermentation"> (三)食品醃製或發酵槽。</label>
                    <label><input type="checkbox" data-work-id="hot-spring"> (四)溫泉儲槽。</label>
                  </div>
                </div>
                <div class="checkbox-item" data-category="溺斃">
                  <label class="main-category-label">
                    <input type="checkbox" onchange="toggleSubItems(this)"> 具溺斃危險之下列作業：
                  </label>
                  <div class="sub-items-container">
                    <label><input type="checkbox" data-work-id="filming-water"> (一)於開放水域從事有溺水危險之影視拍攝作業。</label>
                  </div>
                </div>

              </div>
            </div>

            <aside class="local-notice"><strong>作業所在地勞動檢查機構如另有通報規定，請至相關網站辦理。</strong><p>請依作業所在地及管轄單位，選用下列通報入口。以下連結另開新分頁。</p><div id="hhOfficeLinks" class="office-links"></div></aside>

            <!-- 第二步底部按鈕 -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
              <button type="button" class="btn-search" style="background:#64748b; color:#ffffff;" onclick="switchHazardStep(1)">
                ⬅ 上一步：填報作業資訊
              </button>
              <button type="button" class="btn-add" style="padding:9px 24px; font-size:14px;" onclick="switchHazardStep(3)">
                下一步：實施風險評估 →
              </button>
            </div>
          </div>

          <!-- =========================================================
           * 第四步 Pane：確認通報資料
           * ========================================================= -->
          ${getHhRiskStepHtml()}
          <div id="hhStep4Pane" class="step-pane">
            <div class="hh-review-intro"><h3>確認通報資料</h3><p>請逐區核對；需要調整時，點選各區「修改」返回填寫。</p></div>
            <div id="hhSummaryContainer"><input type="hidden" id="hhNotificationEmail" value="${portalEscape(initialNotificationEmail)}"></div>

            <!-- 第四步底部按鈕 -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px;">
              <button type="button" class="btn-search" style="background:#64748b; color:#ffffff; padding:10px 22px; font-size: 15px;" onclick="switchHazardStep(3)">
                上一步：實施風險評估
              </button>
              <button type="button" class="btn-add" style="background:#16a34a; color:#ffffff; padding:11px 32px; font-size: 16px; font-weight:700;" onclick="submitHazardFlow()">
                ✔ 確認完成通報並送出
              </button>
            </div>
          </div>
        </div>
      `;

      // 根據新增或編輯模式動態設定按鈕文字
      bodyHtml = bodyHtml.replace('✔ 確認完成通報並送出', submitBtnText);

      openVDialog({
        title: dialogTitle,
        titleMsg: dialogMsg,
        maxWidth: '1080px',
        hideFooter: true,
        bodyHtml: bodyHtml
      });

      setTimeout(() => {
        if (typeof fillHhCrossAdmins === 'function') fillHhCrossAdmins();
        if (typeof onHhCityChange === 'function') onHhCityChange();
        renderHhLocalWorkTree();
        if (currentHazardMode === 'edit' && caseData) { populateHazardCaseData(caseData); restoreHhRiskAssessment(caseData); }
        renderPortalOfficeLinks();
        updateHhPeriodReminder();
        attachHazardFieldLabels();
        renderHhRiskFiles('upload');
        renderHhRiskFiles('toira');
      }, 30);
    }

    // 暴露全域給 DOM inline handler 呼叫
    window.openHhCalendarPopup = openHhCalendarPopup;
    window.clearHhDateRange = clearHhDateRange;

    /**
     * 危險作業線上通報：案件詳情檢視 (參考 2026_osaha-main/sp_detail.html)
     */
    const HH_DETAIL_WORK_IDS = {"墜落": ["roof", "rope", "tower-crane", "derrick-crane", "construction-lift", "gondola", "filming-edge"], "倒塌": ["formwork", "scaffold", "deep-excavation"], "火災爆炸": ["petrochemical", "filming-explosives"], "局限空間": ["sewer", "wastewater", "fermentation", "hot-spring"], "溺斃": ["filming-water"]};

    function getHhDetailCategories(data) {
      const saved = Array.isArray(data.categories) ? [...new Set(data.categories.filter(value => typeof value === 'string').map(value => value.trim()).filter(value => value && value !== '特殊申報'))] : [];
      if (saved.length) return saved;
      const normalize = text => text.replace(/^\s*\([一二三四五六七八九十]+\)\s*/, '').replace('設施規則第二百二十五條第二項所定之繩索作業', '第二百二十五條第二項所定之繩索作業').replace(/\s+/g, '');
      const items = Array.isArray(data.subItems) ? data.subItems.filter(value => typeof value === 'string').map(normalize) : [];
      return Object.entries(HH_DETAIL_WORK_IDS).filter(([, ids]) => ids.some(id => {
        const label = HH_TOIRA_WORK_CATALOG.operations[id]?.label;
        return label && items.includes(normalize(label));
      })).map(([category]) => category);
    }

    function openHazardCaseDetail(caseNo, defaultWorkName) {
      const data = Object.prototype.hasOwnProperty.call(DEMO_HAZARD_CASES, caseNo) ? DEMO_HAZARD_CASES[caseNo] : null;
      if (!data) { alert('找不到此案件，請返回案件列表重新查詢。'); return; }
      if (defaultWorkName && !data.workName) data.workName = defaultWorkName;
      const notice = ensureHazardCompletionNotice(data);
      if (typeof markInspectionCaseRead === 'function' && markInspectionCaseRead(caseNo)) {
        data.status = '已備查';
        if (typeof renderView === 'function' && window.currentActiveKey === 'caseSearch') renderView('caseSearch');
      }
      const status = data.status || '待確認';
      const statusClass = status === '已備查' ? 'read' : status === '取消' ? 'cancelled' : 'pending';
      let inspectionActions = '';
      if (window.currentRole === 'inspection' && status === '待確認') inspectionActions = `<button class="btn-record" type="button" onclick="applyInspectionCaseStatus(['${portalEscape(caseNo)}'], '已備查'); renderView('caseSearch'); closeVDialog();">閱讀完畢</button>`;
      if (window.currentRole === 'inspection' && status === '已備查') inspectionActions = `<button class="btn-cancel-case" type="button" data-case-no="${portalEscape(caseNo)}" onclick="cancelHazardCase(this.dataset.caseNo)">取消</button>`;
      const doc = notice.document;
      const detailHtml = `<div class="case-detail-container report-detail" data-case-no="${portalEscape(caseNo)}">
        <div class="report-view-meta"><span>通報時間：${portalEscape(notice.submittedAt)}</span><span class="report-case-status ${statusClass}">${portalEscape(status)}</span></div>
        ${renderHazardReportDocument(doc)}
        ${getHazardCompletionPanelHtml(data)}
        <div class="back-btn-box">${inspectionActions}${getHazardCompletionActionsHtml(data)}<button class="btn-back" type="button" onclick="closeVDialog()">關閉</button></div>
      </div>`;
      openVDialog({title:'通報案件資料',titleMsg:'',maxWidth:'1120px',hideFooter:true,bodyHtml:detailHtml});
    }

    function hhEscape(s) {
      return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[c]));
    }

    function syncHhCompanyFromUnit() {
      const company = document.getElementById('hhNotifierCompany');
      const unit = document.getElementById('hhPrimaryUnit');
      if (!company || !unit || company.dataset.userEdited) return;
      company.value = unit.value;
    }

    function onHhRelationChange() {
      const relation = document.getElementById('hhRelation');
      const rows = document.getElementById('hhContractorRows');
      if (rows) rows.hidden = !relation?.checked;
    }

    function getHhLocalWorkData() {
      if (window.globalLocalWorkData) return window.globalLocalWorkData;
      return {
        '新北市政府勞動檢查處': ['廣告招牌裝設', '2公尺以上擋土支撐工程'],
        '桃園市政府勞動檢查處': ['舞台搭設與吊掛路權'],
        '高雄市政府勞工局勞動檢查處': ['船舶或一定規模建築物拆除'],
        '國科會新竹科學園區管理局': ['無塵室設備吊掛與移機作業'],
        '國科會中部科學園區管理局': ['特殊製程管線切換維護作業']
      };
    }

    function renderHhLocalWorkTree() { renderPortalOfficeLinks(); }
    function onHhLocalItemChange() {}
    function toggleHhLocalGov() {}

    window.syncHhCompanyFromUnit = syncHhCompanyFromUnit;
    window.onHhRelationChange = onHhRelationChange;
    window.renderHhLocalWorkTree = renderHhLocalWorkTree;
    window.onHhLocalItemChange = onHhLocalItemChange;
    window.toggleHhLocalGov = toggleHhLocalGov;
    window.openHazardCaseDetail = openHazardCaseDetail;
    window.openCaseViewDialog = openHazardCaseDetail;
    // window.addContractorUnit in geo_data.js
    // window.addExtraPoint in geo_data.js
    // window.removeExtraPoint in geo_data.js
    // window.getHhBrowserLocation in geo_data.js
    // window.openGoogleMapSearch in geo_data.js
    window.openHazardCaseDialog = openHazardCaseDialog;
    // window.openCaseEditDialog defined in construction_report.js
    // window.openScaleCaseDialog in construction_report.js
    window.switchHazardStep = switchHazardStep;
    // window.onHhCityChange in geo_data.js
    // window.toggleSubItems in geo_data.js
    // window.addContractorUnit in geo_data.js
    // window.toggleCrossAdminList in geo_data.js
    // window.handleHhAttachmentUpload in geo_data.js
    window.addEngineeringLocation = typeof addExtraPoint === 'function' ? addExtraPoint : function(){};
    window.removeEngineeringLocation = typeof removeExtraPoint === 'function' ? removeExtraPoint : function(){};
    window.getHhLocationGps = typeof getHhBrowserLocation === 'function' ? getHhBrowserLocation : function(){};
    window.addEngineeringAddress = typeof addExtraPoint === 'function' ? addExtraPoint : function(){};
    // window.toggleHhDateRangePicker in calendar_picker.js
    window.openHhDateRangePicker = typeof openHhCalendarPopup === "function" ? openHhCalendarPopup : function(){};
    // window.closeHhDateRangePicker in calendar_picker.js
    // window.changeHhCalMonth in calendar_picker.js
    // window.selectHhDateCell in calendar_picker.js
    window.generateHhFinalSummary = generateHhFinalSummary;
    window.submitHazardFlow = submitHazardFlow;


// 全域導出
window.switchHazardStep = switchHazardStep;
window.generateHhFinalSummary = generateHhFinalSummary;
window.getHazardCaseData = getHazardCaseData;
window.populateHazardCaseData = populateHazardCaseData;
window.submitHazardFlow = submitHazardFlow;
window.openHazardCaseDialog = openHazardCaseDialog;
window.openHazardCaseDetail = openHazardCaseDetail;
// window.openCaseEditDialog defined in construction_report.js

window.DEMO_HAZARD_CASES = DEMO_HAZARD_CASES;

function attachHazardFieldLabels() {
  document.querySelectorAll('#vDialogBody .form-field-group').forEach(group => {
    const label = group.querySelector(':scope > label');
    const field = group.querySelector('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]),select,textarea');
    if (label && field && field.id && !label.querySelector('input,select')) label.htmlFor = field.id;
  });
}
