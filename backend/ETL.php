<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once 'Database.php'; //Die Verbindung zur Datenbank ist hier encapsulated

class DataImporter {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function fetchDataFromAPI() {
        // JSON-Daten von der API abrufen
        $json = file_get_contents('https://data.bs.ch/api/explore/v2.1/catalog/datasets/100088/records?where=NOT%20title%20%3D%20%27Zur%20Zeit%20haben%20wir%20keine%20aktuellen%20Parkhausdaten%20erhalten%27&limit=20&timezone=Europe%2FZurich');
        $data = json_decode($json, true);
        // Nur das 'results'-Array zurückgeben, das mehrere Parkdaten enthält
        return $data['results'] ?? [];
    }

    public function insertData($data) {
        // SQL-Anweisung für das Einfügen von Daten vorbereiten
        $stmt = $this->conn->prepare("INSERT INTO ParkData (id, title, published, free, total, anteil_frei, auslastung, auslastung_prozent, link, longitude, latitude, description, name, id2) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        // Über jedes Datenobjekt im Ergebnisarray iterieren
        foreach ($data as $item) {
            // Variablen als Parameter an die vorbereitete Anweisung binden
            $stmt->bind_param("sssiidddsdsss", 
                $item['title'], 
                $item['published'], 
                $item['free'], 
                $item['total'], 
                $item['anteil_frei'], 
                $item['auslastung'], 
                $item['auslastung_prozent'], 
                $item['link'], 
                $item['geo_point_2d']['lon'], // Längengrad
                $item['geo_point_2d']['lat'], // Breitengrad
                $item['description'], 
                $item['name'], 
                $item['id2']
            );
            // Die vorbereitete Anweisung ausführen
            if ($stmt->execute()) {
                $title = $item['title'];
                echo "Daten für {$title} erfolgreich eingefügt\n";
            } else {
                echo "Fehler beim Einfügen der Daten von {$title}: " . $this->conn->error . "\n";
            }
        }
        $stmt->close();
    }

    public function closeConnection() {
        $this->conn->close();
    }
}

$importer = new DataImporter();
$data = $importer->fetchDataFromAPI();
if (!empty($data)) {
    $importer->insertData($data); // Einfügung für jedes Element im Datenarray ausführen
}
$importer->closeConnection();

?>
