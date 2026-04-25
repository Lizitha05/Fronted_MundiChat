
  <?php

  /*

  echo "Index cargado<br>";  -->lo use para ver si cargaba :,D
 
*Este index es la entrada principal de toda esta pagina aqui podemos :
  --Configurar
  --Funciones globales
  --Clases base como el database, router)
  --Rutas definidas en php
 */
use Core\Router;


$config = require 'core/config.php';
require 'core/functions.php';
require 'core/database.php';
require 'core/router.php';

require 'routes.php';