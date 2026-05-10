<?php

declare(strict_types=1);

namespace App\Core;

final class Router
{
    /** @var array<string, array<string, callable>> */
    private array $routes = [];

    /**
     * @var array<string, list<array{regex: string, names: list<string>, handler: callable}>>
     */
    private array $dynamicRoutes = [];

    public function get(string $path, callable $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, callable $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    public function put(string $path, callable $handler): void
    {
        $this->addRoute('PUT', $path, $handler);
    }

    public function delete(string $path, callable $handler): void
    {
        $this->addRoute('DELETE', $path, $handler);
    }

    private function addRoute(string $method, string $path, callable $handler): void
    {
        if (str_contains($path, '{')) {
            $compiled = self::compilePattern($path);
            $this->dynamicRoutes[$method][] = [
                'regex' => $compiled['regex'],
                'names' => $compiled['names'],
                'handler' => $handler,
            ];
            return;
        }

        $this->routes[$method][$path] = $handler;
    }

    /**
     * @return array{regex: string, names: list<string>}
     */
    private static function compilePattern(string $template): array
    {
        $names = [];
        $parts = [];
        foreach (explode('/', trim($template, '/')) as $segment) {
            if ($segment === '') {
                continue;
            }

            if (preg_match('/^\{(\w+)\}$/', $segment, $match) === 1) {
                $names[] = $match[1];
                $parts[] = '(?P<' . $match[1] . '>\d+)';
                continue;
            }

            $parts[] = preg_quote($segment, '#');
        }

        $regex = '#^/' . implode('/', $parts) . '$#';

        return ['regex' => $regex, 'names' => $names];
    }

    public function dispatch(string $method, string $uri): void
    {
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';

        $handler = $this->routes[$method][$path] ?? null;
        if ($handler) {
            $handler();
            return;
        }

        foreach ($this->dynamicRoutes[$method] ?? [] as $route) {
            if (preg_match($route['regex'], $path, $matches) !== 1) {
                continue;
            }

            $params = [];
            foreach ($route['names'] as $name) {
                if (!isset($matches[$name])) {
                    continue;
                }

                $params[$name] = $matches[$name];
            }

            ($route['handler'])($params);
            return;
        }

        Response::json(['message' => 'Ruta no encontrada'], 404);
    }
}
