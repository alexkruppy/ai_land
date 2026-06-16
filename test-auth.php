<?php
header('Content-Type: text/plain; charset=utf-8');

$auth = 'MDE5ZWI3NTUtZDY0OC03YmUwLWFmNjQtYzFkZjU4MzQ1MDNhOjI4NDdlMzEzLWYzMDItNGJkNy1hYTEyLWU1OWQxNzM2NjJlMw==';

function uuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff));
}

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
    if ($resp && $httpCode != 200) echo "BODY: " . substr($resp, 0, 300) . "\n";
    if ($httpCode == 200) echo "SUCCESS: " . substr($resp, 0, 300) . "\n";
    echo "\n";
}

$uid = uuid();

// GigaChat auth with different options
tryReq('https://gigachat.devices.sberbank.ru/api/v2/oauth', [
    'Authorization: Basic ' . $auth,
    'Content-Type: application/x-www-form-urlencoded',
    'RqUID: ' . $uid,
    'Accept: application/json',
    'User-Agent: IntelLine/1.0'
], 'scope=GIGACHAT_API_PERS', 'gigachat 443, GIGACHAT_API_PERS');

tryReq('https://gigachat.devices.sberbank.ru/api/v2/oauth', [
    'Authorization: Basic ' . $auth,
    'Content-Type: application/x-www-form-urlencoded',
    'RqUID: ' . $uid,
    'Accept: application/json',
    'User-Agent: IntelLine/1.0'
], 'scope=GIGACHAT_API_CORP', 'gigachat 443, GIGACHAT_API_CORP');

tryReq('https://gigachat.devices.sberbank.ru/api/v2/oauth', [
    'Authorization: Basic ' . $auth,
    'Content-Type: application/x-www-form-urlencoded',
    'RqUID: ' . $uid,
    'Accept: application/json',
    'User-Agent: curl/8.0'
], 'scope=GIGACHAT_API_PERS', 'gigachat 443, curl UA');

tryReq('https://gigachat.devices.sberbank.ru/api/v2/oauth', [
    'Authorization: Basic ' . $auth,
    'Content-Type: application/json',
    'RqUID: ' . $uid,
    'Accept: application/json',
    'User-Agent: IntelLine/1.0'
], json_encode(['scope' => 'GIGACHAT_API_PERS']), 'gigachat 443, JSON body');

// Chat endpoint directly (maybe works with Basic auth?)
tryReq('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', [
    'Authorization: Basic ' . $auth,
    'Content-Type: application/json',
    'Accept: application/json',
    'User-Agent: IntelLine/1.0'
], json_encode([
    'model' => 'GigaChat',
    'messages' => [['role' => 'user', 'content' => 'Hello']],
    'max_tokens' => 50
]), 'gigachat chat directly with Basic auth');

// api.giga.chat with different paths
tryReq('https://api.giga.chat/v1/oauth', [
    'Authorization: Basic ' . $auth,
    'Content-Type: application/x-www-form-urlencoded',
    'Accept: application/json',
    'User-Agent: IntelLine/1.0'
], 'scope=GIGACHAT_API_PERS', 'api.giga.chat /v1/oauth');

tryReq('https://api.giga.chat/oauth', [
    'Authorization: Basic ' . $auth,
    'Content-Type: application/x-www-form-urlencoded',
    'Accept: application/json',
], 'scope=GIGACHAT_API_PERS', 'api.giga.chat /oauth');

echo "Done.\n";