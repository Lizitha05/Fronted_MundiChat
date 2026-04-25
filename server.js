const { Server } = require("socket.io")

const io = new Server(3000, {
  cors: {
    origin: "*"
  }
})

io.on('connection', socket =>{
    socket.on('send-chat-message', data=>{
        socket.broadcast.emit('chat-message', data)
    })
})