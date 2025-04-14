function formatNotice(notice) {
  const parts = notice.trim().split("-");
  if (parts.length === 2) {
    const year = "20" + parts[0];
    const number = parts[1].padStart(5, "0");
    return `충북-청주-${year}-${number}`;
  }
  if (parts.length === 4) {
    const year = "20" + parts[2];
    const number = parts[3].padStart(5, "0");
    return `${parts[0]}-${parts[1]}-${year}-${number}`;
  }
  return null;
}

function handleSearch() {
  const input = document.getElementById("noticeInput").value;
  const formatted = formatNotice(input);
  if (!formatted) {
    alert("형식이 올바르지 않아요. 예: 24-1 또는 충북-청주-24-1");
    return;
  }

  const url = `http://pawinhand.kr/link/linker.html?type=abandon&idx=${formatted}`;
  window.open(url, "_blank");

  saveHistory(input);
  renderHistory();
}

function saveHistory(item) {
  let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  history.unshift({ value: item, timestamp: new Date().toISOString() });
  history = history.slice(0, 20);
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

window.onload = function () {
  renderHistory();
  document.getElementById("searchBtn").addEventListener("click", handleSearch);
};
