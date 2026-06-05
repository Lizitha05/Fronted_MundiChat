function getUsuarioId() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) return null;
    return usuario.usuarioPK || null;
}


//VARIABLE GLOBAL PARA LOS EVENTOS
let eventosConfirmadosBD = [];


async function cargarAsistencias() {
    const usuario_id = getUsuarioId();
    if (!usuario_id) {
        eventosConfirmadosBD = [];
        return;
    }
    
    try {
        const respuesta = await fetch(`/mis-asistencias/${usuario_id}`);
        eventosConfirmadosBD = await respuesta.json();
        console.log('Eventos confirmados en BD:', eventosConfirmadosBD);
    } catch (error) {
        console.error('Error cargando asistencias:', error);
        eventosConfirmadosBD = [];
    }
}


//HTML DEL PLACE
async function cargarEventos() {
    try {
        await cargarAsistencias();
        
        const respuesta = await fetch('/request-eventos');
        const eventos = await respuesta.json();
        
        const contenedor = document.getElementById('contenedor-evento');
        if (!contenedor) return;
        
        contenedor.innerHTML = eventos.map(evento => {
            const enLocalStorage = localStorage.getItem(`bookmark_${evento.IdEvento}`);
            
            return `
            <div class="event-content" data-id="${evento.IdEvento}">
                <div class="section-event">
                    <p class="event">${evento.TituloEvento}</p>
                    <p class="content">${evento.DescpEvento || 'Sin descripción'}</p>
                    <div class="hora-time">
                        <input class="iEvent" type="date" value="${formatearFecha(evento.FechaEvento)}" disabled>
                    </div>
                </div>

                <label class="bookmark-toggle">
                    <input type="checkbox" 
                        ${enLocalStorage ? 'checked' : ''}
                        onchange="toggleBookmark(this, ${evento.IdEvento}, '${evento.TituloEvento}', '${evento.DescpEvento || ''}', '${formatearFecha(evento.FechaEvento)}')">
                    <span class="bookmark-icon"></span>
                </label>
            </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error cargando eventos:', error);
    }
}

//DESMENUSA LA DATE TIME DE LA BASE DE DATOS
function formatearFecha(fechaString) {
    if (!fechaString) return '';
    const fecha = new Date(fechaString);
    const anio = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
}


function toggleBookmark(checkbox, id, titulo, descripcion, fecha) {
    const key = `bookmark_${id}`;
    
    if (checkbox.checked) {
        const evento = { id, titulo, descripcion, fecha };
        localStorage.setItem(key, JSON.stringify(evento));
    } else {
        localStorage.removeItem(key);
    }
}


//HTML DEL EVENTS
async function mostrarMisEventos() {
    const contenedor = document.getElementById('my-event-content');
    if (!contenedor) return;
    await cargarAsistencias();
    
    const misEventos = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('bookmark_')) {
            misEventos.push(JSON.parse(localStorage.getItem(key)));
        }
    }
    
    if (misEventos.length === 0) {
        contenedor.innerHTML = '<p class="content">No tienes eventos guardados</p>';
        return;
    }
    
    contenedor.innerHTML = misEventos.map(evento => {
        const confirmadoEnBD = eventosConfirmadosBD.includes(evento.id);
        
        return `
        <div class="event-content" data-id="${evento.id}">
            <div class="section-event">
                <p class="event">${evento.titulo}</p>
                <p class="content">${evento.descripcion || 'Sin descripción'}</p>
                <div class="hora-time">
                    <input class="iEvent" type="date" value="${evento.fecha}" disabled>
                </div>
            </div>

            <label class="custom-check">
                <input type="checkbox" 
                    ${confirmadoEnBD ? 'checked disabled' : ''}
                    onchange="confirmarAsistencia(this, ${evento.id})">
                <span class="checkmark"><img src="" alt=""></span>
            </label>
        </div>
        `;
    }).join('');
}


async function confirmarAsistencia(checkbox, idEvento) {
    if (!checkbox.checked) return;

    const usuario_id = getUsuarioId();
    if (!usuario_id) {
        alert('Debes iniciar sesión para confirmar asistencia');
        checkbox.checked = false;
        return;
    }
    
    try {
        const response = await fetch('/confirmar-asistencia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                evento_id: idEvento,
                usuario_id: usuario_id
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('¡Asistencia confirmada!');
            checkbox.disabled = true;
            // Actualizar la lista local
            eventosConfirmadosBD.push(idEvento);
        } else {
            alert(data.msg || 'Error al confirmar');
            checkbox.checked = false;
        }
        
    } catch (error) {
        console.error('Error:', error);
        checkbox.checked = false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await cargarAsistencias();
    cargarEventos();
    mostrarMisEventos();
});