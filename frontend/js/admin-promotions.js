const API_BASE_URL = "http://localhost:8080"
let allPromotions = []

document.addEventListener("DOMContentLoaded", loadPromotions)

async function loadPromotions() {
  try {
    const response = await fetch(`${API_BASE_URL}/promotions`)
    allPromotions = await response.json()
    displayPromotions(allPromotions)
    updateStats()
  } catch (error) {
    console.error("Error loading promotions:", error)
    document.getElementById("promotionsGrid").innerHTML =
      '<p style="text-align: center; color: red;">Error loading campaigns</p>'
  }
}

function displayPromotions(promotions) {
  const grid = document.getElementById("promotionsGrid")

  if (promotions.length === 0) {
    grid.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No campaigns found</p>'
    return
  }

  grid.innerHTML = promotions
    .map(
      (promo) => `
        <div class="promotion-card ${promo.status.toLowerCase()}">
            <div class="promotion-header">
                <h3 class="promotion-name">${promo.promotionName}</h3>
                <span class="status-badge status-${promo.status.toLowerCase()}">${promo.status}</span>
            </div>
            <div class="promotion-details">
                <p><strong>Description:</strong> ${promo.description || "N/A"}</p>
                <p><strong>Start Date:</strong> ${promo.startDate}</p>
                <p><strong>End Date:</strong> ${promo.endDate}</p>
            </div>
            <div class="discount-info">
                ${promo.discountPercentage ? `${promo.discountPercentage}% OFF` : ""}
                ${promo.discountAmount ? `$${promo.discountAmount} OFF` : ""}
            </div>
            <div class="promotion-actions">
                <button class="btn-edit" onclick="editPromotion(${promo.promotionId})">Edit</button>
                <button class="btn-toggle" onclick="togglePromotion(${promo.promotionId})">
                    ${promo.isActive ? "Disable" : "Enable"}
                </button>
                <button class="btn-delete" onclick="deletePromotion(${promo.promotionId})">Delete</button>
            </div>
        </div>
    `,
    )
    .join("")
}

function updateStats() {
  const active = allPromotions.filter((p) => p.status === "ACTIVE").length
  const upcoming = allPromotions.filter((p) => p.status === "UPCOMING").length
  const expired = allPromotions.filter((p) => p.status === "EXPIRED").length

  document.getElementById("totalPromotions").textContent = allPromotions.length
  document.getElementById("activePromotions").textContent = active
  document.getElementById("upcomingPromotions").textContent = upcoming
  document.getElementById("expiredPromotions").textContent = expired
}

function filterPromotions() {
  const status = document.getElementById("statusFilter").value
  if (status) {
    const filtered = allPromotions.filter((p) => p.status === status)
    displayPromotions(filtered)
  } else {
    displayPromotions(allPromotions)
  }
}

function openAddPromotionModal() {
  document.getElementById("modalTitle").textContent = "Create New Campaign"
  document.getElementById("promotionForm").reset()
  document.getElementById("promotionId").value = ""
  document.getElementById("promotionModal").style.display = "block"
}

function closePromotionModal() {
  document.getElementById("promotionModal").style.display = "none"
}

function editPromotion(promotionId) {
  fetch(`${API_BASE_URL}/promotions/${promotionId}`)
    .then((response) => response.json())
    .then((promo) => {
      document.getElementById("modalTitle").textContent = "Edit Campaign"
      document.getElementById("promotionId").value = promo.promotionId
      document.getElementById("promotionName").value = promo.promotionName
      document.getElementById("description").value = promo.description || ""
      document.getElementById("discountPercentage").value = promo.discountPercentage || ""
      document.getElementById("discountAmount").value = promo.discountAmount || ""
      document.getElementById("startDate").value = promo.startDate
      document.getElementById("endDate").value = promo.endDate
      document.getElementById("applicableProducts").value = promo.applicableProducts || ""
      document.getElementById("promotionModal").style.display = "block"
    })
    .catch((error) => {
      console.error("Error loading promotion:", error)
      alert("Error loading campaign details")
    })
}

async function savePromotion(event) {
  event.preventDefault()

  const promotionId = document.getElementById("promotionId").value
  const promotionData = {
    promotionName: document.getElementById("promotionName").value,
    description: document.getElementById("description").value,
    discountPercentage: document.getElementById("discountPercentage").value || null,
    discountAmount: document.getElementById("discountAmount").value || null,
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
    applicableProducts: document.getElementById("applicableProducts").value,
    isActive: true,
  }

  try {
    let response
    if (promotionId) {
      response = await fetch(`${API_BASE_URL}/promotions/${promotionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promotionData),
      })
    } else {
      response = await fetch(`${API_BASE_URL}/promotions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promotionData),
      })
    }

    if (response.ok) {
      alert(promotionId ? "Campaign updated successfully" : "Campaign created successfully")
      closePromotionModal()
      loadPromotions()
    } else {
      alert("Error saving campaign")
    }
  } catch (error) {
    console.error("Error saving promotion:", error)
    alert("Error saving campaign")
  }
}

async function togglePromotion(promotionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/promotions/${promotionId}/toggle`, {
      method: "PUT",
    })

    if (response.ok) {
      loadPromotions()
    } else {
      alert("Error toggling campaign status")
    }
  } catch (error) {
    console.error("Error toggling promotion:", error)
    alert("Error toggling campaign status")
  }
}

async function deletePromotion(promotionId) {
  if (confirm("Are you sure you want to delete this campaign?")) {
    try {
      const response = await fetch(`${API_BASE_URL}/promotions/${promotionId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        alert("Campaign deleted successfully")
        loadPromotions()
      } else {
        alert("Error deleting campaign")
      }
    } catch (error) {
      console.error("Error deleting promotion:", error)
      alert("Error deleting campaign")
    }
  }
}

window.onclick = (event) => {
  const modal = document.getElementById("promotionModal")
  if (event.target === modal) {
    modal.style.display = "none"
  }
}
