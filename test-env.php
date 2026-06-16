<?php
header('Content-Type: text/plain; charset=utf-8');

echo "=== .env exists: " . (file_exists(__DIR__ . '/.env') ? 'YES' : 'NO') . " ===\n";

$envVars = [];
if (file_exists(__DIR__ . '/.env')) {
    foreach (file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if (strpos($line, '=') !== false && $line[0] !== '#') {
            list($k, $v) = explode('=', $line, 2);
            $envVars[trim($k)] = trim($v);
        }
    }
}

$token = $envVars['GIGACHAT_TOKEN'] ?? 'NOT SET';
echo "GIGACHAT_TOKEN: " . substr($token, 0, 30) . (strlen($token) > 30 ? '...' : '') . "\n";

$cred = $envVars['GIGACHAT_CREDENTIALS'] ?? 'NOT SET';
echo "GIGACHAT_CREDENTIALS: " . substr($cred, 0, 20) . (strlen($cred) > 20 ? '...' : '') . "\n";

if ($token && strlen($token) > 50) {
    echo "\n=== Testing GigaChat API with token ===\n";
    $payload = json_encode([
        'model' => 'GigaChat',
        'messages' => [['role' => 'user', 'content' => 'Привет!']],
        'temperature' => 0.7,
        'max_tokens' => 100
    ]);
    $ch = curl_init('https://gigachat.devices.sberbank.ru/api/v1/chat/completions');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => 0,
    ]);
    $resp = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    echo "HTTP: $httpCode\n";
    if ($error) echo "ERR: $error\n";
    echo "RESPONSE: " . substr($resp, 0, 500) . "\n";

    if ($httpCode == 200) {
        $data = json_decode($resp, true);
        echo "\nREPLY: " . ($data['choices'][0]['message']['content'] ?? 'N/A') . "\n";
    }
}

echo "\nDone.\n";