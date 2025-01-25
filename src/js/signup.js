import validator from "validator";

const form = document.querySelector("form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = event.target[0].value;
  const fullName = event.target[1].value;
  const birthdate = event.target[2].value;
  const phoneNumber = event.target[3].value;
  const password = event.target[4].value;

  if (
    validator.isEmail(email) &&
    !validator.isEmpty(fullName) &&
    validator.isDate(birthdate) &&
    validator.isMobilePhone(phoneNumber, "az-AZ") &&
    validator.isStrongPassword(password)
  ) {
    window.location = "login.html";
    return;
  }
});
