// 署內附件容量規定；所有通報附件上傳入口共用每檔 15 MB 上限。
const HH_ATTACHMENT_MAX_MB = 15;
const HH_ATTACHMENT_MAX_BYTES = HH_ATTACHMENT_MAX_MB * 1048576;

/* =========================================================
 * geo_data.js - 縣市鄉鎮勞檢機構行政區對應表及地理位置工具
 * ========================================================= */
/* =========================================================
     * 危險作業線上通報：三階段流程實作 (第一步與第二步交換，第三步維持)
     * 參考來源：C:\Users\A4052\Downloads\2026_hwri擴充\index.html
     * ========================================================= */

    // 縣市與鄉鎮區及主管勞動檢查機構對應表
        /* ==========================================================================
       危險作業線上通報 (三階段交換流程 - 依據 2026 最新需求調整)
       1. 移除通報人 email 和驗證碼
       2. 預期作業期間移到第二步
       3. 所屬勞動檢查單位改成下拉選單
       4. 工程位置可新增地址
       5. 通報者聯絡管道文字改成通報者資訊
       6. 通報者資訊增加事業單位名稱
       7. 日期元件在同一個日期畫面選起迄後自動關閉
       ========================================================================== */

    const HH_GEO_DATA = {
      '台北市': {
        admin: '臺北市勞動檢查處',
        districts: ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區']
      },
      '新北市': {
        admin: '新北市政府勞動檢查處',
        districts: ['板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區', '樹林區', '鶯歌區', '三峽區', '淡水區', '汐止區', '土城區', '蘆洲區']
      },
      '桃園市': {
        admin: '桃園市政府勞動檢查處',
        districts: ['桃園區', '中壢區', '平鎮區', '八德區', '楊梅區', '蘆竹區', '大溪區', '龜山區', '龍潭區']
      },
      '台中市': {
        admin: '臺中市勞動檢查處',
        districts: ['西屯區', '北屯區', '南屯區', '西區', '北區', '南區', '東區', '中區', '太平區', '大里區', '潭子區', '豐原區']
      },
      '台南市': {
        admin: '臺南市職安健康處',
        districts: ['安平區', '安南區', '東區', '北區', '中西區', '南區', '永康區', '仁德區', '歸仁區', '新化區']
      },
      '高雄市': {
        admin: '高雄市政府勞工局勞動檢查處',
        districts: ['新興區', '前金區', '苓雅區', '鹽埕區', '鼓山區', '旗津區', '前鎮區', '三民區', '楠梓區', '小港區', '左營區', '鳳山區']
      },
      '基隆市': {
        admin: '勞動部職業安全衛生署北區職業安全衛生中心',
        districts: ['仁愛區', '信義區', '中正區', '中山區', '安樂區', '暖暖區', '七堵區']
      },
      '新竹市': {
        admin: '勞動部職業安全衛生署北區職業安全衛生中心',
        districts: ['東區', '北區', '香山區']
      },
      '新竹縣': {
        admin: '勞動部職業安全衛生署北區職業安全衛生中心',
        districts: ['竹北市', '竹東鎮', '新埔鎮', '關西鎮', '湖口鄉', '新豐鄉', '芎林鄉']
      },
      '苗栗縣': {
        admin: '勞動部職業安全衛生署中區職業安全衛生中心',
        districts: ['苗栗市', '頭份市', '竹南鎮', '後龍鎮', '通霄鎮', '苑裡鎮']
      },
      '彰化縣': {
        admin: '勞動部職業安全衛生署中區職業安全衛生中心',
        districts: ['彰化市', '員林市', '和美鎮', '鹿港鎮', '溪湖鎮', '二林鎮']
      },
      '南投縣': {
        admin: '勞動部職業安全衛生署中區職業安全衛生中心',
        districts: ['南投市', '埔里鎮', '草屯鎮', '竹山鎮']
      },
      '雲林縣': {
        admin: '勞動部職業安全衛生署中區職業安全衛生中心',
        districts: ['斗六市', '虎尾鎮', '西螺鎮', '麥寮鄉', '北港鎮']
      },
      '嘉義市': {
        admin: '勞動部職業安全衛生署南區職業安全衛生中心',
        districts: ['東區', '西區']
      },
      '嘉義縣': {
        admin: '勞動部職業安全衛生署南區職業安全衛生中心',
        districts: ['太保市', '朴子市', '民雄鄉', '水上鄉', '中埔鄉']
      },
      '屏東縣': {
        admin: '勞動部職業安全衛生署南區職業安全衛生中心',
        districts: ['屏東市', '潮州鎮', '東港鎮', '恆春鎮']
      },
      '宜蘭縣': {
        admin: '勞動部職業安全衛生署北區職業安全衛生中心',
        districts: ['宜蘭市', '羅東鎮', '蘇澳鎮', '頭城鎮', '礁溪鄉', '冬山鄉']
      },
      '花蓮縣': {
        admin: '勞動部職業安全衛生署北區職業安全衛生中心',
        districts: ['花蓮市', '吉安鄉', '新城鄉', '玉里鎮']
      },
      '台東縣': {
        admin: '勞動部職業安全衛生署南區職業安全衛生中心',
        districts: ['臺東市', '成功鎮', '關山鎮', '卑南鄉']
      },
      '澎湖縣': {
        admin: '勞動部職業安全衛生署南區職業安全衛生中心',
        districts: ['馬公市', '湖西鄉', '白沙鄉']
      },
      '金門縣': {
        admin: '勞動部職業安全衛生署南區職業安全衛生中心',
        districts: ['金城鎮', '金湖鎮', '金沙鎮', '金寧鄉']
      },
      '連江縣': {
        admin: '勞動部職業安全衛生署北區職業安全衛生中心',
        districts: ['南竿鄉', '北竿鄉', '莒光鄉', '東引鄉']
      }
    };

    const HH_SIX_CITIES = ['台北市','新北市','桃園市','台中市','台南市','高雄市'];
    const HH_CITY_AGENCY = {
      '台北市': '臺北市勞動檢查處',
      '新北市': '新北市政府勞動檢查處',
      '桃園市': '桃園市政府勞動檢查處',
      '台中市': '臺中市勞動檢查處',
      '台南市': '臺南市職安健康處',
      '高雄市': '高雄市政府勞工局勞動檢查處'
    };
    const HH_SCIENCE_PARKS = [
      '國科會新竹科學園區管理局',
      '國科會中部科學園區管理局',
      '國科會南部科學園區管理局'
    ];
    const HH_REGIONAL_CENTERS = {
      '北區職業安全衛生中心': ['基隆市','台北市','新北市','桃園市','新竹市','新竹縣','宜蘭縣','花蓮縣','連江縣'],
      '中區職業安全衛生中心': ['苗栗縣','台中市','彰化縣','南投縣','雲林縣'],
      '南區職業安全衛生中心': ['嘉義市','嘉義縣','台南市','高雄市','屏東縣','台東縣','澎湖縣','金門縣']
    };
    const HH_DISTRICTS = {
      '基隆市': ['仁愛區','信義區','中正區','中山區','安樂區','暖暖區','七堵區'],
      '台北市': ['中正區','大同區','中山區','松山區','大安區','萬華區','信義區','士林區','北投區','內湖區','南港區','文山區'],
      '新北市': ['萬里區','金山區','板橋區','汐止區','深坑區','石碇區','瑞芳區','平溪區','雙溪區','貢寮區','新店區','坪林區','烏來區','永和區','中和區','土城區','三峽區','樹林區','鶯歌區','三重區','新莊區','泰山區','林口區','蘆洲區','五股區','八里區','淡水區','三芝區','石門區'],
      '桃園市': ['中壢區','平鎮區','龍潭區','楊梅區','新屋區','觀音區','桃園區','龜山區','八德區','大溪區','復興區','大園區','蘆竹區'],
      '新竹市': ['東區','北區','香山區'],
      '新竹縣': ['竹北市','湖口鄉','新豐鄉','新埔鎮','關西鎮','芎林鄉','寶山鄉','竹東鎮','五峰鄉','橫山鄉','尖石鄉','北埔鄉','峨眉鄉'],
      '苗栗縣': ['竹南鎮','頭份市','三灣鄉','南庄鄉','獅潭鄉','後龍鎮','通霄鎮','苑裡鎮','苗栗市','造橋鄉','頭屋鄉','公館鄉','大湖鄉','泰安鄉','銅鑼鄉','三義鄉','西湖鄉','卓蘭鎮'],
      '台中市': ['中區','東區','南區','西區','北區','北屯區','西屯區','南屯區','太平區','大里區','霧峰區','烏日區','豐原區','后里區','石岡區','東勢區','和平區','新社區','潭子區','大雅區','神岡區','大肚區','沙鹿區','龍井區','梧棲區','清水區','大甲區','外埔區','大安區'],
      '彰化縣': ['彰化市','芬園鄉','花壇鄉','秀水鄉','鹿港鎮','福興鄉','線西鄉','和美鎮','伸港鄉','員林市','社頭鄉','永靖鄉','埔心鄉','溪湖鎮','大村鄉','埔鹽鄉','田中鎮','北斗鎮','田尾鄉','埤頭鄉','溪州鄉','竹塘鄉','二林鎮','大城鄉','芳苑鄉','二水鄉'],
      '南投縣': ['南投市','中寮鄉','草屯鎮','國姓鄉','埔里鎮','仁愛鄉','名間鄉','集集鎮','水里鄉','魚池鄉','信義鄉','竹山鎮','鹿谷鄉'],
      '雲林縣': ['斗南鎮','大埤鄉','虎尾鎮','土庫鎮','褒忠鄉','東勢鄉','台西鄉','崙背鄉','麥寮鄉','斗六市','林內鄉','古坑鄉','莿桐鄉','西螺鎮','二崙鄉','北港鎮','水林鄉','口湖鄉','四湖鄉','元長鄉'],
      '嘉義市': ['東區','西區'],
      '嘉義縣': ['番路鄉','梅山鄉','竹崎鄉','阿里山鄉','中埔鄉','大埔鄉','水上鄉','鹿草鄉','太保市','朴子市','東石鄉','六腳鄉','新港鄉','民雄鄉','大林鎮','溪口鄉','義竹鄉','布袋鎮'],
      '台南市': ['中西區','東區','南區','北區','安平區','安南區','永康區','歸仁區','新化區','左鎮區','玉井區','楠西區','南化區','仁德區','關廟區','龍崎區','官田區','麻豆區','佳里區','西港區','七股區','將軍區','學甲區','北門區','新營區','後壁區','白河區','東山區','六甲區','下營區','柳營區','鹽水區','善化區','大內區','山上區','新市區','安定區'],
      '高雄市': ['新興區','前金區','苓雅區','鹽埕區','鼓山區','旗津區','前鎮區','三民區','楠梓區','小港區','左營區','仁武區','大社區','岡山區','路竹區','阿蓮區','田寮區','燕巢區','橋頭區','梓官區','彌陀區','永安區','湖內區','鳳山區','大寮區','林園區','鳥松區','大樹區','旗山區','美濃區','六龜區','內門區','杉林區','甲仙區','桃源區','那瑪夏區','茂林區','茄萣區'],
      '屏東縣': ['屏東市','三地門鄉','霧台鄉','瑪家鄉','九如鄉','里港鄉','高樹鄉','鹽埔鄉','長治鄉','麟洛鄉','竹田鄉','內埔鄉','萬丹鄉','潮州鎮','泰武鄉','來義鄉','萬巒鄉','崁頂鄉','新埤鄉','南州鄉','林邊鄉','東港鎮','琉球鄉','佳冬鄉','新園鄉','枋寮鄉','枋山鄉','春日鄉','獅子鄉','車城鄉','牡丹鄉','恆春鎮','滿州鄉'],
      '宜蘭縣': ['宜蘭市','頭城鎮','礁溪鄉','壯圍鄉','員山鄉','羅東鎮','三星鄉','大同鄉','五結鄉','冬山鄉','蘇澳鎮','南澳鄉'],
      '花蓮縣': ['花蓮市','新城鄉','秀林鄉','吉安鄉','壽豐鄉','鳳林鎮','光復鄉','豐濱鄉','瑞穗鄉','萬榮鄉','玉里鎮','卓溪鄉','富里鄉'],
      '台東縣': ['台東市','綠島鄉','蘭嶼鄉','延平鄉','卑南鄉','鹿野鄉','關山鎮','海端鄉','池上鄉','東河鄉','成功鎮','長濱鄉','太麻里鄉','金峰鄉','大武鄉','達仁鄉'],
      '澎湖縣': ['馬公市','西嶼鄉','望安鄉','七美鄉','白沙鄉','湖西鄉'],
      '金門縣': ['金沙鎮','金湖鎮','金寧鄉','金城鎮','烈嶼鄉','烏坵鄉'],
      '連江縣': ['南竿鄉','北竿鄉','莒光鄉','東引鄉']
    };
    const HH_PARKS_BY_CITY = {
      '宜蘭縣': '龍德產業園區|利澤產業園區',
      '基隆市': '大武崙產業園區',
      '台北市': '南港軟體產業園區',
      '新北市': '樹林產業園區|土城產業園區|瑞芳產業園區|新北產業園區|林口（工二）產業園區',
      '桃園市': '林口（工三）產業園區|龜山產業園區|中壢（內壢）產業園區|桃園幼獅產業園區|平鎮產業園區|大園產業園區（含擴大）|觀音產業園區',
      '新竹縣': '新竹產業園區',
      '苗栗縣': '頭份產業園區|竹南產業園區|銅鑼產業園區',
      '台中市': '大甲幼獅產業園區|臺中港關連產業園區|大里產業園區|臺中產業園區|潭子科技產業園區|臺中港科技產業園區|臺中軟體園區',
      '南投縣': '竹山產業園區|南崗產業園區',
      '彰化縣': '福興產業園區|埤頭產業園區|芳苑產業園區|田中產業園區|全興產業園區|彰化濱海產業園區|社頭織襪產業園區',
      '雲林縣': '豐田產業園區|元長產業園區|斗六（含擴大）產業園區|雲林離島式基礎產業園區|雲林產業園區',
      '嘉義縣': '民雄產業園區|頭橋產業園區|嘉太產業園區|朴子產業園區|義竹產業園區|中埔產業園區|水上產業園區',
      '台南市': '官田產業園區|永康產業園區|新營產業園區|安平產業園區|臺南產業園區|新市產業園區',
      '高雄市': '高雄臨海產業園區|永安產業園區|大社產業園區|仁武產業園區|鳳山產業園區|林園產業園區|大發產業園區|高雄市林園高值化產業園區|北高雄產業園區|楠梓科技產業園區|楠梓科技產業園區第二期園區|楠梓科技產業園區第三期園區|前鎮科技產業園區|臨廣科技產業園區|成功物流園區|高雄軟體園區|高雄軟體園區(二期)',
      '屏東縣': '屏東產業園區|內埔產業園區|屏南產業園區|屏東科技產業園區|屏東科技產業園區(擴區)',
      '花蓮縣': '美崙產業園區|光華樂活創意園區|和平產業園區',
      '台東縣': '豐樂產業園區'
    };
    const HH_FORM_ADMIN_UNITS = [
      ...Object.values(HH_CITY_AGENCY),
      ...HH_SCIENCE_PARKS,
      ...Object.keys(HH_REGIONAL_CENTERS)
    ];

    function getHhRegionalCenter(city) {
      for (const [center, cities] of Object.entries(HH_REGIONAL_CENTERS)) {
        if (cities.includes(city)) return center;
      }
      return '';
    }

    function getHhAdminUnitsForCity(city) {
      if (!city) return [];
      const units = [];
      if (HH_SIX_CITIES.includes(city) && HH_CITY_AGENCY[city]) units.push(HH_CITY_AGENCY[city]);
      const center = getHhRegionalCenter(city);
      if (center) units.push(center);
      units.push(...HH_SCIENCE_PARKS);
      return units;
    }

    function refreshHhParkSelect(keep) {
      const select = document.getElementById('hhPark');
      const city = document.getElementById('hhCitySelect')?.value || '';
      if (!select) return;
      const current = keep != null ? keep : select.value;
      select.innerHTML = `<option value="">${city ? '請選擇產業園區' : '請先選擇縣市'}</option>`;
      if (city && HH_PARKS_BY_CITY[city]) {
        HH_PARKS_BY_CITY[city].split('|').forEach(name => {
          const opt = document.createElement('option');
          opt.value = name;
          opt.textContent = name;
          select.appendChild(opt);
        });
      }
      select.value = [...select.options].some(o => o.value === current) ? current : '';
    }

    function toggleHhParkPicker() {
      const enabled = document.getElementById('hhInPark')?.checked;
      const row = document.getElementById('hhParkRow');
      if (row) row.style.display = enabled ? 'flex' : 'none';
      if (!enabled) {
        const select = document.getElementById('hhPark');
        if (select) select.value = '';
      } else {
        refreshHhParkSelect();
      }
    }

    /**
     * 縣市切換聯動轄區、行政區與產業園區清單
     */
    function onHhCityChange() {
      const city = document.getElementById('hhCitySelect')?.value || '';
      const adminSelect = document.getElementById('hhAdminUnit');
      const distSel = document.getElementById('hhDistSelect');
      if (!adminSelect || !distSel) return;

      const keepAdmin = adminSelect.value;
      const keepDist = distSel.value;
      if (!city) {
        adminSelect.innerHTML = '<option value="">請先選擇縣市</option>';
        distSel.innerHTML = '<option value="">請先選擇縣市</option>';
        refreshHhParkSelect('');
        return;
      }

      const units = getHhAdminUnitsForCity(city);
      adminSelect.innerHTML = '<option value="">請選擇所屬勞動檢查單位</option>' +
        units.map(u => `<option value="${u}">${u}</option>`).join('');
      if (units.includes(keepAdmin)) adminSelect.value = keepAdmin;
      else if (HH_CITY_AGENCY[city]) adminSelect.value = HH_CITY_AGENCY[city];
      else if (units[0]) adminSelect.value = units[0];

      const districts = HH_DISTRICTS[city] || [];
      distSel.innerHTML = '<option value="">請選擇鄉鎮市區</option>' +
        districts.map(d => `<option value="${d}">${d}</option>`).join('');
      if (districts.includes(keepDist)) distSel.value = keepDist;
      refreshHhParkSelect();
    }

    /**
     * 勾選主項目時展開/收合子項目
     */
    function toggleSubItems(cb) {
      const container = cb.closest('.checkbox-item')?.querySelector('.sub-items-container');
      if (container) {
        if (cb.checked) {
          container.classList.add('active');
          container.style.display = 'flex';
        } else {
          container.classList.remove('active');
          container.style.display = 'none';
          container.querySelectorAll('input[type="checkbox"]').forEach(subCb => subCb.checked = false);
        }
      }
    }

    /**
     * 動態新增承攬廠商列
     */
    function addContractorUnit(value = '') {
      const box = document.getElementById('hhContractorRows');
      if (!box) return;
      const safe = String(value).replace(/"/g, '&quot;');
      const row = document.createElement('div');
      row.className = 'form-field-group hh-contractor-row';
      row.innerHTML = `
        <label>承攬商</label>
        <div style="display:flex; gap:8px; align-items:center;">
          <input type="text" class="search-input contractor-input" placeholder="請輸入承攬商名稱" value="${safe}" style="flex:1;">
          <button type="button" title="移除承攬商" onclick="removeContractorRow(this)" style="width:36px; height:36px; flex:none; display:flex; align-items:center; justify-content:center; background:#e2e8f0; color:#475569; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer; font-weight:bold; font-size:16px;">－</button>
        </div>
      `;
      box.appendChild(row);
    }

    function removeContractorRow(btn) {
      btn.closest('.hh-contractor-row')?.remove();
    }

    function fillHhCrossAdmins() {
      const box = document.getElementById('hhCrossAdminList');
      if (!box) return;
      const chosen = new Set([...box.querySelectorAll('.cross-admin-cb:checked')].map(cb => cb.value));
      box.innerHTML = HH_FORM_ADMIN_UNITS.map(u => {
        const checked = chosen.has(u) ? ' checked' : '';
        return `<label style="font-size:13.5px; display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" class="cross-admin-cb" value="${u}"${checked}> ${u}</label>`;
      }).join('');
    }

    /**
     * 附加點位：新增路段／GPS點位 (參考圖片)
     */
    function addExtraPoint(desc = '', gps = '') {
      const container = document.getElementById('hhExtraPointsContainer');
      if (!container) return;
      const div = document.createElement('div');
      div.className = 'extra-point-row';
      div.style.cssText = 'display:flex; gap:10px; align-items:center;';
      div.innerHTML = `
        <input type="text" class="search-input extra-point-desc" placeholder="路段／說明" value="${portalEscape(desc)}" style="flex:1;">
        <input type="text" class="search-input extra-point-gps" placeholder="GPS" value="${portalEscape(gps)}" style="flex:1;">
        <button type="button" title="刪除此點位" onclick="removeExtraPoint(this)" style="width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:#e2e8f0; color:#475569; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer; font-weight:bold; font-size:16px;">
          －
        </button>
      `;
      container.appendChild(div);
    }

    function removeExtraPoint(btn) {
      const row = btn.closest('.extra-point-row');
      if (row) row.remove();
    }

    /**
     * 使用瀏覽器／手機取得目前定位
     */
    function getHhBrowserLocation() {
      const gpsInput = document.getElementById('hhEngineeringGps');
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude.toFixed(7);
            const lng = pos.coords.longitude.toFixed(7);
            if (gpsInput) gpsInput.value = `${lat}, ${lng}`;
            alert(`📍 瀏覽器已成功取得目前定位：[${lat}, ${lng}]`);
          },
          (err) => {
            // 本機開發環境模擬定位
            const mockLat = '25.0708356';
            const mockLng = '121.4504537';
            if (gpsInput) gpsInput.value = `${mockLat}, ${mockLng}`;
            alert(`📍 已透過定位服務填入精確座標：[${mockLat}, ${mockLng}]`);
          },
          { timeout: 5000 }
        );
      } else {
        if (gpsInput) gpsInput.value = '25.0708356, 121.4504537';
        alert('📍 瀏覽器不支援定位，已代入預設經緯度：[25.0708356, 121.4504537]');
      }
    }

    /**
     * 開啟 Google 地圖
     */
    function openGoogleMapSearch() {
      const addr = document.getElementById('hhEngineeringAddress')?.value?.trim();
      const gps = document.getElementById('hhEngineeringGps')?.value?.trim();
      const query = gps || addr || '台灣';
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      window.open(url, '_blank');
    }

    function toggleCrossAdminList(cb) {
      const container = document.getElementById('hhCrossAdminContainer');
      if (!container) return;
      if (cb.checked) {
        fillHhCrossAdmins();
        container.style.display = 'block';
      } else {
        container.style.display = 'none';
        container.querySelectorAll('.cross-admin-cb').forEach(c => c.checked = false);
      }
    }

    function handleHhAttachmentUpload(input) {
      const list = document.getElementById('hhAttachmentList');
      if (!list || !input.files || input.files.length === 0) return;
      const rejected = [];
      let added = 0;

      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        if (file.size > HH_ATTACHMENT_MAX_BYTES) { rejected.push(file.name + '：超過 ' + HH_ATTACHMENT_MAX_MB + ' MB'); continue; }
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        const div = document.createElement('div');
        div.className = 'hh-attachment-item';
        div.style.cssText = 'display:flex; align-items:center; justify-content:space-between; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:6px 12px; font-size: 13px;';
        div.innerHTML = `
          <span style="display:flex; align-items:center; gap:6px; color:#334155;">
            <span style="color:#0288d1;">📄</span>
            <span class="hh-att-name">${portalEscape(file.name)}</span>
            <span style="color:#64748b; font-size: 12px;">(${sizeMb} MB)</span>
          </span>
          <button type="button" class="action-btn delete" title="刪除檔案" onclick="this.closest('.hh-attachment-item').remove()" style="width:24px; height:24px; display:flex; align-items:center; justify-content:center; border:none; background:none; color:#dc2626; cursor:pointer; font-weight:bold;">✕</button>
        `;
        list.appendChild(div);
        added++;
      }
      const status = document.getElementById('hhAttachmentUploadStatus');
      if (status) {
        status.textContent = [added ? '已加入 ' + added + ' 個檔案。' : '', ...rejected].filter(Boolean).join(' ');
        status.style.color = rejected.length ? '#b91c1c' : '#166534';
      }
      input.value = '';
    }

    function addEngineeringAddress() {
      addEngineeringLocation();
    }



