<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /');
    exit;
}

$to = 'alexkruppy@yandex.ru';
$cc = 'sales@intelline.ru';
$subject = 'IntelLine — заявка с сайта';

$name = htmlspecialchars($_POST['Имя'] ?? '', ENT_QUOTES, 'UTF-8');
$phone = htmlspecialchars($_POST['Телефон'] ?? '', ENT_QUOTES, 'UTF-8');
$email = htmlspecialchars($_POST['E-mail'] ?? '', ENT_QUOTES, 'UTF-8');
$company = htmlspecialchars($_POST['Компания'] ?? '', ENT_QUOTES, 'UTF-8');
$industry = htmlspecialchars($_POST['Отрасль'] ?? '', ENT_QUOTES, 'UTF-8');
$task = htmlspecialchars($_POST['Задача'] ?? '', ENT_QUOTES, 'UTF-8');

$body = "Имя: $name\n";
$body .= "Телефон: $phone\n";
$body .= "E-mail: $email\n";
$body .= "Компания: $company\n";
$body .= "Отрасль: $industry\n";
$body .= "Задача:\n$task\n";

$headers = "From: no-reply@intelline.ru\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Cc: $cc\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

mail($to, $subject, $body, $headers);

header('Location: /?success=1');
exit;
