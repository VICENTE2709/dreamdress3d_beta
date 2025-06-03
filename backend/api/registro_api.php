<?php
// Activar errores para desarrollo
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/cors.php'; // Permitir CORS
habilitarCORS();

header("Content-Type: application/json");

require_once __DIR__ . '/../conexion.php';
$conexion = obtenerConexion();

$datos = json_decode(file_get_contents("php://input"), true);

if (!$datos || !is_array($datos)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Error: Datos no recibidos o en formato incorrecto.']);
    exit;
}

// Definición de campos y sus reglas de validación básicas (requerido, email, etc.)
$campos_requeridos = [
    'nombre', 'ap_paterno', 'ap_materno', 'carnet_i', 'fecha_nacimiento', 
    'email', 'telefono', 'ciudad', 'zona', 'calle', 'puerta', 
    'nombre_usuario', 'contrasena'
];

$valores = [];
foreach ($campos_requeridos as $campo) {
    if (!isset($datos[$campo]) || trim($datos[$campo]) === '') {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "Error: El campo '$campo' es requerido y no puede estar vacío."]);
        exit;
    }
    $valores[$campo] = trim($datos[$campo]);
}

// Asignar valores trimeados a variables para facilitar el acceso
$nombre = $valores['nombre'];
$ap_paterno = $valores['ap_paterno'];
$ap_materno = $valores['ap_materno'];
$ci = $valores['carnet_i']; // El frontend envía carnet_i
$fecha_nacimiento = $valores['fecha_nacimiento'];
$email = $valores['email'];
$telefono = $valores['telefono'];
$ciudad = strtoupper($valores['ciudad']); // Convertir a mayúsculas para consistencia
$zona = $valores['zona'];
$calle = $valores['calle'];
$nro_puerta = $valores['puerta'];
$nombre_usuario = $valores['nombre_usuario'];
$contrasena = $valores['contrasena']; // La contraseña no se trimea aquí, se valida con su longitud original

// Función para detectar secuencias inválidas (revisar regex si es muy restrictiva)
function tienePatronesInvalidos($cadena) {
    // Ejemplo: más de 3 vocales seguidas o más de 4 consonantes seguidas
    return preg_match('/[aeiou]{4,}/i', $cadena) || preg_match('/[^aeiou\s\dBCDFGHJKLMNPQRSTVWXYZ]{4,}/i', $cadena);
}

