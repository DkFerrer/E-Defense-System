<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'dbconnection.php';

$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode(['message' => 'Username and password are required']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, name, username, email, role, role_label, department, position, status, password FROM users WHERE username = ? OR email = ?');
$stmt->execute([$username, $username]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    unset($user['password']);
    
    // Create a mock token
    $token = bin2hex(random_bytes(32));
    
    echo json_encode([
        'token' => $token,
        'user' => [
            'id' => (string) $user['id'],
            'name' => $user['name'],
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => $user['role'],
            'roleLabel' => $user['role_label'],
            'department' => $user['department'],
            'position' => $user['position'],
            'status' => $user['status'],
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode(['message' => 'Invalid credentials']);
}
?>
