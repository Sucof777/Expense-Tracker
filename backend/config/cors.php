<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Laravel CORS Configuration
    |--------------------------------------------------------------------------
    |
    | Ovaj fajl definiše CORS podešavanja za tvoju aplikaciju.
    | Pošto koristiš Angular (http://localhost:4200) i Sanctum,
    | potrebno je da omogućiš credentials i da preciziraš origin.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // Dozvoli sve HTTP metode (GET, POST, PUT, DELETE...)
    'allowed_methods' => ['*'],

    // Angular dev server
    'allowed_origins' => ['http://localhost:4200', 'http://127.0.0.1:4200'],

    'allowed_origins_patterns' => [],

    // Dozvoli sve headere
    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // ⚡ bitno za Sanctum (cookies)
    'supports_credentials' => true,
];
