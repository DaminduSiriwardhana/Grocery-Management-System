const API_BASE_URL = "http://localhost:8080"
let allProducts = []
let filteredProducts = []
let currentUser = null

document.addEventListener("DOMContentLoaded", () => {
  checkUserSession()
  loadProducts()
})

function checkUserSession() {
  const user = localStorage.getItem("currentUser")
  if (user) {
    currentUser = JSON.parse(user)
    document.getElementById("userDisplay").textContent = currentUser.username
  }
}

async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`)
    allProducts = await response.json()
    filteredProducts = [...allProducts]
    displayProducts(filteredProducts)
  } catch (error) {
    console.error("Error loading products:", error)
  }
}

function displayProducts(productsToDisplay) {
  const grid = document.getElementById("productsGrid")
  grid.innerHTML = ""

  productsToDisplay.forEach((product) => {
    const card = document.createElement("div")
    card.className = "product-card"
    card.innerHTML = `
      <div class="product-image">🛒</div>
      <div class="product-info">
        <div class="product-name">${product.productName}</div>
        <div class="product-category">${product.category}</div>
        <div class="product-price">$${product.price}</div>
        <div class="product-stock">Stock: ${product.stockQuantity}</div>
        <div class="product-actions">
          <button class="btn btn-secondary" onclick="quickView(${product.productId})">Quick View</button>
          <button class="btn btn-primary" onclick="addToCart(${product.productId})">Add to Cart</button>
        </div>
      </div>
    `
    grid.appendChild(card)
  })
}

function quickView(productId) {
  const product = allProducts.find((p) => p.productId === productId)
  if (product) {
    const content = document.getElementById("quickViewContent")
    content.innerHTML = `
      <div class="quick-view-product">
        <div class="quick-view-image">🛒</div>
        <div class="quick-view-details">
          <h2>${product.productName}</h2>
          <p class="category">Category: ${product.category}</p>
          <p class="description">${product.description || "No description available"}</p>
          <div class="price-section">
            <span class="price">$${product.price}</span>
            <span class="stock">Stock: ${product.stockQuantity}</span>
          </div>
          <div class="quantity-selector">
            <label>Quantity:</label>
            <input type="number" id="quickViewQty" value="1" min="1" max="${product.stockQuantity}">
          </div>
          <button class="btn btn-primary btn-block" onclick="addToCartFromQuickView(${product.productId})">Add to Cart</button>
        </div>
      </div>
    `
    document.getElementById("quickViewModal").classList.add("active")
  }
}

function closeQuickView() {
  document.getElementById("quickViewModal").classList.remove("active")
}

function addToCart(productId) {
  const product = allProducts.find((p) => p.productId === productId)
  const cart = JSON.parse(localStorage.getItem("cart")) || []

  const existingItem = cart.find((item) => item.productId === productId)
  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({
      productId: product.productId,
      productName: product.productName,
      price: product.price,
      quantity: 1,
    })
  }

  localStorage.setItem("cart", JSON.stringify(cart))
  alert(`${product.productName} added to cart!`)
}

function addToCartFromQuickView(productId) {
  const quantity = Number.parseInt(document.getElementById("quickViewQty").value)
  const product = allProducts.find((p) => p.productId === productId)
  const cart = JSON.parse(localStorage.getItem("cart")) || []

  const existingItem = cart.find((item) => item.productId === productId)
  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.push({
      productId: product.productId,
      productName: product.productName,
      price: product.price,
      quantity: quantity,
    })
  }

  localStorage.setItem("cart", JSON.stringify(cart))
  alert(`${quantity} x ${product.productName} added to cart!`)
  closeQuickView()
}

function searchProducts() {
  const keyword = document.getElementById("searchInput").value.toLowerCase()
  filteredProducts = allProducts.filter((p) => p.productName.toLowerCase().includes(keyword))
  displayProducts(filteredProducts)
}

function applyFilters() {
  const categories = Array.from(document.querySelectorAll('.filter-group input[type="checkbox"]:checked')).map(
    (cb) => cb.value,
  )
  const maxPrice = Number.parseInt(document.getElementById("priceRange").value)
  const inStock = document.getElementById("inStock").checked

  filteredProducts = allProducts.filter((p) => {
    const categoryMatch = categories.length === 0 || categories.includes(p.category)
    const priceMatch = p.price <= maxPrice
    const stockMatch = !inStock || p.stockQuantity > 0
    return categoryMatch && priceMatch && stockMatch
  })

  displayProducts(filteredProducts)
}

function resetFilters() {
  document.querySelectorAll('.filter-group input[type="checkbox"]').forEach((cb) => {
    cb.checked = cb.id === "inStock"
  })
  document.getElementById("priceRange").value = 100
  document.getElementById("priceValue").textContent = "100"
  filteredProducts = [...allProducts]
  displayProducts(filteredProducts)
}

function sortProducts() {
  const sortBy = document.getElementById("sortBy").value

  switch (sortBy) {
    case "name":
      filteredProducts.sort((a, b) => a.productName.localeCompare(b.productName))
      break
    case "price-low":
      filteredProducts.sort((a, b) => a.price - b.price)
      break
    case "price-high":
      filteredProducts.sort((a, b) => b.price - a.price)
      break
    case "newest":
      filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
  }

  displayProducts(filteredProducts)
}

document.getElementById("priceRange").addEventListener("input", (e) => {
  document.getElementById("priceValue").textContent = e.target.value
})

function logout() {
  localStorage.removeItem("currentUser")
  window.location.href = "login.html"
}
