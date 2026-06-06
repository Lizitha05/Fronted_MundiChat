import { io } from "https://cdn.socket.io/4.8.3/socket.io.esm.min.js";
const socket = io();
//*Chat
let chatActualId = null;
let usuarioActual = null;


function getUsuarioActual() {
    const usuarioJSON = localStorage.getItem('usuario');
    if (!usuarioJSON) {
        console.error('No hay usuario en localStorage');
        return null;
    }
    return JSON.parse(usuarioJSON);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

//Formateamos la fecha
function formatFecha(fechaISO) {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

//Usuarios

async function obtenerTodosLosUsuarios() {
    if (!usuarioActual) return [];

    try {
        const response = await fetch(`/api/usuarios/${usuarioActual.usuarioPK}`);
        const data = await response.json();

        if (data.success) {
            return data.usuarios;
        }
        return [];
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return [];
    }
}

async function obtenerOCrearChat(usuario1Id, usuario2Id) {
    try {
        const response = await fetch(`/api/obtener-o-crear-chat/${usuario1Id}/${usuario2Id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener/crear chat:', error);
        return { success: false };
    }
}

async function renderizarUsuarios() {
    const contenedor = document.getElementById('contenedor-usuarios');
    if (!contenedor) return;

    const usuarios = await obtenerTodosLosUsuarios();

    if (!usuarios || usuarios.length === 0) {
        contenedor.innerHTML = '<div class="no-usuarios text-center p-3">No hay usuarios registrados</div>';
        return;
    }

    contenedor.innerHTML = usuarios.map(usuario => `
                <div class="chatUser" data-usuario-id="${usuario.usuarioPK}" data-usuario-nombre="${escapeHtml(usuario.nomUsu)}" data-usuario-foto="${usuario.foto ? `data:image/jpeg;base64,${usuario.foto}` : '/Image/default-profile.png'}">
                    <img src="${usuario.foto ? `data:image/jpeg;base64,${usuario.foto}` : '/Image/default-profile.png'}" alt="${escapeHtml(usuario.nomUsu)}">
                    <div class="content">
                        <label class="lChat">${escapeHtml(usuario.nomUsu)}</label>
                        <label class="nombreCompleto">${escapeHtml(usuario.nombreCompleto || '')}</label>
                        <input class="iChat" type="text" value="" placeholder="Sin mensajes aún" disabled>
                    </div>
                </div>
            `).join('');

    // Agregar event listeners
    document.querySelectorAll('.chatUser').forEach(chatDiv => {
        chatDiv.addEventListener('click', async () => {
            const usuarioId = parseInt(chatDiv.dataset.usuarioId);
            const usuarioNombre = chatDiv.dataset.usuarioNombre;
            const usuarioFoto = chatDiv.dataset.usuarioFoto;

            // Obtener o crear el chat
            const chatInfo = await obtenerOCrearChat(usuarioActual.usuarioPK, usuarioId);

            if (chatInfo.success && chatInfo.chat) {
                await seleccionarChat(chatInfo.chat.chatId, usuarioId, usuarioNombre, usuarioFoto);
            }
        });
    });
}

//Mensajes

async function obtenerMensajesDeChat(chatId) {
    try {
        const response = await fetch(`/api/mensajes/${chatId}`);
        const data = await response.json();

        if (data.success) {
            return data.mensajes;
        }
        return [];
    } catch (error) {
        console.error('Error al obtener mensajes:', error);
        return [];
    }
}

function renderizarMensajes(mensajes) {
    const contenedor = document.getElementById('message-container');
    if (!contenedor) return;

    if (!mensajes || mensajes.length === 0) {
        contenedor.innerHTML = '<div class="no-mensajes">No hay mensajes aún. ¡Envía el primero!</div>';
        return;
    }

    // Renderizar todos los mensajes
    contenedor.innerHTML = mensajes.map(mensaje => {
        const esPropio = mensaje.creadorPK === usuarioActual?.usuarioPK;
        return `
                    <div class="mensaje ${esPropio ? 'mensaje-propio' : 'mensaje-otro'}">
                        <div class="mensaje-header">
                            <span class="mensaje-autor">${escapeHtml(mensaje.autorNombre)}</span>
                            <span class="mensaje-fecha">${formatFecha(mensaje.fecha)}</span>
                        </div>
                        <div class="mensaje-texto">${escapeHtml(mensaje.texto)}</div>
                    </div>
                `;
    }).join('');

    // Scroll al último mensaje (importante: usar setTimeout para asegurar que el DOM se actualizó)
    setTimeout(() => {
        scrollAlUltimoMensaje();
    }, 100);
}
// Función para hacer scroll al último mensaje
function scrollAlUltimoMensaje() {
    const contenedor = document.getElementById('message-container');
    if (contenedor) {
        contenedor.scrollTo({
            top: contenedor.scrollHeight,
            behavior: 'smooth'
        });
        console.log('Scroll al último mensaje');
    }
}


async function enviarMensaje(chatId, texto) {
    if (!texto.trim()) return false;

    try {
        const response = await fetch('/api/mensajes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chatFK: chatId,
                texto: texto,
                creadorMensajeFK: usuarioActual.usuarioPK
            })
        });

        const data = await response.json();

        if (data.success) {
            socket.emit('chat message', {
                chatId: chatId,
                mensaje: data.mensaje,
                autorPK: usuarioActual.usuarioPK,
                autorNombre: usuarioActual.nomUsu
            });
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        return false;
    }
}

//Chat

async function seleccionarChat(chatId, usuarioId, usuarioNombre, usuarioFoto) {
    console.log(`Seleccionando chat ${chatId} con ${usuarioNombre}`);
    chatActualId = chatId;
    localStorage.setItem("idChat", chatId);
    localStorage.setItem("chatCon", usuarioId);

    // Mostrar sección de chat
    document.getElementById("chatSection").style.display = "flex";
    document.getElementById("noChatSeleccionado").style.display = "none";

    // Mostrar información del usuario en el header
    const chatHeader = document.getElementById('chat-header');
    chatHeader.innerHTML = `
        <img src="${usuarioFoto}" alt="${escapeHtml(usuarioNombre)}" class="chat-header-img">
        <div class="chat-header-info">
            <h5>${escapeHtml(usuarioNombre)}</h5>
        </div>
    `;

    // Mostrar loading
    const contenedorMensajes = document.getElementById('message-container');
    contenedorMensajes.innerHTML = '<div class="text-center p-3">Cargando mensajes...</div>';

    // Cargar mensajes del chat
    const mensajes = await obtenerMensajesDeChat(chatId);
    renderizarMensajes(mensajes);

    // Unirse a la sala del chat para recibir mensajes en tiempo real
    socket.emit('join chat', chatId);
    console.log(`Unido a la sala: chat_${chatId}`);

    // Resaltar usuario seleccionado
    document.querySelectorAll('.chatUser').forEach(user => {
        if (parseInt(user.dataset.usuarioId) === usuarioId) {
            user.classList.add('active');
        } else {
            user.classList.remove('active');
        }
    });
}

//Socket.io , eventos
socket.on('connect', () => {
    console.log('Conectado a Socket.IO');
});

socket.on('chat message', (data) => {
    console.log('Mensaje recibido por socket:', data);

    // Si el mensaje es del chat actual, agregarlo al contenedor
    if (data.chatId === chatActualId && usuarioActual && data.autorPK !== usuarioActual.usuarioPK) {
        const contenedor = document.getElementById('message-container');

        // Crear el nuevo mensaje
        const mensajeHtml = `
            <div class="mensaje mensaje-otro">
                <div class="mensaje-header">
                    <span class="mensaje-autor">${escapeHtml(data.autorNombre)}</span>
                    <span class="mensaje-fecha">${formatFecha(new Date().toISOString())}</span>
                </div>
                <div class="mensaje-texto">${escapeHtml(data.mensaje.texto)}</div>
            </div>
        `;

        // Eliminar el mensaje de "no hay mensajes" si existe
        if (contenedor.innerHTML.includes('No hay mensajes aún')) {
            contenedor.innerHTML = '';
        }

        // Agregar el nuevo mensaje
        contenedor.insertAdjacentHTML('beforeend', mensajeHtml);

        // Scroll al último mensaje
        scrollAlUltimoMensaje();
    }
});

//Inicializacion
async function init() {
    usuarioActual = getUsuarioActual();
    if (!usuarioActual) {
        console.error('No hay usuario logueado');
        window.location.href = '/Html/login.html';
        return;
    }

    console.log('Usuario logueado:', usuarioActual.nomUsu);

    await renderizarUsuarios();

    // Configurar evento de envío de mensaje
    const form = document.getElementById('send-container');
    const input = document.getElementById('message-input');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (input.value && input.value.trim() && chatActualId) {
                const texto = input.value.trim();

                // Mostrar mensaje inmediatamente en el UI
                const contenedor = document.getElementById('message-container');

                // Eliminar mensaje de "no hay mensajes" si existe
                if (contenedor.innerHTML.includes('No hay mensajes aún')) {
                    contenedor.innerHTML = '';
                }

                // Agregar mensaje propio temporalmente
                const mensajeTempHtml = `
                            <div class="mensaje mensaje-propio">
                                <div class="mensaje-header">
                                    <span class="mensaje-autor">${escapeHtml(usuarioActual.nomUsu)}</span>
                                    <span class="mensaje-fecha">${formatFecha(new Date().toISOString())}</span>
                                </div>
                                <div class="mensaje-texto">${escapeHtml(texto)}</div>
                            </div>
                        `;
                contenedor.insertAdjacentHTML('beforeend', mensajeTempHtml);
                scrollAlUltimoMensaje();

                // Enviar al servidor
                const enviado = await enviarMensaje(chatActualId, texto);

                if (!enviado) {
                    // Si falla, mostrar error
                    console.error('Error al enviar mensaje');
                    // Opcional: eliminar el mensaje o mostrar error
                }

                input.value = '';
            }
        });
    }
    // Al iniciar, si hay un chat seleccionado previamente, cargar sus mensajes
    async function verificarChatPendiente() {
        const idChatGuardado = localStorage.getItem('idChat');
        const chatConGuardado = localStorage.getItem('chatCon');

        if (idChatGuardado && idChatGuardado !== 'null' && idChatGuardado !== '' && chatConGuardado) {
            // Obtener información del otro usuario
            try {
                const response = await fetch(`/api/usuarios-simple/${usuarioActual.usuarioPK}`);
                const data = await response.json();

                if (data.success) {
                    const otroUsuario = data.usuarios.find(u => u.usuarioPK == chatConGuardado);
                    if (otroUsuario) {
                        const usuarioFoto = otroUsuario.foto ? `data:image/jpeg;base64,${otroUsuario.foto}` : '/Image/default-profile.png';
                        await seleccionarChat(parseInt(idChatGuardado), otroUsuario.usuarioPK, otroUsuario.nomUsu, usuarioFoto);
                    }
                }
            } catch (error) {
                console.error('Error al recuperar chat pendiente:', error);
            }
        }
    }

    // Llamar esta función después de renderizarUsuarios() en init()
    // Agrega esta línea al final de init():
    await verificarChatPendiente();


    // Buscador de usuarios
    const buscador = document.getElementById('buscarUsuario');
    if (buscador) {
        buscador.addEventListener('input', (e) => {
            const termino = e.target.value.toLowerCase();
            const usuarios = document.querySelectorAll('.chatUser');
            usuarios.forEach(usuario => {
                const nombre = usuario.querySelector('.lChat')?.innerText.toLowerCase() || '';
                if (nombre.includes(termino)) {
                    usuario.style.display = 'flex';
                } else {
                    usuario.style.display = 'none';
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    init();
});


let localStream = null;
let remoteStream = null;
let peerConnection = null;
let isCallHost = null;
let currentCallChatId = null;



//Permite escuchar audi y video 
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:openrelay.metered.ca:80' }
    ]
};



//Iniciamos la llamada , ayuda quiero dormir :,D
async function iniciarLlamada(chatId) {

    alert(chatId);
    console.log("VEAMOS SI TRAE ALGO"+ chatId);
    currentCallChatId = chatId;
    
    // intenta abrir la fokin camara alv sino atrapa algo
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: { width: 640, height: 480 }
        });
        
        //washamos video
        const localVideo = document.getElementById('local-video');
        if (localVideo) {
            localVideo.srcObject = localStream;
            localVideo.play();
        }
        
        //nos unimos a la fokin llamada
        socket.emit('union-llamada', chatId);
        
    } catch (err) {
        console.error('Error al acceder a cámara/micrófono:', err);
        alert('No se pudo acceder a la cámara o micrófono');
    }
}

//Cosas que pasan en las llamadas , ejemplo si eres el primero, o el ultimo
//Primer usuario
socket.on('llamada-creada', (salaNombre) => {
    isCallHost = true;
    console.log('Sala de llamada creada:', salaNombre);
    mostrarInterfazLlamada();
});

// Te uniste a una llamada existente
socket.on('llamada-unida', (salaNombre) => {
    isCallHost = false;
    console.log('Unido a llamada:', salaNombre);
    // Notificar al otro usuario que estamos listos
    socket.emit('llamada-lista', currentCallChatId);
    mostrarInterfazLlamada();
});

//mensaje de que se unio el compa
socket.on('usuario-unido-llamada', (userId) => {
    console.log('Otro usuario se unió a la llamada:', userId);
    // El host inicia la conexión WebRTC
    if (isCallHost) {
        socket.emit('llamada-lista', currentCallChatId);
    }
});

// El otro usuario está listo para la llamada
socket.on('llamada-lista', () => {
    console.log('Otro usuario listo, creando offer...');
    if (isCallHost) {
        crearPeerConnection();
        crearYEnviarOffer();
    }
});

// Recibir OFFER
socket.on('ofrecer', async (data) => {
    console.log('ofrecer recibida');
    if (!isCallHost) {
        crearPeerConnection();
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        
        // Crear answer
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        socket.emit('preguntar', {
            chatId: currentCallChatId,
            answer: answer
        });
    }
});

// Recibir ANSWER
socket.on('preguntar', async (data) => {
    console.log('pregunta recibida');
    if (isCallHost) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
});

// Recibir ICE Candidate
socket.on('candidatos', async (data) => {
    try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (err) {
        console.error('Error al agregar candidatos:', err);
    }
});

// El otro usuario colgó
socket.on('peer-left-call', () => {
    console.log('El otro usuario colgó');
    finalizarLlamada();
});

// Sala llena
socket.on('llamada-llena', () => {
    alert('La llamada ya está en curso con otra persona');
    finalizarLlamada();
});

// video y audio de los candidatos

function crearPeerConnection() {
    peerConnection = new RTCPeerConnection(ICE_SERVERS);
    
    // Agregar tracks locales (audio/video)
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });
    
    // Cuando recibimos tracks del remoto
    peerConnection.ontrack = (event) => {
        const remoteVideo = document.getElementById('remote-video');
        if (remoteVideo && event.streams[0]) {
            remoteVideo.srcObject = event.streams[0];
            remoteVideo.play();
        }
    };
    
    // Cuando tenemos un candidatos, enviarlo al otro peer
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('candidatos', {
                chatId: currentCallChatId,
                candidate: event.candidate
            });
        }
    };
    
    return peerConnection;
}

async function crearYEnviarOffer() {
    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        socket.emit('ofrecer', {
            chatId: currentCallChatId,
            offer: offer
        });
    } catch (err) {
        console.error('Error al crear offer:', err);
    }
}

//Colgar llamada

function mostrarInterfazLlamada() {
    // Muestra el contenedor de video
    document.getElementById('video-call-container').style.display = 'flex';
}

function finalizarLlamada() {
    // Detener streams
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    
    // Cerrar conexión
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    
    // Notificar al servidor
    if (currentCallChatId) {
        socket.emit('colgar-llamada', currentCallChatId);
    }
    
    // Ocultar interfaz
    document.getElementById('video-call-container').style.display = 'none';
    
    // Limpiar variables
    localStream = null;
    remoteStream = null;
    currentCallChatId = null;
    isCallHost = false;
}

// Mutear/Desmutear
function toggleMic() {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            return audioTrack.enabled;
        }
    }
}

// Apagar/Prender cámara
function toggleCamera() {
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            return videoTrack.enabled;
        }
    }
}


//boton de llamada
document.addEventListener('DOMContentLoaded', () => {
    const btnLlamar = document.getElementById('btn-llamar');
    if (btnLlamar) {
        btnLlamar.addEventListener('click', () => {

            
            if (!chatActualId) {
                alert('Selecciona un chat primero');
                return;
            }
            iniciarLlamada(chatActualId);
        });
    }
});