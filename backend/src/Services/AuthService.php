<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\PasswordResetRepository;
use App\Repositories\SessionRepository;
use App\Repositories\UserRepository;
use DateInterval;
use DateTimeImmutable;

final class AuthService
{
    public function __construct(
        private readonly UserRepository $users,
        private readonly SessionRepository $sessions,
        private readonly PasswordResetRepository $passwordResets
    ) {
    }

    public static function withDefaults(): self
    {
        return new self(new UserRepository(), SessionRepository::fromEnv(), new PasswordResetRepository());
    }

    /**
     * @param array<string, mixed> $body
     * @return array{user: array<string, mixed>, token: string}|array{error: string, code: int}
     */
    public function register(array $body): array
    {
        $nombre = isset($body['nombre']) ? trim((string) $body['nombre']) : '';
        $email = isset($body['email']) ? trim((string) $body['email']) : '';
        $password = isset($body['password']) ? (string) $body['password'] : '';

        if ($nombre === '' || $email === '' || $password === '') {
            return ['error' => 'nombre, email y password son obligatorios', 'code' => 400];
        }

        if (strlen($password) < 8) {
            return ['error' => 'La contraseña debe tener al menos 8 caracteres', 'code' => 400];
        }

        if ($this->users->findByEmail($email) !== null) {
            return ['error' => 'El email ya está registrado', 'code' => 409];
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $user = $this->users->create($nombre, $email, $hash);
        $token = $this->sessions->createTokenForUser($user['id']);

        return [
            'user' => $this->publicUser($user),
            'token' => $token,
        ];
    }

    /**
     * @param array<string, mixed> $body
     * @return array{user: array<string, mixed>, token: string}|array{error: string, code: int}
     */
    public function login(array $body): array
    {
        $email = isset($body['email']) ? trim((string) $body['email']) : '';
        $password = isset($body['password']) ? (string) $body['password'] : '';

        if ($email === '' || $password === '') {
            return ['error' => 'email y password son obligatorios', 'code' => 400];
        }

        $row = $this->users->findByEmail($email);
        if ($row === null) {
            return ['error' => 'Credenciales incorrectas', 'code' => 401];
        }

        $stored = $row['password_hash'] ?? null;
        if (!is_string($stored) || $stored === '' || !password_verify($password, $stored)) {
            return ['error' => 'Credenciales incorrectas', 'code' => 401];
        }

        return $this->issueSessionFromUserRow($row);
    }

    /**
     * @param array<string, mixed> $body
     * @return array{user: array<string, mixed>, token: string}|array{error: string, code: int}
     */
    public function loginWithGoogle(array $body): array
    {
        $idToken = isset($body['id_token']) ? trim((string) $body['id_token']) : '';
        if ($idToken === '') {
            return ['error' => 'id_token es obligatorio', 'code' => 400];
        }

        $clientId = (string) (getenv('GOOGLE_CLIENT_ID') ?: '');
        if ($clientId === '') {
            return ['error' => 'Google OAuth no está configurado (GOOGLE_CLIENT_ID)', 'code' => 503];
        }

        $claims = GoogleIdTokenVerifier::verify($idToken, $clientId);
        if ($claims === null) {
            return ['error' => 'Token de Google inválido o no verificado', 'code' => 401];
        }

        $sub = (string) $claims['sub'];
        $email = strtolower(trim((string) $claims['email']));
        $nombre = trim((string) ($claims['name'] ?? $claims['given_name'] ?? ''));
        if ($nombre === '') {
            $parts = explode('@', $email);
            $nombre = $parts[0] !== '' ? $parts[0] : 'Usuario';
        }

        $byGoogle = $this->users->findByGoogleId($sub);
        if ($byGoogle !== null) {
            return $this->issueSessionFromUserRow($byGoogle);
        }

        $byEmail = $this->users->findByEmail($email);
        if ($byEmail !== null) {
            $existingGid = $byEmail['google_id'] ?? null;
            if (is_string($existingGid) && $existingGid !== '' && $existingGid !== $sub) {
                return ['error' => 'Este email ya está vinculado a otra cuenta de Google', 'code' => 409];
            }

            if ($existingGid === null || $existingGid === '') {
                $this->users->linkGoogleId((int) $byEmail['id'], $sub);
                $updated = $this->users->findById((int) $byEmail['id']);
                if ($updated === null) {
                    return ['error' => 'No se pudo vincular la cuenta', 'code' => 500];
                }

                return $this->issueSessionFromUserRow($updated);
            }

            return $this->issueSessionFromUserRow($byEmail);
        }

        $created = $this->users->createFromGoogle($nombre, $email, $sub);
        $full = $this->users->findById($created['id']);
        if ($full === null) {
            return ['error' => 'No se pudo crear el usuario', 'code' => 500];
        }

        return $this->issueSessionFromUserRow($full);
    }

    /** @param array<string, mixed> $row fila users */
    private function issueSessionFromUserRow(array $row): array
    {
        $userId = (int) $row['id'];
        $token = $this->sessions->createTokenForUser($userId);

        return [
            'user' => $this->publicUser([
                'id' => $userId,
                'nombre' => (string) $row['nombre'],
                'email' => (string) $row['email'],
                'rol' => (string) $row['rol'],
                'created_at' => (string) $row['created_at'],
            ]),
            'token' => $token,
        ];
    }

    /**
     * @param array<string, mixed> $body
     * @return array{message: string}|array{error: string, code: int}
     */
    public function changePassword(int $userId, array $body): array
    {
        $current = isset($body['current_password']) ? (string) $body['current_password'] : '';
        $next = isset($body['new_password']) ? (string) $body['new_password'] : '';

        if ($current === '' || $next === '') {
            return ['error' => 'current_password y new_password son obligatorios', 'code' => 400];
        }

        if (strlen($next) < 8) {
            return ['error' => 'La nueva contraseña debe tener al menos 8 caracteres', 'code' => 400];
        }

        $row = $this->users->findById($userId);
        if ($row === null) {
            return ['error' => 'Usuario no encontrado', 'code' => 404];
        }

        $stored = $row['password_hash'] ?? null;
        if (!is_string($stored) || $stored === '' || !password_verify($current, $stored)) {
            return ['error' => 'La contraseña actual no es correcta', 'code' => 422];
        }

        $this->users->updatePasswordHash($userId, password_hash($next, PASSWORD_DEFAULT));
        $this->sessions->revokeAllForUser($userId);

        return ['message' => 'Contraseña actualizada'];
    }

    /**
     * Solicitud de recuperación: crea token en password_resets. Respuesta genérica siempre que el email sea válido en formato.
     *
     * @param array<string, mixed> $body
     * @return array<string, mixed>|array{error: string, code: int}
     */
    public function requestPasswordReset(array $body): array
    {
        $email = isset($body['email']) ? trim((string) $body['email']) : '';
        if ($email === '') {
            return ['error' => 'email es obligatorio', 'code' => 400];
        }

        $user = $this->users->findByEmail($email);
        $message = 'Si existe una cuenta con ese email, recibirás instrucciones para restablecer la contraseña.';

        if ($user === null) {
            return ['message' => $message];
        }

        $plain = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $plain);
        $minutes = (int) (getenv('PASSWORD_RESET_TTL_MINUTES') ?: '60');
        if ($minutes < 5) {
            $minutes = 60;
        }

        $expires = (new DateTimeImmutable('now'))->add(new DateInterval('PT' . $minutes . 'M'));
        $userEmail = (string) $user['email'];

        $this->passwordResets->deleteByEmail($userEmail);
        $this->passwordResets->create($userEmail, $tokenHash, $expires);

        $out = ['message' => $message];
        if (filter_var(getenv('APP_DEBUG') ?: '', FILTER_VALIDATE_BOOLEAN)) {
            $out['debug_reset_token'] = $plain;
            $out['debug_note'] = 'Solo en APP_DEBUG: en producción enviarías este valor por email, nunca en JSON.';
        }

        return $out;
    }

