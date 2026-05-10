<?php

declare(strict_types=1);

namespace App\Services;

/**
 * Verificación del id_token de Google (flujo web GIS).
 * Usa el endpoint tokeninfo (adecuado para piloto; en producción conviene validar JWT con JWKS).
 */
final class GoogleIdTokenVerifier
{
    /**
     * @return array<string, mixed>|null reclamaciones mínimas: sub, email, name, given_name, email_verified
     */
    public static function verify(string $idToken, string $expectedClientId): ?array
    {
        if ($expectedClientId === '' || $idToken === '') {
            return null;
        }

        $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . rawurlencode($idToken);
        $context = stream_context_create([
            'http' => [
                'timeout' => 8,
                'ignore_errors' => true,
            ],
        ]);

        $raw = @file_get_contents($url, false, $context);
        if ($raw === false || $raw === '') {
            return null;
        }

        /** @var mixed $data */
        $data = json_decode($raw, true);
        if (!is_array($data) || isset($data['error'])) {
            return null;
        }

        if (($data['aud'] ?? '') !== $expectedClientId) {
            return null;
        }

        $iss = (string) ($data['iss'] ?? '');
        if ($iss !== 'https://accounts.google.com' && $iss !== 'accounts.google.com') {
            return null;
        }

        $sub = (string) ($data['sub'] ?? '');
        $email = (string) ($data['email'] ?? '');
        if ($sub === '' || $email === '') {
            return null;
        }

        $exp = isset($data['exp']) ? (int) $data['exp'] : 0;
        if ($exp > 0 && $exp < time()) {
            return null;
        }

        $verified = $data['email_verified'] ?? false;
        if ($verified === 'false' || $verified === false || $verified === '0' || $verified === 0) {
            return null;
        }

        return $data;
    }
}
