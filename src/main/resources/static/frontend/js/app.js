// API Configuration
const API_BASE_URL = "http://localhost:8080"

// Global State
let currentUser = null
let cart = []
let products = []
let orders = []

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  loadProducts()
  checkUserSession()
})

// Navigation
function navigateTo(page) {
  // Hide all pages
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"))

  // Show selected page
  const selectedPage = document.getElementById(page)
  if (selectedPage) {
    selectedPage.classList.add("active")

    // Load page-specific data
    if (page === "orders") {
      loadOrders()
    } else if (page === "cart") {
      updateCartDisplay()
    } else if (page === "admin") {
      loadAdminData()
    } else if (page === "dashboard") {
      loadDashboardStats()
    }
  }
}

// User Management
function checkUserSession() {
  const user = localStorage.getItem("currentUser")
  if (user) {
    currentUser = JSON.parse(user)
    document.getElementById("userDisplay").textContent = currentUser.username

    // Show admin menu if user is admin
    if (currentUser.role === "ADMIN" || currentUser.role === "STORE_MANAGER") {
      document.getElementById("adminMenu").style.display = "block"
    }
  }
}

function logout() {
  localStorage.removeItem("currentUser")
  currentUser = null
  cart = []
  alert("Logged out successfully")
  navigateTo("dashboard")
}

// Products
async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`)
    products = await response.json()
    displayProducts(products)
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
                    <input type="number" id="qty-${product.productId}" value="1" min="1" max="${product.stockQuantity}">
                    <button onclick="addToCart(${product.productId})">Add to Cart</button>
                </div>
            </div>
        `
    grid.appendChild(card)
  })
}

function searchProducts() {
  const keyword = document.getElementById("searchInput").value.toLowerCase()
  const filtered = products.filter((p) => p.productName.toLowerCase().includes(keyword))
  displayProducts(filtered)
}

function filterByCategory() {
  const category = document.getElementById("categoryFilter").value
  const filtered = category ? products.filter((p) => p.category === category) : products
  displayProducts(filtered)
}

// Shopping Cart
function addToCart(productId) {
  const product = products.find((p) => p.productId === productId)
  const quantity = Number.parseInt(document.getElementById(`qty-${productId}`).value)

  if (quantity > 0 && quantity <= product.stockQuantity) {
    const existingItem = cart.find((item) => item.productId === productId)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({
        productId: productId,
        productName: product.productName,
        price: product.price,
        quantity: quantity,
      })
    }

    alert(`${product.productName} added to cart!`)
    document.getElementById(`qty-${productId}`).value = 1
  } else {
    alert("Invalid quantity")
  }
}

function updateCartDisplay() {
  const cartContainer = document.getElementById("cartItems")

  if (cart.length === 0) {
    cartContainer.innerHTML = '<div class="empty-message">Your cart is empty</div>'
    document.getElementById("subtotal").textContent = "$0.00"
    document.getElementById("tax").textContent = "$0.00"
    document.getElementById("total").textContent = "$0.00"
    return
  }

  cartContainer.innerHTML = ""
  let subtotal = 0

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity
    subtotal += itemTotal

    const cartItem = document.createElement("div")
    cartItem.className = "cart-item"
    cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.productName}</div>
                <div class="cart-item-price">$${item.price} x ${item.quantity} = $${itemTotal.toFixed(2)}</div>
            </div>
            <div class="cart-item-actions">
                <input type="number" value="${item.quantity}" min="1" onchange="updateCartQuantity(${index}, this.value)">
                <button onclick="removeFromCart(${index})">Remove</button>
            </div>
        `
    cartContainer.appendChild(cartItem)
  })

  const tax = subtotal * 0.1
  const total = subtotal + tax

  document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`
  document.getElementById("tax").textContent = `$${tax.toFixed(2)}`
  document.getElementById("total").textContent = `$${total.toFixed(2)}`
}

function updateCartQuantity(index, newQuantity) {
  const quantity = Number.parseInt(newQuantity)
  if (quantity > 0) {
    cart[index].quantity = quantity
    updateCartDisplay()
  }
}

function removeFromCart(index) {
  cart.splice(index, 1)
  updateCartDisplay()
}

async function checkout() {
  console.log("Checkout function called")
  console.log("Cart length:", cart.length)
  console.log("Current user:", currentUser)
  
  if (cart.length === 0) {
    alert("Cart is empty")
    return
  }

  if (!currentUser) {
    alert("Please login first")
    return
  }

  console.log("About to show checkout modal")
  // Show checkout modal instead of directly creating order
  showCheckoutModal()
}

function testCheckout() {
  console.log("Test checkout called")
  console.log("Cart:", cart)
  console.log("Current user:", currentUser)
  console.log("Cart length:", cart.length)
  
  if (cart.length === 0) {
    alert("Cart is empty - adding test item")
    // Add a test item to cart
    cart.push({
      productId: 1,
      name: "Test Product",
      price: 10.00,
      quantity: 1
    })
    updateCartDisplay()
  }
  
  if (!currentUser) {
    alert("No current user - setting test user")
    // Set a test user
    currentUser = {
      userId: 1,
      username: "testuser",
      email: "test@example.com"
    }
  }
  
  console.log("Calling checkout after test setup")
  checkout()
}

