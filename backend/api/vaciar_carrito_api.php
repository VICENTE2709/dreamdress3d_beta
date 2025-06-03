<?php
require_once __DIR__ . '/../conexion.php';
$conexion = obtenerConexion(); // Asegúrate que devuelve objeto PDO

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$usuario_id = $data['usuario_id'] ?? null;

if (!$usuario_id) {
    echo json_encode(['status' => 'error', 'message' => 'Usuario no válido']);
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

    // Obtener carrito activo
    $stmt = $conexion->prepare("SELECT CarritoID FROM carrito WHERE ClienteID = ? AND Estado = 'Activo'");
    $stmt->execute([$clienteID]);
    $carrito = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($carrito) {
        $carritoID = $carrito['CarritoID'];

        // Eliminar los productos del carrito
        $stmt = $conexion->prepare("DELETE FROM carrito_item WHERE CarritoID = ?");
        $stmt->execute([$carritoID]);

        echo json_encode(['status' => 'success', 'message' => 'Carrito vaciado correctamente.']);
    } else {
        echo json_encode(['status' => 'warning', 'message' => 'No se encontró un carrito activo.']);
    }

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error al vaciar el carrito', 'error' => $e->getMessage()]);
}