// --- INICIO DE VALIDACIONES ESPECÍFICAS ---
try {
    // Validar nombre y apellidos
    foreach (['nombre' => $nombre, 'apellido paterno' => $ap_paterno, 'apellido materno' => $ap_materno] as $key => $val) {
        if (strlen($val) < 2 || strlen($val) > 50) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => "El $key debe tener entre 2 y 50 caracteres."]);
            exit;
        }
        if (tienePatronesInvalidos($val)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => "El $key ('$val') contiene secuencias de caracteres no permitidas."]);
            exit;
        }
    }

    // Validar CI (formato y duplicado)
    if (!preg_match('/^[0-9]{5,10}[A-Za-z0-9-]*$/', $ci)) { // Ajustar regex según formato de CI
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Formato de CI inválido.']);
        exit;
    }
    $stmt_ci = $conexion->prepare("SELECT 1 FROM usuario WHERE CI = :ci");
    $stmt_ci->execute([':ci' => $ci]);
    if ($stmt_ci->rowCount() > 0) {
        http_response_code(409); // Conflict
        echo json_encode(['status' => 'error', 'message' => 'El CI ya está registrado.']);
        exit;
    }

    // Validar fecha de nacimiento
    $fecha_nac_obj = DateTime::createFromFormat('Y-m-d', $fecha_nacimiento);
    $hoy = new DateTime();
    $edad_minima = 16; // Ejemplo de edad mínima
    $edad_maxima = 90;
    if (!$fecha_nac_obj || $fecha_nac_obj->format('Y-m-d') !== $fecha_nacimiento || $fecha_nac_obj >= $hoy) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Fecha de nacimiento inválida o futura.']);
        exit;
    }
    $edad = $fecha_nac_obj->diff($hoy)->y;
    if ($edad < $edad_minima || $edad > $edad_maxima) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "La edad debe estar entre $edad_minima y $edad_maxima años."]);
        exit;
    }

    // Validar correo electrónico (formato y duplicado)
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'El correo electrónico no es válido.']);
        exit;
    }
    $stmt_email = $conexion->prepare("SELECT 1 FROM usuario WHERE Correo = :email");
    $stmt_email->execute([':email' => $email]);
    if ($stmt_email->rowCount() > 0) {
        http_response_code(409); // Conflict
        echo json_encode(['status' => 'error', 'message' => 'El correo electrónico ya está registrado.']);
        exit;
    }

    // Validar teléfono (formato de Bolivia)
    if (!preg_match('/^[67][0-9]{7}$/', $telefono)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'El teléfono debe tener 8 dígitos y comenzar con 6 o 7 (Bolivia).']);
        exit;
    }
    
    // Validar Ciudad
    $ciudades_validas = ['LA PAZ', 'EL ALTO', 'COCHABAMBA', 'SANTA CRUZ', 'TARIJA', 'BENI', 'PANDO', 'ORURO', 'POTOSI', 'CHUQUISACA'];
    if (!in_array($ciudad, $ciudades_validas)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Ciudad inválida. Selecciona una ciudad válida de Bolivia.']);
        exit;
    }

    // Validar Zona, Calle (longitud y patrones)
    foreach (['zona' => $zona, 'calle' => $calle] as $key => $val) {
        if (strlen($val) < 3 || strlen($val) > 100) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => "La $key debe tener entre 3 y 100 caracteres."]);
            exit;
        }
        if (tienePatronesInvalidos($val)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => "La $key ('$val') contiene secuencias de caracteres no permitidas."]);
            exit;
        }
    }

    // Validar número de puerta
    if (!preg_match('/^[A-Za-z0-9\s-]{1,10}$/', $nro_puerta)) { // Más flexible para nro puerta
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'El número de puerta/lote debe tener entre 1 y 10 caracteres alfanuméricos.']);
        exit;
    }

    // Validar nombre de usuario (longitud, caracteres permitidos y duplicado)
    if (!preg_match('/^[a-zA-Z0-9_]{5,15}$/', $nombre_usuario)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'El nombre de usuario debe tener entre 5 y 15 caracteres, y solo puede contener letras, números y guiones bajos (_).']);
        exit;
    }
    $stmt_usuario = $conexion->prepare("SELECT 1 FROM usuario WHERE NombreUsuario = :usuario");
    $stmt_usuario->execute([':usuario' => $nombre_usuario]);
    if ($stmt_usuario->rowCount() > 0) {
        http_response_code(409); // Conflict
        echo json_encode(['status' => 'error', 'message' => 'El nombre de usuario ya está en uso.']);
        exit;
    }

    // Validar contraseña (complejidad)
    // Al menos 8 caracteres, una mayúscula, una minúscula, un número. Frontend valida 5, backend más estricto.
    if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/', $contrasena)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y puede contener @$!%*?&.']);
        exit;
    }

    // --- FIN DE VALIDACIONES --- 

    $conexion->beginTransaction();

    $contrasena_segura = password_hash($contrasena, PASSWORD_DEFAULT);

    $stmt_insert_usuario = $conexion->prepare("
        INSERT INTO usuario 
        (Nombre, Ap_paterno, Ap_materno, CI, Fecha_nacimiento, Correo, Telefono, 
         NombreUsuario, Contrasena, Ciudad, Zona, Calle, Nro_puerta, Habilitado, RolID)
        VALUES 
        (:nombre, :ap_paterno, :ap_materno, :ci, :fecha_nacimiento, :correo, :telefono, 
         :nombre_usuario, :contrasena, :ciudad, :zona, :calle, :nro_puerta, 1, 5) /* RolID 5 para Cliente por defecto */
    ");

    $stmt_insert_usuario->execute([
        ':nombre' => $nombre,
        ':ap_paterno' => $ap_paterno,
        ':ap_materno' => $ap_materno,
        ':ci' => $ci,
        ':fecha_nacimiento' => $fecha_nacimiento,
        ':correo' => $email,
        ':telefono' => $telefono,
        ':nombre_usuario' => $nombre_usuario,
        ':contrasena' => $contrasena_segura,
        ':ciudad' => $ciudad,
        ':zona' => $zona,
        ':calle' => $calle,
        ':nro_puerta' => $nro_puerta
    ]);

    $usuario_id = $conexion->lastInsertId();
    if (!$usuario_id) {
        throw new PDOException("No se pudo obtener el ID del usuario insertado.");
    }

    $stmt_insert_cliente = $conexion->prepare("INSERT INTO cliente (UsuarioID) VALUES (:usuario_id)");
    $stmt_insert_cliente->execute([':usuario_id' => $usuario_id]);
    
    $cliente_id = $conexion->lastInsertId();
    if (!$cliente_id) {
        throw new PDOException("No se pudo obtener el ID del cliente insertado.");
    }

    $stmt_insert_carrito = $conexion->prepare("INSERT INTO carrito (ClienteID, Estado, Fecha_creacion) VALUES (:cliente_id, 'Activo', NOW())");
    $stmt_insert_carrito->execute([':cliente_id' => $cliente_id]);

    $conexion->commit();

    http_response_code(201); // Created
    echo json_encode(['status' => 'success', 'message' => 'Usuario registrado exitosamente.']);

} catch (PDOException $e) {
    if ($conexion->inTransaction()) {
        $conexion->rollBack();
    }
    http_response_code(500); // Internal Server Error
    error_log('PDOException en registro_api.php: ' . $e->getMessage() . " en la línea " . $e->getLine() . " con datos: " . json_encode($datos));
    echo json_encode([
        'status' => 'error',
        'message' => 'Error del servidor al registrar el usuario. Por favor, inténtalo de nuevo más tarde.'
        // 'debug' => $e->getMessage() // Quitar en producción
    ]);
} catch (Exception $e) { // Capturar otras excepciones generales
    if ($conexion->inTransaction()) {
        $conexion->rollBack();
    }
    http_response_code(500);
    error_log('Exception en registro_api.php: ' . $e->getMessage() . " en la línea " . $e->getLine() . " con datos: " . json_encode($datos));
    echo json_encode([
        'status' => 'error',
        'message' => 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.'
    ]);
}
