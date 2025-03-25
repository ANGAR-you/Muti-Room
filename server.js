const express = require("express");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Connexion à MongoDB
mongoose.connect("mongodb://localhost:27017/chatApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB!");
}).catch((error) => {
    console.error("MongoDB connection error:", error);
});

// Création du modèle de message
const messageSchema = new mongoose.Schema({
    username: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model("Message", messageSchema);

const PORT = process.env.PORT || 5000;

// Servir les fichiers statiques du dossier 'public'
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    console.log("Un utilisateur s'est connecté.");

    // Récupérer l'historique des messages de MongoDB et l'envoyer au nouvel utilisateur
    Message.find().sort({ timestamp: 1 }).limit(50).exec((err, messages) => {
        if (err) {
            console.error("Erreur lors de la récupération des messages :", err);
        } else {
            socket.emit("history", messages);
        }
    });

    // Lorsqu'un utilisateur rejoint
    socket.on("newuser", (username) => {
        const joinMessage = `${username} a rejoint la conversation.`;
        socket.broadcast.emit("update", joinMessage);
    });

    // Lorsqu'un utilisateur quitte
    socket.on("exituser", (username) => {
        const exitMessage = `${username} a quitté la conversation.`;
        socket.broadcast.emit("update", exitMessage);
    });

    // Lorsqu'un utilisateur envoie un message
    socket.on("chat", (message) => {
        const newMessage = new Message({
            username: message.username,
            text: message.text
        });

        // Sauvegarder le message dans MongoDB
        newMessage.save((err) => {
            if (err) {
                console.error("Erreur lors de l'enregistrement du message :", err);
            } else {
                socket.broadcast.emit("chat", message);
            }
        });
    });

    // Détection de déconnexion
    socket.on("disconnect", () => {
        console.log("Un utilisateur s'est déconnecté.");
    });
});

// Démarrer le serveur
server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
