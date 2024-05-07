const input = document.querySelector('#search');
const result = document.querySelector('#result');
const refresh = document.querySelector('.refresh-icon');

let cachedData = [];

input.addEventListener('input', () => {
    const searchValue = input.value;
    const filteredData = filterData(searchValue);
    processData(filteredData);
});

refresh.addEventListener('click', () => {
    refreshData();
});

async function fetchParkingData() {
    try {
        const response = await fetch('https://data.bs.ch/api/explore/v2.1/catalog/datasets/100088/records?where=NOT%20title%20%3D%20%27Zur%20Zeit%20haben%20wir%20keine%20aktuellen%20Parkhausdaten%20erhalten%27&limit=20&timezone=Europe%2FZurich');
        if (response.status !== 200) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }
        const data = await response.json();
        cachedData = data.results;
        return data;
    } catch (error) {
        console.error('Failed to fetch data:', error);
    }
}

function filterData(searchValue) {
    return cachedData.filter(item => item.title.toLowerCase().includes(searchValue.toLowerCase()));
}

function refreshData() {
    fetchParkingData().then(() => {
        input.value = '';
        processData();
        // console.log('Data refreshed.');
    });
}

async function processData(data = cachedData) {
    if (data.length === 0) {
        await fetchParkingData();
        data = cachedData;
    }
    // console.log(data);

    result.innerHTML = '';

    data.forEach((item, index) => {
        let percentage = Math.floor((item.auslastung_prozent));

        if (percentage < 0) {
            percentage = 0;
        }

        result.innerHTML += `
        <div class="parking-card" data-id="${item.id2}">
            <div class="card-header">
                <h3 class="heading-4">${item.title}</h3>
            </div>
            <div class="card-body">
                <p class="margin-top"><strong>${item.free}</strong> Freie Parkplätze</p>
                <div id="charts-container-${index}"></div>
                <p class="margin-bottom"><strong>${percentage}%</strong> Auslastung</p>
            </div>
        </div>
        `;

    });

    // After all DOM updates are complete, create the charts
    data.forEach((item, index) => {
        createChart(index, Math.floor(item.auslastung_prozent));
        addEventListenerToCard(index, item.id2);
    });
    }

    function createChart(index, percentage) {
    if (percentage < 0) {
        percentage = 0;
    }
    const container = document.getElementById(`charts-container-${index}`);
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [percentage, 100 - percentage],
                backgroundColor: ['#FF6961', '#75CD72'],
                borderWidth: 1
            }]
        },
        options: {
            circumference: 360,
            rotation: 0,
            cutout: '70%',
            plugins: {
                legend: { display: false }
            },
            maintainAspectRatio: false,
            responsive: true
        }
    });
}

function addEventListenerToCard(index, id) {
    const card = document.querySelector(`#charts-container-${index}`).closest('.parking-card');
    card.addEventListener('click', () => {
        window.location.href = `./trends.html?id=${id}`;
    });
}

processData();
