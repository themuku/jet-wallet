import { fetchUser, fetchUsers } from "./api";
import { getAccount, logoutAccount, setAccount } from "./storage";
import { toast } from "./toast";
import dayjs from "dayjs";

const navProfile = document.querySelector(".nav-profile");
const logoutBtn = document.querySelector(".logout-btn");
const userAccountNumber = document.querySelector(".account-number");
const main = document.querySelector("main");
const showBtn = document.querySelector(".show-btn");
const hideBtn = document.querySelector(".hide-btn");
const balance = document.querySelector(".balance");
const cvv = document.querySelector(".cvv");
const expiryDate = document.querySelector(".expiry-date");
const historyList = document.querySelector(".history-panel ul");
const clearAll = document.querySelector(".clear-all");
const transferBtn = document.querySelector(".transfer-btn");
const cashbackAmount = document.querySelector(".cashback-amount");
const withdrawCashbackBtn = document.querySelector(".withdraw-btn");
const changeCurrencyBtn = document.querySelector(".change-currency");

const CASHBACK_RATE = 0.05;

let isCvvVisible = false;
let currency = "JETCOIN";

let accountId = getAccount();
let account = fetchUser(accountId);
let accounts = fetchUsers();

fetchUser(accountId).then((account) => {
  refreshUI(account)
});

logoutBtn.addEventListener("click", () => {
  logoutAccount();
  window.location = "login.html";
});

userAccountNumber.addEventListener("click", (event) => {
  navigator.clipboard.writeText(event.target.textContent);
  main.innerHTML += toast(false, "Copied");

  setTimeout(() => {
    main.innerHTML = main.innerHTML.replaceAll(toast(false, "Copied"), "");
  }, 2000);
});

showBtn.addEventListener("click", () => {
  showBtn.style.display = "none";
  hideBtn.style.display = "inline-block";

  balance.textContent = "*".repeat(4) + " AZN";
});

hideBtn.addEventListener("click", () => {
  hideBtn.style.display = "none";
  showBtn.style.display = "inline-block";

  fetchUser(accountId).then((account) => {
    refreshUI(account)
  });
});

cvv.addEventListener("click", () => {
  fetchUser(accountId).then((account) => {
    if (isCvvVisible) {
      cvv.textContent = "***";
      isCvvVisible = false;
    } else {
      cvv.textContent = account.cvv;
      isCvvVisible = true;
    }
  });
});

transferBtn.addEventListener("click", (event) => {
  event.preventDefault();

  const accNumber = document.getElementById("account-number").value;
  const amount = +document.getElementById("amount").value;

  fetchUsers().then((accounts) => {
    fetchUser(accountId).then((account) => {
      const foundAccount = accounts.find(
        (acc) => acc.accountNumber === accNumber
      );

      if (!foundAccount) {
        main.innerHTML += toast(true, "User not found");

        setTimeout(() => {
          main.innerHTML = main.innerHTML.replaceAll(
            toast(true, "User not found"),
            ""
          );
        }, 2000);

        return;
      }

      if (account.balance < amount) {
        main.innerHTML += toast(true, "Not sufficient funds");

        setTimeout(() => {
          main.innerHTML = main.innerHTML.replaceAll(
            toast(true, "Not sufficient funds"),
            ""
          );
        }, 2000);

        return;
      }

      if (account.balance < 1) {
        main.innerHTML += toast(true, "Enter amount greater than 1");

        setTimeout(() => {
          main.innerHTML = main.innerHTML.replaceAll(
            toast(true, "Enter amount greater than 1"),
            ""
          );
        }, 2000);

        return;
      }

      if (account.accountNumber === accNumber) {
        main.innerHTML += toast(true, "Can't transfer to yourself");

        setTimeout(() => {
          main.innerHTML = main.innerHTML.replaceAll(
            toast(true, "Can't transfer to yourself"),
            ""
          );
        }, 2000);

        return;
      }

      foundAccount.balance += amount;
      account.balance -= amount;
      account.cashback += amount * CASHBACK_RATE;

      foundAccount.history.push({
        from: account.fullName,
        to: "",
        amount,
        date: new Date()
      });

      account.history.push({
        to: foundAccount.fullName,
        from: "",
        amount: 0 - amount,
        date: new Date()
      });

      fetch(`http://localhost:5003/accounts/${accountId}`, {
        method: "PUT",
        body: JSON.stringify(account),
      });

      fetch(`http://localhost:5003/accounts/${foundAccount.id}`, {
        method: "PUT",
        body: JSON.stringify(foundAccount),
      });

      refreshUI(account)
      main.innerHTML += toast();
      setTimeout(() => {
        main.innerHTML = main.innerHTML.replaceAll(toast(), "");
      }, 2000);

      document.getElementById("account-number").value = "";
      document.getElementById("amount").value = "";
    });
  });
});

function renderHistoryList(list) {
  historyList.innerHTML = "";

  if (list.length < 0) return;

  list.toReversed().forEach((transaction) => {
    const condition = transaction.amount > 0;
    const message = condition ? transaction.from : transaction.to;
    const amount = condition ? transaction.amount : 0 - transaction.amount;

    historyList.innerHTML += `
    <li>
      <div>
        <i class="fa-solid fa-circle-${condition > 0 ? "plus" : "minus"} ${
      condition > 0 ? "plus" : "minus"
    }"></i> <span>${message} <span>${dayjs(transaction.date).format(
      "DD.MM.YYYY, HH:mm"
    )}</span></span>
      </div>
      <p class="${condition > 0 ? "plus" : "minus"}">${
      condition ? "+" : "-"
    }${amount} AZN</p>
    </li>
    `;
  });
}

clearAll.addEventListener("click", () => {
    const data = {
      history: []
    };

    fetch(`http://localhost:5003/accounts/${accountId}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
    renderHistoryList([]);
});

function renderCashbackPanel(amount, currency = "JETCOIN") {
  switch (currency) {
    case "JETCOIN":
      currency = "<span><span>JET</span>Coins</span>";
      amount *= 100;
      break;
    case "AZN":
      currency = "AZN";
      break;
    default:
      currency = "<span><span>JET</span>Coins</span>";
      break;
  }

  cashbackAmount.innerHTML = `
   ${amount === 0 ? 0 : amount - Math.floor(amount) === 0 ? amount : amount.toFixed(2)} ${currency}
  `;
}

renderCashbackPanel(account.cashback);

changeCurrencyBtn.addEventListener("click", () => {
  fetchUser(accountId).then((account) => {
    if (currency == "JETCOIN") {
      renderCashbackPanel(account.cashback);
      currency = "AZN";
    } else {
      renderCashbackPanel(account.cashback, currency);
      currency = "JETCOIN";
    }
  });
});

withdrawCashbackBtn.addEventListener("click", () => {
  fetchUser(accountId).then((account) => {
    account.balance += account.cashback;
    account.cashback = 0;
    renderCashbackPanel(account.cashback, currency);
    balance.textContent = `${account.balance} AZN`;
    setAccount(accounts, "accounts");
  });
});


function refreshUI(account) {
  console.log(account);
  
  navProfile.querySelector("span").textContent = account.fullName;
  navProfile.querySelector("img").src = account.profileImage;
  userAccountNumber.textContent = account.accountNumber;
  balance.textContent = `${account.balance} AZN`;
  expiryDate.textContent = dayjs(account.expiryDate).format("MM/YY");
  renderHistoryList(account.history);
  renderCashbackPanel(account.cashback, currency);
}