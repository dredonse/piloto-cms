<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;
use PDO;

final class UserRepository
{
    public function findByEmail(string $email): ?array
    {
        $statement = Database::connection()->prepare(
            'SELECT id, nombre, email, password_hash, google_id, rol, created_at FROM users WHERE email = :email LIMIT 1'
        );
        $statement->execute(['email' => self::normalizeEmail($email)]);
        $row = $statement->fetch(PDO::FETCH_ASSOC);

        return $row === false ? null : $row;
    }

    /** @return array<string, mixed>|null */
    public function findById(int $id): ?array
    {
        $statement = Database::connection()->prepare(
            'SELECT id, nombre, email, password_hash, google_id, rol, created_at FROM users WHERE id = :id LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $row = $statement->fetch(PDO::FETCH_ASSOC);

        return $row === false ? null : $row;
    }

    /** @return array<string, mixed>|null */
    public function findByGoogleId(string $googleId): ?array
    {
        $statement = Database::connection()->prepare(
            'SELECT id, nombre, email, password_hash, google_id, rol, created_at FROM users WHERE google_id = :google_id LIMIT 1'
        );
        $statement->execute(['google_id' => $googleId]);
        $row = $statement->fetch(PDO::FETCH_ASSOC);

        return $row === false ? null : $row;
    }

    public function linkGoogleId(int $userId, string $googleId): void
    {
        $statement = Database::connection()->prepare(
            'UPDATE users SET google_id = :google_id WHERE id = :id'
        );
        $statement->execute([
            'google_id' => $googleId,
            'id' => $userId,
        ]);
    }

    /**
     * @return array{id: int, nombre: string, email: string, rol: string, created_at: string}
     */
    public function createFromGoogle(string $nombre, string $email, string $googleId): array
    {
        $pdo = Database::connection();
        $statement = $pdo->prepare(
            'INSERT INTO users (nombre, email, password_hash, google_id, rol) VALUES (:nombre, :email, NULL, :google_id, :rol)'
        );
        $statement->execute([
            'nombre' => $nombre,
            'email' => self::normalizeEmail($email),
            'google_id' => $googleId,
            'rol' => 'user',
        ]);

        $id = (int) $pdo->lastInsertId();
        $created = $this->findById($id);

        return [
            'id' => $id,
            'nombre' => (string) ($created['nombre'] ?? $nombre),
            'email' => (string) ($created['email'] ?? self::normalizeEmail($email)),
            'rol' => (string) ($created['rol'] ?? 'user'),
            'created_at' => (string) ($created['created_at'] ?? ''),
        ];
    }

    /**
     * @return array{id: int, nombre: string, email: string, rol: string, created_at: string}
     */
    public function create(string $nombre, string $email, string $passwordHash): array
    {
        return $this->createWithRole($nombre, $email, $passwordHash, 'user');
    }

    /**
     * @return array{id: int, nombre: string, email: string, rol: string, created_at: string}
     */
    public function createWithRole(string $nombre, string $email, string $passwordHash, string $rol): array
    {
        $rol = $rol === 'admin' ? 'admin' : 'user';
        $pdo = Database::connection();
        $statement = $pdo->prepare(
            'INSERT INTO users (nombre, email, password_hash, rol) VALUES (:nombre, :email, :password_hash, :rol)'
        );
        $statement->execute([
            'nombre' => $nombre,
            'email' => self::normalizeEmail($email),
            'password_hash' => $passwordHash,
            'rol' => $rol,
        ]);

        $id = (int) $pdo->lastInsertId();
        $created = $this->findById($id);

        return [
            'id' => $id,
            'nombre' => (string) ($created['nombre'] ?? $nombre),
            'email' => (string) ($created['email'] ?? self::normalizeEmail($email)),
            'rol' => (string) ($created['rol'] ?? $rol),
            'created_at' => (string) ($created['created_at'] ?? ''),
        ];
    }

    /** @return list<array<string, mixed>> */
    public function listAllPublic(): array
    {
        $statement = Database::connection()->query(
            'SELECT id, nombre, email, rol, created_at FROM users ORDER BY id ASC'
        );

        /** @var list<array<string, mixed>> */
        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }

    public function deleteById(int $id): void
    {
        $statement = Database::connection()->prepare('DELETE FROM users WHERE id = :id');
        $statement->execute(['id' => $id]);
    }

    public function countAdmins(): int
    {
        $statement = Database::connection()->query(
            "SELECT COUNT(*) AS total FROM users WHERE rol = 'admin'"
        );
        $row = $statement->fetch(PDO::FETCH_ASSOC);

        return isset($row['total']) ? (int) $row['total'] : 0;
    }

    public function emailExistsExcept(string $email, int $exceptUserId): bool
    {
        $statement = Database::connection()->prepare(
            'SELECT id FROM users WHERE email = :email AND id != :id LIMIT 1'
        );
        $statement->execute([
            'email' => self::normalizeEmail($email),
            'id' => $exceptUserId,
        ]);

        return $statement->fetch(PDO::FETCH_ASSOC) !== false;
    }

    /**
     * @param array{nombre?: string, email?: string, rol?: string, password_hash?: string} $fields
     */
    public function updateUser(int $id, array $fields): void
    {
        $allowed = ['nombre', 'email', 'rol', 'password_hash'];
        $sets = [];
        $params = ['id' => $id];

        foreach ($allowed as $column) {
            if (!array_key_exists($column, $fields)) {
                continue;
            }

            $sets[] = $column . ' = :' . $column;
            $value = $fields[$column];
            if ($column === 'email' && is_string($value)) {
                $value = self::normalizeEmail($value);
            }

            if ($column === 'rol' && is_string($value)) {
                $value = $value === 'admin' ? 'admin' : 'user';
            }

            $params[$column] = $value;
        }

        if ($sets === []) {
            return;
        }

        $sql = 'UPDATE users SET ' . implode(', ', $sets) . ' WHERE id = :id';
        $statement = Database::connection()->prepare($sql);
        $statement->execute($params);
    }

    public function updatePasswordHash(int $userId, string $passwordHash): void
    {
        $statement = Database::connection()->prepare(
            'UPDATE users SET password_hash = :password_hash WHERE id = :id'
        );
        $statement->execute([
            'password_hash' => $passwordHash,
            'id' => $userId,
        ]);
    }

    private static function normalizeEmail(string $email): string
    {
        return strtolower(trim($email));
    }
}
