<?php
header('Content-Type: text/plain; charset=utf-8');
// POST ?secret=intelline-token-2026&token=test to test
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['secret'] ?? '') === 'intelline-token-2026') {
    $token = $_POST['token'] ?? '';
    if (strlen($token) < 50) { echo "Bad token ($token)"; exit; }
    $envFile = __DIR__ . '/.env';
    if (!file_exists($envFile)) { echo ".env not found"; exit; }
    if (!is_writable($envFile)) { echo ".env not writable"; exit; }
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $found = false; $out = '';
    foreach ($lines as $line) {
        if (strpos(trim($line), 'GIGACHAT_TOKEN=') === 0) { $out .= 'GIGACHAT_TOKEN=' . $token . "\n"; $found = true; }
        else { $out .= $line . "\n"; }
    }
    if (!$found) $out .= 'GIGACHAT_TOKEN=' . $token . "\n";
    if (file_put_contents($envFile, $out) === false) { echo "Write failed"; exit; }
    echo "OK";
    exit;
}
echo "GET. Current token: ";
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (strpos(trim($line), 'GIGACHAT_TOKEN=') === 0) echo substr(trim($line), 16, 30) . "...\n";
    }
}
echo "writable: " . (is_writable($envFile) ? 'yes' : 'no') . "\n";