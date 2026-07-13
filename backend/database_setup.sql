-- Database Setup for Research Evaluation Platform
-- Environment: PHP 8, MySQL (XAMPP)

CREATE DATABASE IF NOT EXISTS evaluation_db;
USE evaluation_db;

-- Drop tables in reverse foreign key order to ensure clean recreate
DROP TABLE IF EXISTS `panelist_rubric_submissions`;
DROP TABLE IF EXISTS `evaluations`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `rubric_criteria`;
DROP TABLE IF EXISTS `rubrics`;
DROP TABLE IF EXISTS `users`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT 'Faculty',
  `role_label` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT 'Panel Member',
  `department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_username_unique` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Rubrics Table
CREATE TABLE IF NOT EXISTS `rubrics` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stage` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Rubric Criteria Table
CREATE TABLE IF NOT EXISTS `rubric_criteria` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `rubric_id` bigint(20) UNSIGNED NOT NULL,
  `criterion_key` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_points` int(11) NOT NULL DEFAULT 10,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `rubric_criteria_rubric_id_foreign` (`rubric_id`),
  CONSTRAINT `rubric_criteria_rubric_id_foreign` FOREIGN KEY (`rubric_id`) REFERENCES `rubrics` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `research_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `members` json NOT NULL,
  `adviser_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requested_date` date NOT NULL,
  `requested_time` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `venue` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `defense_type` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `assigned_panelists` json DEFAULT NULL,
  `decline_reason` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Evaluations Table
CREATE TABLE IF NOT EXISTS `evaluations` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `booking_id` bigint(20) UNSIGNED DEFAULT NULL,
  `rubric_id` bigint(20) UNSIGNED DEFAULT NULL,
  `target` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `defense_stage` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `authors` json DEFAULT NULL,
  `department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_score` smallint(5) UNSIGNED NOT NULL DEFAULT 100,
  `aggregate_score` decimal(8,2) DEFAULT NULL,
  `aggregate_percent` decimal(6,2) DEFAULT NULL,
  `decision` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `result_date` date DEFAULT NULL,
  `status` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `due_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `evaluations_rubric_id_foreign` (`rubric_id`),
  KEY `evaluations_booking_id_foreign` (`booking_id`),
  CONSTRAINT `evaluations_rubric_id_foreign` FOREIGN KEY (`rubric_id`) REFERENCES `rubrics` (`id`) ON DELETE SET NULL,
  CONSTRAINT `evaluations_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Panelist Submissions Table
CREATE TABLE IF NOT EXISTS `panelist_rubric_submissions` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `evaluation_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `scores` json NOT NULL,
  `comments` json DEFAULT NULL,
  `general_comments` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_score` decimal(10,2) DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `panelist_rubric_submissions_evaluation_id_user_id_unique` (`evaluation_id`,`user_id`),
  KEY `panelist_rubric_submissions_user_id_foreign` (`user_id`),
  CONSTRAINT `panelist_rubric_submissions_evaluation_id_foreign` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `panelist_rubric_submissions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Personal Access Tokens
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Sessions Table
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Panelist User (Dr. Maria Santos)
INSERT INTO `users` (`id`, `name`, `username`, `email`, `password`, `role`, `role_label`, `department`, `position`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Dr. Maria Santos', '23-181818', 'panelist@unc.edu.ph', '$2y$12$ZpB9wBqE8W2r0G0.o1O.Oe8y6.9p1O.Oe8y6.9p1O.Oe8y6.9p1O.', 'Faculty', 'Panel Member', 'School of Computer and Information Sciences', 'Associate Professor', 'Active', NOW(), NOW());

-- Insert Rubrics
INSERT INTO `rubrics` (`id`, `title`, `stage`, `created_at`, `updated_at`) VALUES
(1, 'PROJECT DOCUMENTATION AND MANUSCRIPT', 'proposal', NOW(), NOW());

-- Insert Criteria
INSERT INTO `rubric_criteria` (`rubric_id`, `criterion_key`, `name`, `description`, `max_points`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'c1', 'Project Context', 'Clearly establishes the research problem, significance, and scope within the academic and practical context.', 10, 1, NOW(), NOW()),
(1, 'c2', 'Objectives', 'States measurable objectives and well-formed research questions aligned with the problem.', 10, 2, NOW(), NOW());

-- Insert Bookings (Synchronized with 5 Screenshot Groups)
INSERT INTO `bookings` (`id`, `research_title`, `members`, `adviser_name`, `department`, `requested_date`, `requested_time`, `venue`, `defense_type`, `status`, `assigned_panelists`, `created_at`, `updated_at`) VALUES
(1, 'AI-Powered Learning Management System', '["John Doe", "Jane Smith", "Bob Johnson"]', 'Junar Danila', 'School of Computer and Information Sciences', '2024-12-20', '10:00 AM', 'JH32', 'Title Defense', 'approved', '[{"id": "23-181818", "name": "Dr. Maria Santos", "role": "Member"}]', NOW(), NOW()),
(2, 'Blockchain-Based Voting System', '["Alice Brown", "Charlie Davis"]', 'Dr. Roberto Cruz', 'School of Computer and Information Sciences', '2024-12-22', '02:00 PM', 'https://meet.google.com/abc-defg-hij', 'Review Defense', 'approved', '[{"id": "23-181818", "name": "Dr. Maria Santos", "role": "Chairman"}]', NOW(), NOW()),
(3, 'Sustainable Urban Planning Framework', '["David Wilson", "Emma Taylor", "Frank Moore"]', 'Dr. Grace Hopper', 'College of Engineering and Architecture', '2024-12-25', '09:00 AM', 'Room 405, CEA Building', 'Final Defense', 'pending', '[{"id": "23-181818", "name": "Dr. Maria Santos", "role": "Member"}]', NOW(), NOW()),
(4, 'Machine Learning for Medical Diagnosis', '["Sarah Johnson", "Michael Chen", "Emily Rodriguez"]', 'Prof. Ada Lovelace', 'School of Computer and Information Sciences', '2024-12-18', '03:00 PM', 'Room 303, SCIS Building', 'Title Defense', 'completed', '[{"id": "23-181818", "name": "Dr. Maria Santos", "role": "Chairman"}]', NOW(), NOW()),
(5, 'Smart City Infrastructure Development', '["George Harris", "Helen Martinez"]', 'Dr. Grace Hopper', 'College of Engineering and Architecture', '2024-12-21', '11:00 AM', 'Room 406, CEA Building', 'Review Defense', 'approved', '[{"id": "23-181818", "name": "Dr. Maria Santos", "role": "Member"}]', NOW(), NOW());

-- Insert Evaluations (Linked to Bookings)
INSERT INTO `evaluations` (`id`, `booking_id`, `rubric_id`, `target`, `type`, `defense_stage`, `authors`, `department`, `max_score`, `status`, `due_date`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'AI-Powered Learning Management System', 'Title Defense', 'proposal', '["John Doe", "Jane Smith", "Bob Johnson"]', 'School of Computer and Information Sciences', 100, 'pending', '2024-12-20', NOW(), NOW()),
(2, 2, 1, 'Blockchain-Based Voting System', 'Review Defense', 'proposal', '["Alice Brown", "Charlie Davis"]', 'School of Computer and Information Sciences', 100, 'pending', '2024-12-22', NOW(), NOW()),
(3, 3, 1, 'Sustainable Urban Planning Framework', 'Final Defense', 'proposal', '["David Wilson", "Emma Taylor", "Frank Moore"]', 'College of Engineering and Architecture', 100, 'pending', '2024-12-25', NOW(), NOW()),
(4, 4, 1, 'Machine Learning for Medical Diagnosis', 'Title Defense', 'proposal', '["Sarah Johnson", "Michael Chen", "Emily Rodriguez"]', 'School of Computer and Information Sciences', 100, 'completed', '2024-12-18', NOW(), NOW()),
(5, 5, 1, 'Smart City Infrastructure Development', 'Review Defense', 'proposal', '["George Harris", "Helen Martinez"]', 'College of Engineering and Architecture', 100, 'pending', '2024-12-21', NOW(), NOW());

-- Insert Completed Submission for Machine Learning Group
INSERT INTO `panelist_rubric_submissions` (`id`, `evaluation_id`, `user_id`, `status`, `scores`, `comments`, `general_comments`, `total_score`, `submitted_at`, `created_at`, `updated_at`) VALUES
(1, 4, 1, 'submitted', '{"c1": 8, "c2": 9}', '{"c1": "Good start.", "c2": "Clear goals."}', 'Overall a highly promising medical diagnosis framework.', 85.00, NOW(), NOW(), NOW());
