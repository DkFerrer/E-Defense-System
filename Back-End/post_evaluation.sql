-- ============================================================
-- post_evaluation database schema
-- Import this file in phpMyAdmin: post_evaluation > Import
-- ============================================================

CREATE DATABASE IF NOT EXISTS `post_evaluation`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE `post_evaluation`;

-- ── Table: consolidated_reports ──────────────────────────────
CREATE TABLE IF NOT EXISTS `consolidated_reports` (
  `id`                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `group_id`          VARCHAR(100)    NOT NULL UNIQUE,
  `group_title`       VARCHAR(255)    NOT NULL,
  `members`           JSON            NOT NULL,
  `adviser`           VARCHAR(255)    NOT NULL,
  `program`           VARCHAR(255)    NOT NULL,
  `department`        VARCHAR(255)    NOT NULL,
  `defense_date`      DATE            NOT NULL,
  `stage`             VARCHAR(100)    NOT NULL,
  `total_final_grade` DECIMAL(5,2)    NOT NULL DEFAULT 0.00,
  `grade_label`       VARCHAR(50)     NOT NULL,
  `chair_name`        VARCHAR(255)    NOT NULL,
  `chair_verdict`     VARCHAR(100)    NOT NULL,
  `chair_approved`    TINYINT(1)      NOT NULL DEFAULT 0,
  `date_finalized`    DATE            NOT NULL,
  `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_group_id` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── Table: report_panelists ───────────────────────────────────
CREATE TABLE IF NOT EXISTS `report_panelists` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `report_id`     INT UNSIGNED    NOT NULL,
  `panelist_name` VARCHAR(255)    NOT NULL,
  `score`         DECIMAL(5,2)    NOT NULL DEFAULT 0.00,
  `remarks`       TEXT,
  `is_chair`      TINYINT(1)      NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `idx_report_id` (`report_id`),
  CONSTRAINT `fk_panelists_report`
    FOREIGN KEY (`report_id`)
    REFERENCES `consolidated_reports` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── Seed Data: consolidated_reports ─────────────────────────
INSERT INTO `consolidated_reports` 
  (`id`, `group_id`, `group_title`, `members`, `adviser`, `program`, `department`, `defense_date`, `stage`, `total_final_grade`, `grade_label`, `chair_name`, `chair_verdict`, `chair_approved`, `date_finalized`, `created_at`, `updated_at`)
VALUES
  (1, '1', 'Blockchain-Based Student Records Management System', '["Sarah Williams", "Michael Brown"]', 'Dr. Maria Santos', 'BS Information Technology', 'School of Computer and Information Sciences', '2025-12-15', 'Review Defense', 82.00, 'Very Good', 'Dr. Elena Cruz', 'Good implementation of blockchain concepts. Needs improvement in security aspects.', 1, '2025-12-15', NOW(), NOW()),
  (2, '2', 'AI-Powered Learning Management System for Remote Education', '["John Doe", "Jane Smith", "Mark Johnson"]', 'Dr. Robert Lee', 'BS Computer Science', 'School of Computer and Information Sciences', '2025-12-15', 'Title Defense', 93.00, 'Excellent', 'Dr. Elena Cruz', 'Excellent AI integration and innovative approach to remote learning.', 1, '2025-12-15', NOW(), NOW()),
  (3, '3', 'E-Commerce Platform for Local Agricultural Products', '["Anna Lee", "Thomas Clark"]', 'Dr. Maria Santos', 'BS Information Technology', 'School of Computer and Information Sciences', '2025-12-16', 'Final Defense', 88.00, 'Very Good', 'Dr. Elena Cruz', 'Strong business model with good market analysis.', 1, '2025-12-16', NOW(), NOW())
ON DUPLICATE KEY UPDATE `group_id` = VALUES(`group_id`);

-- ── Seed Data: report_panelists ──────────────────────────────
INSERT INTO `report_panelists`
  (`id`, `report_id`, `panelist_name`, `score`, `remarks`, `is_chair`)
VALUES
  (1, 1, 'Dr. Elena Cruz', 85.00, 'Good implementation of blockchain concepts. Needs improvement in security aspects.', 1),
  (2, 1, 'Dr. Roberto Santos', 80.00, 'Solid technical foundation. User interface could be more intuitive.', 0),
  (3, 1, 'Dr. Maria Garcia', 81.00, 'Well-structured research. Consider adding more test cases.', 0),
  (4, 2, 'Dr. Elena Cruz', 93.00, 'Excellent AI integration and innovative approach to remote learning.', 1),
  (5, 3, 'Dr. Elena Cruz', 88.00, 'Strong business model with good market analysis.', 1)
ON DUPLICATE KEY UPDATE `panelist_name` = VALUES(`panelist_name`);

-- ── Table: panelist_evaluations ──────────────────────────────
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
