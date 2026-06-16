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

$geminiKey = getenv('GEMINI_API_KEY');
if (!$geminiKey && file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), 'GEMINI_API_KEY=') === 0) {
            $geminiKey = trim(substr($line, 15));
            break;
        }
    }
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

$contents = [['role' => 'user', 'parts' => [['text' => $message]]]];

$payload = [
    'contents' => $contents,
    'systemInstruction' => ['parts' => [['text' => $systemPrompt]]],
    'generationConfig' => [
        'temperature' => 0.7,
        'maxOutputTokens' => 500
    ]
];

$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$geminiKey";

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30
]);

$resp = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code(502);
    exit(json_encode(['error' => 'AI service error', 'detail' => $resp]));
}

$data = json_decode($resp, true);
$text = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Извините, не удалось сформировать ответ.';

echo json_encode(['reply' => $text]);
