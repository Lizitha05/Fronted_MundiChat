<?php


session_start();

use Core\Database;

$config = require 'core/config.php';
$db = new Database($config);


if ($_SERVER['REQUEST_METHOD'] === 'POST') {


    //Aqui limpiamos los parametros y mandamos el NAME
    $correo = filter_var(trim($_POST['iCorreoUser'] ?? ''));
    $contraseña = $_POST['iContraUser'] ?? '';

    // Validaciones
    $errors = [];

    if (empty($correo) || empty($contraseña)) {
        $errors[] = "Por favor, complete todos los campos.";
    }
    if (strlen($contraseña) <  8) {
        $errors[] = "La contraseña no puede tener menos de 8 caracteres.";
    } else if (strlen($contraseña)  > 10) {
        $errors[] = "La contraseña no puede tener mas de 10 caracteres.";
    }

    if (!empty($errors)) {
        $error = implode("<br>", $errors);
        $page = 'login';
        require 'view/login.view.php';
        exit();
    }

    try {

        // Valores del procedure      
       
        $stmt = $db->query("CALL sp_userLogin(?, ?)", [
            $correo,
            $contraseña
        ]);


        // Primer resultset: datos del usuario
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        // Segundo resultset: mensaje y éxito
        /* $stmt->nextRowset();
        $out = $stmt->fetch(PDO::FETCH_ASSOC);
 */


      /*   if ($out) {
            $mensaje = $out['mensaje'] ?? '';
            $exito   = (bool)$out['existe'];
           
        } else {
            $mensaje = $out['mensaje'] ?? '';
            $exito   = false;
        } */

        if ($usuario && $usuario['existe']==1) {
            session_regenerate_id(true);

            //*Usuario id
            $_SESSION['session_id'] = $usuario['usuarioPK'];
            //*Nombre completo
          /*   $_SESSION['session_nomCom'] = $usuario['nomUsu']; */
            //*Nombre de usuario
            $_SESSION['session_nickname'] = $usuario['nomUsu']; 
            //*Fecha de nacimiento
            $_SESSION['session_contra'] = $usuario['contra']; 
            //*Correo
            $_SESSION['session_correo'] = $usuario['correo'];
           //*estadp
            $_SESSION['session_estado'] = $usuario['estado'];
           

            //*activo
           /*   $_SESSION['estadoUser']= $usuario['estado']; */
 

            $_SESSION['logged_in'] = true;
           
           /*  $error = $mensaje ?: "Entro"; */
            $error="Credenciales validas";
             $page = 'index';
            require 'view/index.view.php';
         /*    if ($_SESSION['session_rol'] === 'Administrador') {
                require 'controllers/mainAdmin.php';
            } else {
                require 'controllers/main.php';
            } */

            exit();

        } else {
            /* $error = $mensaje ?: "Credenciales inválidas."; */
            $error="Credenciales inválidas";
            $page = 'login';
            require 'view/login.view.php';
            exit();
        }
    } catch (Exception $e) {
        error_log("Error en login: " . $e->getMessage());
        die("Error exacto: " . htmlspecialchars($e->getMessage()));
        $error = "Error del sistema. Por favor, intente más tarde.";
        $page = 'login';
        require 'view/login.view.php';
        exit();
    }
} 
