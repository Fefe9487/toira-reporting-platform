/* =========================================================
 * menu_config.js - 三大角色選單資料定義 (Role-Based Menu Config)
 * ========================================================= */
    /* =========================================================
     * 1. 三大角色選單資料定義 (Role-Based Menu Config)
     * ========================================================= */
    const roleMenuData = {
      // 1. 事業單位：通報案件查詢、廠商維護 (依需求移除帳號維護，改由頁首個人資料進入)
      company: {
        roleName: "事業單位",
        roleDetail: "通報人 / 廠商身分",
        userName: "台灣營造事業單位",
        menus: [
          { type: "link", key: "caseSearch", title: "通報案件查詢", icon: "file-text", active: true },
          { type: "link", key: "vendorMaintain", title: "廠商維護", icon: "building" }
        ]
      },

      // 2. 勞檢機構：通報案件查詢、地方通報網站維護、危評維護 (依需求移除帳號維護，改由頁首個人資料進入)
      inspection: {
        roleName: "勞檢機構",
        roleDetail: "勞動檢查機構審查人員",
        userName: "中區職業安全衛生中心",
        menus: [
          { type: "link", key: "caseSearch", title: "通報案件查詢", icon: "file-text", active: true },
          { type: "link", key: "localMaintain", title: "地方通報網站維護", icon: "map-pin" },
          { type: "link", key: "workplaceMaintain", title: "危評維護", icon: "shield-alert" }
        ]
      },

      // 3. 管理者：通報案件查詢、帳號維護、廠商維護、地方通報網站維護、危評維護、系統管理
      admin: {
        roleName: "管理者",
        roleDetail: "系統全權管理人員",
        userName: "系統管理員",
        menus: [
          { type: "link", key: "caseSearch", title: "通報案件查詢", icon: "file-text", active: true },
          { type: "link", key: "accountMaintain", title: "帳號維護", icon: "user" },
          { type: "link", key: "vendorMaintain", title: "廠商維護", icon: "building" },
          { type: "link", key: "localMaintain", title: "地方通報網站維護", icon: "map-pin" },
          { type: "link", key: "workplaceMaintain", title: "危評維護", icon: "shield-alert" },
          {
            type: "group",
            title: "系統管理",
            icon: "settings",
            open: true,
            children: [
              { key: "msgTemplate", title: "訊息範本維護" },
              { key: "sysCode", title: "系統代碼維護" },
              { key: "sysLog", title: "系統log紀錄" },
              { key: "sysGroup", title: "群組維護" },
              { key: "sysRole", title: "角色維護" },
              { key: "sysFunction", title: "模組/功能維護" }
            ]
          }
        ]
      }
    };

    /* SVG 圖示字典 */
    const iconSvgs = {
      "file-text": `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
      "folder": `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
      "user": `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
      "building": `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
      "map-pin": `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
      "shield-alert": `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
      "settings": `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
    };

// 全域導出
window.roleMenuData = roleMenuData;
window.iconSvgs = iconSvgs;

// 全域狀態初始化
window.currentRole = 'admin';
window.currentActiveKey = 'caseSearch';