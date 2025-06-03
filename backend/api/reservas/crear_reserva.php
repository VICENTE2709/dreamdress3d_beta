<?php
// Activar errores para desarrollo
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/cors.php'; // Permitir CORS
habilitarCORS();

session_start();

header('Content-Type: application/json');

// 1. Incluir el archivo de conexión a la base de datos PDO
require_once __DIR__ . '/../conexion.php';
$conexion = obtenerConexion();

// 2. Verificar si el usuario está autenticado
if (!isset($_SESSION['ClienteID'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Usuario no autenticado. Por favor, inicia sesión.',
        // Ajusta esta URL a tu página de login real
        'redirect' => '/dreamdressv2/frontend/login/login.html'
    ]);
    exit;
}

// 3. Obtener datos del cuerpo de la solicitud (JSON)
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Error: No se recibieron datos o el formato es incorrecto.']);
    exit;
}

// 4. Validar datos recibidos (puedes añadir más validaciones)
$fecha = $input['fecha'] ?? null;
$hora = $input['hora'] ?? null;
$comentarios = $input['comentarios'] ?? ''; // Comentarios son opcionales

if (empty($fecha) || empty($hora)) {
    echo json_encode(['success' => false, 'message' => 'Error: La fecha y la hora son obligatorias.']);
    exit;
}

// Aquí podrías añadir validación del formato de fecha y hora si es necesario.

// 5. Preparar datos para la inserción
$clienteID = $_SESSION['ClienteID'];
$estado = 'Pendiente'; // Estado por defecto para nuevas citas
// Fecha_creacion se puede manejar con CURRENT_TIMESTAMP en la DB o con date('Y-m-d H:i:s') aquí.

// 6. Intentar insertar en la base de datos
try {
    $sql = "INSERT INTO cita (ClienteID, Fecha, Hora, Notas, Estado, Fecha_creacion) 
            VALUES (:clienteID, :fecha, :hora, :notas, :estado, NOW())";
    
    $stmt = $conexion->prepare($sql);
    
    $stmt->bindParam(':clienteID', $clienteID, PDO::PARAM_INT);
    $stmt->bindParam(':fecha', $fecha, PDO::PARAM_STR);
    $stmt->bindParam(':hora', $hora, PDO::PARAM_STR);
    $stmt->bindParam(':notas', $comentarios, PDO::PARAM_STR);
    $stmt->bindParam(':estado', $estado, PDO::PARAM_STR);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Reserva creada exitosamente.']);
    } else {
        // Loguear el error para depuración interna
        error_log('Error al ejecutar la inserción de cita: ' . implode(' - ', $stmt->errorInfo()));
        echo json_encode(['success' => false, 'message' => 'Error al guardar la reserva en la base de datos.']);
    }

} catch (PDOException $e) {
    // Loguear el error para depuración interna
    error_log('PDOException en crear_reserva.php: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error de conexión con la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    // Loguear el error para depuración interna
    error_log('Exception general en crear_reserva.php: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Ocurrió un error inesperado: ' . $e->getMessage()]);
}
finally {
    // Cerrar la conexión si es necesario (depende de tu clase Conexion)
    if (isset($conn)) {
        $conn = null;
    }
}

?>
