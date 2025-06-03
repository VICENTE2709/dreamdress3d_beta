<?php
// Mostrar errores para depuración
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Permitir CORS (permisos localhost)
require_once __DIR__ . '/cors.php';
habilitarCORS();

require_once __DIR__ . '/../conexion.php';
$conexion = obtenerConexion();

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$usuario_id = $data['usuario_id'] ?? null;
$carrito_id = $data['carrito_id'] ?? null;
$metodo_pago_id = $data['metodo_pago_id'] ?? null;
$tipo_pago_id = $data['tipo_pago_id'] ?? null;
$monto = $data['monto'] ?? null;

if (!$usuario_id || !$carrito_id || !$metodo_pago_id || !$tipo_pago_id || !$monto) {
  echo json_encode(['status' => 'error', 'message' => 'Datos incompletos']);
  exit;
}

try {
  // 1. Obtener ClienteID
  $stmt = $conexion->prepare("SELECT ClienteID FROM cliente WHERE UsuarioID = ?");
  $stmt->execute([$usuario_id]);
  $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$cliente) {
    echo json_encode(['status' => 'error', 'message' => 'Cliente no encontrado']);
    exit;
  }
  $cliente_id = $cliente['ClienteID'];

  // 2. Crear nuevo pedido (para cada confirmación de compra)
  $stmt = $conexion->prepare("INSERT INTO pedido (ClienteID, CarritoID, FechaPedido) VALUES (?, ?, NOW())");
  $stmt->execute([$cliente_id, $carrito_id]);
  $pedido_id = $conexion->lastInsertId();

  // 3. Registrar el pago
  $stmt = $conexion->prepare("INSERT INTO pago (PedidoID, MetodoPagoID, TipoPagoID, Monto, FechaPago) VALUES (?, ?, ?, ?, NOW())");
  $stmt->execute([$pedido_id, $metodo_pago_id, $tipo_pago_id, $monto]);
  $pago_id = $conexion->lastInsertId();

  // 4. Crear recibo del pago
  $stmt = $conexion->prepare("INSERT INTO recibo (PagoID, FechaEmision) VALUES (?, NOW())");
  $stmt->execute([$pago_id]);

  // 5. Obtener total del carrito
  $stmt = $conexion->prepare(
    "SELECT SUM(p.Precio * ci.Cantidad) AS total
     FROM carrito_item ci
     JOIN catalogo c ON ci.CatalogoID = c.CatalogoID
     JOIN producto p ON c.ProductoID = p.ProductoID
     WHERE ci.CarritoID = ?"
  );
  $stmt->execute([$carrito_id]);
  $total = $stmt->fetchColumn();

  // 6. Verificar si se cubrió el total y generar factura si corresponde
  $stmt = $conexion->prepare("SELECT SUM(Monto) FROM pago WHERE PedidoID = ?");
  $stmt->execute([$pedido_id]);
  $abonado = $stmt->fetchColumn();

  if ($abonado >= $total) {
    $stmt = $conexion->prepare("INSERT INTO factura (PedidoID, FechaEmision, MontoTotal) VALUES (?, NOW(), ?)");
    $stmt->execute([$pedido_id, $total]);
  }

  echo json_encode(['status' => 'success', 'pedido_id' => $pedido_id]);

} catch (PDOException $e) {
  echo json_encode([
    'status' => 'error',
    'message' => 'Error al procesar el pago',
    'debug' => $e->getMessage()
  ]);
}
