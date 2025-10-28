const API_BASE_URL = "http://localhost:8080"
let allReports = []
let currentUser = null
let selectedReportId = null

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAccess()
  loadReportData()
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

async function loadReportData() {
  try {
    const response = await fetch(`${API_BASE_URL}/maintenance`)
    allReports = await response.json()
    displayReportTable(allReports)
    updateReportStats()
  } catch (error) {
    console.error("Error loading reports:", error)
  }
}

function displayReportTable(reports) {
  const tbody = document.getElementById("reportsTableBody")
  tbody.innerHTML = ""

  reports.forEach((report) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${report.reportId}</td>
      <td>${report.reportType}</td>
      <td>${report.description.substring(0, 50)}...</td>
      <td><span class="status-badge status-${report.status.toLowerCase()}">${report.status}</span></td>
      <td><span class="status-badge priority-${report.priority.toLowerCase()}">${report.priority}</span></td>
      <td>${report.reportedBy.username}</td>
      <td>${new Date(report.createdAt).toLocaleDateString()}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-secondary" onclick="openUpdateReport(${report.reportId})">Update</button>
          <button class="btn btn-danger" onclick="deleteReport(${report.reportId})">Delete</button>
        </div>
      </td>
    `
    tbody.appendChild(row)
  })
}

function updateReportStats() {
  const totalReports = allReports.length
  const openReports = allReports.filter((r) => r.status === "OPEN").length
  const inProgressReports = allReports.filter((r) => r.status === "IN_PROGRESS").length
  const criticalReports = allReports.filter((r) => r.priority === "CRITICAL").length

  document.getElementById("totalReports").textContent = totalReports
  document.getElementById("openReports").textContent = openReports
  document.getElementById("inProgressReports").textContent = inProgressReports
  document.getElementById("criticalReports").textContent = criticalReports
}

function filterReports() {
  const status = document.getElementById("statusFilter").value
  const priority = document.getElementById("priorityFilter").value

  let filtered = allReports

  if (status) {
    filtered = filtered.filter((r) => r.status === status)
  }

  if (priority) {
    filtered = filtered.filter((r) => r.priority === priority)
  }

  displayReportTable(filtered)
}

function openReportForm() {
  document.getElementById("reportModal").classList.add("active")
}

function closeReportModal() {
  document.getElementById("reportModal").classList.remove("active")
  document.getElementById("reportForm").reset()
}

async function saveReport(event) {
  event.preventDefault()

  const report = {
    reportedBy: currentUser.userId,
    reportType: document.getElementById("reportType").value,
    description: document.getElementById("reportDescription").value,
    priority: document.getElementById("reportPriority").value,
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
      closeReportModal()
      loadReportData()
    }
  } catch (error) {
    console.error("Error saving report:", error)
  }
}

function openUpdateReport(reportId) {
  selectedReportId = reportId
  const report = allReports.find((r) => r.reportId === reportId)
  if (report) {
    document.getElementById("updateStatus").value = report.status
    document.getElementById("updateNotes").value = ""
    document.getElementById("updateReportModal").classList.add("active")
  }
}

function closeUpdateReportModal() {
  document.getElementById("updateReportModal").classList.remove("active")
}

async function updateReport(event) {
  event.preventDefault()

  const report = allReports.find((r) => r.reportId === selectedReportId)
  const updatedReport = {
    ...report,
    status: document.getElementById("updateStatus").value,
  }

  try {
    const response = await fetch(`${API_BASE_URL}/maintenance/${selectedReportId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedReport),
    })

    if (response.ok) {
      alert("Report updated successfully")
      closeUpdateReportModal()
      loadReportData()
    }
  } catch (error) {
    console.error("Error updating report:", error)
  }
}

async function deleteReport(reportId) {
  if (confirm("Are you sure?")) {
    try {
      await fetch(`${API_BASE_URL}/maintenance/${reportId}`, { method: "DELETE" })
      loadReportData()
    } catch (error) {
      console.error("Error deleting report:", error)
    }
  }
}

function logout() {
  localStorage.removeItem("currentUser")
  window.location.href = "login.html"
}
