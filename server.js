const { Server } = require("socket.io")

const io = new Server(3000, {
  cors: {
    origin: "*"
  }
})

io.on('connection', socket =>{
    console.log("Usuario conectado")
    socket.emit('chat-message', 'Hello world')
    socket.on('send-chat-message',message=>{
        console.log(message)
    })
})