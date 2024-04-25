const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
let cachedData = [];
let parkingUtilizationChart = null; // This will hold the chart instance

document.addEventListener('DOMContentLoaded', async function () {
    await fetchTrendData();
    setupChart(); // Setup initial empty chart
    updateChartWithFilteredData('24h'); // Default to '24h' on load
    updateText('24h'); // Default to '24h' on load

    const radioButtons = document.querySelectorAll('input[type="radio"][name="duration"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', () => {
            updateChartWithFilteredData(radio.value);
            updateText(radio.value);
        });
    });
});

async function fetchTrendData() {
    try {
        const response = await fetch(`https://api.im-server.ch/ParkingApi.php?locationID=${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Auth-Token': '7tXVDIy1fI1Za4AIUHy4ZqWxX3ZIYDw59Sb1woH8RC7cajRu6piv6wz2IKbUEYww'
            }
        });
        cachedData = await response.json();
        const title = document.querySelectorAll('.title');
        for (let i = 0; i < title.length; i++) {
            title[i].textContent = cachedData[0].title;
        }
        console.log('Data fetched and cached:', cachedData);
    } catch (error) {
        console.error('Failed to fetch data:', error);
    }
}

function setupChart() {
    const ctx = document.getElementById('parkingUtilizationChart').getContext('2d');
    parkingUtilizationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Parking Utilization (%)',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false,
                    text: 'Parking Utilization Trend'
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        displayFormats: {
                            hour: 'MMM dd, HH:mm'  // Format the hour for better readability
                        },
                        tooltipFormat: 'MMM dd, yyyy HH:mm'
                    },
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: 100,  // Ensure the scale goes up to 100%
                    title: {
                        display: true,
                        text: 'Utilization %'
                    }
                }
            }
        }
    });
}

function updateChartWithFilteredData(timeframe) {

    console.log(parkingUtilizationChart.data.datasets[0].data);


    const filteredData = filterDataByTimeframe(timeframe);
    let sortedData = filteredData.sort((a, b) => new Date(a.published) - new Date(b.published));
    const labels = sortedData.map(entry => new Date(entry.published));
    const usagePercentages = sortedData.map(entry => Math.max(0, entry.auslastung_prozent));

    parkingUtilizationChart.data.labels = labels;
    parkingUtilizationChart.data.datasets[0].data = usagePercentages; // Ensure you are updating the correct dataset
    parkingUtilizationChart.update();

    console.log(parkingUtilizationChart.data.labels);
}

function filterDataByTimeframe(timeframe) {
    const now = new Date();
    let cutoff = now.getTime(); // Default to showing all data
    switch (timeframe) {
        case '24h':
            cutoff -= 24 * 3600 * 1000;
            break;
        case '1w':
            cutoff -= 7 * 24 * 3600 * 1000;
            break;
        case '1m':
            cutoff -= 30 * 24 * 3600 * 1000;
            break;
        case '1j':
            cutoff -= 365 * 24 * 3600 * 1000;
            break;
        default:
            cutoff = 0;
            break;
    }
    return cachedData.filter(item => new Date(item.fetched_at).getTime() >= cutoff);
}

function updateText(timeframe) {
    const text = document.querySelector('#selection-text');
    switch (timeframe) {
        case '24h':
            text.textContent = 'Auslastung in % der letzten 24 Stunden';
            break;
        case '1w':
            text.textContent = 'Auslastung in % der letzten Woche';
            break;
        case '1m':
            text.textContent = 'Auslastung in % des letzten Monats';
            break;
        case '1j':
            text.textContent = 'Auslastung in % im letzten Jahr';
            break;
        default:
            text.textContent = 'Auslastung in % seit Beginn der Aufzeichnung';
            break;
    }
}