<?php
// Mostrar errores para depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
session_destroy();
header('http://localhost/DreamDressV1/dreamdressv1/frontend/main_menu/index.html');
exit();

