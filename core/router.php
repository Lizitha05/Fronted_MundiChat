<?php
namespace Core;
class Router{
    private $routes = [];
    //Este registra rutas
    public function add($route, $controller, $middleware = null) {
        $this->routes[$route] = [
            'controller' => $controller,
            'middleware' => $middleware
        ];
    }

    

public function dispatch($uri) {


        $uri = parse_url($uri, PHP_URL_PATH);
        $basePath = '/Fronted_MundiChat';
        $uri = str_replace($basePath, '', $uri);




        foreach ($this->routes as $key => $route) {
            //echo "Comparando con ruta registrada: " . $key . "<br>";  --> la ruta que registre

            $routePattern = preg_replace('/:\w+/', '([^/]+)', trim($key, '/'));
            if (preg_match('#^' . $routePattern . '$#', trim($uri, '/'), $matches)) {
                
                // EJECUTAR MIDDLEWARE SI EXISTE
                $middleware = $route['middleware'] ?? null;
                if ($middleware && file_exists($middleware)) {
                    require $middleware; // ← Middleware se ejecuta primero
                }
            //echo "Cargando controlador: " . $route['controller'] . "<br>"; carga el controlador 

                // EJECUTAR CONTROLADOR
                require $route['controller'];
                return;
            }
        }
        $this->abort(404);
    }


    
//Manejo de errores
      public function abort($code = 404) {
        http_response_code($code);
        echo "Error $code: Page not found.";
        exit();
    }
}