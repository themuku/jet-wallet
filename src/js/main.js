import { accounts as allAccounts } from "./constants";
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
// const operationsPanel = document.querySelector(".operations-panel");
const historyList = document.querySelector(".history-panel ul");
const clearAll = document.querySelector(".clear-all");
const transferBtn = document.querySelector(".transfer-btn");
const cashbackAmount = document.querySelector(".cashback-amount");
const withdrawCashbackBtn = document.querySelector(".withdraw-btn");
const changeCurrencyBtn = document.querySelector(".change-currency");

const CASHBACK_RATE = 0.05;

let isCvvVisible = false;
let currency = "JETCOIN";

let accounts = getAccount("accounts") ? getAccount("accounts") : allAccounts;

const accNum = getAccount().accountNumber;
let account = accounts.find((acc) => acc.accountNumber === accNum);

navProfile.querySelector("span").textContent = account.fullName;
navProfile.querySelector("img").src = account.profileImage;
userAccountNumber.textContent = account.accountNumber;
balance.textContent = `${account.balance} AZN`;
expiryDate.textContent = dayjs(account.expiryDate).format("MM/YY");

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

  balance.textContent = "*".repeat(String(account.balance).length) + " AZN";
});

hideBtn.addEventListener("click", () => {
  hideBtn.style.display = "none";
  showBtn.style.display = "inline-block";

  balance.textContent = `${account.balance} AZN`;
});

cvv.addEventListener("click", () => {
  console.log(isCvvVisible, account.cvv);

  if (isCvvVisible) {
    cvv.textContent = "***";
    isCvvVisible = false;
  } else {
    cvv.textContent = account.cvv;
    isCvvVisible = true;
  }
});

transferBtn.addEventListener("click", (event) => {
  event.preventDefault();

  const accNumber = document.getElementById("account-number").value;
  const amount = +document.getElementById("amount").value;

  const foundAccount = accounts.find((acc) => acc.accountNumber === accNumber);
  console.log(
    accounts.find((acc) => {
      console.log(accNumber);
      return acc.accountNumber === accNumber;
    })
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
  });

  account.history.push({
    to: foundAccount.fullName,
    from: "",
    amount: 0 - amount,
  });

  renderCashbackPanel(account.cashback, currency);

  setAccount(account);
  setAccount(accounts, "accounts");

  renderHistoryList(account.history);
  balance.textContent = `${account.balance} AZN`;
  main.innerHTML += toast();
  setTimeout(() => {
    main.innerHTML = main.innerHTML.replaceAll(toast(), "");
  }, 2000);

  document.getElementById("account-number").value = "";
  document.getElementById("amount").value = "";
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

renderHistoryList(account.history);

clearAll.addEventListener("click", () => {
  account.history = [];
  setAccount(accounts, "accounts");
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
   ${amount} ${currency}
  `;
}

renderCashbackPanel(account.cashback);

changeCurrencyBtn.addEventListener("click", () => {
  if (currency == "JETCOIN") {
    renderCashbackPanel(account.cashback);
    currency = "AZN";
  } else {
    renderCashbackPanel(account.cashback, currency);
    currency = "JETCOIN";
  }
});

withdrawCashbackBtn.addEventListener("click", () => {
  account.balance += account.cashback;
  account.cashback = 0;
  renderCashbackPanel(account.cashback, currency);
  balance.textContent = `${account.balance} AZN`;
  setAccount(accounts, "accounts");
});
