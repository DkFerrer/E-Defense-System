<?php
// migrate.php
// Run this script from the command line: php migrate.php

require_once __DIR__ . '/DBConnection/dbconnection.php';

try {
    $pdo = getConnection();
    
    $sql = "
    CREATE TABLE IF NOT EXISTS `panelist_evaluations` (
      `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      `group_id` VARCHAR(100) NOT NULL,
      `panelist` VARCHAR(255) NOT NULL,
      `total_score` DECIMAL(5,2) NOT NULL,
      `general_comments` TEXT,
      `criterion_scores` JSON NOT NULL,
      `criterion_comments` JSON NOT NULL,
      `student_presentation_scores` JSON NOT NULL,
      `approval_decision` VARCHAR(100) DEFAULT NULL,
      `submitted_at` DATETIME NOT NULL,
      `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      UNIQUE KEY `idx_group_panelist` (`group_id`, `panelist`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    ";

    $pdo->exec($sql);
    echo "Migration completed successfully. Table `panelist_evaluations` is ready.\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
