/* =========================================================
 * calendar_picker.js - 全域通用日期起訖選擇器 (hhCalendarPopup)
 * ========================================================= */
    /* ==========================================================================
       全域通用日期起訖選擇器 (hhCalendarPopup) - 支援所有日期元件
       在同一個月曆畫面中依序點選起日與迄日，選定後自動儲存並於 250ms 內自動關閉
       ========================================================================== */
    let hhActiveCalConfig = null;
    let hhCalYear = 2026;
    let hhCalMonth = 8; // 0-indexed (8 = 9月)
    let hhPickState = 'START'; // 'START' 或 'END'
    let hhTempStart = '';
    let hhTempEnd = '';

    function openHhCalendarPopup(triggerEl, config = {}) {
      if (window.event) window.event.stopPropagation();

      hhActiveCalConfig = {
        triggerEl: triggerEl,
        startId: config.startId || 'hhStartDate',
        endId: config.endId || 'hhEndDate',
        displayId: config.displayId || 'hhDateRangeVal',
        placeholder: config.placeholder || '請選擇起訖期間',
        defaultStart: config.defaultStart || '',
        defaultEnd: config.defaultEnd || '',
        maxDays: config.maxDays || 0,
        onSelect: config.onSelect || null
      };

      let popup = document.getElementById('hhCalendarPopup');
      if (!popup) {
        popup = document.createElement('div');
        popup.id = 'hhCalendarPopup';
        popup.setAttribute('role','dialog');
        popup.setAttribute('aria-label','選擇作業起迄日');
        popup.style.cssText = 'max-height:calc(100vh - 24px); overflow-y:auto; display:none; position:fixed; z-index:99999999; width:330px; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; box-shadow:0 12px 30px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.12); padding:14px; font-family:inherit;';
        document.body.appendChild(popup);
      }

      // 讀取當前起訖值
      const startEl = document.getElementById(hhActiveCalConfig.startId);
      const endEl = document.getElementById(hhActiveCalConfig.endId);
      hhTempStart = (startEl ? startEl.value : '') || hhActiveCalConfig.defaultStart || '';
      hhTempEnd = (endEl ? endEl.value : '') || hhActiveCalConfig.defaultEnd || '';
      hhPickState = 'START';

      if (hhTempStart) {
        const parts = hhTempStart.split('-');
        if (parts.length === 3) {
          hhCalYear = parseInt(parts[0], 10);
          hhCalMonth = parseInt(parts[1], 10) - 1;
        }
      } else {
        const now = new Date();
        hhCalYear = now.getFullYear();
        hhCalMonth = now.getMonth();
      }

      // 動態精準定位於點擊元件下方 (具備螢幕邊界自動偵測防溢出)
      const rect = triggerEl.getBoundingClientRect();
      let top = rect.bottom + 6;
      let left = rect.left;
      const popupWidth = 330;
      if (left + popupWidth > window.innerWidth - 12) {
        left = window.innerWidth - popupWidth - 12;
      }
      if (left < 10) left = 10;
      const popupHeight = Math.min(440, window.innerHeight - 24);
      if (top + popupHeight > window.innerHeight - 12) {
        top = rect.top - popupHeight > 12 ? rect.top - popupHeight : Math.max(12, window.innerHeight - popupHeight - 12);
      }

      popup.style.top = top + 'px';
      popup.style.left = left + 'px';
      popup.style.display = 'block';

      renderHhCalendar();

      setTimeout(() => {
        document.removeEventListener('click', handleHhCalOutsideClick);
        document.addEventListener('click', handleHhCalOutsideClick);
      }, 10);
    }

    function toggleHhDateRangePicker(e) {
      const display = document.getElementById('hhDateRangeDisplay');
      if (display) {
        openHhCalendarPopup(display, {
          startId: 'hhStartDate',
          endId: 'hhEndDate',
          displayId: 'hhDateRangeVal',
          defaultStart: '2026-09-10',
          defaultEnd: '2026-09-15',
          onSelect: updateHhPeriodReminder
        });
      }
    }

    function handleHhCalOutsideClick(e) {
      const popup = document.getElementById('hhCalendarPopup');
      if (!popup || popup.style.display === 'none') return;
      if (popup.contains(e.target)) return;
      if (hhActiveCalConfig && hhActiveCalConfig.triggerEl && hhActiveCalConfig.triggerEl.contains(e.target)) return;
      closeHhDateRangePicker();
    }

    function closeHhDateRangePicker(e) {
      if (e && e.stopPropagation) e.stopPropagation();
      const popup = document.getElementById('hhCalendarPopup');
      if (popup && popup.style.display !== 'none') {
        popup.style.display = 'none';
        hhActiveCalConfig?.triggerEl?.focus({preventScroll:true});
      }
      document.removeEventListener('click', handleHhCalOutsideClick);
    }

    function changeHhCalMonth(delta, e) {
      if (e && e.stopPropagation) e.stopPropagation();
      hhCalMonth += delta;
      if (hhCalMonth < 0) {
        hhCalMonth = 11;
        hhCalYear--;
      } else if (hhCalMonth > 11) {
        hhCalMonth = 0;
        hhCalYear++;
      }
      renderHhCalendar();
    }

    function clearHhDateRange(e) {
      if (e && e.stopPropagation) e.stopPropagation();
      if (hhActiveCalConfig) {
        const startEl = document.getElementById(hhActiveCalConfig.startId);
        const endEl = document.getElementById(hhActiveCalConfig.endId);
        const displayEl = document.getElementById(hhActiveCalConfig.displayId);

        if (startEl) startEl.value = '';
        if (endEl) endEl.value = '';
        if (typeof hhActiveCalConfig.onSelect === 'function') hhActiveCalConfig.onSelect('', '');
        if (displayEl) {
          displayEl.textContent = hhActiveCalConfig.placeholder || '請選擇起訖期間';
          displayEl.style.color = '#64748b';
          displayEl.style.fontWeight = 'normal';
        }
      }
      closeHhDateRangePicker();
    }

    function hhParseYmdUtc(ymd) {
      const parts = String(ymd || '').split('-').map(Number);
      if (parts.length !== 3 || parts.some(n => !n && n !== 0)) return NaN;
      return Date.UTC(parts[0], parts[1] - 1, parts[2]);
    }

    function hhInclusiveDayCount(start, end) {
      const a = hhParseYmdUtc(start);
      const b = hhParseYmdUtc(end);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
      return Math.round((b - a) / 86400000) + 1;
    }

    function hhShiftYmd(ymd, days) {
      const dt = new Date(hhParseYmdUtc(ymd));
      dt.setUTCDate(dt.getUTCDate() + days);
      const y = dt.getUTCFullYear();
      const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
      const d = String(dt.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    function hhRangeExceedsMax(start, end) {
      const maxDays = hhActiveCalConfig && hhActiveCalConfig.maxDays;
      if (!maxDays || !start || !end) return false;
      return hhInclusiveDayCount(start, end) > maxDays;
    }

    function renderHhCalendar() {
      const popup = document.getElementById('hhCalendarPopup');
      if (!popup) return;

      const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

      let tipHtml = '';
      let tipBg = '#eff6ff';
      let tipColor = '#1d4ed8';

      if (hhPickState === 'START') {
        tipHtml = '👉 請先點選【<strong>開始起日</strong>】';
      } else if (hhActiveCalConfig && hhActiveCalConfig.maxDays && hhTempStart) {
        const lastDay = hhShiftYmd(hhTempStart, hhActiveCalConfig.maxDays - 1);
        tipHtml = `已選起日：<b>${hhTempStart}</b>，請點選迄日（兩週內，最晚 <b>${lastDay}</b>）`;
        tipBg = '#fef3c7';
        tipColor = '#92400e';
      } else {
        tipHtml = `已選起日：<b>${hhTempStart}</b>，👉 請點選【<strong>結束迄日</strong>】`;
        tipBg = '#fef3c7';
        tipColor = '#92400e';
      }

      const firstDayIndex = new Date(hhCalYear, hhCalMonth, 1).getDay();
      const totalDays = new Date(hhCalYear, hhCalMonth + 1, 0).getDate();

      let cellsHtml = '';
      for (let i = 0; i < firstDayIndex; i++) {
        cellsHtml += '<div style="height:32px;"></div>';
      }

      for (let day = 1; day <= totalDays; day++) {
        const dayStr = String(day).padStart(2, '0');
        const monthStr = String(hhCalMonth + 1).padStart(2, '0');
        const dateStr = `${hhCalYear}-${monthStr}-${dayStr}`;

        const isStart = (dateStr === hhTempStart);
        const isEnd = (dateStr === hhTempEnd);
        const beyondMax = hhPickState === 'END' && hhTempStart && dateStr > hhTempStart && hhRangeExceedsMax(hhTempStart, dateStr);
        let inRange = false;
        if (hhTempStart && hhTempEnd && dateStr > hhTempStart && dateStr < hhTempEnd) {
          inRange = true;
        }

        let bg = 'transparent';
        let color = '#1e293b';
        let fontWeight = '500';
        let borderRadius = '4px';
        let cursor = 'pointer';

        if (beyondMax) {
          color = '#cbd5e1';
          cursor = 'not-allowed';
        } else if (isStart || isEnd) {
          bg = '#2563eb';
          color = '#ffffff';
          fontWeight = '700';
          borderRadius = '6px';
        } else if (inRange) {
          bg = '#dbeafe';
          color = '#1e40af';
        }

        cellsHtml += `
          <button type="button" aria-label="${dateStr}" ${beyondMax ? 'disabled' : ''} onclick="selectHhDateCell('${dateStr}', event)" 
               style="border:0; padding:0; height:34px; line-height:34px; cursor:${cursor}; font-size: 14.5px; font-weight:${fontWeight}; color:${color}; background:${bg}; border-radius:${borderRadius}; transition:all 0.15s ease;"
               title="${beyondMax ? '超過兩週，不可選' : dateStr}">
            ${day}
          </button>
        `;
      }

      popup.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <button type="button" aria-label="上一個月" onclick="changeHhCalMonth(-1, event)" style="background:#f1f5f9; border:none; border-radius:5px; padding:5px 12px; cursor:pointer; font-weight:bold; color:#475569; font-size:14px;">◀</button>
          <div style="font-weight:700; color:#1e293b; font-size: 16px;">${hhCalYear} 年 ${monthNames[hhCalMonth]}</div>
          <button type="button" aria-label="下一個月" onclick="changeHhCalMonth(1, event)" style="background:#f1f5f9; border:none; border-radius:5px; padding:5px 12px; cursor:pointer; font-weight:bold; color:#475569; font-size:14px;">▶</button>
        </div>
        <div id="hhCalTip" style="background:${tipBg}; color:${tipColor}; font-size: 13.5px; padding: 7px 12px; border-radius:5px; margin-bottom:12px; text-align:center;">
          ${tipHtml}
        </div>
        <div style="display:grid; grid-template-columns:repeat(7, 1fr); text-align:center; font-size: 13.5px; font-weight:600; color:#64748b; margin-bottom:8px;">
          <span style="color:#ef4444;">日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span style="color:#2563eb;">六</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:3px; text-align:center;">
          ${cellsHtml}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; border-top:1px solid #f1f5f9; padding-top:10px;">
          <button type="button" onclick="clearHhDateRange(event)" style="background:none; border:none; color:#dc2626; font-size: 13.5px; cursor:pointer; text-decoration:underline;">清除區間</button>
          <span style="font-size: 14px; color:#64748b; font-weight:500;">${hhTempStart && hhTempEnd ? `${hhTempStart} ～ ${hhTempEnd}` : '尚未選妥'}</span>
          <button type="button" onclick="closeHhDateRangePicker(event)" style="background:none; border:none; color:#64748b; font-size: 13.5px; cursor:pointer; text-decoration:underline;">關閉</button>
        </div>
      `;
      const focusDate = popup.querySelector('[aria-label="' + hhTempStart + '"]') || popup.querySelector('button[aria-label^="20"]');
      focusDate?.focus({preventScroll:true});
    }

    function selectHhDateCell(dateStr, e) {
      if (e && e.stopPropagation) e.stopPropagation();
      const tipEl = document.getElementById('hhCalTip');

      if (hhPickState === 'START') {
        hhTempStart = dateStr;
        hhTempEnd = '';
        hhPickState = 'END';
        renderHhCalendar();
      } else {
        if (dateStr < hhTempStart) {
          hhTempStart = dateStr;
          hhTempEnd = '';
          hhPickState = 'END';
          renderHhCalendar();
        } else if (hhRangeExceedsMax(hhTempStart, dateStr)) {
          const maxDays = hhActiveCalConfig.maxDays;
          const lastDay = hhShiftYmd(hhTempStart, maxDays - 1);
          alert(`作業期間不得超過兩週（${maxDays}日）。請改選 ${lastDay} 或更早的迄日。`);
        } else {
          hhTempEnd = dateStr;
          if (hhActiveCalConfig) {
            const startEl = document.getElementById(hhActiveCalConfig.startId);
            const endEl = document.getElementById(hhActiveCalConfig.endId);
            const displayEl = document.getElementById(hhActiveCalConfig.displayId);

            if (startEl) startEl.value = hhTempStart;
            if (endEl) endEl.value = hhTempEnd;

            const combinedInp = document.getElementById('editDateRange');
            if (combinedInp && (hhActiveCalConfig.startId === 'editDateStart' || hhActiveCalConfig.displayId === 'editDateRangeVal')) {
              combinedInp.value = `${hhTempStart} ~ ${hhTempEnd}`;
            }

            if (displayEl) {
              displayEl.textContent = `${hhTempStart} ～ ${hhTempEnd}`;
              displayEl.style.color = '#1e293b';
              displayEl.style.fontWeight = '600';
            }

            if (typeof hhActiveCalConfig.onSelect === 'function') {
              hhActiveCalConfig.onSelect(hhTempStart, hhTempEnd);
            }
          }

          if (tipEl) {
            tipEl.innerHTML = `✅ 已選定區間：<b>${hhTempStart} ～ ${hhTempEnd}</b> (自動儲存並關閉)`;
            tipEl.style.background = '#dcfce7';
            tipEl.style.color = '#166534';
          }
          renderHhCalendar();

          // 核心自動關閉機制
          setTimeout(() => {
            closeHhDateRangePicker();
          }, 260);
        }
      }
    }


    /**
     * 切換危險作業通報的三個步驟
     */

// 全域導出
window.openHhCalendarPopup = openHhCalendarPopup;
window.toggleHhDateRangePicker = toggleHhDateRangePicker;
window.closeHhDateRangePicker = closeHhDateRangePicker;
window.changeHhCalMonth = changeHhCalMonth;
window.clearHhDateRange = clearHhDateRange;
window.renderHhCalendar = renderHhCalendar;
window.selectHhDateCell = selectHhDateCell;
window.hhInclusiveDayCount = hhInclusiveDayCount;
