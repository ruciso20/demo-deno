const usersList = document.getElementById("usersList");
const projectsList = document.getElementById("projectsList");
const assignmentsList = document.getElementById("assignmentsList");

const usersEmpty = document.getElementById("usersEmpty");
const projectsEmpty = document.getElementById("projectsEmpty");
const assignmentsEmpty = document.getElementById("assignmentsEmpty");

function toggleEmptyState(list, emptyMsg) {
  if (list.children.length === 0) {
    emptyMsg.classList.remove("hidden");
  } else {
    emptyMsg.classList.add("hidden");
  }
}

async function loadUsers() {
  const res = await fetch("/users");
  const users = await res.json();
  usersList.innerHTML = "";

  users.forEach(user => {
    const li = document.createElement("li");
    li.className = "card";

    const info = document.createElement("span");
    info.textContent = `${user.name} (${user.role}) - ${user.email}`;

    const actions = document.createElement("div");
    actions.className = "actions";

    const assignBtn = document.createElement("button");
    assignBtn.textContent = "Asignar";
    assignBtn.className = "btn btn--success";
    assignBtn.onclick = async () => {
      const res = await fetch("/projects");
      const projects = await res.json();
      const projectId = prompt("Ingrese ID del proyecto:\n" +
        projects.map(p => `${p.id}: ${p.name}`).join("\n"));
      if (projectId) {
        await fetch(`/users/${user.id}/assign/${projectId}`, { method: "POST" });
        loadAssignments();
      }
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Eliminar";
    deleteBtn.className = "btn btn--danger";
    deleteBtn.onclick = async () => {
      await fetch(`/users/${user.id}`, { method: "DELETE" });
      loadUsers();
      loadAssignments();
    };

    actions.append(assignBtn, deleteBtn);
    li.append(info, actions);
    usersList.appendChild(li);
  });

  toggleEmptyState(usersList, usersEmpty);
}

async function loadProjects() {
  const res = await fetch("/projects");
  const projects = await res.json();
  projectsList.innerHTML = "";

  projects.forEach(p => {
    const li = document.createElement("li");
    li.className = "card";

    const info = document.createElement("span");
    info.textContent = `${p.name} - ${p.description}`;

    const actions = document.createElement("div");
    actions.className = "actions";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Eliminar";
    deleteBtn.className = "btn btn--danger";
    deleteBtn.onclick = async () => {
      await fetch(`/projects/${p.id}`, { method: "DELETE" });
      loadProjects();
      loadAssignments();
    };

    actions.append(deleteBtn);
    li.append(info, actions);
    projectsList.appendChild(li);
  });

  toggleEmptyState(projectsList, projectsEmpty);
}

async function loadAssignments() {
  const res = await fetch("/assignments");
  const assignments = await res.json();
  assignmentsList.innerHTML = "";

  assignments.forEach(a => {
    const li = document.createElement("li");
    li.className = "card";

    const info = document.createElement("span");
    info.textContent = `Usuario ${a.userId} → ${a.projectName} [${a.status}]`;

    const actions = document.createElement("div");
    actions.className = "actions";

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remover";
    removeBtn.className = "btn btn--danger";
    removeBtn.onclick = async () => {
      await fetch(`/users/${a.userId}/assign/${a.projectId}`, { method: "DELETE" });
      loadAssignments();
    };

    actions.append(removeBtn);
    li.append(info, actions);
    assignmentsList.appendChild(li);
  });

  toggleEmptyState(assignmentsList, assignmentsEmpty);
}

// Formularios
document.getElementById("userForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const role = document.getElementById("role").value;

  await fetch("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, role })
  });

  e.target.reset();
  loadUsers();
});

document.getElementById("projectForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("projectName").value;
  const desc = document.getElementById("projectDesc").value;

  await fetch("/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description: desc })
  });

  e.target.reset();
  loadProjects();
});

// Inicializar
loadUsers();
loadProjects();
loadAssignments();
