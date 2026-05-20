<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'dbconnection.php';

$stmt = $pdo->query('SELECT * FROM bookings ORDER BY requested_date DESC');
$bookings = $stmt->fetchAll();

foreach ($bookings as &$b) {
    $b['members'] = json_decode($b['members'], true) ?? [];
    $b['assigned_panelists'] = json_decode($b['assigned_panelists'], true) ?? [];
    $b['id'] = (int) $b['id'];
}

echo json_encode($bookings);
?>
