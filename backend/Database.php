<?php

require_once 'envHelper.php';

try {
    loadEnvironmentVariables(__DIR__ . '/.env');
} catch (Exception $e) {
    die('Error loading the .env file: ' . $e->getMessage());
}

class Database {
    private $connection;

    public function __construct() {
        $host = getenv('MYSQL_HOST');
        $username = getenv('MYSQL_USERNAME');
        $password = getenv('MYSQL_PASSWORD');
        $database = getenv('MYSQL_DATABASE');
        $this->connection = new mysqli($host, $username, $password, $database);

        if ($this->connection->connect_error) {
            echo "error";
            die("Connection failed: " . $this->connection->connect_error);
        }
    }

    public function getConnection() {
        return $this->connection;
    }
}
?>