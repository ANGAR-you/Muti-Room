(function(){
    const app = document.querySelector(".app");
    const socket = io();

    let uname;

    app.querySelector(".join-screen #join-user").addEventListener("click", function(){
        let username = app.querySelector(".join-screen #username").value.trim();
        if(username.length == 0){
            return;
        }
        socket.emit("newuser", username);
        uname = username;
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    });

    app.querySelector(".chat-screen #send-message").addEventListener("click", function(){
        let message = app.querySelector(".chat-screen #message-input").value.trim();
        if(message.length == 0){
            return;
        }
        renderMessage("My", {
            username: uname,
            text: message
        });
        socket.emit("chat", {
            username: uname,
            text: message
        });
        app.querySelector(".chat-screen #message-input").value = "";
    });

    app.querySelector(".chat-screen #exit-chat").addEventListener("click",function(){
        socket.emit("exituser", uname);
        window.location.href = window.location.href;
    });

    socket.on("update", function(update){
        renderMessage("update", update);
    });

    socket.on("chat", function(message){
        renderMessage("other", message);
    });
    socket.on("history", function(messages){
        messages.forEach(message => {
            renderMessage("other", message);
        });
    });
    // Recevoir et afficher l'historique des messages
    socket.on("history", function(messages){
        messages.forEach(message => {
            renderMessage("other", message);
        });
    });

    function renderMessage(type, message){
        let messageContainer = app.querySelector(".chat-screen .messages");
        let el = document.createElement("div");

        if(type == "My"){
            el.setAttribute("class", "message my-message");
            el.innerHTML = `
                <div>
                    <div class="name">You</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
        } else if (type == "other"){
            el.setAttribute("class", "message other-message");
            el.innerHTML = `
                <div>
                    <div class="name">${message.username}</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
        } else if(type == "update"){
            el.setAttribute("class", "update");
            el.innerText = message;
        }

        messageContainer.appendChild(el);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
})();
