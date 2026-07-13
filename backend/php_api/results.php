<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'dbconnection.php';

$stmt = $pdo->query('
    SELECT e.*, prs.id as submission_id, prs.status as submission_status, prs.scores, prs.comments, prs.general_comments, prs.total_score, prs.submitted_at 
    FROM evaluations e
    LEFT JOIN panelist_rubric_submissions prs ON e.id = prs.evaluation_id AND prs.status = "submitted"
    ORDER BY e.due_date DESC
');
$resultsRaw = $stmt->fetchAll();

$evaluationsMap = [];
foreach ($resultsRaw as $row) {
    $evalId = $row['id'];
    if (!isset($evaluationsMap[$evalId])) {
        // Fetch defense minutes for this evaluation's booking
        $minutes = null;
        if ($row['booking_id']) {
            $minStmt = $pdo->prepare('SELECT * FROM defense_minutes WHERE booking_id = ?');
            $minStmt->execute([$row['booking_id']]);
            $minRow = $minStmt->fetch();
            if ($minRow) {
                $minutes = [
                    'id' => (int) $minRow['id'],
                    'booking_id' => (int) $minRow['booking_id'],
                    'stage' => $minRow['stage'],
                    'date_time' => $minRow['date_time'],
                    'title' => $minRow['title'],
                    'researchers' => $minRow['researchers'],
                    'adviser' => $minRow['adviser'],
                    'secretary_name' => $minRow['secretary_name'],
                    'suggestions' => $minRow['suggestions'],
                    'compliance' => $minRow['compliance'],
                    'status' => $minRow['status'],
                    'created_at' => $minRow['created_at'],
                    'updated_at' => $minRow['updated_at']
                ];
            }
        }

        $evaluationsMap[$evalId] = [
            'id' => (int) $row['id'],
            'booking_id' => $row['booking_id'] ? (int) $row['booking_id'] : null,
            'target' => $row['target'],
            'type' => $row['type'],
            'defense_stage' => $row['defense_stage'],
            'authors' => json_decode($row['authors'], true) ?? [],
            'department' => $row['department'],
            'max_score' => (int) $row['max_score'],
            'result_date' => date('Y-m-d', strtotime($row['result_date'] ?? $row['created_at'] ?? 'now')),
            'status' => $row['status'],
            'created_at' => $row['created_at'],
            'panelist_submissions' => [],
            'defense_minutes' => $minutes
        ];
    }

    if ($row['submission_id']) {
        $evaluationsMap[$evalId]['panelist_submissions'][] = [
            'total_score' => $row['total_score'],
            'scores' => json_decode($row['scores'], true),
            'comments' => json_decode($row['comments'], true),
            'general_comments' => $row['general_comments'],
            'status' => $row['submission_status']
        ];
    }
}

$results = array_values($evaluationsMap);

echo json_encode($results);
?>
