<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'dbconnection.php';

// Just returning some basic rubrics as requested
echo json_encode([
    'rubrics' => [
        [
            'id' => '1',
            'name' => 'Standard Thesis Defense Rubric',
            'department' => 'scis',
            'program' => 'bs-cs',
            'stage' => 'final',
            'criteria' => [
                [
                    'id' => 'doc-context',
                    'chapter' => 'Chapter 1: Introduction',
                    'title' => 'Project Context',
                    'description' => 'Clearly stated and explains clearly the presentation of introduction, background and statement of facts and of the title; its challenges for the editor; and the rationale for the paper',
                    'points' => 10
                ],
                [
                    'id' => 'doc-goals',
                    'chapter' => 'Chapter 1: Introduction',
                    'title' => 'Clarity and Completeness of Ideas and Objectives',
                    'description' => 'Clearly articulated ideas with well-defined objectives that demonstrate the development of the project; and aligned',
                    'points' => 15
                ]
            ],
            'createdBy' => 'Dr. Maria Santos',
            'createdAt' => '2024-01-15'
        ]
    ]
]);
?>
