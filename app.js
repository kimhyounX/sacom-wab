// ===============================
// 수기 입력 드롭다운 버전
// - REGION_MAP을 너가 직접 작성/수정
// - 최초 기본: 충북/청주
// - 지역 변경 후 재실행: 마지막 선택 지역 유지
// - 입력 호환:
//   1) "1" (숫자만) => 올해-1로 간주 (예: 2026이면 26-1)
//   2) "24-1" => 선택 지역 + 2024 + 00001
//   3) "충북-청주-24-1" 또는 "충북-청주-2024-1" => 입력 지역으로 검색
// - 검색 기록 저장 기준: 지역 + 입력값(B)
// ===============================

/**
 * ✅ 여기만 수정하면 됨 (수기 입력)
 * - 시/도는 "서울, 경기, 충북..." 처럼
 * - 시/군/구는 "강남, 대덕, 청주..." 처럼 접미사 없이
 */
const REGION_MAP = {
  "서울": ["강남", "강동", "강북", "강서", "관악", "광진", "구로", "금천", "노원", "도봉", "동대문", "동작", "마포", "서대문", "서초", "성동", "성북", "송파", "양천", "영등포", "용산", "은평", "종로", "중구", "중랑"],
  "부산": ["강서", "금정", "기장", "남구", "동구", "동래", "부산진", "북구", "사상", "사하", "서구", "수영", "연제", "영도", "중구", "해운대"],
  "대구": ["군위","남구", "달서", "달성", "동구", "북구", "서구", "수성", "중구"],
  "인천": ["강화", "계양", "남동", "동구", "미추홀", "부평", "서구", "연수", "옹진", "중구"],
  "광주": ["광산", "남구", "동구", "북구", "서구"],
  "대전": ["대덕", "동구", "서구", "유성", "중구"],
  "울산": ["남구", "동구", "북구", "울주", "중구"],
  "세종": ["세종"],

  "경기": ["가평", "고양", "과천", "광명", "광주", "구리", "군포","기흥", "김포", "남양주", "동두천", "부천", "성남", "수원", "시흥", "안산", "안성", "안양", "양주", "양평", "여주", "연천", "오산", "용인", "의왕", "의정부", "이천", "파주", "평택", "포천", "하남", "화성"],
  "강원": ["강릉", "고성", "동해", "삼척", "속초", "양구", "양양", "영월", "원주", "인제", "정선", "철원", "춘천", "태백", "평창", "홍천", "화천", "횡성"],
  "충북": ["괴산", "단양", "보은", "영동", "옥천", "음성", "제천", "증평", "진천", "청주", "충주"],
  "충남": ["계룡", "공주", "금산", "논산", "당진", "보령", "부여", "서산", "서천", "아산", "연기", "예산", "천안", "청양", "태안", "홍성"],

  "전북": ["고창", "군산", "김제", "남원", "무주", "부안", "순창", "완주", "익산", "임실", "장수", "전주", "정읍", "진안"],
  "전남": ["강진", "고흥", "곡성", "광양", "구례", "나주", "담양", "목포", "무안", "보성", "순천", "신안", "여수", "영광", "영암", "완도", "장성", "장흥", "진도", "함평", "해남", "화순"],
  "경북": ["경산", "경주", "고령", "구미", "김천", "문경", "봉화", "상주", "성주", "안동", "영덕", "영양", "영주", "영천", "예천", "울릉", "울진", "의성", "청도", "청송", "칠곡", "포항"],
  "경남": ["거제", "거창", "고성", "김해", "남해", "밀양", "사천", "산청", "양산", "의령", "진주", "창녕", "창원", "통영", "하동", "함안", "함양", "합천"],

  "제주": ["제주", "서귀포"]
};

const STORAGE_REGION_KEY = "selectedRegion"; // {sido, sigungu}
const STORAGE_HISTORY_KEY = "searchHistory"; // [{ value: "충북-청주-2026-00003", timestamp }, ...]
const HISTORY_LIMIT = 20;

function setSelectOptions(selectEl, options, placeholder) {
  selectEl.innerHTML = "";

  if (placeholder) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = placeholder;
    selectEl.appendChild(opt);
  }

  options.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    selectEl.appendChild(opt);
  });
}

function getSelectedRegion() {
  const sido = document.getElementById("sidoSelect").value;
  const sigungu = document.getElementById("sigunguSelect").value;
  return { sido, sigungu };
}

function saveSelectedRegion(sido, sigungu) {
  localStorage.setItem(STORAGE_REGION_KEY, JSON.stringify({ sido, sigungu }));
}

function loadSelectedRegion() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_REGION_KEY));
  } catch {
    return null;
  }
}

function setRegionUI(sido, sigungu) {
  const sidoEl = document.getElementById("sidoSelect");
  const sigunguEl = document.getElementById("sigunguSelect");

  if (sido && REGION_MAP[sido]) {
    sidoEl.value = sido;

    const sigungus = REGION_MAP[sido] || [];
    setSelectOptions(sigunguEl, sigungus, "시/군/구 선택");

    if (sigungu && sigungus.includes(sigungu)) sigunguEl.value = sigungu;
    else sigunguEl.value = "";
  }
}

