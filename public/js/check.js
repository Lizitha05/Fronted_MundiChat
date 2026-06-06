const usuario = localStorage.getItem('usuario');
    /*console.log(usuario)*/


if(!localStorage.getItem('usuario')){
    /*console.log("No hay sesion");*/
    window.location.href = '/register';
}