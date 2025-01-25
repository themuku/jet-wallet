import { accounts } from "./constants";
import { getActiveAccount, logoutAccount, setActiveAccount } from "./storage";
import { toast } from "./toast";

const navProfile = document.querySelector(".nav-profile");
const logoutBtn = document.querySelector(".logout-btn");
const userAccountNumber = document.querySelector(".account-number");
const main = document.querySelector("main");
const showBtn = document.querySelector(".show-btn");
const hideBtn = document.querySelector(".hide-btn");
const balance = document.querySelector(".balance");
const cvv = document.querySelector(".cvv");
const expiryDate = document.querySelector(".expiry-date");
const operationsPanel = document.querySelector(".operations-panel");

const account = getActiveAccount();

let isCvvVisible = false;

const month = new Date(account.expiryDate).getMonth() + 1;

navProfile.querySelector("span").textContent = account.fullName;
navProfile.querySelector("img").src = account.profileImage;
userAccountNumber.textContent = account.accountNumber;
balance.textContent = `${account.balance} AZN`;
expiryDate.textContent = `${month < 10 ? `0${month}` : month}/${new Date(
  account.expiryDate
)
  .getFullYear()
  .toString()
  .substring(2)}`;

logoutBtn.addEventListener("click", () => {
  logoutAccount("activeAccount");
  window.location = "login.html";
});

userAccountNumber.addEventListener("click", (event) => {
  navigator.clipboard.writeText(event.target.textContent);
  main.innerHTML += toast();

  setTimeout(() => {
    main.innerHTML = main.innerHTML.replaceAll(toast(), "");
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
  if (isCvvVisible) {
    cvv.textContent = "***";
    isCvvVisible = false;
  } else {
    cvv.textContent = account.cvv;
    isCvvVisible = true;
  }
});

operationsPanel.addEventListener("submit", (event) => {
  event.preventDefault();

  const accNumber = event.target[0].value;
  const amount = +event.target[1].value;

  const foundAccount = accounts.find((acc) => acc.accountNumber === accNumber);

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
  setActiveAccount(account);
  balance.textContent = `${account.balance} AZN`;
  main.innerHTML += toast();
  setTimeout(() => {
    main.innerHTML = main.innerHTML.replaceAll(toast(), "");
  }, 2000);

  event.target[0].value = "";
  event.target[1].value = "";
});
