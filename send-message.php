<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['error' => 'POST only']));
}

$input = json_decode(file_get_contents('php://input'), true);
$message = trim($input['message'] ?? '');
$history = $input['history'] ?? [];

if (!$message) {
    http_response_code(400);
    exit(json_encode(['error' => 'Message required']));
}

$auth = getenv('GIGACHAT_CREDENTIALS');
if (!$auth && file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), 'GIGACHAT_CREDENTIALS=') === 0) {
            $auth = trim(substr($line, 20));
            break;
        }
    }
}

if (!$auth) {
    http_response_code(500);
    exit(json_encode(['error' => 'GigaChat credentials not configured']));
}

$skillsDir = __DIR__ . '/skills';
$knowledge = '';
if (is_dir($skillsDir)) {
    foreach (glob($skillsDir . '/*.md') as $file) {
        $knowledge .= file_get_contents($file) . "\n\n";
    }
}

$systemPrompt = 'Ты — ИИ-агент IntelLine. Отвечай на русском языке, кратко и по делу. Используй знания ниже для ответов. Если спрашивают про цену — назови стоимость. Если хотят заказать — попроси имя и контакт. Если не знаешь — скажи честно и предложи связаться с менеджером. Будь вежлив и полезен.

Знания о компании:
' . $knowledge;

function uuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

function gigachatRequest($url, $headers, $payload, $sslVerify) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => $sslVerify,
        CURLOPT_SSL_VERIFYHOST => $sslVerify ? 2 : 0
    ]);
    $resp = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    return [$httpCode, $resp, $error];
}

$rqUid = uuid();
list($code, $body, $err) = gigachatRequest(
    'https://ngw.devices.sberbank.ru/api/v2/oauth',
    [
        'Authorization: Basic ' . $auth,
        'Content-Type: application/x-www-form-urlencoded',
        'RqUID: ' . $rqUid,
        'Accept: application/json',
        'User-Agent: IntelLine/1.0'
    ],
    'scope=GIGACHAT_API_PERS',
    false
);

if ($code !== 200) {
    http_response_code(502);
    exit(json_encode(['error' => 'GigaChat auth failed', 'detail' => $body ?: $err]));
}

$tokenData = json_decode($body, true);
$accessToken = $tokenData['access_token'] ?? '';

if (!$accessToken) {
    http_response_code(502);
    exit(json_encode(['error' => 'No access token']));
}

$messages = [];
if ($systemPrompt) {
    $messages[] = ['role' => 'system', 'content' => $systemPrompt];
}
foreach ($history as $msg) {
    $messages[] = ['role' => $msg['role'], 'content' => $msg['content']];
}
$messages[] = ['role' => 'user', 'content' => $message];

$payload = json_encode([
    'model' => 'GigaChat',
    'messages' => $messages,
    'temperature' => 0.7,
    'max_tokens' => 500
]);

list($code, $body, $err) = gigachatRequest(
    'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
    [
        'Authorization: Bearer ' . $accessToken,
        'Content-Type: application/json',
        'Accept: application/json',
        'User-Agent: IntelLine/1.0'
    ],
    $payload,
    false
);

if ($code !== 200) {
    http_response_code(502);
    exit(json_encode(['error' => 'GigaChat API error', 'detail' => $body ?: $err]));
}

$data = json_decode($body, true);
$text = $data['choices'][0]['message']['content'] ?? 'Извините, не удалось сформировать ответ.';

echo json_encode(['reply' => $text]);
