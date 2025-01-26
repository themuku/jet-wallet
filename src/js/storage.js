export function setAccount(account, key = "activeAccount") {
  localStorage.setItem(key, JSON.stringify(account));
}

export function getAccount(key = "activeAccount") {
  return JSON.parse(localStorage.getItem(key));
}

export function logoutAccount(key = "activeAccount") {
  localStorage.removeItem(key);
}
