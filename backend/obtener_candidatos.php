<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "colegio_votos");

if ($conn->connect_error) {
    echo json_encode(["error" => "Fallo al conectar a la base de datos"]);
    exit;
}

// ✅ Agregar foto en la consulta
$sql = "SELECT id_candidato, candidatos, foto FROM candidatos";
$result = $conn->query($sql);

$candidatos = [];
while ($fila = $result->fetch_assoc()) {
    $candidatos[] = $fila;
}

echo json_encode($candidatos);

$conn->close();
?>
