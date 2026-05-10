<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Middleware\AuthGuard;
use App\Repositories\SessionRepository;
use App\Services\AuthService;

final class AuthController
{
    public function __construct(
        private readonly AuthService $auth,
        private readonly SessionRepository $sessions
    ) {
    }

    public function register(): void
    {
        $result = $this->auth->register(Request::jsonBody());
        if (isset($result['error'])) {
            Response::json(['message' => $result['error']], $result['code']);
            return;
        }

        Response::json([
            'user' => $result['user'],
            'token' => $result['token'],
        ], 201);
    }

    public function login(): void
    {
        $result = $this->auth->login(Request::jsonBody());
        if (isset($result['error'])) {
            Response::json(['message' => $result['error']], $result['code']);
            return;
        }

        Response::json([
            'user' => $result['user'],
            'token' => $result['token'],
        ]);
    }

    public function google(): void
    {
        $result = $this->auth->loginWithGoogle(Request::jsonBody());
        if (isset($result['error'])) {
            Response::json(['message' => $result['error']], $result['code']);
            return;
        }

        Response::json([
            'user' => $result['user'],
            'token' => $result['token'],
        ]);
    }

    public function forgotPassword(): void
    {
        $result = $this->auth->requestPasswordReset(Request::jsonBody());
        if (isset($result['error'])) {
            Response::json(['message' => $result['error']], $result['code']);
            return;
        }

        Response::json($result);
    }

    public function resetPassword(): void
    {
        $result = $this->auth->completePasswordReset(Request::jsonBody());
        if (isset($result['error'])) {
            Response::json(['message' => $result['error']], $result['code']);
            return;
        }

        Response::json(['message' => $result['message']]);
    }

    public function me(): void
    {
        $user = AuthGuard::requireUser($this->sessions);
        Response::json(['user' => $user]);
    }

    public function changePassword(): void
    {
        $user = AuthGuard::requireUser($this->sessions);
        $userId = (int) $user['id'];
        $result = $this->auth->changePassword($userId, Request::jsonBody());
        if (isset($result['error'])) {
            Response::json(['message' => $result['error']], $result['code']);
            return;
        }

        Response::json(['message' => $result['message']]);
    }
}
