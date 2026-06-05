


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
  document.querySelector('input[name="nombreCompleto"]').value = usuario.nombreCompleto;
  document.querySelector('input[name="correoElectronico"]').value = usuario.correo;
  
  document.querySelector('input[name="apodo"]').value = usuario.nomUsu;
  
  const fecha = new Date(usuario.fechaNacimiento);
  const dia = fecha.getDate().toString().padStart(2,'0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2,'0');

  const anio = fecha.getFullYear();

  const fechaFormateada= `${anio}-${mes}-${dia}`;
  
  
  document.querySelector('input[name="cumple"]').value = fechaFormateada;


}else{
    console.log('No hay foto en el local storage');
}
}

const fileInput = document.getElementById('fileOpeneReg');
const previewImg = document.getElementById('img');

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader(); reader.onload = (e) => {
            previewImg.src = e.target.result;

        };
        reader.readAsDataURL(file);
    }
});





cargarPerfil();



const formData = new FormData();
document.getElementById('formProf').addEventListener('submit', async (e) => {

    e.preventDefault();

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const idUsuario = usuario.usuarioPK;
   /*  const contraUsuario = usuario.contra; */
    console.log(idUsuario);
    formData.append('idUsuario', idUsuario);
    /* formData.append('contra', contraUsuario); */

    formData.append('correoElectronico',document.getElementById('idMail').value);
    formData.append('apodo',document.getElementById('idApodo').value);
    formData.append('nombreCompleto',document.getElementById('idNombre').value) ;
    formData.append('cumple',document.getElementById('idCumple').value);
   

    const fileInput = document.getElementById('fileOpeneReg');
    if (fileInput.files[0]) {
        formData.append('fileOpeneReg',fileInput.files[0]);
    }

    fetch('/feature-edit', {

        method: 'PUT',
        body: formData

       
    })
        .then(response => response.json())
        .then(data => {

            /*  console.log(JSON.stringify(data, null, 2)); */
              
               

            if (data.msg === "Usuario modificado exitosamente") {
                 Swal.fire({
                    icon: "error",
                    text: data.msg,
                    customClass: {
                        text: 'letter',
                        confirmButton: 'btn-ok',
                        icon: 'icon-custom'
                    },
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#1D2984',
                    iconColor: '#1D2984'
                }).then(result =>{


                    if(result.isConfirmed){
                        localStorage.setItem('usuario', JSON.stringify(data.usuario));
                        window.location.href = data.redirect;
                    }
                });



            }  else{
                 Swal.fire({
                    icon: "error",
                    text: data.msg,
                    customClass: {
                        text: 'letter',
                        confirmButton: 'btn-ok',
                        icon: 'icon-custom'
                    },
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#1D2984',
                    iconColor: '#1D2984'
                });
            }

        })
        .catch(error => {

            console.log(error);
        console.error('=== ERROR DETALLADO ===');
    console.error('Mensaje:', error.message);      // Mensaje del erroror
    console.error('Código:', error.code);           // Código de erroror SQL (ej: ER_DUP_ENTRY)
    console.error('SQL State:', error.sqlState);    // Estado SQL
    console.error('SQL:', error.sql);               // La consulta que falló
    console.error('Stack:', error.stack);           // Rastro completo
    console.error('Objeto completo:', JSON.stringify(err, null, 2));
            console.error("Error en el fetch ", error);
            
        })


});

