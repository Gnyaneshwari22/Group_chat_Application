document.addEventListener("DOMContentLoaded", function () {
  const socket = io("http://localhost:3000");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const groupList = document.getElementById("groupList");
  const chatWindow = document.getElementById("chatWindow");
  const groupTitle = document.getElementById("groupTitle");
  const messageInput = document.getElementById("messageInput");
  const messageForm = document.getElementById("messageForm");
  const createGroupBtn = document.getElementById("createGroupBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  let selectedGroupId = null;
  let lastMessageId = 0;

  const name = prompt("What is your name?");
  appendMessage("You joined");
  socket.emit("new-user", name);

  socket.on("chat-message", (data) => {
    appendMessage(`${data.name}: ${data.message}`);
  });

  socket.on("user-connected", (name) => {
    appendMessage(`${name} connected`);
  });

  socket.on("user-disconnected", (name) => {
    appendMessage(`${name} disconnected`);
  });

  // Initial load
  if (!token) return (window.location.href = "../login/login.html");
  fetchGroups();

  // ===================== GROUPS ======================

  // function fetchGroups() {
  //   axios
  //     .get("http://localhost:3000/groups", {
  //       headers: { Authorization: `Bearer ${token}` },
  //     })
  //     .then((res) => {
  //       console.log(res.data);
  //     })
  //     .then((res) => {
  //       let groups = res.data.groups;
  //       groupList.innerHTML = "";
  //       groups.forEach((group) => {
  //         const li = document.createElement("li");
  //         li.className = "list-group-item list-group-item-action";
  //         li.textContent = group.name;
  //         li.onclick = () => selectGroup(group);
  //         groupList.appendChild(li);
  //       });
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //       Swal.fire("Error", "Could not fetch groups", "error");
  //     });
  // }
  async function fetchGroups() {
    try {
      const res = await axios.get("http://localhost:3000/groups", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const groups = res.data.groups;
      console.log(res.data);

      groupList.innerHTML = "";
      groups.forEach((group) => {
        const li = document.createElement("li");
        li.className = "list-group-item list-group-item-action";
        li.textContent = group.name;
        li.onclick = () => selectGroup(group);
        groupList.appendChild(li);
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Could not fetch groups", "error");
    }
  }

  function selectGroup(group) {
    selectedGroupId = group.id;
    groupTitle.textContent = group.name;
    chatWindow.innerHTML = "";
    lastMessageId = 0;
    fetchMessages();
  }

  createGroupBtn.addEventListener("click", () => {
    Swal.fire({
      title: "Create Group",
      input: "text",
      inputLabel: "Group Name",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed && result.value.trim() !== "") {
        axios
          .post(
            "http://localhost:3000/groups",
            { name: result.value },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          .then(() => {
            Swal.fire("Created", "Group created successfully", "success");
            fetchGroups();
          })
          .catch((err) => {
            Swal.fire("Error", "Could not create group", "error");
            console.error(err);
          });
      }
    });
  });

  // ===================== MESSAGES ======================

  function fetchMessages() {
    if (!selectedGroupId) return;
    axios
      .get(`http://localhost:3000/groups/${selectedGroupId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { lastMessageId },
      })
      .then((res) => {
        res.data.messages.forEach((msg) => {
          displayMessage(msg);
          lastMessageId = Math.max(lastMessageId, msg.id);
        });
      })
      .catch((err) => console.error(err));
  }

  function displayMessage(message) {
    const div = document.createElement("div");
    div.className =
      message.sender.id == userId ? "text-end mb-2" : "text-start mb-2";

    const bubble = document.createElement("div");
    bubble.className = "d-inline-block p-2 rounded bg-light border";
    bubble.innerHTML = `<strong>${message.sender.username}</strong><br/>${
      message.content
    }<br/><small>${new Date(message.createdAt).toLocaleTimeString()}</small>`;

    div.appendChild(bubble);
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!selectedGroupId) {
      Swal.fire(
        "Select a group",
        "Please choose a group to send message",
        "info"
      );
      return;
    }

    const content = messageInput.value.trim();
    if (!content) return;

    axios
      .post(
        `http://localhost:3000/groups/${selectedGroupId}/message`,
        { content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        messageInput.value = "";
        fetchMessages();
      })
      .catch((err) => {
        Swal.fire("Error", "Could not send message", "error");
        console.error(err);
      });
  });

  // ===================== LOGOUT ======================

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    Swal.fire("Logged Out", "You have been logged out.", "success").then(() => {
      window.location.href = "../login/login.html";
    });
  });

  // Poll messages every 2 seconds
  //setInterval(fetchMessages, 2000);
  document
    .getElementById("uploadForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData();
      const file = document.getElementById("fileInput").files[0];
      formData.append("file", file);

      try {
        const res = await axios.post("/group/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const fileUrl = res.data.fileUrl;
        const fileExt = fileUrl.split(".").pop();

        let element;
        if (["jpg", "png", "jpeg", "gif"].includes(fileExt)) {
          element = `<img src="${fileUrl}" width="200" />`;
        } else if (["mp4", "webm"].includes(fileExt)) {
          element = `<video controls width="250"><source src="${fileUrl}" /></video>`;
        } else {
          element = `<a href="${fileUrl}" target="_blank">Download File</a>`;
        }

        document.getElementById(
          "chatMessages"
        ).innerHTML += `<div>${element}</div>`;
      } catch (error) {
        alert("Upload failed");
        console.error(error);
      }
    });
});
