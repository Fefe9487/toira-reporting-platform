/* Reporting entrances verified against official agency links on 2026-10-10. */
const PORTAL_CONFIG_KEY = 'hazardPortal.links.v3';
const PORTAL_PREVIOUS_CONFIG_KEY = 'hazardPortal.links.v2';
const PORTAL_LEGACY_CONFIG_KEY = 'hazardPortal.links.v1';
const PORTAL_LINK_DEFAULTS = {
  toiraUrl: 'https://sh168.osha.gov.tw/',
  offices: {
    '新北市政府勞動檢查處': { url: 'https://ilabor.ntpc.gov.tw/cloud/DangerOpNotify', label: '危險性及臨時性作業通報', enabled: true },
    '臺北市勞動檢查處': { url: 'https://service2.lio.gov.taipei/LSIO_F/Home/RoofWork', label: '輕質屋頂、施工架、吊籠暨繩索作業通報', enabled: true, additionalLinks: [
      { url: 'https://service2.lio.gov.taipei/LSIO_F/Home/SmallSpace', label: '局限空間申報' },
      { url: 'https://service2.lio.gov.taipei/LSIO_F/Home/Tower', label: '塔式起重機申報' }
    ] },
    '桃園市政府勞動檢查處': { url: 'https://olidons.tycg.gov.tw/index.aspx?openExternalBrowser=1', label: '危險作業線上通報', enabled: true },
    '臺中市勞動檢查處': { url: 'https://lbms2.taichung.gov.tw/new/Company', label: '事業單位線上申辦（危險作業通報）', enabled: true },
    '臺南市職安健康處': { url: 'https://lsic.tainan.gov.tw/dangerous_job', label: '危險作業線上通報表單', enabled: true },
    '高雄市政府勞工局勞動檢查處': { url: 'https://klsiods.klsio.gov.tw/login', label: '特定作業通報', enabled: true, additionalLinks: [
      { url: 'https://klsiocs.kcg.gov.tw/', label: '局限空間作業申報' }
    ] },
    '國科會新竹科學園區管理局': { url: 'https://saturn.sipa.gov.tw/OSH/index.do', label: '職業安全衛生資訊網（特定作業通報）', enabled: true },
    '國科會南部科學園區管理局': { url: 'https://epark.nstc.gov.tw/S01/login', label: '科學園區廠商服務網（特定作業通報）', enabled: true }
  }
};
// Special reporting entries are separate from the complete jurisdiction directory.
// General reporting sites and agencies without an entrance are not prelisted here.
const PORTAL_LEGACY_HOME_URLS = [
  'https://ilabor.ntpc.gov.tw/', 'https://lio.gov.taipei/', 'https://oli.tycg.gov.tw/',
  'https://www.labor.taichung.gov.tw/', 'https://lsic.tainan.gov.tw/', 'https://klsio.kcg.gov.tw/',
  'https://www.sipa.gov.tw/', 'https://www.ctsp.gov.tw/', 'https://www.stsp.gov.tw/', 'https://www.bip.gov.tw/',
  'https://www.osha.gov.tw/48110/48331/48333/48341/51482/'
];
function portalEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function portalSafeUrl(value) {
  try { const u = new URL(String(value || '').trim()); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password ? u.href : ''; }
  catch { return ''; }
}
function portalCleanOffice(item, defaultItem = {url:'',label:'通報入口'}) {
  const url = portalSafeUrl(item.url);
  return {
    url, label: String(item.label || (url === defaultItem.url ? defaultItem.label : '通報入口')).slice(0,100),
    enabled: item.enabled === true,
    additionalLinks: (Array.isArray(item.additionalLinks) ? item.additionalLinks : []).filter(link => link && portalSafeUrl(link.url)).map(link => ({url:portalSafeUrl(link.url), label:String(link.label || '其他通報入口').slice(0,100)}))
  };
}
function getPortalLinks() {
  const config = structuredClone(PORTAL_LINK_DEFAULTS);
  try {
    const currentRaw = localStorage.getItem(PORTAL_CONFIG_KEY);
    const previousRaw = currentRaw ? null : localStorage.getItem(PORTAL_PREVIOUS_CONFIG_KEY);
    const saved = JSON.parse(currentRaw || previousRaw || localStorage.getItem(PORTAL_LEGACY_CONFIG_KEY) || 'null');
    const legacy = !currentRaw && !previousRaw;
    if (saved && portalSafeUrl(saved.toiraUrl)) config.toiraUrl = portalSafeUrl(saved.toiraUrl);
    if (!saved || !saved.offices || typeof saved.offices !== 'object' || Array.isArray(saved.offices)) return config;
    // v3 is an explicit list: removed entries and an empty list stay removed on reload.
    config.offices = {};
    for (const unit of ALL_ADMIN_UNITS_LIST) {
      const item = saved?.offices?.[unit];
      if (!item || typeof item !== 'object') continue;
      const defaultItem = PORTAL_LINK_DEFAULTS.offices[unit];
      if (legacy && PORTAL_LEGACY_HOME_URLS.includes(portalSafeUrl(item.url))) {
        if (defaultItem && item.enabled === true) config.offices[unit] = structuredClone(defaultItem);
        continue;
      }
      const cleaned = portalCleanOffice(item, defaultItem);
      if (!cleaned.url) continue;
      if (!currentRaw && cleaned.url === 'https://dons.osha.gov.tw/') continue;
      config.offices[unit] = cleaned;
    }
  } catch { /* Use official defaults when storage is unavailable or malformed. */ }
  return config;
}
function renderPortalOfficeLinks(containerId = 'hhOfficeLinks') {
  const el = document.getElementById(containerId);
  if (!el) return;
  const config = getPortalLinks();
  const selected = document.getElementById('hhAdminUnit')?.value;
  const units = ALL_ADMIN_UNITS_LIST.filter(unit => config.offices[unit]?.enabled && portalSafeUrl(config.offices[unit]?.url));
  units.sort((a,b) => Number(b === selected) - Number(a === selected));
  const links = units.flatMap(unit => {
    const item = config.offices[unit];
    return [{unit,url:item.url,label:item.label}, ...(item.additionalLinks || []).map(link => ({unit,...link}))];
  });
  el.innerHTML = links.length ? links.map(link => `<a class="office-link ${link.unit === selected ? 'office-link-current' : ''}" href="${portalEscape(link.url)}" target="_blank" rel="noopener noreferrer"><span class="office-link-copy"><strong>${portalEscape(link.unit)}</strong><small>${portalEscape(link.label)}</small></span>${link.unit === selected ? '<span class="office-current-tag">所屬機構</span>' : ''}<span aria-hidden="true">↗</span><span class="sr-only">（另開新分頁）</span></a>`).join('') : '<p class="portal-muted">尚未設定相關網站，請洽所在地區勞動檢查機構。</p>';
}
function refreshPortalLinks() {
  renderPortalOfficeLinks('hhOfficeLinks');
  const toiraUrl = getPortalLinks().toiraUrl;
  document.querySelectorAll('[data-toira-link]').forEach(a => { a.href = toiraUrl; });
}
window.addEventListener('DOMContentLoaded', refreshPortalLinks);
window.addEventListener('storage', event => { if ([PORTAL_CONFIG_KEY,PORTAL_PREVIOUS_CONFIG_KEY,PORTAL_LEGACY_CONFIG_KEY].includes(event.key) || event.key === null) refreshPortalLinks(); });
