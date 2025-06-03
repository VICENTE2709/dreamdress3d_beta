<?php
// Mostrar errores (desactiva en producción)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Permitir CORS
require_once __DIR__ . '/cors.php';
habilitarCORS();

// Conexión
require_once __DIR__ . '/../conexion.php';
$conexion = obtenerConexion();

header("Content-Type: application/json");

// Validar entrada
$usuario_id = $_GET['usuario_id'] ?? null;
if (!$usuario_id) {
    echo json_encode(['status' => 'error', 'message' => 'Falta el usuario_id']);
    exit;
}

try {
    // Obtener datos del cliente y usuario
    $stmt = $conexion->prepare("
        SELECT 
            u.Nombre,
            u.Ap_paterno,
            u.Ap_materno,
            u.CI,
            u.Correo,
            u.Telefono,
            u.Ciudad,
            u.Zona,
            u.Calle,
            u.Nro_puerta
        FROM usuario u
        INNER JOIN cliente c ON c.UsuarioID = u.UsuarioID
        WHERE u.UsuarioID = ?
        LIMIT 1
    ");
    $stmt->execute([$usuario_id]);
    $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$cliente) {
        echo json_encode(['status' => 'error', 'message' => 'Cliente no encontrado']);
        exit;
    }

    echo json_encode(['status' => 'success', 'cliente' => $cliente]);

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error en servidor',
        'debug' => $e->getMessage()
    ]);
}
