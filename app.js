function formatNotice(notice) {
  const parts = notice.trim().split("-");
  if (parts.length !== 4) return null;
  const year = "20" + parts[2];
  const number = parts[3].padStart(5, "0");
  return \`\${parts[0]}-\${parts[1]}-\${year}-\${number}\`;
}

function handleSearch() {
  const input = document.getElementById("noticeInput").value;
  const formatted = formatNotice(input);
  if (!formatted) {
    alert("형식이 올바르지 않아요. 예: 충북-청주-25-1");
    return;
  }

  const url = \`http://pawinhand.kr/link/linker.html?type=abandon&idx=\${formatted}\`;
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

window.onload = renderHistory;