function showCheckoutModal() {
  console.log("showCheckoutModal called")
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  console.log("Subtotal:", subtotal, "Tax:", tax, "Total:", total)
  const formContainer = document.getElementById("formContainer")
  console.log("Form container:", formContainer)
  formContainer.innerHTML = `
    <h2>Checkout</h2>
    <div class="checkout-container">
      <div class="checkout-summary">
        <h3>Order Summary</h3>
        <div class="cart-items">
          ${cart.map(item => `
            <div class="cart-item">
              <span>${item.name} x ${item.quantity}</span>
              <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        <div class="totals">
          <div class="total-line">
            <span>Subtotal:</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>
          <div class="total-line">
            <span>Tax (10%):</span>
            <span>$${tax.toFixed(2)}</span>
          </div>
          <div class="total-line total">
            <span>Total:</span>
            <span>$${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <form id="checkoutForm" class="checkout-form">
        <div class="form-section">
          <h3>Delivery Information</h3>
          <div class="form-group">
            <label for="deliveryName">Full Name:</label>
            <input type="text" id="deliveryName" value="${currentUser.username}" required>
          </div>
          <div class="form-group">
            <label for="deliveryPhone">Phone Number:</label>
            <input type="tel" id="deliveryPhone" value="${currentUser.phone || ''}" required>
          </div>
          <div class="form-group">
            <label for="deliveryAddress">Delivery Address:</label>
            <textarea id="deliveryAddress" rows="3" required>${currentUser.address || ''}</textarea>
          </div>
          <div class="form-group">
            <label for="deliveryCity">City:</label>
            <input type="text" id="deliveryCity" value="${currentUser.city || ''}" required>
          </div>
          <div class="form-group">
            <label for="deliveryPostalCode">Postal Code:</label>
            <input type="text" id="deliveryPostalCode" value="${currentUser.postalCode || ''}" required>
          </div>
        </div>

        <div class="form-section">
          <h3>Payment Information</h3>
          <div class="form-group">
            <label for="cardNumber">Card Number:</label>
            <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="expiryDate">Expiry Date:</label>
              <input type="text" id="expiryDate" placeholder="MM/YY" maxlength="5" required>
            </div>
            <div class="form-group">
              <label for="cvv">CVV:</label>
              <input type="text" id="cvv" placeholder="123" maxlength="4" required>
            </div>
          </div>
          <div class="form-group">
            <label for="cardholderName">Cardholder Name:</label>
            <input type="text" id="cardholderName" value="${currentUser.username}" required>
          </div>
        </div>

        <div class="form-section">
          <h3>Order Notes</h3>
          <div class="form-group">
            <label for="orderNotes">Special Instructions (Optional):</label>
            <textarea id="orderNotes" rows="3" placeholder="Any special delivery instructions..."></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" onclick="processCheckout()" class="btn btn-primary">Place Order</button>
          <button type="button" onclick="closeModal()" class="btn btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  `
  openModal()
  
  // Add input formatting for card number
  setTimeout(() => {
    const cardNumberInput = document.getElementById("cardNumber")
    if (cardNumberInput) {
      cardNumberInput.addEventListener("input", function(e) {
        let value = e.target.value.replace(/\s/g, "").replace(/[^0-9]/gi, "")
        let formattedValue = value.match(/.{1,4}/g)?.join(" ") || value
        if (formattedValue.length > 19) formattedValue = formattedValue.substr(0, 19)
        e.target.value = formattedValue
      })
    }
    
    // Add input formatting for expiry date
    const expiryInput = document.getElementById("expiryDate")
    if (expiryInput) {
      expiryInput.addEventListener("input", function(e) {
        let value = e.target.value.replace(/\D/g, "")
        if (value.length >= 2) {
          value = value.substring(0, 2) + "/" + value.substring(2, 4)
        }
        e.target.value = value
      })
    }
    
    // Add input formatting for CVV (numbers only)
    const cvvInput = document.getElementById("cvv")
    if (cvvInput) {
      cvvInput.addEventListener("input", function(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, "")
      })
    }
  }, 100)
}

