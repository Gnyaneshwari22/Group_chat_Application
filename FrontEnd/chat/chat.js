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

  // Mock Data
  const currentUser = "You";
  const onlineUsers = ["You", "Vaibhav", "Alice", "Bob", "Charlie"];
  const chatHistory = [
    { type: "system", text: "You joined the chat", timestamp: "10:00 AM" },
    { type: "system", text: "Vaibhav joined the chat", timestamp: "10:02 AM" },
    {
      type: "received",
      sender: "Vaibhav",
      text: "Hello everyone!",
      timestamp: "10:05 AM",
    },
    { type: "sent", text: "Hi Vaibhav! How are you?", timestamp: "10:06 AM" },
    {
      type: "received",
      sender: "Vaibhav",
      text: "I'm good, thanks! Working on the new project.",
      timestamp: "10:07 AM",
    },
    { type: "system", text: "Alice joined the chat", timestamp: "10:15 AM" },
    {
      type: "received",
      sender: "Alice",
      text: "Morning team! Any updates?",
      timestamp: "10:16 AM",
    },
  ];

  // Initialize UI
  function initializeUI() {
    // Load chat history
    chatHistory.forEach((msg) => addMessageToUI(msg));

    // Populate online users
    updateOnlineUsersList();

    // Auto-scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Add message to UI
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

    // Add timestamp if available
    if (message.timestamp) {
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
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Update online users list
  function updateOnlineUsersList() {
    const containers = [onlineUsersContainer, mobileOnlineUsersContainer];

    containers.forEach((container) => {
      if (!container) return;

      container.innerHTML = "";
      onlineUsers.forEach((user) => {
        const userItem = document.createElement("div");
        userItem.classList.add("user-item");
        if (user === currentUser) userItem.classList.add("active");

        userItem.innerHTML = `
                    <span class="online-badge"></span>
                    ${user}
                    ${
                      user === currentUser
                        ? '<span class="badge bg-primary ms-2">You</span>'
                        : ""
                    }
                `;

        container.appendChild(userItem);
      });
    });
  }

  // Send message handler
  function handleSendMessage() {
    const messageText = messageInput.value.trim();
    if (!messageText) return;

    // Create mock message
    const newMessage = {
      type: "sent",
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Add to UI
    addMessageToUI(newMessage);

    // Simulate reply after 1-3 seconds
    if (Math.random() > 0.3) {
      const users = onlineUsers.filter((u) => u !== currentUser);
      const randomUser = users[Math.floor(Math.random() * users.length)];

      setTimeout(() => {
        const replies = [
          "Hey there!",
          "What's up?",
          "I'm busy right now",
          "Let's discuss this later",
          "Thanks for the update!",
        ];

        const replyMessage = {
          type: "received",
          sender: randomUser,
          text: replies[Math.floor(Math.random() * replies.length)],
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        addMessageToUI(replyMessage);
      }, 1000 + Math.random() * 2000);
    }

    // Clear input
    messageInput.value = "";
    messageInput.focus();
  }

  // Event Listeners
  sendBtn.addEventListener("click", handleSendMessage);
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSendMessage();
  });
  toggleUsersBtn.addEventListener("click", () => usersModal.show());

  // Initialize
  initializeUI();
});
