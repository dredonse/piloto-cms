<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Database;
use App\Core\Response;
use Throwable;

final class StatsController
{
    public function usersCount(): void
    {
        try {
            $statement = Database::connection()->query('SELECT COUNT(*) AS total FROM users');
            $result = $statement->fetch();
            $total = isset($result['total']) ? (int) $result['total'] : 0;

            Response::json(['users_count' => $total]);
        } catch (Throwable $exception) {
            Response::json(['message' => 'No se pudo obtener la métrica de usuarios'], 500);
        }
    }
}