async function processCheckout() {
  try {
    // Validate form
    const deliveryName = document.getElementById("deliveryName").value
    const deliveryPhone = document.getElementById("deliveryPhone").value
    const deliveryAddress = document.getElementById("deliveryAddress").value
    const deliveryCity = document.getElementById("deliveryCity").value
    const deliveryPostalCode = document.getElementById("deliveryPostalCode").value
    const cardNumber = document.getElementById("cardNumber").value
    const expiryDate = document.getElementById("expiryDate").value
    const cvv = document.getElementById("cvv").value
    const cardholderName = document.getElementById("cardholderName").value
    const orderNotes = document.getElementById("orderNotes").value

    // Basic validation
    if (!deliveryName || !deliveryPhone || !deliveryAddress || !deliveryCity || !deliveryPostalCode) {
      alert("Please fill in all delivery information")
      return
    }

    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      alert("Please fill in all payment information")
      return
    }

    // Validate card number (basic check)
    const cleanCardNumber = cardNumber.replace(/\s/g, '')
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      alert("Please enter a valid card number")
      return
    }

    // Validate expiry date
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      alert("Please enter expiry date in MM/YY format")
      return
    }

    // Validate CVV
    if (cvv.length < 3 || cvv.length > 4) {
      alert("Please enter a valid CVV")
      return
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = subtotal * 0.1
    const total = subtotal + tax

    const order = {
      userId: currentUser.userId,
      totalAmount: total,
      status: "PENDING",
      deliveryAddress: `${deliveryAddress}, ${deliveryCity}, ${deliveryPostalCode}`,
      deliveryName: deliveryName,
      deliveryPhone: deliveryPhone,
      orderNotes: orderNotes,
      paymentMethod: "Credit Card",
      orderItems: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: item.price * item.quantity,
      })),
    }

    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    })

    if (response.ok) {
      alert("Order placed successfully! Thank you for your purchase.")
      cart = []
      updateCartDisplay()
      closeModal()
      navigateTo("orders")
    } else {
      const errorData = await response.json()
      alert("Failed to place order: " + (errorData.message || "Unknown error"))
    }
  } catch (error) {
    console.error("Error placing order:", error)
    alert("Error placing order: " + error.message)
  }
}

// Orders
async function loadOrders() {
  if (!currentUser) {
    document.getElementById("ordersTableBody").innerHTML = '<tr><td colspan="5">Please login to view orders</td></tr>'
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/orders/user/${currentUser.userId}`)
    orders = await response.json()
    displayOrders(orders)
  } catch (error) {
    console.error("Error loading orders:", error)
  }
}

function displayOrders(ordersToDisplay) {
  const tbody = document.getElementById("ordersTableBody")
  tbody.innerHTML = ""

  if (ordersToDisplay.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-message">No orders found</td></tr>'
    return
  }

  ordersToDisplay.forEach((order) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>#${order.orderId}</td>
            <td>${new Date(order.orderDate).toLocaleDateString()}</td>
            <td>$${order.totalAmount.toFixed(2)}</td>
            <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
            <td><button class="btn btn-secondary" onclick="viewOrderDetails(${order.orderId})">View</button></td>
        `
    tbody.appendChild(row)
  })
}

function viewOrderDetails(orderId) {
  const order = orders.find((o) => o.orderId === orderId)
  if (order) {
    alert(
      `Order #${order.orderId}\nTotal: $${order.totalAmount}\nStatus: ${order.status}\nItems: ${order.orderItems.length}`,
    )
  }
}

// Dashboard
async function loadDashboardStats() {
  if (!currentUser) return

  try {
    const ordersResponse = await fetch(`${API_BASE_URL}/orders/user/${currentUser.userId}`)
    const userOrders = await ordersResponse.json()

    const promotionsResponse = await fetch(`${API_BASE_URL}/promotions/active`)
    const activePromos = await promotionsResponse.json()

    const totalSpent = userOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    const pendingDeliveries = userOrders.filter((o) => o.status === "SHIPPED").length

    document.getElementById("totalOrders").textContent = userOrders.length
    document.getElementById("totalSpent").textContent = `$${totalSpent.toFixed(2)}`
    document.getElementById("activePromotions").textContent = activePromos.length
    document.getElementById("pendingDeliveries").textContent = pendingDeliveries
  } catch (error) {
    console.error("Error loading dashboard stats:", error)
  }
}

// Admin Functions
function switchAdminTab(tabName) {
  document.querySelectorAll(".admin-tab").forEach((tab) => tab.classList.remove("active"))
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"))

  document.getElementById(tabName + "Tab").classList.add("active")
  event.target.classList.add("active")
}

