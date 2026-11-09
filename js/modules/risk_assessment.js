/* Step 3: risk assessment choice, evidence, content guidance and review. */
let hhRiskMode = 'upload';
let hhRiskContext = '';
let hhRiskFiles = { upload: [], toira: [] };
let hhRiskEditingExisting = false;
// Enable only after the T-OiRA service confirms that record numbers are provided.
const HH_TOIRA_REFERENCE_ENABLED = false;
const HH_TOIRA_USAGE_CHECKS = [
  ['scope', '適用範圍', 'T-OiRA 主要供員工規模 100 人以下的中小企業進行初步風險評估。危險性工作場所的申請、定期評估或製程修改，或一定規模以上之事業單位，不適用本輔助工具；應依法採用正式評估方法，並由具專業能力人員執行完整、系統化評估。'],
  ['auxiliary', '僅為輔助工具', '評估結果依使用者輸入產生，不能取代現場調查、專業判斷或法定的正式風險評估。'],
  ['employer', '雇主責任不因使用而免除', '雇主仍須依法負職業安全衛生責任，不能因使用 T-OiRA 而獲得減免。'],
  ['site', '應依現場實況修正', '請依實際設備、作業條件、人員配置及防護措施，主動確認並修正評估內容。']
];
const HH_RISK_CONTENT = [
  ['operations', '辨識所有作業', '說明作業內容、方式、步驟及作業間的相互影響'],
  ['hazards', '辨識危害及後果', '例如墜落、崩塌、火災、爆炸、缺氧、中毒或溺水及其可能後果'],
  ['existing', '確認現有防護設施', '現場已有的設備、防護設施與管理措施'],
  ['analysis', '評估危害的風險', '說明可能性、嚴重度、風險等級及判定依據'],
  ['controls', '決定處理風險與機會之措施', '需新增或改善的設備與措施、負責人及完成時點'],
  ['residual', '確認採取措施後的殘餘風險', '措施完成後的風險、可接受性與持續追蹤方式']
];
function getHhRiskStepHtml() {
  return `<div id="hhStep3Pane" class="step-pane">
    <div class="dispatch-tip"><strong>第三步：實施風險評估</strong><br>依實際作業內容與現場條件完成評估，確認防護措施後再通報。請選擇以下其中一種方式。</div>
    <fieldset class="risk-choice-group"><legend class="sr-only">風險評估方式（擇一）</legend>
      <label class="risk-choice selected" id="hhRiskChoiceUpload"><input type="radio" name="hhRiskMethod" value="upload" checked onchange="setHhRiskMode('upload')"><span><strong>自行上傳風險評估資料</strong><small>已有評估結果或佐證資料，直接附上檔案。</small></span></label>
      <label class="risk-choice" id="hhRiskChoiceToira"><input type="radio" name="hhRiskMethod" value="toira" onchange="setHhRiskMode('toira')"><span><strong>使用 T-OiRA 線上互動式風險評估</strong><small>使用線上工具完成評估，再回到本平台附上結果。</small></span></label>
    </fieldset>
    <section id="hhToiraNotice" class="toira-usage-notice" aria-labelledby="hhToiraNoticeTitle" hidden>
      <h4 id="hhToiraNoticeTitle"><span aria-hidden="true">⚠</span> 使用 T-OiRA 前，請確認適用範圍與法律責任</h4>
      <p id="hhToiraNoticeHelp">請逐項閱讀並勾選確認；下列 ${HH_TOIRA_USAGE_CHECKS.length} 項皆須勾選，才能前往工具進行評估。勾選「適用範圍」表示確認本次使用符合該範圍。</p>
      <fieldset id="hhToiraNoticeTerms" class="toira-usage-checklist"><legend class="sr-only">T-OiRA 使用前檢核表（${HH_TOIRA_USAGE_CHECKS.length} 項皆須勾選）</legend>
        ${HH_TOIRA_USAGE_CHECKS.map(([id, title, description]) => `<label class="toira-usage-check"><input type="checkbox" id="hhToiraCheck-${id}" name="hhToiraCheck" value="${id}" aria-describedby="hhToiraNoticeHelp" aria-controls="hhToiraRecommendations hhRiskToiraPanel" onchange="updateHhToiraAcknowledgement()"><span><strong>${title}：</strong>${description}</span></label>`).join('')}
      </fieldset>
      <p id="hhToiraChecklistStatus" class="toira-checklist-status" role="status" aria-live="polite" aria-atomic="true">已確認 0 / ${HH_TOIRA_USAGE_CHECKS.length} 項，請完成全部檢核。</p>
    </section>
    <section id="hhToiraRecommendations" class="toira-recommendations" aria-labelledby="hhToiraRecommendationsTitle" hidden></section>
    <section id="hhRiskUploadPanel" class="risk-evidence-panel" aria-label="自行上傳評估資料">
      <h4>上傳已完成的評估資料 <span class="form-req">*</span></h4><p>請附上本次各項危險作業的風險評估結果或相關佐證資料。</p>
      <input class="risk-file-input" type="file" id="hhRiskAssessmentInput" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onchange="handleHhRiskAssessmentUpload(this,'upload')" aria-label="選擇風險評估資料" aria-describedby="hhRiskFileHelp">
      <small id="hhRiskFileHelp">支援 PDF、Word、Excel、JPG、PNG；每個檔案上限 ${HH_ATTACHMENT_MAX_MB} MB。</small>
      <div id="hhRiskAssessmentList" class="risk-file-list" aria-live="polite"></div>
    </section>
    <section id="hhRiskToiraPanel" class="risk-evidence-panel" aria-label="T-OiRA 線上互動式風險評估" hidden>
      <h4>T-OiRA 線上互動式風險評估</h4>
      <ol class="toira-instructions"><li>前往 T-OiRA，依實際作業情境填寫風險評估。</li><li>檢視並修正結果，確認符合現場條件與必要防護措施。</li><li>下載評估結果，回到本頁上傳，完成通報。</li></ol>
      <a class="v-btn v-btn-primary toira-link" data-toira-link href="${portalEscape(getPortalLinks().toiraUrl)}" target="_blank" rel="noopener noreferrer">前往 T-OiRA 線上互動式風險評估 ↗<span class="sr-only">（另開新分頁）</span></a>
      <label class="risk-confirm"><input type="checkbox" id="hhToiraReviewed">我已完成 T-OiRA 評估，並依實際現場情況檢視、修正結果。</label>
      ${HH_TOIRA_REFERENCE_ENABLED ? '<label for="hhToiraReference">評估紀錄編號（選填）</label><input class="search-input" id="hhToiraReference" maxlength="100" placeholder="如工具有提供紀錄編號，可填寫於此">' : ''}
      <label class="risk-upload-label" for="hhToiraAssessmentInput">上傳 T-OiRA 評估結果 <span class="form-req">*</span></label>
      <input class="risk-file-input" type="file" id="hhToiraAssessmentInput" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onchange="handleHhRiskAssessmentUpload(this,'toira')" aria-describedby="hhToiraFileHelp">
      <small id="hhToiraFileHelp">支援 PDF、Word、Excel、JPG、PNG；每個檔案上限 ${HH_ATTACHMENT_MAX_MB} MB。</small>
      <div id="hhToiraAssessmentList" class="risk-file-list" aria-live="polite"></div>
    </section>
    <p id="hhRiskUploadStatus" class="risk-upload-status" role="status"></p>
    <p id="hhRiskError" class="flow-error" role="alert" tabindex="-1" hidden></p>
    <details class="risk-content-details"><summary>風險評估內容說明 <span>評估資料應涵蓋以下六項內容</span></summary>
      <p>請在自行上傳的評估資料或 T-OiRA 評估結果中涵蓋以下內容。涉及多項危險作業時，應分別評估，並確認作業間的相互影響。</p>
      <ol class="risk-content-list" id="hhRiskContentGuide">${HH_RISK_CONTENT.map(([,label,description],i) => `<li><span class="risk-content-number" aria-hidden="true">${i+1}</span><div><h5>${label}</h5><p>${description}</p></div></li>`).join('')}</ol>
    </details>
    <label class="risk-confirm"><input type="checkbox" id="hhRiskContentConfirmed" aria-describedby="hhRiskContentGuide">我確認評估資料涵蓋上述六項內容及本次各項危險作業，並將於作業前落實必要的預防設備與措施。</label>
    <p class="risk-retention-note">評估結果等紀錄或文件應留存三年；作業內容、方式或現場條件變更而影響評估結果時，應重新評估並修正措施。</p>
    <div class="hazard-step-actions"><button type="button" class="v-btn v-btn-cancel" onclick="switchHazardStep(2)">上一步：選擇危險作業</button><button type="button" class="v-btn v-btn-primary" onclick="switchHazardStep(4)">下一步：確認通報資料 →</button></div>
  </div>`;
}
function resetHhRiskAssessment() { hhRiskContext = ''; hhRiskMode = 'upload'; hhRiskFiles = { upload: [], toira: [] }; hhRiskEditingExisting = false; }
function setHhRiskMode(mode) {
  if (!['upload','toira'].includes(mode)) return;
  const changed = hhRiskMode !== mode;
  hhRiskMode = mode;
  if (changed) {
    document.getElementById('hhRiskContentConfirmed').checked = false;
    if (!hhRiskEditingExisting) resetHhToiraUsageChecks();
    document.getElementById('hhToiraReviewed').checked = false;
  }
  document.getElementById('hhRiskUploadPanel').hidden = mode !== 'upload';
  syncHhToiraAccess();
  document.getElementById('hhRiskChoiceUpload').classList.toggle('selected',mode === 'upload');
  document.getElementById('hhRiskChoiceToira').classList.toggle('selected',mode === 'toira');
  document.querySelectorAll('[name="hhRiskMethod"]').forEach(r => {r.checked = r.value === mode;});
  document.getElementById('hhRiskError').hidden = true;
  document.getElementById('hhRiskUploadStatus').textContent = '';
}
function getHhToiraUsageChecks() {
  return Object.fromEntries(HH_TOIRA_USAGE_CHECKS.map(([id]) => [id, document.getElementById('hhToiraCheck-' + id)?.checked === true]));
}
function isHhToiraAcknowledged() {
  return Object.values(getHhToiraUsageChecks()).every(Boolean);
}
function resetHhToiraUsageChecks() {
  HH_TOIRA_USAGE_CHECKS.forEach(([id]) => { document.getElementById('hhToiraCheck-' + id).checked = false; });
}
function syncHhToiraAccess() {
  const checks = Object.values(getHhToiraUsageChecks());
  const confirmed = checks.filter(Boolean).length;
  const allowed = hhRiskMode === 'toira' && (hhRiskEditingExisting || isHhToiraAcknowledged());
  document.getElementById('hhToiraNotice').hidden = hhRiskMode !== 'toira' || hhRiskEditingExisting;
  document.getElementById('hhToiraRecommendations').hidden = !allowed;
  document.getElementById('hhRiskToiraPanel').hidden = !allowed;
  document.getElementById('hhToiraChecklistStatus').textContent = '已確認 ' + confirmed + ' / ' + checks.length + ' 項，' + (allowed ? '可前往 T-OiRA 進行評估。' : '請完成全部檢核。');
}
function updateHhToiraAcknowledgement() {
  syncHhToiraAccess();
  if (!isHhToiraAcknowledged()) {
    document.getElementById('hhToiraReviewed').checked = false;
    document.getElementById('hhRiskContentConfirmed').checked = false;
  }
  document.getElementById('hhRiskError').hidden = true;
}
function renderHhRiskFiles(mode) {
  const list = document.getElementById(mode === 'toira' ? 'hhToiraAssessmentList' : 'hhRiskAssessmentList');
  if (!list) return;
  list.innerHTML = hhRiskFiles[mode].length ? hhRiskFiles[mode].map((item,index) => `<div class="hh-risk-item"><span class="risk-file-description"><span aria-hidden="true">📄</span><span class="hh-risk-name">${portalEscape(item.name)}</span><small>${item.file ? (item.file.size / 1048576).toFixed(1) + ' MB' : '原案件附件'}</small></span><button type="button" class="risk-file-remove" onclick="removeHhRiskFile('${mode}',${index})" aria-label="移除 ${portalEscape(item.name)}">移除</button></div>`).join('') : '<p class="risk-empty">尚未加入評估資料，請選擇檔案。</p>';
}
function removeHhRiskFile(mode,index) { hhRiskFiles[mode].splice(index,1); document.getElementById('hhRiskContentConfirmed').checked = false; if (mode === 'toira') document.getElementById('hhToiraReviewed').checked = false; renderHhRiskFiles(mode); }
function handleHhRiskAssessmentUpload(input, mode = 'upload') {
  const files = Array.from(input.files || []);
  const rejected = [];
  let added = 0;
  for (const file of files) {
    if (!/\.(pdf|docx?|xlsx?|jpe?g|png)$/i.test(file.name)) { rejected.push(file.name + '：檔案格式不支援'); continue; }
    if (file.size > HH_ATTACHMENT_MAX_BYTES) { rejected.push(file.name + '：超過 ' + HH_ATTACHMENT_MAX_MB + ' MB'); continue; }
    if (!file.size) { rejected.push(file.name + '：檔案內容為空'); continue; }
    if (hhRiskFiles[mode].some(item => item.name === file.name && item.file?.size === file.size && item.file?.lastModified === file.lastModified)) { rejected.push(file.name + '：已在清單中'); continue; }
    hhRiskFiles[mode].push({name:file.name, file}); added++;
  }
  renderHhRiskFiles(mode);
  if (added) { document.getElementById('hhRiskContentConfirmed').checked = false; if (mode === 'toira') document.getElementById('hhToiraReviewed').checked = false; document.getElementById('hhRiskError').hidden = true; }
  const status = document.getElementById('hhRiskUploadStatus');
  status.textContent = [added ? '已加入 ' + added + ' 個檔案。' : '', ...rejected].filter(Boolean).join(' ');
  status.classList.toggle('has-error', rejected.length > 0);
  input.value = '';
}
function validateHhRiskAssessment() {
  let message = '', focusId = '';
  if (hhRiskMode === 'toira' && !hhRiskEditingExisting && !isHhToiraAcknowledged()) { message = '請逐項勾選確認 T-OiRA 的適用範圍、使用限制及法律責任；不符合適用範圍時，請改用自行上傳風險評估資料。'; focusId = 'hhToiraCheck-' + HH_TOIRA_USAGE_CHECKS.find(([id]) => !document.getElementById('hhToiraCheck-' + id)?.checked)[0]; }
  else if (!hhRiskFiles[hhRiskMode].length) { message = hhRiskMode === 'toira' ? '請先完成 T-OiRA 評估，並上傳評估結果。' : '請上傳本次風險評估結果或相關佐證資料。'; focusId = hhRiskMode === 'toira' ? 'hhToiraAssessmentInput' : 'hhRiskAssessmentInput'; }
  else if (hhRiskMode === 'toira' && !document.getElementById('hhToiraReviewed').checked) { message = '請確認已依實際現場情況檢視、修正 T-OiRA 評估結果。'; focusId = 'hhToiraReviewed'; }
  else if (!document.getElementById('hhRiskContentConfirmed').checked) { message = '請確認評估資料涵蓋六項內容及各項作業，並於作業前落實預防設備與措施。'; focusId = 'hhRiskContentConfirmed'; }
  const error = document.getElementById('hhRiskError');
  error.hidden = !message;
  error.textContent = message;
  if (message) {
    error.scrollIntoView({block:'nearest'});
    const field = document.getElementById(focusId);
    if (field) field.setAttribute('aria-describedby', [...new Set((field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean).concat('hhRiskError'))].join(' '));
    field?.focus({preventScroll:true});
  }
  return !message;
}
function getHhRiskAssessmentData() {
  const data = { mode:hhRiskMode, files:hhRiskFiles[hhRiskMode].map(item => item.name), contentConfirmed:document.getElementById('hhRiskContentConfirmed')?.checked, toiraReviewed:document.getElementById('hhToiraReviewed')?.checked };
  if (hhRiskMode === 'toira') { data.toiraUsageChecks = getHhToiraUsageChecks(); data.toiraAcknowledged = isHhToiraAcknowledged(); }
  if (HH_TOIRA_REFERENCE_ENABLED && hhRiskMode === 'toira') data.reference = document.getElementById('hhToiraReference')?.value.trim() || '';
  return data;
}
function renderHhRiskSummary() {
  const el = document.getElementById('hhRiskSummaryContainer');
  if (!el) return;
  const data = getHhRiskAssessmentData();
  el.innerHTML = `<dl class="hh-review-grid"><div class="hh-review-field"><dt>評估方式</dt><dd>${data.mode === 'toira' ? 'T-OiRA 線上互動式風險評估' : '自行上傳風險評估資料'}</dd></div>${HH_TOIRA_REFERENCE_ENABLED && data.reference ? '<div class="hh-review-field"><dt>評估紀錄編號</dt><dd>' + portalEscape(data.reference) + '</dd></div>' : ''}<div class="hh-review-field hh-review-wide"><dt>評估資料</dt><dd><ul>${data.files.map(name => '<li>' + portalEscape(name) + '</li>').join('')}</ul></dd></div><div class="hh-review-field hh-review-wide"><dt>確認內容</dt><dd>已確認評估內容與作業前防護措施</dd></div></dl>`;
}
function restoreHhRiskAssessment(data) {
  resetHhRiskAssessment();
  hhRiskEditingExisting = true;
  const assessment = data.riskAssessment || {};
  const mode = assessment.mode === 'toira' ? 'toira' : 'upload';
  hhRiskFiles[mode] = (assessment.files || data.riskFiles || []).map(name => ({name}));
  setHhRiskMode(mode);
  // Existing cases skip the notice; retain saved acknowledgements without inventing new ones.
  HH_TOIRA_USAGE_CHECKS.forEach(([id]) => {
    document.getElementById('hhToiraCheck-' + id).checked = assessment.toiraUsageChecks
      ? assessment.toiraUsageChecks[id] === true
      : assessment.toiraAcknowledged === true;
  });
  syncHhToiraAccess();
  renderHhRiskFiles('upload'); renderHhRiskFiles('toira');
  if (HH_TOIRA_REFERENCE_ENABLED && document.getElementById('hhToiraReference')) document.getElementById('hhToiraReference').value = assessment.reference || '';
  document.getElementById('hhToiraReviewed').checked = !!assessment.toiraReviewed;
  // Require renewed confirmation when editing an existing report.
  document.getElementById('hhRiskContentConfirmed').checked = false;
}
function updateHhPeriodReminder() {
  const note = document.getElementById('hhPeriodReminder');
  if (!note) return;
  note.hidden = hhInclusiveDayCount(document.getElementById('hhStartDate')?.value,document.getElementById('hhEndDate')?.value) <= 14;
}

