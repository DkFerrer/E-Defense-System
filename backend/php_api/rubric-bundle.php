<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'dbconnection.php';

$evaluationId = $_GET['id'] ?? null;
$userId = 1; // Hardcoded to panelist Dr. Maria Santos for mock

if (!$evaluationId) {
    http_response_code(400);
    echo json_encode(['message' => 'Evaluation ID is required']);
    exit;
}

// Get Evaluation
$stmt = $pdo->prepare('SELECT * FROM evaluations WHERE id = ?');
$stmt->execute([$evaluationId]);
$evaluation = $stmt->fetch();

if (!$evaluation) {
    http_response_code(404);
    echo json_encode(['message' => 'Evaluation not found']);
    exit;
}

// Mock rubrics based on the sample data the app expects
$rubrics = [
    [
        'id' => 'rubric-1',
        'name' => 'PROJECT DOCUMENTATION AND MANUSCRIPT',
        'stage' => 'proposal',
        'criteria' => [
            [
                'id' => 'doc-context',
                'name' => 'Project Context',
                'description' => 'Clearly stated and explains clearly the presentation of introduction, background and statement of facts and of the title; its challenges for the editor; and the rationale for the paper.',
                'maxScore' => 10
            ],
            [
                'id' => 'doc-objectives',
                'name' => 'Clarity and Completeness of Ideas and Objectives',
                'description' => 'Clearly articulated ideas with well-defined objectives that demonstrate the development of the project; and aligned with the program.',
                'maxScore' => 15
            ],
            [
                'id' => 'doc-method',
                'name' => 'Methodology and Technical Approach',
                'description' => 'Appropriateness, clarity, and viability of the technical approach, architecture, or design representation.',
                'maxScore' => 25
            ],
            [
                'id' => 'doc-results',
                'name' => 'Results, Analysis, and Output',
                'description' => 'Significance, completeness, and rigor of research results and implementation verification.',
                'maxScore' => 30
            ],
            [
                'id' => 'doc-writing',
                'name' => 'Quality of Technical Writing',
                'description' => 'Adherence to formatting guidelines, clarity, grammar, and structural consistency.',
                'maxScore' => 20
            ]
        ]
    ]
];

// Get Submission
$stmt = $pdo->prepare('SELECT * FROM panelist_rubric_submissions WHERE evaluation_id = ? AND user_id = ?');
$stmt->execute([$evaluationId, $userId]);
$submissionRaw = $stmt->fetch();

$submission = null;
if ($submissionRaw) {
    $submission = [
        'status' => $submissionRaw['status'],
        'scores' => json_decode($submissionRaw['scores'], true),
        'comments' => json_decode($submissionRaw['comments'], true),
        'general_comments' => $submissionRaw['general_comments'],
        'total_score' => $submissionRaw['total_score']
    ];
}

echo json_encode([
    'evaluation' => $evaluation,
    'rubrics' => $rubrics,
    'submission' => $submission
]);
?>
