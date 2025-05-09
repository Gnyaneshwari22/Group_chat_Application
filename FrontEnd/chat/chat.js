const API_BASE_URL = "http://localhost:3000";
axios.defaults.withCredentials = true; // Set credentials globally

document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const chatMessages = document.getElementById("chatMessages");
  const messageInput = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");
  const toggleUsersBtn = document.getElementById("toggleUsersBtn");
  const onlineUsersContainer = document.getElementById("onlineUsers");
  const mobileOnlineUsersContainer =
    document.getElementById("mobileOnlineUsers");
  const usersModal = new bootstrap.Modal("#usersModal");

  // Current user and socket instance
  let currentUser = null;
  let socket = null;

  // Initialize the application
  async function initializeApp() {
    try {
      await verifyUserSession();
      initializeSocketConnection();
      await loadInitialData();
    } catch (error) {
      handleInitializationError(error);
    }
  }

  async function verifyUserSession() {
    try {
      const response = await axios.get(`http://localhost:3000/user/verify`, {
        withCredentials: true,
      });

      // Debugging logs
      console.log("Response:", response.data);
      console.log("Cookies:", document.cookie);

      if (!response.data.user) {
        throw new Error("Invalid user data");
      }

      currentUser = response.data.user;
    } catch (error) {
      console.error("Auth Error:", {
        status: error.response?.status,
        data: error.response?.data,
        cookies: document.cookie,
      });

      window.location.href = "../login/login.html"; // Redirect if unauthorized
      throw error;
    }
  }

  // Initialize WebSocket connection
  function initializeSocketConnection() {
    socket = io(API_BASE_URL, {
      auth: {
        token: getCookie("token"),
      },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setupSocketEventHandlers();
  }

  // Set up all Socket.IO event handlers
  function setupSocketEventHandlers() {
    socket.on("connect", () => {
      console.log("Connected to chat server");
      addSystemMessage("Connected to chat");
    });

    socket.on("new-message", (message) => {
      addMessageToUI(formatMessage(message));
    });

    socket.on("user-connected", (user) => {
      if (user.id !== currentUser.id) {
        addSystemMessage(`${user.username} joined the chat`);
        updateOnlineUsersList();
      }
    });

    socket.on("user-disconnected", (user) => {
      addSystemMessage(`${user.username} left the chat`);
      updateOnlineUsersList();
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      addSystemMessage("Connection error. Reconnecting...");
    });
  }

  // Load initial chat data
  async function loadInitialData() {
    try {
      const [messages, onlineUsers] = await Promise.all([
        axios.get(`${API_BASE_URL}/chat/messages`),
        axios.get(`${API_BASE_URL}/chat/online-users`),
      ]);

      messages.data.forEach((msg) => addMessageToUI(formatMessage(msg)));
      renderOnlineUsers(onlineUsers.data);
      scrollToBottom();
    } catch (error) {
      console.error("Error loading initial data:", error);
      throw error;
    }
  }

  // Format message for UI display
  function formatMessage(msg) {
    const isCurrentUser = msg.sender?.id === currentUser?.id;
    return {
      type: isCurrentUser ? "sent" : "received",
      sender: msg.sender?.username || "System",
      text: msg.content,
      timestamp: new Date(msg.created_at || Date.now()).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }

  // Add message to chat UI
  function addMessageToUI(message) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", message.type);

    if (message.type === "system") {
      messageDiv.textContent = message.text;
    } else if (message.type === "sent") {
      messageDiv.textContent = message.text;
    } else {
      messageDiv.innerHTML = `<strong>${message.sender}:</strong> ${message.text}`;
    }

    const timeSpan = document.createElement("span");
    timeSpan.classList.add(
      "d-block",
      "text-end",
      "small",
      "text-muted",
      "mt-1"
    );
    timeSpan.textContent = message.timestamp;
    messageDiv.appendChild(timeSpan);

    chatMessages.appendChild(messageDiv);
    scrollToBottom();
  }

  // Add system message
  function addSystemMessage(text) {
    addMessageToUI({
      type: "system",
      text: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  }

  // Update online users list
  async function updateOnlineUsersList() {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/online-users`);
      renderOnlineUsers(response.data);
    } catch (error) {
      console.error("Error fetching online users:", error);
    }
  }

  // Render online users to both containers
  function renderOnlineUsers(users) {
    [onlineUsersContainer, mobileOnlineUsersContainer].forEach((container) => {
      if (!container) return;

      container.innerHTML = users
        .map(
          (user) => `
        <div class="user-item ${user.id === currentUser?.id ? "active" : ""}">
          <span class="online-badge"></span>
          ${user.username}
          ${
            user.id === currentUser?.id
              ? '<span class="badge bg-primary ms-2">You</span>'
              : ""
          }
        </div>
      `
        )
        .join("");
    });
  }

  // Handle message sending
  async function handleSendMessage() {
    const messageText = messageInput.value.trim();
    if (!messageText || !socket) return;

    try {
      socket.emit("send-message", { content: messageText });
      messageInput.value = "";
      messageInput.focus();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  }

  // Handle initialization errors
  function handleInitializationError(error) {
    console.error("App initialization failed:", error);
    alert(error.message || "Failed to initialize chat");
    window.location.href = "../login/login.html"; // Redirect to login if needed
  }

  // Scroll chat to bottom
  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Get cookie by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  // Event listeners
  sendBtn.addEventListener("click", handleSendMessage);
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSendMessage();
  });
  toggleUsersBtn.addEventListener("click", () => usersModal.show());

  // Start the application
  initializeApp();
});
