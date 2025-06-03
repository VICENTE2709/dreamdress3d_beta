<?php
// Mostrar errores para depuración
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Permitir CORS (permisos localhost)
require_once __DIR__ . '/cors.php';
habilitarCORS();

require_once __DIR__ . '/../conexion.php';
$conexion = obtenerConexion(); // ← Retorna un objeto PDO

header("Content-Type: application/json");

$usuario_id = $_GET['usuario_id'] ?? null;

if (!$usuario_id) {
    echo json_encode(['status' => 'error', 'message' => 'Falta usuario_id']);
    exit;
}

try {
    // Obtener ClienteID
    $stmt = $conexion->prepare("SELECT ClienteID FROM cliente WHERE UsuarioID = ?");
    $stmt->execute([$usuario_id]);
    $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$cliente) {
        echo json_encode(['status' => 'error', 'message' => 'Cliente no encontrado']);
        exit;
    }

    $clienteID = $cliente['ClienteID'];

    // Usar la vista para obtener resumen del carrito
    $stmt = $conexion->prepare("SELECT * FROM vista_resumen_carrito_activo WHERE ClienteID = ?");
    $stmt->execute([$clienteID]);
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'productos' => $productos]);

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al obtener el resumen del carrito',
        'error' => $e->getMessage()
    ]);
}
