const fileInput = document.getElementById('fileOpeneReg');
const previewImg = document.getElementById('preview');

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader(); reader.onload = (e) => {
            previewImg.src = e.target.result;

        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('togglePassword').addEventListener('click' , function(){

    const input = document.getElementById('idPassword');
    const icon = document.getElementById('eyeIcon');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('bi-eye-fill');
        icon.classList.add('bi-eye-slash-fill');
    }else{
        input.type = 'password';
        icon.classList.remove('bi-eye-slash-fill');
        icon.classList.add('bi-eye-fill');
    }
});

const formData = new FormData();
document.getElementById('formRegister').addEventListener('submit', async (e) => {

    e.preventDefault();

    formData.append('mail',document.getElementById('idMail').value);
    formData.append('nickname',document.getElementById('idNickname').value);
    formData.append('nombre',document.getElementById('idNombre').value) ;
    formData.append('date',document.getElementById('idDate').value);
    formData.append('password' ,document.getElementById('idPassword').value)

    const fileInput = document.getElementById('fileOpeneReg');
    if (fileInput.files[0]) {
        formData.append('fileOpeneReg',fileInput.files[0]);
    }

    fetch('/feature-register', {

        method: 'POST',
        body: formData

       
    })
        .then(response => response.json())
        .then(data => {

            /*  console.log(JSON.stringify(data, null, 2)); */
              
             
            if (data.msg === "Este usuario ya existe") {
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
            } else if(data.msg==="Usuario registrado") {

                 Swal.fire({
                    icon: "success",
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
                        window.location.href = data.redirect;
                    }
                });
                   

            }else{
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

            console.error("Error en el fetch ", error);
            
        })


});

