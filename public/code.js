(async function () {
  users = [];
  let messages = {};
  let activeChatId = null;
  const app = document.querySelector(".app");
  const socket = io();
  let list = document.querySelector(".chat-screen .connected");

  let uname;

  function initialisation() {
    socket.on("users-changed", (users) => {
      renderUsers(users);
    });
    socket.on("chat-message", (message) => {
      addMessage(message.text, message.senderId);
      if (message.senderId === activeChatId) {
        renderMessages(message.senderId);
      } else {
        newMessage(message.senderId);
      }
    });
  }

  function newMessage(userId) {
    list
      .querySelector(`div[data-id="${userId}"]`)
      .classList.add("has-new-notification");
  }

  app
    .querySelector(".join-screen #join-user")
    .addEventListener("click", async function () {
      users = await fetchUsers();
      initialisation();
      renderUsers(users);
      console.log(users);
      let usernames = app.querySelector(".join-screen #username").value;

      console.log(usernames);
      if (usernames === "") {
        return;
      }
      socket.emit("newuser", usernames);
      uname = usernames;
      app.querySelector(".join-screen").classList.remove("active");

      app.querySelector(".chat-screen").classList.add("active");
      let header = document.querySelector(".chat-screen .header");
      let logged = document.createElement("div");
      logged.setAttribute("class", "logged");
      header.append(logged);
      logged.innerText = `Logged in as ${usernames}`;

      async function fetchUsers() {
        const res = await fetch("/users");
        return await res.json();
      }
    });
  function renderUsers(users) {
    users = users.filter((user) => user.id !== socket.id);

    list.innerHTML = "";
    const persons = users.map((user) => {
      const person = document.createElement("div");
      person.innerText = user.name;

      person.dataset.id = user.id;

      return person;
    });
    list.append(...persons);
    initialisationListener(persons);
  }
  function initialisationListener(persons) {
    persons.forEach((personEle) => {
      personEle.addEventListener("click", () => {
        activateChat(personEle);
      });
    });
  }
  function activateChat(personEle) {
    const userId = personEle.dataset.id;

    const input = document.querySelector("#message-input");
    const button = document.querySelector("#send-message");

    if (activeChatId) {
      list.querySelector(`div[data-id="${userId}"]`).classList.remove("active");
    }
    list
      .querySelector(`div[data-id="${userId}"]`)
      .classList.remove("has-new-notification");

    activeChatId = userId;
    personEle.classList.add("active");

    input.classList.remove("hidden");
    button.classList.remove("hidden");
    renderMessages(activeChatId);

    button.addEventListener("click", () => {
      const message = {
        name: uname,
        text: input.value,
        recipientId: activeChatId,
      };

      socket.emit("chat-message", message);
      addMessage(message.text, message.recipientId);
      renderMessages(userId);

      input.value = "";
    });
  }
  function addMessage(text, userId) {
    if (!messages[userId]) {
      messages[userId] = [];
    }

    messages[userId].push({ text });
  }

  function renderMessages(userId) {
    const messagesList = document.querySelector(".chat-screen .read .messages");

    messagesList.innerHTML = "";
    if (!messages[userId]) {
      messages[userId] = [];
    }

    const messagesUser = messages[userId].map((message) => {
      const messageChat = document.createElement("div");

      messageChat.setAttribute("class", "message");

      messageChat.innerText = message.text;

      return messageChat;
    });
    messagesList.append(...messagesUser);
  }

  app
    .querySelector(".chat-screen #exit-chat")
    .addEventListener("click", function () {
      socket.emit("exituser", uname);
      window.location.href = window.location.href;
    });
})();
