import { accounts } from "./constants";
import { setActiveAccount } from "./storage";

const form = document.querySelector("form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = event.target[0].value;
  const password = event.target[1].value;

  const foundAccount = accounts.find(
    (acc) => acc.email === email && acc.password === password
  );

  if (foundAccount) {
    setActiveAccount(foundAccount);
    window.location = "main.html";
    return;
  }

  alert("Invalid credentials");
});
