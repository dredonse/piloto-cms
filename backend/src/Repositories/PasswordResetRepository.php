<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;
use DateTimeImmutable;
use PDO;

final class PasswordResetRepository
{
    public function deleteByEmail(string $email): void
    {
        $statement = Database::connection()->prepare('DELETE FROM password_resets WHERE email = :email');
        $statement->execute(['email' => self::normalizeEmail($email)]);
    }

    public function create(string $email, string $tokenHash, DateTimeImmutable $expiresAt): void
    {
        $statement = Database::connection()->prepare(
            'INSERT INTO password_resets (email, token, expires_at) VALUES (:email, :token, :expires_at)'
        );
        $statement->execute([
            'email' => self::normalizeEmail($email),
            'token' => $tokenHash,
            'expires_at' => $expiresAt->format('Y-m-d H:i:s'),
        ]);
    }

    /** @return array{email: string}|null */
    public function findValidByTokenHash(string $tokenHash): ?array
    {
        $statement = Database::connection()->prepare(
            'SELECT email FROM password_resets WHERE token = :token AND expires_at > NOW() LIMIT 1'
        );
        $statement->execute(['token' => $tokenHash]);
        $row = $statement->fetch(PDO::FETCH_ASSOC);

        return $row === false ? null : ['email' => (string) $row['email']];
    }

    private static function normalizeEmail(string $email): string
    {
        return strtolower(trim($email));
    }
}
