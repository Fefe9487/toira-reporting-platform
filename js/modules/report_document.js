/* One report document for final review, case viewing and the notification PDF. */
function getHazardReportFilename(caseNo, version = 1) {
  return `${caseNo || '待編號'}_危險作業通報資料_第${version}版_展示.pdf`;
}

function buildHazardReportDocument(data, version = 1) {
  const text = (value, empty = '未提供') => String(value ?? '').trim() || empty;
  const list = value => Array.isArray(value) ? value.map(item => String(item).trim()).filter(Boolean) : [];
  const field = (key, label, value, wide = false) => ({key, label, value: text(value), wide});
  const items = (key, label, values, empty = '無') => ({key, label, values: list(values), empty, wide: true});
  const section = (id, title, step, fields) => ({id, title, step, fields});
  const main = data.locations?.[0] || {};
  const risk = data.riskAssessment || {};
  const scale = data.caseType === 'scale' || Array.isArray(data.scaleItems);
  const riskFiles = Array.isArray(risk.files) ? risk.files : (data.riskFiles || []);
  const filename = getHazardReportFilename(data.caseNo, version);
  const confirmed = value => value === true ? '已確認' : value === false ? '尚未確認' : '原案件未記錄';
  const sections = [
    section('overview', '作業概況', 2, [
      field('workName', '作業名稱', data.workName, true),
      field('caseType', '通報類型', scale ? '一定規模以上營造業通報' : '危險作業通報'),
      field('workPeriod', '預期作業期間', `${text(data.startDate)} ～ ${text(data.endDate)}`),
      field('region', '作業縣市／鄉鎮市區', [data.city, data.dist].filter(Boolean).join(' ')),
      field('adminOffice', '所屬勞動檢查單位', data.adminOffice),
      field('industrialPark', '產業園區', text(data.industrialPark, '否'), true)
    ]),
    section('notifier', '通報者資訊', 1, [
      field('notifierCompany', '事業單位名稱', data.notifierCompany, true),
      field('notifierName', '通報人（職稱）', data.notifierName),
      field('notifierPhone', '聯絡電話', data.notifierPhone),
      field('relation', '是否交付承攬', data.relation === '交付承攬' ? '是' : '否')
    ]),
    section('operator', '作業者資訊', 1, [
      field('contractorUnit', '實際作業者事業單位', data.contractorUnit, true),
      items('contractors', '承攬商', data.relation === '交付承攬' ? data.contractors : [], '無承攬商（作業單位自辦）'),
      field('contractorTaxId', '統一編號', text(data.contractorTaxId, '無統編／自營')),
      field('contact', '工作場所負責人', main.contact),
      field('phone', '聯絡電話', main.phone),
      field('workers', '作業人數', main.workers ? `${main.workers} 人` : '未提供'),
      field('note', '備註', text(main.note, '無'), true)
    ])
  ];
  sections[0].editActions = [{step:2,label:'修改名稱／期間'},{step:1,label:'修改地區／管轄'}];
  if (scale) sections.push(section('construction', '營造工程資訊', 1, [
    field('reportKind', '通報種類', data.reportKind === 'major' ? '重大變更' : '新增通報'),
    field('buildingPermit', '建造執照', data.buildingPermit),
    field('siteAddress', '工程地號／地址', data.siteAddress, true)
  ]));
  const locations = data.locations?.length ? data.locations : [{}];
  const locationFields = locations.flatMap((location, index) => {
    const prefix = index ? `附加點位 ${index}` : '主要作業地點';
    const fields = [
      field(`location-${index}-address`, prefix + '／地址', location.address, true),
      field(`location-${index}-gps`, prefix + '／GPS', location.gps, true)
    ];
    if (index && location.contact) fields.push(field(`location-${index}-contact`, prefix + '／聯絡人', location.contact));
    if (index && location.phone) fields.push(field(`location-${index}-phone`, prefix + '／電話', location.phone));
    if (index && location.workers) fields.push(field(`location-${index}-workers`, prefix + '／人數', `${location.workers} 人`));
    if (index && location.note) fields.push(field(`location-${index}-note`, prefix + '／備註', location.note, true));
    if (!index || location.isCross || list(location.crossAdmins).length) fields.push(items(`location-${index}-crossAdmins`, index ? prefix + '／副知機關' : '跨轄區副知機關', location.isCross ? location.crossAdmins : [], location.isCross ? '已勾選跨轄區，未指定副知機關' : '無（非跨轄區）'));
    return fields;
  });
  sections.push(section('locations', '作業位置', 1, locationFields));
  sections.push(section('work-items', '危險作業項目', 2, [
    items('categories', '危害類別', data.categories, '未提供'),
    items('subItems', '完整通報項目', scale ? data.scaleItems : data.subItems, '未提供通報項目')
  ]));
  const riskFields = [
    field('riskMode', '風險評估方式', risk.mode === 'toira' ? 'T-OiRA 線上互動式風險評估' : risk.mode === 'upload' || riskFiles.length ? '自行上傳風險評估資料' : '未提供', true),
    items('riskFiles', '風險評估檔案', riskFiles, '未提供評估檔案'),
    field('riskContentConfirmed', '評估內容與防護措施', confirmed(risk.contentConfirmed), true)
  ];
  if (risk.mode === 'toira') riskFields.push(field('toiraReviewed', 'T-OiRA 結果檢視與修正', confirmed(risk.toiraReviewed), true));
  if (risk.reference) riskFields.push(field('riskReference', '評估紀錄編號', risk.reference, true));
  sections.push(section('risk', '風險評估資料', 3, riskFields));
  sections.push(section('attachments', '一般附件', 1, [items('attachments', '檔案清單', data.attachments, '無一般附件')]));
  sections.push(section('notification', '通報完成通知', null, [
    {...field('notificationEmail', '收件電子郵件', data.email, true), editableEmail: true},
    items('mailFiles', '隨信寄送檔案', [filename]),
    field('mailFileContents', 'PDF 內容', '本頁通報資料、完整作業項目、風險評估與一般附件清單。', true),
    field('originalFilePolicy', '原始檔案', '風險評估及一般佐證原始檔留存平台，登入後依權限查閱，不另夾入通知信。', true)
  ]));
  return {schemaVersion: 1, caseNo: text(data.caseNo, '送出前預覽'), version, title: text(data.workName, '通報資料'), sections, mailFiles: [{filename, format: 'PDF'}]};
}

