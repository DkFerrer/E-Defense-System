<?php
// Models/PanelistEvaluation.php

require_once __DIR__ . '/../DBConnection/dbconnection.php';

class PanelistEvaluation {

    public static function save(array $data): array {
        $pdo = getConnection();

        // Ensure required fields
        $groupId = $data['groupId'] ?? '';
        $panelist = $data['panelist'] ?? '';
        $totalScore = $data['totalScore'] ?? 0;
        $generalComments = $data['comments'] ?? '';
        $submittedAt = $data['submittedAt'] ?? date('Y-m-d H:i:s');
        $approvalDecision = $data['approvalDecision'] ?? null;
        
        $criterionScores = json_encode($data['criterionScores'] ?? []);
        $criterionComments = json_encode($data['criterionComments'] ?? []);
        $studentPresentationScores = json_encode($data['studentPresentationScores'] ?? []);

        if (!$groupId || !$panelist) {
            throw new Exception("groupId and panelist are required");
        }

        // Check if exists
        $stmt = $pdo->prepare('SELECT id FROM panelist_evaluations WHERE group_id = ? AND panelist = ?');
        $stmt->execute([$groupId, $panelist]);
        $row = $stmt->fetch();

        if ($row) {
            // Update
            $updateStmt = $pdo->prepare('
                UPDATE panelist_evaluations SET
                    total_score = ?,
                    general_comments = ?,
                    criterion_scores = ?,
                    criterion_comments = ?,
                    student_presentation_scores = ?,
                    approval_decision = ?,
                    submitted_at = ?,
                    updated_at = NOW()
                WHERE id = ?
            ');
            $updateStmt->execute([
                $totalScore,
                $generalComments,
                $criterionScores,
                $criterionComments,
                $studentPresentationScores,
                $approvalDecision,
                $submittedAt,
                $row['id']
            ]);
            $evalId = $row['id'];
        } else {
            // Insert
            $insertStmt = $pdo->prepare('
                INSERT INTO panelist_evaluations
                (group_id, panelist, total_score, general_comments, criterion_scores, criterion_comments, student_presentation_scores, approval_decision, submitted_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ');
            $insertStmt->execute([
                $groupId,
                $panelist,
                $totalScore,
                $generalComments,
                $criterionScores,
                $criterionComments,
                $studentPresentationScores,
                $approvalDecision,
                $submittedAt
            ]);
            $evalId = $pdo->lastInsertId();
        }

        return self::findById($evalId);
    }

    public static function findById(int $id): ?array {
        $pdo = getConnection();
        $stmt = $pdo->prepare('SELECT * FROM panelist_evaluations WHERE id = ?');
        $stmt->execute([$id]);
        $r = $stmt->fetch();
        if (!$r) return null;
        return self::formatRecord($r);
    }

    public static function findByGroupId(string $groupId): array {
        $pdo = getConnection();
        $stmt = $pdo->prepare('SELECT * FROM panelist_evaluations WHERE group_id = ? ORDER BY created_at ASC');
        $stmt->execute([$groupId]);
        $rows = $stmt->fetchAll();
        return array_map([self::class, 'formatRecord'], $rows);
    }

    public static function all(): array {
        $pdo = getConnection();
        $rows = $pdo->query('SELECT * FROM panelist_evaluations ORDER BY created_at DESC')->fetchAll();
        return array_map([self::class, 'formatRecord'], $rows);
    }

    private static function formatRecord(array $r): array {
        return [
            'groupId' => $r['group_id'],
            'panelist' => $r['panelist'],
            'totalScore' => (float) $r['total_score'],
            'comments' => $r['general_comments'],
            'criterionScores' => json_decode($r['criterion_scores'], true) ?? [],
            'criterionComments' => json_decode($r['criterion_comments'], true) ?? [],
            'studentPresentationScores' => json_decode($r['student_presentation_scores'], true) ?? [],
            'approvalDecision' => $r['approval_decision'],
            'submittedAt' => $r['submitted_at']
        ];
    }
}
