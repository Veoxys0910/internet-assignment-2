window.addEventListener("load", init);

let areaDivs = [];
let capacities = [];
let costs = [];
let images = []; // Array to store images
let areaIds = []; // Array to store area IDs

let capacityInput;
let checkInInput;
let checkOutInput;

let form1;
let form2;

function init() {
    loadXMLAreas();      // Loads interactive area data from XML
    initForm();
    restrictDates();     // Initialize date restrictions
}

function initForm() {
    let searchButton = document.getElementById("search_button");
    capacityInput = document.getElementById("capacity");
    checkInInput = document.getElementById("checkIn");
    checkOutInput = document.getElementById("checkOut");

    form1 = document.getElementById('page_1');
    form2 = document.getElementById('page_2');

    searchButton.addEventListener('click', () => {
        let capacity = capacityInput.value;
        for (let i = 0; i < capacities.length; i++) {
            areaDivs[i].style.display = (capacities[i] == capacity && !areaDivs[i].classList.contains('booked')) ? 'block' : 'none';
        }
    });

    document.getElementById("clear_button").addEventListener('click', () => {
        areaDivs.forEach(area => area.style.display = 'block');
        capacityInput.value = 1;
        checkInInput.value = "";
        checkOutInput.value = "";
    });

    document.getElementById("edit-booking-button").addEventListener('click', () => {
        // Return to booking form with previous fields intact
        form2.style.display = 'none';
        form1.style.display = 'block';
    });

    document.getElementById("confirm-booking-button").addEventListener('click', () => {
        // Show confirmation alert or message
        alert("The area has been reserved!");

        // Clear form fields (reset to defaults)
        capacityInput.value = 1;
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        checkInInput.value = today.toISOString().split('T')[0];
        checkOutInput.value = tomorrow.toISOString().split('T')[0];

        // Reset area visibility to visible, remove any filtering
        areaDivs.forEach(area => area.style.display = 'block');

        // Return to the booking form page
        form2.style.display = 'none';
        form1.style.display = 'block';
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

            for (let area of areas) {
                let id = area.getAttribute('id');
                let x = parseInt(area.getAttribute('x'));
                let y = parseInt(area.getAttribute('y'));
                let booked = area.getAttribute('booked') === 'true';
                let image = area.getAttribute('image');
                let capacity = area.getAttribute('capacity');
                let cost = area.getAttribute('cost');

                capacities.push(Number(capacity));
                costs.push(Number(cost));
                images.push(image); // Store image
                areaIds.push(id); // Store area ID

                let areaDiv = document.createElement('div');
                areaDiv.classList.add('map-area');
                areaDiv.style.position = 'absolute';
                areaDiv.style.left = `${x}px`;
                areaDiv.style.top = `${y}px`;
                areaDiv.style.width = '20px';
                areaDiv.style.height = '20px';
                if (booked) areaDiv.classList.add('booked');

                areaDiv.addEventListener('mouseover', () => {
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
                });

                areaDiv.addEventListener('mouseout', () => {
                    hoverPreview.style.display = 'none';
                });

                areaDiv.addEventListener('click', () => {
                    form1.style.display = 'none';
                    form2.style.display = 'block';
                    calculateOrder(areaDiv);
                });

                container.appendChild(areaDiv);
                areaDivs.push(areaDiv);
            }
        })
        .catch(err => console.error("Error loading XML areas:", err));
}

function calculateOrder(areaDiv) {
    let checkInDate = new Date(checkInInput.value);
    let checkOutDate = new Date(checkOutInput.value);
    let days = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    let index = areaDivs.indexOf(areaDiv);
    let capacity = capacities[index];
    let cost = costs[index];
    let areaId = areaIds[index]; 
    let image = images[index]; 

    document.getElementById("check-in-summary").innerText = checkInInput.value;
    document.getElementById("check-out-summary").innerText = checkOutInput.value;
    document.getElementById("capacity-summary").innerText = capacity;
    document.getElementById("price-summary").innerText = `$${cost * days}`; // Total cost based on days

    document.getElementById("area-id-summary").innerText = areaId; 
    document.getElementById("area-image-summary").src = image; 
}

function restrictDates() {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    checkInInput.setAttribute('min', today.toISOString().split('T')[0]);
    checkOutInput.setAttribute('min', tomorrow.toISOString().split('T')[0]);
    checkInInput.value = today.toISOString().split('T')[0];
    checkOutInput.value = tomorrow.toISOString().split('T')[0];
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