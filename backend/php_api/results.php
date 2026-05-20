<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'dbconnection.php';

$userId = 1; // Panelist Dr. Maria Santos

$stmt = $pdo->prepare('
    SELECT e.*, prs.status as submission_status, prs.scores, prs.comments, prs.general_comments, prs.total_score, prs.submitted_at 
    FROM evaluations e
    JOIN panelist_rubric_submissions prs ON e.id = prs.evaluation_id
    WHERE prs.user_id = ? AND prs.status = "submitted"
    ORDER BY e.due_date DESC
');
$stmt->execute([$userId]);
$resultsRaw = $stmt->fetchAll();

$results = [];
foreach ($resultsRaw as $row) {
    $results[] = [
        'id' => 'eval-' . $row['id'],
        'target' => $row['target'],
        'authors' => json_decode($row['authors'], true) ?? [],
        'type' => $row['type'],
        'defense_stage' => $row['defense_stage'],
        'result_date' => date('Y-m-d', strtotime($row['submitted_at'] ?? 'now')),
        'status' => 'completed',
        'panelist_submissions' => [
            [
                'total_score' => $row['total_score'],
                'scores' => json_decode($row['scores'], true),
                'comments' => json_decode($row['comments'], true),
                'general_comments' => $row['general_comments'],
                'status' => $row['submission_status']
            ]
        ]
    ];
}

echo json_encode($results);
?>
