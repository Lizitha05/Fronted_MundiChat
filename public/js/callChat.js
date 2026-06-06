//*Llamadas
import { io } from "https://cdn.socket.io/4.8.3/socket.io.esm.min.js";
const socket = io();

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