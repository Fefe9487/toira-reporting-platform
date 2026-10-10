/* =========================================================
 * case_search.js - 通報案件查詢、批次審核與改派管轄單位
 * ========================================================= */

    var mergeScanActive = false;
    var mergeScanMode = '';
    var openMergeGroups = new Set();

    var inspectionCaseCatalog = [
      { id: 'RW-115-09001', company: '台灣營造工程股份有限公司', unit: '遠東基礎工程股份有限公司', workName: '捷運環狀線地下段連續壁開挖作業', region: '新北市板橋區', workRange: '115/09/10 ~ 115/09/25', submitDate: '115/09/01', status: '待確認', scale: false },
      { id: 'RW-115-09002', company: '宏達重工實業股份有限公司', unit: '日勝吊裝工程行', workName: '高鐵特區商辦外牆帷幕高空吊裝作業', region: '台中市西屯區', workRange: '115/09/15 ~ 115/09/18', submitDate: '115/09/02', status: '已備查', scale: false },
      { id: 'RW-115-09003', company: '長茂化學工業股份有限公司', unit: '國統環保清潔工程行', workName: '化學儲槽局限空間內部清掃作業', region: '高雄市小港區', workRange: '115/09/20 ~ 115/09/22', submitDate: '115/09/03', status: '退回', scale: false },
      { id: 'RW-115-09004', company: '明通精密電子股份有限公司', unit: '大發鋼構起重行', workName: '既有廠房鋼構屋頂太陽能板拆卸作業', region: '桃園市龜山區', workRange: '115/09/05 ~ 115/09/10', submitDate: '115/08/28', status: '取消', scale: false },
      { id: 'SC-115-09005', company: '富邦建設股份有限公司', unit: '大陸工程股份有限公司', workName: '大安區復興段集合住宅新建工程', region: '台北市大安區', workRange: '115/09/25 ~ 116/03/31', submitDate: '115/09/05', status: '待確認', scale: true },
      { id: 'RW-115-09006', company: '台灣營造工程股份有限公司', unit: '日勝吊裝工程行', workName: '板橋文化路外牆吊掛塗裝作業', region: '新北市板橋區', workRange: '115/09/12 ~ 115/09/20', submitDate: '115/09/06', status: '待確認', scale: false },
      { id: 'RW-115-09007', company: '宏達重工實業股份有限公司', unit: '遠東基礎工程股份有限公司', workName: '西屯廠房鋼構吊裝作業', region: '台中市南屯區', workRange: '115/09/16 ~ 115/09/28', submitDate: '115/09/07', status: '待確認', scale: false }
    ];

    function escCaseText(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function caseStatusBadgeHtml(status) {
      const cls = {
        '待確認': 'badge-audit',
        '已備查': 'badge-open',
        '退回': 'badge-reject',
        '取消': 'badge-cancel'
      }[status] || 'badge-audit';
      return `<span class="badge-status ${cls}">${escCaseText(status)}</span>`;
    }

    function computeInspectionMergeGroups(cases, mode) {
      const map = {};
      cases.forEach(c => {
        const key = (mode === 'unit' ? c.unit : c.company || '').trim();
        if (!key) return;
        if (!map[key]) map[key] = [];
        map[key].push(c.id);
      });
      const groupMeta = {};
      let n = 1;
      Object.entries(map).forEach(([key, ids]) => {
        if (ids.length < 2) return;
        const gid = 'MG-' + String(n++).padStart(3, '0');
        groupMeta[gid] = { key, ids, mode };
      });
      return groupMeta;
    }

    function renderInspectionMergePanelHtml() {
      const cases = inspectionCaseCatalog;
      const modeLabel = mergeScanMode === 'unit' ? '作業單位' : '事業單位';
      const groupMeta = computeInspectionMergeGroups(cases, mergeScanMode);
      const groups = Object.entries(groupMeta);
      if (!groups.length) {
        return `<div id="merge-tree-panel" class="merge-tree"><p style="color:#64748b; margin:0;">目前沒有可整併的群組（需至少 2 筆相同${modeLabel}）。</p></div>`;
      }
      const validIds = new Set(groups.map(([gid]) => gid));
      openMergeGroups = new Set([...openMergeGroups].filter(gid => validIds.has(gid)));
      const body = groups.map(([gid, meta]) => {
        const isOpen = openMergeGroups.has(gid);
        const pendingCount = meta.ids.filter(id => {
          const row = cases.find(x => x.id === id);
          return row && row.status === '待確認';
        }).length;
        const children = meta.ids.map((id, idx) => {
          const row = cases.find(x => x.id === id);
          if (!row) return '';
          const canCheck = row.status === '待確認';
          return `<div class="merge-child" data-case-id="${escCaseText(row.id)}">
            <input type="checkbox" class="merge-case-check" value="${escCaseText(row.id)}" ${canCheck ? '' : 'disabled'} onclick="event.stopPropagation()">
            <div class="merge-child-body" onclick="event.stopPropagation(); openHazardCaseDetail('${escCaseText(row.id)}')">
              <strong>#${idx + 1}</strong>　<strong>${escCaseText(row.id)}</strong>　${escCaseText(row.workName)}　${escCaseText(row.submitDate)}　${escCaseText(row.region)}
              　作業單位：${escCaseText(row.unit)}　事業：${escCaseText(row.company)}　${caseStatusBadgeHtml(row.status)}
            </div>
          </div>`;
        }).join('');
        return `<div class="merge-group${isOpen ? ' open' : ''}" id="merge-group-${gid}">
          <div class="merge-group-head" onclick="toggleMergeGroup('${gid}')">
            <span class="tree-toggle">▸</span>
            <span>${gid}</span>
            <span>${modeLabel}：${escCaseText(meta.key)}</span>
            <span style="color:#64748b; font-weight:normal;">共 ${meta.ids.length} 筆${pendingCount ? `（待確認 ${pendingCount}）` : ''}</span>
            <span class="merge-group-actions">
              <button type="button" class="btn-batch btn-batch-approve" ${pendingCount ? '' : 'disabled'} onclick="event.stopPropagation(); confirmMergeGroup('${gid}')">整組備查</button>
            </span>
          </div>
          <div class="merge-group-body">${children}</div>
        </div>`;
      }).join('');
      return `<div id="merge-tree-panel" class="merge-tree">
        <h3 style="margin:0 0 12px; font-size:16px; color:#0f172a;">整併結果（依${modeLabel}）— 點選群組展開細項</h3>
        <div class="merge-toolbar">
          <button type="button" class="btn-batch" style="background:#334155; color:#ffffff;" onclick="selectAllMergePending(true)">勾選全部待確認</button>
          <button type="button" class="btn-batch" style="background:#64748b; color:#ffffff;" onclick="selectAllMergePending(false)">取消勾選</button>
          <button type="button" class="btn-batch btn-batch-approve" onclick="handleBatchAudit('備查')">批次備查勾選案件</button>
        </div>
        ${body}
      </div>`;
    }

    function getCheckedCaseBoxes() {
      if (mergeScanActive && document.getElementById('merge-tree-panel')) {
        return document.querySelectorAll('.merge-case-check:checked');
      }
      return document.querySelectorAll('.case-checkbox:checked');
    }

    function applyInspectionCaseStatus(ids, status) {
      ids.forEach(id => {
        const row = inspectionCaseCatalog.find(item => item.id === id);
        if (row) row.status = status;
        if (window.DEMO_HAZARD_CASES && window.DEMO_HAZARD_CASES[id]) {
          window.DEMO_HAZARD_CASES[id].status = status;
        }
      });
    }

    function mergeScanToolbarHtml() {
      return `
        <div class="merge-scan-toolbar" style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
          <span style="font-size:14px; font-weight:700; color:#0f766e;">自動彙總</span>
          <button type="button" class="btn-batch btn-merge-scan${mergeScanActive && mergeScanMode === 'unit' ? ' active' : ''}" style="background:#0f766e; color:#ffffff;" onclick="mergeScanByUnit()">合併掃描：作業單位</button>
          <button type="button" class="btn-batch btn-merge-scan${mergeScanActive && mergeScanMode === 'company' ? ' active' : ''}" style="background:#0f766e; color:#ffffff;" onclick="mergeScanByCompany()">合併掃描：事業單位整併</button>
          <button type="button" class="btn-batch" style="background:#64748b; color:#ffffff;" onclick="clearMergeScan()">清除合併檢視</button>
        </div>`;
    }
    /* -------------------------------------------------------------
     * [常用 1] 通報案件查詢 (Case Search)
     * ------------------------------------------------------------- */
    /* -------------------------------------------------------------
     * [常用 1] 通報案件查詢 (Case Search)
     * 事業單位: 操作[編輯, 刪除, 檢視]，顯示新增按鈕
     * 勞檢機構: 操作[審核, 檢視]，移除新增按鈕
     * 管理者:   操作[檢視]，移除新增按鈕
     * ------------------------------------------------------------- */
    function getCaseSearchViewHtml() {
      const role = window.currentRole || 'admin';
      const isCompany = role === 'company';
      const isInspection = role === 'inspection';
      const isAdmin = role === 'admin';
      const isInspectionOrAdmin = isInspection || isAdmin;

      // 頂部按鈕列：
      // - 事業單位: [新增危險作業通報, 新增一定規模作業通報]
      // - 勞檢機構: [批次備查, 批次退回] 與自動彙總
      // - 管理者:   自動彙總，無批次審核按鈕
      let topButtonsHtml = '';
      if (isCompany) {
        topButtonsHtml = `
          <div class="button-group-row" style="margin-bottom:12px;">
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <button class="btn-add" onclick="openHazardCaseDialog()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                新增危險作業通報
              </button>
              <button class="btn-add" style="background-color:#0288d1;" onclick="openScaleCaseDialog()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                新增一定規模作業通報
              </button>
            </div>
          </div>
        `;
      } else if (isInspection) {
        topButtonsHtml = `
          <div class="button-group-row" style="margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; gap:10px; align-items:center;">
              <button class="btn-batch btn-batch-approve" onclick="handleBatchAudit('備查')">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                批次備查
              </button>
              <button class="btn-batch btn-batch-reject" onclick="handleBatchAudit('退回')">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                批次退回
              </button>
              <button class="btn-batch btn-batch-cancel" onclick="handleBatchAudit('取消')" style="background:#64748b; color:#fff; border:none; padding:7px 16px; border-radius:6px; font-weight:600; font-size: 14.5px; display:inline-flex; align-items:center; gap:6px; cursor:pointer; transition:background 0.2s;">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                批次取消
              </button>
              <button class="btn-batch btn-batch-reassign" onclick="openBatchReassignDialog()" style="background:#0288d1; color:#fff; border:none; padding:7px 16px; border-radius:6px; font-weight:600; font-size: 14.5px; display:inline-flex; align-items:center; gap:6px; cursor:pointer; transition:background 0.2s;">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
                批次改派
              </button>
              <span id="batchSelectCountInfo" style="font-size: 14.5px; color:#64748b; margin-left:6px;">(已勾選 <b id="batchSelectCount" style="color:#0288d1;">0</b> 筆)</span>
            </div>
            ${mergeScanToolbarHtml()}
          </div>
        `;
      } else if (isAdmin) {
        topButtonsHtml = `
          <div class="button-group-row" style="margin-bottom:14px; display:flex; align-items:center; flex-wrap:wrap; gap:12px;">
            ${mergeScanToolbarHtml()}
          </div>
        `;
      }

      // 操作欄位按鈕：
      // - 勞檢機構: [審核, 檢視]
      // - 管理者:   [檢視]
      // - 事業單位: [編輯, 刪除, 檢視]
      const actionButtons = (caseNo, explicitStatus) => {
        let st = explicitStatus;
        if (!st) {
          const caseData = getHazardCaseData(caseNo);
          st = (caseData && caseData.caseNo === caseNo) ? caseData.status : null;
        }
        if (!st) {
          if (caseNo.includes('004')) st = '取消';
          else if (caseNo.includes('003')) st = '退回';
          else if (caseNo.includes('002')) st = '已備查';
          else st = '待確認';
        }
        const isViewOnly = (st === '取消' || st === '退回');

        if (isInspection) {
          // 勞檢機構：取消和退回的案件只能檢視
          if (isViewOnly) {
            return `
              <button class="action-btn view" title="檢視" onclick="openHazardCaseDetail('${caseNo}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
            `;
          }
          return `
            <button class="action-btn edit" title="編輯" onclick="openHazardCaseDetail('${caseNo}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
          `;
        } else if (isAdmin) {
          return `
            <button class="action-btn view" title="檢視" onclick="openHazardCaseDetail('${caseNo}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
          `;
        } else {
          // 事業單位：取消和退回的案件只能檢視
          if (isViewOnly) {
            return `
              <button class="action-btn view" title="檢視" onclick="openHazardCaseDetail('${caseNo}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
            `;
          }
          return `
            <button class="action-btn edit" title="編輯" onclick="openCaseEditDialog('${caseNo}', '高架橋梁外牆防蝕吊掛塗裝作業')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
            <button class="action-btn delete" title="取消" onclick="if(confirm('確認取消通報案件【' + '${caseNo}' + '】？')){ alert('案件【' + '${caseNo}' + '】已成功取消！'); }" style="color:#dc2626;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg></button>
            <button class="action-btn view" title="檢視" onclick="openHazardCaseDetail('${caseNo}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
          `;
        }
      };

      // 勞檢機構專用：勾選欄位
      const checkColTh = isInspection ? '<th style="width:40px; text-align:center;"><input type="checkbox" id="checkAllCases" onchange="toggleAllCases(this)" title="全選/取消全選" style="cursor:pointer; width:16px; height:16px;"></th>' : '';
      const checkColTd = (caseNo, explicitStatus) => {
        if (!isInspection) return '';
        let st = explicitStatus;
        if (!st) {
          const caseData = getHazardCaseData(caseNo);
          st = (caseData && caseData.caseNo === caseNo) ? caseData.status : null;
        }
        if (!st) {
          if (caseNo.includes('004')) st = '取消';
          else if (caseNo.includes('003')) st = '退回';
          else if (caseNo.includes('002')) st = '已備查';
          else st = '待確認';
        }
        if (st === '取消' || st === '退回') {
          return `<td style="text-align:center; color:#94a3b8;"><input type="checkbox" disabled title="已${st}案件不可再執行批次操作" style="cursor:not-allowed; opacity:0.35;"></td>`;
        }
        return `<td style="text-align:center;"><input type="checkbox" class="case-checkbox" value="${caseNo}" onchange="updateSelectedCount()" style="cursor:pointer; width:16px; height:16px;"></td>`;
      };

      return `
        <div class="page-title-row">
          <div class="page-title-left">
            <span class="page-title-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </span>
            <span class="page-title-text">通報案件查詢</span>
          </div>
          <span class="page-breadcrumb">首頁 > 通報管理 > 通報案件查詢</span>
        </div>

        ${topButtonsHtml}

        <!-- 查詢條件區塊: [作業日起迄, 通報日起迄, 所在地區 (縣市), 作業名稱] -->
        <div class="search-filter-card">
          <div class="search-filter-fields">
            <!-- 作業日起迄 (套用 hhCalendarPopup) -->
            <div class="search-filter-item">
              <span class="label">作業日起迄：</span>
              <div onclick="openHhCalendarPopup(this, { startId: 'caseWorkStart', endId: 'caseWorkEnd', displayId: 'caseWorkDateVal', placeholder: '全部作業期間' })" 
                   style="display:flex; align-items:center; gap:8px; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:7px 12px; cursor:pointer; font-size: 15px; color:#1e293b; min-width:220px; user-select:none; transition:border-color 0.2s;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span id="caseWorkDateVal" style="color:#64748b;">全部作業期間</span>
              </div>
              <input type="hidden" id="caseWorkStart" value="">
              <input type="hidden" id="caseWorkEnd" value="">
            </div>

            <!-- 通報日起迄 (套用 hhCalendarPopup) -->
            <div class="search-filter-item">
              <span class="label">通報日起迄：</span>
              <div onclick="openHhCalendarPopup(this, { startId: 'caseRptStart', endId: 'caseRptEnd', displayId: 'caseRptDateVal', placeholder: '全部通報期間' })" 
                   style="display:flex; align-items:center; gap:8px; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:7px 12px; cursor:pointer; font-size: 15px; color:#1e293b; min-width:220px; user-select:none; transition:border-color 0.2s;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span id="caseRptDateVal" style="color:#64748b;">全部通報期間</span>
              </div>
              <input type="hidden" id="caseRptStart" value="">
              <input type="hidden" id="caseRptEnd" value="">
            </div>

            <!-- 案件狀態 [待確認、已備查、取消、退回] -->
            <div class="search-filter-item">
              <span class="label">案件狀態：</span>
              <select class="v-select" id="caseStatusFilter" style="min-width:125px; padding:7px 12px; font-size: 15px;">
                <option value="">全部狀態</option>
                <option value="待確認">待確認</option>
                <option value="已備查">已備查</option>
                <option value="取消">取消</option>
                <option value="退回">退回</option>
              </select>
            </div>

            <!-- 所在地區 (縣市) -->
            <div class="search-filter-item">
              <span class="label">所在地區(縣市)：</span>
              <select class="v-select" style="min-width:140px; padding:7px 12px; font-size: 15px;">
                <option value="">全部縣市</option>
                <option value="台北市">台北市</option>
                <option value="新北市">新北市</option>
                <option value="桃園市">桃園市</option>
                <option value="台中市">台中市</option>
                <option value="台南市">台南市</option>
                <option value="高雄市">高雄市</option>
                <option value="基隆市">基隆市</option>
                <option value="新竹市">新竹市</option>
                <option value="新竹縣">新竹縣</option>
                <option value="苗栗縣">苗栗縣</option>
                <option value="彰化縣">彰化縣</option>
                <option value="南投縣">南投縣</option>
                <option value="雲林縣">雲林縣</option>
                <option value="嘉義市">嘉義市</option>
                <option value="嘉義縣">嘉義縣</option>
                <option value="屏東縣">屏東縣</option>
                <option value="宜蘭縣">宜蘭縣</option>
                <option value="花蓮縣">花蓮縣</option>
                <option value="台東縣">台東縣</option>
                <option value="澎湖縣">澎湖縣</option>
                <option value="金門縣">金門縣</option>
                <option value="連江縣">連江縣</option>
              </select>
            </div>

            <!-- 作業名稱 -->
            <div class="search-filter-item">
              <span class="label">作業名稱：</span>
              <input type="text" class="v-input" placeholder="請輸入作業名稱關鍵字" style="width:210px; padding:7px 12px; font-size: 15px;">
            </div>
            ${isInspectionOrAdmin ? `
            <!-- 事業單位 -->
            <div class="search-filter-item">
              <span class="label">事業單位：</span>
              <input type="text" class="v-input" id="caseCompanyFilter" placeholder="請輸入事業單位名稱" style="width:210px; padding:7px 12px; font-size: 15px;">
            </div>

            <!-- 作業單位 -->
            <div class="search-filter-item">
              <span class="label">作業單位：</span>
              <input type="text" class="v-input" id="caseContractorFilter" placeholder="請輸入作業單位" style="width:210px; padding:7px 12px; font-size: 15px;">
            </div>

            <!-- 排序 [案件編號, 事業單位, 作業單位] -->
            <div class="search-filter-item">
              <span class="label">排序：</span>
              <select class="v-select" id="caseSortFilter" style="min-width:140px; padding:7px 12px; font-size: 15px;">
                <option value="案件編號">案件編號</option>
                <option value="事業單位">事業單位</option>
                <option value="作業單位">作業單位</option>
              </select>
            </div>
            ` : ''}
          </div>

          <!-- 查詢與重設按鈕：固定在區塊下方置中 -->
          <div class="search-filter-actions">
            <button class="btn-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              搜尋
            </button>
            <button class="btn-reset" onclick="renderView('caseSearch')">重設</button>
          </div>
        </div>

        ${isInspectionOrAdmin && mergeScanActive ? renderInspectionMergePanelHtml() : ''}

        <!-- 案件列表: [勾選(勞檢), 案件編號, (事業單位, 作業單位), 作業名稱, 所在地區, 作業日起迄, 通報日, 狀態, 操作] -->
        <div class="v-table-wrap" id="case-list-wrap" style="${isInspectionOrAdmin && mergeScanActive ? 'display:none;' : ''}">
          <table class="v-table">
            <thead>
              <tr>
                ${checkColTh}
                <th>案件編號</th>
                ${isInspectionOrAdmin ? '<th>事業單位</th><th>作業單位</th>' : ''}
                <th>作業名稱</th>
                <th>所在地區</th>
                <th>作業日起迄</th>
                <th>通報日</th>
                <th class="v-table-center">狀態</th>
                <th class="v-table-center">操作</th>
              </tr>
            </thead>
            <tbody>
              ${inspectionCaseCatalog.map(row => {
                const scaleBadge = row.scale
                  ? ' <span style="background:#e0f2fe; color:#0369a1; font-size: 13.5px; padding:2px 8px; border-radius:4px; font-weight:600; margin-left:6px;">一定規模</span>'
                  : '';
                const orgCols = isInspectionOrAdmin
                  ? `<td><strong>${escCaseText(row.company)}</strong></td><td>${escCaseText(row.unit)}</td>`
                  : '';
                return `<tr>
                  ${checkColTd(row.id, row.status)}
                  <td><code>${escCaseText(row.id)}</code></td>
                  ${orgCols}
                  <td><strong>${escCaseText(row.workName)}</strong>${scaleBadge}</td>
                  <td>${escCaseText(row.region)}</td>
                  <td>${escCaseText(row.workRange)}</td>
                  <td>${escCaseText(row.submitDate)}</td>
                  <td class="v-table-center">${caseStatusBadgeHtml(row.status)}</td>
                  <td class="v-table-center" style="white-space:nowrap;">
                    ${actionButtons(row.id, row.status)}
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
          <div class="table-footer">
            <span>顯示第 1 至 ${inspectionCaseCatalog.length} 筆，共 ${inspectionCaseCatalog.length} 筆</span>
            <div class="pagination-btns">
              <button class="page-btn active">1</button>
            </div>
          </div>
        </div>
      `;
    }


    function toggleAllCases(masterCheckbox) {
      const checkboxes = document.querySelectorAll('.case-checkbox');
      checkboxes.forEach(cb => {
        cb.checked = masterCheckbox.checked;
      });
      updateSelectedCount();
    }

    function updateSelectedCount() {
      const checkboxes = document.querySelectorAll('.case-checkbox');
      const checked = document.querySelectorAll('.case-checkbox:checked');
      const countEl = document.getElementById('batchSelectCount');
      const allCb = document.getElementById('checkAllCases');
      if (countEl) {
        countEl.textContent = checked.length;
      }
      if (allCb && checkboxes.length > 0) {
        allCb.checked = (checkboxes.length === checked.length);
      }
    }

    function handleBatchAudit(actionType) {
      const checked = getCheckedCaseBoxes();
      if (checked.length === 0) {
        alert('請先勾選欲批次【' + actionType + '】的通報案件！');
        return;
      }
      const caseIds = Array.from(checked).map(cb => cb.value);

      // 批次取消：需檢查勾選案件狀態是否都是「已備查」
      if (actionType === '取消') {
        const notRecorded = [];
        caseIds.forEach(id => {
          const caseData = getHazardCaseData(id);
          let st = (caseData && caseData.caseNo === id) ? caseData.status : null;
          if (!st) {
            if (id.includes('004')) st = '取消';
            else if (id.includes('003')) st = '退回';
            else if (id.includes('002')) st = '已備查';
            else st = '待確認';
          }
          if (st !== '已備查') {
            notRecorded.push(id + ' (目前狀態：' + st + ')');
          }
        });

        if (notRecorded.length > 0) {
          alert('【批次取消】限制：\n僅能針對狀態為「已備查」之案件執行取消！\n\n下列勾選案件狀態非「已備查」：\n' + notRecorded.join('\n') + '\n\n請重新勾選後再試。');
          return;
        }
      }

      // 批次退回：需檢查勾選案件狀態不可包含「已備查」
      if (actionType === '退回') {
        const recordedCases = [];
        caseIds.forEach(id => {
          const caseData = getHazardCaseData(id);
          let st = (caseData && caseData.caseNo === id) ? caseData.status : null;
          if (!st) {
            if (id.includes('004')) st = '取消';
            else if (id.includes('003')) st = '退回';
            else if (id.includes('002')) st = '已備查';
            else st = '待確認';
          }
          if (st === '已備查') {
            recordedCases.push(id + ' (目前狀態：已備查)');
          }
        });

        if (recordedCases.length > 0) {
          alert('【批次退回】限制：\n狀態為「已備查」之案件不可再退回！\n\n下列勾選案件已完成備查：\n' + recordedCases.join('\n') + '\n\n請取消勾選已備查之案件後再試。');
          return;
        }
      }

      const confirmMsg = '確定要將以下 ' + caseIds.length + ' 筆案件進行批次【' + actionType + '】作業嗎？\n\n案件清單：\n' + caseIds.join(', ');
      if (confirm(confirmMsg)) {
        const nextStatus = actionType === '備查' ? '已備查' : actionType;
        applyInspectionCaseStatus(caseIds, nextStatus);
        alert('已成功完成 ' + caseIds.length + ' 筆案件之【' + actionType + '】作業！');
        if (typeof renderView === 'function') renderView('caseSearch');
      }
    }

    function mergeScanByUnit() {
      mergeScanActive = true;
      mergeScanMode = 'unit';
      if (typeof renderView === 'function') renderView('caseSearch');
    }

    function mergeScanByCompany() {
      mergeScanActive = true;
      mergeScanMode = 'company';
      if (typeof renderView === 'function') renderView('caseSearch');
    }

    function clearMergeScan() {
      mergeScanActive = false;
      mergeScanMode = '';
      openMergeGroups = new Set();
      if (typeof renderView === 'function') renderView('caseSearch');
    }

    function toggleMergeGroup(gid) {
      const el = document.getElementById('merge-group-' + gid);
      if (!el) return;
      el.classList.toggle('open');
      if (el.classList.contains('open')) openMergeGroups.add(gid);
      else openMergeGroups.delete(gid);
    }

    function selectAllMergePending(checked) {
      document.querySelectorAll('.merge-case-check:not(:disabled)').forEach(box => {
        box.checked = !!checked;
      });
    }

    function confirmMergeGroup(gid) {
      const groupMeta = computeInspectionMergeGroups(inspectionCaseCatalog, mergeScanMode || 'company');
      const meta = groupMeta[gid];
      if (!meta) return;
      const pendingIds = meta.ids.filter(id => {
        const row = inspectionCaseCatalog.find(item => item.id === id);
        return row && row.status === '待確認';
      });
      if (!pendingIds.length) {
        alert('此群組沒有可備查的待確認案件');
        return;
      }
      if (!confirm('確定將群組 ' + gid + ' 內 ' + pendingIds.length + ' 件待確認案件批次備查？')) return;
      applyInspectionCaseStatus(pendingIds, '已備查');
      if (typeof renderView === 'function') renderView('caseSearch');
      alert('已備查 ' + pendingIds.length + ' 件');
    }

    /* =============================================================
     * 勞檢機構案件列表：批次改派管轄單位功能
     * ============================================================= */
    function openBatchReassignDialog() {
      const checked = getCheckedCaseBoxes();
      if (checked.length === 0) {
        alert('請先勾選欲進行【批次改派】的通報案件！');
        return;
      }
      const caseIds = Array.from(checked).map(cb => cb.value);

      const bodyHtml = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <!-- 勾選案件摘要清單 -->
          <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:12px 14px;">
            <div style="font-size: 13px; color:#0369a1; font-weight:bold; margin-bottom:6px; display:flex; align-items:center; gap:6px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              已選取 ${caseIds.length} 筆通報案件準備改派：
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              ${caseIds.map(id => `<span style="background:#ffffff; border:1px solid #7dd3fc; color:#0284c7; padding:2px 8px; border-radius:4px; font-size: 12.5px; font-family:monospace; font-weight:600;">${id}</span>`).join('')}
            </div>
          </div>

          <!-- 選擇管轄勞動檢查單位 -->
          <div class="form-field-group">
            <label style="font-size: 13.5px; font-weight:600; color:#334155; margin-bottom:6px; display:block;">
              新管轄勞動檢查單位 <span class="form-req" style="color:#ef4444;">*</span>
            </label>
            <select class="v-select" id="reassignTargetUnit" style="width:100%; padding:9px 12px; font-size: 13.5px; border:1px solid #cbd5e1; border-radius:6px; background:#fff;" required>
              <option value="">-- 請選擇管轄勞動檢查單位 --</option>
              ${ALL_ADMIN_UNITS_LIST.map(u => `<option value="${u}">${u}</option>`).join('')}
            </select>
          </div>

          <!-- 改派原因與備註說明 -->
          <div class="form-field-group">
            <label style="font-size: 13.5px; font-weight:600; color:#334155; margin-bottom:6px; display:block;">
              改派原因／備註說明 <span style="font-size: 12px; font-weight:normal; color:#64748b;">(選填)</span>
            </label>
            <textarea class="v-textarea" id="reassignReason" rows="3" placeholder="例如：依工程跨區實際作業地調整、轄區管轄權移交更正、廠商申報資料修正等" style="width:100%; padding:8px 12px; font-size: 13.5px; border:1px solid #cbd5e1; border-radius:6px; font-family:inherit; resize:vertical; box-sizing:border-box;"></textarea>
          </div>

          <!-- 操作按鈕列 (與案件通報完全一致) -->
          <div style="display:flex; justify-content:flex-end; align-items:center; gap:12px; margin-top:14px; padding-top:16px; border-top:1px solid #e2e8f0;">
            <button type="button" class="v-btn v-btn-cancel" onclick="closeVDialog()" style="padding:9px 22px; font-size: 14px; font-weight:600; border-radius:6px; cursor:pointer; background:#fff; border:1px solid #cbd5e1; color:#475569;">取消</button>
            <button type="button" class="btn-add" onclick="submitBatchReassign()" style="background:#16a34a; padding:9px 24px; font-size: 14px; font-weight:700; border-radius:6px; border:none; color:#fff; cursor:pointer; display:inline-flex; align-items:center; gap:6px; box-shadow:0 1px 2px rgba(0,0,0,0.08);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              確認改派
            </button>
          </div>
        </div>
      `;

      openVDialog({
        title: '批次改派管轄勞動檢查單位',
        titleMsg: '※ 將勾選案件重新指派至指定勞動檢查機構審查列管',
        maxWidth: '650px',
        hideFooter: true,
        bodyHtml: bodyHtml
      });
    }

    function submitBatchReassign() {
      const checked = getCheckedCaseBoxes();
      if (checked.length === 0) {
        alert('請先勾選欲進行【批次改派】的通報案件！');
        return;
      }
      const caseIds = Array.from(checked).map(cb => cb.value);

      const targetUnit = document.getElementById('reassignTargetUnit')?.value;
      const reason = document.getElementById('reassignReason')?.value.trim();

      if (!targetUnit) {
        alert('請選擇欲改派的新管轄勞動檢查單位！');
        return;
      }

      const confirmText = '確定要將以下 ' + caseIds.length + ' 筆案件改派至【' + targetUnit + '】嗎？\n\n案件清單：\n' + caseIds.join(', ') + (reason ? ('\n\n改派原因：' + reason) : '');
      if (confirm(confirmText)) {
        alert('✔ 已成功完成 ' + caseIds.length + ' 筆案件之改派作業！\n已移交管轄單位：【' + targetUnit + '】');
        
        // 取消勾選
        checked.forEach(cb => cb.checked = false);
        const allCb = document.getElementById('checkAllCases');
        if (allCb) allCb.checked = false;
        const countEl = document.getElementById('batchSelectCount');
        if (countEl) countEl.textContent = '0';

        closeVDialog();
      }
    }

    window.openBatchReassignDialog = openBatchReassignDialog;
    window.submitBatchReassign = submitBatchReassign;


// 全域導出
window.getCaseSearchViewHtml = getCaseSearchViewHtml;
window.toggleAllCases = toggleAllCases;
window.updateSelectedCount = updateSelectedCount;
window.handleBatchAudit = handleBatchAudit;
window.openBatchReassignDialog = openBatchReassignDialog;
window.submitBatchReassign = submitBatchReassign;
window.mergeScanByUnit = mergeScanByUnit;
window.mergeScanByCompany = mergeScanByCompany;
window.clearMergeScan = clearMergeScan;
window.toggleMergeGroup = toggleMergeGroup;
window.selectAllMergePending = selectAllMergePending;
window.confirmMergeGroup = confirmMergeGroup;
