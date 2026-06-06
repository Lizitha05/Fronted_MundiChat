fetch("/header") .then(response => response.text()) .then(data => { document.getElementById("header").innerHTML = data; });



const usuario = localStorage.getItem('usuario');
    /*console.log(usuario)*/


if(!localStorage.getItem('usuario')){
    fetch("/header") .then(response => response.text()) .then(data => { document.getElementById("header").innerHTML = data; });

}else{
fetch("/header-login") .then(response => response.text()) .then(data => { 
    document.getElementById("header-login").innerHTML = data; 
    
    cargarFotoPerfil();

});

}

function cargarFotoPerfil(){

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

  document.getElementById('imgProfile').src = fotoSrc;

}else{
    console.log('No hay foto en el local storage');
}
}

cargarFotoPerfil();
