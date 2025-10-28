const API_BASE_URL = "http://localhost:8080"

// Handle Login
async function handleLogin(event) {
  event.preventDefault()

  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })

    const result = await response.json()

    if (result.success) {
      localStorage.setItem("currentUser", JSON.stringify(result.user))
      localStorage.setItem("authToken", result.token)
      alert("Login successful!")
      window.location.href = "index.html"
    } else {
      alert(result.message || "Invalid email or password")
    }
  } catch (error) {
    console.error("Error during login:", error)
    alert("Login failed: " + error.message)
  }
}

// Handle Register
async function handleRegister(event) {
  event.preventDefault()

  const password = document.getElementById("password").value
  const confirmPassword = document.getElementById("confirmPassword").value

  if (password !== confirmPassword) {
    alert("Passwords do not match")
    return
  }

  const user = {
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    address: document.getElementById("address").value,
    city: document.getElementById("city").value,
    postalCode: document.getElementById("postalCode").value,
    password: password,
    role: "CUSTOMER",
  }

  console.log("Registering user:", { ...user, password: "***" })

  try {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })

    console.log("Response status:", response.status)

    if (response.ok) {
      const userData = await response.json()
      console.log("Registration successful:", userData)
      alert("Registration successful! Please login.")
      window.location.href = "login.html"
    } else {
      // Try to parse error response
      let errorMessage = "Unknown error"
      try {
        const errorData = await response.json()
        console.error("Registration error:", errorData)
        errorMessage = errorData.message || errorData.error || "Registration failed"
      } catch (parseError) {
        console.error("Could not parse error response:", parseError)
        errorMessage = `Registration failed with status ${response.status}`
      }
      alert("Registration failed: " + errorMessage)
    }
  } catch (error) {
    console.error("Error during registration:", error)
    alert("Registration failed: " + error.message)
  }
}
