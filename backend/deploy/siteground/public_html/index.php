<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Expected SiteGround layout:
// website-root/backend       <- complete Laravel project
// website-root/public_html   <- this file and public/.htaccess
if (file_exists($maintenance = __DIR__.'/../backend/storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../backend/vendor/autoload.php';

/** @var Application $app */
$app = require_once __DIR__.'/../backend/bootstrap/app.php';

$app->handleRequest(Request::capture());
