<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Middleware\AuthGuard;
use App\Repositories\SessionRepository;
use App\Repositories\UserRepository;

final class UsersController
{
    public function __construct(
        private readonly UserRepository $users,
        private readonly SessionRepository $sessions
    ) {
    }

    public function index(): void
    {
        AuthGuard::requireAdmin($this->sessions);
        Response::json(['users' => $this->users->listAllPublic()]);
    }

    public function store(): void
    {
        AuthGuard::requireAdmin($this->sessions);
        $body = Request::jsonBody();

        $nombre = isset($body['nombre']) ? trim((string) $body['nombre']) : '';
        $email = isset($body['email']) ? trim((string) $body['email']) : '';
        $password = isset($body['password']) ? (string) $body['password'] : '';
        $rol = isset($body['rol']) ? trim((string) $body['rol']) : 'user';

        if ($nombre === '' || $email === '' || $password === '') {
            Response::json(['message' => 'nombre, email y password son obligatorios'], 400);
            return;
        }

        if (strlen($password) < 8) {
            Response::json(['message' => 'La contraseña debe tener al menos 8 caracteres'], 400);
            return;
        }

        if ($rol !== 'admin' && $rol !== 'user') {
            Response::json(['message' => 'rol debe ser admin o user'], 400);
            return;
        }

        if ($this->users->findByEmail($email) !== null) {
            Response::json(['message' => 'El email ya está registrado'], 409);
            return;
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $created = $this->users->createWithRole($nombre, $email, $hash, $rol);

        Response::json(['user' => $this->publicUser($created)], 201);
    }

    /** @param array<string, string> $params */
    public function update(array $params): void
    {
        $admin = AuthGuard::requireAdmin($this->sessions);
        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            Response::json(['message' => 'Identificador inválido'], 400);
            return;
        }

        $existing = $this->users->findById($id);
        if ($existing === null) {
            Response::json(['message' => 'Usuario no encontrado'], 404);
            return;
        }

        $body = Request::jsonBody();
        $fields = [];

        if (array_key_exists('nombre', $body)) {
            $nombre = trim((string) $body['nombre']);
            if ($nombre === '') {
                Response::json(['message' => 'nombre no puede estar vacío'], 400);
                return;
            }

            $fields['nombre'] = $nombre;
        }

        if (array_key_exists('email', $body)) {
            $email = trim((string) $body['email']);
            if ($email === '') {
                Response::json(['message' => 'email no puede estar vacío'], 400);
                return;
            }

            if ($this->users->emailExistsExcept($email, $id)) {
                Response::json(['message' => 'El email ya está en uso'], 409);
                return;
            }

            $fields['email'] = $email;
        }

        if (array_key_exists('rol', $body)) {
            $rol = trim((string) $body['rol']);
            if ($rol !== 'admin' && $rol !== 'user') {
                Response::json(['message' => 'rol debe ser admin o user'], 400);
                return;
            }

            if ((int) $admin['id'] === $id && $rol === 'user' && (string) $existing['rol'] === 'admin' && $this->users->countAdmins() <= 1) {
                Response::json(['message' => 'No puedes dejar el sistema sin administradores'], 422);
                return;
            }

            $fields['rol'] = $rol;
        }

        if (array_key_exists('password', $body)) {
            $password = (string) $body['password'];
            if ($password !== '' && strlen($password) < 8) {
                Response::json(['message' => 'La contraseña debe tener al menos 8 caracteres'], 400);
                return;
            }

            if ($password !== '') {
                $fields['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
            }
        }

        if ($fields === []) {
            Response::json(['message' => 'No hay campos para actualizar'], 400);
            return;
        }

        $this->users->updateUser($id, $fields);

        if (array_key_exists('password_hash', $fields) || array_key_exists('rol', $fields)) {
            $this->sessions->revokeAllForUser($id);
        }

        $updated = $this->users->findById($id);
        if ($updated === null) {
            Response::json(['message' => 'Usuario no encontrado'], 404);
            return;
        }

        Response::json(['user' => $this->publicUserFromRow($updated)]);
    }

    /** @param array<string, string> $params */
    public function destroy(array $params): void
    {
        $admin = AuthGuard::requireAdmin($this->sessions);
        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            Response::json(['message' => 'Identificador inválido'], 400);
            return;
        }

        if ((int) $admin['id'] === $id) {
            Response::json(['message' => 'No puedes eliminar tu propio usuario'], 400);
            return;
        }

        $existing = $this->users->findById($id);
        if ($existing === null) {
            Response::json(['message' => 'Usuario no encontrado'], 404);
            return;
        }

        if ((string) $existing['rol'] === 'admin' && $this->users->countAdmins() <= 1) {
            Response::json(['message' => 'No puedes eliminar el último administrador'], 422);
            return;
        }

        $this->users->deleteById($id);
        Response::json(['message' => 'Usuario eliminado']);
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

    /** @param array<string, mixed> $row */
    private function publicUserFromRow(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'nombre' => (string) $row['nombre'],
            'email' => (string) $row['email'],
            'rol' => (string) $row['rol'],
            'created_at' => (string) $row['created_at'],
        ];
    }
}
