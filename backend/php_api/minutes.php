<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'dbconnection.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $booking_id = $_GET['booking_id'] ?? null;
    if ($booking_id) {
        $stmt = $pdo->prepare('SELECT * FROM defense_minutes WHERE booking_id = ?');
        $stmt->execute([$booking_id]);
        $minutes = $stmt->fetch();
        
        if ($minutes) {
            echo json_encode($minutes);
        } else {
            echo json_encode(null);
        }
    } else {
        $stmt = $pdo->query('SELECT booking_id, status FROM defense_minutes');
        $all = $stmt->fetchAll();
        echo json_encode($all);
    }
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $booking_id = $input['booking_id'] ?? null;
    $stage = $input['stage'] ?? '';
    $date_time = $input['date_time'] ?? '';
    $title = $input['title'] ?? '';
    $researchers = $input['researchers'] ?? '';
    $adviser = $input['adviser'] ?? '';
    $secretary_name = $input['secretary_name'] ?? '';
    $suggestions = $input['suggestions'] ?? '';
    $compliance = $input['compliance'] ?? null;
    $status = $input['status'] ?? 'draft';
    
    if (!$booking_id || !$title) {
        http_response_code(400);
        echo json_encode(['message' => 'booking_id and title are required']);
        exit;
    }
    
    // Check if minutes already exist for this booking
    $stmt = $pdo->prepare('SELECT id FROM defense_minutes WHERE booking_id = ?');
    $stmt->execute([$booking_id]);
    $existing = $stmt->fetch();
    
    if ($existing) {
        // Update
        $stmt = $pdo->prepare('UPDATE defense_minutes SET stage = ?, date_time = ?, title = ?, researchers = ?, adviser = ?, secretary_name = ?, suggestions = ?, compliance = ?, status = ?, updated_at = NOW() WHERE booking_id = ?');
        $stmt->execute([$stage, $date_time, $title, $researchers, $adviser, $secretary_name, $suggestions, $compliance, $status, $booking_id]);
        echo json_encode(['message' => 'Minutes updated successfully', 'success' => true]);
    } else {
        // Insert
        $stmt = $pdo->prepare('INSERT INTO defense_minutes (booking_id, stage, date_time, title, researchers, adviser, secretary_name, suggestions, compliance, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())');
        $stmt->execute([$booking_id, $stage, $date_time, $title, $researchers, $adviser, $secretary_name, $suggestions, $compliance, $status]);
        echo json_encode(['message' => 'Minutes saved successfully', 'success' => true]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['message' => 'Method not allowed']);
?>
