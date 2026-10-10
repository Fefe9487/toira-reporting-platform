/* =========================================================
 * navigation.js - 後台導覽列、側邊欄展開/收合、角色切換與定時器
 * ========================================================= */
    /* =========================================================
     * 2. 角色與選單切換邏輯
     * ========================================================= */
    window.currentRole = window.currentRole || 'admin'; var currentRole = window.currentRole;
    window.currentActiveKey = window.currentActiveKey || 'caseSearch'; var currentActiveKey = window.currentActiveKey;

    function setSystemRole(roleKey) {
      if (!roleKey) roleKey = 'inspection';
      const data = roleMenuData[roleKey] || roleMenuData.admin;
      currentRole = roleKey;
      window.currentRole = roleKey;

      const userDisplayEl = document.getElementById('topUserDisplay') || document.getElementById('dashUsername');
      if (userDisplayEl) userDisplayEl.textContent = data.userName;

      const roleNameEl = document.getElementById('sidebarRoleName');
      if (roleNameEl) roleNameEl.textContent = data.roleName;

      const roleDetailEl = document.getElementById('sidebarRoleDetail');
      if (roleDetailEl) roleDetailEl.textContent = data.roleDetail;

      const roleSelectorEl = document.getElementById('roleSelector');
      if (roleSelectorEl && roleSelectorEl.value !== roleKey) {
        roleSelectorEl.value = roleKey;
      }

      // 檢查目前選取選單是否在新角色的選單中，若無則切回第一個選單
      let keyFound = false;
      data.menus.forEach(item => {
        if (item.type === "link" && item.key === currentActiveKey) keyFound = true;
        if (item.type === "group" && item.children) {
          if (item.children.some(c => c.key === currentActiveKey)) keyFound = true;
        }
      });
      if (!keyFound) {
        currentActiveKey = (data.menus[0] && data.menus[0].key) ? data.menus[0].key : 'caseSearch';
        window.currentActiveKey = currentActiveKey;
      }

      const navContainer = document.getElementById('sidebarNav');
      if (navContainer) {
        let html = "";
        data.menus.forEach((item, idx) => {
          if (item.type === "link") {
            html += `
              <li class="menu-item ${item.key === currentActiveKey ? 'active' : ''}" onclick="selectSingleMenu(this, '${item.key}')">
                <a href="javascript:void(0);" class="menu-link">
                  <span class="menu-icon">${iconSvgs[item.icon] || ''}</span>
                  <span>${item.title}</span>
                </a>
              </li>
            `;
          } else if (item.type === "group") {
            html += `
              <li class="menu-group ${item.open ? 'open' : ''}" id="group-${idx}">
                <div class="menu-group-header" onclick="toggleSubmenu('group-${idx}')">
                  <div class="menu-group-header-left">
                    <span class="menu-icon">${iconSvgs[item.icon] || ''}</span>
                    <span>${item.title}</span>
                  </div>
                  <svg class="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <ul class="submenu-list">
                  ${item.children.map(child => `
                    <li class="submenu-item ${child.key === currentActiveKey ? 'active' : ''}" onclick="selectSubMenu(this, '${child.key}', event)">
                      <a href="javascript:void(0);" class="submenu-link">
                        <span style="font-size:11px; opacity:0.6;">●</span>
                        <span>${child.title}</span>
                      </a>
                    </li>
                  `).join('')}
                </ul>
              </li>
            `;
          }
        });
        navContainer.innerHTML = html;
      }

      // 渲染目前選取的畫面
      if (typeof renderView === 'function') {
        renderView(currentActiveKey);
      }
    }
    window.setSystemRole = setSystemRole;

    function toggleSubmenu(groupId) {
      const group = document.getElementById(groupId);
      if (group) group.classList.toggle('open');
    }

    function selectSingleMenu(element, key) {
      clearAllMenuSelection();
      element.classList.add('active');
      currentActiveKey = key; window.currentActiveKey = key;
      renderView(key);
    }

    function selectSubMenu(element, key, event) {
      if (event) event.stopPropagation();
      clearAllMenuSelection();
      element.classList.add('active');
      currentActiveKey = key; window.currentActiveKey = key;
      renderView(key);
    }

    function clearAllMenuSelection() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.submenu-item').forEach(el => el.classList.remove('active'));
    }

    function toggleSidebar() {
      const sidebar = document.getElementById('appSidebar');
      sidebar.classList.toggle('collapsed');
    }


    let remainingSeconds = 14 * 60 + 17;
    function startCountdown() {
      const timerEl = document.getElementById('clockCountdown') || document.getElementById('dashCountdown');
      if (!timerEl) return;
      setInterval(() => {
        if (remainingSeconds > 0) {
          remainingSeconds--;
          const m = Math.floor(remainingSeconds / 60);
          const s = remainingSeconds % 60;
          timerEl.textContent = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
        }
      }, 1000);
    }

    window.addEventListener('DOMContentLoaded', () => {
      const urlParams = new URLSearchParams(window.location.search);
      const initialRole = urlParams.get('role') || 'inspection';
      setSystemRole(initialRole);
      startCountdown();
    });

    function handleProfileClick() {
      clearAllMenuSelection();
      currentActiveKey = 'accountMaintain';
      window.currentActiveKey = 'accountMaintain';
      if (typeof renderView === 'function') {
        renderView('accountMaintain');
      }
    }

// 全域導出
window.setSystemRole = setSystemRole;
window.toggleSubmenu = toggleSubmenu;
window.selectSingleMenu = selectSingleMenu;
window.selectSubMenu = selectSubMenu;
window.clearAllMenuSelection = clearAllMenuSelection;
window.toggleSidebar = toggleSidebar;
window.startCountdown = startCountdown;
window.startCountdownTimer = startCountdown;
window.handleProfileClick = handleProfileClick;