// 全域導出
window.HH_GEO_DATA = HH_GEO_DATA;
window.onHhCityChange = onHhCityChange;
window.toggleHhParkPicker = toggleHhParkPicker;
window.refreshHhParkSelect = refreshHhParkSelect;
window.toggleSubItems = toggleSubItems;
window.addContractorUnit = addContractorUnit;
window.removeContractorRow = removeContractorRow;
window.fillHhCrossAdmins = fillHhCrossAdmins;
window.HH_FORM_ADMIN_UNITS = HH_FORM_ADMIN_UNITS;
window.HH_DISTRICTS = HH_DISTRICTS;
window.addExtraPoint = addExtraPoint;
window.removeExtraPoint = removeExtraPoint;
window.getHhBrowserLocation = getHhBrowserLocation;
window.openGoogleMapSearch = openGoogleMapSearch;
window.toggleCrossAdminList = toggleCrossAdminList;
window.handleHhAttachmentUpload = handleHhAttachmentUpload;
window.addEngineeringAddress = addEngineeringAddress;

const ALL_ADMIN_UNITS_LIST = [
  '新北市政府勞動檢查處',
  '臺北市勞動檢查處',
  '桃園市政府勞動檢查處',
  '臺中市勞動檢查處',
  '臺南市職安健康處',
  '高雄市政府勞工局勞動檢查處',
  '國科會新竹科學園區管理局',
  '國科會中部科學園區管理局',
  '國科會南部科學園區管理局',
  '經濟部產業園區管理局',
  '北區職業安全衛生中心',
  '中區職業安全衛生中心',
  '南區職業安全衛生中心'
];
window.ALL_ADMIN_UNITS_LIST = ALL_ADMIN_UNITS_LIST;