async function loadAdminData() {
  try {
    console.log("Loading admin data...")
    
    // Load users
    console.log("Fetching users...")
    const usersResponse = await fetch(`${API_BASE_URL}/users`)
    console.log("Users response status:", usersResponse.status)
    if (usersResponse.ok) {
      const users = await usersResponse.json()
      console.log("Users loaded:", users.length)
      displayAdminUsers(users)
    } else {
      console.error("Failed to fetch users:", usersResponse.status, usersResponse.statusText)
      displayAdminUsers([])
    }

    // Load products
    console.log("Fetching products...")
    const productsResponse = await fetch(`${API_BASE_URL}/products`)
    console.log("Products response status:", productsResponse.status)
    if (productsResponse.ok) {
      const adminProducts = await productsResponse.json()
      console.log("Products loaded:", adminProducts.length)
      displayAdminProducts(adminProducts)
    } else {
      console.error("Failed to fetch products:", productsResponse.status, productsResponse.statusText)
      displayAdminProducts([])
    }

    // Load promotions
    console.log("Fetching promotions...")
    const promotionsResponse = await fetch(`${API_BASE_URL}/promotions`)
    console.log("Promotions response status:", promotionsResponse.status)
    if (promotionsResponse.ok) {
      const promotions = await promotionsResponse.json()
      console.log("Promotions loaded:", promotions.length)
      displayAdminPromotions(promotions)
    } else {
      console.error("Failed to fetch promotions:", promotionsResponse.status, promotionsResponse.statusText)
      displayAdminPromotions([])
    }

    // Load stock
    console.log("Fetching stock...")
    const stockResponse = await fetch(`${API_BASE_URL}/stock`)
    console.log("Stock response status:", stockResponse.status)
    if (stockResponse.ok) {
      const stocks = await stockResponse.json()
      console.log("Stock loaded:", stocks.length)
      displayAdminStock(stocks)
    } else {
      console.error("Failed to fetch stock:", stockResponse.status, stockResponse.statusText)
      displayAdminStock([])
    }

    // Load reports
    console.log("Fetching maintenance reports...")
    const reportsResponse = await fetch(`${API_BASE_URL}/maintenance`)
    console.log("Reports response status:", reportsResponse.status)
    if (reportsResponse.ok) {
      const reports = await reportsResponse.json()
      console.log("Reports loaded:", reports.length)
      displayAdminReports(reports)
    } else {
      console.error("Failed to fetch reports:", reportsResponse.status, reportsResponse.statusText)
      displayAdminReports([])
    }
    
    console.log("Admin data loading completed")
  } catch (error) {
    console.error("Error loading admin data:", error)
    alert("Failed to load admin data: " + error.message)
  }
}

function displayAdminUsers(users) {
  const tbody = document.getElementById("usersTableBody")
  tbody.innerHTML = ""
  users.forEach((user) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${user.userId}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <button class="btn btn-secondary" onclick="editUser(${user.userId})">Edit</button>
                <button class="btn btn-danger" onclick="deleteUser(${user.userId})">Delete</button>
            </td>
        `
    tbody.appendChild(row)
  })
}

function displayAdminProducts(adminProducts) {
  const tbody = document.getElementById("productsTableBody")
  tbody.innerHTML = ""
  adminProducts.forEach((product) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${product.productId}</td>
            <td>${product.productName}</td>
            <td>${product.category}</td>
            <td>$${product.price}</td>
            <td>${product.stockQuantity}</td>
            <td>
                <button class="btn btn-secondary" onclick="editProduct(${product.productId})">Edit</button>
                <button class="btn btn-danger" onclick="deleteProduct(${product.productId})">Delete</button>
            </td>
        `
    tbody.appendChild(row)
  })
}

