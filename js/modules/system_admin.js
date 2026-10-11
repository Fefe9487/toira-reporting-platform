/* =========================================================
 * system_admin.js - 系統管理功能互動邏輯 (帳號、廠商、地方項目、危評、代碼、群組、角色、Log)
 * ========================================================= */
    /* =========================================================
     * 系統管理 新增/編輯 畫面互動邏輯 (對應 Vue 專案各組件)
     * ========================================================= */
    let currentDialogCallback = null;

    
    /* =========================================================
     * 廠商維護與帳號維護：對話框與互動邏輯 (參考 Java 端欄位設定)
     * ========================================================= */

    /**
     * 廠商維護彈窗 (參考 Java Company.java & FormCompany.java)
     * 欄位：idn, name, chargeName, contactName, contactTel, facCategory, laborNumber, facNo, county, township, address, status
     */
    function openCompanyDialog(mode, data = {}) {
      const isEdit = mode === 'edit';
      const title = isEdit ? '編輯廠商資料' : '新增廠商資料';
      const titleMsg = isEdit ? `※ 統一編號：${data.idn || '16541333'} (系統鍵值唯讀)` : '※ 請詳實填寫廠商基本登記與聯絡資訊';

      const bodyHtml = `
        <form id="vCompanyForm" onsubmit="event.preventDefault();" style="display:flex; flex-direction:column; gap:16px;">
          <!-- 統一編號 -->
          <div class="form-field-group">
            <label>統一編號 <span class="form-req">*</span></label>
            <input type="text" class="v-input" id="vCompIdn" value="${data.idn || ''}" placeholder="例如：16541333" maxlength="10" ${isEdit ? 'readonly style="background:#f1f5f9; color:#64748b; font-weight:600; cursor:not-allowed;"' : ''} required>
          </div>

          <!-- 廠商名稱 -->
          <div class="form-field-group">
            <label>廠商/事業單位名稱 <span class="form-req">*</span></label>
            <input type="text" class="v-input" id="vCompName" value="${data.name || ''}" placeholder="例如：台灣營造股份有限公司" required>
          </div>

          <!-- 負責人 -->
          <div class="form-field-group">
            <label>負責人姓名 <span class="form-req">*</span></label>
            <input type="text" class="v-input" id="vCompCharge" value="${data.chargeName || ''}" placeholder="例如：李建國" required>
          </div>

          <!-- 聯絡人 -->
          <div class="form-field-group">
            <label>聯絡人姓名 <span class="form-req">*</span></label>
            <input type="text" class="v-input" id="vCompContact" value="${data.contactName || ''}" placeholder="例如：陳小華" required>
          </div>

          <!-- 連絡電話 -->
          <div class="form-field-group">
            <label>電話號碼 <span class="form-req">*</span></label>
            <input type="text" class="v-input" id="vCompTel" value="${data.contactTel || ''}" placeholder="例如：02-23881234" required>
          </div>

          <!-- 工廠登記證號碼 -->
          <div class="form-field-group">
            <label>工廠登記證號碼</label>
            <input type="text" class="v-input" id="vCompFacNo" value="${data.facNo || ''}" placeholder="例如：64-123456-01 (無則免填)">
          </div>

          <!-- 行業類別 -->
          <div class="form-field-group">
            <label>行業類別</label>
            <input type="text" class="v-input" id="vCompCategory" value="${data.facCategory || ''}" placeholder="請輸入行業類別，無則免填">
          </div>

          <!-- 勞工人數 -->
          <div class="form-field-group">
            <label>勞工人數 <span class="form-req">*</span></label>
            <select class="v-select" id="vCompLabor" required style="width:100%;">
              <option value="1" ${data.laborNumber === '1' ? 'selected' : ''}>1 ~ 29 人</option>
              <option value="2" ${data.laborNumber === '2' ? 'selected' : ''}>30 ~ 99 人</option>
              <option value="3" ${data.laborNumber === '3' ? 'selected' : ''}>100 ~ 299 人</option>
              <option value="4" ${data.laborNumber === '4' ? 'selected' : ''}>300 人以上</option>
            </select>
          </div>

          <!-- 縣市 -->
          <div class="form-field-group">
            <label>所在縣市 <span class="form-req">*</span></label>
            <select class="v-select" id="vCompCounty" required style="width:100%;">
              <option value="台北市" ${data.county === '台北市' ? 'selected' : ''}>台北市</option>
              <option value="新北市" ${data.county === '新北市' ? 'selected' : ''}>新北市</option>
              <option value="桃園市" ${data.county === '桃園市' ? 'selected' : ''}>桃園市</option>
              <option value="台中市" ${data.county === '台中市' ? 'selected' : ''}>台中市</option>
              <option value="台南市" ${data.county === '台南市' ? 'selected' : ''}>台南市</option>
              <option value="高雄市" ${data.county === '高雄市' ? 'selected' : ''}>高雄市</option>
              <option value="新竹市" ${data.county === '新竹市' ? 'selected' : ''}>新竹市</option>
              <option value="基隆市" ${data.county === '基隆市' ? 'selected' : ''}>基隆市</option>
            </select>
          </div>

          <!-- 鄉鎮市區 -->
          <div class="form-field-group">
            <label>鄉鎮市區 <span class="form-req">*</span></label>
            <input type="text" class="v-input" id="vCompTownship" value="${data.township || '中正區'}" placeholder="例如：中正區" required>
          </div>

          <!-- 詳細地址 -->
          <div class="form-field-group">
            <label>詳細地址 <span class="form-req">*</span></label>
            <input type="text" class="v-input" id="vCompAddress" value="${data.address || ''}" placeholder="請輸入街道、門牌、樓層，例如：重慶南路一段 100 號 8 樓" required>
          </div>

          <!-- 狀態 -->
          <div class="form-field-group">
            <label>廠商狀態</label>
            <select class="v-select" id="vCompStatus" style="width:100%;">
              <option value="Y" ${data.status !== 'N' ? 'selected' : ''}>啟用</option>
              <option value="N" ${data.status === 'N' ? 'selected' : ''}>停歇業</option>
            </select>
          </div>
        </form>
      `;

      openVDialog({
        title: title,
        titleMsg: titleMsg,
        maxWidth: '860px',
        bodyHtml: bodyHtml,
        submitText: isEdit ? '儲存變更' : '確定新增',
        onSubmit: () => {
          const idn = document.getElementById('vCompIdn').value.trim();
          const name = document.getElementById('vCompName').value.trim();
          const tel = document.getElementById('vCompTel').value.trim();
          if (!idn || !name || !tel) {
            alert('請填寫統一編號、廠商名稱及聯絡電話！');
            return;
          }
          alert(`【${title}】成功！廠商：${name} (${idn})`);
          closeVDialog();
        }
      });
    }

    /**
     * 帳號維護彈窗 (參考 Java MemberAccount.java & FormMemberAccount & Vue AddMember.vue)
     * 欄位：account, name, email, password, confirmPwd, contactTel, contactAddress, groupId, roleList, status
     */
    function openMemberAccountDialog(mode, data = {}) {
      const isEdit = mode === 'edit';
      const title = isEdit ? '編輯帳號資料' : '新增系統帳號';
      const titleMsg = isEdit ? `※ 帳號：${data.account || 'admin'} (登入帳號鎖定不可改)` : '※ 請指派帳號、姓名、Email、所屬群組與角色權限';

      const currentRoles = data.roles || ['ROLE_SUPER_ADMIN'];

      const bodyHtml = `
        <form id="vMemberForm" onsubmit="event.preventDefault();" style="display:flex; flex-direction:column; gap:16px;">
          <!-- 帳號 & 姓名 -->
          <div style="display:flex; flex-direction:column; gap:14px;">
            <div class="form-field-group">
              <label>登入帳號 <span class="form-req">*</span></label>
              <input type="text" class="search-input" id="vMemAccount" value="${data.account || ''}" placeholder="例如：john_doe 或 Email" ${isEdit ? 'readonly style="background:#f1f5f9; color:#64748b; font-weight:600; cursor:not-allowed;"' : ''} required>
            </div>
            <div class="form-field-group">
              <label>使用者姓名 <span class="form-req">*</span></label>
              <input type="text" class="search-input" id="vMemName" value="${data.name || ''}" placeholder="例如：王大明" required>
            </div>
          </div>

          <!-- 電子信箱 & 聯絡電話 -->
          <div style="display:flex; flex-direction:column; gap:14px;">
            <div class="form-field-group">
              <label>電子信箱 <span class="form-req">*</span></label>
              <input type="email" class="search-input" id="vMemEmail" value="${data.email || ''}" placeholder="user@osha.gov.tw" required>
            </div>
            <div class="form-field-group">
              <label>聯絡電話 / 手機 <span class="form-req">*</span></label>
              <input type="tel" class="search-input" id="vMemTel" value="${data.contactTel || ''}" placeholder="例如：0912-345678" required>
            </div>
          </div>

          <!-- 密碼 & 確認密碼 -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div class="form-field-group">
              <label>${isEdit ? '變更密碼 (若不變更請留空)' : '登入密碼 <span class="form-req">*</span>'}</label>
              <input type="password" class="search-input" id="vMemPwd" placeholder="${isEdit ? '留空表示維持原密碼' : '請輸入 8 碼以上英數組合'}" ${isEdit ? '' : 'required'}>
            </div>
            <div class="form-field-group">
              <label>${isEdit ? '確認新密碼' : '密碼確認 <span class="form-req">*</span>'}</label>
              <input type="password" class="search-input" id="vMemConfirmPwd" placeholder="請再次輸入密碼" ${isEdit ? '' : 'required'}>
            </div>
          </div>

          <!-- 所屬群組 -->
          <div class="form-field-group">
            <label>所屬群組 <span class="form-req">*</span></label>
            <select class="search-input" id="vMemGroup" required>
              <option value="ADMIN_GRP" ${data.groupId === 'ADMIN_GRP' || data.groupName?.includes('最高') ? 'selected' : ''}>系統最高管理群組</option>
              <option value="INSPECT_GRP" ${data.groupId === 'INSPECT_GRP' || data.groupName?.includes('勞檢') ? 'selected' : ''}>勞檢機構審查群組</option>
              <option value="BIZ_GRP" ${data.groupId === 'BIZ_GRP' || data.groupName?.includes('通報') ? 'selected' : ''}>事業單位通報群組</option>
            </select>
          </div>

          <!-- 角色指派 (可複選) -->
          <div class="form-field-group">
            <label>角色授權清單 (可複選)：</label>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:12px; display:flex; flex-direction:column; gap:8px;">
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <input type="checkbox" id="role_admin" value="ROLE_SUPER_ADMIN" ${currentRoles.includes('ROLE_SUPER_ADMIN') ? 'checked' : ''}>
                <span><strong>系統最高管理人員</strong> - 具備系統維運、權限與日誌最高權限</span>
              </label>
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <input type="checkbox" id="role_inspector" value="ROLE_INSPECTOR" ${currentRoles.includes('ROLE_INSPECTOR') ? 'checked' : ''}>
                <span><strong>勞檢機構審查人員</strong> - 具備轄區通報案件閱讀、備查與查詢權限</span>
              </label>
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <input type="checkbox" id="role_notifier" value="ROLE_COMPANY_USER" ${currentRoles.includes('ROLE_COMPANY_USER') ? 'checked' : ''}>
                <span><strong>事業單位通報人員</strong> - 具備危險作業通報與一定規模作業申報權限</span>
              </label>
            </div>
          </div>

          <!-- 通訊地址 -->
          <div class="form-field-group">
            <label>通訊地址</label>
            <input type="text" class="search-input" id="vMemAddress" value="${data.contactAddress || ''}" placeholder="例如：台北市中正區重慶南路一段 100 號 8 樓">
          </div>

          <!-- 帳號狀態 -->
          <div class="form-field-group">
            <label>帳號狀態</label>
            <select class="search-input" id="vMemStatus">
              <option value="Y" ${data.status === 'Y' || !data.status ? 'selected' : ''}>啟用</option>
              <option value="N" ${data.status === 'N' ? 'selected' : ''}>停用</option>
              <option value="L" ${data.status === 'L' ? 'selected' : ''}>鎖定</option>
              <option value="D" ${data.status === 'D' ? 'selected' : ''}>註銷</option>
            </select>
          </div>
        </form>
      `;

      openVDialog({
        title: title,
        titleMsg: titleMsg,
        maxWidth: '780px',
        bodyHtml: bodyHtml,
        submitText: isEdit ? '儲存帳號變更' : '確定建立帳號',
        onSubmit: () => {
          const account = document.getElementById('vMemAccount').value.trim();
          const name = document.getElementById('vMemName').value.trim();
          const email = document.getElementById('vMemEmail').value.trim();
          const pwd = document.getElementById('vMemPwd').value;
          const confirmPwd = document.getElementById('vMemConfirmPwd').value;

          if (!account || !name || !email) {
            alert('請填寫帳號、姓名與電子信箱！');
            return;
          }
          if (!isEdit && !pwd) {
            alert('新增帳號請輸入密碼！');
            return;
          }
          if (pwd && pwd !== confirmPwd) {
            alert('兩次輸入的密碼不一致，請重新確認！');
            return;
          }
          alert(`【${title}】成功！帳號：${account} (${name})`);
          closeVDialog();
        }
      });
    }

    // 掛載至全域
    window.openCompanyDialog = openCompanyDialog;
    window.openMemberAccountDialog = openMemberAccountDialog;


    function openMsgTemplateDialog(mode, data) {
      const isEdit = mode === 'edit';
      const item = data || { name: '', subject: '', code: '', type: 'EML', desc: '', content: '' };
      const title = isEdit ? '修改訊息範本' : '新增訊息範本';

      const bodyHtml = `
        <div class="form-grid">
          <div class="form-field-group">
            <label>名稱 <span class="form-req">*</span></label>
            <input type="text" class="v-input" id="dialogMsgName" value="${item.name || ''}" placeholder="請輸入範本名稱" required>
          </div>
          <div class="form-field-group">
            <label>標題 <span class="form-req">*</span></label>
            <input type="text" class="v-input" id="dialogMsgSubject" value="${item.subject || ''}" placeholder="請輸入訊息主旨" required>
          </div>
          <div class="form-field-group">
            <label>代碼 <span class="form-req">*</span></label>
            <input type="text" class="v-input" id="dialogMsgCode" value="${item.code || ''}" placeholder="例如：PWD_RESET_NOTIFY" required>
          </div>
          <div class="form-field-group">
            <label>訊息類型 <span class="form-req">*</span></label>
            <select class="v-select" id="dialogMsgType">
              <option value="EML" ${item.type === 'EML' ? 'selected' : ''}>Email (電子郵件)</option>
              <option value="SYS" ${item.type === 'SYS' ? 'selected' : ''}>系統訊息 (站內通知)</option>
              <option value="SMS" ${item.type === 'SMS' ? 'selected' : ''}>簡訊 (行動簡訊)</option>
            </select>
          </div>
          <div class="form-field-group form-col-full">
            <label>說明</label>
            <input type="text" class="v-input" id="dialogMsgDesc" value="${item.desc || ''}" placeholder="請輸入訊息範本說明">
          </div>
          <div class="form-field-group form-col-full">
            <label>內容 <span class="form-req">*</span></label>
            <textarea class="v-input" id="dialogMsgContent" style="height:140px; resize:vertical;" placeholder="請輸入範本內文，支援參數變數代換">${item.content || ''}</textarea>
          </div>
        </div>
      `;

      openVDialog({
        title: title,
        maxWidth: '700px',
        bodyHtml: bodyHtml,
        onSubmit: () => {
          const name = document.getElementById('dialogMsgName').value.trim();
          const code = document.getElementById('dialogMsgCode').value.trim();
          if (!name || !code) {
            alert('請填寫必填欄位！');
            return;
          }
          alert(`【${title}】儲存成功！\n範本名稱：${name}\n範本代碼：${code}`);
          closeVDialog();
        }
      });
    }

    /* ---------------------------------------------------------
     * 2. 系統代碼維護 (AddSystemCode / EditSystemCode)
     * --------------------------------------------------------- */
    let currentCodeLevel = 1;
    function enterSubCodeLevel(parentName, level) {
      currentCodeLevel = level;
      alert(`進入【${parentName}】第 ${level} 層子代碼清單`);
      const subtitle = document.querySelector('.button-group-row h3');
      if (subtitle) {
        subtitle.textContent = `＜ 第 ${level} 層 - ${parentName} ＞`;
      }
    }

    function openSysCodeDialog(mode, data) {
      const isEdit = mode === 'edit';
      const item = data || { name: '', code: '', detail: '', status: 'Y' };
      const title = isEdit ? '修改參數' : '新增參數';
      const levelText = `第 ${currentCodeLevel} 層：`;

      const bodyHtml = `
        <div style="margin-bottom:14px; font-size:16px; font-weight:700; color:#1d4ed8;">${levelText}</div>
        <div class="form-grid">
          <div class="form-field-group">
            <label>參數名稱 <span class="form-req">*</span></label>
            <input type="text" class="v-input" id="dialogCodeName" value="${item.name || ''}" placeholder="請輸入參數名稱" required>
          </div>
          <div class="form-field-group">
            <label>參數代碼 ${isEdit ? '<span style="font-size: 12px; color:#ef4444;">(不可修改)</span>' : '<span class="form-req">*</span>'}</label>
            <input type="text" class="v-input" id="dialogCodeCode" value="${item.code || ''}" placeholder="例如：HAZARD_TYPE" ${isEdit ? 'readonly style="background:#f1f5f9; cursor:not-allowed;"' : 'required'}>
          </div>
          <div class="form-field-group form-col-full">
            <label>說明</label>
            <input type="text" class="v-input" id="dialogCodeDetail" value="${item.detail || ''}" placeholder="請輸入參數詳細用途說明">
          </div>
          <div class="form-field-group form-col-full">
            <label>狀態：</label>
            <div style="display:flex; gap:20px; align-items:center; padding-top:4px;">
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                <input type="radio" name="dialogCodeStatus" value="Y" ${item.status === 'Y' ? 'checked' : ''}> 是 (啟用)
              </label>
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                <input type="radio" name="dialogCodeStatus" value="N" ${item.status === 'N' ? 'checked' : ''}> 否 (停用)
              </label>
            </div>
          </div>
        </div>
      `;

      openVDialog({
        title: title,
        maxWidth: '650px',
        bodyHtml: bodyHtml,
        onSubmit: () => {
          const name = document.getElementById('dialogCodeName').value.trim();
          if (!name) {
            alert('請填寫參數名稱！');
            return;
          }
          alert(`【${title}】儲存成功！\n名稱：${name}`);
          closeVDialog();
        }
      });
    }

    /* ---------------------------------------------------------
     * 3. 群組維護 (AddSystemGroup / EditSystemGroup / EditGroupPermission / EditGroupMember)
     * --------------------------------------------------------- */
    function openGroupDialog(mode, data) {
      const isEdit = mode === 'edit';
      const item = data || { groupName: '', code: '', description: '', status: 'Y' };
      const title = isEdit ? '修改群組' : '新增群組';

      const bodyHtml = `
        <div class="form-grid">
          <div class="form-field-group">
            <label>群組名稱 <span class="form-req">*</span></label>
            <input type="text" class="v-input" id="dialogGroupName" value="${item.groupName || ''}" placeholder="請輸入群組名稱" required>
          </div>
          <div class="form-field-group">
            <label>代碼</label>
            <input type="text" class="v-input" id="dialogGroupCode" value="${item.code || ''}" placeholder="例如：INSPECT_GRP">
          </div>
          <div class="form-field-group form-col-full">
            <label>說明</label>
            <input type="text" class="v-input" id="dialogGroupDesc" value="${item.description || ''}" placeholder="請輸入群組職掌說明">
          </div>
          <div class="form-field-group form-col-full">
            <label>狀態：</label>
            <div style="display:flex; gap:20px; align-items:center; padding-top:4px;">
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                <input type="radio" name="dialogGroupStatus" value="Y" ${item.status === 'Y' ? 'checked' : ''}> 啟用
              </label>
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                <input type="radio" name="dialogGroupStatus" value="N" ${item.status === 'N' ? 'checked' : ''}> 停用
              </label>
            </div>
          </div>
        </div>
      `;

      openVDialog({
        title: title,
        maxWidth: '620px',
        bodyHtml: bodyHtml,
        onSubmit: () => {
          const name = document.getElementById('dialogGroupName').value.trim();
          if (!name) {
            alert('群組名稱為必填！');
            return;
          }
          alert(`【${title}】儲存成功！\n群組：${name}`);
          closeVDialog();
        }
      });
    }

    function openGroupPermissionDialog(groupName) {
      const bodyHtml = `
        <h2 style="font-size:17px; color:#0f172a; margin-bottom:14px;">${groupName}</h2>
        <div class="checktree-container">
          <div class="checktree-node">
            <div class="checktree-node-title">
              <input type="checkbox" checked id="permTreeGrp1">
              📁 危險作業通報管理
            </div>
            <div class="checktree-children">
              <label class="checktree-child-item"><input type="checkbox" checked> 通報案件查詢 (CASE_QUERY)</label>
              <label class="checktree-child-item"><input type="checkbox" checked> 案件閱讀與備查 (CASE_AUDIT)</label>
              <label class="checktree-child-item"><input type="checkbox" checked> 批次標記已閱讀 (CASE_BATCH_AUDIT)</label>
            </div>
          </div>
          <div class="checktree-node">
            <div class="checktree-node-title">
              <input type="checkbox" checked id="permTreeGrp2">
              📁 基本資料維護
            </div>
            <div class="checktree-children">
              <label class="checktree-child-item"><input type="checkbox" checked> 帳號資料維護 (ACCOUNT_MAINTAIN)</label>
              <label class="checktree-child-item"><input type="checkbox" checked> 廠商資料維護 (VENDOR_MAINTAIN)</label>
            </div>
          </div>
          <div class="checktree-node">
            <div class="checktree-node-title">
              <input type="checkbox" checked id="permTreeGrp3">
              📁 系統管理
            </div>
            <div class="checktree-children">
              <label class="checktree-child-item"><input type="checkbox" checked> 模組/功能維護 (SYS_FUNC)</label>
              <label class="checktree-child-item"><input type="checkbox" checked> 角色權限維護 (SYS_ROLE)</label>
              <label class="checktree-child-item"><input type="checkbox" checked> 系統參數代碼維護 (SYS_CODE)</label>
              <label class="checktree-child-item"><input type="checkbox" checked> 系統 Log 紀錄查閱 (SYS_LOG)</label>
            </div>
          </div>
        </div>
      `;

      openVDialog({
        title: '編修群組權限',
        maxWidth: '680px',
        bodyHtml: bodyHtml,
        onSubmit: () => {
          alert(`群組【${groupName}】權限設定已成功儲存！`);
          closeVDialog();
        }
      });
    }

    function openGroupMemberDialog(groupName) {
      const bodyHtml = `
        <div style="font-size:15px; font-weight:700; color:#0f172a; margin-bottom:12px;">群組：${groupName}</div>
        <div style="display:flex; border-bottom:2px solid #0288d1; margin-bottom:14px; gap:8px;">
          <button style="background:#0288d1; color:#fff; border:none; padding:8px 18px; font-size: 13px; font-weight:700; border-radius:4px 4px 0 0; cursor:pointer;">新增人員</button>
          <button style="background:#f1f5f9; color:#475569; border:none; padding:8px 18px; font-size: 13px; font-weight:600; border-radius:4px 4px 0 0; cursor:pointer;" onclick="alert('切換至刪除人員頁籤')">刪除人員</button>
        </div>
        <div style="background:#f1f5f9; padding:14px; border-radius:6px; margin-bottom:14px;">
          <div style="font-size: 15px; font-weight:700; color:#334155; margin-bottom:8px;">準加入清單：</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <span style="background:#e0f2fe; color:#0369a1; padding:4px 12px; border-radius:12px; font-size: 13.5px; font-weight:600;">林督察員 (inspector@osha.gov.tw) ✕</span>
            <span style="background:#e0f2fe; color:#0369a1; padding:4px 12px; border-radius:12px; font-size: 13.5px; font-weight:600;">王大明 (company_user@osha.gov.tw) ✕</span>
          </div>
        </div>
        <div class="search-filter-card" style="padding:12px 16px; margin-bottom:14px;">
          <div class="search-filter-fields" style="justify-content:center;">
            <div class="search-filter-item">
              <span class="label">帳號關鍵字：</span>
              <input type="text" class="v-input" placeholder="請輸入帳號" style="font-size: 15px; width:170px;">
            </div>
            <div class="search-filter-item">
              <span class="label">姓名關鍵字：</span>
              <input type="text" class="v-input" placeholder="請輸入姓名" style="font-size: 15px; width:170px;">
            </div>
          </div>
          <div class="search-filter-actions" style="margin-top:10px; padding-top:10px;">
            <button type="button" class="btn-search" style="padding:6px 22px; font-size: 15px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              搜尋
            </button>
            <button type="button" class="btn-reset" style="padding:6px 18px; font-size: 15px;" onclick="alert('已重設條件')">重設</button>
          </div>
        </div>
        <div class="v-table-wrap">
          <table class="v-table">
            <thead>
              <tr>
                <th style="width:40px;"><input type="checkbox" checked style="width:16px; height:16px;"></th>
                <th>帳號</th>
                <th>姓名</th>
                <th>目前群組</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><input type="checkbox" checked style="width:16px; height:16px;"></td>
                <td>inspector@osha.gov.tw</td>
                <td>林督察員</td>
                <td>勞動檢查審查群組</td>
              </tr>
              <tr>
                <td><input type="checkbox" checked style="width:16px; height:16px;"></td>
                <td>company_user@osha.gov.tw</td>
                <td>王大明</td>
                <td>事業單位申報群組</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;

      openVDialog({
        title: '群組人員成員維護',
        maxWidth: '750px',
        bodyHtml: bodyHtml,
        onSubmit: () => {
          alert('群組成員變更已成功儲存！');
          closeVDialog();
        }
      });
    }

    /* ---------------------------------------------------------
     * 角色人員成員維護對話框 (openRoleMemberDialog)
     * --------------------------------------------------------- */
    function openRoleMemberDialog(roleName) {
      const defaultUsers = roleName.includes('勞檢') ? [
        { acc: 'inspector@osha.gov.tw', name: '林督察員', org: '中區職業安全衛生中心' },
        { acc: 'chen_inspector@osha.gov.tw', name: '陳稽核員', org: '北區職業安全衛生中心' }
      ] : roleName.includes('事業') ? [
        { acc: 'company_user@osha.gov.tw', name: '王大明', org: '台灣營造工程股份有限公司' },
        { acc: 'lee_safety@osha.gov.tw', name: '李專責', org: '宏達重工實業股份有限公司' }
      ] : [
        { acc: 'admin@osha.gov.tw', name: '系統管理者', org: '職業安全衛生署' },
        { acc: 'super_admin@osha.gov.tw', name: '平台運維主管', org: '系統管理處' }
      ];

      const bodyHtml = `
        <div style="font-size:15px; font-weight:700; color:#0f172a; margin-bottom:12px;">角色：<span style="color:#0288d1;">${roleName}</span></div>
        <div style="display:flex; border-bottom:2px solid #0288d1; margin-bottom:14px; gap:8px;">
          <button style="background:#0288d1; color:#fff; border:none; padding:8px 18px; font-size: 13px; font-weight:700; border-radius:4px 4px 0 0; cursor:pointer;">新增人員</button>
          <button style="background:#f1f5f9; color:#475569; border:none; padding:8px 18px; font-size: 13px; font-weight:600; border-radius:4px 4px 0 0; cursor:pointer;" onclick="alert('切換至移除人員清單')">移除人員</button>
        </div>
        <div style="background:#f1f5f9; padding:14px; border-radius:6px; margin-bottom:14px;">
          <div style="font-size: 15px; font-weight:700; color:#334155; margin-bottom:8px;">已指派成員：</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${defaultUsers.map(u => `<span style="background:#e0f2fe; color:#0369a1; padding:4px 12px; border-radius:12px; font-size: 13.5px; font-weight:600;">${u.name} (${u.acc}) ✕</span>`).join('')}
          </div>
        </div>
        <div class="search-filter-card" style="padding:12px 16px; margin-bottom:14px;">
          <div class="search-filter-fields" style="justify-content:center;">
            <div class="search-filter-item">
              <span class="label">帳號關鍵字：</span>
              <input type="text" class="v-input" placeholder="請輸入帳號" style="font-size: 15px; width:170px;">
            </div>
            <div class="search-filter-item">
              <span class="label">姓名關鍵字：</span>
              <input type="text" class="v-input" placeholder="請輸入姓名" style="font-size: 15px; width:170px;">
            </div>
          </div>
          <div class="search-filter-actions" style="margin-top:10px; padding-top:10px;">
            <button type="button" class="btn-search" style="padding:6px 22px; font-size: 15px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              搜尋
            </button>
            <button type="button" class="btn-reset" style="padding:6px 18px; font-size: 15px;" onclick="alert('已重設條件')">重設</button>
          </div>
        </div>
        <div class="v-table-wrap">
          <table class="v-table">
            <thead>
              <tr>
                <th style="width:40px;"><input type="checkbox" checked style="width:16px; height:16px;"></th>
                <th>帳號</th>
                <th>姓名</th>
                <th>所屬單位 / 機構</th>
              </tr>
            </thead>
            <tbody>
              ${defaultUsers.map(u => `
                <tr>
                  <td><input type="checkbox" checked style="width:16px; height:16px;"></td>
                  <td>${u.acc}</td>
                  <td>${u.name}</td>
                  <td>${u.org}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      openVDialog({
        title: '角色人員成員維護',
        maxWidth: '750px',
        bodyHtml: bodyHtml,
        onSubmit: () => {
          alert(`角色【${roleName}】成員變更已成功儲存！`);
          closeVDialog();
        }
      });
    }

    /* ---------------------------------------------------------
     * 4. 角色維護 (AddSystemRole / EditSystemRole / EditRolePermission)
     * --------------------------------------------------------- */
    function openRoleDialog(mode, data) {
      const isEdit = mode === 'edit';
      const item = data || { roleName: '', code: '', description: '' };
      const title = isEdit ? '修改角色' : '新增角色';

      const bodyHtml = `
        <div class="form-grid">
          <div class="form-field-group">
            <label>角色名稱 <span class="form-req">*</span></label>
            <input type="text" class="v-input" id="dialogRoleName" value="${item.roleName || ''}" placeholder="請輸入角色名稱" required>
          </div>
          <div class="form-field-group">
            <label>代碼</label>
            <input type="text" class="v-input" id="dialogRoleCode" value="${item.code || ''}" placeholder="例如：ROLE_SUPER_ADMIN">
          </div>
          <div class="form-field-group form-col-full">
            <label>說明</label>
            <input type="text" class="v-input" id="dialogRoleDesc" value="${item.description || ''}" placeholder="請輸入角色職能說明">
          </div>
        </div>
      `;

      openVDialog({
        title: title,
        maxWidth: '680px',
        bodyHtml: bodyHtml,
        onSubmit: () => {
          const name = document.getElementById('dialogRoleName').value.trim();
          if (!name) {
            alert('角色名稱為必填！');
            return;
          }
          alert(`【${title}】儲存成功！\n角色：${name}`);
          closeVDialog();
        }
      });
    }

    /* ---------------------------------------------------------
     * 角色 API 功能權限資料庫結構與預設權限定義 (Role API Permission Data)
     * --------------------------------------------------------- */
    const ROLE_API_PERM_MODULES = [
      {
        moduleId: 'CASE_REPORT',
        moduleName: '危險作業通報管理',
        icon: '📁',
        functions: [
          { id: 'CASE_DANGEROUS', name: '丁類危險性作業通報', endpoint: '/api/v1/cases/dangerous', crud: { c: true, r: true, u: true, d: true }, na: {} },
          { id: 'CASE_CONSTRUCT', name: '營造工程通報精靈', endpoint: '/api/v1/cases/construction', crud: { c: true, r: true, u: true, d: true }, na: {} },
          { id: 'CASE_SEARCH', name: '通報案件查詢與統計', endpoint: '/api/v1/cases/search', crud: { c: false, r: true, u: false, d: false }, na: { c: true, u: true, d: true } },
          { id: 'CASE_AUDIT', name: '案件閱讀與備查', endpoint: '/api/v1/cases/{id}/audit', crud: { c: false, r: true, u: true, d: false }, na: { c: true, d: true } },
          { id: 'CASE_DISPATCH', name: '指派檢查員與會勘', endpoint: '/api/v1/cases/{id}/dispatch', crud: { c: true, r: true, u: true, d: false }, na: { d: true } }
        ]
      },
      {
        moduleId: 'WORKPLACE_LOCAL',
        moduleName: '危評與地方自訂項目',
        icon: '🏗️',
        functions: [
          { id: 'WORKPLACE_MAINTAIN', name: '工作場所基本資料維護', endpoint: '/api/v1/workplaces', crud: { c: true, r: true, u: true, d: true }, na: {} },
          { id: 'LOCAL_CUSTOM_ITEM', name: '地方主管機關自訂項目', endpoint: '/api/v1/local/items', crud: { c: true, r: true, u: true, d: true }, na: {} }
        ]
      },
      {
        moduleId: 'SYS_BASIC',
        moduleName: '帳號與組織廠商維護',
        icon: '👥',
        functions: [
          { id: 'ACCOUNT_MAINTAIN', name: '系統使用者帳號管理', endpoint: '/api/v1/admin/users', crud: { c: true, r: true, u: true, d: true }, na: {} },
          { id: 'VENDOR_MAINTAIN', name: '通報事業單位與承攬商', endpoint: '/api/v1/admin/vendors', crud: { c: true, r: true, u: true, d: true }, na: {} },
          { id: 'GROUP_MAINTAIN', name: '群組與人員成員調配', endpoint: '/api/v1/admin/groups', crud: { c: true, r: true, u: true, d: true }, na: {} }
        ]
      },
      {
        moduleId: 'SYS_ADMIN',
        moduleName: '系統管理與維運監控',
        icon: '⚙️',
        functions: [
          { id: 'ROLE_MAINTAIN', name: '角色定義與 API 權限矩陣', endpoint: '/api/v1/admin/roles', crud: { c: true, r: true, u: true, d: true }, na: {} },
          { id: 'SYS_CODE_PARAM', name: '系統代碼與全域參數', endpoint: '/api/v1/admin/params', crud: { c: true, r: true, u: true, d: false }, na: { d: true } },
          { id: 'NOTIFY_TEMPLATE', name: '通知訊息範本 (Email/SMS)', endpoint: '/api/v1/admin/templates', crud: { c: true, r: true, u: true, d: true }, na: {} },
          { id: 'SYS_AUDIT_LOG', name: '系統稽核 Log 紀錄', endpoint: '/api/v1/admin/logs', crud: { c: false, r: true, u: false, d: false }, na: { c: true, u: true, d: true } }
        ]
      }
    ];

    // 全域當前編輯之角色權限狀態快照
    let currentRolePermState = {};

    function getInitialRolePerm(roleName) {
      const state = {};
      const isSuperAdmin = roleName.includes('最高管理');
      const isInspector = roleName.includes('勞檢');
      const isCompany = roleName.includes('事業單位');

      ROLE_API_PERM_MODULES.forEach(mod => {
        mod.functions.forEach(fn => {
          if (isSuperAdmin) {
            state[fn.id] = {
              c: !fn.na.c,
              r: !fn.na.r,
              u: !fn.na.u,
              d: !fn.na.d
            };
          } else if (isInspector) {
            // 勞檢：通報審查、指派、工作場所查閱、地方項目維護、帳號查詢、Log查詢
            state[fn.id] = {
              c: (fn.id === 'CASE_DISPATCH' || fn.id === 'LOCAL_CUSTOM_ITEM') && !fn.na.c,
              r: true,
              u: (fn.id === 'CASE_AUDIT' || fn.id === 'CASE_DISPATCH' || fn.id === 'LOCAL_CUSTOM_ITEM') && !fn.na.u,
              d: false
            };
          } else if (isCompany) {
            // 廠商：只能新增通報、查詢自己案件、維護場域
            const canC = (fn.id === 'CASE_DANGEROUS' || fn.id === 'CASE_CONSTRUCT' || fn.id === 'WORKPLACE_MAINTAIN');
            const canU = (fn.id === 'CASE_DANGEROUS' || fn.id === 'CASE_CONSTRUCT' || fn.id === 'WORKPLACE_MAINTAIN');
            state[fn.id] = {
              c: canC && !fn.na.c,
              r: (fn.id.startsWith('CASE_') || fn.id === 'WORKPLACE_MAINTAIN' || fn.id === 'VENDOR_MAINTAIN'),
              u: canU && !fn.na.u,
              d: (fn.id === 'CASE_DANGEROUS') && !fn.na.d
            };
          } else {
            // 預設唯讀
            state[fn.id] = { c: false, r: true, u: false, d: false };
          }
        });
      });
      return state;
    }

    function openRolePermissionDialog(roleName) {
      currentRolePermState = getInitialRolePerm(roleName);

      const renderMatrixRows = (keyword = '') => {
        const kw = keyword.trim().toLowerCase();
        let rowsHtml = '';

        ROLE_API_PERM_MODULES.forEach(mod => {
          // 篩選子功能
          const filteredFuncs = mod.functions.filter(f => 
            !kw || f.name.toLowerCase().includes(kw) || f.endpoint.toLowerCase().includes(kw) || mod.moduleName.toLowerCase().includes(kw)
          );

          if (filteredFuncs.length === 0) return;

          // 計算模組全選狀態
          const totalOps = filteredFuncs.reduce((acc, f) => {
            let active = 0; let possible = 0;
            const p = currentRolePermState[f.id] || { c:false, r:false, u:false, d:false };
            if (!f.na.c) { possible++; if (p.c) active++; }
            if (!f.na.r) { possible++; if (p.r) active++; }
            if (!f.na.u) { possible++; if (p.u) active++; }
            if (!f.na.d) { possible++; if (p.d) active++; }
            return { active: acc.active + active, possible: acc.possible + possible };
          }, { active: 0, possible: 0 });

          const isModAllChecked = totalOps.possible > 0 && totalOps.active === totalOps.possible;
          const isModIndeterminate = totalOps.active > 0 && totalOps.active < totalOps.possible;

          rowsHtml += `
            <tr class="perm-matrix-module-row">
              <td>
                <label class="perm-matrix-module-toggle">
                  <input type="checkbox" class="perm-custom-checkbox" 
                         ${isModAllChecked ? 'checked' : ''} 
                         data-indeterminate="${isModIndeterminate ? 'true' : 'false'}"
                         onchange="toggleModulePerm('${mod.moduleId}', this.checked)">
                  <span style="font-size:15px;">${mod.icon} <strong>${mod.moduleName}</strong></span>
                  <span style="font-size:12px; font-weight:normal; color:#64748b;">(共 ${filteredFuncs.length} 項功能)</span>
                </label>
              </td>
              <td class="center"></td>
              <td class="center"></td>
              <td class="center"></td>
              <td class="center"></td>
              <td class="center">
                <button type="button" class="v-btn" style="padding:3px 8px; font-size:12px; background:#e0f2fe; color:#0369a1; border:none; border-radius:4px; cursor:pointer;" onclick="toggleModulePerm('${mod.moduleId}', true)">全選</button>
                <button type="button" class="v-btn" style="padding:3px 8px; font-size:12px; background:#f1f5f9; color:#475569; border:none; border-radius:4px; cursor:pointer;" onclick="toggleModulePerm('${mod.moduleId}', false)">清空</button>
              </td>
            </tr>
          `;

          filteredFuncs.forEach(fn => {
            const p = currentRolePermState[fn.id] || { c:false, r:false, u:false, d:false };
            const rowPossible = (!fn.na.c ? 1 : 0) + (!fn.na.r ? 1 : 0) + (!fn.na.u ? 1 : 0) + (!fn.na.d ? 1 : 0);
            const rowActive = (p.c ? 1 : 0) + (p.r ? 1 : 0) + (p.u ? 1 : 0) + (p.d ? 1 : 0);
            const isRowAll = rowPossible > 0 && rowActive === rowPossible;

            rowsHtml += `
              <tr class="perm-matrix-func-row" id="row_perm_${fn.id}">
                <td>
                  <div class="perm-func-info">
                    <span class="perm-func-title">${fn.name}</span>
                    <span class="perm-func-endpoint"><code>${fn.endpoint}</code></span>
                  </div>
                </td>
                <td class="center" style="width:110px;">
                  ${fn.na.c ? '<span class="perm-na-text">N/A</span>' : `
                    <label style="cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                      <input type="checkbox" class="perm-custom-checkbox" ${p.c ? 'checked' : ''} 
                             onchange="changeSinglePerm('${fn.id}', 'c', this.checked)">
                      <span class="perm-badge-c">POST</span>
                    </label>
                  `}
                </td>
                <td class="center" style="width:110px;">
                  ${fn.na.r ? '<span class="perm-na-text">N/A</span>' : `
                    <label style="cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                      <input type="checkbox" class="perm-custom-checkbox" ${p.r ? 'checked' : ''} 
                             onchange="changeSinglePerm('${fn.id}', 'r', this.checked)">
                      <span class="perm-badge-r">GET</span>
                    </label>
                  `}
                </td>
                <td class="center" style="width:110px;">
                  ${fn.na.u ? '<span class="perm-na-text">N/A</span>' : `
                    <label style="cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                      <input type="checkbox" class="perm-custom-checkbox" ${p.u ? 'checked' : ''} 
                             onchange="changeSinglePerm('${fn.id}', 'u', this.checked)">
                      <span class="perm-badge-u">PUT</span>
                    </label>
                  `}
                </td>
                <td class="center" style="width:110px;">
                  ${fn.na.d ? '<span class="perm-na-text">N/A</span>' : `
                    <label style="cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                      <input type="checkbox" class="perm-custom-checkbox" ${p.d ? 'checked' : ''} 
                             onchange="changeSinglePerm('${fn.id}', 'd', this.checked)">
                      <span class="perm-badge-d">DELETE</span>
                    </label>
                  `}
                </td>
                <td class="center" style="width:110px;">
                  <button type="button" style="background:none; border:none; color:#0288d1; font-size:12.5px; cursor:pointer; font-weight:600;" onclick="toggleRowPerm('${fn.id}', !${isRowAll})">
                    ${isRowAll ? '清空' : '全授權'}
                  </button>
                </td>
              </tr>
            `;
          });
        });

        return rowsHtml || `<tr><td colspan="6" style="text-align:center; padding:30px; color:#94a3b8;">無符合「${keyword}」之 API 功能項目</td></tr>`;
      };

      const bodyHtml = `
        <div class="perm-matrix-container">
          <!-- 頂部資訊與快速操作工具列 -->
          <div class="perm-matrix-header-box">
            <div class="perm-role-info">
              <span class="perm-role-badge">角色</span>
              <span class="perm-role-name">${roleName}</span>
              <span style="font-size:13px; color:#64748b;">(API 端點級細緻授權管控)</span>
            </div>
            <div class="perm-quick-actions">
              <!-- 關鍵字過濾 -->
              <div class="perm-search-box">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" id="permMatrixSearch" placeholder="搜尋功能或 API 端點 (例: /cases)" oninput="filterPermMatrix(this.value)">
              </div>

              <!-- 快捷角色範本套用 -->
              <select class="perm-preset-select" id="permPresetSelect" onchange="applyPermPreset(this.value, '${roleName}')">
                <option value="">⚡ 快速套用權限範本...</option>
                <option value="READ_ONLY">唯讀查詢人員 (只開 R / GET)</option>
                <option value="OPERATOR">一般通報作業員 (開 C + R + U)</option>
                <option value="AUDITOR">審查監督稽核員 (開 R + U 審查)</option>
                <option value="FULL">完整最高授權 (全開 C+R+U+D)</option>
                <option value="CLEAR">全部清空 (無權限)</option>
              </select>
            </div>
          </div>

          <!-- 矩陣主表格 -->
          <div class="perm-matrix-table-wrap">
            <table class="perm-matrix-table">
              <thead>
                <tr>
                  <th style="min-width:280px;">功能模組與 API 資源端點</th>
                  <th class="center" style="width:110px;">
                    <a href="javascript:void(0);" onclick="setColumnPerm('c', true)" style="color:#15803d; text-decoration:none;" title="點擊全選此欄">新增 (C) ▾</a>
                  </th>
                  <th class="center" style="width:110px;">
                    <a href="javascript:void(0);" onclick="setColumnPerm('r', true)" style="color:#0369a1; text-decoration:none;" title="點擊全選此欄">查詢 (R) ▾</a>
                  </th>
                  <th class="center" style="width:110px;">
                    <a href="javascript:void(0);" onclick="setColumnPerm('u', true)" style="color:#b45309; text-decoration:none;" title="點擊全選此欄">修改 (U) ▾</a>
                  </th>
                  <th class="center" style="width:110px;">
                    <a href="javascript:void(0);" onclick="setColumnPerm('d', true)" style="color:#b91c1c; text-decoration:none;" title="點擊全選此欄">刪除 (D) ▾</a>
                  </th>
                  <th class="center" style="width:110px;">功能操作</th>
                </tr>
              </thead>
              <tbody id="permMatrixTbody">
                ${renderMatrixRows()}
              </tbody>
            </table>
          </div>
        </div>
      `;

      // 暴露矩陣互動全域函式
      window.filterPermMatrix = (kw) => {
        const tbody = document.getElementById('permMatrixTbody');
        if (tbody) tbody.innerHTML = renderMatrixRows(kw);
        updateIndeterminateStates();
      };

      window.changeSinglePerm = (funcId, op, checked) => {
        if (!currentRolePermState[funcId]) {
          currentRolePermState[funcId] = { c:false, r:false, u:false, d:false };
        }
        currentRolePermState[funcId][op] = checked;

        // 依賴防呆連動：若勾選了 C, U, D，則強制開啟 R (唯讀權限)；若關閉 R，則連帶關閉 C, U, D
        if (checked && (op === 'c' || op === 'u' || op === 'd')) {
          currentRolePermState[funcId].r = true;
        } else if (!checked && op === 'r') {
          currentRolePermState[funcId].c = false;
          currentRolePermState[funcId].u = false;
          currentRolePermState[funcId].d = false;
        }

        const kw = document.getElementById('permMatrixSearch')?.value || '';
        document.getElementById('permMatrixTbody').innerHTML = renderMatrixRows(kw);
        updateIndeterminateStates();
      };

      window.toggleRowPerm = (funcId, checked) => {
        const fn = ROLE_API_PERM_MODULES.flatMap(m => m.functions).find(f => f.id === funcId);
        if (!fn) return;
        currentRolePermState[funcId] = {
          c: checked && !fn.na.c,
          r: checked && !fn.na.r,
          u: checked && !fn.na.u,
          d: checked && !fn.na.d
        };
        const kw = document.getElementById('permMatrixSearch')?.value || '';
        document.getElementById('permMatrixTbody').innerHTML = renderMatrixRows(kw);
        updateIndeterminateStates();
      };

      window.toggleModulePerm = (moduleId, checked) => {
        const mod = ROLE_API_PERM_MODULES.find(m => m.moduleId === moduleId);
        if (!mod) return;
        mod.functions.forEach(fn => {
          currentRolePermState[fn.id] = {
            c: checked && !fn.na.c,
            r: checked && !fn.na.r,
            u: checked && !fn.na.u,
            d: checked && !fn.na.d
          };
        });
        const kw = document.getElementById('permMatrixSearch')?.value || '';
        document.getElementById('permMatrixTbody').innerHTML = renderMatrixRows(kw);
        updateIndeterminateStates();
      };

      window.setColumnPerm = (col, checked) => {
        ROLE_API_PERM_MODULES.forEach(mod => {
          mod.functions.forEach(fn => {
            if (!currentRolePermState[fn.id]) {
              currentRolePermState[fn.id] = { c:false, r:false, u:false, d:false };
            }
            if (col === 'all') {
              currentRolePermState[fn.id] = {
                c: checked && !fn.na.c,
                r: checked && !fn.na.r,
                u: checked && !fn.na.u,
                d: checked && !fn.na.d
              };
            } else {
              if (!fn.na[col]) {
                currentRolePermState[fn.id][col] = checked;
                if (checked && (col === 'c' || col === 'u' || col === 'd')) {
                  currentRolePermState[fn.id].r = true;
                }
              }
            }
          });
        });
        const kw = document.getElementById('permMatrixSearch')?.value || '';
        document.getElementById('permMatrixTbody').innerHTML = renderMatrixRows(kw);
        updateIndeterminateStates();
      };

      window.applyPermPreset = (presetType, currentRole) => {
        if (!presetType) return;
        ROLE_API_PERM_MODULES.forEach(mod => {
          mod.functions.forEach(fn => {
            if (presetType === 'READ_ONLY') {
              currentRolePermState[fn.id] = { c: false, r: !fn.na.r, u: false, d: false };
            } else if (presetType === 'OPERATOR') {
              currentRolePermState[fn.id] = { c: !fn.na.c, r: !fn.na.r, u: !fn.na.u, d: false };
            } else if (presetType === 'AUDITOR') {
              currentRolePermState[fn.id] = { c: false, r: !fn.na.r, u: (fn.id.includes('AUDIT') || fn.id.includes('DISPATCH')) && !fn.na.u, d: false };
            } else if (presetType === 'FULL') {
              currentRolePermState[fn.id] = { c: !fn.na.c, r: !fn.na.r, u: !fn.na.u, d: !fn.na.d };
            } else if (presetType === 'CLEAR') {
              currentRolePermState[fn.id] = { c: false, r: false, u: false, d: false };
            }
          });
        });
        const kw = document.getElementById('permMatrixSearch')?.value || '';
        document.getElementById('permMatrixTbody').innerHTML = renderMatrixRows(kw);
        updateIndeterminateStates();
        const sel = document.getElementById('permPresetSelect');
        if (sel) sel.value = '';
      };

      const updateIndeterminateStates = () => {
        document.querySelectorAll('input[data-indeterminate="true"]').forEach(el => {
          el.indeterminate = true;
        });
      };

      openVDialog({
        title: `角色 API 功能權限矩陣設定`,
        titleMsg: `[${roleName}]`,
        maxWidth: '960px',
        bodyHtml: bodyHtml,
        submitText: '儲存 API 權限設定',
        onSubmit: () => {
          // 統計當前開放之 API 數量
          let count = 0;
          let totalOps = 0;
          Object.values(currentRolePermState).forEach(p => {
            if (p.c) totalOps++;
            if (p.r) totalOps++;
            if (p.u) totalOps++;
            if (p.d) totalOps++;
            if (p.c || p.r || p.u || p.d) count++;
          });

          alert(`【${roleName}】API 權限矩陣設定已成功儲存！\n\n共授權：${count} 項 API 資源、累計 ${totalOps} 個 CRUD 訪問權限。\n系統已即時同步至後端 API Gateway 權限控制快取。`);
          closeVDialog();
        }
      });

      // 初始化半選狀態
      setTimeout(updateIndeterminateStates, 50);
    }

    /* ---------------------------------------------------------
     * 5. 模組/功能維護 (toAddModule / toAddFunction / toAddSubFunction)
     * --------------------------------------------------------- */
    function toAddSysFunctionNode(funcType) {
      const typeLabel = funcType === 'A' ? '模組' : funcType === 'B' ? '功能' : '子功能';
      const level = funcType === 'A' ? 1 : funcType === 'B' ? 2 : 3;
      const current = window._currentSelectedNode || { sortMod: 3, sortFunc: 1, sortSub: 1 };
      
      const titleEl = document.getElementById('selectedNodeTitle');
      const badgeEl = document.getElementById('selectedNodeTypeBadge');
      const nameInput = document.getElementById('editNodeName');
      const routeInput = document.getElementById('editNodeRoute');
      const apiPathInput = document.getElementById('editNodeApiPath');
      const permInput = document.getElementById('editNodePerm');

      if (titleEl) titleEl.textContent = `新增${typeLabel}`;
      if (badgeEl) {
        badgeEl.textContent = `新增${typeLabel}`;
        badgeEl.style.background = '#dcfce7';
        badgeEl.style.color = '#15803d';
      }
      if (nameInput) nameInput.value = '';
      if (routeInput) routeInput.value = funcType === 'A' ? '' : '/new/route';
      if (apiPathInput) apiPathInput.value = funcType === 'A' ? '' : '/api/v1/new/endpoint';
      if (permInput) permInput.value = `NEW_${funcType}_CODE`;

      // 固定顯示 3 個排序欄位，各層預設值為 0，只能修改同層排序，其他不可修改
      const inputSortL1 = document.getElementById('editNodeSortL1');
      const inputSortL2 = document.getElementById('editNodeSortL2');
      const inputSortL3 = document.getElementById('editNodeSortL3');

      const hintSortL1 = document.getElementById('hintSortL1');
      const hintSortL2 = document.getElementById('hintSortL2');
      const hintSortL3 = document.getElementById('hintSortL3');

      const parentS1 = (current.sort1 !== undefined && current.sort1 !== null) ? current.sort1 : 0;
      const parentS2 = (current.sort2 !== undefined && current.sort2 !== null) ? current.sort2 : 0;

      if (typeof setSortFieldState === 'function') {
        if (level === 1) {
          setSortFieldState(inputSortL1, hintSortL1, 0, true, '');
          setSortFieldState(inputSortL2, hintSortL2, 0, false, '(非本層級，不可修改)');
          setSortFieldState(inputSortL3, hintSortL3, 0, false, '(非本層級，不可修改)');
        } else if (level === 2) {
          setSortFieldState(inputSortL1, hintSortL1, parentS1, false, '(上層排序，不可修改)');
          setSortFieldState(inputSortL2, hintSortL2, 0, true, '');
          setSortFieldState(inputSortL3, hintSortL3, 0, false, '(非本層級，不可修改)');
        } else {
          setSortFieldState(inputSortL1, hintSortL1, parentS1, false, '(上層排序，不可修改)');
          setSortFieldState(inputSortL2, hintSortL2, parentS2, false, '(上層排序，不可修改)');
          setSortFieldState(inputSortL3, hintSortL3, 0, true, '');
        }
      }

      alert(`已切換至【新增${typeLabel}】表單模式，請填寫右側欄位後點擊儲存！`);
    }

    /* ---------------------------------------------------------
     * 6. 系統 Log 側邊 SearchBar 抽屜互動
     * --------------------------------------------------------- */
    
    /* ---------------------------------------------------------
     * 系統 log 詳細 Payload 檢視與 SHA-256 防偽驗證對話框
     * --------------------------------------------------------- */
    function openLogDetailDialog(data) {
      openVDialog({
        title: '稽核 Log 詳細資訊與 Payload',
        titleMsg: '端點：' + (data.endpoint || ''),
        maxWidth: '820px',
        submitText: '關閉檢視',
        bodyHtml: `
          <div style="display:flex; flex-direction:column; gap:16px; font-size: 12px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; background:#f8fafc; padding:14px; border-radius:8px; border:1px solid #e2e8f0;">
              <div><strong>紀錄時間：</strong> ${data.time || ''}</div>
              <div><strong>操作人員：</strong> ${data.user || ''}</div>
              <div><strong>來源 IP：</strong> <code>${data.ip || ''}</code></div>
              <div><strong>作業項目：</strong> ${data.action || ''}</div>
              <div><strong>連線端點：</strong> <code>${data.endpoint || ''}</code></div>
              <div><strong>執行結果：</strong> <span style="color:#15803d; font-weight:600;">${data.status || ''}</span></div>
            </div>

            <div>
              <strong style="color:#334155; display:block; margin-bottom:6px;">🔒 SHA-256 數位簽章雜湊值 (防竄改指紋)：</strong>
              <div style="background:#0f172a; color:#38bdf8; font-family:monospace; padding:10px 14px; border-radius:6px; font-size: 12.5px; word-break:break-all;">
                ${data.sha || ''}
              </div>
            </div>

            <div>
              <strong style="color:#334155; display:block; margin-bottom:6px;">📡 請求標頭 (Request Headers)：</strong>
              <pre style="background:#1e293b; color:#cbd5e1; font-family:monospace; padding:12px; border-radius:6px; font-size: 12px; overflow-x:auto; margin:0;">${data.headers || '{}'}</pre>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div>
                <strong style="color:#334155; display:block; margin-bottom:6px;">📥 請求內容 (Request Payload)：</strong>
                <pre style="background:#1e293b; color:#a7f3d0; font-family:monospace; padding:12px; border-radius:6px; font-size: 12px; overflow-x:auto; margin:0; max-height:200px;">${data.req || '{}'}</pre>
              </div>
              <div>
                <strong style="color:#334155; display:block; margin-bottom:6px;">📤 回應資料 (Response Body)：</strong>
                <pre style="background:#1e293b; color:#fde68a; font-family:monospace; padding:12px; border-radius:6px; font-size: 12px; overflow-x:auto; margin:0; max-height:200px;">${data.res || '{}'}</pre>
              </div>
            </div>
          </div>
        `,
        onSubmit: () => {
          closeVDialog();
        }
      });
    }

    function openShaVerifyDialog() {
      openVDialog({
        title: 'SHA-256 稽核日誌鏈結完整性校驗',
        titleMsg: '比照 shaCheckLog.vue 雜湊防偽架構',
        maxWidth: '720px',
        submitText: '完成檢驗',
        bodyHtml: `
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div style="background:#ecfdf5; border:1px solid #a7f3d0; padding:14px 18px; border-radius:8px; display:flex; align-items:center; gap:14px;">
              <div style="background:#10b981; color:#ffffff; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:bold; flex-shrink:0;">
                ✓
              </div>
              <div>
                <div style="color:#065f46; font-weight:700; font-size:15px;">全系統稽核 Log 鏈結完整性驗證：100% 正確</div>
                <div style="color:#047857; font-size: 13px; margin-top:2px;">
                  區塊鏈雜湊指紋鏈比對通過，共檢核 3,842 筆日誌紀錄，未發現任何竄改、刪除或時間戳偽造情事。
                </div>
              </div>
            </div>

            <div style="border:1px solid #e2e8f0; border-radius:8px; padding:14px; background:#f8fafc;">
              <div style="font-weight:600; color:#334155; margin-bottom:10px; font-size: 12px;">最近 3 筆區塊節點雜湊指紋 (Hash Chain)：</div>
              <div style="display:flex; flex-direction:column; gap:8px; font-family:monospace; font-size: 12px;">
                <div style="background:#ffffff; border:1px solid #cbd5e1; padding:8px 12px; border-radius:6px;">
                  <span style="color:#64748b;">[Block #3842]</span> <strong style="color:#2563eb;">Current:</strong> e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                </div>
                <div style="background:#ffffff; border:1px solid #cbd5e1; padding:8px 12px; border-radius:6px;">
                  <span style="color:#64748b;">[Block #3841]</span> <strong style="color:#2563eb;">Current:</strong> 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
                </div>
                <div style="background:#ffffff; border:1px solid #cbd5e1; padding:8px 12px; border-radius:6px;">
                  <span style="color:#64748b;">[Block #3840]</span> <strong style="color:#2563eb;">Current:</strong> 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8
                </div>
              </div>
            </div>
          </div>
        `,
        onSubmit: () => {
          closeVDialog();
        }
      });
    }

    function doQuickLogSearch() {
      const type = document.getElementById('sysLogTypeSelect')?.value || 'ALL';
      const dateStart = document.getElementById('sysLogDateStart')?.value || '';
      const dateEnd = document.getElementById('sysLogDateEnd')?.value || '';
      const account = document.getElementById('sysLogAccount')?.value?.trim() || '';
      const name = document.getElementById('sysLogName')?.value?.trim() || '';
      const ip = document.getElementById('sysLogIp')?.value?.trim() || '';
      const endpoint = document.getElementById('sysLogEndpoint')?.value?.trim() || '';
      const kw = document.getElementById('quickLogKeyword')?.value?.trim() || '';
      const status = document.getElementById('sysLogStatus')?.value || '';

      const conds = [];
      if (type !== 'ALL') conds.push(`類型: ${type}`);
      if (dateStart || dateEnd) conds.push(`期間: ${dateStart || '不限'} ~ ${dateEnd || '不限'}`);
      if (account) conds.push(`帳號: ${account}`);
      if (name) conds.push(`姓名: ${name}`);
      if (ip) conds.push(`IP: ${ip}`);
      if (endpoint) conds.push(`端點: ${endpoint}`);
      if (kw) conds.push(`關鍵字: ${kw}`);
      if (status) conds.push(`結果: ${status}`);

      const summary = conds.length > 0 ? conds.join('，') : '全部日誌 (無條件篩選)';
      alert(`已依查詢條件：【${summary}】，共查得 3 筆符合之系統稽核日誌。`);
    }

    function resetQuickLogSearch() {
      const type = document.getElementById('sysLogTypeSelect');
      const account = document.getElementById('sysLogAccount');
      const name = document.getElementById('sysLogName');
      const ip = document.getElementById('sysLogIp');
      const endpoint = document.getElementById('sysLogEndpoint');
      const kw = document.getElementById('quickLogKeyword');
      const status = document.getElementById('sysLogStatus');
      const dateStart = document.getElementById('sysLogDateStart');
      const dateEnd = document.getElementById('sysLogDateEnd');
      const dateVal = document.getElementById('sysLogDateVal');

      if (type) type.value = 'ALL';
      if (account) account.value = '';
      if (name) name.value = '';
      if (ip) ip.value = '';
      if (endpoint) endpoint.value = '';
      if (kw) kw.value = '';
      if (status) status.value = '';
      if (dateStart) dateStart.value = '';
      if (dateEnd) dateEnd.value = '';
      if (dateVal) { dateVal.textContent = '全部日誌期間'; dateVal.style.color = '#64748b'; }

      alert('已重設所有日誌查詢條件！');
    }



// 全域導出
// window.selectTreeNode moved to dashboard_views.js
// in dashboard_views.js
// in dashboard_views.js
// in dashboard_views.js
// in dashboard_views.js
// in dashboard_views.js
// in dashboard_views.js
window.openCompanyDialog = openCompanyDialog;
window.openMemberAccountDialog = openMemberAccountDialog;
window.openMsgTemplateDialog = openMsgTemplateDialog;
window.enterSubCodeLevel = enterSubCodeLevel;
window.openSysCodeDialog = openSysCodeDialog;
window.openGroupDialog = openGroupDialog;
window.openGroupPermissionDialog = openGroupPermissionDialog;
window.openGroupMemberDialog = openGroupMemberDialog;
window.openRoleDialog = openRoleDialog;
window.openRoleMemberDialog = openRoleMemberDialog;
window.openRolePermissionDialog = openRolePermissionDialog;
window.toAddSysFunctionNode = toAddSysFunctionNode;
window.openLogDetailDialog = openLogDetailDialog;
window.openShaVerifyDialog = openShaVerifyDialog;
window.doQuickLogSearch = doQuickLogSearch;
window.resetQuickLogSearch = resetQuickLogSearch;
