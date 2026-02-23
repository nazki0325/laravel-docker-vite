<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::domain('env-sample.nazki0325.net')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Welcome');
    })->name('home');
});

Route::domain('v1.env-sample.nazki0325.net')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Welcome-v1');
    });
});

Route::domain('v2.env-sample.nazki0325.net')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Welcome-v2');
    });
});
