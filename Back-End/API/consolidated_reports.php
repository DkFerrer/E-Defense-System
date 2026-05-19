<?php
// API/consolidated_reports.php
// Handles: GET /  GET /?group_id=  POST /  DELETE /?id=

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/../Models/ConsolidatedReport.php';

setCorsHeaders();
handlePreflight();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ── GET: list all OR get by group_id ──────────────────────────────────────
    case 'GET':
        if (isset($_GET['group_id'])) {
            $report = ConsolidatedReport::findByGroupId($_GET['group_id']);
            if (!$report) {
                jsonResponse(['success' => false, 'message' => 'Report not found'], 404);
            }
            jsonResponse(['success' => true, 'data' => $report]);
        }

        if (isset($_GET['id'])) {
            $report = ConsolidatedReport::findById((int) $_GET['id']);
            if (!$report) {
                jsonResponse(['success' => false, 'message' => 'Report not found'], 404);
            }
            jsonResponse(['success' => true, 'data' => $report]);
        }

        $reports = ConsolidatedReport::all();
        jsonResponse(['success' => true, 'data' => $reports]);
        break;

    // ── POST: create or update a report ──────────────────────────────────────
    case 'POST':
        $body = getRequestBody();

        // Validate required fields
        $required = [
            'group_id', 'groupTitle', 'members', 'adviser', 'program',
            'department', 'defenseDate', 'stage', 'totalFinalGrade',
            'gradeLabel', 'chairName', 'chairVerdict', 'dateFinalized', 'panelists',
        ];
        foreach ($required as $field) {
            if (!isset($body[$field])) {
                jsonResponse([
                    'success' => false,
                    'message' => "Missing required field: $field"
                ], 422);
            }
        }

        // Validate types
        if (!is_array($body['members'])) {
            jsonResponse(['success' => false, 'message' => 'members must be an array'], 422);
        }
        if (!is_array($body['panelists'])) {
            jsonResponse(['success' => false, 'message' => 'panelists must be an array'], 422);
        }

        $report = ConsolidatedReport::save($body);
        jsonResponse(['success' => true, 'message' => 'Report saved successfully', 'data' => $report], 201);
        break;

    // ── DELETE: remove a report by id ─────────────────────────────────────────
    case 'DELETE':
        if (!isset($_GET['id'])) {
            jsonResponse(['success' => false, 'message' => 'Missing report id'], 400);
        }
        $deleted = ConsolidatedReport::delete((int) $_GET['id']);
        if (!$deleted) {
            jsonResponse(['success' => false, 'message' => 'Report not found'], 404);
        }
        jsonResponse(['success' => true, 'message' => 'Report deleted']);
        break;

    default:
        jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}
