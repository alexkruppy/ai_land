<?php
$SECRET = 'intelline-token-2026';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }
$secret = $_POST['secret'] ?? '';
$token  = $_POST['token'] ?? '';
if ($secret !== $SECRET) { http_response_code(403); exit('Forbidden'); }
if (strlen($token) < 50) { http_response_code(400); exit('Bad token'); }

$envFile = __DIR__ . '/.env';
$lines = file_exists($envFile) ? file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : [];
$found = false;
$out = '';
foreach ($lines as $line) {
    if (strpos(trim($line), 'GIGACHAT_TOKEN=') === 0) { $out .= 'GIGACHAT_TOKEN=' . $token . "\n"; $found = true; }
    else { $out .= $line . "\n"; }
}
if (!$found) $out .= 'GIGACHAT_TOKEN=' . $token . "\n";
file_put_contents($envFile, $out);
echo "OK\n";