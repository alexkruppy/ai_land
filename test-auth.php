<?php
header('Content-Type: text/plain; charset=utf-8');

$auth = 'MDE5ZWI3NTUtZDY0OC03YmUwLWFmNjQtYzFkZjU4MzQ1MDNhOjI4NDdlMzEzLWYzMDItNGJkNy1hYTEyLWU1OWQxNzM2NjJlMw==';

function tryReq($url, $headers, $body, $desc) {
    echo "--- $desc ---\n";
    echo "POST $url\n";
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
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
    if ($resp) echo "BODY: " . substr($resp, 0, 500) . "\n";
    echo "\n";
}

$payload = json_encode([
    'model' => 'GigaChat',
    'messages' => [['role' => 'user', 'content' => 'Привет!']],
    'max_tokens' => 100
]);

// Try Base64 credentials as Bearer token directly
tryReq('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', [
    'Authorization: Bearer ' . $auth,
    'Content-Type: application/json',
    'Accept: application/json',
    'User-Agent: IntelLine/1.0'
], $payload, 'Bearer=base64(client_id:client_secret)');

// Try as Bearer with "key=" prefix (like some API keys)
tryReq('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', [
    'Authorization: Bearer key=' . $auth,
    'Content-Type: application/json',
    'Accept: application/json',
], $payload, 'Bearer key=base64');

// Try client_secret as Bearer (maybe just the secret part works)
$parts = explode(':', base64_decode($auth));
$clientId = $parts[0] ?? '';
$clientSecret = $parts[1] ?? '';
echo "CLIENT_ID: $clientId\n";
echo "CLIENT_SECRET: $clientSecret\n\n";

tryReq('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', [
    'Authorization: Bearer ' . $clientSecret,
    'Content-Type: application/json',
    'Accept: application/json',
], $payload, 'Bearer=client_secret only');

echo "Done.\n";