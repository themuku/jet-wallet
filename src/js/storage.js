export function setAccount(id, key = "id") {
  localStorage.setItem(key, JSON.stringify(id));
}

export function getAccount(key = "id") {
  return JSON.parse(localStorage.getItem(key));
}

export function logoutAccount(key = "id") {
  localStorage.removeItem(key);
}
