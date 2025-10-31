<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // 🚩 Isključi CSRF provjeru za sve API rute (možeš suziti na login/register)
        $middleware->validateCsrfTokens(except: [
            'api/auth/login',
            'api/auth/register',
            'api/auth/logout',
        ]);

        // Ako hoćeš dodatne stvari:
        // $middleware->trustProxies();
        // $middleware->web(append: [\Illuminate\Session\Middleware\AuthenticateSession::class]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();
