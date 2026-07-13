<?php
try {
    $pdo = new PDO("mysql:host=127.0.0.1;port=3307;dbname=evaluation_db;charset=utf8mb4", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $candidates = [
        'password',
        'password123',
        'santos2024',
        'coord123',
        'admin2024',
        'dean123',
        'unc2024',
        'panel123',
        'adv123',
        'reyes2024',
        'stud123',
        'juan2024',
        'admin123',
        'secretary1',
        'sec123',
        'secretary123',
    ];
    
    $stmt = $pdo->query("SELECT username, password FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($users as $user) {
        $username = $user['username'];
        $hash = $user['password'];
        echo "User: $username (Hash: $hash)\n";
        
        $matched = false;
        foreach ($candidates as $cand) {
            if (password_verify($cand, $hash)) {
                echo "  -> Matches: '$cand'\n";
                $matched = true;
            }
        }
        if (!$matched) {
            echo "  -> NO MATCH FOUND in candidates\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
