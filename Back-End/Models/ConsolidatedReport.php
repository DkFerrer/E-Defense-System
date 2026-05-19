<?php
// Models/ConsolidatedReport.php

require_once __DIR__ . '/../DBConnection/dbconnection.php';

class ConsolidatedReport {

    // ── Save or update a report (upsert by group_id) ─────────────────────────
    public static function save(array $data): array {
        $pdo = getConnection();

        // Check if a report already exists for this group
        $existing = $pdo->prepare('SELECT id FROM consolidated_reports WHERE group_id = ?');
        $existing->execute([$data['group_id']]);
        $row = $existing->fetch();

        if ($row) {
            // UPDATE
            $stmt = $pdo->prepare('
                UPDATE consolidated_reports SET
                    group_title       = ?,
                    members           = ?,
                    adviser           = ?,
                    program           = ?,
                    department        = ?,
                    defense_date      = ?,
                    stage             = ?,
                    total_final_grade = ?,
                    grade_label       = ?,
                    chair_name        = ?,
                    chair_verdict     = ?,
                    chair_approved    = ?,
                    date_finalized    = ?,
                    updated_at        = NOW()
                WHERE group_id = ?
            ');
            $stmt->execute([
                $data['groupTitle'],
                json_encode($data['members']),
                $data['adviser'],
                $data['program'],
                $data['department'],
                $data['defenseDate'],
                $data['stage'],
                $data['totalFinalGrade'],
                $data['gradeLabel'],
                $data['chairName'],
                $data['chairVerdict'],
                $data['chairApproved'] ? 1 : 0,
                $data['dateFinalized'],
                $data['group_id'],
            ]);
            $reportId = $row['id'];

            // Delete old panelists and re-insert
            $pdo->prepare('DELETE FROM report_panelists WHERE report_id = ?')
                ->execute([$reportId]);
        } else {
            // INSERT
            $stmt = $pdo->prepare('
                INSERT INTO consolidated_reports
                    (group_id, group_title, members, adviser, program, department,
                     defense_date, stage, total_final_grade, grade_label,
                     chair_name, chair_verdict, chair_approved, date_finalized,
                     created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ');
            $stmt->execute([
                $data['group_id'],
                $data['groupTitle'],
                json_encode($data['members']),
                $data['adviser'],
                $data['program'],
                $data['department'],
                $data['defenseDate'],
                $data['stage'],
                $data['totalFinalGrade'],
                $data['gradeLabel'],
                $data['chairName'],
                $data['chairVerdict'],
                $data['chairApproved'] ? 1 : 0,
                $data['dateFinalized'],
            ]);
            $reportId = $pdo->lastInsertId();
        }

        // Insert panelists
        if (!empty($data['panelists'])) {
            $panelistStmt = $pdo->prepare('
                INSERT INTO report_panelists
                    (report_id, panelist_name, score, remarks, is_chair)
                VALUES (?, ?, ?, ?, ?)
            ');
            foreach ($data['panelists'] as $p) {
                $panelistStmt->execute([
                    $reportId,
                    $p['name'],
                    $p['score'],
                    $p['remarks'],
                    $p['isChair'] ? 1 : 0,
                ]);
            }
        }

        return self::findById($reportId);
    }

    // ── Fetch all reports ─────────────────────────────────────────────────────
    public static function all(): array {
        $pdo = getConnection();
        $reports = $pdo->query('
            SELECT * FROM consolidated_reports ORDER BY created_at DESC
        ')->fetchAll();

        foreach ($reports as &$r) {
            $r['members'] = json_decode($r['members'], true);
            $r['chair_approved'] = (bool) $r['chair_approved'];
            $r['panelists'] = self::getPanelists($r['id']);
        }
        return $reports;
    }

    // ── Fetch single report by ID ─────────────────────────────────────────────
    public static function findById(int $id): ?array {
        $pdo = getConnection();
        $stmt = $pdo->prepare('SELECT * FROM consolidated_reports WHERE id = ?');
        $stmt->execute([$id]);
        $r = $stmt->fetch();
        if (!$r) return null;

        $r['members'] = json_decode($r['members'], true);
        $r['chair_approved'] = (bool) $r['chair_approved'];
        $r['panelists'] = self::getPanelists($r['id']);
        return $r;
    }

    // ── Fetch report by group_id ──────────────────────────────────────────────
    public static function findByGroupId(string $groupId): ?array {
        $pdo = getConnection();
        $stmt = $pdo->prepare('SELECT * FROM consolidated_reports WHERE group_id = ?');
        $stmt->execute([$groupId]);
        $r = $stmt->fetch();
        if (!$r) return null;

        $r['members'] = json_decode($r['members'], true);
        $r['chair_approved'] = (bool) $r['chair_approved'];
        $r['panelists'] = self::getPanelists($r['id']);
        return $r;
    }

    // ── Delete a report ───────────────────────────────────────────────────────
    public static function delete(int $id): bool {
        $pdo = getConnection();
        $pdo->prepare('DELETE FROM report_panelists WHERE report_id = ?')->execute([$id]);
        $stmt = $pdo->prepare('DELETE FROM consolidated_reports WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    // ── Helper: get panelists for a report ────────────────────────────────────
    private static function getPanelists(int $reportId): array {
        $pdo = getConnection();
        $stmt = $pdo->prepare('
            SELECT panelist_name AS name, score, remarks, is_chair AS isChair
            FROM report_panelists WHERE report_id = ? ORDER BY id ASC
        ');
        $stmt->execute([$reportId]);
        $rows = $stmt->fetchAll();
        foreach ($rows as &$row) {
            $row['isChair'] = (bool) $row['isChair'];
        }
        return $rows;
    }
}
