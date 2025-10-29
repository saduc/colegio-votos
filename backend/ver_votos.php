<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "colegio_votos");

if ($conn->connect_error) {
    echo json_encode(["error" => "Fallo al conectar a la base de datos"]);
    exit;
}

// 📊 Votos agrupados por grado y candidato (ordenados correctamente)
$sql = "SELECT e.grado, c.candidatos, COUNT(v.id) as total_votos
        FROM votos v
        JOIN estudiantes e ON e.dni = v.dni_estudiante
        JOIN candidatos c ON c.id_candidato = v.id_candidato
        GROUP BY e.grado, c.candidatos
        ORDER BY FIELD(e.grado, 'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto'), total_votos DESC";

$result = $conn->query($sql);

$resultados = [];
while ($fila = $result->fetch_assoc()) {
    $resultados[] = $fila;
}

// 🔢 Total general de votos
$sqlTotal = "SELECT COUNT(*) as total_general FROM votos";
$resTotal = $conn->query($sqlTotal);
$totalGeneral = $resTotal->fetch_assoc()["total_general"] ?? 0;

echo json_encode([
    "resultados" => $resultados,
    "total_general" => $totalGeneral
]);

$conn->close();
?>

