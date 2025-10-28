const API_BASE_URL = "http://localhost:8080"
let allDeliveries = []

document.addEventListener("DOMContentLoaded", loadDeliveries)

async function loadDeliveries() {
  try {
    const response = await fetch(`${API_BASE_URL}/delivery`)
    allDeliveries = await response.json()
    displayDeliveries(allDeliveries)
    updateStats()
    displayDelayedAlerts()
  } catch (error) {
    console.error("Error loading deliveries:", error)
    document.getElementById("deliveryTableBody").innerHTML =
      '<tr><td colspan="8" style="text-align: center; color: red;">Error loading deliveries</td></tr>'
  }
}

function displayDeliveries(deliveries) {
  const tbody = document.getElementById("deliveryTableBody")

  if (deliveries.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #7f8c8d;">No deliveries found</td></tr>'
    return
  }

  tbody.innerHTML = deliveries
    .map(
      (delivery) => `
        <tr>
            <td>#${delivery.orderId}</td>
            <td>${delivery.deliveryPersonName}</td>
            <td>
                <span class="status-badge status-${delivery.currentStatus.toLowerCase().replace("_", "_")}">
                    ${delivery.currentStatus.replace(/_/g, " ")}
                </span>
            </td>
            <td>${delivery.currentLocation || "N/A"}</td>
            <td>${delivery.deliveryAddress}</td>
            <td>${delivery.estimatedDeliveryTime ? new Date(delivery.estimatedDeliveryTime).toLocaleString() : "N/A"}</td>
            <td>
                <span style="color: ${delivery.isDelayed ? "#e74c3c" : "#27ae60"}; font-weight: bold;">
                    ${delivery.minutesUntilDelivery !== null ? delivery.minutesUntilDelivery + " min" : "N/A"}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-update" onclick="openStatusModal(${delivery.trackingId})">Status</button>
                    <button class="btn-location" onclick="openLocationModal(${delivery.trackingId})">Location</button>
                    <button class="btn-view" onclick="viewDelivery(${delivery.trackingId})">View</button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("")
}

async function updateStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/delivery/analytics/statistics`)
    const stats = await response.json()

    document.getElementById("totalDeliveries").textContent = stats.TOTAL || 0
    document.getElementById("pendingDeliveries").textContent = stats.PENDING || 0
    document.getElementById("pickedUpDeliveries").textContent = stats.PICKED_UP || 0
    document.getElementById("inTransitDeliveries").textContent = stats.IN_TRANSIT || 0
    document.getElementById("deliveredDeliveries").textContent = stats.DELIVERED || 0
    document.getElementById("failedDeliveries").textContent = stats.FAILED || 0
  } catch (error) {
    console.error("Error loading statistics:", error)
  }
}

function displayDelayedAlerts() {
  const delayedDeliveries = allDeliveries.filter((d) => d.isDelayed)

  const alertsSection = document.getElementById("delayedAlertsSection")
  const alertsList = document.getElementById("delayedAlertsList")

  if (delayedDeliveries.length === 0) {
    alertsSection.style.display = "none"
    return
  }

  alertsSection.style.display = "block"
  alertsList.innerHTML = delayedDeliveries
    .map(
      (delivery) => `
        <div class="delayed-item">
            <strong>Order #${delivery.orderId}</strong> - ${delivery.deliveryAddress}
            <br><small>Delivery Person: ${delivery.deliveryPersonName} | Delayed by: ${Math.abs(delivery.minutesUntilDelivery)} minutes</small>
        </div>
    `,
    )
    .join("")
}

function filterDeliveries() {
  const statusFilter = document.getElementById("statusFilter").value

  const filtered = allDeliveries.filter((delivery) => {
    const matchesStatus = !statusFilter || delivery.currentStatus === statusFilter
    return matchesStatus
  })

  displayDeliveries(filtered)
}

function openStatusModal(trackingId) {
  document.getElementById("statusTrackingId").value = trackingId
  document.getElementById("statusModal").style.display = "block"
}

function closeStatusModal() {
  document.getElementById("statusModal").style.display = "none"
}

function openLocationModal(trackingId) {
  document.getElementById("locationTrackingId").value = trackingId
  document.getElementById("newLocation").value = ""
  document.getElementById("locationModal").style.display = "block"
}

function closeLocationModal() {
  document.getElementById("locationModal").style.display = "none"
}

function viewDelivery(trackingId) {
  const delivery = allDeliveries.find((d) => d.trackingId === trackingId)
  if (delivery) {
    alert(
      `Delivery Tracking #${delivery.trackingId}\n\nOrder: #${delivery.orderId}\nDelivery Person: ${delivery.deliveryPersonName}\nStatus: ${delivery.currentStatus}\nLocation: ${delivery.currentLocation || "N/A"}\nAddress: ${delivery.deliveryAddress}\nEstimated: ${delivery.estimatedDeliveryTime ? new Date(delivery.estimatedDeliveryTime).toLocaleString() : "N/A"}`,
    )
  }
}

async function updateStatus(event) {
  event.preventDefault()

  const trackingId = document.getElementById("statusTrackingId").value
  const newStatus = document.getElementById("newStatus").value

  try {
    const response = await fetch(`${API_BASE_URL}/delivery/${trackingId}/status?status=${newStatus}`, {
      method: "PUT",
    })

    if (response.ok) {
      alert("Delivery status updated successfully")
      closeStatusModal()
      loadDeliveries()
    } else {
      alert("Error updating delivery status")
    }
  } catch (error) {
    console.error("Error updating status:", error)
    alert("Error updating delivery status")
  }
}

async function updateLocation(event) {
  event.preventDefault()

  const trackingId = document.getElementById("locationTrackingId").value
  const newLocation = document.getElementById("newLocation").value

  try {
    const response = await fetch(
      `${API_BASE_URL}/delivery/${trackingId}/location?location=${encodeURIComponent(newLocation)}`,
      {
        method: "PUT",
      },
    )

    if (response.ok) {
      alert("Delivery location updated successfully")
      closeLocationModal()
      loadDeliveries()
    } else {
      alert("Error updating delivery location")
    }
  } catch (error) {
    console.error("Error updating location:", error)
    alert("Error updating delivery location")
  }
}

window.onclick = (event) => {
  const statusModal = document.getElementById("statusModal")
  const locationModal = document.getElementById("locationModal")

  if (event.target === statusModal) {
    statusModal.style.display = "none"
  }
  if (event.target === locationModal) {
    locationModal.style.display = "none"
  }
}