function displayAdminPromotions(promotions) {
  const tbody = document.getElementById("promotionsTableBody")
  tbody.innerHTML = ""
  promotions.forEach((promo) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${promo.promotionId}</td>
            <td>${promo.promotionName}</td>
            <td>${promo.discountPercentage || promo.discountAmount}%</td>
            <td>${promo.startDate}</td>
            <td>${promo.endDate}</td>
            <td><span class="status-badge ${promo.isActive ? "status-confirmed" : "status-cancelled"}">${promo.isActive ? "Active" : "Inactive"}</span></td>
            <td>
                <button class="btn btn-secondary" onclick="editPromotion(${promo.promotionId})">Edit</button>
                <button class="btn btn-danger" onclick="deletePromotion(${promo.promotionId})">Delete</button>
            </td>
        `
    tbody.appendChild(row)
  })
}

function displayAdminStock(stocks) {
  const tbody = document.getElementById("stockTableBody")
  tbody.innerHTML = ""
  
  if (!stocks || stocks.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-message">No stock data available</td></tr>'
    return
  }
  
  stocks.forEach((stock) => {
    const row = document.createElement("tr")
    const productName = stock.product && stock.product.productName ? stock.product.productName : 'N/A'
    row.innerHTML = `
            <td>${stock.stockId || 'N/A'}</td>
            <td>${productName}</td>
            <td>${stock.quantityAvailable || 0}</td>
            <td>${stock.warehouseLocation || 'N/A'}</td>
            <td>${stock.reorderLevel || 0}</td>
            <td>
                <button class="btn btn-secondary" onclick="editStock(${stock.stockId})">Edit</button>
            </td>
        `
    tbody.appendChild(row)
  })
}

function displayAdminReports(reports) {
  const tbody = document.getElementById("reportsTableBody")
  tbody.innerHTML = ""
  
  if (!reports || reports.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-message">No reports available</td></tr>'
    return
  }
  
  reports.forEach((report) => {
    const row = document.createElement("tr")
    const reportedBy = report.reportedBy && report.reportedBy.username ? report.reportedBy.username : 'N/A'
    row.innerHTML = `
            <td>${report.reportId || 'N/A'}</td>
            <td>${report.reportType || 'N/A'}</td>
            <td><span class="status-badge status-${report.status ? report.status.toLowerCase() : 'unknown'}">${report.status || 'N/A'}</span></td>
            <td>${report.priority || 'N/A'}</td>
            <td>${reportedBy}</td>
            <td>
                <button class="btn btn-secondary" onclick="editReport(${report.reportId})">Edit</button>
            </td>
        `
    tbody.appendChild(row)
  })
}

// Modal Functions
function openModal() {
  console.log("openModal called")
  const modal = document.getElementById("formModal")
  console.log("Modal element:", modal)
  if (modal) {
    modal.classList.add("active")
    console.log("Modal class added")
  } else {
    console.error("Modal element not found!")
  }
}

function closeModal() {
  console.log("closeModal called")
  const modal = document.getElementById("formModal")
  if (modal) {
    modal.classList.remove("active")
  }
}

// Edit Modal Functions
function showEditUserModal(user) {
  const formContainer = document.getElementById("formContainer")
  formContainer.innerHTML = `
    <h2>Edit User</h2>
    <form id="editUserForm">
      <input type="hidden" id="userId" value="${user.userId}">
      <div class="form-group">
        <label for="editUsername">Username:</label>
        <input type="text" id="editUsername" value="${user.username}" required>
      </div>
      <div class="form-group">
        <label for="editEmail">Email:</label>
        <input type="email" id="editEmail" value="${user.email}" required>
      </div>
      <div class="form-group">
        <label for="editPhone">Phone:</label>
        <input type="text" id="editPhone" value="${user.phone || ''}">
      </div>
      <div class="form-group">
        <label for="editAddress">Address:</label>
        <input type="text" id="editAddress" value="${user.address || ''}">
      </div>
      <div class="form-group">
        <label for="editCity">City:</label>
        <input type="text" id="editCity" value="${user.city || ''}">
      </div>
      <div class="form-group">
        <label for="editPostalCode">Postal Code:</label>
        <input type="text" id="editPostalCode" value="${user.postalCode || ''}">
      </div>
      <div class="form-group">
        <label for="editRole">Role:</label>
        <select id="editRole" required>
          <option value="ADMIN" ${user.role === 'ADMIN' ? 'selected' : ''}>Admin</option>
          <option value="STORE_MANAGER" ${user.role === 'STORE_MANAGER' ? 'selected' : ''}>Store Manager</option>
          <option value="DELIVERY_PERSON" ${user.role === 'DELIVERY_PERSON' ? 'selected' : ''}>Delivery Person</option>
          <option value="CUSTOMER" ${user.role === 'CUSTOMER' ? 'selected' : ''}>Customer</option>
        </select>
      </div>
      <div class="form-actions">
        <button type="button" onclick="saveUserEdit()" class="btn btn-primary">Save Changes</button>
        <button type="button" onclick="closeModal()" class="btn btn-secondary">Cancel</button>
      </div>
    </form>
  `
  openModal()
}

function showEditProductModal(product) {
  const formContainer = document.getElementById("formContainer")
  formContainer.innerHTML = `
    <h2>Edit Product</h2>
    <form id="editProductForm">
      <input type="hidden" id="productId" value="${product.productId}">
      <div class="form-group">
        <label for="editProductName">Product Name:</label>
        <input type="text" id="editProductName" value="${product.productName}" required>
      </div>
      <div class="form-group">
        <label for="editDescription">Description:</label>
        <textarea id="editDescription" rows="3">${product.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label for="editPrice">Price:</label>
        <input type="number" id="editPrice" value="${product.price}" step="0.01" required>
      </div>
      <div class="form-group">
        <label for="editCategory">Category:</label>
        <select id="editCategory" required>
          <option value="Fruits" ${product.category === 'Fruits' ? 'selected' : ''}>Fruits</option>
          <option value="Vegetables" ${product.category === 'Vegetables' ? 'selected' : ''}>Vegetables</option>
          <option value="Dairy" ${product.category === 'Dairy' ? 'selected' : ''}>Dairy</option>
          <option value="Meat" ${product.category === 'Meat' ? 'selected' : ''}>Meat</option>
          <option value="Bakery" ${product.category === 'Bakery' ? 'selected' : ''}>Bakery</option>
        </select>
      </div>
      <div class="form-group">
        <label for="editStockQuantity">Stock Quantity:</label>
        <input type="number" id="editStockQuantity" value="${product.stockQuantity}" required>
      </div>
      <div class="form-group">
        <label for="editImageUrl">Image URL:</label>
        <input type="url" id="editImageUrl" value="${product.imageUrl || ''}">
      </div>
      <div class="form-actions">
        <button type="button" onclick="saveProductEdit()" class="btn btn-primary">Save Changes</button>
        <button type="button" onclick="closeModal()" class="btn btn-secondary">Cancel</button>
      </div>
    </form>
  `
  openModal()
}

function showEditPromotionModal(promotion) {
  const formContainer = document.getElementById("formContainer")
  formContainer.innerHTML = `
    <h2>Edit Promotion</h2>
    <form id="editPromotionForm">
      <input type="hidden" id="promotionId" value="${promotion.promotionId}">
      <div class="form-group">
        <label for="editPromotionName">Promotion Name:</label>
        <input type="text" id="editPromotionName" value="${promotion.promotionName}" required>
      </div>
      <div class="form-group">
        <label for="editPromotionDescription">Description:</label>
        <textarea id="editPromotionDescription" rows="3">${promotion.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label for="editDiscountPercentage">Discount Percentage:</label>
        <input type="number" id="editDiscountPercentage" value="${promotion.discountPercentage || ''}" step="0.01" min="0" max="100">
      </div>
      <div class="form-group">
        <label for="editDiscountAmount">Discount Amount:</label>
        <input type="number" id="editDiscountAmount" value="${promotion.discountAmount || ''}" step="0.01" min="0">
      </div>
      <div class="form-group">
        <label for="editStartDate">Start Date:</label>
        <input type="date" id="editStartDate" value="${promotion.startDate}" required>
      </div>
      <div class="form-group">
        <label for="editEndDate">End Date:</label>
        <input type="date" id="editEndDate" value="${promotion.endDate}" required>
      </div>
      <div class="form-group">
        <label for="editIsActive">Active:</label>
        <input type="checkbox" id="editIsActive" ${promotion.isActive ? 'checked' : ''}>
      </div>
      <div class="form-actions">
        <button type="button" onclick="savePromotionEdit()" class="btn btn-primary">Save Changes</button>
        <button type="button" onclick="closeModal()" class="btn btn-secondary">Cancel</button>
      </div>
    </form>
  `
  openModal()
}

function showEditStockModal(stock) {
  const formContainer = document.getElementById("formContainer")
  formContainer.innerHTML = `
    <h2>Edit Stock</h2>
    <form id="editStockForm">
      <input type="hidden" id="stockId" value="${stock.stockId}">
      <div class="form-group">
        <label for="editWarehouseLocation">Warehouse Location:</label>
        <input type="text" id="editWarehouseLocation" value="${stock.warehouseLocation}" required>
      </div>
      <div class="form-group">
        <label for="editQuantityAvailable">Quantity Available:</label>
        <input type="number" id="editQuantityAvailable" value="${stock.quantityAvailable}" required>
      </div>
      <div class="form-group">
        <label for="editReorderLevel">Reorder Level:</label>
        <input type="number" id="editReorderLevel" value="${stock.reorderLevel}" required>
      </div>
      <div class="form-actions">
        <button type="button" onclick="saveStockEdit()" class="btn btn-primary">Save Changes</button>
        <button type="button" onclick="closeModal()" class="btn btn-secondary">Cancel</button>
      </div>
    </form>
  `
  openModal()
}

function showEditReportModal(report) {
  const formContainer = document.getElementById("formContainer")
  formContainer.innerHTML = `
    <h2>Edit Report</h2>
    <form id="editReportForm">
      <input type="hidden" id="reportId" value="${report.reportId}">
      <div class="form-group">
        <label for="editReportType">Report Type:</label>
        <input type="text" id="editReportType" value="${report.reportType}" required>
      </div>
      <div class="form-group">
        <label for="editReportDescription">Description:</label>
        <textarea id="editReportDescription" rows="3" required>${report.description}</textarea>
      </div>
      <div class="form-group">
        <label for="editReportStatus">Status:</label>
        <select id="editReportStatus" required>
          <option value="OPEN" ${report.status === 'OPEN' ? 'selected' : ''}>Open</option>
          <option value="IN_PROGRESS" ${report.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
          <option value="RESOLVED" ${report.status === 'RESOLVED' ? 'selected' : ''}>Resolved</option>
          <option value="CLOSED" ${report.status === 'CLOSED' ? 'selected' : ''}>Closed</option>
        </select>
      </div>
      <div class="form-group">
        <label for="editReportPriority">Priority:</label>
        <select id="editReportPriority" required>
          <option value="LOW" ${report.priority === 'LOW' ? 'selected' : ''}>Low</option>
          <option value="MEDIUM" ${report.priority === 'MEDIUM' ? 'selected' : ''}>Medium</option>
          <option value="HIGH" ${report.priority === 'HIGH' ? 'selected' : ''}>High</option>
          <option value="CRITICAL" ${report.priority === 'CRITICAL' ? 'selected' : ''}>Critical</option>
        </select>
      </div>
      <div class="form-actions">
        <button type="button" onclick="saveReportEdit()" class="btn btn-primary">Save Changes</button>
        <button type="button" onclick="closeModal()" class="btn btn-secondary">Cancel</button>
      </div>
    </form>
  `
  openModal()
}

function openUserForm() {
  openModal()
  document.getElementById("formContainer").innerHTML = `
        <h3>Add New User</h3>
        <form onsubmit="saveUser(event)">
            <div class="form-group">
                <label>Username</label>
                <input type="text" id="username" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="email" required>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="password" required>
            </div>
            <div class="form-group">
                <label>Role</label>
                <select id="role" required>
                    <option value="CUSTOMER">Customer</option>
                    <option value="ADMIN">Admin</option>
                    <option value="STORE_MANAGER">Store Manager</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Save</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `
}

function openProductForm() {
  openModal()
  document.getElementById("formContainer").innerHTML = `
        <h3>Add New Product</h3>
        <form onsubmit="saveProduct(event)">
            <div class="form-group">
                <label>Product Name</label>
                <input type="text" id="productName" required>
            </div>
            <div class="form-group">
                <label>Category</label>
                <select id="category" required>
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Beverages">Beverages</option>
                </select>
            </div>
            <div class="form-group">
                <label>Price</label>
                <input type="number" id="price" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Stock Quantity</label>
                <input type="number" id="stockQuantity" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="description"></textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Save</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `
}

function openPromotionForm() {
  openModal()
  document.getElementById("formContainer").innerHTML = `
        <h3>Add New Promotion</h3>
        <form onsubmit="savePromotion(event)">
            <div class="form-group">
                <label>Promotion Name</label>
                <input type="text" id="promotionName" required>
            </div>
            <div class="form-group">
                <label>Discount Percentage</label>
                <input type="number" id="discountPercentage" step="0.01">
            </div>
            <div class="form-group">
                <label>Start Date</label>
                <input type="date" id="startDate" required>
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="date" id="endDate" required>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Save</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `
}

function openReportForm() {
  openModal()
  document.getElementById("formContainer").innerHTML = `
        <h3>Create Maintenance Report</h3>
        <form onsubmit="saveReport(event)">
            <div class="form-group">
                <label>Report Type</label>
                <input type="text" id="reportType" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="reportDescription" required></textarea>
            </div>
            <div class="form-group">
                <label>Priority</label>
                <select id="priority" required>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Save</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `
}

// Save Functions
async function saveUser(event) {
  event.preventDefault()
  const user = {
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    role: document.getElementById("role").value,
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })

    if (response.ok) {
      alert("User created successfully")
      closeModal()
      loadAdminData()
    }
  } catch (error) {
    console.error("Error saving user:", error)
  }
}

async function saveProduct(event) {
  event.preventDefault()
  const product = {
    productName: document.getElementById("productName").value,
    category: document.getElementById("category").value,
    price: Number.parseFloat(document.getElementById("price").value),
    stockQuantity: Number.parseInt(document.getElementById("stockQuantity").value),
    description: document.getElementById("description").value,
  }

  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    })

    if (response.ok) {
      alert("Product created successfully")
      closeModal()
      loadAdminData()
      loadProducts()
    }
  } catch (error) {
    console.error("Error saving product:", error)
  }
}

async function savePromotion(event) {
  event.preventDefault()
  const promotion = {
    promotionName: document.getElementById("promotionName").value,
    discountPercentage: Number.parseFloat(document.getElementById("discountPercentage").value),
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
    isActive: true,
  }

  try {
    const response = await fetch(`${API_BASE_URL}/promotions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(promotion),
    })

    if (response.ok) {
      alert("Promotion created successfully")
      closeModal()
      loadAdminData()
    }
  } catch (error) {
    console.error("Error saving promotion:", error)
  }
}

async function saveReport(event) {
  event.preventDefault()
  const report = {
    reportType: document.getElementById("reportType").value,
    description: document.getElementById("reportDescription").value,
    priority: document.getElementById("priority").value,
    status: "OPEN",
  }

  try {
    const response = await fetch(`${API_BASE_URL}/maintenance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    })

    if (response.ok) {
      alert("Report created successfully")
      closeModal()
      loadAdminData()
    }
  } catch (error) {
    console.error("Error saving report:", error)
  }
}

// Edit Functions
async function editUser(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`)
    if (response.ok) {
      const user = await response.json()
      showEditUserModal(user)
    } else {
      alert("Failed to load user data")
    }
  } catch (error) {
    console.error("Error loading user:", error)
    alert("Error loading user: " + error.message)
  }
}

async function editProduct(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`)
    if (response.ok) {
      const product = await response.json()
      showEditProductModal(product)
    } else {
      alert("Failed to load product data")
    }
  } catch (error) {
    console.error("Error loading product:", error)
    alert("Error loading product: " + error.message)
  }
}

async function editPromotion(promotionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/promotions/${promotionId}`)
    if (response.ok) {
      const promotion = await response.json()
      showEditPromotionModal(promotion)
    } else {
      alert("Failed to load promotion data")
    }
  } catch (error) {
    console.error("Error loading promotion:", error)
    alert("Error loading promotion: " + error.message)
  }
}

