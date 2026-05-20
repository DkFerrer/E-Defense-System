<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'dbconnection.php';

$bookingId = $_GET['id'] ?? null;
if (!$bookingId) {
    http_response_code(400);
    echo json_encode(['message' => 'Booking ID is required']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid body']);
    exit;
}

$status = $input['status'] ?? 'pending';
$declineReason = $input['decline_reason'] ?? null;

$stmt = $pdo->prepare('UPDATE bookings SET status = ?, decline_reason = ?, updated_at = NOW() WHERE id = ?');
$stmt->execute([$status, $declineReason, $bookingId]);

echo json_encode(['success' => true]);
?>
