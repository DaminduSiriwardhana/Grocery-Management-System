const API_BASE_URL = "http://localhost:8080"
let allStocks = []

document.addEventListener("DOMContentLoaded", loadStocks)

async function loadStocks() {
  try {
    const response = await fetch(`${API_BASE_URL}/stock`)
    allStocks = await response.json()
    displayStocks(allStocks)
    updateStats()
    displayAlerts()
  } catch (error) {
    console.error("Error loading stocks:", error)
    document.getElementById("stockTableBody").innerHTML =
      '<tr><td colspan="8" style="text-align: center; color: red;">Error loading stock data</td></tr>'
  }
}

function displayStocks(stocks) {
  const tbody = document.getElementById("stockTableBody")

  if (stocks.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #7f8c8d;">No stock items found</td></tr>'
    return
  }

  tbody.innerHTML = stocks
    .map(
      (stock) => `
        <tr>
            <td>${stock.productName}</td>
            <td>${stock.quantityAvailable}</td>
            <td>${stock.reorderLevel}</td>
            <td>
                <span class="status-badge status-${stock.stockStatus.toLowerCase().replace("_", "-")}">
                    ${stock.stockStatus.replace(/_/g, " ")}
                </span>
            </td>
            <td>${stock.warehouseLocation || "N/A"}</td>
            <td>$${stock.stockValue.toFixed(2)}</td>
            <td>${stock.lastRestocked ? new Date(stock.lastRestocked).toLocaleDateString() : "N/A"}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-restock" onclick="openRestockModal(${stock.stockId})">Restock</button>
                    <button class="btn-adjust" onclick="openAdjustModal(${stock.stockId})">Adjust</button>
                    <button class="btn-edit" onclick="editStock(${stock.stockId})">Edit</button>
                    <button class="btn-delete" onclick="deleteStock(${stock.stockId})">Delete</button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("")
}

async function updateStats() {
  const inStock = allStocks.filter((s) => s.stockStatus === "IN_STOCK").length
  const lowStock = allStocks.filter((s) => s.stockStatus === "LOW_STOCK").length
  const outOfStock = allStocks.filter((s) => s.stockStatus === "OUT_OF_STOCK").length
  const totalValue = allStocks.reduce((sum, s) => sum + s.stockValue, 0)

  document.getElementById("totalItems").textContent = allStocks.length
  document.getElementById("inStockCount").textContent = inStock
  document.getElementById("lowStockCount").textContent = lowStock
  document.getElementById("outOfStockCount").textContent = outOfStock
  document.getElementById("totalValue").textContent = `$${totalValue.toFixed(2)}`
}

function displayAlerts() {
  const lowStocks = allStocks.filter((s) => s.stockStatus === "LOW_STOCK")
  const outOfStocks = allStocks.filter((s) => s.stockStatus === "OUT_OF_STOCK")
  const alertsContainer = document.getElementById("alertsContainer")
  const alertsSection = document.getElementById("alertsSection")

  if (lowStocks.length === 0 && outOfStocks.length === 0) {
    alertsSection.style.display = "none"
    return
  }

  alertsSection.style.display = "block"
  let alertsHTML = ""

  outOfStocks.forEach((stock) => {
    alertsHTML += `
            <div class="alert-box danger">
                <strong>Out of Stock:</strong> ${stock.productName} - Please reorder immediately
            </div>
        `
  })

  lowStocks.forEach((stock) => {
    alertsHTML += `
            <div class="alert-box">
                <strong>Low Stock:</strong> ${stock.productName} - Current: ${stock.quantityAvailable}, Reorder Level: ${stock.reorderLevel}
            </div>
        `
  })

  alertsContainer.innerHTML = alertsHTML
}

function filterStocks() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase()
  const statusFilter = document.getElementById("statusFilter").value

  const filtered = allStocks.filter((stock) => {
    const matchesSearch = stock.productName.toLowerCase().includes(searchTerm)
    const matchesStatus = !statusFilter || stock.stockStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  displayStocks(filtered)
}

function openAddStockModal() {
  document.getElementById("modalTitle").textContent = "Add Stock"
  document.getElementById("stockForm").reset()
  document.getElementById("stockId").value = ""
  document.getElementById("stockModal").style.display = "block"
}

function closeStockModal() {
  document.getElementById("stockModal").style.display = "none"
}

function editStock(stockId) {
  fetch(`${API_BASE_URL}/stock/${stockId}`)
    .then((response) => response.json())
    .then((stock) => {
      document.getElementById("modalTitle").textContent = "Edit Stock"
      document.getElementById("stockId").value = stock.stockId
      document.getElementById("productId").value = stock.productId
      document.getElementById("quantityAvailable").value = stock.quantityAvailable
      document.getElementById("reorderLevel").value = stock.reorderLevel
      document.getElementById("warehouseLocation").value = stock.warehouseLocation || ""
      document.getElementById("stockModal").style.display = "block"
    })
    .catch((error) => {
      console.error("Error loading stock:", error)
      alert("Error loading stock details")
    })
}

async function saveStock(event) {
  event.preventDefault()

  const stockId = document.getElementById("stockId").value
  const stockData = {
    product: { productId: Number.parseInt(document.getElementById("productId").value) },
    quantityAvailable: Number.parseInt(document.getElementById("quantityAvailable").value),
    reorderLevel: Number.parseInt(document.getElementById("reorderLevel").value),
    warehouseLocation: document.getElementById("warehouseLocation").value,
  }

  try {
    let response
    if (stockId) {
      response = await fetch(`${API_BASE_URL}/stock/${stockId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stockData),
      })
    } else {
      response = await fetch(`${API_BASE_URL}/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stockData),
      })
    }

    if (response.ok) {
      alert(stockId ? "Stock updated successfully" : "Stock added successfully")
      closeStockModal()
      loadStocks()
    } else {
      alert("Error saving stock")
    }
  } catch (error) {
    console.error("Error saving stock:", error)
    alert("Error saving stock")
  }
}

function openRestockModal(stockId) {
  document.getElementById("restockStockId").value = stockId
  document.getElementById("restockQuantity").value = ""
  document.getElementById("restockModal").style.display = "block"
}

function closeRestockModal() {
  document.getElementById("restockModal").style.display = "none"
}

async function completeRestock(event) {
  event.preventDefault()

  const stockId = document.getElementById("restockStockId").value
  const quantity = Number.parseInt(document.getElementById("restockQuantity").value)

  try {
    const response = await fetch(`${API_BASE_URL}/stock/${stockId}/restock?quantity=${quantity}`, {
      method: "PUT",
    })

    if (response.ok) {
      alert("Stock restocked successfully")
      closeRestockModal()
      loadStocks()
    } else {
      alert("Error restocking item")
    }
  } catch (error) {
    console.error("Error restocking:", error)
    alert("Error restocking item")
  }
}

function openAdjustModal(stockId) {
  document.getElementById("adjustStockId").value = stockId
  document.getElementById("adjustQuantity").value = ""
  document.getElementById("adjustModal").style.display = "block"
}

function closeAdjustModal() {
  document.getElementById("adjustModal").style.display = "none"
}

async function completeAdjust(event) {
  event.preventDefault()

  const stockId = document.getElementById("adjustStockId").value
  const quantity = Number.parseInt(document.getElementById("adjustQuantity").value)

  try {
    const response = await fetch(`${API_BASE_URL}/stock/${stockId}/adjust?quantity=${quantity}`, {
      method: "PUT",
    })

    if (response.ok) {
      alert("Stock adjusted successfully")
      closeAdjustModal()
      loadStocks()
    } else {
      alert("Error adjusting stock")
    }
  } catch (error) {
    console.error("Error adjusting stock:", error)
    alert("Error adjusting stock")
  }
}

async function deleteStock(stockId) {
  if (confirm("Are you sure you want to delete this stock record?")) {
    try {
      const response = await fetch(`${API_BASE_URL}/stock/${stockId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        alert("Stock deleted successfully")
        loadStocks()
      } else {
        alert("Error deleting stock")
      }
    } catch (error) {
      console.error("Error deleting stock:", error)
      alert("Error deleting stock")
    }
  }
}

window.onclick = (event) => {
  const stockModal = document.getElementById("stockModal")
  const restockModal = document.getElementById("restockModal")
  const adjustModal = document.getElementById("adjustModal")

  if (event.target === stockModal) {
    stockModal.style.display = "none"
  }
  if (event.target === restockModal) {
    restockModal.style.display = "none"
  }
  if (event.target === adjustModal) {
    adjustModal.style.display = "none"
  }
}
