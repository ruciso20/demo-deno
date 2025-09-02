document.getElementById("loadUsers").addEventListener("click", async () => {
  try {
    const res = await fetch("/users");
    if (!res.ok) throw new Error("Error al obtener usuarios");
    const users = await res.json();

    const userList = document.getElementById("userList");
    userList.innerHTML = "";

    users.forEach(u => {
      const li = document.createElement("li");
      li.textContent = `${u.id} - ${u.name}`;
      userList.appendChild(li);
    });
  } catch (err) {
    alert("Hubo un error: " + err.message);
  }
});

