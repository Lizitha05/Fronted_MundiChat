
function cargarPerfil(){

const usuario = JSON.parse(localStorage.getItem('usuario'));


/* console.log('Foto existe:', !!usuario.foto);
console.log('Primeros 50 chars:', usuario.foto?.substring(0, 50));
console.log('Empieza con data:image?', usuario.foto?.startsWith('data:image'));
 */

if (usuario && usuario.foto) {
  let fotoSrc = usuario.foto;

  
  if(!fotoSrc.startsWith('data:image')){
     fotoSrc = 'data:image/png;base64,' + fotoSrc; 
  }

  document.getElementById('img').src = fotoSrc;
  document.getElementById('nombreCompleto').textContent = usuario.nombreCompleto;
  document.getElementById('correoElectronico').textContent = usuario.correo;
  document.getElementById('apodo').textContent = usuario.nomUsu;
  
  const fecha = new Date(usuario.fechaNacimiento);
  const dia = fecha.getDate().toString().padStart(2,'0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2,'0');

  const anio = fecha.getFullYear();

  const fechaFormateada= `${dia}/${mes}/${anio}`;
  
  
  document.getElementById('cumple').textContent = fechaFormateada;


}else{
    console.log('No hay foto en el local storage');
}
}

cargarPerfil();
