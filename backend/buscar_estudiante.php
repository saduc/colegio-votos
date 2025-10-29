<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "colegio_votos");

if ($conn->connect_error) {
    echo json_encode(["error" => "Fallo al conectar a la base de datos"]);
    exit;
}

$dni = $_GET['dni'] ?? '';

$sql = "SELECT dni, nombres, grado, seccion 
        FROM estudiantes 
        WHERE dni = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $dni);
$stmt->execute();
$result = $stmt->get_result();

if ($fila = $result->fetch_assoc()) {
    echo json_encode($fila);
} else {
    echo json_encode(["error" => "Estudiante no encontrado"]);
}

$stmt->close();
$conn->close();
?>
