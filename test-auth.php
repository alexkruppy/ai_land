<?php
header('Content-Type: text/plain; charset=utf-8');

$auth = 'MDE5ZWI3NTUtZDY0OC03YmUwLWFmNjQtYzFkZjU4MzQ1MDNhOjI4NDdlMzEzLWYzMDItNGJkNy1hYTEyLWU1OWQxNzM2NjJlMw==';

$endpoints = [
    'ngw :9443' => 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
    'gigachat 443' => 'https://gigachat.devices.sberbank.ru/api/v2/oauth',
    'api.giga.chat /api/v2/oauth' => 'https://api.giga.chat/api/v2/oauth',
];

$rqUid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
    mt_rand(0, 0xffff), mt_rand(0, 0xffff),
    mt_rand(0, 0xffff),
    mt_rand(0, 0x0fff) | 0x4000,
    mt_rand(0, 0x3fff) | 0x8000,
    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff));

foreach ($endpoints as $name => $url) {
    echo "=== $name ===\n";
    echo "URL: $url\n";
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Basic ' . $auth,
            'Content-Type: application/x-www-form-urlencoded',
            'RqUID: ' . $rqUid,
            'Accept: application/json',
        ],
        CURLOPT_POSTFIELDS => 'scope=GIGACHAT_API_PERS',
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
    if ($error) echo "CURL ERROR: $error\n";
    if ($resp) echo "RESPONSE: " . substr($resp, 0, 500) . "\n";
    echo "\n";
}

echo "Done.\n";