    /**
     * @param array<string, mixed> $body
     * @return array{message: string}|array{error: string, code: int}
     */
    public function completePasswordReset(array $body): array
    {
        $token = isset($body['token']) ? trim((string) $body['token']) : '';
        $password = isset($body['password']) ? (string) $body['password'] : '';

        if ($token === '' || $password === '') {
            return ['error' => 'token y password son obligatorios', 'code' => 400];
        }

        if (strlen($password) < 8) {
            return ['error' => 'La contraseña debe tener al menos 8 caracteres', 'code' => 400];
        }

        $tokenHash = hash('sha256', $token);
        $row = $this->passwordResets->findValidByTokenHash($tokenHash);
        if ($row === null) {
            return ['error' => 'Token inválido o caducado', 'code' => 401];
        }

        $user = $this->users->findByEmail($row['email']);
        if ($user === null) {
            return ['error' => 'Usuario no encontrado', 'code' => 404];
        }

        $userId = (int) $user['id'];
        $this->users->updatePasswordHash($userId, password_hash($password, PASSWORD_DEFAULT));
        $this->sessions->revokeAllForUser($userId);
        $this->passwordResets->deleteByEmail($row['email']);

        return ['message' => 'Contraseña restablecida. Puedes iniciar sesión.'];
    }

    /** @param array<string, mixed> $user */
    private function publicUser(array $user): array
    {
        return [
            'id' => (int) $user['id'],
            'nombre' => (string) $user['nombre'],
            'email' => (string) $user['email'],
            'rol' => (string) $user['rol'],
            'created_at' => (string) $user['created_at'],
        ];
    }
}
