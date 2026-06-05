const express = require('express');
const path = require('path');
const router = express.Router();

/*
Metodos:

POST 
-Registra informacion --> Genera nuevos registros en la base de datos
-Nos sirve para mandar informacion privada

GET 
-Obtener informacion de la base de datos
-Pasar datos atraves de la ruta
-Mostrar informacion

PUT 
-Modificar la base de datos

DELETE
-Eliminar informacion de la base de datos

req  --> Se hace la siguiente pregubta ¿Que me manda el front?
resp --> Respuesta del server

 */

//Ruta raiz
router.get('/' , 
    (req,res)=>{
         res.sendFile('index.html', {  root: './'  })

    }
)

// ruta Universal, aqui para cuando pongas "localhost:(puerto)" aparezca el .html que le pongas aqui

//*Header
router.get('/header', (req, res) => {
    res.sendFile('Html/partial/header.html', { root: './public' })
})

router.get('/header-login', (req, res) => {
    res.sendFile('Html/partial/header-login.html', { root: './public' })
})

//*usuarios

router.get('/login', (req, res) => {
    res.sendFile('Html/login.html', { root: './public' })
})

router.get('/register', (req, res) => {
    res.sendFile('Html/register.html', { root: './public' })
})

router.get('/profile', (req, res) => {
    res.sendFile('Html/profile.html', { root: './public' })
})

router.get('/editProfile', (req, res) => {
    res.sendFile('Html/editProfile.html', { root: './public' })
})

//*CHAT */
router.get('/chatAdd', (req, res) => {
    res.sendFile('Html/chatAdd.html', { root: './public' })
})

router.get('/ChatNotification', (req, res) => {
    res.sendFile('Html/ChatNotification.html', { root: './public' })
})

router.get('/messageChat', (req, res) => {
    res.sendFile('Html/messageChat.html', { root: './public' })
})

//*COUPON
router.get('/coupon', (req, res) => {
    res.sendFile('Html/coupon.html', { root: './public' })
})

//*EVENTS
router.get('/events', (req, res) => {
    res.sendFile('Html/events.html', { root: './public' })
})

//*PLACE
router.get('/place', (req, res) => {
    res.sendFile('Html/place.html', { root: './public' })
})



module.exports = router;