function renderHazardReportDocument(doc, options = {}) {
  const esc = portalEscape;
  return `<div class="report-document" data-report-case="${esc(doc.caseNo)}">
    <div class="report-overview"><div><span class="report-kicker">${options.review ? '送出前最後確認' : '通報資料'}</span><h3>${esc(doc.title)}</h3></div><div class="report-document-id"><span>${esc(doc.caseNo)}</span><span>第 ${doc.version} 版</span></div></div>
    ${doc.sections.map((section, index) => `<section class="report-section" data-report-section="${section.id}" aria-labelledby="report-section-${section.id}">
      <div class="report-section-heading"><h4 id="report-section-${section.id}"><span aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>${esc(section.title)}</h4>${options.review && section.step ? `<div class="report-edit-actions">${(section.editActions || [{step:section.step,label:'修改',ariaLabel:'修改'+section.title}]).map(action=>`<button type="button" class="report-edit-link" onclick="switchHazardStep(${action.step})" aria-label="${esc(action.ariaLabel || action.label)}">${esc(action.label)}<span aria-hidden="true"> ↗</span></button>`).join('')}</div>` : ''}</div>
      <dl class="report-fields">${section.fields.map(field => {
        let value = field.values ? (field.values.length ? `<ul class="report-value-list">${field.values.map(item => `<li>${esc(item)}</li>`).join('')}</ul>` : `<span class="report-empty">${esc(field.empty)}</span>`) : `<span class="report-text-value">${esc(field.value)}</span>`;
        if (options.review && field.editableEmail) value = `<input type="email" id="hhNotificationEmail" class="search-input" value="${esc(options.email || '')}" required maxlength="254" autocomplete="email" aria-describedby="hhNotificationEmailHelp hhNotificationEmailError" oninput="document.getElementById('hhNotificationEmailError').hidden=true; this.removeAttribute('aria-invalid')"><p class="report-field-help" id="hhNotificationEmailHelp">預設帳戶信箱，可修改本次通知地址。</p><p class="flow-error" id="hhNotificationEmailError" role="alert" hidden></p>`;
        if (options.review && field.key === 'mailFiles') value += '<button type="button" class="report-pdf-preview" onclick="downloadHazardReviewPdf(this)">預覽隨信 PDF ↓</button><p id="hhReviewPdfStatus" class="report-field-help" role="status"></p>';
        return `<div class="report-field${field.wide ? ' report-field-wide' : ''}" data-report-field="${field.key}"><dt>${options.review && field.editableEmail ? '<label for="hhNotificationEmail">' + esc(field.label) + ' <span class="form-req">*</span></label>' : esc(field.label)}</dt><dd>${value}</dd></div>`;
      }).join('')}</dl>
    </section>`).join('')}
  </div>`;
}
