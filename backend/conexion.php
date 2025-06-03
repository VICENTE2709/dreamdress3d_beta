<?php

function obtenerConexion() {
    $host = 'localhost';
    $dbname = 'dreamdressv52';
    $user = 'Josue';   // Tu usuario personalizado
    $pass = '';

    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch (PDOException $e) {
        die('Error de conexión: ' . $e->getMessage());
    }
}
?>


