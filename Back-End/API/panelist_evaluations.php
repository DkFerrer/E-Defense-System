<?php
// API/panelist_evaluations.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once __DIR__ . '/../Models/PanelistEvaluation.php';
require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    if ($method === 'GET') {
        if (isset($_GET['group_id'])) {
            $evals = PanelistEvaluation::findByGroupId($_GET['group_id']);
        } else {
            $evals = PanelistEvaluation::all();
        }
        sendJson(['success' => true, 'data' => $evals]);
    } 
    elseif ($method === 'POST') {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        if (!$data) {
            sendJson(['success' => false, 'message' => 'Invalid JSON payload.'], 400);
        }

        $saved = PanelistEvaluation::save($data);
        sendJson(['success' => true, 'message' => 'Evaluation saved successfully.', 'data' => $saved]);
    }
    else {
        sendJson(['success' => false, 'message' => 'Method not allowed.'], 405);
    }
} catch (Exception $e) {
    sendJson(['success' => false, 'message' => 'Server error: ' . $e->getMessage()], 500);
}
