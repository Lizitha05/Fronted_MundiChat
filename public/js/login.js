
document.getElementById('formLogin').addEventListener('submit', async (e) => {

    e.preventDefault();
    const inputMail = document.getElementById('inputMail').value;
    const inputPassword = document.getElementById('inputPassword').value;


    fetch('/feature-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mailUser: inputMail, passwordUser: inputPassword })
    })
        .then(response => response.json())
        .then(data => {
           
          /* alert(JSON.stringify(data, null, 2)); */

            if (data.msg === "Login exitoso") {
                localStorage.setItem('usuario', JSON.stringify(data.info));
                window.location.href = data.redirect;
            } else {

                Swal.fire({
                    icon: "error",
                    text: data.msg,
                    customClass:{
                    text:'letter',
                    confirmButton: 'btn-ok',
                    icon: 'icon-custom'
                    },
                    confirmButtonText:'Aceptar',
                    confirmButtonColor: '#1D2984',
                    iconColor:'#1D2984'
                });
                
            }

        })
        .catch(error =>{
        
            console.error("Error en el fetch " , error)
        })
    

});

