<?php
// ===== Configuración CORS =====
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ===== Conexión =====
$conn = new mysqli("localhost", "root", "", "colegio_votos");
if ($conn->connect_error) {
    echo json_encode(["error" => "❌ Fallo al conectar a la base de datos"]);
    exit;
}

// ===== Leer datos =====
$data = json_decode(file_get_contents("php://input"), true);
$dni = $data["dni"] ?? "";
$id_candidato = $data["id_candidato"] ?? "";

if (empty($dni) || empty($id_candidato)) {
    echo json_encode(["error" => "❌ Datos incompletos"]);
    exit;
}

// ===== Verificar si ya votó =====
$check = $conn->prepare("SELECT 1 FROM votos WHERE dni_estudiante = ?");
$check->bind_param("s", $dni);
$check->execute();
$res = $check->get_result();

if ($res->num_rows > 0) {
    echo json_encode(["error" => "⚠️ Este estudiante ya votó y no puede votar otra vez"]);
    exit;
}

// ===== Obtener nombre del candidato =====
$stmtCand = $conn->prepare("SELECT candidatos FROM candidatos WHERE id_candidato = ?");
$stmtCand->bind_param("i", $id_candidato);
$stmtCand->execute();
$resCand = $stmtCand->get_result();

if ($resCand->num_rows == 0) {
    echo json_encode(["error" => "❌ Candidato no encontrado"]);
    exit;
}
$rowCand = $resCand->fetch_assoc();
$nombreCandidato = $rowCand["candidatos"];

// ===== Insertar voto =====
$stmt = $conn->prepare("
    INSERT INTO votos (dni_estudiante, id_candidato, candidatos, ya_voto)
    VALUES (?, ?, ?, 1)
");
$stmt->bind_param("sis", $dni, $id_candidato, $nombreCandidato);

if ($stmt->execute()) {
    echo json_encode(["success" => "✅ Voto registrado correctamente"]);
} else {
    echo json_encode([
        "error" => "❌ No se pudo registrar el voto",
        "detalle" => $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>