function syncHhRiskContext() {
  const fields = ['hhWorkName','hhStartDate','hhEndDate','hhCitySelect','hhDistSelect','hhEngineeringAddress','hhEngineeringGps','hhPrimaryUnit','hhAdminUnit','hhWorkerCount','hhContact','hhPhone','hhNote','hhPark'];
  const hasContractors = document.getElementById('hhRelation')?.checked === true;
  const extraPoints = [...document.querySelectorAll('#hhExtraPointsContainer .extra-point-row')].map(row=>[row.querySelector('.extra-point-desc')?.value.trim(),row.querySelector('.extra-point-gps')?.value.trim()]);
  const contractors = hasContractors ? [...document.querySelectorAll('#hhContractorRows .contractor-input')].map(input=>input.value.trim()) : [];
  const context = JSON.stringify([fields.map(id=>document.getElementById(id)?.value),hasContractors,contractors,document.getElementById('hhInPark')?.checked,document.getElementById('hhCrossCheck')?.checked,[...document.querySelectorAll('.cross-admin-cb:checked')].map(cb=>cb.value),extraPoints,[...document.querySelectorAll('#hhItemsGroup .sub-items-container input:checked')].map(cb=>cb.closest('label').textContent.trim())]);
  if (hhRiskContext && hhRiskContext !== context) {
    document.getElementById('hhRiskContentConfirmed').checked = false;
    document.getElementById('hhToiraReviewed').checked = false;
    if (!hhRiskEditingExisting) resetHhToiraUsageChecks();
    syncHhToiraAccess();
    const status = document.getElementById('hhRiskUploadStatus');
    status.textContent = '作業內容、現場條件或人員配置已有變更，請重新確認評估資料是否符合本次作業。';
    status.classList.add('has-error');
  }
  hhRiskContext = context;
  renderHhToiraRecommendations();
}


