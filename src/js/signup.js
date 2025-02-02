import validator from "validator";
import { fetchUsers } from "./api";
import dayjs from "dayjs";
import bcrypt from "bcryptjs";

const form = document.querySelector("form");

function generateRandomAccNumberAndCvv() {
  let accNumber = "";
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      accNumber += Math.floor(Math.random() * 10);
    }

    if (i !== 3) {
      accNumber += " ";
    }
  }

  let cvv = "";

  for (let i = 0; i < 3; i++) {
    cvv += Math.floor(Math.random() * 10);
  }

  return [cvv, accNumber];
}

function hexColorGenerator() {
  let color = "";

  for (let i = 0; i < 6; i++) {
    let randomNumber = Math.floor(Math.random() * 16);
    let letters = "ABCDEF";

    if(randomNumber > 9) {
      color += letters[randomNumber - 10];
    } else {
      color += randomNumber;
    }
  }

  return color;
 }

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = event.target[0].value;
  const fullName = event.target[1].value;
  const birthdate = event.target[2].value;
  const phoneNumber = event.target[3].value;
  const password = event.target[4].value;

  if (
    !validator.isEmail(email) ||
    validator.isEmpty(fullName) ||
    !validator.isDate(birthdate) ||
    !validator.isMobilePhone(phoneNumber, "az-AZ") ||
    !validator.isStrongPassword(password)
  ) {
    // toast(false, "Enter valid credentials");
    return;
  }

  fetchUsers().then((accounts) => {
    const foundAccount = accounts.find((acc) => acc.email === email);

    if (foundAccount) {
      alert("This email is already in use");
      return;
    } else {
      let initials = fullName.split(" ").map(t => t[0].toUpperCase()).join("");

      const newUser = {
        email,
        fullName,
        birthdate,
        phoneNumber,
        password: bcrypt.hashSync(password, 10),
        profileImage: `https://placehold.co/400X400/${hexColorGenerator()}/${hexColorGenerator()}?text=${initials}`,
        balance: 0,
        history: [],
        cvv: generateRandomAccNumberAndCvv()[0],
        expiryDate: dayjs(
          new Date().setFullYear(new Date().getFullYear() + 5)
        ).format("DD-MM-YYYY"),
        cashback: 0,
        accountNumber: generateRandomAccNumberAndCvv()[1],
      };

      fetch("http://localhost:5003/accounts", {
        method: "POST",
        body: JSON.stringify(newUser),
      }).then((_) => {
        window.location = "login.html";
      });
    }
  });
});

// GET, POST, PUT, PATCH, DELETE

// https://placehold.co/400X400/${}/FFF?text=NS