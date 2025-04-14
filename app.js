function formatNotice(notice) {
  const parts = notice.trim().split("-");
  if (parts.length !== 4) return null;
  const year = "20" + parts[2];
  const number = parts[3].padStart(5, "0");
  return `${parts[0]}-${parts[1]}-${year}-${number}`;
}

function handleSearch() {
  const input = document.getElementById("noticeInput").value;
  const formatted = formatNotice(input);
  if (!formatted) {
    alert("형식이 올바르지 않아요. 예: 충북-청주-25-1");
    return;
  }

  const url = `http://pawinhand.kr/link/linker.html?type=abandon&idx=${formatted}`;
  window.open(url, "_blank"); // 모바일에서 안 되면 location.href로 바꿔도 됨

  saveHistory(input);
  renderHistory();
}

function saveHistory(item) {
  let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  history.unshift({ value: item, timestamp: new Date().toISOString() });
  history = history.slice(0, 20); // 최근 20개까지만 저장
  localStorage.setItem("searchHistory", JSON.stringify(history));
}

function renderHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  const history = JSON.parse(localStorage.getItem("searchHistory")) || [];

  history.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = entry.value;
    li.onclick = () => {
      document.getElementById("noticeInput").value = entry.value;
      handleSearch();
    };
    list.appendChild(li);
  });
}

// ✅ DOM 로드 후 버튼 이벤트 연결
window.onload = function () {
  renderHistory();

  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", handleSearch);
  }
};

