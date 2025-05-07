const API_URL = "http://localhost:3000"; // Use uppercase for constants

const handleSignup = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}/user/signup`, payload);
    console.log("Signup successful:", response.data);

    // Show success popup
    await Swal.fire({
      icon: "success",
      title: "Signup Successful!",
      text: "Your account has been created.",
    });

    // Redirect to login page
    window.location.href = "../login/login.html";
  } catch (error) {
    console.error("Signup failed:", error.response?.data || error.message);

    // Show error popup
    const errorMessage =
      error.response?.data?.message || "An error occurred. Please try again.";
    Swal.fire({
      icon: "error",
      title: "Signup Failed",
      text: errorMessage,
    });
  }
};

// Get form data
const getFormData = () => {
  const form = document.getElementById("signupForm");
  return {
    username: form.name.value, // Changed from 'username' to 'name' (matches your HTML)
    email: form.email.value,
    password: form.password.value,
    phone: form.phone.value,
  };
};

// Event listener for form submission
document
  .getElementById("signupForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = getFormData();
    await handleSignup(payload);
  });
