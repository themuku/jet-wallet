import { fetchUsers } from "./api";
import { setAccount } from "./storage";
import bcrypt from "bcryptjs"

const form = document.querySelector("form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = event.target[0].value;
  const password = event.target[1].value;

  fetchUsers().then((accounts) => {
    const foundAccount = accounts.find(
      (acc) => {
        if (acc.password.startsWith("$2a")) {
          return acc.email === email && bcrypt.compareSync(password, acc.password)
        } else {
          return acc.email === email && acc.password === password
        }
      }
    );

    console.log(foundAccount);

    if (foundAccount) {
      setAccount(foundAccount.id);
      window.location = "main.html";
      return;
    }

    alert("Invalid credentials");
  });
});