// Recommendations are guidance derived from current selections, never extra required form fields.
function getHhToiraRecommendations(workIds) {
  const references = new Map();
  for (const workId of new Set(workIds)) {
    const work = HH_TOIRA_WORK_CATALOG.operations[workId];
    if (!work) continue;
    for (const assessmentId of work.assessmentIds) {
      const task = HH_TOIRA_WORK_CATALOG.tasks[assessmentId];
      if (!task) continue;
      if (!references.has(assessmentId)) {
        references.set(assessmentId, { assessmentId, title: task.title, works: [] });
      }
      references.get(assessmentId).works.push(work.label);
      if (work.context) references.get(assessmentId).context = work.context;
    }
  }
  return [...references.values()];
}

function renderHhToiraRecommendations() {
  const host = document.getElementById('hhToiraRecommendations');
  if (!host) return;
  const selected = [...document.querySelectorAll('#hhItemsGroup .sub-items-container input:checked')];
  const recommendations = getHhToiraRecommendations(selected.map(cb => cb.dataset.workId));
  const unmapped = selected.filter(cb => !HH_TOIRA_WORK_CATALOG.operations[cb.dataset.workId]);
  const rows = recommendations.map(item => `<tr><td><strong>${portalEscape(item.title)}</strong></td><td>${item.context ? '<p class="toira-work-context">' + portalEscape(item.context) + '</p>' : ''}${item.works.map(portalEscape).join('<br>')}</td></tr>`).join('');
  host.innerHTML = `
    <div class="toira-recommendations-heading"><h4 id="hhToiraRecommendationsTitle">本次作業可參考的 T-OiRA 評估項目</h4><span>${selected.length} 項通報作業 · ${recommendations.length} 項評估</span></div>
    <p>依第二步勾選的作業列出。前往 T-OiRA 後，可在「資料庫查詢」搜尋下列名稱，依實際作業條件調整評估內容。</p>
    ${rows ? `<table class="toira-recommendations-table"><caption class="sr-only">本次通報作業與 T-OiRA 評估項目對照</caption><thead><tr><th scope="col">T-OiRA 評估項目</th><th scope="col">對應本次通報作業</th></tr></thead><tbody>${rows}</tbody></table>` : '<p class="toira-recommendations-empty">尚無對應評估項目，可前往 T-OiRA 查詢或自行準備評估資料。</p>'}
    ${unmapped.length ? '<p class="toira-recommendations-unmapped">以下作業尚無對應項目，請依現場情境查詢 T-OiRA 或自行評估：' + unmapped.map(cb => portalEscape(cb.closest('label').textContent.trim())).join('；') + '</p>' : ''}
    <div class="toira-recommendations-footer"><p>同一評估項目合併列出；評估仍應涵蓋各項作業及作業間的相互影響。</p><a data-toira-link href="${portalEscape(getPortalLinks().toiraUrl)}" target="_blank" rel="noopener noreferrer">前往 T-OiRA 查找評估項目 ↗<span class="sr-only">（另開新分頁）</span></a></div>`;
}
