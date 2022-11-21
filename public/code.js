(async function () {
  users = [];
  const app = document.querySelector(".app");
  const socket = io();

  let uname;

  function initialisation() {
    socket.on("users-changed", (users) => {
      renderUsers(users);
    });
  }

  app
    .querySelector(".join-screen #join-user")
    .addEventListener("click", async function () {
      users = await fetchUsers();
      initialisation();
      renderUsers(users);
      console.log(users);
      let usernames = app.querySelector(".join-screen #username").value;
      // let username = usernames;
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
      header.append(logged);
      logged.innerText = `Logged in as ${usernames}`;

      async function fetchUsers() {
        const res = await fetch("/users");
        return await res.json();
      }
    });
  function renderUsers(users) {
    console.log("labas", users);
    users = users.filter((user) => user.id !== socket.id);

    let list = document.querySelector(".chat-screen .connected");

    list.innerHTML = "";
    const persons = users.map((user) => {
      const person = document.createElement("div");
      person.innerText = user.name;
      console.log(user.name);
      person.dataset.id = user.id;
      console.log(user.id);

      return person;
    });
    list.append(...persons);
  }

  app
    .querySelector(".chat-screen #send-message")
    .addEventListener("click", function () {
      let message = app.querySelector(".chat-screen #message-input").value;
      if (message.length === 0) {
        return;
      }
      renderMessage("my", {
        username: uname,
        text: message,
      });
      socket.emit("chat", {
        username: uname,
        text: message,
      });
      app.querySelector(".chat-screen #message-input").value = "";
    });

  app
    .querySelector(".chat-screen #exit-chat")
    .addEventListener("click", function () {
      socket.emit("exituser", uname);
      window.location.href = window.location.href;
    });

  socket.on("update", function (update) {
    renderMessage("update", update);
  });
  socket.on("chat", function (message) {
    renderMessage("other", message);
  });

  function renderMessage(type, message) {
    let messageContainer = app.querySelector(".chat-screen .messages");
    if (type === "my") {
      let el = document.createElement("div");
      el.setAttribute("class", "message my-message");
      el.innerHTML = `
      <div>
<div class="name">You</div>
<div class="text">${message.text}</div>
      </div>
      `;
      messageContainer.appendChild(el);
    } else if (type === "other") {
      let el = document.createElement("div");
      el.setAttribute("class", "message other-message");
      el.innerHTML = `
      <div>
<div class="name">${message.username}</div>
<div class="text">${message.text}</div>
      </div>
      `;
      messageContainer.appendChild(el);
    } else if (type === "update") {
      let list = document.querySelector(".chat-screen .connected");
      let el = document.createElement("div");
      el.setAttribute("class", "update");
      el.innerText = message;
      list.appendChild(el);
    }
    //scroll chat to end
    messageContainer.scrollTop =
      messageContainer.scrollHeight - messageContainer.clientHeight;
  }
})();
// function renderConnected() {
//   let list = document.querySelector(".chat-screen .connected");
//   let people = document.createElement("div");
//   people.setAttribute("class", "person");
//   console.log(username);
//   // people.innerText=username
// }
