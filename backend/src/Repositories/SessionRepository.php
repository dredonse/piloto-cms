<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;
use PDO;

final class SessionRepository
{
    private const TOKEN_BYTES = 32;

    public function __construct(
        private readonly int $ttlDays = 7
    ) {
    }

    public static function fromEnv(): self
    {
        $days = (int) (getenv('AUTH_TOKEN_TTL_DAYS') ?: '7');

        return new self($days > 0 ? $days : 7);
    }

    /** Genera token opaco y lo guarda hasheado; devuelve el token en claro para el cliente. */
    public function createTokenForUser(int $userId): string
    {
        $plain = bin2hex(random_bytes(self::TOKEN_BYTES));
        $hash = hash('sha256', $plain);
        $expiresAt = (new \DateTimeImmutable('now'))->modify('+' . $this->ttlDays . ' days')->format('Y-m-d H:i:s');

        $statement = Database::connection()->prepare(
            'INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (:user_id, :token_hash, :expires_at)'
        );
        $statement->execute([
            'user_id' => $userId,
            'token_hash' => $hash,
            'expires_at' => $expiresAt,
        ]);

        return $plain;
    }

    /** @return array<string, mixed>|null Fila de usuario (sin password_hash en el resultado final lo hace el caller o aquí) */
    public function findUserByPlainToken(string $plainToken): ?array
    {
        $hash = hash('sha256', $plainToken);

        $sql = <<<'SQL'
SELECT u.id, u.nombre, u.email, u.rol, u.created_at
FROM user_sessions s
INNER JOIN users u ON u.id = s.user_id
WHERE s.token_hash = :token_hash AND s.expires_at > NOW()
LIMIT 1
SQL;

        $statement = Database::connection()->prepare($sql);
        $statement->execute(['token_hash' => $hash]);
        $row = $statement->fetch(PDO::FETCH_ASSOC);

        return $row === false ? null : $row;
    }

    public function revokeAllForUser(int $userId): void
    {
        $statement = Database::connection()->prepare('DELETE FROM user_sessions WHERE user_id = :user_id');
        $statement->execute(['user_id' => $userId]);
    }
}
