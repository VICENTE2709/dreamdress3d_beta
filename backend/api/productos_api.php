<?php
// Mostrar errores para depuración
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Permitir CORS (permisos localhost)
require_once __DIR__ . '/cors.php';
habilitarCORS();

header('Content-Type: application/json');
require_once '../conexion.php';
$conn = obtenerConexion();

// Verificar si hay filtro de categoría (opcional)
$categoria = isset($_GET['categoria']) ? $_GET['categoria'] : null;

try {
    if ($categoria) {
        $stmt = $conn->prepare("SELECT ProductoID, Nombre, Descripcion, Precio FROM producto WHERE Categoria = :categoria");
        $stmt->execute(['categoria' => $categoria]);
    } else {
        $stmt = $conn->query("SELECT ProductoID, Nombre, Descripcion, Precio FROM producto");
    }

    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($productos);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error al obtener productos.']);
}
