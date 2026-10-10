/* =========================================================
 * auth.js - 帳號登入、圖形驗證碼、註冊、SSO 與身分切換模組
 * ========================================================= */
    /* -------------------------------------------------------------
     * 1. 頁籤切換控制 (Tab Switch: login vs sso)
     * ------------------------------------------------------------- */
    function switchTab(tabId) {
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
        btn.tabIndex = -1;
      });
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
      });

      const activeBtn = document.getElementById('tab-' + tabId);
      const activePanel = document.getElementById('panel-' + tabId);

      if (activeBtn && activePanel) {
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-selected', 'true');
        activeBtn.tabIndex = 0;
        activePanel.classList.add('active');
      }

      if (tabId === 'login') {
        refreshCaptcha('canvasLogin');
      }
    }
    window.switchTab = switchTab;

    /* -------------------------------------------------------------
     * 2. 圖形驗證碼產生 (Canvas Dynamic Captcha)
     * ------------------------------------------------------------- */
    const captchaStore = {
      canvasLogin: "",
      canvasModalReg: ""
    };

    function generateCaptcha(canvasId) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // 產生 4 碼數字
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      captchaStore[canvasId] = code;

      // 背景
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, width, height);

      // 繪製干擾線
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = `hsl(${Math.random() * 360}, 55%, 70%)`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.lineTo(Math.random() * width, Math.random() * height);
        ctx.stroke();
      }

      // 繪製干擾點
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `hsl(${Math.random() * 360}, 45%, 65%)`;
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, 1.2, 0, 2 * Math.PI);
        ctx.fill();
      }

      // 繪製文字
      ctx.font = "bold 24px Arial, sans-serif";
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = ["#0b5394", "#15803d", "#c2410c", "#4338ca"][i % 4];
        ctx.save();
        const x = 16 + i * 26;
        const y = 28 + (Math.random() * 6 - 3);
        const angle = (Math.random() * 24 - 12) * Math.PI / 180;
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillText(code[i], 0, 0);
        ctx.restore();
      }
    }

    function refreshCaptcha(canvasId) {
      generateCaptcha(canvasId);
      if (canvasId === 'canvasLogin') {
        const input = document.getElementById('loginCaptcha');
        if (input) {
          input.value = "";
          input.classList.remove('is-invalid');
        }
      } else if (canvasId === 'canvasModalReg') {
        const input = document.getElementById('modalRegCaptcha');
        if (input) {
          input.value = "";
          input.classList.remove('is-invalid');
        }
      }
    }

    /* -------------------------------------------------------------
     * 3. 密碼切換顯示/隱藏 (切換 22px 高清晰度 SVG 向量圖示)
     * ------------------------------------------------------------- */
    function togglePasswordVisibility(inputId, iconId) {
      const pwdInput = document.getElementById(inputId);
      const eyeIcon = document.getElementById(iconId);
      if (!pwdInput) return;
      if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        if (eyeIcon) {
          eyeIcon.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>`;
        }
      } else {
        pwdInput.type = 'password';
        if (eyeIcon) {
          eyeIcon.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>`;
        }
      }
    }

    /* -------------------------------------------------------------
     * 4. 登入表單檢核與送出 (Login Submit)
     * ------------------------------------------------------------- */
    function handleAccountLogin(e) {
      e.preventDefault();
      const user = document.getElementById('loginUsername');
      const pwd = document.getElementById('loginPassword');
      const captcha = document.getElementById('loginCaptcha');
      let isValid = true;

      if (!user.value.trim()) {
        user.classList.add('is-invalid');
        document.getElementById('login-user-feedback').style.display = 'block';
        isValid = false;
      } else {
        user.classList.remove('is-invalid');
        document.getElementById('login-user-feedback').style.display = 'none';
      }

      if (!pwd.value.trim()) {
        pwd.classList.add('is-invalid');
        document.getElementById('login-pwd-feedback').style.display = 'block';
        isValid = false;
      } else {
        pwd.classList.remove('is-invalid');
        document.getElementById('login-pwd-feedback').style.display = 'none';
      }

      if (!captcha.value.trim() || captcha.value.trim() !== captchaStore.canvasLogin) {
        captcha.classList.add('is-invalid');
        document.getElementById('login-captcha-feedback').style.display = 'block';
        isValid = false;
      } else {
        captcha.classList.remove('is-invalid');
        document.getElementById('login-captcha-feedback').style.display = 'none';
      }

      if (!isValid) return;

      const btn = document.getElementById('btn-login-submit');
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = "驗證中，請稍候...";

      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = originalText;
        showDashboardView('admin');
        const userEl = document.getElementById('dashUsername');
        if (userEl && user.value.trim()) userEl.textContent = user.value.trim();
      }, 400);
    }

    /* -------------------------------------------------------------
     * 5. 註冊帳號彈窗功能 (Register Modal)
     * ------------------------------------------------------------- */
    function openRegisterModal() {
      openModal(
        "📝 申請新帳號",
        `<form id="modalRegisterForm" onsubmit="handleModalRegister(event)" novalidate>
           <div class="form-group">
             <label class="form-label">帳號(email) <span class="required">*</span></label>
             <input type="email" id="modalRegEmail" class="form-control" placeholder="請輸入電子信箱(email)" required>
             <div class="invalid-feedback" id="mreg-email-err">請輸入有效之電子信箱</div>
           </div>
           <div class="form-group">
             <label class="form-label">姓名 <span class="required">*</span></label>
             <input type="text" id="modalRegName" class="form-control" placeholder="請輸入姓名" required>
             <div class="invalid-feedback" id="mreg-name-err">請輸入姓名</div>
           </div>
           <div class="form-group">
             <label class="form-label">聯絡電話 / 手機 <span class="required">*</span></label>
             <input type="tel" id="modalRegPhone" class="form-control" placeholder="例如：0912-345678" required>
             <div class="invalid-feedback" id="mreg-phone-err">請輸入有效聯絡電話</div>
           </div>
           <div class="form-group">
             <label class="form-label">聯絡地址 <span style="font-size: 12px; color:#64748b; font-weight:normal;">(非必填)</span></label>
             <input type="text" id="modalRegAddress" class="form-control" placeholder="請輸入聯絡地址（選填）">
           </div>
           <div class="form-group">
             <label class="form-label">設定密碼 <span class="required">*</span></label>
             <input type="password" id="modalRegPwd" class="form-control" placeholder="至少 8 碼，包含英文與數字" required>
             <div class="invalid-feedback" id="mreg-pwd-err">密碼長度需達 8 碼以上</div>
           </div>
           <div class="form-group">
             <label class="form-label">確認密碼 <span class="required">*</span></label>
             <input type="password" id="modalRegPwdConfirm" class="form-control" placeholder="請再次輸入密碼" required>
             <div class="invalid-feedback" id="mreg-pwdc-err">兩次密碼不一致</div>
           </div>
           <div class="form-group">
             <label class="form-label">圖形驗證碼 <span class="required">*</span></label>
             <div class="captcha-row">
               <input type="text" id="modalRegCaptcha" class="form-control" placeholder="4 位數" maxlength="4" required style="width:130px;">
               <div class="captcha-canvas-wrap" onclick="refreshCaptcha('canvasModalReg')" title="點擊換一張">
                 <canvas id="canvasModalReg" width="120" height="42"></canvas>
               </div>
               <button type="button" class="btn-refresh-icon" onclick="refreshCaptcha('canvasModalReg')" title="換一張驗證碼" aria-label="換一張驗證碼">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                   <path d="M23 4v6h-6"></path>
                   <path d="M1 20v-6h6"></path>
                   <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                 </svg>
               </button>
             </div>
             <div class="invalid-feedback" id="mreg-cap-err">驗證碼錯誤</div>
           </div>
           <button type="submit" class="btn-submit" style="background:#0f766e; color:#ffffff; margin-top:14px;">送出註冊申請</button>
         </form>`
      );
      setTimeout(() => {
        generateCaptcha('canvasModalReg');
      }, 50);
    }

    function handleModalRegister(e) {
      e.preventDefault();
      const email = document.getElementById('modalRegEmail');
      const name = document.getElementById('modalRegName');
      const phone = document.getElementById('modalRegPhone');
      const address = document.getElementById('modalRegAddress');
      const pwd = document.getElementById('modalRegPwd');
      const pwdC = document.getElementById('modalRegPwdConfirm');
      const cap = document.getElementById('modalRegCaptcha');

      let valid = true;
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim() || !emailPattern.test(email.value.trim())) {
        email.classList.add('is-invalid');
        document.getElementById('mreg-email-err').style.display = 'block';
        valid = false;
      } else {
        email.classList.remove('is-invalid');
        document.getElementById('mreg-email-err').style.display = 'none';
      }

      if (!name.value.trim()) {
        name.classList.add('is-invalid');
        document.getElementById('mreg-name-err').style.display = 'block';
        valid = false;
      } else {
        name.classList.remove('is-invalid');
        document.getElementById('mreg-name-err').style.display = 'none';
      }

      if (!phone.value.trim()) {
        phone.classList.add('is-invalid');
        document.getElementById('mreg-phone-err').style.display = 'block';
        valid = false;
      } else {
        phone.classList.remove('is-invalid');
        document.getElementById('mreg-phone-err').style.display = 'none';
      }

      if (!pwd.value.trim() || pwd.value.trim().length < 8) {
        pwd.classList.add('is-invalid');
        document.getElementById('mreg-pwd-err').style.display = 'block';
        valid = false;
      } else {
        pwd.classList.remove('is-invalid');
        document.getElementById('mreg-pwd-err').style.display = 'none';
      }

      if (pwdC.value !== pwd.value) {
        pwdC.classList.add('is-invalid');
        document.getElementById('mreg-pwdc-err').style.display = 'block';
        valid = false;
      } else {
        pwdC.classList.remove('is-invalid');
        document.getElementById('mreg-pwdc-err').style.display = 'none';
      }

      if (!cap.value.trim() || cap.value.trim() !== captchaStore.canvasModalReg) {
        cap.classList.add('is-invalid');
        document.getElementById('mreg-cap-err').style.display = 'block';
        valid = false;
      } else {
        cap.classList.remove('is-invalid');
        document.getElementById('mreg-cap-err').style.display = 'none';
      }

      if (!valid) return;

      const registeredEmail = email.value.trim();
      closeModal();

      setTimeout(() => {
        openModal(
          "🎉 註冊成功",
          `<div style="color: #166534; font-weight: bold; margin-bottom: 10px;">
             恭喜您！帳號已建立完成。
           </div>
           <p style="font-size: 12.5px; color:#334155; margin-bottom:12px;">
             帳號(email)：<strong>${registeredEmail}</strong><br>
             狀態：<span style="background:#dcfce7; color:#166534; padding:2px 6px; border-radius:4px; font-size: 12px;">已啟用</span>
           </p>
           <p style="font-size: 13px; color:#64748b;">系統已為您自動帶入登入帳號，請直接輸入密碼進行登入。</p>`,
          () => {
            document.getElementById('loginUsername').value = registeredEmail;
            document.getElementById('loginPassword').focus();
          }
        );
      }, 200);
    }

    /* -------------------------------------------------------------
     * 6. 事業單位證號登入模擬 (OSHA SSO)
     * ------------------------------------------------------------- */
    function simulateOshaSso() {
      openModal(
        "🏢 職安署 One4All SSO 登入模擬",
        `<p style="margin-bottom:14px; color:#475569;">事業單位<strong>免註冊帳號</strong>，請輸入統編體驗 Just-In-Time 自動開通機制：</p>
         <div style="margin-bottom:14px;">
           <label style="display:block; font-size: 13px; font-weight:600; margin-bottom:4px;">事業單位統一編號 (8 碼)：</label>
           <input type="text" id="mock-idn" value="16541333" class="form-control" maxlength="8">
         </div>
         <div style="margin-bottom:18px;">
           <label style="display:block; font-size: 13px; font-weight:600; margin-bottom:4px;">事業單位名稱：</label>
           <input type="text" id="mock-cname" value="凌網科技股份有限公司" class="form-control">
         </div>
         <button type="button" class="btn-sso" onclick="executeMockSsoCallback()" style="font-size: 12.5px; padding:11px;">
           模擬職安署 SSO 授權返回
         </button>`
      );
    }

    function executeMockSsoCallback() {
      const idn = document.getElementById('mock-idn').value.trim() || "16541333";
      const cname = document.getElementById('mock-cname').value.trim() || "純測試營造股份有限公司";

      closeModal();
      showDashboardView('company');
      const userEl = document.getElementById('dashUsername');
      if (userEl) userEl.textContent = cname + ' (' + idn + ')';
    }


    // 頁面載入初始化
    window.addEventListener('DOMContentLoaded', () => {
      generateCaptcha('canvasLogin');

      // 輸入即時清除驗證錯誤提示
      ['loginUsername', 'loginPassword', 'loginCaptcha'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('input', () => {
            el.classList.remove('is-invalid');
            if (id === 'loginUsername') {
              const fb = document.getElementById('login-user-feedback');
              if (fb) fb.style.display = 'none';
            } else if (id === 'loginPassword') {
              const fb = document.getElementById('login-pwd-feedback');
              if (fb) fb.style.display = 'none';
            } else if (id === 'loginCaptcha') {
              const fb = document.getElementById('login-captcha-feedback');
              if (fb) fb.style.display = 'none';
            }
          });
        }
      });

      // 若網址包含 #dashboard 則直接顯示儀錶板
      if (window.location.hash === '#dashboard') {
        showDashboardView('系統管理員');
      }
    });


    function showDashboardView(targetRoleOrUsername) {
      document.getElementById('loginView').style.display = 'none';
      document.getElementById('dashboardView').style.display = 'flex';
      document.body.style.overflow = 'hidden';
      document.body.style.borderTop = 'none';
      window.location.hash = 'dashboard';

      if (targetRoleOrUsername && roleMenuData[targetRoleOrUsername]) {
        setSystemRole(targetRoleOrUsername);
      } else {
        setSystemRole('admin');
        if (targetRoleOrUsername) {
          const userEl = document.getElementById('dashUsername');
          if (userEl) userEl.textContent = targetRoleOrUsername;
        }
      }
      startCountdownTimer();
    }

    function showLoginView() {
      document.getElementById('dashboardView').style.display = 'none';
      document.getElementById('loginView').style.display = 'flex';
      document.body.style.overflow = '';
      document.body.style.borderTop = '4px solid var(--primary-color)';
      window.location.hash = '';

      if (window.countdownInterval) {
        clearInterval(window.countdownInterval);
        window.countdownInterval = null;
      }
      refreshCaptcha('canvasLogin');
    }


// 全域導出
window.switchTab = switchTab;
window.captchaStore = captchaStore;
window.generateCaptcha = generateCaptcha;
window.refreshCaptcha = refreshCaptcha;
window.togglePasswordVisibility = togglePasswordVisibility;
window.handleAccountLogin = handleAccountLogin;
window.openRegisterModal = openRegisterModal;
window.handleModalRegister = handleModalRegister;
window.simulateOshaSso = simulateOshaSso;
window.executeMockSsoCallback = executeMockSsoCallback;
window.showForgotPasswordModal = showForgotPasswordModal;
window.showDashboardView = showDashboardView;
window.showLoginView = showLoginView;

document.addEventListener('keydown', event => {
  if (!event.target.matches('#tab-login,#tab-sso') || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
  event.preventDefault();
  const next = event.key === 'Home' ? 'login' : event.key === 'End' ? 'sso' : event.target.id === 'tab-login' ? 'sso' : 'login';
  switchTab(next); document.getElementById('tab-' + next).focus();
});
