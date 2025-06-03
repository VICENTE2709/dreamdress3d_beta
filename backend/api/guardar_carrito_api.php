<?php
// Mostrar errores para depuración
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Permitir CORS (permisos localhost)
require_once __DIR__ . '/cors.php';
habilitarCORS();

require_once __DIR__ . '/../conexion.php';
$conexion = obtenerConexion(); // <-- Asegúrate que esta función retorna un objeto PDO

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$usuario_id = $data['usuario_id'] ?? null;
$productos = $data['productos'] ?? [];

if (!$usuario_id || empty($productos)) {
    echo json_encode(['status' => 'error', 'message' => 'Datos incompletos']);
    exit;
}

try {
    // Obtener ClienteID desde UsuarioID
    $stmt = $conexion->prepare("SELECT ClienteID FROM cliente WHERE UsuarioID = ?");
    $stmt->execute([$usuario_id]);
    $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$cliente) {
        echo json_encode(['status' => 'error', 'message' => 'Cliente no encontrado']);
        exit;
    }

    $clienteID = $cliente['ClienteID'];

    // Buscar carrito ACTIVO del cliente
    $stmt = $conexion->prepare("SELECT CarritoID FROM carrito WHERE ClienteID = ? AND Estado = 'Activo' LIMIT 1");
    $stmt->execute([$clienteID]);
    $carrito = $stmt->fetch(PDO::FETCH_ASSOC);

    // 🔧 CAMBIO: ya no se crea carrito nuevo aquí
    if (!$carrito) {
        echo json_encode(['status' => 'error', 'message' => 'No se encontró el carrito del cliente']);
        exit;
    }

    $carritoID = $carrito['CarritoID'];

    if (!isset($carritoID) || !$carritoID) {
    echo json_encode(['status' => 'error', 'message' => 'CarritoID inválido']);
    exit;
    }

    // Insertar o actualizar productos en el carrito
    foreach ($productos as $prod) {
    $productoID = $prod['ProductoID'] ?? null;
    $cantidad = $prod['Cantidad'] ?? 1;

    if (!$productoID) continue;

    // Buscar CatalogoID usando ProductoID
    $stmt = $conexion->prepare("SELECT CatalogoID FROM catalogo WHERE ProductoID = ?");
    $stmt->execute([$productoID]);
    $catalogo = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$catalogo) continue;

    $catalogoID = $catalogo['CatalogoID'];

    // Insertar o actualizar en carrito_item
    $stmt = $conexion->prepare("SELECT ItemID FROM carrito_item WHERE CarritoID = ? AND CatalogoID = ?");
    $stmt->execute([$carritoID, $catalogoID]);
    $existe = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existe) {
        $stmt = $conexion->prepare("UPDATE carrito_item SET Cantidad = ? WHERE ItemID = ?");
        $stmt->execute([$cantidad, $existe['ItemID']]);
    } else {
        $stmt = $conexion->prepare("INSERT INTO carrito_item (CarritoID, CatalogoID, Cantidad) VALUES (?, ?, ?)");
        $stmt->execute([$carritoID, $catalogoID, $cantidad]);
    }
}

    echo json_encode(['status' => 'success', 'carrito_id' => $carritoID]);

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al guardar el carrito',
        'debug' => $e->getMessage()
    ]);
}


