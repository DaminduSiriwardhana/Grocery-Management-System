const API_BASE_URL = "http://localhost:8080"
let allReports = []
const currentUser = JSON.parse(localStorage.getItem("currentUser"))

document.addEventListener("DOMContentLoaded", loadReports)

async function loadReports() {
  try {
    const response = await fetch(`${API_BASE_URL}/maintenance`)
    allReports = await response.json()
    displayReports(allReports)
    updateStats()
    displayCriticalAlerts()
  } catch (error) {
    console.error("Error loading reports:", error)
    document.getElementById("reportsTableBody").innerHTML =
      '<tr><td colspan="8" style="text-align: center; color: red;">Error loading reports</td></tr>'
  }
}

function displayReports(reports) {
  const tbody = document.getElementById("reportsTableBody")

  if (reports.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #7f8c8d;">No reports found</td></tr>'
    return
  }

  tbody.innerHTML = reports
    .map(
      (report) => `
        <tr>
            <td>#${report.reportId}</td>
            <td>${report.reportType}</td>
            <td>${report.description.substring(0, 30)}...</td>
            <td>
                <span class="status-badge status-${report.status.toLowerCase().replace("_", "_")}">
                    ${report.status.replace(/_/g, " ")}
                </span>
            </td>
            <td>
                <span class="priority-badge priority-${report.priority.toLowerCase()}">
                    ${report.priority}
                </span>
            </td>
            <td>${report.reportedByUsername}</td>
            <td>${report.daysOpen} days</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-view" onclick="viewReport(${report.reportId})">View</button>
                    <button class="btn-update" onclick="editReport(${report.reportId})">Update</button>
                    <button class="btn-delete" onclick="deleteReport(${report.reportId})">Delete</button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("")
}

async function updateStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/maintenance/analytics/statistics`)
    const stats = await response.json()

    document.getElementById("totalReports").textContent = stats.TOTAL || 0
    document.getElementById("openReports").textContent = stats.OPEN || 0
    document.getElementById("inProgressReports").textContent = stats.IN_PROGRESS || 0
    document.getElementById("resolvedReports").textContent = stats.RESOLVED || 0
    document.getElementById("criticalReports").textContent = stats.CRITICAL || 0
  } catch (error) {
    console.error("Error loading statistics:", error)
  }
}

function displayCriticalAlerts() {
  const criticalReports = allReports.filter(
    (r) => r.priority === "CRITICAL" && (r.status === "OPEN" || r.status === "IN_PROGRESS"),
  )

  const alertsSection = document.getElementById("criticalAlertsSection")
  const alertsList = document.getElementById("criticalAlertsList")

  if (criticalReports.length === 0) {
    alertsSection.style.display = "none"
    return
  }

  alertsSection.style.display = "block"
  alertsList.innerHTML = criticalReports
    .map(
      (report) => `
        <div class="critical-item">
            <strong>${report.reportType}</strong> - ${report.description}
            <br><small>Reported by: ${report.reportedByUsername} | Days Open: ${report.daysOpen}</small>
        </div>
    `,
    )
    .join("")
}

function filterReports() {
  const statusFilter = document.getElementById("statusFilter").value
  const priorityFilter = document.getElementById("priorityFilter").value

  const filtered = allReports.filter((report) => {
    const matchesStatus = !statusFilter || report.status === statusFilter
    const matchesPriority = !priorityFilter || report.priority === priorityFilter
    return matchesStatus && matchesPriority
  })

  displayReports(filtered)
}

function openAddReportModal() {
  document.getElementById("modalTitle").textContent = "Create New Report"
  document.getElementById("reportForm").reset()
  document.getElementById("reportId").value = ""
  document.getElementById("reportModal").style.display = "block"
}

function closeReportModal() {
  document.getElementById("reportModal").style.display = "none"
}

function viewReport(reportId) {
  const report = allReports.find((r) => r.reportId === reportId)
  if (report) {
    alert(
      `Report #${report.reportId}\n\nType: ${report.reportType}\nDescription: ${report.description}\nStatus: ${report.status}\nPriority: ${report.priority}\nReported By: ${report.reportedByUsername}\nDays Open: ${report.daysOpen}`,
    )
  }
}

function editReport(reportId) {
  const report = allReports.find((r) => r.reportId === reportId)
  if (report) {
    document.getElementById("modalTitle").textContent = "Update Report"
    document.getElementById("reportId").value = report.reportId
    document.getElementById("reportType").value = report.reportType
    document.getElementById("description").value = report.description
    document.getElementById("status").value = report.status
    document.getElementById("priority").value = report.priority
    document.getElementById("reportModal").style.display = "block"
  }
}

async function saveReport(event) {
  event.preventDefault()

  const reportId = document.getElementById("reportId").value
  const reportData = {
    reportType: document.getElementById("reportType").value,
    description: document.getElementById("description").value,
    status: document.getElementById("status").value,
    priority: document.getElementById("priority").value,
    reportedBy: { userId: currentUser.userId },
  }

  try {
    let response
    if (reportId) {
      response = await fetch(`${API_BASE_URL}/maintenance/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      })
    } else {
      response = await fetch(`${API_BASE_URL}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      })
    }

    if (response.ok) {
      alert(reportId ? "Report updated successfully" : "Report created successfully")
      closeReportModal()
      loadReports()
    } else {
      alert("Error saving report")
    }
  } catch (error) {
    console.error("Error saving report:", error)
    alert("Error saving report")
  }
}

async function deleteReport(reportId) {
  if (confirm("Are you sure you want to delete this report?")) {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/${reportId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        alert("Report deleted successfully")
        loadReports()
      } else {
        alert("Error deleting report")
      }
    } catch (error) {
      console.error("Error deleting report:", error)
      alert("Error deleting report")
    }
  }
}

window.onclick = (event) => {
  const modal = document.getElementById("reportModal")
  if (event.target === modal) {
    modal.style.display = "none"
  }
}
