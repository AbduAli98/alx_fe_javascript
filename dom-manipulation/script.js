const STORAGE_KEY = "quotesData";
const FILTER_KEY  = "lastSelectedCategory";


let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Inspiration" }
];


function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}
function loadQuotes() {
  const json = localStorage.getItem(STORAGE_KEY);
  if (!json) return;
  try {
    const arr = JSON.parse(json);
    if (Array.isArray(arr)) quotes = arr;
  } catch (_) {}
}
loadQuotes();


const quoteDisplay   = document.getElementById("quoteDisplay");
const newQuoteBtn    = document.getElementById("newQuote");
const categorySelect = document.getElementById("categoryFilter");


function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  quoteDisplay.innerHTML = `"${randomQuote.text}" <br> <em>- ${randomQuote.category}</em>`;
}
newQuoteBtn.addEventListener("click", showRandomQuote);


function populateCategories() {
  if (!categorySelect) return;


  for (let i = categorySelect.options.length - 1; i >= 1; i--) {
    categorySelect.remove(i);
  }

  const cats = new Set(quotes.map(q => q.category).filter(Boolean));
  cats.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });

  const saved = localStorage.getItem(FILTER_KEY) || "all";
  const hasSaved = [...categorySelect.options].some(o => o.value === saved);
  categorySelect.value = hasSaved ? saved : "all";
}


function renderQuotes(list) {
  if (!list.length) {
    quoteDisplay.textContent = "No quotes to show.";
    return;
  }
  const lines = list.map(q => `"${q.text}" - ${q.category}`);
  quoteDisplay.textContent = lines.join("\n");
}

function filterQuotes() {
  if (!categorySelect) return;


  const selectedCategory = categorySelect.value;

  localStorage.setItem(FILTER_KEY, selectedCategory);


  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

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

    const previous = categorySelect ? categorySelect.value : "all";
    populateCategories();

    if (categorySelect) {
      categorySelect.value = (previous === "all" || previous === category) ? previous : previous;
    }


    filterQuotes();

    alert("Quote added successfully!");
  } else {
    alert("Please fill both fields!");
  }
}


populateCategories();
filterQuotes();