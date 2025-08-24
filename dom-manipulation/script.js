const STORAGE_KEY = "quotesData";
const FILTER_KEY  = "lastSelectedCategory";
const LAST_VIEWED_KEY = "lastViewedIndex";

let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Inspiration" }
];

(function loadQuotes() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr)) quotes = arr;
    } catch (_) {}
  }
})();

function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

const quoteDisplay   = document.getElementById("quoteDisplay");
const newQuoteBtn    = document.getElementById("newQuote");
const categorySelect = document.getElementById("categoryFilter");

function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  quoteDisplay.innerHTML = `"${randomQuote.text}" <br> <em>- ${randomQuote.category}</em>`;
  sessionStorage.setItem(LAST_VIEWED_KEY, String(randomIndex));
}
if (newQuoteBtn) newQuoteBtn.addEventListener("click", showRandomQuote);

function renderQuotes(list) {
  if (!list || !list.length) {
    quoteDisplay.textContent = "No quotes to show.";
    return;
  }
  quoteDisplay.textContent = list.map(q => `"${q.text}" - ${q.category}`).join("\n");
}

function populateCategories() {
  if (!categorySelect) return;
  for (let i = categorySelect.options.length - 1; i >= 1; i--) {
    categorySelect.remove(i);
  }
  const set = new Set(quotes.map(q => q.category).filter(Boolean));
  set.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
  const saved = localStorage.getItem(FILTER_KEY) || "all";
  const ok = [...categorySelect.options].some(o => o.value === saved);
  categorySelect.value = ok ? saved : "all";
}

function filterQuotes() {
  if (!categorySelect) return;
  const selectedCategory = categorySelect.value;
  localStorage.setItem(FILTER_KEY, selectedCategory);
  const filtered = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  renderQuotes(filtered);
}

function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl  = document.getElementById("newQuoteCategory");
  if (!textEl || !catEl) return;
  const text = textEl.value.trim();
  const category = catEl.value.trim();
  if (text !== "" && category !== "") {
    quotes.push({ text, category });
    saveQuotes();
    textEl.value = "";
    catEl.value  = "";
    populateCategories();
    filterQuotes();
    alert("Quote added successfully!");
  } else {
    alert("Please fill both fields!");
  }
}

async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=10");
    const data = await res.json();
    return data
      .map(it => ({ text: String(it.title || "").trim(), category: "Server" }))
      .filter(q => q.text.length > 0);
  } catch (e) {
    return [];
  }
}

async function pushLocalNewQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: quote.text, body: quote.category })
    });
  } catch (_) {}
}

let pendingConflicts = [];
let preSyncLocalSnapshot = [];

function showNotice(message, withResolveButton = false) {
  let bar = document.getElementById("syncNotice");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "syncNotice";
    bar.style.cssText = "position:fixed;left:12px;right:12px;bottom:12px;padding:10px;border:1px solid #ddd;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.15);font-family:system-ui;z-index:9999;display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap;";
    document.body.appendChild(bar);
  }
  bar.innerHTML = `<span>${message}</span>`;
  if (withResolveButton) {
    const btn = document.createElement("button");
    btn.textContent = "Resolve manually";
    btn.onclick = manualResolveConflicts;
    bar.appendChild(btn);
  }
  const close = document.createElement("button");
  close.textContent = "×";
  close.onclick = () => bar.remove();
  bar.appendChild(close);
}

function manualResolveConflicts() {
  if (!pendingConflicts.length) {
    showNotice("No conflicts to resolve.");
    return;
  }
  const localMap = new Map(preSyncLocalSnapshot.map(q => [q.text, q.category]));
  quotes = quotes.map(q => {
    if (localMap.has(q.text)) {
      const originalCat = localMap.get(q.text);
      return { ...q, category: originalCat };
    }
    return q;
  });
  saveQuotes();
  populateCategories();
  filterQuotes();
  pendingConflicts = [];
  showNotice("Conflicts resolved using your local categories.");
}

async function syncWithServer() {
  preSyncLocalSnapshot = quotes.map(q => ({ ...q }));
  const serverQuotes = await fetchQuotesFromServer();
  if (!serverQuotes.length) return;
  const localMap = new Map(quotes.map(q => [q.text, q.category]));
  const serverMap = new Map(serverQuotes.map(q => [q.text, q.category]));
  pendingConflicts = [];
  serverMap.forEach((srvCat, text) => {
    if (localMap.has(text) && localMap.get(text) !== srvCat) {
      pendingConflicts.push({ text, localCategory: localMap.get(text), serverCategory: srvCat });
    }
  });
  quotes = quotes.map(q => {
    if (serverMap.has(q.text)) {
      return { ...q, category: serverMap.get(q.text) };
    }
    return q;
  });
  const existingTexts = new Set(quotes.map(q => q.text));
  serverQuotes.forEach(srvQ => {
    if (!existingTexts.has(srvQ.text)) {
      quotes.push(srvQ);
    }
  });
  saveQuotes();
  populateCategories();
  if (categorySelect) filterQuotes(); else renderQuotes(quotes);
  const addedCount = serverQuotes.filter(s => !localMap.has(s.text)).length;
  const confCount  = pendingConflicts.length;
  if (addedCount || confCount) {
    const msg = `Synced: ${addedCount} new from server` + (confCount ? `, ${confCount} conflict(s) resolved (server wins).` : ".");
    showNotice(msg, !!confCount);
  }
}

async function syncQuotes() {
  await syncWithServer();
}

syncWithServer();
setInterval(syncWithServer, 30000);

populateCategories();
const last = Number(sessionStorage.getItem(LAST_VIEWED_KEY));
if (!Number.isNaN(last) && quotes[last]) {
  const q = quotes[last];
  quoteDisplay.innerHTML = `"${q.text}" <br> <em>- ${q.category}</em>`;
} else {
  if (categorySelect) filterQuotes(); else showRandomQuote();
}
