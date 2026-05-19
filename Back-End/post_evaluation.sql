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