async function editStock(stockId) {
  try {
    const response = await fetch(`${API_BASE_URL}/stock/${stockId}`)
    if (response.ok) {
      const stock = await response.json()
      showEditStockModal(stock)
    } else {
      alert("Failed to load stock data")
    }
  } catch (error) {
    console.error("Error loading stock:", error)
    alert("Error loading stock: " + error.message)
  }
}

async function editReport(reportId) {
  try {
    const response = await fetch(`${API_BASE_URL}/maintenance/${reportId}`)
    if (response.ok) {
      const report = await response.json()
      showEditReportModal(report)
    } else {
      alert("Failed to load report data")
    }
  } catch (error) {
    console.error("Error loading report:", error)
    alert("Error loading report: " + error.message)
  }
}

// Delete Functions
async function deleteUser(userId) {
  if (confirm("Are you sure you want to delete this user?")) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, { method: "DELETE" })
      if (response.ok) {
        alert("User deleted successfully")
        loadAdminData()
      } else {
        alert("Failed to delete user")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Error deleting user: " + error.message)
    }
  }
}

async function deleteProduct(productId) {
  if (confirm("Are you sure you want to delete this product?")) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, { method: "DELETE" })
      if (response.ok) {
        alert("Product deleted successfully")
        loadAdminData()
        loadProducts()
      } else {
        alert("Failed to delete product")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Error deleting product: " + error.message)
    }
  }
}

