<?php
header('Content-Type: text/plain; charset=utf-8');

$auth = 'MDE5ZWI3NTUtZDY0OC03YmUwLWFmNjQtYzFkZjU4MzQ1MDNhOjhkN2EwM2UyLWI2OWUtNDU0OC04YjdjLTY0NDdiNjg3YzY2Nw==';
$rqUid = '3107d4f7-dd40-41b1-82d2-4f04e7b96365';

function tryReq($method, $url, $headers, $body, $desc, $follow = false) {
    echo "--- $desc ---\n";
    echo "$method $url\n";
    $ch = curl_init($url);
    $opts = [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => 0,
    ];
    if ($body !== null) $opts[CURLOPT_POSTFIELDS] = $body;
    if ($follow) $opts[CURLOPT_FOLLOWLOCATION] = true;
    curl_setopt_array($ch, $opts);
    $resp = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    echo "HTTP: $httpCode\n";
    if ($error) echo "ERR: $error\n";
    if ($resp) echo "BODY: " . substr($resp, 0, 500) . "\n";
    echo "\n";
}

$body = http_build_query(['scope' => 'GIGACHAT_API_PERS']);
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0';

// Try with browser User-Agent
tryReq('POST', 'https://gigachat.devices.sberbank.ru/api/v2/oauth', [
    'Authorization: Basic ' . $auth,
    'Content-Type: application/x-www-form-urlencoded',
    'Accept: application/json',
    'RqUID: ' . $rqUid,
    'User-Agent: ' . $ua,
], $body, 'Browser UA', true);

// Try with Origin/Referer
tryReq('POST', 'https://gigachat.devices.sberbank.ru/api/v2/oauth', [
    'Authorization: Basic ' . $auth,
    'Content-Type: application/x-www-form-urlencoded',
    'Accept: application/json',
    'RqUID: ' . $rqUid,
    'User-Agent: ' . $ua,
    'Origin: https://gigachat.devices.sberbank.ru',
    'Referer: https://gigachat.devices.sberbank.ru/',
], $body, 'With Origin/Referer', true);

// Try port 9443 on gigachat host
tryReq('POST', 'https://gigachat.devices.sberbank.ru:9443/api/v2/oauth', [
    'Authorization: Basic ' . $auth,
    'Content-Type: application/x-www-form-urlencoded',
    'Accept: application/json',
    'RqUID: ' . $rqUid,
], $body, 'gigachat :9443');

// Try ngw on port 443
tryReq('POST', 'https://ngw.devices.sberbank.ru/api/v2/oauth', [
    'Authorization: Basic ' . $auth,
    'Content-Type: application/x-www-form-urlencoded',
    'Accept: application/json',
    'RqUID: ' . $rqUid,
], $body, 'ngw port 443');

// Try /v1/oauth path on gigachat
tryReq('POST', 'https://gigachat.devices.sberbank.ru/v1/oauth', [
    'Authorization: Basic ' . $auth,
    'Content-Type: application/x-www-form-urlencoded',
    'Accept: application/json',
    'RqUID: ' . $rqUid,
], $body, 'v1/oauth path');

// Try without Content-Type, body as query
tryReq('POST', 'https://gigachat.devices.sberbank.ru/api/v2/oauth?scope=GIGACHAT_API_PERS', [
    'Authorization: Basic ' . $auth,
    'Accept: application/json',
    'RqUID: ' . $rqUid,
], null, 'scope in query, no body');

echo "Done.\n";