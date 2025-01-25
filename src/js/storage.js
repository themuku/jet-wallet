export function setActiveAccount(account) {
  localStorage.setItem("activeAccount", JSON.stringify(account));
}

export function getActiveAccount() {
  return JSON.parse(localStorage.getItem("activeAccount"));
}

export function logoutAccount() {
  localStorage.removeItem("activeAccount");
}
