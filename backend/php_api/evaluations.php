<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'dbconnection.php';

$stmt = $pdo->query('SELECT * FROM evaluations ORDER BY due_date DESC');
$evaluations = $stmt->fetchAll();

foreach ($evaluations as &$e) {
    $e['authors'] = json_decode($e['authors'], true) ?? [];
    $e['id'] = (int) $e['id'];
}

echo json_encode($evaluations);
?>
