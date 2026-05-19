<?php
// DBConnection/dbconnection.php
// Update these credentials to match your MySQL setup

define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'post_evaluation');
define('DB_USER', 'root');       // change to your MySQL username
define('DB_PASS', '');           // MySQL root password
define('DB_CHARSET', 'utf8mb4');

function getConnection(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            DB_HOST,
            DB_PORT,
            DB_NAME,
            DB_CHARSET
        );
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
            exit;
        }
    }
    return $pdo;
}
