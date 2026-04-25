<?php

/*
Aqui vamos a poner las rutas de nuestras paginas 
Ejemplo :

Si nosotros ponemos  $router->add('/users','controllers/user_page.php'); y abrimos  http://localhost/users hara lo siguiente:


1._Se ira a controller / user_page.php 
2._Dentro del user_page.php tendra el query de consulta de la tabla de usuarios.
3._En conclusion estarias accediendo a controllers/user_page.php

* */


use Core\Router;

$router = new Router();


//Es para ver que el server responde


$router->add('/', 'controller/index.php'); //Necesito ver que cargue todo correctamente 

//* Usuarios
$router->add('/login', 'controller/login.php');
$router->add('/login-process', 'controller/login-process.php');
$router->add('/logout', 'middleware/logout.php');
$router->add('/register', 'controller/register.php');
$router->add('/profile', 'controller/profile.php');

//*chat
$router->add('/chatAdd', 'controller/chatAdd.php');
$router->add('/chatNotification', 'controller/chatNotification.php');
$router->add('/message', 'controller/message.php');

//*Eventos
$router->add('/events', 'controller/events.php');

//*cupon
$router->add('/coupon', 'controller/coupon.php');


//*Lugares
$router->add('/place', 'controller/place.php');


//echo "URI solicitada: " . $_SERVER['REQUEST_URI'] . "<br>"; // para ver cual ruta solicite en la barra 

//ESTE ES SUPER IMPORTANTE PORQUE EJECTUTA EL CONTROLADOR SEGUN LA URL
$router->dispatch($_SERVER['REQUEST_URI']);
