<?php
// enviar_codigo_recuperacion.php (con PHPMailer)

// Mostrar errores para depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/cors.php';
habilitarCORS();

header('Content-Type: application/json');
require_once __DIR__ . '/../conexion.php';
$conn = obtenerConexion();

require __DIR__ . '/../../vendor/autoload.php';

$data = json_decode(file_get_contents("php://input"), true);
$correo = trim($data['correo']);

// Verificar si el correo existe en la base de datos
$stmt = $conn->prepare("SELECT 1 FROM usuario WHERE Correo = :correo");
$stmt->execute(['correo' => $correo]);
if ($stmt->rowCount() === 0) {
    echo json_encode(['status' => 'error', 'message' => 'El correo no está registrado.']);
    exit;
}

// Generar código aleatorio
$codigo = strval(rand(100000, 999999));

// Guardar en la tabla de recuperacion
$stmt = $conn->prepare("INSERT INTO recuperacion (correo, codigo) VALUES (:correo, :codigo)");
$stmt->execute(['correo' => $correo, 'codigo' => $codigo]);

// Enviar correo con PHPMailer
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'proometeous.banvinhard@gmail.com'; // Correo empresarial
    $mail->Password = 'qbbd ojfz rfns ynmz'; // Contraseña de aplicación
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

    $mail->setFrom('dreamdress3d.oficial@gmail.com', 'DreamDress 3D');
    $mail->addAddress($correo);
    $mail->isHTML(true);
    $mail->Subject = 'Código de recuperación de contraseña';
    $mail->Body = "<h3>Recuperación de Contraseña</h3>
                   <p>Tu código de recuperación es:</p>
                   <h2 style='color: #303F9F;'>$codigo</h2>
                   <p>No compartas este código con nadie.</p>";

    $mail->send();
    echo json_encode(['status' => 'success', 'message' => 'Código enviado correctamente.']);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'No se pudo enviar el correo.',
        'error' => $mail->ErrorInfo  //  Agrega esto si no lo tienes
    ]);
}

