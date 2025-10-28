const API_BASE_URL = "http://localhost:8080"
let allDeliveries = []
let currentUser = null
let selectedTrackingId = null

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAccess()
  loadDeliveryData()
})

function checkAdminAccess() {
  const user = localStorage.getItem("currentUser")
  if (!user) {
    window.location.href = "login.html"
    return
  }

  currentUser = JSON.parse(user)
  if (currentUser.role !== "ADMIN" && currentUser.role !== "STORE_MANAGER") {
    alert("Access denied")
    window.location.href = "index.html"
  }

  document.getElementById("userDisplay").textContent = currentUser.username
}

async function loadDeliveryData() {
  try {
    const response = await fetch(`${API_BASE_URL}/delivery`)
    allDeliveries = await response.json()
    displayDeliveryTable(allDeliveries)
    updateDeliveryStats()
  } catch (error) {
    console.error("Error loading deliveries:", error)
  }
}

function displayDeliveryTable(deliveries) {
  const tbody = document.getElementById("deliveryTableBody")
  tbody.innerHTML = ""

  deliveries.forEach((delivery) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${delivery.trackingId}</td>
      <td>#${delivery.order.orderId}</td>
      <td>${delivery.deliveryPerson ? delivery.deliveryPerson.username : "Unassigned"}</td>
      <td><span class="status-badge status-${delivery.currentStatus.toLowerCase()}">${delivery.currentStatus}</span></td>
      <td>${delivery.currentLocation || "N/A"}</td>
      <td>${delivery.estimatedDeliveryTime ? new Date(delivery.estimatedDeliveryTime).toLocaleString() : "N/A"}</td>
      <td>${delivery.actualDeliveryTime ? new Date(delivery.actualDeliveryTime).toLocaleString() : "Pending"}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-secondary" onclick="openUpdateDelivery(${delivery.trackingId})">Update</button>
        </div>
      </td>
    `
    tbody.appendChild(row)
  })
}

function updateDeliveryStats() {
  const totalDeliveries = allDeliveries.length
  const inTransit = allDeliveries.filter((d) => d.currentStatus === "IN_TRANSIT").length
  const completed = allDeliveries.filter(
    (d) =>
      d.currentStatus === "DELIVERED" && new Date(d.actualDeliveryTime).toDateString() === new Date().toDateString(),
  ).length
  const failed = allDeliveries.filter((d) => d.currentStatus === "FAILED").length

  document.getElementById("totalDeliveries").textContent = totalDeliveries
  document.getElementById("inTransitCount").textContent = inTransit
  document.getElementById("completedToday").textContent = completed
  document.getElementById("failedCount").textContent = failed
}

function filterDeliveries() {
  const status = document.getElementById("statusFilter").value
  const filtered = status ? allDeliveries.filter((d) => d.currentStatus === status) : allDeliveries
  displayDeliveryTable(filtered)
}

function searchDeliveries() {
  const keyword = document.getElementById("deliverySearch").value
  const filtered = allDeliveries.filter((d) => d.order.orderId.toString().includes(keyword))
  displayDeliveryTable(filtered)
}

function openUpdateDelivery(trackingId) {
  selectedTrackingId = trackingId
  const delivery = allDeliveries.find((d) => d.trackingId === trackingId)
  if (delivery) {
    document.getElementById("deliveryStatus").value = delivery.currentStatus
    document.getElementById("currentLocation").value = delivery.currentLocation || ""
    document.getElementById("estimatedTime").value = delivery.estimatedDeliveryTime
      ? new Date(delivery.estimatedDeliveryTime).toISOString().slice(0, 16)
      : ""
    document.getElementById("deliveryModal").classList.add("active")
  }
}

function closeDeliveryModal() {
  document.getElementById("deliveryModal").classList.remove("active")
}

async function updateDelivery(event) {
  event.preventDefault()

  const delivery = {
    currentStatus: document.getElementById("deliveryStatus").value,
    currentLocation: document.getElementById("currentLocation").value,
    estimatedDeliveryTime: document.getElementById("estimatedTime").value,
  }

  try {
    const response = await fetch(`${API_BASE_URL}/delivery/${selectedTrackingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(delivery),
    })

    if (response.ok) {
      alert("Delivery updated successfully")
      closeDeliveryModal()
      loadDeliveryData()
    }
  } catch (error) {
    console.error("Error updating delivery:", error)
  }
}

function logout() {
  localStorage.removeItem("currentUser")
  window.location.href = "login.html"
}
