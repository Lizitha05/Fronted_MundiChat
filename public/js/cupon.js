function getUsuarioId() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) return null;
    return usuario.usuarioPK || null;
}


async function MostrarCupones() {
    const usuario_id = getUsuarioId();
    if (!usuario_id) {
        console.error('No hay usuario logueado');
        return;
    }
    
    try {
        const respuesta = await fetch(`/request-cupones/${usuario_id}`);
        const cupones = await respuesta.json();

        const contenedor = document.getElementById('coupon-section');
        if (!contenedor) return;
        if (cupones.length === 0) {
            contenedor.innerHTML = '<p>No tienes cupones</p>';
            return;
        }
        contenedor.innerHTML = cupones.map(cupon => {
            return `
            <div class="coupon-section2" id="coupon-section2">
                <div class="coupon-info" data-id="${cupon.cuponPK}">
                    <h6 class="title-coupon">${cupon.TituloCupon || 'Sin título'}</h6>
                    <p class="content-coupon">${cupon.descripcion || ''}</p>
                    <div class="hora-time">
                    <input class="iEvent" type="date" value="${formatearFecha(cupon.vencimiento)}" disabled>
                    </div>
                    <p class="code-coupon">${cupon.CodigoCupon || ''}</p>
                </div>
            </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error al cargar cupones:', error);
    }
}

function formatearFecha(fechaString) {
    if (!fechaString) return '';
    const fecha = new Date(fechaString);
    const anio = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
}

document.addEventListener('DOMContentLoaded', () => {
    MostrarCupones();
});