<?php

// Aktiviere CORS (Cross-Origin Resource Sharing) und setze JSON als Inhaltstyp.
header("Access-Control-Allow-Origin: https://im-server.ch");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, Auth-Token");
header('Content-Type: application/json');


ini_set('display_errors', 1);
error_reporting(E_ALL);


require_once 'envHelper.php';

try {
    loadEnvironmentVariables(__DIR__ . '/.env');
} catch (Exception $e) {
    die('Error loading the .env file: ' . $e->getMessage());
}

// Füge die Database-Klasse für die Datenbankinteraktion ein.
require_once 'Database.php';

class ParkingAPI {
    private $db;
    private $conn;
    private $authToken;

    // Initialisiere die Datenbankverbindung und setze das Authentifizierungstoken.
    function __construct($authToken) {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
        $this->authToken = $authToken;
    }

    // Überprüfe das bereitgestellte Authentifizierungstoken.
    function verifyAuthToken($token) {
        return $token === $this->authToken;
    }

    // Verarbeite eingehende HTTP-Anfragen und leite sie basierend auf der Methode weiter.
    function processRequest() {
        $headers = apache_request_headers();

        if (!isset($headers['Auth-Token']) || !$this->verifyAuthToken($headers['Auth-Token'])) {
            echo json_encode(["error" => "Unauthorized"]);
            return;
        }

        $method = $_SERVER['REQUEST_METHOD'];
        switch ($method) {
            case 'GET':
                $locationID = $_GET['locationID'] ?? null;
                $limit = $_GET['limit'] ?? null;
                $latest = $_GET['latest'] ?? null;
                echo json_encode($this->getData($locationID, $limit, $latest));
                break;
            default:
                header("HTTP/1.1 405 Method Not Allowed");
                echo json_encode(["error" => "Method Not Allowed"]);
                break;
        }
    }

    // Daten aus der Datenbank abrufen, basierend auf einer Standort-ID, falls vorhanden.
    function getData($locationID, $limit, $latest) {
        $query = "SELECT * FROM ParkData";
        if ($locationID !== null && $limit == null) {
            $stmt = $this->conn->prepare("SELECT * FROM ParkData WHERE id2 = ?");
            $stmt->bind_param("s", $locationID);
            $stmt->execute();
            $result = $stmt->get_result();
        } else if ($locationID !== null && $limit !== null) {
            $stmt = $this->conn->prepare("SELECT * FROM ParkData WHERE id2 = ? ORDER BY fetched_at DESC LIMIT ?");
            $stmt->bind_param("ss", $locationID, $limit);
            $stmt->execute();
            $result = $stmt->get_result();
        } else if ($locationID == null && $latest == true) {
            $stmt = $this->conn->prepare("SELECT * FROM ParkData WHERE fetched_at > NOW() - INTERVAL 1 HOUR ORDER BY fetched_at DESC");
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $result = $this->conn->query($query);
        }

        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }

        // $data['count'] = count($data);
        return $data;
    }

    // Schliesse die Datenbankverbindung, wenn das Objekt zerstört wird.
    function __destruct() {
        $this->conn->close();
    }
}

$authToken = getenv('AUTH_TOKEN');
$api = new ParkingAPI($authToken);
$api->processRequest();

?>
