<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'dbconnection.php';

$evaluationId = $_GET['id'] ?? null;
$userId = 1; // Hardcoded to panelist Dr. Maria Santos

if (!$evaluationId) {
    http_response_code(400);
    echo json_encode(['message' => 'Evaluation ID is required']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid body']);
    exit;
}

$status = $input['status'] ?? 'draft';
$scores = json_encode($input['scores'] ?? []);
$comments = json_encode($input['comments'] ?? []);
$generalComments = $input['general_comments'] ?? '';
$totalScore = $input['total_score'] ?? null;
$submittedAt = $status === 'submitted' ? date('Y-m-d H:i:s') : null;

// Check if exists
$stmt = $pdo->prepare('SELECT id FROM panelist_rubric_submissions WHERE evaluation_id = ? AND user_id = ?');
$stmt->execute([$evaluationId, $userId]);
$existing = $stmt->fetch();

if ($existing) {
    $stmt = $pdo->prepare('
        UPDATE panelist_rubric_submissions 
        SET status = ?, scores = ?, comments = ?, general_comments = ?, total_score = ?, submitted_at = ?, updated_at = NOW()
        WHERE evaluation_id = ? AND user_id = ?
    ');
    $stmt->execute([$status, $scores, $comments, $generalComments, $totalScore, $submittedAt, $evaluationId, $userId]);
} else {
    $stmt = $pdo->prepare('
        INSERT INTO panelist_rubric_submissions (evaluation_id, user_id, status, scores, comments, general_comments, total_score, submitted_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ');
    $stmt->execute([$evaluationId, $userId, $status, $scores, $comments, $generalComments, $totalScore, $submittedAt]);
}

if ($status === 'submitted') {
    // Update evaluation status to completed
    $stmt = $pdo->prepare("UPDATE evaluations SET status = 'completed' WHERE id = ?");
    $stmt->execute([$evaluationId]);
}

echo json_encode(['success' => true]);
?>
