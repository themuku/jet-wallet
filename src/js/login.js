import { accounts as allAccounts } from "./constants";
import { setAccount, getAccount } from "./storage";

let accounts = getAccount("accounts") ? getAccount("accounts") : allAccounts;

const form = document.querySelector("form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = event.target[0].value;
  const password = event.target[1].value;

  const foundAccount = accounts.find(
    (acc) => acc.email === email && acc.password === password
  );

  if (foundAccount) {
    setAccount(foundAccount);
    window.location = "main.html";
    return;
  }

  alert("Invalid credentials");
});
