<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Core\Response;
use App\Repositories\SessionRepository;

final class AuthGuard
{
    public static function bearerToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['Authorization'] ?? '';
        if (!is_string($header) || $header === '') {
            return null;
        }

        if (preg_match('/Bearer\s+(\S+)/i', $header, $matches) !== 1) {
            return null;
        }

        return $matches[1];
    }

    /** @return array<string, mixed> */
    public static function requireUser(SessionRepository $sessions): array
    {
        $token = self::bearerToken();
        if ($token === null || $token === '') {
            Response::json(['message' => 'No autenticado'], 401);
            exit;
        }

        $user = $sessions->findUserByPlainToken($token);
        if ($user === null) {
            Response::json(['message' => 'Token inválido o caducado'], 401);
            exit;
        }

        return $user;
    }

    /** @return array<string, mixed> */
    public static function requireAdmin(SessionRepository $sessions): array
    {
        $user = self::requireUser($sessions);
        if (($user['rol'] ?? '') !== 'admin') {
            Response::json(['message' => 'No autorizado'], 403);
            exit;
        }

        return $user;
    }
}
