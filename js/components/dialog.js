let vDialogReturnFocus = null;
let vDialogOriginalOverflow = "";
/* =========================================================
 * dialog.js - 系統通用 EditorDialog (Vue 規格) 與共用 Modal 互動
 * ========================================================= */
    /* -------------------------------------------------------------
     * 7. 彈窗控制 (Modal Functions)
     * ------------------------------------------------------------- */
    var currentModalCallback = null;
    window.currentModalCallback = currentModalCallback;

    function openModal(title, contentHtml, onCloseCallback) {
      document.getElementById('modalTitle').innerHTML = title;
      document.getElementById('modalBody').innerHTML = contentHtml;
      document.getElementById('customModal').classList.add('show');
      currentModalCallback = onCloseCallback || null;
    }

    function closeModal() {
      document.getElementById('customModal').classList.remove('show');
      if (typeof currentModalCallback === 'function') {
        const cb = currentModalCallback;
        currentModalCallback = null;
        cb();
      }
    }

    function showForgotPasswordModal() {
      openModal(
        "🔑 忘記密碼申請",
        `<p style="margin-bottom:12px; color:#475569;">請輸入註冊之帳號(email)，系統將寄送重設密碼連結：</p>
         <div style="margin-bottom:14px;">
           <label style="display:block; font-size: 13px; font-weight:600; margin-bottom:4px;">帳號(email)：</label>
           <input type="email" placeholder="例如：user@example.com" class="form-control">
         </div>
         <button type="button" class="btn-submit" onclick="alert('重設密碼信件已寄出，請查收信箱！'); closeModal();">發送重設信件</button>`
      );
    }

    // 依規定限制：彈出視窗只能從視窗內按鈕關閉，點視窗外的地方不可關閉視窗
    window.addEventListener('DOMContentLoaded', () => {
      const customModal = document.getElementById('customModal');
      if (customModal) {
        customModal.addEventListener('click', (e) => {
          if (e.target === customModal) {
            const dialog = customModal.querySelector('.modal-dialog');
            if (dialog) {
              dialog.classList.add('v-dialog-shake');
              setTimeout(() => dialog.classList.remove('v-dialog-shake'), 400);
            }
          }
        });
      }
    });


    function openVDialog(options) {
      const overlay = document.getElementById('vDialogOverlay');
      const card = document.getElementById('vDialogCard');
      const titleEl = document.getElementById('vDialogTitle');
      const titleMsgEl = document.getElementById('vDialogTitleMsg');
      const bodyEl = document.getElementById('vDialogBody');
      const submitTextEl = document.getElementById('vDialogSubmitText');

      if (options.maxWidth) card.style.maxWidth = options.maxWidth;
      else card.style.maxWidth = '820px';

      titleEl.innerHTML = options.title || '編輯資料';
      if (options.titleMsg) {
        titleEl.innerHTML += ` <span style="color:#ef4444; font-size: 13px; font-weight:normal;">${options.titleMsg}</span>`;
      }
      bodyEl.innerHTML = options.bodyHtml || '';
      submitTextEl.textContent = options.submitText || '儲存';
      currentDialogCallback = options.onSubmit;

      // 支援隱藏底部通用 footer（當對話框內部自行提供流程控制按鈕時，例如通報三步驟流程或詳情檢視畫面）
      const footerEl = card ? card.querySelector('.v-dialog-footer') : null;
      if (footerEl) {
        if (options.hideFooter) {
          footerEl.style.setProperty('display', 'none', 'important');
          footerEl.classList.add('v-dialog-footer-hidden');
        } else {
          footerEl.style.removeProperty('display');
          footerEl.classList.remove('v-dialog-footer-hidden');
        }
      }

      vDialogReturnFocus = document.activeElement;
      vDialogOriginalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      overlay.classList.add('active');
      card.querySelector('.v-dialog-close')?.focus();
    }

    function closeVDialog() {
      const overlay = document.getElementById('vDialogOverlay');
      if (typeof closeHhDateRangePicker === 'function') closeHhDateRangePicker();
      overlay.classList.remove('active');
      document.body.style.overflow = vDialogOriginalOverflow;
      if (vDialogReturnFocus?.isConnected) vDialogReturnFocus.focus();
      currentDialogCallback = null;

      // 復原通用 footer 顯示狀態
      const footerEl = document.querySelector('#vDialogCard .v-dialog-footer');
      if (footerEl) {
        footerEl.style.removeProperty('display');
        footerEl.classList.remove('v-dialog-footer-hidden');
      }
    }

    function handleDialogOverlayClick(e) {
      // 依規定限制：彈出視窗只能從視窗內按鈕關閉，點視窗外的地方不可關閉視窗
      if (e.target.id === 'vDialogOverlay') {
        const card = document.getElementById('vDialogCard');
        if (card) {
          card.classList.add('v-dialog-shake');
          setTimeout(() => card.classList.remove('v-dialog-shake'), 400);
        }
      }
    }

    function submitVDialog() {
      if (currentDialogCallback) {
        currentDialogCallback();
      }
    }

// 全域導出
window.openModal = openModal;
window.closeModal = closeModal;
window.openVDialog = openVDialog;
window.closeVDialog = closeVDialog;
window.handleDialogOverlayClick = handleDialogOverlayClick;
window.submitVDialog = submitVDialog;

// Keep keyboard navigation in the active dialog, including the shared date picker.
document.addEventListener('keydown', event => {
  const card = document.querySelector('#vDialogOverlay.active #vDialogCard');
  if (!card) return;
  const calendar = document.getElementById('hhCalendarPopup');
  const calendarOpen = calendar && calendar.style.display !== 'none';
  if (event.key === 'Escape' && calendarOpen) { event.preventDefault(); closeHhDateRangePicker(); return; }
  if (event.key !== 'Tab') return;
  const scope = calendarOpen ? calendar : card;
  const focusable = [...scope.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled):not([type="hidden"]),select:not(:disabled),textarea:not(:disabled),summary,[tabindex="0"]')].filter(el => el.getClientRects().length && !el.closest('[hidden]'));
  if (!focusable.length) { event.preventDefault(); card.focus(); return; }
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (event.shiftKey && (document.activeElement === first || !scope.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && (document.activeElement === last || !scope.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
});
