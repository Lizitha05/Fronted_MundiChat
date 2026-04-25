<?php
session_start();
$page = 'index';

$currentPage = $_SERVER['REQUEST_URI'];

require 'view/index.view.php';
