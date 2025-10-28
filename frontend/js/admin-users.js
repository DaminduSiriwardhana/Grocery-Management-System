const API_BASE_URL = "http://localhost:8080"

// Load all users on page load
document.addEventListener("DOMContentLoaded", loadUsers)

async function loadUsers() {
  try {
    const response = await fetch(`${API_BASE_URL}/users`)
    const users = await response.json()

    displayUsers(users)
    updateStats(users)
  } catch (error) {
    console.error("Error loading users:", error)
    document.getElementById("userTableBody").innerHTML =
      '<tr><td colspan="7" style="text-align: center; color: red;">Error loading users</td></tr>'
  }
}

function displayUsers(users) {
  const tbody = document.getElementById("userTableBody")

  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #7f8c8d;">No users found</td></tr>'
    return
  }

  tbody.innerHTML = users
    .map(
      (user) => `
        <tr>
            <td>${user.userId}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.phone || "N/A"}</td>
            <td>
                <span class="role-badge role-${user.role.toLowerCase().replace("_", "-")}">
                    ${user.role.replace("_", " ")}
                </span>
            </td>
            <td>${user.city || "N/A"}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editUser(${user.userId})">Edit</button>
                    <button class="btn-delete" onclick="deleteUser(${user.userId})">Delete</button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("")
}

function updateStats(users) {
  document.getElementById("totalUsers").textContent = users.length
  document.getElementById("totalCustomers").textContent = users.filter((u) => u.role === "CUSTOMER").length
  document.getElementById("totalAdmins").textContent = users.filter((u) => u.role === "ADMIN").length
  document.getElementById("totalManagers").textContent = users.filter((u) => u.role === "STORE_MANAGER").length
}

function openAddUserModal() {
  document.getElementById("modalTitle").textContent = "Add New User"
  document.getElementById("userForm").reset()
  document.getElementById("userId").value = ""
  document.getElementById("password").required = true
  document.getElementById("userModal").style.display = "block"
}

function closeUserModal() {
  document.getElementById("userModal").style.display = "none"
}

function editUser(userId) {
  fetch(`${API_BASE_URL}/users/${userId}`)
    .then((response) => response.json())
    .then((user) => {
      document.getElementById("modalTitle").textContent = "Edit User"
      document.getElementById("userId").value = user.userId
      document.getElementById("username").value = user.username
      document.getElementById("email").value = user.email
      document.getElementById("phone").value = user.phone || ""
      document.getElementById("role").value = user.role
      document.getElementById("address").value = user.address || ""
      document.getElementById("city").value = user.city || ""
      document.getElementById("postalCode").value = user.postalCode || ""
      document.getElementById("password").required = false
      document.getElementById("password").placeholder = "Leave blank to keep current password"
      document.getElementById("userModal").style.display = "block"
    })
    .catch((error) => {
      console.error("Error loading user:", error)
      alert("Error loading user details")
    })
}

async function saveUser(event) {
  event.preventDefault()

  const userId = document.getElementById("userId").value
  const userData = {
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    phone: document.getElementById("phone").value,
    role: document.getElementById("role").value,
    address: document.getElementById("address").value,
    city: document.getElementById("city").value,
    postalCode: document.getElementById("postalCode").value,
  }

  try {
    let response
    if (userId) {
      // Update existing user
      response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
    } else {
      // Create new user
      response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
    }

    if (response.ok) {
      alert(userId ? "User updated successfully" : "User created successfully")
      closeUserModal()
      loadUsers()
    } else {
      alert("Error saving user")
    }
  } catch (error) {
    console.error("Error saving user:", error)
    alert("Error saving user")
  }
}

async function deleteUser(userId) {
  if (confirm("Are you sure you want to delete this user?")) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        alert("User deleted successfully")
        loadUsers()
      } else {
        alert("Error deleting user")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Error deleting user")
    }
  }
}

// Close modal when clicking outside of it
window.onclick = (event) => {
  const modal = document.getElementById("userModal")
  if (event.target === modal) {
    modal.style.display = "none"
  }
}
