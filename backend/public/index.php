<?php

declare(strict_types=1);

require __DIR__ . '/../config/bootstrap.php';

use App\Core\Cors;
use App\Controllers\AuthController;
use App\Controllers\HealthController;
use App\Controllers\StatsController;
use App\Controllers\UsersController;
use App\Core\Router;
use App\Repositories\PasswordResetRepository;
use App\Repositories\SessionRepository;
use App\Repositories\UserRepository;
use App\Services\AuthService;

Cors::applyIfDev();

$router = new Router();
$healthController = new HealthController();
$statsController = new StatsController();

$sessions = SessionRepository::fromEnv();
$authService = new AuthService(new UserRepository(), $sessions, new PasswordResetRepository());
$authController = new AuthController($authService, $sessions);
$usersController = new UsersController(new UserRepository(), $sessions);

$router->get('/api/health', [$healthController, '__invoke']);
$router->get('/api/stats/users-count', [$statsController, 'usersCount']);

$router->post('/api/auth/register', [$authController, 'register']);
$router->post('/api/auth/login', [$authController, 'login']);
$router->post('/api/auth/google', [$authController, 'google']);
$router->post('/api/auth/forgot-password', [$authController, 'forgotPassword']);
$router->post('/api/auth/reset-password', [$authController, 'resetPassword']);

$router->get('/api/me', [$authController, 'me']);
$router->put('/api/me/password', [$authController, 'changePassword']);

$router->get('/api/users', [$usersController, 'index']);
$router->post('/api/users', [$usersController, 'store']);
$router->put('/api/users/{id}', static function (array $params) use ($usersController): void {
    $usersController->update($params);
});
$router->delete('/api/users/{id}', static function (array $params) use ($usersController): void {
    $usersController->destroy($params);
});

$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
