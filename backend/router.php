<?php
// router.php for PHP built-in web server

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Extract the script name by removing /api/ prefix if present
$scriptName = preg_replace('#^/api/#', '', $uri);

// Route all .php requests to the php_api directory
if (preg_match('#\.php$#', $scriptName)) {
    $script = __DIR__ . '/php_api/' . ltrim($scriptName, '/');
    if (file_exists($script)) {
        require $script;
        exit;
    }
}

// Otherwise let the built-in server handle the request normally
return false;
