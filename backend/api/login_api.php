<?php
// Mostrar errores para depuración
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Permitir CORS (permisos localhost)
require_once __DIR__ . '/cors.php';
habilitarCORS();

// Cabecera JSON
header("Content-Type: application/json");

// Incluir conexión PDO
require_once __DIR__ . '/../conexion.php';
$conexion = obtenerConexion();

// Leer datos JSON enviados
$input = json_decode(file_get_contents("php://input"), true);

// Validar y sanitizar (ejemplo básico) entrada
$usuarioEntrada = isset($input['usuario']) ? trim($input['usuario']) : null;
$contrasenaEntrada = $input['contrasena'] ?? null; // La contraseña no se trimea para permitir espacios si así se guardó

if (empty($usuarioEntrada) || empty($contrasenaEntrada)) {
    http_response_code(400); // Bad Request
    echo json_encode([
        'status' => 'error',
        'message' => 'Faltan datos: usuario o contraseña.'
    ]);
    exit;
}

try {
    // Buscar usuario
    $stmt = $conexion->prepare("SELECT u.UsuarioID, u.NombreUsuario, u.Contrasena, u.RolID, u.Habilitado
                                FROM usuario u
                                WHERE u.NombreUsuario = :nombreUsuario"); // Usar placeholders nombrados
    $stmt->bindParam(':nombreUsuario', $usuarioEntrada, PDO::PARAM_STR);
    $stmt->execute();
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        http_response_code(401); // Unauthorized
        echo json_encode([
            'status' => 'error',
            'message' => 'Usuario no encontrado.'
        ]);
        exit;
    }

    if (!$usuario['Habilitado']) {
        http_response_code(403); // Forbidden (o 401 si prefieres)
        echo json_encode([
            'status' => 'error',
            'message' => 'Usuario deshabilitado. Contacta al administrador.'
        ]);
        exit;
    }

    // Verificar contraseña
    if (!password_verify($contrasenaEntrada, $usuario['Contrasena'])) {
        http_response_code(401); // Unauthorized
        echo json_encode([
            'status' => 'error',
            'message' => 'Contraseña incorrecta.'
        ]);
        exit;
    }

    // ✅ Generar token y registrar sesión (token más largo)
    $token = bin2hex(random_bytes(32)); // Token más largo
    $ip = $_SERVER['REMOTE_ADDR'];

    // Considera invalidar tokens antiguos para el mismo usuario/IP si es necesario

    $stmt = $conexion->prepare("INSERT INTO sesion_usuario (UsuarioID, Token, IP_acceso, Activa, FechaCreacion) 
                                VALUES (:usuarioID, :token, :ip, 1, NOW())"); // Añadir FechaCreacion
    $stmt->bindParam(':usuarioID', $usuario['UsuarioID'], PDO::PARAM_INT);
    $stmt->bindParam(':token', $token, PDO::PARAM_STR);
    $stmt->bindParam(':ip', $ip, PDO::PARAM_STR);
    $stmt->execute();

    // ✅ Devolver éxito y token
    http_response_code(200); // OK
    echo json_encode([
        'status' => 'success',
        'usuario' => [
            'usuario_id' => $usuario['UsuarioID'],
            'nombre_usuario' => $usuario['NombreUsuario'],
            'rol_id' => $usuario['RolID'],
            'token' => $token
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    // Loggear el error real en el servidor para depuración, no exponerlo directamente al cliente en producción
    error_log('PDOException en login_api.php: ' . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'Error en el servidor. Inténtalo de nuevo más tarde.' // Mensaje genérico para el cliente
    ]);
} catch (Exception $e) { // Capturar otras excepciones generales
    http_response_code(500);
    error_log('Exception en login_api.php: ' . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'Ocurrió un error inesperado. Inténtalo de nuevo más tarde.'
    ]);
}
