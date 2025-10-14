const main = document.getElementById('main')
let balance = document.getElementById("balance")
balance.textContent = 100


function renderDashboard(cardsSection, totalBalance, totalSpent, savingsPercentage, topSpendCategory) {

  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  // Separate income, expense, savings
  let totalIncome = 0;
  let totalExpense = 0;
  let totalSavings = 0;

  const categoryTotals = {};

  transactions.forEach((tx) => {
    if (tx.type === "income") {
      totalIncome += tx.amount;
    } else if (tx.type === "expense") {
      totalExpense += tx.amount;
    } else if (tx.type === "savings") {
      totalSavings += tx.amount;
    }

    // category-wise grouping
    if (!categoryTotals[tx.category]) {
      categoryTotals[tx.category] = { amount: 0, type: tx.type };
    }
    categoryTotals[tx.category].amount += tx.amount;
  });


  const balance = totalIncome - totalExpense - totalSavings;
  const savingPercent = totalIncome ? Math.round((totalSavings / totalIncome) * 100) : 0;

  let topCategory = "-";
  let maxSpend = 0;
  for (const [category, info] of Object.entries(categoryTotals)) {
    if (info.type === "expense" && info.amount > maxSpend) {
      maxSpend = info.amount;
      topCategory = category;
    }
  }

  let cardBalance = document.getElementById("card-balance")
  cardBalance.textContent = `₹${balance.toLocaleString()}`;
  totalBalance.textContent = `₹${balance.toLocaleString()}`;
  totalSpent.textContent = `₹${totalExpense.toLocaleString()}`;
  savingsPercentage.textContent = `${savingPercent}%`;
  topSpendCategory.textContent = topCategory;

  cardsSection.innerHTML = "";
  const maxValue = Math.max(...Object.values(categoryTotals).map(c => c.amount), 1);

  for (const [name, data] of Object.entries(categoryTotals)) {
    const div = document.createElement("div");
    div.classList.add("category");

    const spanName = document.createElement("span");
    spanName.textContent = name;
    spanName.classList.add(data.type);

    const progress = document.createElement("progress");
    progress.value = data.amount;
    progress.max = maxValue;

    const spanAmount = document.createElement("span");
    spanAmount.textContent = `₹${data.amount.toLocaleString()}`;
    spanAmount.classList.add(data.type);

    div.append(spanName, progress, spanAmount);
    cardsSection.appendChild(div);
  }
}

const loadPage = async (page) => {
  try {
    const res = await fetch(`pages/${page}.html`);
    if (!res.ok) {
      main.innerHTML = '<h2>Page not found</h2>';
      return;
    }
    const html = await res.text();
    main.innerHTML = html;

    if (page === "dashboard") {
      const cardsSection = document.getElementById("category")
      let totalBalance = document.getElementById("balance")
      let totalSpent = document.getElementById("totalSpent")
      let savingsPercentage = document.getElementById("savings")
      let topSpendCategory = document.getElementById("spentCategory")
      renderDashboard(cardsSection, totalBalance, totalSpent, savingsPercentage, topSpendCategory)
    }

    if (page === "history") {
      const tableBody = document.querySelector("#transactions-table tbody");
      const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

      tableBody.innerHTML = "";

      if (transactions.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="6" style="text-align:center;">No transactions yet</td>`;
        tableBody.appendChild(row);
        return;
      }

      transactions.forEach((tx) => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td>${tx.date}</td>
      <td>${tx.category}</td>
      <td>${tx.desc}</td>
      <td>₹${tx.amount.toLocaleString()}</td>
      <td class="${tx.type}">${tx.type}</td>
      <td>
        <button class="delete-btn" data-id="${tx.id}">🗑️</button>
      </td>
    `;
        tableBody.appendChild(row);
      });

      // delete handler
      document.querySelectorAll(".delete-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => {
          const id = Number(e.target.dataset.id);
          const updated = transactions.filter((tx) => tx.id !== id);
          localStorage.setItem("transactions", JSON.stringify(updated));
          window.location.reload(); // refresh instantly
        })
      );
    }


    if (page === "expense") {
      initExpenseForm()
    }
  } catch (error) {
    main.innerHTML = '<h2>Error loading page</h2>';
  }
}

const router = () => {
  const page = window.location.hash.replace('#', '') || 'home';
  loadPage(page);
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);


function initExpenseForm() {
  const form = document.getElementById('expense-form')
  if (!form) return  // exit if form not found

  form.addEventListener('submit', e => {
    e.preventDefault()

    const desc = document.getElementById('desc')
    const amount = document.getElementById('amount')
    const date = document.getElementById('date')
    const type = document.getElementById('type')
    const category = document.getElementById('form-category')

    const id = Date.now()
    const newTransaction = {
      id,
      desc: desc.value,
      amount: parseFloat(amount.value),
      date: date.value,
      type: type.value,
      category: category.value
    }

    const transactions = JSON.parse(localStorage.getItem('transactions')) || []
    transactions.push(newTransaction)
    localStorage.setItem('transactions', JSON.stringify(transactions))

    e.target.reset()
    alert("Transaction Added")

  })
}
