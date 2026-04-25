<?php
namespace Core;

use PDO;

class Database {
    private $connection;

    public function __construct($config) {
        // Extraer la configuración específica
        $dbConfig = $config['db']['conexion_Mundiales'];
        
        // Crear el DSN correctamente - CORREGIDO
        $dsn = "mysql:host={$dbConfig['host']};dbname={$dbConfig['dbname']};charset={$dbConfig['charset']}";
        
        // Usar $dsn en lugar de $connectionString
        $this->connection = new PDO($dsn, $dbConfig['username'], $dbConfig['password']);
        $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    
    public function query($sql, $params = []) {
        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    
}