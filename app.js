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

const STORAGE_REGION_KEY = "selectedRegion";     // {sido, sigungu}
const STORAGE_HISTORY_KEY = "searchHistory";     // [{sido,sigungu,value,timestamp}, ...]
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

    if (sigungu && sigungus.includes(sigungu)) {
      sigunguEl.value = sigungu;
    } else {
      sigunguEl.value = "";
    }
  }
}

function initRegionSelectsManual() {
  const sidoEl = document.getElementById("sidoSelect");
  const sigunguEl = document.getElementById("sigunguSelect");

  const sidos = Object.keys(REGION_MAP).sort();
  setSelectOptions(sidoEl, sidos, "시/도 선택");
  setSelectOptions(sigunguEl, [], "시/군/구 선택");

  // ✅ 최초 기본값: 충북/청주 + 저장값 우선
  const saved = loadSelectedRegion();
  const defaultSido = (saved && saved.sido) ? saved.sido : "충북";
  const defaultSigungu = (saved && saved.sigungu) ? saved.sigungu : "청주";

  // 시도 변경 -> 시군구 옵션 갱신 + 저장
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

  // 저장값(또는 기본값) 적용
  setRegionUI(defaultSido, defaultSigungu);

  // 저장값이 없었으면 최초 기본값 저장
  if (!saved) saveSelectedRegion(defaultSido, defaultSigungu);
}

// ✅ 입력 포맷 규칙 적용해서 formatted(idx) 만들기
function formatNotice(notice) {
  const raw = notice.trim();
  if (!raw) return null;

  // 1) 숫자만 입력: "1" => 올해-1로 간주
  if (/^\d+$/.test(raw)) {
    const year2 = String(new Date().getFullYear()).slice(-2); // 예: "26"
    const number = raw.padStart(5, "0");

    const { sido, sigungu } = getSelectedRegion();
    if (!sido || !sigungu) return null;

    return {
      formatted: `${sido}-${sigungu}-20${year2}-${number}`,
      usedRegion: { sido, sigungu },
      savedValue: `${year2}-${raw}` // 기록에는 "26-1" 형태로 저장
    };
  }

  const parts = raw.split("-");

  // 2) "24-1" (2파트): 선택 지역 적용
  if (parts.length === 2) {
    const yy = parts[0];
    const numRaw = parts[1];

    if (!/^\d{2}$/.test(yy) || !/^\d+$/.test(numRaw)) return null;

    const { sido, sigungu } = getSelectedRegion();
    if (!sido || !sigungu) return null;

    const year = "20" + yy;
    const number = numRaw.padStart(5, "0");

    return {
      formatted: `${sido}-${sigungu}-${year}-${number}`,
      usedRegion: { sido, sigungu },
      savedValue: raw
    };
  }

  // 3) "충북-청주-24-1" 또는 "충북-청주-2024-1" (4파트): 입력 지역 그대로 적용
  if (parts.length === 4) {
    const sido = parts[0];
    const sigungu = parts[1];
    const y = parts[2];
    const numRaw = parts[3];

    if (!/^\d+$/.test(numRaw)) return null;

    let year;
    if (/^\d{2}$/.test(y)) year = "20" + y;
    else if (/^\d{4}$/.test(y)) year = y;
    else return null;

    const number = numRaw.padStart(5, "0");

    return {
      formatted: `${sido}-${sigungu}-${year}-${number}`,
      usedRegion: { sido, sigungu },
      savedValue: raw
    };
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

  // ✅ 기록 저장: 지역 + 입력값(B)
  saveHistory(result.usedRegion.sido, result.usedRegion.sigungu, result.savedValue);
  renderHistory();
}

function saveHistory(sido, sigungu, item) {
  let history = JSON.parse(localStorage.getItem(STORAGE_HISTORY_KEY)) || [];
  history.unshift({
    sido,
    sigungu,
    value: item,
    timestamp: new Date().toISOString()
  });
  history = history.slice(0, HISTORY_LIMIT);
  localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history));
}

function renderHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  const history = JSON.parse(localStorage.getItem(STORAGE_HISTORY_KEY)) || [];

  history.forEach((entry) => {
    const li = document.createElement("li");

    // ✅ 표시도 B: 지역 + 입력값
    li.textContent = `${entry.sido}-${entry.sigungu}  ${entry.value}`;

    li.onclick = () => {
      // 기록 클릭 시 해당 지역으로 드롭다운도 맞춤 + 저장
      if (entry.sido && entry.sigungu) {
        setRegionUI(entry.sido, entry.sigungu);
        saveSelectedRegion(entry.sido, entry.sigungu);
      }

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
