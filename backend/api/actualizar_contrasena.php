<?php
// Activar errores para desarrollo
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/cors.php'; // Permitir CORS (permisos localhost)
habilitarCORS();

header('Content-Type: application/json');
require_once __DIR__ . '/../conexion.php';
$conn = obtenerConexion();

$data = json_decode(file_get_contents("php://input"), true);
$correo = trim($data['correo']);
$nueva = trim($data['nueva']);

if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/', $nueva)) {
    echo json_encode(['status' => 'error', 'message' => 'La contraseña no cumple con los requisitos de seguridad.']);
    exit;
}

$nueva_hash = password_hash($nueva, PASSWORD_DEFAULT);

try {
    // Actualizar contraseña del usuario
    $stmt = $conn->prepare("UPDATE usuario SET Contrasena = :contrasena WHERE Correo = :correo");
    $stmt->execute(['contrasena' => $nueva_hash, 'correo' => $correo]);

    // Marcar el código como usado
    $stmt = $conn->prepare("UPDATE recuperacion SET usado = 1 WHERE correo = :correo AND usado = 0 ORDER BY creado_fecha DESC LIMIT 1");
    $stmt->execute(['correo' => $correo]);

    echo json_encode(['status' => 'success', 'message' => 'Contraseña actualizada con éxito.']);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error SQL: ' . $e->getMessage()]);
    exit;
}