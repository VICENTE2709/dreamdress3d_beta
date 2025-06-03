<?php
// Mostrar errores para depuración
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Permitir CORS (solo si estás en desarrollo local)
require_once __DIR__ . '/cors.php';
habilitarCORS();

require_once __DIR__ . '/../conexion.php';
$conexion = obtenerConexion();

// Cabecera de respuesta
header('Content-Type: application/json');

// Leer datos JSON
$data = json_decode(file_get_contents("php://input"), true);
$usuario_id = $data['usuario_id'] ?? null;
$token = $data['token'] ?? null;

if (!$usuario_id || !$token) {
    echo json_encode(['status' => 'error', 'message' => 'Faltan datos']);
    exit;
}

try {
    // Verificamos en la vista (asume que solo tiene sesiones activas)
    $stmt = $conexion->prepare("SELECT 1 FROM vista_sesion_valida WHERE UsuarioID = ? AND Token = ?");
    $stmt->execute([$usuario_id, $token]);
    $valido = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($valido) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Sesión inválida']);
    }
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error en servidor',
        'debug' => $e->getMessage()
    ]);
}
