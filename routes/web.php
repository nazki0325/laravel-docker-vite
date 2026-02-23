<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::domain('env2.local.nazki0325.net')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Welcome');
    })->name('home');
});

Route::domain('sub1.env2.local.nazki0325.net')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Welcome-sub1');
    });
});

Route::domain('sub2.env2.local.nazki0325.net')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Welcome-sub2');
    });
});
