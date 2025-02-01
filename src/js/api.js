export function fetchUsers() {
  const data = fetch("http://localhost:5003/accounts").then((res) =>
    res.json()
  );

  return data;
}

export function fetchUser(id) {
  const data = fetch(`http://localhost:5003/accounts/${id}`).then((res) =>
    res.json()
  );

  return data;
}
