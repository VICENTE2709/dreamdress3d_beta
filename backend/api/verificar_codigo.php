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
$codigo = trim($data['codigo']);

$stmt = $conn->prepare("SELECT * FROM recuperacion WHERE correo = :correo AND codigo = :codigo AND usado = 0 ORDER BY creado_fecha DESC LIMIT 1");
$stmt->execute(['correo' => $correo, 'codigo' => $codigo]);

if ($stmt->rowCount() === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Código inválido o ya usado.']);
    exit;
}

echo json_encode(['status' => 'success']);