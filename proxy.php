<?php
// proxy.php - Local CORS proxy for fetching Nefertari trips reliably
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if (!isset($_GET['url'])) {
    http_response_code(400);
    echo "URL parameter is required.";
    exit;
}

$url = $_GET['url'];

// Basic security: only allow Nefertari URLs
if (strpos($url, 'nefertaritravel.com.mx') === false) {
    http_response_code(403);
    echo "URL not allowed.";
    exit;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
// Set a fast timeout so it doesn't hang indefinitely
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo curl_error($ch);
} else {
    http_response_code($httpCode);
    echo $response;
}

curl_close($ch);
?>