async function deletePromotion(promotionId) {
  if (confirm("Are you sure you want to delete this promotion?")) {
    try {
      const response = await fetch(`${API_BASE_URL}/promotions/${promotionId}`, { method: "DELETE" })
      if (response.ok) {
        alert("Promotion deleted successfully")
        loadAdminData()
      } else {
        alert("Failed to delete promotion")
      }
    } catch (error) {
      console.error("Error deleting promotion:", error)
      alert("Error deleting promotion: " + error.message)
    }
  }
}

// Save Edit Functions
async function saveUserEdit() {
  try {
    const userId = document.getElementById("userId").value
    const userData = {
      username: document.getElementById("editUsername").value,
      email: document.getElementById("editEmail").value,
      phone: document.getElementById("editPhone").value,
      address: document.getElementById("editAddress").value,
      city: document.getElementById("editCity").value,
      postalCode: document.getElementById("editPostalCode").value,
      role: document.getElementById("editRole").value
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    })

    if (response.ok) {
      alert("User updated successfully")
      closeModal()
      loadAdminData()
    } else {
      alert("Failed to update user")
    }
  } catch (error) {
    console.error("Error updating user:", error)
    alert("Error updating user: " + error.message)
  }
}

async function saveProductEdit() {
  try {
    const productId = document.getElementById("productId").value
    const productData = {
      productName: document.getElementById("editProductName").value,
      description: document.getElementById("editDescription").value,
      price: parseFloat(document.getElementById("editPrice").value),
      category: document.getElementById("editCategory").value,
      stockQuantity: parseInt(document.getElementById("editStockQuantity").value),
      imageUrl: document.getElementById("editImageUrl").value
    }

    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData)
    })

    if (response.ok) {
      alert("Product updated successfully")
      closeModal()
      loadAdminData()
      loadProducts()
    } else {
      alert("Failed to update product")
    }
  } catch (error) {
    console.error("Error updating product:", error)
    alert("Error updating product: " + error.message)
  }
}

