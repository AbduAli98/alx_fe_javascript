let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Inspiration" },
  { text: "Don’t watch the clock; do what it does. Keep going.", category: "Time" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

function displayRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  quoteDisplay.innerHTML = `"${randomQuote.text}" <br> <em>- ${randomQuote.category}</em>`;
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text !== "" && category !== "") {
    quotes.push({ text: text, category: category });
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("Quote added successfully!");
  } else {
    alert("Please fill both fields!");
  }
}

function createAddQuoteForm() {
  const formDiv = document.createElement("div");

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.onclick = addQuote;

  formDiv.appendChild(inputText);
  formDiv.appendChild(inputCategory);
  formDiv.appendChild(addBtn);

  document.body.appendChild(formDiv);
}

newQuoteBtn.addEventListener("click", displayRandomQuote);

createAddQuoteForm();