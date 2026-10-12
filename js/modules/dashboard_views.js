/* =========================================================
 * dashboard_views.js - 後台畫面渲染引擎 (對應 ReportWaring 系統管理與常用頁面)
 * ========================================================= */
    /* =========================================================
     * 3. 畫面渲染引擎 (參考 ReportWaring VUE 端程式)
     * ========================================================= */
    function renderView(viewKey) {
      const container = document.getElementById('mainWorkspaceCard');
      if (!container) return;

      switch(viewKey) {
        // --- 6大系統管理功能 ---
        case 'msgTemplate':
          container.innerHTML = getMsgTemplateViewHtml();
          break;
        case 'sysCode':
          container.innerHTML = getSysCodeViewHtml();
          break;
        case 'sysLog':
          container.innerHTML = getSysLogViewHtml();
          break;
        case 'sysGroup':
          container.innerHTML = getSysGroupViewHtml();
          break;
        case 'sysRole':
          container.innerHTML = getSysRoleViewHtml();
          break;
        case 'sysFunction':
          container.innerHTML = getSysFunctionViewHtml();
          break;

        // --- 常用管理與查詢功能 ---
        case 'caseSearch':
          container.innerHTML = getCaseSearchViewHtml();
          break;
        case 'accountMaintain':
          container.innerHTML = getAccountMaintainViewHtml();
          break;
        case 'vendorMaintain':
          container.innerHTML = getVendorMaintainViewHtml();
          break;
        case 'localMaintain':
          container.innerHTML = getLocalMaintainViewHtml();
          break;
        case 'workplaceMaintain':
          container.innerHTML = getWorkplaceMaintainViewHtml();
          break;
        default:
          container.innerHTML = getCaseSearchViewHtml();
          break;
      }
    }

    /* -------------------------------------------------------------
     * [功能 1] 訊息範本維護 (NotificationTemplateMaintain.vue)
     * ------------------------------------------------------------- */
    
    /* -------------------------------------------------------------
     * [功能 1] 訊息範本維護 (AddNotificationTemplate / EditNotificationTemplate)
     * ------------------------------------------------------------- */
    function getMsgTemplateViewHtml() {
      return `
        <div class="page-title-row">
          <div class="page-title-left">
            <span class="page-title-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </span>
            <span class="page-title-text">訊息範本維護</span>
          </div>
          <span class="page-breadcrumb">首頁 > 系統管理 > 訊息範本維護</span>
        </div>

        <div class="button-group-row" style="margin-bottom:14px;">
          <button class="btn-add" onclick="openMsgTemplateDialog('add')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            新增範本
          </button>
        </div>

        <!-- 查詢條件區塊 -->
        <div class="search-filter-card">
          <div class="search-filter-fields">
            <div class="search-filter-item">
              <span class="label">範本名稱：</span>
              <input type="text" class="v-input" placeholder="請輸入範本名稱關鍵字" style="width:220px; padding:7px 12px; font-size:15px;">
            </div>
            <div class="search-filter-item">
              <span class="label">管道類型：</span>
              <select class="v-select" style="min-width:140px; padding:7px 12px; font-size:15px;">
                <option value="">全部管道</option>
                <option value="EMAIL">EMAIL</option>
                <option value="SMS">SMS</option>
              </select>
            </div>
          </div>

          <!-- 查詢與重設按鈕：固定在區塊下方置中 -->
          <div class="search-filter-actions">
            <button class="btn-search" onclick="alert('執行範本搜尋')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              搜尋
            </button>
            <button class="btn-reset" title="重設搜尋條件" onclick="alert('已重設條件')">重設</button>
          </div>
        </div>

        <div class="v-table-wrap">
          <table class="v-table">
            <thead>
              <tr>
                <th>範本名稱</th>
                <th>管道類型</th>
                <th>通知主旨</th>
                <th>建立時間</th>
                <th class="v-table-center">動作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>密碼重置通知</strong></td>
                <td><span class="status-badge badge-info">EMAIL</span></td>
                <td>【職安通報系統】密碼重置驗證碼通知</td>
                <td>2026-08-15 10:30</td>
                <td class="v-table-center">
                  <button class="action-btn edit" title="編輯範本" onclick="openMsgTemplateDialog('edit', {name:'密碼重置通知', subject:'【職安通報系統】密碼重置驗證碼通知', type:'EMAIL', desc:'會員忘記密碼發送之一次性驗證信件', content:'親愛的使用者您好：\\n\\n您的驗證碼為：{OTP_CODE}\\n有效時間為 10 分鐘，請儘速完成驗證。\\n\\n勞動部職業安全衛生署 敬啟'})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button class="action-btn delete" title="刪除範本" onclick="if(confirm('確認刪除此範本？')) alert('刪除成功！')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </td>
              </tr>
              <tr>
                <td><strong>案件通報備查通知</strong></td>
                <td><span class="status-badge badge-info">EMAIL</span></td>
                <td>【案件備查通知】您通報的作業已完成備查</td>
                <td>2026-08-20 14:15</td>
                <td class="v-table-center">
                  <button class="action-btn edit" title="編輯範本" onclick="openMsgTemplateDialog('edit', {name:'案件通報備查通知', subject:'【案件備查通知】您通報的作業已完成備查', type:'EMAIL', desc:'勞檢機構備查通過後發送通知', content:'親愛的使用者您好：\\n\\n您通報的案件【{CASE_NO}】已由主管機構備查完成。\\n\\n職業安全衛生署 敬啟'})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button class="action-btn delete" title="刪除範本" onclick="if(confirm('確認刪除此範本？')) alert('刪除成功！')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </td>
              </tr>
              <tr>
                <td><strong>帳號開通通知</strong></td>
                <td><span class="status-badge badge-success">SMS</span></td>
                <td>【職安通報系統】帳號開通成功通知</td>
                <td>2026-08-22 09:00</td>
                <td class="v-table-center">
                  <button class="action-btn edit" title="編輯範本" onclick="openMsgTemplateDialog('edit', {name:'帳號開通通知', subject:'【職安通報系統】帳號開通成功通知', type:'SMS', desc:'管理者審核通過新帳號發送簡訊', content:'【職安通報】您的帳號 {ACCOUNT} 已審核通過，請登入系統使用。'})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button class="action-btn delete" title="刪除範本" onclick="if(confirm('確認刪除此範本？')) alert('刪除成功！')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="table-footer">
            <span>顯示第 1 至 5 筆，共 5 筆</span>
            <div class="pagination-btns">
              <button class="page-btn active">1</button>
            </div>
          </div>
        </div>
      `;
    }

    /* -------------------------------------------------------------
     * [功能 2] 系統代碼維護 (AddSystemCode / EditSystemCode)
     * ------------------------------------------------------------- */
    function getSysCodeViewHtml() {
      return `
        <div class="page-title-row">
          <div class="page-title-left">
            <span class="page-title-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            </span>
            <span class="page-title-text">系統代碼維護</span>
          </div>
          <span class="page-breadcrumb">首頁 > 系統管理 > 系統代碼維護</span>
        </div>

        <div class="button-group-row" style="margin-bottom:14px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <button class="btn-add" onclick="openSysCodeDialog('add')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              新增參數
            </button>
            <h3 style="color:#1d4ed8; font-size:15px; margin:0; font-weight:600;">[目前層級：第一層主參數清單]</h3>
          </div>
        </div>

        <!-- 查詢條件區塊 -->
        <div class="search-filter-card">
          <div class="search-filter-fields">
            <div class="search-filter-item">
              <span class="label">參數代碼 / 名稱：</span>
              <input type="text" class="v-input" id="sysParamKeyword" placeholder="請輸入參數代碼 (Key) 或名稱" style="width:260px; padding:7px 12px; font-size:15px;">
            </div>
          </div>

          <!-- 查詢與重設按鈕：固定在區塊下方置中 -->
          <div class="search-filter-actions">
            <button class="btn-search" onclick="alert('執行參數搜尋')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              搜尋
            </button>
            <button class="btn-reset" title="重設條件" onclick="const el = document.getElementById('sysParamKeyword'); if(el) el.value=''; alert('已重設條件');">重設</button>
          </div>
        </div>

        <div class="v-table-wrap">
          <table class="v-table">
            <thead>
              <tr>
                <th style="width:60px;">層級</th>
                <th>代碼 (Key)</th>
                <th>名稱</th>
                <th>說明</th>
                <th class="v-table-center">進入子參數</th>
                <th class="v-table-center">動作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="badge" style="background:#e0e7ff; color:#3730a3; padding:2px 8px; border-radius:4px; font-weight:600;">1</span></td>
                <td><code>HAZARD_TYPE</code></td>
                <td><strong>危險作業類型代碼</strong></td>
                <td>定義特定危險作業類型分類及代碼</td>
                <td class="v-table-center">
                  <button class="action-btn view" title="進入- 危險作業類型代碼" onclick="enterSubCodeLevel('危險作業類型代碼', 2)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                </td>
                <td class="v-table-center">
                  <button class="action-btn edit" title="編輯代碼" onclick="openSysCodeDialog('edit', {name:'危險作業類型代碼', code:'HAZARD_TYPE', desc:'定義特定危險作業類型分類及代碼'})"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                  <button class="action-btn delete" title="刪除代碼" onclick="if(confirm('確認刪除此參數代碼？')) alert('刪除成功！')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </td>
              </tr>
              <tr>
                <td><span class="badge" style="background:#e0e7ff; color:#3730a3; padding:2px 8px; border-radius:4px; font-weight:600;">1</span></td>
                <td><code>CASE_STATUS</code></td>
                <td><strong>申報案件審查狀態</strong></td>
                <td>通報案件各階段審查狀態代碼</td>
                <td class="v-table-center">
                  <button class="action-btn view" title="進入- 申報案件審查狀態" onclick="enterSubCodeLevel('申報案件審查狀態', 2)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                </td>
                <td class="v-table-center">
                  <button class="action-btn edit" title="編輯代碼" onclick="openSysCodeDialog('edit', {name:'申報案件審查狀態', code:'CASE_STATUS', desc:'通報案件各階段審查狀態代碼'})"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                  <button class="action-btn delete" title="刪除代碼" onclick="if(confirm('確認刪除此參數代碼？')) alert('刪除成功！')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </td>
              </tr>
              <tr>
                <td><span class="badge" style="background:#e0e7ff; color:#3730a3; padding:2px 8px; border-radius:4px; font-weight:600;">1</span></td>
                <td><code>INSPECT_ORG</code></td>
                <td><strong>勞動檢查機構列表</strong></td>
                <td>各區勞檢機構代碼及管轄範圍</td>
                <td class="v-table-center">
                  <button class="action-btn view" title="進入- 勞動檢查機構列表" onclick="enterSubCodeLevel('勞動檢查機構代碼', 2)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                </td>
                <td class="v-table-center">
                  <button class="action-btn edit" title="編輯代碼" onclick="openSysCodeDialog('edit', {name:'勞動檢查機構列表', code:'INSPECT_ORG', desc:'各區勞檢機構代碼及管轄範圍'})"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                  <button class="action-btn delete" title="刪除代碼" onclick="if(confirm('確認刪除此參數代碼？')) alert('刪除成功！')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="table-footer">
            <span>顯示第 1 至 5 筆，共 5 筆</span>
            <div class="pagination-btns">
              <button class="page-btn active">1</button>
            </div>
          </div>
        </div>
      `;
    }

    /* -------------------------------------------------------------
     * [功能 4] 群組維護 (SystemGroupMaintain.vue)
     * ------------------------------------------------------------- */
    
    /* -------------------------------------------------------------
     * [功能 3] 系統log紀錄 (shaCheckLog.vue & checkLogSearch.vue)
     * ------------------------------------------------------------- */
    function getSysLogViewHtml() {
      return `
        <div class="page-title-row">
          <div class="page-title-left">
            <span class="page-title-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </span>
            <span class="page-title-text">系統log紀錄</span>
          </div>
          <span class="page-breadcrumb">首頁 > 系統管理 > 系統log紀錄</span>
        </div>

        <!-- 查詢條件區塊 (直接在畫面呈現進階查詢條件) -->
        <div class="search-filter-card">
          <div class="search-filter-fields">
            <!-- Log 類型 -->
            <div class="search-filter-item">
              <span class="label">Log 類型：</span>
              <select class="v-select" id="sysLogTypeSelect" style="min-width:180px; padding:7px 12px; font-size:15px;">
                <option value="ALL">全部類型 (ALL)</option>
                <option value="OPERATION" selected>OPERATION (操作稽核Log)</option>
                <option value="WEBAPI">WEBAPI (API介面呼叫Log)</option>
                <option value="EXCEPTION">EXCEPTION (系統異常Log)</option>
                <option value="EMAIL">EMAIL (郵件發送Log)</option>
              </select>
            </div>

            <!-- 日誌時間起訖 (套用 hhCalendarPopup) -->
            <div class="search-filter-item">
              <span class="label">紀錄時間起訖：</span>
              <div onclick="openHhCalendarPopup(this, { startId: 'sysLogDateStart', endId: 'sysLogDateEnd', displayId: 'sysLogDateVal', placeholder: '全部日誌期間' })" 
                   style="display:flex; align-items:center; gap:8px; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:7px 12px; cursor:pointer; font-size: 15px; color:#1e293b; min-width:220px; user-select:none; transition:border-color 0.2s;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span id="sysLogDateVal" style="color:#64748b;">全部日誌期間</span>
              </div>
              <input type="hidden" id="sysLogDateStart" value="">
              <input type="hidden" id="sysLogDateEnd" value="">
            </div>

            <!-- 使用者帳號 -->
            <div class="search-filter-item">
              <span class="label">使用者帳號：</span>
              <input type="text" class="v-input" id="sysLogAccount" placeholder="例如：admin" style="width:160px; padding:7px 12px; font-size:15px;">
            </div>

            <!-- 使用者姓名 -->
            <div class="search-filter-item">
              <span class="label">使用者姓名：</span>
              <input type="text" class="v-input" id="sysLogName" placeholder="例如：系統管理員" style="width:160px; padding:7px 12px; font-size:15px;">
            </div>

            <!-- 來源 IP -->
            <div class="search-filter-item">
              <span class="label">來源 IP：</span>
              <input type="text" class="v-input" id="sysLogIp" placeholder="例如：192.168.1.100" style="width:160px; padding:7px 12px; font-size:15px;">
            </div>

            <!-- 連線端點 -->
            <div class="search-filter-item">
              <span class="label">連線端點 (Endpoint)：</span>
              <input type="text" class="v-input" id="sysLogEndpoint" placeholder="例如：/api/auth/apLogin" style="width:200px; padding:7px 12px; font-size:15px;">
            </div>

            <!-- 作業項目關鍵字 -->
            <div class="search-filter-item">
              <span class="label">作業項目 / 關鍵字：</span>
              <input type="text" class="v-input" id="quickLogKeyword" placeholder="輸入作業項目或說明比對關鍵字" style="width:230px; padding:7px 12px; font-size:15px;">
            </div>

            <!-- 執行結果 -->
            <div class="search-filter-item">
              <span class="label">執行結果：</span>
              <select class="v-select" id="sysLogStatus" style="min-width:130px; padding:7px 12px; font-size:15px;">
                <option value="">全部結果</option>
                <option value="SUCCESS">成功 (200 OK)</option>
                <option value="FAIL">失敗 / 異常</option>
              </select>
            </div>
          </div>

          <!-- 查詢與重設按鈕：固定在區塊下方置中 -->
          <div class="search-filter-actions">
            <button class="btn-search" onclick="doQuickLogSearch()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              搜尋
            </button>
            <button class="btn-reset" title="重設條件" onclick="resetQuickLogSearch()">重設</button>
          </div>
        </div>

        <div class="v-table-wrap">
          <table class="v-table">
            <thead>
              <tr>
                <th style="width:170px;">紀錄時間</th>
                <th>操作人員 / 來源IP</th>
                <th>模組 / 作業項目</th>
                <th>連線端點 (API Endpoint)</th>
                <th class="v-table-center" style="width:140px;">執行結果</th>
                <th class="v-table-center" style="width:100px;">詳細內容</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2026/09/07 11:30:15</td>
                <td><strong>admin (系統管理員)</strong><br><span style="color:#64748b; font-size: 12px;">192.168.1.100</span></td>
                <td>帳號密碼登入授權</td>
                <td><code>/api/auth/apLogin</code></td>
                <td class="v-table-center"><span class="status-badge badge-success">成功 (200 OK)</span></td>
                <td class="v-table-center">
                  <button class="action-btn view" title="檢視詳細 Payload" onclick="openLogDetailDialog({
                    time: '2026/09/07 11:30:15',
                    user: 'admin (系統管理員)',
                    ip: '192.168.1.100',
                    action: '帳號密碼登入授權',
                    endpoint: '/api/auth/apLogin',
                    status: '200 OK (執行時間 42ms)',
                    headers: '{\n  &quot;Host&quot;: &quot;osha.gov.tw&quot;,\n  &quot;User-Agent&quot;: &quot;Mozilla/5.0 (Windows NT 10.0; Win64; x64)&quot;,\n  &quot;Authorization&quot;: &quot;Bearer eyJhbGciOi...&quot;\n}',
                    req: '{\n  &quot;account&quot;: &quot;admin&quot;,\n  &quot;loginType&quot;: &quot;ACCOUNT&quot;,\n  &quot;captcha&quot;: &quot;4892&quot;\n}',
                    res: '{\n  &quot;success&quot;: true,\n  &quot;code&quot;: 200,\n  &quot;message&quot;: &quot;認證成功，核發權限權杖&quot;,\n  &quot;token&quot;: &quot;eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&quot;,\n  &quot;roles&quot;: [&quot;ROLE_SUPER_ADMIN&quot;]\n}'
                  })">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </td>
              </tr>
              <tr>
                <td>2026/09/07 10:45:22</td>
                <td><strong>16541333 (台灣營造股份有限公司)</strong><br><span style="color:#64748b; font-size: 12px;">61.220.18.9</span></td>
                <td>職安署 SSO 單一簽入</td>
                <td><code>/api/auth/oshaLogin</code></td>
                <td class="v-table-center"><span class="status-badge badge-success">成功 (200 OK)</span></td>
                <td class="v-table-center">
                  <button class="action-btn view" title="檢視詳細 Payload" onclick="openLogDetailDialog({
                    time: '2026/09/07 10:45:22',
                    user: '16541333 (台灣營造)',
                    ip: '61.220.18.9',
                    action: '職安署 SSO 單一簽入',
                    endpoint: '/api/auth/oshaLogin',
                    status: '200 OK (執行時間 128ms)',
                    headers: '{\n  &quot;Host&quot;: &quot;osha.gov.tw&quot;,\n  &quot;X-Forwarded-For&quot;: &quot;61.220.18.9&quot;,\n  &quot;Content-Type&quot;: &quot;application/json&quot;\n}',
                    req: '{\n  &quot;ssoTicket&quot;: &quot;TKT-OSHA-20260907-883921&quot;,\n  &quot;taxId&quot;: &quot;16541333&quot;\n}',
                    res: '{\n  &quot;success&quot;: true,\n  &quot;code&quot;: 200,\n  &quot;companyName&quot;: &quot;台灣營造股份有限公司&quot;,\n  &quot;provisionStatus&quot;: &quot;SYNCED&quot;,\n  &quot;roles&quot;: [&quot;ROLE_COMPANY_USER&quot;]\n}'
                  })">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </td>
              </tr>
              <tr>
                <td>2026/09/07 09:15:08</td>
                <td><strong>SYSTEM_JOB (逾期自動查核排程)</strong><br><span style="color:#64748b; font-size: 12px;">127.0.0.1</span></td>
                <td>通報案件逾期主動巡檢</td>
                <td><code>ScheduleAuditTask.run()</code></td>
                <td class="v-table-center"><span class="status-badge badge-success">完成 (142ms)</span></td>
                <td class="v-table-center">
                  <button class="action-btn view" title="檢視詳細 Payload" onclick="openLogDetailDialog({
                    time: '2026/09/07 09:15:08',
                    user: 'SYSTEM_JOB (背景排程)',
                    ip: '127.0.0.1 (Localhost)',
                    action: '通報案件逾期主動巡檢',
                    endpoint: 'com.osha.task.ScheduleAuditTask',
                    status: 'FINISHED (執行時間 142ms)',
                    headers: '{\n  &quot;X-Cron-Job&quot;: &quot;True&quot;,\n  &quot;Thread&quot;: &quot;pool-audit-1&quot;\n}',
                    req: '{\n  &quot;scanDate&quot;: &quot;2026-09-07&quot;,\n  &quot;thresholdDays&quot;: 3\n}',
                    res: '{\n  &quot;totalScanned&quot;: 148,\n  &quot;expiredCases&quot;: 0,\n  &quot;notifiedInspectors&quot;: 0\n}'
                  })">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="table-footer">
            <span>顯示第 1 至 3 筆，共 3 筆稽核記錄</span>
            <div class="pagination-btns">
              <button class="page-btn active">1</button>
            </div>
          </div>
        </div>
      `;
    }


    function getSysGroupViewHtml() {
      return `
        <div class="page-title-row">
          <div class="page-title-left">
            <span class="page-title-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </span>
            <span class="page-title-text">群組維護</span>
          </div>
          <span class="page-breadcrumb">首頁 > 系統管理 > 群組維護</span>
        </div>

        <div class="button-group-row" style="margin-bottom:14px;">
          <button class="btn-add" onclick="openGroupDialog('add')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            新增群組
          </button>
        </div>

        <!-- 查詢條件區塊 -->
        <div class="search-filter-card">
          <div class="search-filter-fields">
            <div class="search-filter-item">
              <span class="label">群組名稱：</span>
              <input type="text" class="v-input" id="sysGroupSearchName" placeholder="請輸入群組名稱" style="width:220px; padding:7px 12px; font-size:15px;">
            </div>
            <div class="search-filter-item">
              <span class="label">群組代碼：</span>
              <input type="text" class="v-input" id="sysGroupSearchCode" placeholder="請輸入代碼" style="width:200px; padding:7px 12px; font-size:15px;">
            </div>
          </div>

          <!-- 查詢與重設按鈕：固定在區塊下方置中 -->
          <div class="search-filter-actions">
            <button class="btn-search" onclick="alert('執行群組搜尋')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              搜尋
            </button>
            <button class="btn-reset" title="重設條件" onclick="const n = document.getElementById('sysGroupSearchName'); const c = document.getElementById('sysGroupSearchCode'); if(n) n.value=''; if(c) c.value=''; alert('已重設條件');">重設</button>
          </div>
        </div>

        <div class="v-table-wrap">
          <table class="v-table">
            <thead>
              <tr>
                <th>群組名稱</th>
                <th>代碼</th>
                <th>說明</th>
                <th class="v-table-center">成員管理</th>
                <th class="v-table-center">動作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>系統最高管理群組</strong></td>
                <td><code>ADMIN_GRP</code></td>
                <td>具備全系統所有功能模組之最高管理權限</td>
                <td class="v-table-center">
                  <button class="action-btn member" title="管理群組成員" onclick="openGroupMemberDialog('系統最高管理群組')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                  </button>
                </td>
                <td class="v-table-center">
                  <button class="action-btn edit" title="編輯群組基本資料" onclick="openGroupDialog('edit', {groupName:'系統最高管理群組', code:'ADMIN_GRP', desc:'具備全系統所有功能模組之最高管理權限'})"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                  <button class="action-btn delete" title="刪除群組" onclick="if(confirm('確認刪除此群組？')) alert('刪除成功！')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </td>
              </tr>
              <tr>
                <td><strong>勞檢機構審查群組</strong></td>
                <td><code>INSPECT_GRP</code></td>
                <td>各轄區勞檢機構審查人員專用群組，負責通報審查與批次備查</td>
                <td class="v-table-center">
                  <button class="action-btn member" title="管理群組成員" onclick="openGroupMemberDialog('勞檢機構審查群組')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                  </button>
                </td>
                <td class="v-table-center">
                  <button class="action-btn edit" title="編輯群組" onclick="openGroupDialog('edit', {groupName:'勞檢機構審查群組', code:'INSPECT_GRP', desc:'各轄區勞檢機構審查人員專用群組，負責通報審查與批次備查'})"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                  <button class="action-btn delete" title="刪除群組" onclick="if(confirm('確認刪除此群組？')) alert('刪除成功！')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </td>
              </tr>
              <tr>
                <td><strong>事業單位通報群組</strong></td>
                <td><code>BIZ_GRP</code></td>
                <td>提供作業單位/工廠通報危險作業與一定規模作業專用群組</td>
                <td class="v-table-center">
                  <button class="action-btn member" title="管理群組成員" onclick="openGroupMemberDialog('事業單位通報群組')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                  </button>
                </td>
                <td class="v-table-center">
                  <button class="action-btn edit" title="編輯群組" onclick="openGroupDialog('edit', {groupName:'事業單位通報群組', code:'BIZ_GRP', desc:'提供作業單位/工廠通報危險作業與一定規模作業專用群組'})"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                  <button class="action-btn delete" title="刪除群組" onclick="if(confirm('確認刪除此群組？')) alert('刪除成功！')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="table-footer">
            <span>顯示第 1 至 3 筆，共 3 筆</span>
            <div class="pagination-btns">
              <button class="page-btn active">1</button>
            </div>
          </div>
        </div>
      `;
    }

    /* -------------------------------------------------------------
     * [功能 5] 角色維護 (SystemRoleMaintain.vue)
     * ------------------------------------------------------------- */
    function getSysRoleViewHtml() {
      return `
        <div class="page-title-row">
          <div class="page-title-left">
            <span class="page-title-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </span>
            <span class="page-title-text">角色維護</span>
          </div>
          <span class="page-breadcrumb">首頁 > 系統管理 > 角色維護</span>
        </div>

        <div class="button-group-row" style="margin-bottom:14px;">
          <button class="btn-add" onclick="openRoleDialog('add')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            新增角色
          </button>
        </div>

        <!-- 查詢條件區塊 -->
        <div class="search-filter-card">
          <div class="search-filter-fields">
            <div class="search-filter-item">
              <span class="label">角色名稱：</span>
              <input type="text" class="v-input" id="sysRoleSearchName" placeholder="請輸入角色名稱" style="width:220px; padding:7px 12px; font-size:15px;">
            </div>
            <div class="search-filter-item">
              <span class="label">角色代碼：</span>
              <input type="text" class="v-input" id="sysRoleSearchCode" placeholder="請輸入代碼" style="width:200px; padding:7px 12px; font-size:15px;">
            </div>
          </div>

          <!-- 查詢與重設按鈕：固定在區塊下方置中 -->
          <div class="search-filter-actions">
            <button class="btn-search" onclick="alert('執行角色搜尋')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              搜尋
            </button>
            <button class="btn-reset" title="重設條件" onclick="const n = document.getElementById('sysRoleSearchName'); const c = document.getElementById('sysRoleSearchCode'); if(n) n.value=''; if(c) c.value=''; alert('已重設條件');">重設</button>
          </div>
        </div>

        <div class="v-table-wrap">
          <table class="v-table">
            <thead>
              <tr>
                <th>角色名稱</th>
                <th>代碼</th>
                <th>說明</th>
                <th class="v-table-center">權限管理</th>
                <th class="v-table-center">成員管理</th>
                <th class="v-table-center">動作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>系統最高管理人員</strong></td>
                <td><code>系統最高管理人員</code></td>
                <td>擁有危險通報全模組設定與審查案件最高維護授權</td>
                <td class="v-table-center">
                  <button class="action-btn permission" title="權限管理" onclick="openRolePermissionDialog('系統最高管理人員')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </button>
                </td>
                <td class="v-table-center">
                  <button class="action-btn member" title="管理角色成員" onclick="openRoleMemberDialog('系統最高管理人員')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                  </button>
                </td>
                <td class="v-table-center">
                  <button class="action-btn edit" title="編輯角色" onclick="openRoleDialog('edit', {roleName:'系統最高管理人員', code:'ROLE_SUPER_ADMIN', description:'擁有危險通報全模組設定與審查案件最高維護授權'})"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                  <button class="action-btn delete" title="刪除角色" onclick="if(confirm('確認刪除此角色？')) alert('刪除成功！')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </td>
              </tr>
              <tr>
                <td><strong>勞檢機構審查人員</strong></td>
                <td><code>勞檢機構審查人員</code></td>
                <td>負責轄區通報案件之閱讀、查詢與備查</td>
                <td class="v-table-center">
                  <button class="action-btn permission" title="權限管理" onclick="openRolePermissionDialog('勞檢機構審查人員')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </button>
                </td>
                <td class="v-table-center">
                  <button class="action-btn member" title="管理角色成員" onclick="openRoleMemberDialog('勞檢機構審查人員')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                  </button>
                </td>
                <td class="v-table-center">
                  <button class="action-btn edit" title="編輯角色" onclick="openRoleDialog('edit', {roleName:'勞檢機構審查人員', code:'ROLE_INSPECTOR', description:'負責轄區通報案件之閱讀、查詢與備查'})"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                  <button class="action-btn delete" title="刪除角色" onclick="if(confirm('確認刪除此角色？')) alert('刪除成功！')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </td>
              </tr>
              <tr>
                <td><strong>事業單位通報人員</strong></td>
                <td><code>事業單位通報人員</code></td>
                <td>線上提報危險作業事前通報、填寫作業人員清冊與下載備查公文</td>
                <td class="v-table-center">
                  <button class="action-btn permission" title="權限管理" onclick="openRolePermissionDialog('事業單位通報人員')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </button>
                </td>
                <td class="v-table-center">
                  <button class="action-btn member" title="管理角色成員" onclick="openRoleMemberDialog('事業單位通報人員')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                  </button>
                </td>
                <td class="v-table-center">
                  <button class="action-btn edit" title="編輯角色" onclick="openRoleDialog('edit', {roleName:'事業單位通報人員', code:'ROLE_COMPANY_USER', description:'線上提報危險作業事前通報、填寫作業人員清冊與下載備查公文'})"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                  <button class="action-btn delete" title="刪除角色" onclick="if(confirm('確認刪除此角色？')) alert('刪除成功！')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="table-footer">
            <span>顯示第 1 至 3 筆，共 3 筆</span>
            <div class="pagination-btns">
              <button class="page-btn active">1</button>
            </div>
          </div>
        </div>
      `;
    }
  

    function getSysFunctionViewHtml() {
      return `
        <div class="page-title-row">
          <div class="page-title-left">
            <span class="page-title-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </span>
            <span class="page-title-text">模組/功能維護</span>
          </div>
          <span class="page-breadcrumb">首頁 > 系統管理 > 模組/功能維護</span>
        </div>

        <div class="button-group-row">
          <div style="display:flex; gap:10px;">
            <button class="btn-add" onclick="toAddSysFunctionNode('A')">＋ 新增模組</button>
            <button class="btn-add" style="background:#0288d1; color:#ffffff;" onclick="toAddSysFunctionNode('B')">＋ 新增功能</button>
            <button class="btn-add" style="background:#0891b2; color:#ffffff;" onclick="toAddSysFunctionNode('C')">＋ 新增子功能</button>
          </div>
        </div>

        <div class="tree-maintain-container">
          <!-- 左側樹狀結構 (Treeview) -->
          <div class="tree-pane">
            <div style="font-size: 13px; font-weight:700; color:#475569; margin-bottom:12px; display:flex; align-items:center; gap:6px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              系統功能節點樹
            </div>
            <div class="tree-node-item" onclick="selectTreeNode(this, '危險作業通報模組', 'CASE_MGNT', 1, 1, 0, 0, '', '')">
              📁 <strong>危險作業通報模組</strong>
            </div>
            <div class="tree-node-item tree-subnode-item" onclick="selectTreeNode(this, '通報案件查詢', 'CASE_QUERY', 2, 1, 1, 0, '/cases/search', '/api/v1/cases')">
              📄 通報案件查詢
            </div>
            <div class="tree-node-item" onclick="selectTreeNode(this, '基本資料模組', 'BASE_MGNT', 1, 2, 0, 0, '', '')">
              📁 <strong>基本資料模組</strong>
            </div>
            <div class="tree-node-item tree-subnode-item" onclick="selectTreeNode(this, '帳號維護', 'ACCOUNT_MGNT', 2, 2, 1, 0, '/base/accounts', '/api/v1/accounts')">
              📄 帳號維護
            </div>
            <div class="tree-node-item tree-subnode-item" onclick="selectTreeNode(this, '廠商維護', 'VENDOR_MGNT', 2, 2, 2, 0, '/base/vendors', '/api/v1/vendors')">
              📄 廠商維護
            </div>
            <div class="tree-node-item tree-subnode-item" onclick="selectTreeNode(this, '地方項目維護', 'LOCAL_ITEM_MGNT', 2, 2, 3, 0, '/base/local-items', '/api/v1/local-items')">
              📄 地方項目維護
            </div>
            <div class="tree-node-item tree-subnode-item" onclick="selectTreeNode(this, '危評維護', 'HAZARD_WP_MGNT', 2, 2, 4, 0, '/base/hazard-plans', '/api/v1/hazard-plans')">
              📄 危評維護
            </div>
            <div class="tree-node-item" onclick="selectTreeNode(this, '系統管理模組', 'SYS_MGNT', 1, 3, 0, 0, '', '')">
              📁 <strong>系統管理模組</strong>
            </div>
            <div class="tree-node-item tree-subnode-item selected" onclick="selectTreeNode(this, '模組/功能維護', 'SYS_FUNCTION', 2, 3, 1, 0, '/system/function', '/api/v1/system/functions')">
              📁 <strong>模組/功能維護</strong>
            </div>
            <div class="tree-node-item tree-subnode-item" style="padding-left:36px;" onclick="selectTreeNode(this, '節點層級設定', 'SYS_NODE_CONFIG', 3, 3, 1, 1, '/system/function/nodes', '/api/v1/system/functions/nodes')">
              📄 節點層級設定
            </div>
            <div class="tree-node-item tree-subnode-item" onclick="selectTreeNode(this, '訊息範本維護', 'MSG_TEMPLATE', 2, 3, 2, 0, '/system/templates', '/api/v1/system/templates')">
              📄 訊息範本維護
            </div>
            <div class="tree-node-item tree-subnode-item" onclick="selectTreeNode(this, '系統代碼維護', 'SYS_CODE', 2, 3, 3, 0, '/system/codes', '/api/v1/system/codes')">
              📄 系統代碼維護
            </div>
          </div>

          <!-- 右側節點表單 (Form) -->
          <div class="form-pane">
            <h3 style="font-size:16px; color:#0f172a; margin-bottom:16px; border-bottom:1px solid #e2e8f0; padding-bottom:10px;">
              維護項目：<span id="selectedNodeTitle" style="color:#0288d1;">模組/功能維護</span>
              <span id="selectedNodeTypeBadge" style="margin-left:8px; font-size: 12px; padding:2px 8px; border-radius:4px; background:#e0f2fe; color:#0369a1; font-weight:600;">功能</span>
            </h3>

            <div class="form-grid">
              <div class="form-field-group">
                <label>功能名稱 <span class="form-req">*</span></label>
                <input type="text" class="v-input" id="editNodeName" value="模組/功能維護">
              </div>

              <!-- 第一層排序 (固定顯示，預設值為0) -->
              <div class="form-field-group" id="fieldGroupSortL1">
                <label>第一層排序 <span class="form-req">*</span></label>
                <div style="display:flex; align-items:center; gap:10px; width:100%;">
                  <input type="number" class="v-input" id="editNodeSortL1" value="0" style="max-width:180px; background:#f1f5f9; color:#64748b; cursor:not-allowed;" readonly>
                  <span id="hintSortL1" style="font-size:13px; color:#64748b;">(上層排序，不可修改)</span>
                </div>
              </div>

              <!-- 第二層排序 (固定顯示，預設值為0) -->
              <div class="form-field-group" id="fieldGroupSortL2">
                <label>第二層排序 <span class="form-req">*</span></label>
                <div style="display:flex; align-items:center; gap:10px; width:100%;">
                  <input type="number" class="v-input" id="editNodeSortL2" value="0" style="max-width:180px;">
                  <span id="hintSortL2" style="font-size:13px; color:#64748b; display:none;">(上層排序，不可修改)</span>
                </div>
              </div>

              <!-- 第三層排序 (固定顯示，預設值為0) -->
              <div class="form-field-group" id="fieldGroupSortL3">
                <label>第三層排序 <span class="form-req">*</span></label>
                <div style="display:flex; align-items:center; gap:10px; width:100%;">
                  <input type="number" class="v-input" id="editNodeSortL3" value="0" style="max-width:180px; background:#f1f5f9; color:#64748b; cursor:not-allowed;" readonly>
                  <span id="hintSortL3" style="font-size:13px; color:#64748b;">(非本層級，不可修改)</span>
                </div>
              </div>

              <div class="form-field-group">
                <label>圖示代碼</label>
                <input type="text" class="v-input" id="editNodeIcon" value="mdi-cog-outline">
              </div>

              <div class="form-field-group">
                <label>功能URL <span class="form-req">*</span></label>
                <input type="text" class="v-input" id="editNodeRoute" value="/system/function">
              </div>

              <div class="form-field-group">
                <label>API路徑</label>
                <input type="text" class="v-input" id="editNodeApiPath" value="/api/v1/system/functions">
              </div>

              <div class="form-field-group">
                <label>功能代碼 <span class="form-req">*</span></label>
                <input type="text" class="v-input" id="editNodePerm" value="SYS_FUNC_MAINTAIN">
              </div>

              <div class="form-field-group">
                <label>功能說明</label>
                <textarea class="v-input" id="editNodeDesc" style="height:70px; resize:vertical;">提供管理者進行前台功能模組、樹狀層級、自訂圖示與功能代碼設定。</textarea>
              </div>
            </div>

            <div style="display:flex; gap:12px; justify-content:flex-end;">
              <button class="btn-add" onclick="alert('儲存變更成功！')">💾 儲存變更</button>
              <button class="action-btn delete" style="padding:7px 14px; border:1px solid #fecaca;" onclick="confirm('確認刪除此節點？')">🗑️ 刪除此節點</button>
            </div>
          </div>
        </div>
      `;
    }

    function setSortFieldState(input, hint, value, editable, hintText) {
      if (!input) return;
      input.value = (value !== undefined && value !== null && value !== '') ? value : 0;
      input.readOnly = !editable;
      if (editable) {
        input.style.background = '#ffffff';
        input.style.color = '#1e293b';
        input.style.cursor = 'text';
        input.placeholder = '0';
      } else {
        input.style.background = '#f1f5f9';
        input.style.color = '#64748b';
        input.style.cursor = 'not-allowed';
        input.placeholder = '0';
      }
      if (hint) {
        if (hintText) {
          hint.textContent = hintText;
          hint.style.display = 'inline';
        } else {
          hint.style.display = 'none';
        }
      }
    }
    window.setSortFieldState = setSortFieldState;

    function selectTreeNode(elem, title, key, level, sort1, sort2, sort3, route, apiPath) {
      document.querySelectorAll('.tree-node-item').forEach(el => el.classList.remove('selected'));
      if (elem) elem.classList.add('selected');

      const titleEl = document.getElementById('selectedNodeTitle');
      const badgeEl = document.getElementById('selectedNodeTypeBadge');
      const nameInput = document.getElementById('editNodeName');
      const permInput = document.getElementById('editNodePerm');
      const routeInput = document.getElementById('editNodeRoute');
      const apiPathInput = document.getElementById('editNodeApiPath');

      const inputSortL1 = document.getElementById('editNodeSortL1');
      const inputSortL2 = document.getElementById('editNodeSortL2');
      const inputSortL3 = document.getElementById('editNodeSortL3');

      const hintSortL1 = document.getElementById('hintSortL1');
      const hintSortL2 = document.getElementById('hintSortL2');
      const hintSortL3 = document.getElementById('hintSortL3');

      if (titleEl) titleEl.textContent = title;
      if (nameInput) nameInput.value = title;
      if (permInput) permInput.value = key;
      if (routeInput && route !== undefined) routeInput.value = route;
      if (apiPathInput && apiPath !== undefined) apiPathInput.value = apiPath;

      const s1 = (sort1 !== undefined && sort1 !== null) ? sort1 : 0;
      const s2 = (sort2 !== undefined && sort2 !== null) ? sort2 : 0;
      const s3 = (sort3 !== undefined && sort3 !== null) ? sort3 : 0;

      // 保存當前選取的節點狀態供新增子層使用
      window._currentSelectedNode = {
        title, key, level, sort1: s1, sort2: s2, sort3: s3, route, apiPath
      };

      if (badgeEl) {
        if (level === 1) {
          badgeEl.textContent = '第一層 (模組)';
          badgeEl.style.background = '#fef3c7';
          badgeEl.style.color = '#b45309';
        } else if (level === 2) {
          badgeEl.textContent = '第二層 (功能)';
          badgeEl.style.background = '#e0f2fe';
          badgeEl.style.color = '#0369a1';
        } else {
          badgeEl.textContent = '第三層 (子功能)';
          badgeEl.style.background = '#f3e8ff';
          badgeEl.style.color = '#7e22ce';
        }
      }

      // 固定顯示 3 個排序欄位，各層預設值為 0，只能修改同層排序，其他不可修改
      if (level === 1) {
        setSortFieldState(inputSortL1, hintSortL1, s1, true, '');
        setSortFieldState(inputSortL2, hintSortL2, 0, false, '(非本層級，不可修改)');
        setSortFieldState(inputSortL3, hintSortL3, 0, false, '(非本層級，不可修改)');
      } else if (level === 2) {
        setSortFieldState(inputSortL1, hintSortL1, s1, false, '(上層排序，不可修改)');
        setSortFieldState(inputSortL2, hintSortL2, s2, true, '');
        setSortFieldState(inputSortL3, hintSortL3, 0, false, '(非本層級，不可修改)');
      } else {
        setSortFieldState(inputSortL1, hintSortL1, s1, false, '(上層排序，不可修改)');
        setSortFieldState(inputSortL2, hintSortL2, s2, false, '(上層排序，不可修改)');
        setSortFieldState(inputSortL3, hintSortL3, s3, true, '');
      }
    }


    /* -------------------------------------------------------------
     * [基本資料] 帳號維護 (參考 Java MemberAccount.java & FormMemberAccount)
     * ------------------------------------------------------------- */
    function getAccountMaintainViewHtml() {
      // 事業單位、勞檢機構：個人資料維護表單
      const role = window.currentRole || 'admin';
      if (role === 'company' || role === 'inspection') {
        const isInspection = role === 'inspection';
        const defaultAccount = isInspection ? "inspector@osha.gov.tw" : "company_user@osha.gov.tw";
        const defaultEmail = isInspection ? "inspector@osha.gov.tw" : "company_user@osha.gov.tw";
        const defaultName = isInspection ? "林督察員" : "王大明";
        const defaultPhone = isInspection ? "04-22558899" : "0912-345678";
        const defaultAddress = isInspection ? "台中市南屯區黎明路二段 501 號 7 樓" : "台北市中正區重慶南路一段 100 號 8 樓";
        const roleTitle = isInspection ? "勞檢機構" : "事業單位";

        return `
          <div class="page-title-row">
            <div class="page-title-left">
              <span class="page-title-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </span>
              <span class="page-title-text">個人帳號資料維護</span>
            </div>
            <span class="page-breadcrumb">首頁 > 個人資料維護 (${roleTitle})</span>
          </div>

          <div class="form-page-card" style="width: 100%; max-width: 960px; background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:28px 32px; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
            <div style="font-size:17.5px; font-weight:700; color:#1e293b; margin-bottom:24px; padding-bottom:12px; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; gap:10px;">
              <span style="display:inline-block; width:4px; height:20px; background:#0288d1; border-radius:2px;"></span>
              個人帳號基本資料維護
              <span style="font-size: 14px; font-weight:normal; color:#64748b; margin-left:8px;">（帳號與 Email 由系統鎖定不可修改，其餘欄位可修改後存檔）</span>
            </div>

            <form onsubmit="event.preventDefault(); alert('個人帳號資料儲存成功！');" style="display:flex; flex-direction:column; gap:18px;">
              <!-- 帳號 (不可修改) -->
              <div class="form-field-group">
                <label>登入帳號 <span style="font-size: 13px; color:#ef4444;">(不可修改)</span></label>
                <input type="text" class="v-input" id="accUsername" value="${defaultAccount}" readonly style="background:#f1f5f9; color:#64748b; cursor:not-allowed; font-family:monospace; font-weight:600;">
              </div>

              <!-- 電子信箱 (不可修改) -->
              <div class="form-field-group">
                <label>電子信箱 <span style="font-size: 13px; color:#ef4444;">(不可修改)</span></label>
                <input type="email" class="v-input" id="accEmail" value="${defaultEmail}" readonly style="background:#f1f5f9; color:#64748b; cursor:not-allowed; font-family:monospace; font-weight:600;">
              </div>

              <!-- 姓名 -->
              <div class="form-field-group">
                <label>姓名 <span class="form-req">*</span></label>
                <input type="text" class="v-input" id="accName" value="${defaultName}" placeholder="請輸入姓名" required>
              </div>

              <!-- 聯絡電話/手機 -->
              <div class="form-field-group">
                <label>聯絡電話 / 手機 <span class="form-req">*</span></label>
                <input type="tel" class="v-input" id="accPhone" value="${defaultPhone}" placeholder="例如：0912-345678" required>
              </div>

              <!-- 變更密碼 -->
              <div class="form-field-group">
                <label>變更密碼</label>
                <input type="password" class="v-input" id="accPassword" placeholder="若不修改密碼請留空">
              </div>

              <!-- 確認密碼 -->
              <div class="form-field-group">
                <label>確認新密碼</label>
                <input type="password" class="v-input" id="accPasswordConfirm" placeholder="請再次輸入新密碼">
              </div>

              ${role === 'company' ? '' : `
              <!-- 通訊地址（事業單位個人頁不顯示群組、角色或地址） -->
              <div class="form-field-group">
                <label>通訊地址 <span class="form-req">*</span></label>
                <input type="text" class="v-input" id="accAddress" value="${defaultAddress}" placeholder="請輸入完整通訊地址" required>
              </div>
              `}

              <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px; padding-top:18px; border-top:1px solid #f1f5f9;">
                <button type="button" class="action-btn" style="padding:10px 22px; font-size:15px; border:1px solid #cbd5e1; border-radius:6px; background:#ffffff; color:#475569;" onclick="renderView('accountMaintain')">重設內容</button>
                <button type="submit" class="btn-add" style="padding:10px 28px; font-size: 15.5px; font-weight: 600;">💾 儲存修改</button>
              </div>
            </form>
          </div>
        `;
      }

      // 管理者視圖：全域帳號清單列表 (DatatableComponent)
      return `
        <div class="page-title-row">
          <div class="page-title-left">
            <span class="page-title-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </span>
            <span class="page-title-text">帳號維護</span>
          </div>
          <span class="page-breadcrumb">首頁 > 基本資料 > 帳號維護</span>
        </div>

        <div class="button-group-row" style="margin-bottom:14px;">
          <button class="btn-add" onclick="openMemberAccountDialog('add')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            新增帳號
          </button>
        </div>

        <!-- 查詢條件區塊 -->
        <div class="search-filter-card">
          <div class="search-filter-fields">
            <div class="search-filter-item">
              <span class="label">關鍵字查詢：</span>
              <input type="text" class="v-input" id="sysUserSearchKeyword" placeholder="帳號 / 姓名 / 信箱" style="width:240px; padding:7px 12px; font-size:15px;">
            </div>
            <div class="search-filter-item">
              <span class="label">所屬群組：</span>
              <select class="v-select" id="sysUserSearchGroup" style="min-width:180px; padding:7px 12px; font-size:15px;">
                <option value="">全部群組</option>
                <option value="ADMIN_GRP">系統最高管理群組</option>
                <option value="INSPECT_GRP">勞檢機構審查群組</option>
                <option value="BIZ_GRP">事業單位通報群組</option>
              </select>
            </div>
            <div class="search-filter-item">
              <span class="label">帳號狀態：</span>
              <select class="v-select" id="sysUserSearchStatus" style="min-width:130px; padding:7px 12px; font-size:15px;">
                <option value="">全部狀態</option>
                <option value="Y">啟用</option>
                <option value="N">停用</option>
                <option value="L">鎖定</option>
              </select>
            </div>
          </div>

          <!-- 查詢與重設按鈕：固定在區塊下方置中 -->
          <div class="search-filter-actions">
            <button class="btn-search" onclick="alert('執行帳號查詢')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              搜尋
            </button>
            <button class="btn-reset" title="重設條件" onclick="const k=document.getElementById('sysUserSearchKeyword'); const g=document.getElementById('sysUserSearchGroup'); const s=document.getElementById('sysUserSearchStatus'); if(k)k.value=''; if(g)g.value=''; if(s)s.value=''; alert('已重設條件');">重設</button>
          </div>
        </div>

        <div class="v-table-wrap">
          <table class="v-table">
            <thead>
              <tr>
                <th>帳號</th>
                <th>姓名</th>
                <th>電子信箱</th>
                <th>聯絡電話</th>
                <th>所屬群組</th>
                <th>授權角色</th>
                <th class="v-table-center">狀態</th>
                <th>建立日期</th>
                <th class="v-table-center">動作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>admin</code></td>
                <td><strong>系統管理員 (王大明)</strong></td>
                <td>admin@osha.gov.tw</td>
                <td>02-89956666</td>
                <td><span class="status-badge badge-info">系統最高管理群組</span></td>
                <td><span class="status-badge" style="background:#e0e7ff; color:#3730a3;">系統最高管理人員</span></td>
                <td class="v-table-center"><span class="status-badge badge-success">啟用</span></td>
                <td>2026/01/01</td>
                <td class="v-table-center">
                  <button class="action-btn edit" title="編輯帳號資料" onclick="openMemberAccountDialog('edit', {
                    account: 'admin',
                    name: '系統管理員 (王大明)',
                    email: 'admin@osha.gov.tw',
                    contactTel: '02-89956666',
                    contactAddress: '新北市新莊區中平路439號南棟11樓',
                    groupId: 'ADMIN_GRP',
                    groupName: '系統最高管理群組',
                    roles: ['ROLE_SUPER_ADMIN'],
                    status: 'Y'
                  })">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button class="action-btn delete" title="刪除帳號" onclick="if(confirm('確認刪除此帳號？')) alert('刪除成功！')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </td>
              </tr>
              <tr>
                <td><code>inspector_north</code></td>
                <td><strong>北區審查官 (林國樑)</strong></td>
                <td>inspector_north@osha.gov.tw</td>
                <td>02-89956700</td>
                <td><span class="status-badge badge-info">勞檢機構審查群組</span></td>
                <td><span class="status-badge" style="background:#e0e7ff; color:#3730a3;">勞檢機構審查人員</span></td>
                <td class="v-table-center"><span class="status-badge badge-success">啟用</span></td>
                <td>2026/02/15</td>
                <td class="v-table-center">
                  <button class="action-btn edit" title="編輯帳號資料" onclick="openMemberAccountDialog('edit', {
                    account: 'inspector_north',
                    name: '北區審查官 (林國樑)',
                    email: 'inspector_north@osha.gov.tw',
                    contactTel: '02-89956700',
                    contactAddress: '新北市新莊區中平路439號南棟9樓 (北區職業安全衛生中心)',
                    groupId: 'INSPECT_GRP',
                    groupName: '勞檢機構審查群組',
                    roles: ['ROLE_INSPECTOR'],
                    status: 'Y'
                  })">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button class="action-btn delete" title="刪除帳號" onclick="if(confirm('確認刪除此帳號？')) alert('刪除成功！')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </td>
              </tr>
              <tr>
                <td><code>company_user</code></td>
                <td><strong>陳建銘 (台灣營造工地專員)</strong></td>
                <td>company_user@osha.gov.tw</td>
                <td>0912-345678</td>
                <td><span class="status-badge badge-info">事業單位通報群組</span></td>
                <td><span class="status-badge" style="background:#e0e7ff; color:#3730a3;">事業單位通報人員</span></td>
                <td class="v-table-center"><span class="status-badge badge-success">啟用</span></td>
                <td>2026/03/10</td>
                <td class="v-table-center">
                  <button class="action-btn edit" title="編輯帳號資料" onclick="openMemberAccountDialog('edit', {
                    account: 'company_user',
                    name: '陳建銘 (台灣營造工地專員)',
                    email: 'company_user@osha.gov.tw',
                    contactTel: '0912-345678',
                    contactAddress: '台北市中正區重慶南路一段 100 號 8 樓',
                    groupId: 'BIZ_GRP',
                    groupName: '事業單位通報群組',
                    roles: ['ROLE_COMPANY_USER'],
                    status: 'Y'
                  })">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button class="action-btn delete" title="刪除帳號" onclick="if(confirm('確認刪除此帳號？')) alert('刪除成功！')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="table-footer">
            <span>顯示第 1 至 3 筆，共 3 筆帳號記錄</span>
            <div class="pagination-btns">
              <button class="page-btn active">1</button>
            </div>
          </div>
        </div>
      `;
    }

    /* -------------------------------------------------------------
     * [基本資料] 廠商維護 (參考 Java Company.java & FormCompany.java)
     * ------------------------------------------------------------- */
    function getVendorMaintainViewHtml() {
      // 事業單位視圖：單一資料編輯存檔，統一編號不可修改
      if ((window.currentRole || 'admin') === 'company') {
        return `
          <div class="page-title-row">
            <div class="page-title-left">
              <span class="page-title-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              </span>
              <span class="page-title-text">廠商資料維護</span>
            </div>
            <span class="page-breadcrumb">首頁 > 基本資料 > 廠商維護 (事業單位)</span>
          </div>

          <div class="form-page-card" style="width: 100%; max-width: 960px; background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:28px 32px; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
            <div style="font-size:17.5px; font-weight:700; color:#1e293b; margin-bottom:24px; padding-bottom:12px; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; gap:10px;">
              <span style="display:inline-block; width:4px; height:20px; background:#0288d1; border-radius:2px;"></span>
              事業單位基本資料
              <span style="font-size: 14px; font-weight:normal; color:#64748b; margin-left:8px;">（統一編號由系統鎖定不可修改，其餘欄位可編輯後存檔）</span>
            </div>

            <form onsubmit="event.preventDefault(); alert('廠商資料儲存成功！');" style="display:flex; flex-direction:column; gap:18px;">
              <!-- 統一編號 (不可修改) -->
              <div class="form-field-group">
                <label>統一編號 <span style="font-size: 13px; color:#ef4444;">(不可修改)</span></label>
                <input type="text" class="v-input" id="vendorTaxId" value="16541333" readonly style="background:#f1f5f9; color:#64748b; cursor:not-allowed; font-family:monospace; font-weight:600;">
              </div>

              <!-- 廠商名稱 -->
              <div class="form-field-group">
                <label>廠商/事業單位名稱 <span class="form-req">*</span></label>
                <input type="text" class="v-input" id="vendorName" value="台灣營造事業單位股份有限公司" required>
              </div>

              <!-- 負責人姓名 -->
              <div class="form-field-group">
                <label>負責人姓名 <span class="form-req">*</span></label>
                <input type="text" class="v-input" id="vendorOwner" value="李建國" required>
              </div>

              <!-- 聯絡人姓名 -->
              <div class="form-field-group">
                <label>聯絡人姓名 <span class="form-req">*</span></label>
                <input type="text" class="v-input" id="vendorContactPerson" value="陳小華" placeholder="請輸入聯絡人姓名" required>
              </div>

              <!-- 連絡電話 -->
              <div class="form-field-group">
                <label>電話號碼 <span class="form-req">*</span></label>
                <input type="text" class="v-input" id="vendorPhone" value="02-23881234" required>
              </div>

              <!-- 工廠登記證號 -->
              <div class="form-field-group">
                <label>工廠登記證號碼</label>
                <input type="text" class="v-input" id="vendorFacNo" value="64-123456-01" placeholder="無則免填">
              </div>

              <!-- 行業類別 -->
              <div class="form-field-group">
                <label>行業類別</label>
                <input type="text" class="v-input" id="vendorCategory" value="營造業 / 建築工程業" placeholder="請輸入行業類別，無則免填">
              </div>

              <!-- 勞工人數 -->
              <div class="form-field-group">
                <label>勞工人數 <span class="form-req">*</span></label>
                <select class="v-select" id="vendorWorkerCount" required style="width:100%;">
                  <option value="1">1 ~ 29 人</option>
                  <option value="2" selected>30 ~ 99 人</option>
                  <option value="3">100 ~ 299 人</option>
                  <option value="4">300 人以上</option>
                </select>
              </div>

              <!-- 縣市 -->
              <div class="form-field-group">
                <label>所在縣市 <span class="form-req">*</span></label>
                <select class="v-select" id="vendorCity" required style="width:100%;">
                  <option value="台北市" selected>台北市</option>
                  <option value="新北市">新北市</option>
                  <option value="基隆市">基隆市</option>
                  <option value="桃園市">桃園市</option>
                  <option value="新竹市">新竹市</option>
                  <option value="台中市">台中市</option>
                  <option value="台南市">台南市</option>
                  <option value="高雄市">高雄市</option>
                </select>
              </div>

              <!-- 鄉鎮區 -->
              <div class="form-field-group">
                <label>鄉鎮市區 <span class="form-req">*</span></label>
                <input type="text" class="v-input" id="vendorDistrict" value="中正區" placeholder="例如：中正區" required>
              </div>

              <!-- 地址 -->
              <div class="form-field-group">
                <label>詳細地址 <span class="form-req">*</span></label>
                <input type="text" class="v-input" id="vendorAddress" value="重慶南路一段 100 號 8 樓" placeholder="請輸入街道、門牌、樓層" required>
              </div>

              <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px; padding-top:18px; border-top:1px solid #f1f5f9;">
                <button type="button" class="action-btn" style="padding:10px 22px; font-size:15px; border:1px solid #cbd5e1; border-radius:6px; background:#ffffff; color:#475569;" onclick="renderView('vendorMaintain')">重設內容</button>
                <button type="submit" class="btn-add" style="padding:10px 28px; font-size: 15.5px; font-weight: 600;">💾 儲存修改</button>
              </div>
            </form>
          </div>
        `;
      }

      // 管理者視圖：全域廠商清單列表 (DatatableComponent)
      return `
        <div class="page-title-row">
          <div class="page-title-left">
            <span class="page-title-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            </span>
            <span class="page-title-text">廠商維護</span>
          </div>
          <span class="page-breadcrumb">首頁 > 基本資料 > 廠商維護</span>
        </div>

        <div class="button-group-row" style="margin-bottom:14px;">
          <button class="btn-add" onclick="openCompanyDialog('add')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            新增廠商
          </button>
        </div>

        <!-- 查詢條件區塊 -->
        <div class="search-filter-card">
          <div class="search-filter-fields">
            <div class="search-filter-item">
              <span class="label">統一編號 / 廠商名稱：</span>
              <input type="text" class="v-input" id="sysVendorSearchKeyword" placeholder="請輸入統一編號或廠商名稱" style="width:250px; padding:7px 12px; font-size:15px;">
            </div>
            <div class="search-filter-item">
              <span class="label">行業類別：</span>
              <select class="v-select" id="sysVendorSearchCategory" style="min-width:180px; padding:7px 12px; font-size:15px;">
                <option value="">全部行業類別</option>
                <option value="營造業 / 建築工程業">營造業 / 建築工程業</option>
                <option value="土木工程業">土木工程業</option>
                <option value="電器及通訊工程業">電器及通訊工程業</option>
              </select>
            </div>
          </div>

          <!-- 查詢與重設按鈕：固定在區塊下方置中 -->
          <div class="search-filter-actions">
            <button class="btn-search" onclick="alert('執行廠商搜尋')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              搜尋
            </button>
            <button class="btn-reset" title="重設條件" onclick="const k=document.getElementById('sysVendorSearchKeyword'); const c=document.getElementById('sysVendorSearchCategory'); if(k)k.value=''; if(c)c.value=''; alert('已重設條件');">重設</button>
          </div>
        </div>

        <div class="v-table-wrap">
          <table class="v-table">
            <thead>
              <tr>
                <th>統一編號</th>
                <th>廠商名稱</th>
                <th>負責人</th>
                <th>聯絡電話</th>
                <th>營業地址</th>
                <th>行業類別</th>
                <th>勞工人數</th>
                <th>加入日期</th>
                <th class="v-table-center">動作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>16541333</code></td>
                <td><strong>台灣營造事業單位股份有限公司</strong></td>
                <td>李建國</td>
                <td>02-23881234</td>
                <td>台北市中正區重慶南路一段 100 號 8 樓</td>
                <td><span class="status-badge badge-info">營造業 / 建築工程業</span></td>
                <td>30 ~ 99 人</td>
                <td>2026/01/10</td>
                <td class="v-table-center">
                  <button class="action-btn edit" title="編輯廠商資料" onclick="openCompanyDialog('edit', {
                    idn: '16541333',
                    name: '台灣營造事業單位股份有限公司',
                    chargeName: '李建國',
                    contactName: '陳小華',
                    contactTel: '02-23881234',
                    facNo: '64-123456-01',
                    facCategory: '營造業 / 建築工程業',
                    laborNumber: '2',
                    county: '台北市',
                    township: '中正區',
                    address: '重慶南路一段 100 號 8 樓',
                    status: 'Y'
                  })">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button class="action-btn delete" title="刪除廠商" onclick="if(confirm('確認刪除此廠商資料？')) alert('刪除成功！')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </td>
              </tr>
              <tr>
                <td><code>54896201</code></td>
                <td><strong>宏盛工程技術股份有限公司</strong></td>
                <td>陳美雲</td>
                <td>02-89556677</td>
                <td>新北市板橋區縣民大道二段 68 號</td>
                <td><span class="status-badge badge-info">電器及通訊工程業</span></td>
                <td>100 ~ 299 人</td>
                <td>2026/02/20</td>
                <td class="v-table-center">
                  <button class="action-btn edit" title="編輯廠商資料" onclick="openCompanyDialog('edit', {
                    idn: '54896201',
                    name: '宏盛工程技術股份有限公司',
                    chargeName: '陳美雲',
                    contactName: '張督導',
                    contactTel: '02-89556677',
                    facNo: '',
                    facCategory: '電器及通訊工程業',
                    laborNumber: '3',
                    county: '新北市',
                    township: '板橋區',
                    address: '縣民大道二段 68 號',
                    status: 'Y'
                  })">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button class="action-btn delete" title="刪除廠商" onclick="if(confirm('確認刪除此廠商資料？')) alert('刪除成功！')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </td>
              </tr>
              <tr>
                <td><code>28491033</code></td>
                <td><strong>大同高空吊掛設備有限公司</strong></td>
                <td>張志豪</td>
                <td>04-22558899</td>
                <td>台中市西屯區台灣大道三段 99 號</td>
                <td><span class="status-badge badge-info">其他指定危險性工作場所行業</span></td>
                <td>1 ~ 29 人</td>
                <td>2026/03/05</td>
                <td class="v-table-center">
                  <button class="action-btn edit" title="編輯廠商資料" onclick="openCompanyDialog('edit', {
                    idn: '28491033',
                    name: '大同高空吊掛設備有限公司',
                    chargeName: '張志豪',
                    contactName: '林專員',
                    contactTel: '04-22558899',
                    facNo: '',
                    facCategory: '其他指定危險性工作場所行業',
                    laborNumber: '1',
                    county: '台中市',
                    township: '西屯區',
                    address: '台灣大道三段 99 號',
                    status: 'Y'
                  })">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button class="action-btn delete" title="刪除廠商" onclick="if(confirm('確認刪除此廠商資料？')) alert('刪除成功！')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="table-footer">
            <span>顯示第 1 至 3 筆，共 3 筆廠商記錄</span>
            <div class="pagination-btns">
              <button class="page-btn active">1</button>
            </div>
          </div>
        </div>
      `;
    }

    /* =============================================================
     * [功能 6] 地方項目維護 (參考 2026_hwri擴充/index.html 之地方項目)
     * ============================================================= */
    let globalLocalWorkData = {
      '新北市政府勞動檢查處': ['廣告招牌裝設', '2公尺以上擋土支撐工程'],
      '桃園市政府勞動檢查處': ['舞台搭設與吊掛路權'],
      '高雄市政府勞工局勞動檢查處': ['船舶或一定規模建築物拆除'],
      '國科會新竹科學園區管理局': ['無塵室設備吊掛與移機作業'],
      '國科會中部科學園區管理局': ['特殊製程管線切換維護作業'],
      '臺北市勞動檢查處': ['高空吊車吊掛招牌維護作業', '吊籠外牆清洗與塗裝作業'],
      '臺中市勞動檢查處': ['深開挖支撐與塔式起重機組拆'],
      '臺南市職安健康處': ['開放水域影視拍攝作業', '高空外牆維修作業'],
      '國科會南部科學園區管理局': ['化學氣體管線抽換與歲修作業'],
      '經濟部產業園區管理局': ['高壓變電站內部熱工作業'],
      '北區職業安全衛生中心': ['輸電線路鐵塔高空修繕作業'],
      '中區職業安全衛生中心': ['大型穀倉局限空間內部清整'],
      '南區職業安全衛生中心': ['石化廠槽體動火檢修作業']
    };
    window.globalLocalWorkData = globalLocalWorkData;

    let lastRemovedLocalOffice = null;
    function getLocalMaintainViewHtml() {
      const links = getPortalLinks();
      return `<div class="page-title-row"><div class="page-title-left"><span class="page-title-text">地方通報網站維護</span></div><span class="page-breadcrumb">首頁 › 地方通報網站維護</span></div>
        <div class="local-editor"><h3>勞檢機構特殊申報網站</h3><p>只保留有特殊申報作業的機構。設定的連結會顯示於通報第二步的特殊通報提醒下方。</p>
          <div class="local-office-toolbar"><strong id="localOfficeCount">目前保留 ${Object.keys(links.offices).length} 個機構</strong><button type="button" class="v-btn v-btn-primary" onclick="openLocalReportingOfficeEditor()">新增機構</button></div>
          <p class="local-save-status" id="localWebsiteStatus" role="status" aria-live="polite"></p><button type="button" class="v-btn v-btn-cancel" id="localOfficeUndo" hidden onclick="undoRemoveLocalReportingOffice()">撤銷移除</button>
          <div id="localConfiguredBadges">${getLocalLinkButtonsHtml()}</div>
          <section id="localOfficeEditor" class="local-office-editor" aria-labelledby="localOfficeEditorTitle" hidden>
            <h4 id="localOfficeEditorTitle">特殊申報網站設定</h4>
            <form onsubmit="event.preventDefault();saveLocalWorkItemEditor();">
              <div class="form-field-group"><label for="localAdminUnitSelect">勞動檢查機構 <span class="form-req">*</span></label><select id="localAdminUnitSelect" class="v-select" onchange="loadLocalWorkItemEditor()"><option value="">請選擇機構</option></select></div>
              <div class="form-field-group"><label for="localAdminWebsite">主要通報入口網址 <span class="form-req">*</span></label><input class="v-input" type="url" id="localAdminWebsite" placeholder="https://" aria-describedby="localWebsiteHelp"></div>
              <p class="local-editor-help" id="localWebsiteHelp">填入特殊申報的實際入口網址；同一機構有不同服務時，可新增其他入口。</p>
              <div class="form-field-group"><label for="localAdminWebsiteLabel">主要入口名稱</label><input id="localAdminWebsiteLabel" class="v-input" maxlength="100" placeholder="例如：特定作業通報"></div>
              <section class="local-extra-entrances" aria-labelledby="localExtraTitle"><h4 id="localExtraTitle">其他通報入口</h4><div id="localAdditionalLinks"></div><button type="button" class="v-btn v-btn-cancel" onclick="addLocalAdditionalLink()">新增通報入口</button></section>
              <div class="form-field-group"><label for="localWebsiteEnabled">顯示於通報頁</label><div><label class="risk-confirm"><input type="checkbox" id="localWebsiteEnabled" checked>顯示這個機構的特殊申報連結</label></div></div>
              <div class="local-editor-actions"><button type="button" class="v-btn v-btn-cancel" onclick="closeLocalReportingOfficeEditor()">取消編輯</button><button type="submit" class="v-btn v-btn-primary">儲存網站連結</button></div>
              <p class="flow-error" id="localWebsiteError" role="alert" hidden></p>
            </form>
          </section>
          ${currentRole === 'admin' ? `<section class="toira-admin-settings"><h3>TOiRA 入口網址</h3><p>TOiRA 正式服務上線或網址變更時，可在此更新。</p><form onsubmit="event.preventDefault();saveToiraPortalUrl();"><label for="portalToiraUrl">TOiRA 網址</label><input id="portalToiraUrl" class="v-input" type="url" required value="${portalEscape(links.toiraUrl)}"><button type="submit" class="v-btn v-btn-primary">儲存 TOiRA 網址</button><p id="toiraSettingStatus" role="status"></p></form></section>` : ''}
        </div>`;
    }
    function canMaintainSpecialOfficeLinks() { return ['admin','inspection'].includes(window.currentRole); }
    function openLocalReportingOfficeEditor(unitName = '') {
      if (!canMaintainSpecialOfficeLinks()) return;
      const config = getPortalLinks();
      const units = unitName ? [unitName] : ALL_ADMIN_UNITS_LIST.filter(unit => !config.offices[unit]);
      const status = document.getElementById('localWebsiteStatus');
      if (!units.length) { status.textContent = '所有機構皆已加入；請從清單編輯或移除。'; return; }
      const sel = document.getElementById('localAdminUnitSelect');
      sel.innerHTML = (unitName ? '' : '<option value="">請選擇機構</option>') + units.map(unit => `<option value="${portalEscape(unit)}">${portalEscape(unit)}</option>`).join('');
      sel.disabled = !!unitName; sel.value = unitName;
      document.getElementById('localOfficeEditorTitle').textContent = unitName ? '編輯特殊申報網站' : '新增特殊申報機構';
      document.getElementById('localOfficeEditor').hidden = false;
      loadLocalWorkItemEditor();
      (unitName ? document.getElementById('localAdminWebsite') : sel).focus();
    }
    function closeLocalReportingOfficeEditor() { document.getElementById('localOfficeEditor').hidden = true; }
    function refreshLocalReportingOfficeList() {
      document.getElementById('localConfiguredBadges').innerHTML = getLocalLinkButtonsHtml();
      document.getElementById('localOfficeCount').textContent = '目前保留 ' + Object.keys(getPortalLinks().offices).length + ' 個機構';
      refreshPortalLinks();
    }
    function removeLocalReportingOffice(unit) {
      if (!canMaintainSpecialOfficeLinks()) return;
      const config = getPortalLinks();
      if (!config.offices[unit]) return;
      const item = structuredClone(config.offices[unit]);
      delete config.offices[unit];
      const status = document.getElementById('localWebsiteStatus');
      try { localStorage.setItem(PORTAL_CONFIG_KEY, JSON.stringify(config)); }
      catch { status.textContent = '無法儲存移除結果，請確認瀏覽器允許儲存資料後重試。'; return; }
      lastRemovedLocalOffice = {unit,item};
      closeLocalReportingOfficeEditor();
      refreshLocalReportingOfficeList();
      status.textContent = '已移除「' + unit + '」的特殊申報連結，可撤銷或重新新增。';
      document.getElementById('localOfficeUndo').hidden = false;
    }
    function undoRemoveLocalReportingOffice() {
      if (!canMaintainSpecialOfficeLinks() || !lastRemovedLocalOffice) return;
      const config = getPortalLinks(), removed = lastRemovedLocalOffice;
      if (config.offices[removed.unit]) return;
      config.offices[removed.unit] = removed.item;
      const status = document.getElementById('localWebsiteStatus');
      try { localStorage.setItem(PORTAL_CONFIG_KEY, JSON.stringify(config)); }
      catch { status.textContent = '無法撤銷移除，請確認瀏覽器允許儲存資料後重試。'; return; }
      lastRemovedLocalOffice = null;
      refreshLocalReportingOfficeList();
      document.getElementById('localOfficeUndo').hidden = true;
      status.textContent = '已恢復「' + removed.unit + '」的特殊申報連結。';
    }
    let localExtraLinkSequence = 0;
    function getLocalAdditionalLinkRowHtml(link = {}) {
      const id = ++localExtraLinkSequence;
      return `<div class="local-extra-link"><div><label for="localExtraName${id}">入口名稱</label><input id="localExtraName${id}" class="v-input local-extra-name" maxlength="100" value="${portalEscape(link.label || '')}" placeholder="例如：局限空間作業申報"></div><div><label for="localExtraUrl${id}">入口網址</label><input id="localExtraUrl${id}" class="v-input local-extra-url" type="url" value="${portalEscape(link.url || '')}" placeholder="https://"></div><button type="button" class="v-btn v-btn-cancel" onclick="this.closest('.local-extra-link').remove()" aria-label="移除此通報入口">移除</button></div>`;
    }
    function getLocalAdditionalLinksHtml(items = []) {
      return (Array.isArray(items) ? items : []).map(getLocalAdditionalLinkRowHtml).join('');
    }
    function addLocalAdditionalLink() {
      const container = document.getElementById('localAdditionalLinks');
      container.insertAdjacentHTML('beforeend',getLocalAdditionalLinkRowHtml());
      container.lastElementChild.querySelector('.local-extra-name').focus();
    }
    function getLocalLinkButtonsHtml() {
      const offices = getPortalLinks().offices;
      const units = ALL_ADMIN_UNITS_LIST.filter(unit => offices[unit]);
      if (!units.length) return '<div class="local-office-empty"><p>尚未保留特殊申報機構。需要時請新增機構及通報入口。</p></div>';
      return '<div class="v-table-wrap"><table class="v-table local-office-table"><thead><tr><th>勞動檢查機構</th><th>特殊申報入口</th><th>操作</th></tr></thead><tbody>' + units.map(unit => {
        const item = offices[unit];
        const links = [{url:item.url,label:item.label}, ...(item.additionalLinks || [])];
        return `<tr><td><strong>${portalEscape(unit)}</strong><small class="local-office-visibility">${item.enabled ? '顯示於通報頁' : '暫不顯示'}</small></td><td>${links.map(link => `<a class="local-office-link" href="${portalEscape(link.url)}" target="_blank" rel="noopener noreferrer">${portalEscape(link.label)}<span class="sr-only">（另開新分頁）</span></a>`).join('')}</td><td class="local-office-row-actions"><button type="button" class="v-btn v-btn-cancel" onclick="selectLocalAdminUnitQuick('${portalEscape(unit)}')" aria-label="編輯 ${portalEscape(unit)}">編輯</button><button type="button" class="v-btn v-btn-cancel local-office-remove" onclick="removeLocalReportingOffice('${portalEscape(unit)}')" aria-label="移除 ${portalEscape(unit)}">移除</button></td></tr>`;
      }).join('') + '</tbody></table></div>';
    }
    function selectLocalAdminUnitQuick(unitName) { openLocalReportingOfficeEditor(unitName); }
    function loadLocalWorkItemEditor() {
      const unit = document.getElementById('localAdminUnitSelect')?.value;
      const item = getPortalLinks().offices[unit] || {url:'',enabled:true};
      const input = document.getElementById('localAdminWebsite');
      if (!input) return;
      input.value = item.url;
      document.getElementById('localAdminWebsiteLabel').value = item.label || '通報入口';
      document.getElementById('localAdditionalLinks').innerHTML = getLocalAdditionalLinksHtml(item.additionalLinks);
      document.getElementById('localWebsiteEnabled').checked = item.enabled;
      document.getElementById('localWebsiteStatus').textContent = '';
      document.getElementById('localWebsiteError').hidden = true;
    }
    function saveLocalWorkItemEditor() {
      if (!canMaintainSpecialOfficeLinks()) return;
      const unit = document.getElementById('localAdminUnitSelect')?.value;
      const raw = document.getElementById('localAdminWebsite')?.value.trim() || '';
      const enabled = document.getElementById('localWebsiteEnabled')?.checked;
      const error = document.getElementById('localWebsiteError');
      if (!ALL_ADMIN_UNITS_LIST.includes(unit) || !portalSafeUrl(raw)) {
        error.textContent = '請選擇機構，並填寫有效的 http:// 或 https:// 特殊申報入口網址。'; error.hidden = false; document.getElementById('localAdminWebsite').focus(); return;
      }
      const additionalLinks = [];
      for (const row of document.querySelectorAll('#localAdditionalLinks .local-extra-link')) {
        const nameInput = row.querySelector('.local-extra-name');
        const urlInput = row.querySelector('.local-extra-url');
        const label = nameInput.value.trim();
        const extraRaw = urlInput.value.trim();
        if (!label && !extraRaw) continue;
        const url = portalSafeUrl(extraRaw);
        if (!label || !url) {
          error.textContent = '其他通報入口請同時填寫名稱及有效網址，或移除該入口。'; error.hidden = false;
          (!label ? nameInput : urlInput).focus(); return;
        }
        if (url === portalSafeUrl(raw) || additionalLinks.some(link => link.url === url)) {
          error.textContent = '通報入口網址重複，請確認後再儲存。'; error.hidden = false; urlInput.focus(); return;
        }
        additionalLinks.push({label,url});
      }
      const label = document.getElementById('localAdminWebsiteLabel').value.trim() || '通報入口';
      const config = getPortalLinks(); config.offices[unit] = {url:portalSafeUrl(raw),enabled:!!enabled,label,additionalLinks};
      try { localStorage.setItem(PORTAL_CONFIG_KEY,JSON.stringify(config)); }
      catch { error.textContent = '瀏覽器無法儲存設定，請確認允許網站儲存資料後重試。'; error.hidden = false; return; }
      error.hidden = true;
      document.getElementById('localWebsiteStatus').textContent = '已儲存「' + unit + '」的網站連結。';
      lastRemovedLocalOffice = null;
      document.getElementById('localOfficeUndo').hidden = true;
      closeLocalReportingOfficeEditor();
      refreshLocalReportingOfficeList();
    }
    function saveToiraPortalUrl() {
      const input = document.getElementById('portalToiraUrl');
      const url = portalSafeUrl(input.value);
      const status = document.getElementById('toiraSettingStatus');
      if (!url) { status.textContent = '請填寫有效的 http:// 或 https:// 網址。'; input.focus(); return; }
      const config = getPortalLinks(); config.toiraUrl = url;
      try { localStorage.setItem(PORTAL_CONFIG_KEY,JSON.stringify(config)); status.textContent = 'TOiRA 入口網址已更新。'; refreshPortalLinks(); }
      catch { status.textContent = '無法儲存設定，請確認瀏覽器允許網站儲存資料後重試。'; }
    }


    /* =============================================================
     * [功能 7] 危評維護 (參考 2026_hwri擴充/index.html 之危險性工作場所維護)
     * 比照案件列表模式，分成危險性工作場所列表，新增按鈕，列表操作[編輯, 刪除]
     * ============================================================= */
    let globalHazardWorkplaces = [
      { id: 'HW-001', companyName: '真有味食品有限公司', taxId: '29954853', siteName: '五股廠', adminUnit: '新北市政府勞動檢查處', note: '危評列管' },
      { id: 'HW-002', companyName: '港都船舶修護公司', taxId: '87654321', siteName: '小港碼頭', adminUnit: '高雄市政府勞工局勞動檢查處', note: '局限空間' },
      { id: 'HW-003', companyName: '中科精密工業股份有限公司', taxId: '99887766', siteName: '中科廠區', adminUnit: '國科會中部科學園區管理局', note: '科學園區' },
      { id: 'HW-004', companyName: '台灣電力股份有限公司', taxId: '03704505', siteName: '北區供電區處', adminUnit: '北區職業安全衛生中心', note: '跨區管線' },
      { id: 'HW-005', companyName: '大安建設股份有限公司', taxId: '12345678', siteName: '復興段工地', adminUnit: '臺北市勞動檢查處', note: '一定規模工程' }
    ];

    let workplaceFilterKeyword = '';
    let workplaceFilterAdmin = '';

    function getWorkplaceMaintainViewHtml() {
      return `
        <div class="page-title-row">
          <div class="page-title-left">
            <span class="page-title-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </span>
            <span class="page-title-text">危評維護 (危險性工作場所列表)</span>
          </div>
          <span class="page-breadcrumb">首頁 > 專案維護 > 危評維護</span>
        </div>

        <!-- 比照案件列表模式之頂部新增按鈕列 -->
        <div class="button-group-row" style="margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <button class="btn-add" onclick="openWorkplaceDialog('add')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              新增工作場所
            </button>
          </div>
        </div>

        <!-- 查詢條件區塊 (比照案件列表搜尋列) -->
        <div class="search-filter-card">
          <div class="search-filter-fields">
            <!-- 關鍵字 (事業單位/統編/場域名稱) -->
            <div class="search-filter-item">
              <span class="label">關鍵字查詢：</span>
              <input type="text" class="v-input" id="wpSearchKeyword" placeholder="事業單位名稱 / 統一編號 / 場域" value="${workplaceFilterKeyword}" style="width:280px; padding:7px 12px; font-size: 15px;">
            </div>

            <!-- 管轄機關篩選 -->
            <div class="search-filter-item">
              <span class="label">管轄單位：</span>
              <select class="v-select" id="wpSearchAdmin" style="min-width:200px; padding:7px 12px; font-size: 15px;">
                <option value="">全部管轄單位</option>
                ${ALL_ADMIN_UNITS_LIST.map(u => `<option value="${u}" ${u === workplaceFilterAdmin ? 'selected' : ''}>${u}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- 查詢與重設按鈕：固定在區塊下方置中 -->
          <div class="search-filter-actions">
            <button class="btn-search" onclick="applyWorkplaceFilter()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              搜尋
            </button>
            <button class="btn-reset" onclick="resetWorkplaceFilter()">重設</button>
          </div>
        </div>

        <!-- 危險性工作場所列表 (比照 Datatable 格式) -->
        <div class="v-table-wrap">
          <table class="v-table" id="workplaceDataTable">
            <thead>
              <tr>
                <th style="width:110px;">場所編號</th>
                <th>事業單位名稱</th>
                <th style="width:120px;">統一編號</th>
                <th>場域名稱</th>
                <th>管轄勞檢單位</th>
                <th>備註說明</th>
                <th class="v-table-center" style="width:110px;">操作</th>
              </tr>
            </thead>
            <tbody id="workplaceTableBody">
              ${renderWorkplaceTableHtml()}
            </tbody>
          </table>
          <div class="table-footer" id="workplaceTableFooter">
            <span>顯示第 1 至 ${getFilteredWorkplaces().length} 筆，共 ${getFilteredWorkplaces().length} 筆危險性工作場所列管記錄</span>
            <div class="pagination-btns">
              <button class="page-btn active">1</button>
            </div>
          </div>
        </div>
      `;
    }

    function getFilteredWorkplaces() {
      return globalHazardWorkplaces.filter(w => {
        if (workplaceFilterKeyword) {
          const kw = workplaceFilterKeyword.toLowerCase();
          const matchCompany = (w.companyName || '').toLowerCase().includes(kw);
          const matchTaxId = (w.taxId || '').toLowerCase().includes(kw);
          const matchSite = (w.siteName || '').toLowerCase().includes(kw);
          const matchId = (w.id || '').toLowerCase().includes(kw);
          if (!matchCompany && !matchTaxId && !matchSite && !matchId) return false;
        }
        if (workplaceFilterAdmin) {
          if (w.adminUnit !== workplaceFilterAdmin) return false;
        }
        return true;
      });
    }

    function renderWorkplaceTableHtml() {
      const list = getFilteredWorkplaces();
      if (list.length === 0) {
        return `<tr><td colspan="7" style="text-align:center; padding:32px; color:#94a3b8;">查無符合條件的危險性工作場所資料</td></tr>`;
      }
      return list.map(w => `
        <tr>
          <td><code>${w.id}</code></td>
          <td><strong>${w.companyName}</strong></td>
          <td>${w.taxId ? `<code>${w.taxId}</code>` : '<span style="color:#94a3b8;">—</span>'}</td>
          <td>${w.siteName}</td>
          <td><span class="status-badge badge-info" style="font-weight:500;">${w.adminUnit}</span></td>
          <td style="color:#475569; font-size: 13px;">${w.note || '—'}</td>
          <td class="v-table-center" style="white-space:nowrap;">
            <button class="action-btn edit" title="編輯" onclick="openWorkplaceDialog('edit', '${w.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="action-btn delete" title="刪除" onclick="deleteWorkplaceItem('${w.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </td>
        </tr>
      `).join('');
    }

    function applyWorkplaceFilter() {
      const kw = document.getElementById('wpSearchKeyword')?.value.trim() || '';
      const adm = document.getElementById('wpSearchAdmin')?.value || '';
      workplaceFilterKeyword = kw;
      workplaceFilterAdmin = adm;
      const tbody = document.getElementById('workplaceTableBody');
      const footer = document.getElementById('workplaceTableFooter');
      if (tbody) tbody.innerHTML = renderWorkplaceTableHtml();
      if (footer) {
        const count = getFilteredWorkplaces().length;
        footer.innerHTML = `
          <span>顯示第 1 至 ${count} 筆，共 ${count} 筆危險性工作場所列管記錄</span>
          <div class="pagination-btns"><button class="page-btn active">1</button></div>
        `;
      }
    }

    function resetWorkplaceFilter() {
      workplaceFilterKeyword = '';
      workplaceFilterAdmin = '';
      const kwInput = document.getElementById('wpSearchKeyword');
      const admSelect = document.getElementById('wpSearchAdmin');
      if (kwInput) kwInput.value = '';
      if (admSelect) admSelect.value = '';
      applyWorkplaceFilter();
    }

    function openWorkplaceDialog(mode, idOrItem) {
      const isEdit = (mode === 'edit');
      let item = {};
      if (isEdit) {
        if (typeof idOrItem === 'string') {
          item = globalHazardWorkplaces.find(x => x.id === idOrItem) || {};
        } else {
          item = idOrItem || {};
        }
      }

      const title = isEdit ? '編輯危險性工作場所' : '新增危險性工作場所';
      const titleMsg = isEdit ? `※ 編號：${item.id || ''}` : '※ 請填寫事業單位名稱、場域與管轄勞檢單位';

      const bodyHtml = `
        <form id="wpMaintainForm" onsubmit="event.preventDefault();" style="display:flex; flex-direction:column; gap:14px;">
          <input type="hidden" id="wpEditId" value="${item.id || ''}">
          
          <div class="form-field-group">
            <label>事業單位名稱 <span class="form-req">*</span></label>
            <input type="text" class="v-input" id="wpDialogCompany" value="${item.companyName || ''}" placeholder="請輸入事業單位全銜" required>
          </div>

          <div class="form-field-group">
            <label>統一編號 (統編)</label>
            <input type="text" class="v-input" id="wpDialogTaxId" value="${item.taxId || ''}" placeholder="例如：29954853 (8碼數字，選填)" maxlength="8">
          </div>

          <div class="form-field-group">
            <label>場域名稱 <span class="form-req">*</span></label>
            <input type="text" class="v-input" id="wpDialogSite" value="${item.siteName || ''}" placeholder="例如：五股廠、第一碼頭、復興段工地" required>
          </div>

          <div class="form-field-group">
            <label>管轄勞檢單位 <span class="form-req">*</span></label>
            <select class="v-select" id="wpDialogAdmin" required>
              <option value="">請選擇管轄勞檢單位</option>
              ${ALL_ADMIN_UNITS_LIST.map(u => `<option value="${u}" ${u === item.adminUnit ? 'selected' : ''}>${u}</option>`).join('')}
            </select>
          </div>

          <div class="form-field-group">
            <label>列管備註說明</label>
            <input type="text" class="v-input" id="wpDialogNote" value="${item.note || ''}" placeholder="例如：危評列管、局限空間作業場所、一定規模工程">
          </div>

          <!-- 底部操作按鈕：比照案件通報新增編輯視窗樣式 -->
          <div style="display:flex; justify-content:flex-end; align-items:center; gap:12px; margin-top:20px; padding-top:16px; border-top:1px solid #e2e8f0;">
            <button type="button" class="v-btn v-btn-cancel" onclick="closeVDialog()" style="padding:9px 22px; font-size: 14px; font-weight:600; border-radius:6px; cursor:pointer; background:#fff; border:1px solid #cbd5e1; color:#475569;">取消</button>
            <button type="button" class="btn-add" onclick="submitWorkplaceForm()" style="background:#16a34a; padding:9px 24px; font-size: 14px; font-weight:700; border-radius:6px; border:none; color:#fff; cursor:pointer; display:inline-flex; align-items:center; gap:6px; box-shadow:0 1px 2px rgba(0,0,0,0.08);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              ${isEdit ? '確認儲存變更' : '確認完成新增'}
            </button>
          </div>
        </form>
      `;

      openVDialog({
        title: title,
        titleMsg: titleMsg,
        maxWidth: '680px',
        hideFooter: true,
        bodyHtml: bodyHtml
      });
    }

    function submitWorkplaceForm() {
      const companyName = document.getElementById('wpDialogCompany')?.value.trim();
      const taxId = document.getElementById('wpDialogTaxId')?.value.trim();
      const siteName = document.getElementById('wpDialogSite')?.value.trim();
      const adminUnit = document.getElementById('wpDialogAdmin')?.value;
      const note = document.getElementById('wpDialogNote')?.value.trim();

      if (!companyName) { alert('請填寫事業單位名稱！'); return; }
      if (!siteName) { alert('請填寫場域名稱！'); return; }
      if (!adminUnit) { alert('請選擇管轄勞檢單位！'); return; }

      const editId = document.getElementById('wpEditId')?.value;
      const isEdit = Boolean(editId);

      if (isEdit) {
        const target = globalHazardWorkplaces.find(x => x.id === editId);
        if (target) {
          Object.assign(target, { companyName, taxId, siteName, adminUnit, note });
          alert('✔ 【編輯成功】已更新危險性工作場所【' + target.id + '】！');
        }
      } else {
        const newId = 'HW-' + String(Date.now()).slice(-4);
        globalHazardWorkplaces.unshift({
          id: newId,
          companyName,
          taxId,
          siteName,
          adminUnit,
          note
        });
        alert('✔ 【新增成功】已新增危險性工作場所【' + newId + ' - ' + companyName + '】！');
      }

      closeVDialog();
      applyWorkplaceFilter();
    }

    window.submitWorkplaceForm = submitWorkplaceForm;

    function deleteWorkplaceItem(id) {
      const target = globalHazardWorkplaces.find(x => x.id === id);
      if (!target) return;
      if (!confirm(`確定要刪除危險性工作場所【${target.id} - ${target.companyName} (${target.siteName})】嗎？\n\n此動作刪除後將不再列管。`)) {
        return;
      }
      globalHazardWorkplaces = globalHazardWorkplaces.filter(x => x.id !== id);
      alert(`已成功刪除工作場所【${id}】！`);
      applyWorkplaceFilter();
    }

    window.openWorkplaceDialog = openWorkplaceDialog;
    window.deleteWorkplaceItem = deleteWorkplaceItem;
    window.loadLocalWorkItemEditor = loadLocalWorkItemEditor;
    window.saveLocalWorkItemEditor = saveLocalWorkItemEditor;
    window.selectLocalAdminUnitQuick = selectLocalAdminUnitQuick;
    window.applyWorkplaceFilter = applyWorkplaceFilter;
    window.resetWorkplaceFilter = resetWorkplaceFilter;


// 全域導出
window.renderView = renderView;
window.getMsgTemplateViewHtml = getMsgTemplateViewHtml;
window.getSysCodeViewHtml = getSysCodeViewHtml;
window.getSysLogViewHtml = getSysLogViewHtml;
window.getSysGroupViewHtml = getSysGroupViewHtml;
window.getSysRoleViewHtml = getSysRoleViewHtml;
window.getSysFunctionViewHtml = getSysFunctionViewHtml;
window.getAccountMaintainViewHtml = getAccountMaintainViewHtml;
window.getVendorMaintainViewHtml = getVendorMaintainViewHtml;
window.getLocalMaintainViewHtml = getLocalMaintainViewHtml;
window.getWorkplaceMaintainViewHtml = getWorkplaceMaintainViewHtml;

window.selectTreeNode = selectTreeNode;

