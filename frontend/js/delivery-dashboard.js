// API Configuration
const API_BASE_URL = "http://localhost:8080"

// Global State
let currentUser = null
let deliveryOrders = []
let timeSlots = []
let scheduleDate = new Date().toISOString().split('T')[0]

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  checkUserSession()
  loadDashboardStats()
  loadOrders()
  loadSchedule()
})

// Navigation
function navigateTo(page) {
  // Hide all pages
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"))
  
  // Remove active class from all nav items
  document.querySelectorAll(".navbar-menu a").forEach((a) => a.classList.remove("active"))

  // Show selected page
  const selectedPage = document.getElementById(page)
  if (selectedPage) {
    selectedPage.classList.add("active")
    
    // Add active class to nav item
    event.target.classList.add("active")

    // Load page-specific data
    if (page === "orders") {
      loadOrders()
    } else if (page === "schedule") {
      loadSchedule()
    } else if (page === "profile") {
      loadProfile()
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
    
    // Check if user is delivery person
    if (currentUser.role !== "DELIVERY_PERSON") {
      alert("Access denied. This page is for delivery persons only.")
      window.location.href = "login.html"
      return
    }
  } else {
    window.location.href = "login.html"
  }
}

function logout() {
  localStorage.removeItem("currentUser")
  currentUser = null
  alert("Logged out successfully")
  window.location.href = "login.html"
}

// Dashboard Stats
async function loadDashboardStats() {
  if (!currentUser) return

  try {
    // Load delivery statistics
    const response = await fetch(`${API_BASE_URL}/delivery-dashboard/stats/${currentUser.userId}`)
    if (response.ok) {
      const stats = await response.json()
      document.getElementById("pendingDeliveries").textContent = stats.pendingDeliveries || 0
      document.getElementById("inTransit").textContent = stats.inTransit || 0
      document.getElementById("completedToday").textContent = stats.completedToday || 0
      document.getElementById("totalEarnings").textContent = `$${(stats.totalEarnings || 0).toFixed(2)}`
    }
  } catch (error) {
    console.error("Error loading dashboard stats:", error)
  }
}

// Orders Management
async function loadOrders() {
  if (!currentUser) return

  try {
    const response = await fetch(`${API_BASE_URL}/delivery-dashboard/orders/${currentUser.userId}`)
    if (response.ok) {
      deliveryOrders = await response.json()
      displayOrders(deliveryOrders)
    } else {
      console.error("Failed to load orders:", response.status)
      displayOrders([])
    }
  } catch (error) {
    console.error("Error loading orders:", error)
    displayOrders([])
  }
}

function displayOrders(ordersToDisplay) {
  const tbody = document.getElementById("ordersTableBody")
  tbody.innerHTML = ""

  if (ordersToDisplay.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-message">No orders found</td></tr>'
    return
  }

  ordersToDisplay.forEach((order) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>#${order.orderId}</td>
      <td>${order.customerName || 'N/A'}</td>
      <td>${order.deliveryAddress || 'N/A'}</td>
      <td>$${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</td>
      <td><span class="status-badge status-${order.currentStatus ? order.currentStatus.toLowerCase() : 'pending'}">${order.currentStatus || 'PENDING'}</span></td>
      <td>${order.timeSlot || 'Not assigned'}</td>
      <td>
        <button class="btn btn-primary" onclick="viewOrderDetails(${order.orderId})">View</button>
        <button class="btn btn-secondary" onclick="updateOrderStatus(${order.orderId})">Update Status</button>
        <button class="btn btn-danger" onclick="deleteOrder(${order.orderId})">Delete</button>
      </td>
    `
    tbody.appendChild(row)
  })
}

function filterOrders() {
  const statusFilter = document.getElementById("statusFilter").value
  const searchTerm = document.getElementById("searchOrders").value.toLowerCase()
  
  let filtered = deliveryOrders
  
  if (statusFilter) {
    filtered = filtered.filter(order => order.currentStatus === statusFilter)
  }
  
  if (searchTerm) {
    filtered = filtered.filter(order => 
      order.orderId.toString().includes(searchTerm) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm)) ||
      (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(searchTerm))
    )
  }
  
  displayOrders(filtered)
}

function searchOrders() {
  filterOrders()
}

// Order Details Modal
async function viewOrderDetails(orderId) {
  try {
    const response = await fetch(`${API_BASE_URL}/delivery-dashboard/orders/${orderId}`)
    if (response.ok) {
      const order = await response.json()
      showOrderDetailsModal(order)
    } else {
      alert("Failed to load order details")
    }
  } catch (error) {
    console.error("Error loading order details:", error)
    alert("Error loading order details: " + error.message)
  }
}

function showOrderDetailsModal(order) {
  const orderDetails = document.getElementById("orderDetails")
  orderDetails.innerHTML = `
    <h3>Order #${order.orderId}</h3>
    
    <div class="detail-section">
      <h4>Customer Information</h4>
      <div class="detail-row">
        <span class="detail-label">Name:</span>
        <span class="detail-value">${order.customerName || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Phone:</span>
        <span class="detail-value">${order.customerPhone || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Email:</span>
        <span class="detail-value">${order.customerEmail || 'N/A'}</span>
      </div>
    </div>
    
    <div class="detail-section">
      <h4>Delivery Information</h4>
      <div class="detail-row">
        <span class="detail-label">Address:</span>
        <span class="detail-value">${order.deliveryAddress || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">City:</span>
        <span class="detail-value">${order.deliveryCity || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Postal Code:</span>
        <span class="detail-value">${order.deliveryPostalCode || 'N/A'}</span>
      </div>
    </div>
    
    <div class="detail-section">
      <h4>Order Details</h4>
      <div class="detail-row">
        <span class="detail-label">Total Amount:</span>
        <span class="detail-value">$${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span class="detail-value">${order.currentStatus || 'PENDING'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Time Slot:</span>
        <span class="detail-value">${order.timeSlot || 'Not assigned'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Estimated Delivery:</span>
        <span class="detail-value">${order.estimatedDeliveryTime || 'Not set'}</span>
      </div>
    </div>
    
    <div class="form-actions">
      <button class="btn btn-primary" onclick="updateOrderStatus(${order.orderId})">Update Status</button>
      <button class="btn btn-secondary" onclick="assignTimeSlot(${order.orderId})">Assign Time Slot</button>
      <button class="btn btn-secondary" onclick="closeOrderModal()">Close</button>
    </div>
  `
  
  openOrderModal()
}

function openOrderModal() {
  document.getElementById("orderModal").classList.add("active")
}

function closeOrderModal() {
  document.getElementById("orderModal").classList.remove("active")
}

// Status Update Modal
function updateOrderStatus(orderId) {
  const order = deliveryOrders.find(o => o.orderId === orderId)
  if (!order) return
  
  const statusForm = document.getElementById("statusForm")
  statusForm.innerHTML = `
    <h3>Update Order Status</h3>
    <form id="statusUpdateForm">
      <input type="hidden" id="orderId" value="${orderId}">
      
      <div class="form-group">
        <label for="newStatus">New Status:</label>
        <select id="newStatus" required>
          <option value="PENDING" ${order.currentStatus === 'PENDING' ? 'selected' : ''}>Pending</option>
          <option value="PICKED_UP" ${order.currentStatus === 'PICKED_UP' ? 'selected' : ''}>Picked Up</option>
          <option value="IN_TRANSIT" ${order.currentStatus === 'IN_TRANSIT' ? 'selected' : ''}>In Transit</option>
          <option value="DELIVERED" ${order.currentStatus === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
          <option value="FAILED" ${order.currentStatus === 'FAILED' ? 'selected' : ''}>Failed</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="currentLocation">Current Location (Optional):</label>
        <input type="text" id="currentLocation" placeholder="Enter current location">
      </div>
      
      <div class="form-group">
        <label for="deliveryNotes">Delivery Notes (Optional):</label>
        <textarea id="deliveryNotes" rows="3" placeholder="Any notes about the delivery"></textarea>
      </div>
      
      <div class="form-actions">
        <button type="button" onclick="saveStatusUpdate()" class="btn btn-primary">Update Status</button>
        <button type="button" onclick="closeStatusModal()" class="btn btn-secondary">Cancel</button>
      </div>
    </form>
  `
  
  openStatusModal()
}

function openStatusModal() {
  document.getElementById("statusModal").classList.add("active")
}

function closeStatusModal() {
  document.getElementById("statusModal").classList.remove("active")
}

async function saveStatusUpdate() {
  try {
    const orderId = document.getElementById("orderId").value
    const newStatus = document.getElementById("newStatus").value
    const currentLocation = document.getElementById("currentLocation").value
    const deliveryNotes = document.getElementById("deliveryNotes").value
    
    const updateData = {
      orderId: parseInt(orderId),
      deliveryPersonId: currentUser.userId,
      currentStatus: newStatus,
      currentLocation: currentLocation,
      deliveryNotes: deliveryNotes
    }
    
    const response = await fetch(`${API_BASE_URL}/delivery-dashboard/update-status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData)
    })
    
    if (response.ok) {
      alert("Order status updated successfully")
      closeStatusModal()
      loadOrders()
      loadDashboardStats()
    } else {
      alert("Failed to update order status")
    }
  } catch (error) {
    console.error("Error updating status:", error)
    alert("Error updating status: " + error.message)
  }
}

// Time Slot Management
async function loadSchedule() {
  const selectedDate = document.getElementById("scheduleDate").value || scheduleDate
  
  try {
    const response = await fetch(`${API_BASE_URL}/delivery-dashboard/schedule/${currentUser.userId}?date=${selectedDate}`)
    if (response.ok) {
      timeSlots = await response.json()
      displaySchedule(timeSlots)
    } else {
      console.error("Failed to load schedule:", response.status)
      displaySchedule([])
    }
  } catch (error) {
    console.error("Error loading schedule:", error)
    displaySchedule([])
  }
}

function displaySchedule(slots) {
  const scheduleGrid = document.getElementById("scheduleGrid")
  scheduleGrid.innerHTML = ""
  
  if (slots.length === 0) {
    scheduleGrid.innerHTML = '<div class="empty-message">No time slots scheduled for this date</div>'
    return
  }
  
  slots.forEach((slot) => {
    const slotCard = document.createElement("div")
    slotCard.className = "time-slot-card"
    slotCard.innerHTML = `
      <div class="time-slot-header">
        <span class="time-slot-time">${slot.startTime} - ${slot.endTime}</span>
        <div class="time-slot-actions">
          <button class="btn btn-secondary" onclick="editTimeSlot(${slot.slotId})">Edit</button>
          <button class="btn btn-danger" onclick="deleteTimeSlot(${slot.slotId})">Delete</button>
        </div>
      </div>
      <div class="time-slot-orders">
        <h4>Orders (${slot.orders ? slot.orders.length : 0})</h4>
        ${slot.orders && slot.orders.length > 0 ? 
          slot.orders.map(order => `
            <div class="order-item">
              <div class="order-item-info">
                <div class="order-item-id">Order #${order.orderId}</div>
                <div class="order-item-address">${order.deliveryAddress}</div>
              </div>
              <div class="order-item-actions">
                <button class="btn btn-primary" onclick="viewOrderDetails(${order.orderId})">View</button>
              </div>
            </div>
          `).join('') : 
          '<p>No orders assigned to this time slot</p>'
        }
      </div>
    `
    scheduleGrid.appendChild(slotCard)
  })
}

function openTimeSlotModal() {
  const timeSlotForm = document.getElementById("timeSlotForm")
  timeSlotForm.innerHTML = `
    <h3>Add Time Slot</h3>
    <form id="timeSlotFormData">
      <div class="form-group">
        <label for="slotDate">Date:</label>
        <input type="date" id="slotDate" value="${scheduleDate}" required>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="startTime">Start Time:</label>
          <input type="time" id="startTime" required>
        </div>
        <div class="form-group">
          <label for="endTime">End Time:</label>
          <input type="time" id="endTime" required>
        </div>
      </div>
      
      <div class="form-group">
        <label for="maxOrders">Max Orders:</label>
        <input type="number" id="maxOrders" value="5" min="1" max="20" required>
      </div>
      
      <div class="form-group">
        <label for="slotNotes">Notes (Optional):</label>
        <textarea id="slotNotes" rows="3" placeholder="Any notes about this time slot"></textarea>
      </div>
      
      <div class="form-actions">
        <button type="button" onclick="saveTimeSlot()" class="btn btn-primary">Create Time Slot</button>
        <button type="button" onclick="closeTimeSlotModal()" class="btn btn-secondary">Cancel</button>
      </div>
    </form>
  `
  
  openTimeSlotModalWindow()
}

function openTimeSlotModalWindow() {
  document.getElementById("timeSlotModal").classList.add("active")
}

function closeTimeSlotModal() {
  document.getElementById("timeSlotModal").classList.remove("active")
}

async function saveTimeSlot() {
  try {
    const slotData = {
      deliveryPersonId: currentUser.userId,
      date: document.getElementById("slotDate").value,
      startTime: document.getElementById("startTime").value,
      endTime: document.getElementById("endTime").value,
      maxOrders: parseInt(document.getElementById("maxOrders").value),
      notes: document.getElementById("slotNotes").value
    }
    
    const response = await fetch(`${API_BASE_URL}/delivery-dashboard/time-slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slotData)
    })
    
    if (response.ok) {
      alert("Time slot created successfully")
      closeTimeSlotModal()
      loadSchedule()
    } else {
      alert("Failed to create time slot")
    }
  } catch (error) {
    console.error("Error creating time slot:", error)
    alert("Error creating time slot: " + error.message)
  }
}

function editTimeSlot(slotId) {
  const slot = timeSlots.find(s => s.slotId === slotId)
  if (!slot) return
  
  const timeSlotForm = document.getElementById("timeSlotForm")
  timeSlotForm.innerHTML = `
    <h3>Edit Time Slot</h3>
    <form id="timeSlotFormData">
      <input type="hidden" id="slotId" value="${slotId}">
      
      <div class="form-group">
        <label for="slotDate">Date:</label>
        <input type="date" id="slotDate" value="${slot.date}" required>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="startTime">Start Time:</label>
          <input type="time" id="startTime" value="${slot.startTime}" required>
        </div>
        <div class="form-group">
          <label for="endTime">End Time:</label>
          <input type="time" id="endTime" value="${slot.endTime}" required>
        </div>
      </div>
      
      <div class="form-group">
        <label for="maxOrders">Max Orders:</label>
        <input type="number" id="maxOrders" value="${slot.maxOrders}" min="1" max="20" required>
      </div>
      
      <div class="form-group">
        <label for="slotNotes">Notes (Optional):</label>
        <textarea id="slotNotes" rows="3" placeholder="Any notes about this time slot">${slot.notes || ''}</textarea>
      </div>
      
      <div class="form-actions">
        <button type="button" onclick="updateTimeSlot()" class="btn btn-primary">Update Time Slot</button>
        <button type="button" onclick="closeTimeSlotModal()" class="btn btn-secondary">Cancel</button>
      </div>
    </form>
  `
  
  openTimeSlotModalWindow()
}

async function updateTimeSlot() {
  try {
    const slotId = document.getElementById("slotId").value
    const slotData = {
      date: document.getElementById("slotDate").value,
      startTime: document.getElementById("startTime").value,
      endTime: document.getElementById("endTime").value,
      maxOrders: parseInt(document.getElementById("maxOrders").value),
      notes: document.getElementById("slotNotes").value
    }
    
    const response = await fetch(`${API_BASE_URL}/delivery-dashboard/time-slots/${slotId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slotData)
    })
    
    if (response.ok) {
      alert("Time slot updated successfully")
      closeTimeSlotModal()
      loadSchedule()
    } else {
      alert("Failed to update time slot")
    }
  } catch (error) {
    console.error("Error updating time slot:", error)
    alert("Error updating time slot: " + error.message)
  }
}

async function deleteTimeSlot(slotId) {
  if (!confirm("Are you sure you want to delete this time slot?")) return
  
  try {
    const response = await fetch(`${API_BASE_URL}/delivery-dashboard/time-slots/${slotId}`, {
      method: "DELETE"
    })
    
    if (response.ok) {
      alert("Time slot deleted successfully")
      loadSchedule()
    } else {
      alert("Failed to delete time slot")
    }
  } catch (error) {
    console.error("Error deleting time slot:", error)
    alert("Error deleting time slot: " + error.message)
  }
}

// Assign Time Slot to Order
function assignTimeSlot(orderId) {
  const order = deliveryOrders.find(o => o.orderId === orderId)
  if (!order) return
  
  // This would open a modal to select from available time slots
  alert("Time slot assignment feature - to be implemented")
}

// Delete Order
async function deleteOrder(orderId) {
  if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return
  
  try {
    const response = await fetch(`${API_BASE_URL}/delivery-dashboard/orders/${orderId}`, {
      method: "DELETE"
    })
    
    if (response.ok) {
      alert("Order deleted successfully")
      loadOrders()
      loadDashboardStats()
    } else {
      alert("Failed to delete order")
    }
  } catch (error) {
    console.error("Error deleting order:", error)
    alert("Error deleting order: " + error.message)
  }
}

// Profile Management
async function loadProfile() {
  if (!currentUser) return
  
  try {
    // Load user profile
    document.getElementById("profileName").textContent = currentUser.username
    document.getElementById("profileEmail").textContent = currentUser.email
    document.getElementById("profilePhone").textContent = currentUser.phone || 'Not provided'
    document.getElementById("profileAddress").textContent = currentUser.address || 'Not provided'
    
    // Load delivery statistics
    const response = await fetch(`${API_BASE_URL}/delivery-dashboard/stats/${currentUser.userId}`)
    if (response.ok) {
      const stats = await response.json()
      document.getElementById("totalDeliveries").textContent = stats.totalDeliveries || 0
      document.getElementById("successRate").textContent = `${(stats.successRate || 0).toFixed(1)}%`
      document.getElementById("averageRating").textContent = (stats.averageRating || 0).toFixed(1)
    }
  } catch (error) {
    console.error("Error loading profile:", error)
  }
}

// Set initial date
document.getElementById("scheduleDate").value = scheduleDate
