const API_URL = "http://localhost:3000";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await axios.post(`${API_URL}/user/login`, {
      email,
      password,
    });
    localStorage.setItem("token", response.data.token); // Store token in local storage
    console.log("Login successful:", response.data);

    // Handle successful login
    await Swal.fire({
      icon: "success",
      title: "Login Successful!",
      text: "You are being redirected...",
      timer: 1500,
      showConfirmButton: false,
    });

    // Redirect to dashboard or chat page
    window.location.href = "../chat/chat.html";
  } catch (error) {
    console.error("Login error:", error);

    let errorMessage = "An error occurred during login";
    if (error.response) {
      errorMessage = error.response.data.message || errorMessage;
    }

    Swal.fire({
      icon: "error",
      title: "Login Failed",
      text: errorMessage,
    });
  }
});
