/* Run with: node scripts/verify_report_flow.cjs. No packages or network required. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname,'..');
const plain = value => JSON.parse(JSON.stringify(value));
const results = [];
function test(name, body) {body();results.push(name);console.log('PASS:',name);}
function session() {
  const elements = new Map(), selectors = new Map(), alerts = [], dialogs = [];
  const element = id => {
    if (!elements.has(id)) elements.set(id,{id,value:'',checked:false,hidden:false,innerHTML:'',textContent:'',dataset:{},isConnected:true,validity:{valid:true},classList:{add(){},remove(){},toggle(){}},focus(){},scrollIntoView(){},setAttribute(){},getAttribute(){return '';},querySelector(){return null;},querySelectorAll(){return []},appendChild(){}});
    return elements.get(id);
  };
  const document = {getElementById:element,querySelector(){return null;},querySelectorAll:selector=>selectors.get(selector)||[]};
  const ctx = vm.createContext({window:{currentRole:'company'},document,console,Blob,TextEncoder,Uint8Array,atob,
    alert:message=>alerts.push(message),confirm:()=>true,setTimeout(){},openHhCalendarPopup(){},clearHhDateRange(){},closeHhDateRangePicker(){},
    closeVDialog(){},renderView(){},openVDialog:options=>dialogs.push(options),renderPortalOfficeLinks(){},getPortalLinks:()=>({toiraUrl:'https://example.test/toira'}),
    HH_ATTACHMENT_MAX_MB:15,HH_ATTACHMENT_MAX_BYTES:15*1048576,hhInclusiveDayCount:()=>5,
    HH_TOIRA_WORK_CATALOG:{operations:{},tasks:{}},portalEscape:value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))});
  for (const file of ['js/modules/report_document.js','js/modules/case_search.js','js/modules/dangerous_report.js','js/modules/risk_assessment.js','js/modules/case_completion.js']) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
  Object.assign(ctx,ctx.window);
  const run = code=>vm.runInContext(code,ctx);
  return {ctx,run,element,selectors,alerts,dialogs};
}
const known = 'RW-115-09001';

test('單筆取消同步更新清單與詳情，並停用重寄',()=>{
  const s=session(), data=s.ctx.DEMO_HAZARD_CASES[known];
  s.ctx.confirm=()=>false;
  assert.equal(s.ctx.cancelHazardCase(known),false);
  assert.equal(data.status,'待確認');
  s.ctx.confirm=()=>true;
  assert.equal(s.ctx.cancelHazardCase(known),true);
  assert.equal(data.status,'取消');
  assert.equal(s.ctx.inspectionCaseCatalog.find(row=>row.id===known).status,'取消');
  assert.ok(data.cancelledAt);
  assert.match(s.ctx.getHazardCompletionActionsHtml(data),/disabled/);
  s.ctx.openHazardCaseDialog('edit',known);
  assert.equal(s.dialogs.length,0);
  assert.match(s.alerts.at(-1),/已取消/);
});

test('管理者不能取消；勞檢須先閱讀；重複標讀不覆寫首次閱讀時間',()=>{
  const s=session();
  s.ctx.window.currentRole='admin';
  assert.equal(s.ctx.cancelHazardCase(known),false);
  s.ctx.window.currentRole='inspection';
  assert.equal(s.ctx.cancelHazardCase(known),false);
  assert.equal(s.ctx.markInspectionCaseRead(known),true);
  const readAt=s.ctx.DEMO_HAZARD_CASES[known].readAt;
  s.ctx.applyInspectionCaseStatus([known],'已備查');
  assert.equal(s.ctx.DEMO_HAZARD_CASES[known].readAt,readAt);
  assert.equal(s.ctx.inspectionCaseCatalog.find(row=>row.id===known).readAt,readAt);
  assert.equal(s.ctx.cancelHazardCase(known),true);
});

test('編輯保留各次通知快照，且快照不遞迴夾帶歷史紀錄',()=>{
  const s=session();
  for (const name of ['validateHhWorkInfo','validateHhWorkSelection','validateHhRiskAssessment','validateHhNotificationEmail']) s.ctx[name]=()=>true;
  const first=s.ctx.ensureHazardCompletionNotice(s.ctx.DEMO_HAZARD_CASES[known]);
  const originalName=first.document.title;
  let name='第二版作業';
  s.ctx.collectHhReportData=()=>({...plain(s.ctx.DEMO_HAZARD_CASES[known]),workName:name});
  s.run(`currentHazardMode='edit';currentHazardCaseNo='${known}';currentHhStep=4;`);
  s.ctx.submitHazardFlow();
  name='第三版作業';
  s.ctx.submitHazardFlow();
  const saved=s.ctx.DEMO_HAZARD_CASES[known];
  assert.equal(saved.completionNotice.version,3);
  assert.deepEqual(plain(saved.completionNoticeHistory.map(notice=>notice.version)),[1,2]);
  assert.equal(saved.completionNoticeHistory[0].document.title,originalName);
  assert.equal(saved.completionNoticeHistory[1].document.title,'第二版作業');
  assert.equal(saved.completionNotice.document.title,'第三版作業');
  assert.equal('completionNoticeHistory' in saved.completionNotice.report,false);
  assert.equal('completionNotice' in saved.completionNotice.report,false);
});

test('編輯期間若案件取消，舊表單不能覆寫案件或建立新通知',()=>{
  const s=session(), data=s.ctx.DEMO_HAZARD_CASES[known];
  s.run(`currentHazardMode='edit';currentHazardCaseNo='${known}';currentHhStep=4;`);
  data.status='取消';
  const before=JSON.stringify(data);
  s.ctx.submitHazardFlow();
  assert.equal(JSON.stringify(data),before);
  assert.match(s.alerts.at(-1),/已取消/);
});

test('不存在的案件編號不能誤開第一筆示範案件',()=>{
  const s=session();
  s.ctx.openHazardCaseDialog('edit','DOES-NOT-EXIST');
  assert.equal(s.dialogs.length,0);
  assert.match(s.alerts.at(-1),/找不到/);
});

test('同一毫秒建立一千個案件編號仍不重複',()=>{
  const s=session();
  s.run('Date.now=()=>1793950000000;');
  const ids=Array.from({length:1000},()=>s.ctx.createHazardCaseNumber());
  assert.equal(new Set(ids).size,1000);
  assert.ok(ids.every(id=>/^RW-\d+-D\d+$/.test(id)));
});

test('取消交付承攬不覆寫通報者名稱，亦不送出隱藏承攬商',()=>{
  const s=session();
  s.element('hhNotifierCompany').value='通報單位甲';
  s.element('hhPrimaryUnit').value='施作單位乙';
  s.element('hhRelation').checked=false;
  s.selectors.set('#hhContractorRows .contractor-input',[{value:'舊承攬商'}]);
  s.ctx.onHhRelationChange();
  assert.equal(s.element('hhNotifierCompany').value,'通報單位甲');
  assert.equal(s.element('hhContractorRows').hidden,true);
  assert.deepEqual(plain(s.ctx.collectHhReportData().contractors),[]);
  const doc=s.ctx.buildHazardReportDocument({relation:'自行作業',contractors:['過時承攬商']});
  assert.deepEqual(plain(doc.sections.find(section=>section.id==='operator').fields.find(field=>field.key==='contractors').values),[]);
});

test('修改附加點位地址仍保留舊有聯絡人、備註與副知資料',()=>{
  const s=session();
  const saved={address:'原地址',gps:'25,121',contact:'王主任',phone:'0900-000-000',workers:'3',note:'第二工區',isCross:true,crossAdmins:['其他機關']};
  s.selectors.set('#hhExtraPointsContainer .extra-point-row',[{dataset:{savedLocation:JSON.stringify(saved)},querySelector:selector=>({value:selector==='.extra-point-desc'?'新地址':'25,121'})}]);
  const actual=s.ctx.collectHhReportData().locations[1];
  assert.deepEqual(plain(actual),{...saved,address:'新地址'});
});

test('人數、承攬商及附加點位改變須重新確認評估，但編輯仍免重勾說明',()=>{
  const s=session();
  s.ctx.restoreHhRiskAssessment({riskAssessment:{mode:'toira',files:['評估.pdf'],toiraAcknowledged:true,toiraReviewed:true}});
  s.ctx.syncHhRiskContext();
  const change=mutate=>{
    s.element('hhRiskContentConfirmed').checked=true;
    s.element('hhToiraReviewed').checked=true;
    mutate();s.ctx.syncHhRiskContext();
    assert.equal(s.element('hhRiskContentConfirmed').checked,false);
    assert.equal(s.element('hhToiraReviewed').checked,false);
    assert.equal(s.element('hhToiraNotice').hidden,true);
    assert.equal(s.element('hhRiskToiraPanel').hidden,false);
  };
  change(()=>s.element('hhWorkerCount').value='20');
  change(()=>{s.element('hhRelation').checked=true;s.selectors.set('#hhContractorRows .contractor-input',[{value:'新增承攬商'}]);});
  change(()=>s.selectors.set('#hhExtraPointsContainer .extra-point-row',[{querySelector:()=>({value:'新增工區'})}]));
  change(()=>s.element('hhNote').value='改變防護條件');
});

test('更換 T-OiRA 評估檔案時撤回舊結果檢視確認',()=>{
  const s=session();
  s.ctx.restoreHhRiskAssessment({riskAssessment:{mode:'toira',files:['原評估.pdf'],toiraReviewed:true}});
  s.element('hhRiskContentConfirmed').checked=true;
  s.ctx.handleHhRiskAssessmentUpload({files:[{name:'新評估.pdf',size:30,lastModified:1}],value:''},'toira');
  assert.equal(s.element('hhToiraReviewed').checked,false);
  assert.equal(s.element('hhRiskContentConfirmed').checked,false);
});

test('日期、期間及危險作業必須有效，且最終送出會重新驗證',()=>{
  const s=session();
  s.element('hhWorkName').value='測試作業';
  s.element('hhStartDate').value='2026-02-30';s.element('hhEndDate').value='2026-03-05';
  s.selectors.set('#hhItemsGroup .sub-items-container input[type="checkbox"]:checked',[{}]);
  assert.equal(s.ctx.validateHhWorkSelection(),false);
  s.element('hhStartDate').value='2026-03-06';assert.equal(s.ctx.validateHhWorkSelection(),false);
  s.element('hhStartDate').value='2026-03-01';assert.equal(s.ctx.validateHhWorkSelection(),true);
  s.selectors.set('#hhItemsGroup .sub-items-container input[type="checkbox"]:checked',[]);
  const count=Object.keys(s.ctx.DEMO_HAZARD_CASES).length;
  s.ctx.validateHhWorkInfo=()=>true;
  let redirected;s.ctx.switchHazardStep=step=>redirected=step;
  s.run("currentHhStep=4;currentHazardMode='add';currentHazardCaseNo='';");
  s.ctx.submitHazardFlow();
  assert.equal(redirected,2);
  assert.equal(Object.keys(s.ctx.DEMO_HAZARD_CASES).length,count);
});

test('作業概況的修改按鈕分別連到名稱期間與地區管轄正確步驟',()=>{
  const s=session(), doc=s.ctx.buildHazardReportDocument({});
  const actions=plain(doc.sections[0].editActions);
  assert.deepEqual(actions,[{step:2,label:'修改名稱／期間'},{step:1,label:'修改地區／管轄'}]);
  const html=s.ctx.renderHazardReportDocument(doc,{review:true});
  assert.match(html,/onclick="switchHazardStep\(1\)" aria-label="修改地區／管轄"/);
});

console.log(`TOTAL: ${results.length} passed checks`);
