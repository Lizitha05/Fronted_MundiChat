const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

socket.on('chat-message', data=>{
    AppendMessage(data.message, 'other')
})

messageForm.addEventListener('submit', e =>{
    e.preventDefault()
    const message = messageInput.value

     socket.emit('send-chat-message', {
        message: message,
        sender: socket.id
    })

    AppendMessage(message, 'me')
    messageInput.value = ''
})

function AppendMessage(message, type){
    const messageElement = document.createElement('div')
    messageElement.innerText = message

    if(type === 'me'){
        messageElement.classList.add('my-message')
    }else{
        messageElement.classList.add('other-message')
    }

    messageContainer.append(messageElement)
}