function initRegionSelectsManual() {
  const sidoEl = document.getElementById("sidoSelect");
  const sigunguEl = document.getElementById("sigunguSelect");

  const sidos = Object.keys(REGION_MAP).sort(); // 시/도는 가나다
  setSelectOptions(sidoEl, sidos, "시/도 선택");
  setSelectOptions(sigunguEl, [], "시/군/구 선택");

  const saved = loadSelectedRegion();
  const defaultSido = (saved && saved.sido) ? saved.sido : "충북";
  const defaultSigungu = (saved && saved.sigungu) ? saved.sigungu : "청주";

  // 시도 변경 -> 시군구 갱신 + 저장
  sidoEl.addEventListener("change", () => {
    const sido = sidoEl.value;
    const sigungus = REGION_MAP[sido] || [];
    setSelectOptions(sigunguEl, sigungus, "시/군/구 선택");
    sigunguEl.value = "";
    saveSelectedRegion(sidoEl.value, sigunguEl.value);
  });

  // 시군구 변경 -> 저장
  sigunguEl.addEventListener("change", () => {
    saveSelectedRegion(sidoEl.value, sigunguEl.value);
  });

  setRegionUI(defaultSido, defaultSigungu);
  if (!saved) saveSelectedRegion(defaultSido, defaultSigungu);
}

// 최종 idx 생성: 시도-시군구-YYYY-00000
function buildFinalIdx(sido, sigungu, year4, numberRaw) {
  const number5 = String(numberRaw).padStart(5, "0");
  return `${sido}-${sigungu}-${year4}-${number5}`;
}

// 입력값 -> 최종 idx 반환 (기록도 최종 idx로 저장)
function formatNotice(notice) {
  const raw = notice.trim();
  if (!raw) return null;

  // 1) 숫자만: "3" => 올해-3
  if (/^\d+$/.test(raw)) {
    const year4 = String(new Date().getFullYear()); // 예: "2026"
    const { sido, sigungu } = getSelectedRegion();
    if (!sido || !sigungu) return null;

    const formatted = buildFinalIdx(sido, sigungu, year4, raw);
    return { formatted, savedValue: formatted };
  }

  const parts = raw.split("-");

  // 2) "26-3" / "24-1" : 선택 지역 + 20YY
  if (parts.length === 2) {
    const yy = parts[0];
    const numRaw = parts[1];

    if (!/^\d{2}$/.test(yy) || !/^\d+$/.test(numRaw)) return null;

    const { sido, sigungu } = getSelectedRegion();
    if (!sido || !sigungu) return null;

    const year4 = "20" + yy;
    const formatted = buildFinalIdx(sido, sigungu, year4, numRaw);
    return { formatted, savedValue: formatted };
  }

  // 3) "충북-청주-24-1" / "충북-청주-2024-1" : 입력 지역 우선
  if (parts.length === 4) {
    const sido = parts[0];
    const sigungu = parts[1];
    const y = parts[2];
    const numRaw = parts[3];

    if (!/^\d+$/.test(numRaw)) return null;

    let year4;
    if (/^\d{2}$/.test(y)) year4 = "20" + y;
    else if (/^\d{4}$/.test(y)) year4 = y;
    else return null;

    const formatted = buildFinalIdx(sido, sigungu, year4, numRaw);
    return { formatted, savedValue: formatted };
  }

  return null;
}

function handleSearch() {
  const input = document.getElementById("noticeInput").value;
  const result = formatNotice(input);

  if (!result) {
    alert("형식이 올바르지 않아요. 예: 24-1 또는 충북-청주-24-1 또는 1");
    return;
  }

  const url = `http://pawinhand.kr/link/linker.html?type=abandon&idx=${encodeURIComponent(result.formatted)}`;
  window.open(url, "_blank");

  // ✅ 기록은 최종 idx로 저장
  saveHistory(result.savedValue);
  renderHistory();
}

function saveHistory(finalIdx) {
  let history = JSON.parse(localStorage.getItem(STORAGE_HISTORY_KEY)) || [];
  history.unshift({ value: finalIdx, timestamp: new Date().toISOString() });
  history = history.slice(0, HISTORY_LIMIT);
  localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history));
}

function parseIdxToRegion(idx) {
  // "충북-청주-2026-00003" 기대
  const parts = String(idx).split("-");
  if (parts.length !== 4) return null;
  return { sido: parts[0], sigungu: parts[1] };
}

function renderHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  const history = JSON.parse(localStorage.getItem(STORAGE_HISTORY_KEY)) || [];

  history.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = entry.value;

    li.onclick = () => {
      const region = parseIdxToRegion(entry.value);

      // 기록에 포함된 지역으로 드롭다운 맞춤 + 저장
      if (region && REGION_MAP[region.sido]) {
        setRegionUI(region.sido, region.sigungu);
        saveSelectedRegion(region.sido, region.sigungu);
      }

      // 입력창에 최종 idx를 넣고 검색(호환: 4파트 처리됨)
      document.getElementById("noticeInput").value = entry.value;
      handleSearch();
    };

    list.appendChild(li);
  });
}

window.onload = function () {
  initRegionSelectsManual();
  renderHistory();
  document.getElementById("searchBtn").addEventListener("click", handleSearch);
};
