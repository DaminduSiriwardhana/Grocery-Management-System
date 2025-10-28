const API_BASE_URL = "http://localhost:8080"
let allStocks = []
let allProducts = []
let currentUser = null

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAccess()
  loadStockData()
  loadProducts()
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

async function loadStockData() {
  try {
    const response = await fetch(`${API_BASE_URL}/stock`)
    allStocks = await response.json()
    displayStockTable(allStocks)
    updateStockStats()
  } catch (error) {
    console.error("Error loading stock:", error)
  }
}

async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`)
    allProducts = await response.json()

    const select = document.getElementById("stockProduct")
    allProducts.forEach((product) => {
      const option = document.createElement("option")
      option.value = product.productId
      option.textContent = product.productName
      select.appendChild(option)
    })
  } catch (error) {
    console.error("Error loading products:", error)
  }
}

function displayStockTable(stocks) {
  const tbody = document.getElementById("stockTableBody")
  tbody.innerHTML = ""

  stocks.forEach((stock) => {
    const isLowStock = stock.quantityAvailable <= stock.reorderLevel
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${stock.stockId}</td>
      <td>${stock.product.productName}</td>
      <td>${stock.product.category}</td>
      <td>${stock.quantityAvailable}</td>
      <td>${stock.reorderLevel}</td>
      <td>${stock.warehouseLocation || "N/A"}</td>
      <td>${stock.lastRestocked ? new Date(stock.lastRestocked).toLocaleDateString() : "N/A"}</td>
      <td>
        <span class="status-badge ${isLowStock ? "status-open" : "status-closed"}">
          ${isLowStock ? "Low Stock" : "OK"}
        </span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-secondary" onclick="editStock(${stock.stockId})">Edit</button>
          <button class="btn btn-danger" onclick="deleteStock(${stock.stockId})">Delete</button>
        </div>
      </td>
    `
    tbody.appendChild(row)
  })
}

function updateStockStats() {
  const totalProducts = allStocks.length
  const lowStockItems = allStocks.filter((s) => s.quantityAvailable <= s.reorderLevel).length
  const inventoryValue = allStocks.reduce((sum, s) => sum + s.product.price * s.quantityAvailable, 0)

  document.getElementById("totalProducts").textContent = totalProducts
  document.getElementById("lowStockItems").textContent = lowStockItems
  document.getElementById("inventoryValue").textContent = `$${inventoryValue.toFixed(2)}`
}

function searchStock() {
  const keyword = document.getElementById("stockSearch").value.toLowerCase()
  const filtered = allStocks.filter((s) => s.product.productName.toLowerCase().includes(keyword))
  displayStockTable(filtered)
}

function openStockForm() {
  document.getElementById("stockModal").classList.add("active")
}

function closeStockModal() {
  document.getElementById("stockModal").classList.remove("active")
  document.getElementById("stockForm").reset()
}

async function saveStock(event) {
  event.preventDefault()

  const stock = {
    productId: Number.parseInt(document.getElementById("stockProduct").value),
    quantityAvailable: Number.parseInt(document.getElementById("stockQuantity").value),
    reorderLevel: Number.parseInt(document.getElementById("reorderLevel").value),
    warehouseLocation: document.getElementById("warehouseLocation").value,
  }

  try {
    const response = await fetch(`${API_BASE_URL}/stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stock),
    })

    if (response.ok) {
      alert("Stock saved successfully")
      closeStockModal()
      loadStockData()
    }
  } catch (error) {
    console.error("Error saving stock:", error)
  }
}

function editStock(stockId) {
  const stock = allStocks.find((s) => s.stockId === stockId)
  if (stock) {
    document.getElementById("stockProduct").value = stock.product.productId
    document.getElementById("stockQuantity").value = stock.quantityAvailable
    document.getElementById("reorderLevel").value = stock.reorderLevel
    document.getElementById("warehouseLocation").value = stock.warehouseLocation || ""
    openStockForm()
  }
}

async function deleteStock(stockId) {
  if (confirm("Are you sure?")) {
    try {
      await fetch(`${API_BASE_URL}/stock/${stockId}`, { method: "DELETE" })
      loadStockData()
    } catch (error) {
      console.error("Error deleting stock:", error)
    }
  }
}

function logout() {
  localStorage.removeItem("currentUser")
  window.location.href = "login.html"
}
