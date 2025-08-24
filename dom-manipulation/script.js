const STORAGE_KEY = "quotesData";          
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
    } catch (_) {  }
  }
})();

 
function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}
 
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn  = document.getElementById("newQuote");

 
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  
  quoteDisplay.innerHTML = `"${randomQuote.text}" <br> <em>- ${randomQuote.category}</em>`;

 
  sessionStorage.setItem(LAST_VIEWED_KEY, String(randomIndex));
}

newQuoteBtn.addEventListener("click", showRandomQuote);

 
function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl  = document.getElementById("newQuoteCategory");
  if (!textEl || !catEl) return; //  
  const text = textEl.value.trim();
  const category = catEl.value.trim();

  if (text !== "" && category !== "") {
    quotes.push({ text, category });
    saveQuotes();                 
    catEl.value  = "";
    alert("Quote added successfully!");
  } else {
    alert("Please fill both fields!");
  }
}

 
function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url  = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

 
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}
 
(function injectImportExportUI() {
  const container = document.createElement("div");
  container.style.marginTop = "12px";

  const exportBtn = document.createElement("button");
  exportBtn.id = "exportBtn";
  exportBtn.textContent = "Export JSON";
  exportBtn.addEventListener("click", exportToJsonFile);

  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.id = "importFile";
  importInput.accept = ".json";
  importInput.onchange = importFromJsonFile;  

  container.appendChild(exportBtn);
  container.appendChild(importInput);
  document.body.appendChild(container);
})();
 
 
(function firstPaint() {
  const lastIndex = Number(sessionStorage.getItem(LAST_VIEWED_KEY));
  if (!Number.isNaN(lastIndex) && quotes[lastIndex]) {
    const q = quotes[lastIndex];
    quoteDisplay.innerHTML = `"${q.text}" <br> <em>- ${q.category}</em>`;
  } else {
    showRandomQuote();
  }
})();