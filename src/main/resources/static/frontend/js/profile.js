const API_BASE_URL = "http://localhost:8080"
let currentUser = null

document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile()
  loadOrderHistory()
})

function loadUserProfile() {
  const user = localStorage.getItem("currentUser")
  if (user) {
    currentUser = JSON.parse(user)
    document.getElementById("userDisplay").textContent = currentUser.username
    document.getElementById("profileUsername").value = currentUser.username
    document.getElementById("profileEmail").value = currentUser.email
    document.getElementById("profilePhone").value = currentUser.phone || ""
    document.getElementById("profileRole").value = currentUser.role
  }
}

function switchProfileTab(tabName) {
  document.querySelectorAll(".profile-tab").forEach((tab) => tab.classList.remove("active"))
  document.querySelectorAll(".profile-menu-btn").forEach((btn) => btn.classList.remove("active"))

  document.getElementById(tabName + "Tab").classList.add("active")
  event.target.classList.add("active")

  if (tabName === "orders") {
    loadOrderHistory()
  }
}

async function updateProfile(event) {
  event.preventDefault()

  const updatedUser = {
    ...currentUser,
    email: document.getElementById("profileEmail").value,
    phone: document.getElementById("profilePhone").value,
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/${currentUser.userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    })

    if (response.ok) {
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      alert("Profile updated successfully!")
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    alert("Failed to update profile")
  }
}

function resetProfileForm() {
  loadUserProfile()
}

function openAddressForm() {
  document.getElementById("addressModal").classList.add("active")
}

function closeAddressModal() {
  document.getElementById("addressModal").classList.remove("active")
}

async function saveAddress(event) {
  event.preventDefault()
  alert("Address saved successfully!")
  closeAddressModal()
  document.getElementById("addressForm").reset()
}

async function loadOrderHistory() {
  if (!currentUser) return

  try {
    const response = await fetch(`${API_BASE_URL}/orders/user/${currentUser.userId}`)
    const orders = await response.json()

    const timeline = document.getElementById("ordersTimeline")
    timeline.innerHTML = ""

    if (orders.length === 0) {
      timeline.innerHTML = '<p class="empty-message">No orders yet</p>'
      return
    }

    orders.forEach((order, index) => {
      const item = document.createElement("div")
      item.className = "timeline-item"
      item.innerHTML = `
        <div class="timeline-marker">${index + 1}</div>
        <div class="timeline-content">
          <div class="timeline-date">Order #${order.orderId}</div>
          <div class="timeline-details">
            Date: ${new Date(order.orderDate).toLocaleDateString()}<br>
            Total: $${order.totalAmount.toFixed(2)}<br>
            Status: <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
          </div>
        </div>
      `
      timeline.appendChild(item)
    })
  } catch (error) {
    console.error("Error loading order history:", error)
  }
}

function updatePreferences(event) {
  event.preventDefault()
  alert("Preferences updated successfully!")
}

function logout() {
  localStorage.removeItem("currentUser")
  window.location.href = "login.html"
}
