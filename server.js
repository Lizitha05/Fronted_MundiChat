const { Server } = require("socket.io")

const io = new Server(3000, {
  cors: {
    origin: "*"
  }
})

io.on('connection', socket =>{
    socket.on('send-chat-message', message=>{
        socket.broadcast.emit('chat-message', message)
    })
})