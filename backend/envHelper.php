<?php

function loadEnvironmentVariables($filePath) {
    if (!file_exists($filePath)) {
        throw new Exception("Environment file not found: " . $filePath);
    }

    $envVars = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($envVars as $envVar) {
        if (strpos(trim($envVar), '#') === 0) {
            continue; // Skip comments
        }
        list($key, $value) = explode('=', $envVar, 2);
        $key = trim($key);
        $value = trim($value);

        // Remove surrounding quotes which are common in .env files
        $value = trim($value, "\"'");

        if (!putenv("$key=$value")) {
            throw new Exception("Failed to set environment variable: $key");
        }
    }
}


?>