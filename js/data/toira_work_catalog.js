// TOiRA 20261005h: exact assessment names from the user's task library.
// Update this catalog and the explicit operation mapping together when TOiRA changes.
const HH_TOIRA_WORK_CATALOG = {
  "version": "20261005h",
  "sourceLibrarySha256": "793647d207bceb00fdff0692240f4978e25530a03d2798c8ab3701d005ae3bb4",
  "sourceMappingSha256": "9a9d5ce40ccfcfb8b0c52056c95c1b28291cdac5adf721afa7ecbfcf09f351e5",
  "dangerousCatalogCount": 17,
  "tasks": {
    "HH-001": {
      "title": "於石綿板、鐵皮板、瓦、木板、茅草、塑膠等易踏穿材料構築之屋頂從事作業",
      "taskId": "於石綿板、鐵皮板、瓦、木板、茅草、塑膠等易踏穿材料構築之屋頂從事作業"
    },
    "HH-002": {
      "title": "高處繩索接近作業",
      "taskId": "高處繩索接近作業"
    },
    "HH-003": {
      "title": "營建用升降機組裝、拆卸及維修作業",
      "taskId": "營建用升降機組裝、拆卸及維修作業"
    },
    "HH-004": {
      "title": "吊籠作業",
      "taskId": "吊籠作業"
    },
    "HH-005": {
      "title": "高度二公尺以上邊緣及開口無法設置防墜設施之影視拍攝作業",
      "taskId": "高度二公尺以上邊緣及開口無法設置防墜設施之影視拍攝作業"
    },
    "HH-017": {
      "title": "影視受控墜落拍攝作業",
      "taskId": "影視受控墜落拍攝作業"
    },
    "HH-016": {
      "title": "威亞吊飛作業",
      "taskId": "威亞吊飛作業"
    },
    "HH-012": {
      "title": "塔式起重機升高及拆卸作業",
      "taskId": "塔式起重機升高及拆卸作業"
    },
    "HH-013": {
      "title": "人字臂起重機組裝與拆卸作業",
      "taskId": "人字臂起重機組裝與拆卸作業"
    },
    "HH-006": {
      "title": "模板支撐灌漿作業",
      "taskId": "模板支撐灌漿作業"
    },
    "HH-007": {
      "title": "施工架組拆與高處作業",
      "taskId": "施工架組拆與高處作業"
    },
    "HH-008": {
      "title": "開挖擋土支撐組立及拆除作業",
      "taskId": "開挖擋土支撐組立及拆除作業"
    },
    "HH-009": {
      "title": "石化業製程區歲修作業",
      "taskId": "石化業製程區歲修作業"
    },
    "HH-010": {
      "title": "石化業壓力容器、儲槽及管線歲修作業",
      "taskId": "石化業壓力容器、儲槽及管線歲修作業"
    },
    "HH-011": {
      "title": "使用爆炸性物質、易燃液體及可燃性氣體從事影視拍攝作業",
      "taskId": "使用爆炸性物質、易燃液體及可燃性氣體從事影視拍攝作業"
    },
    "HH-015": {
      "title": "局限空間作業",
      "taskId": "局限空間作業"
    },
    "HH-014": {
      "title": "水域影視拍攝作業",
      "taskId": "水域影視拍攝作業"
    },
    "construction-open-excavation": {
      "title": "露天開挖作業",
      "taskId": "露天開挖作業"
    }
  },
  "operations": {
    "roof": {
      "label": "於石綿板、鐵皮板、瓦、木板、茅草、塑膠等易踏穿材料構築之屋頂從事作業。",
      "assessmentIds": [
        "HH-001"
      ]
    },
    "rope": {
      "label": "第二百二十五條第二項所定之繩索作業。",
      "assessmentIds": [
        "HH-002"
      ]
    },
    "tower-crane": {
      "label": "塔式起重機升高及拆卸作業。",
      "assessmentIds": [
        "HH-012"
      ]
    },
    "derrick-crane": {
      "label": "人字臂起重桿組拆作業。",
      "assessmentIds": [
        "HH-013"
      ]
    },
    "construction-lift": {
      "label": "營建用升降機組裝、維修作業。",
      "assessmentIds": [
        "HH-003"
      ]
    },
    "gondola": {
      "label": "吊籠作業。",
      "assessmentIds": [
        "HH-004"
      ]
    },
    "filming-edge": {
      "label": "高度在二公尺以上之工作場所邊緣及開口，未能設置護欄、護蓋之影視拍攝作業。",
      "assessmentIds": [
        "HH-005"
      ]
    },
    "formwork": {
      "label": "模板支撐高度在七公尺以上，且面積達一百平方公尺以上之灌漿作業。",
      "assessmentIds": [
        "HH-006"
      ]
    },
    "scaffold": {
      "label": "高度五十公尺以上施工架組立及拆除作業。",
      "assessmentIds": [
        "HH-007"
      ]
    },
    "deep-excavation": {
      "label": "開挖深度達十八公尺以上，且面積達五百平方公尺之開挖作業、擋土支撐組立及拆除作業。",
      "assessmentIds": [
        "HH-008",
        "construction-open-excavation"
      ]
    },
    "petrochemical": {
      "label": "石化業廠場之歲修作業。",
      "assessmentIds": [
        "HH-009",
        "HH-010"
      ]
    },
    "filming-explosives": {
      "label": "使用爆炸性物質、易燃液體或可燃性氣體從事爆破之影視拍攝作業。",
      "assessmentIds": [
        "HH-011"
      ]
    },
    "sewer": {
      "label": "污水或雨水下水道。",
      "assessmentIds": [
        "HH-015"
      ],
      "context": "具缺氧、中毒危險之下列局限空間從事清理或維修作業："
    },
    "wastewater": {
      "label": "廢（污）水處理設施。",
      "assessmentIds": [
        "HH-015"
      ],
      "context": "具缺氧、中毒危險之下列局限空間從事清理或維修作業："
    },
    "fermentation": {
      "label": "食品醃製或發酵槽。",
      "assessmentIds": [
        "HH-015"
      ],
      "context": "具缺氧、中毒危險之下列局限空間從事清理或維修作業："
    },
    "hot-spring": {
      "label": "溫泉儲槽。",
      "assessmentIds": [
        "HH-015"
      ],
      "context": "具缺氧、中毒危險之下列局限空間從事清理或維修作業："
    },
    "filming-water": {
      "label": "於開放水域從事有溺水危險之影視拍攝作業。",
      "assessmentIds": [
        "HH-014"
      ]
    }
  },
  "legalSource": {
    "sourceUrl": "https://laws.gov.taipei/law/LawSearch/LawArticleAmend/FL015021",
    "law": "職業安全衛生設施規則第21條之3",
    "revisionDate": "115年6月30日"
  }
};