async function savePromotionEdit() {
  try {
    const promotionId = document.getElementById("promotionId").value
    const promotionData = {
      promotionName: document.getElementById("editPromotionName").value,
      description: document.getElementById("editPromotionDescription").value,
      discountPercentage: document.getElementById("editDiscountPercentage").value ? 
        parseFloat(document.getElementById("editDiscountPercentage").value) : null,
      discountAmount: document.getElementById("editDiscountAmount").value ? 
        parseFloat(document.getElementById("editDiscountAmount").value) : null,
      startDate: document.getElementById("editStartDate").value,
      endDate: document.getElementById("editEndDate").value,
      isActive: document.getElementById("editIsActive").checked
    }

    const response = await fetch(`${API_BASE_URL}/promotions/${promotionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(promotionData)
    })

    if (response.ok) {
      alert("Promotion updated successfully")
      closeModal()
      loadAdminData()
    } else {
      alert("Failed to update promotion")
    }
  } catch (error) {
    console.error("Error updating promotion:", error)
    alert("Error updating promotion: " + error.message)
  }
}

async function saveStockEdit() {
  try {
    const stockId = document.getElementById("stockId").value
    const stockData = {
      warehouseLocation: document.getElementById("editWarehouseLocation").value,
      quantityAvailable: parseInt(document.getElementById("editQuantityAvailable").value),
      reorderLevel: parseInt(document.getElementById("editReorderLevel").value)
    }

    const response = await fetch(`${API_BASE_URL}/stock/${stockId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stockData)
    })

    if (response.ok) {
      alert("Stock updated successfully")
      closeModal()
      loadAdminData()
    } else {
      alert("Failed to update stock")
    }
  } catch (error) {
    console.error("Error updating stock:", error)
    alert("Error updating stock: " + error.message)
  }
}

async function saveReportEdit() {
  try {
    const reportId = document.getElementById("reportId").value
    const reportData = {
      reportType: document.getElementById("editReportType").value,
      description: document.getElementById("editReportDescription").value,
      status: document.getElementById("editReportStatus").value,
      priority: document.getElementById("editReportPriority").value
    }

    const response = await fetch(`${API_BASE_URL}/maintenance/${reportId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportData)
    })

    if (response.ok) {
      alert("Report updated successfully")
      closeModal()
      loadAdminData()
    } else {
      alert("Failed to update report")
    }
  } catch (error) {
    console.error("Error updating report:", error)
    alert("Error updating report: " + error.message)
  }
}
