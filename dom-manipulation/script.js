let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Inspiration" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addBtn = document.getElementById("addBtn");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");

let currentIndex = 0;

function showNextQuote() {
  const q = quotes[currentIndex];
  quoteDisplay.textContent = `"${q.text}" - ${q.category}`;
  currentIndex = (currentIndex + 1) % quotes.length; 
}
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (text && category) {
    quotes.push({ text: text, category: category });
    newQuoteText.value = "";
    newQuoteCategory.value = "";
    alert("Quote added successfully!");
  } else {
    alert("Please fill both fields!");
  }
}

newQuoteBtn.onclick = showNextQuote;


