window.addEventListener("load", init);

let areaDivs = new Array();
let capacities = new Array();
let costs = new Array();

let capacityInput;
let checkInInput;
let checkOutInput;

let form1;
let form2;

function init() {
    //loadMapPoints();     // Loads default map points
    loadXMLAreas();      // Loads interactive area data from XML
    initForm();
}

function initForm() {
    let searchButton = document.getElementById("search_button");
    capacityInput = document.getElementById("capacity");
    checkInInput = document.getElementById("checkIn");
    checkOutInput = document.getElementById("checkOut");

    form1 = document.getElementById('page_1');
    form2 = document.getElementById('page_2');

    searchButton.addEventListener('click', (e) => {
        let capacity = capacityInput.value;

        for (let i = 0; i < capacities.length; i++) {
            if (capacities[i] != capacity || areaDivs[i].classList.contains('booked')) {
                areaDivs[i].style.display = 'none';
            } else {
                areaDivs[i].style.display = 'block';
            }
        }
    });

    let clearButton = document.getElementById("clear_button");

    clearButton.addEventListener('click', (e) => {
        for (let i = 0; i < areaDivs.length; i++) {
            areaDivs[i].style.display = 'block';
        }

        capacityInput.value = 1;
        checkInInput.value = "";
        checkOutInput.value = "";
    });
}

function loadXMLAreas() {
    fetch('areas.xml')
        .then(res => {
            if (!res.ok) throw new Error("Failed to load areas.xml");
            return res.text();
        })
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
            const areas = data.getElementsByTagName('area');
            const container = document.getElementById('interactive-areas');
            const hoverPreview = document.getElementById('hover-preview');
            const hoverImg = document.getElementById('hover-img');
            const hoverInfo = document.getElementById('hover-info');

            if (!container || !hoverPreview || !hoverImg || !hoverInfo) {
                console.error("Missing required HTML elements.");
                return;
            }

            for (let area of areas) {
                let id = area.getAttribute('id');
                let x = parseInt(area.getAttribute('x'));
                let y = parseInt(area.getAttribute('y'));
                let booked = area.getAttribute('booked') === 'true';
                let image = area.getAttribute('image');
                let capacity = area.getAttribute('capacity');
                capacities.push(Number(capacity));
                let cost = area.getAttribute('cost');
                costs.push(Number(cost));

                let areaDiv = document.createElement('div');
                areaDiv.classList.add('map-area');
                areaDiv.style.position = 'absolute';
                areaDiv.style.left = `${x}px`;
                areaDiv.style.top = `${y}px`;
                areaDiv.style.width = '20px';
                areaDiv.style.height = '20px';

                if (booked) areaDiv.classList.add('booked');

                // Hover event
                areaDiv.addEventListener('mouseover', (e) => {
                    hoverImg.src = image;
                    hoverInfo.innerHTML = `
                        <strong>ID:</strong> ${id}<br/>
                        <strong>Capacity:</strong> ${capacity}<br/>
                        <strong>Cost per Day:</strong> $${cost}<br/>
                        <strong>Status:</strong> ${booked ? "Booked" : "Available"}
                    `;
                    hoverPreview.style.display = 'block';
                    hoverPreview.style.left = `${x + 30}px`;
                    hoverPreview.style.top = `${y - 100}px`;

                    if (areaDiv.classList.contains('booked')) {
                        hoverPreview.style.backgroundColor = "rgba(220, 53, 69, 0.6)";
                    } else {
                        hoverPreview.style.backgroundColor = "rgb(98, 252, 175, 0.6)";
                    }

                    if (x >= 400) {
                        hoverPreview.style.left = `${x - 520}px`;
                    }
                });

                areaDiv.addEventListener('mouseout', () => {
                    hoverPreview.style.display = 'none';
                });

                container.appendChild(areaDiv);

                areaDivs.push(areaDiv);

                areaDiv.addEventListener('click', (e)=> {
                    let index = areaDivs.indexOf(areaDiv);

                    form1.style.display = 'none';
                    form2.style.display = 'block';

                    calculateOrder(index);
                });
            }
        })
        .catch(err => console.error("Error loading XML areas:", err));
}

function calculateOrder(p_areaDivIndex) {
    let checkInDate = checkInInput.value;
    let checkOutDate = checkOutInput.value;
    let capacity = capacities[p_areaDivIndex];
    let cost = costs[p_areaDivIndex];

    let checkInSummary = document.getElementById("check-in-summary");
    let checkOutSummary = document.getElementById("check-out-summary");
    let capacitySummary = document.getElementById("capacity-summary");
    let costSummary = document.getElementById("price-summary");

    checkInSummary.innerText = checkInDate;
    checkOutSummary.innerText = checkOutDate;
    capacitySummary.innerText = capacity;
    costSummary.innerText = cost;
}

function loadMapPoints() {
    let map = document.getElementById("interactive-areas");
    if (!map) {
        console.error("interactive-areas container not found.");
        return;
    }

    let position = [
        [90, 330], [20, 250], [100, 200], [80, 100],
        [220, 60], [400, 120], [485, 60], [470, 230],
        [250, 210], [290, 330]
    ];

    for (let i = 0; i < position.length; i++) {
        let pointWrapper = document.createElement('div');
        pointWrapper.style.position = 'absolute';
        pointWrapper.style.left = position[i][0] + 'px';
        pointWrapper.style.top = position[i][1] + 'px';
        pointWrapper.style.width = '70px';
        pointWrapper.style.height = '70px';
        pointWrapper.style.textAlign = 'center';

        let pointIMG = document.createElement('img');
        pointIMG.src = './assets/Point.png';
        pointIMG.style.width = '100%';
        pointIMG.style.height = '100%';

        let pointLabel = document.createElement('div');
        pointLabel.innerText = i + 1;
        pointLabel.style.position = 'absolute';
        pointLabel.style.left = '50%';
        pointLabel.style.top = '40%';
        pointLabel.style.transform = 'translate(-50%, -50%)';
        pointLabel.style.fontWeight = 'bold';
        pointLabel.style.pointerEvents = 'none';
        pointLabel.style.color = "lightgreen";

        pointWrapper.appendChild(pointIMG);
        pointWrapper.appendChild(pointLabel);
        map.appendChild(pointWrapper);
    }
}