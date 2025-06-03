<?php
session_start();

header('Content-Type: application/json');

// Asegúrate de que 'ClienteID' es el nombre correcto de tu variable de sesión para el ID del usuario.
if (isset($_SESSION['ClienteID'])) {
    echo json_encode([
        'autenticado' => true,
        'clienteId' => $_SESSION['ClienteID']
        // Opcionalmente, puedes añadir más datos del usuario aquí si los necesitas en el frontend,
        // por ejemplo, el nombre del usuario para un mensaje de bienvenida.
        // 'nombreUsuario' => isset($_SESSION['NombreUsuario']) ? $_SESSION['NombreUsuario'] : '' 
    ]);
} else {
    echo json_encode([
        'autenticado' => false,
        // Ajusta esta URL para que apunte a tu página de login real.
        'redirectUrl' => '/dreamdressv2/frontend/login/login.html' 
    ]);
}
?>
