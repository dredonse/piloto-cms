<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Cabeceras CORS en entorno local / debug para poder consumir la API desde otro origen (Live Server, etc.).
 */
final class Cors
{
    public static function applyIfDev(): void
    {
        $debug = filter_var(getenv('APP_DEBUG') ?: '', FILTER_VALIDATE_BOOLEAN);
        $env = getenv('APP_ENV') ?: 'production';
        $local = in_array($env, ['local', 'development'], true);

        if (!$debug && !$local) {
            return;
        }

        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
