window.addEventListener("load", init);

function init() {
    loadMapPoints();     // Loads default map points
    loadXMLAreas();      // Loads interactive area data from XML
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

            if (!container) {
                console.error("Missing <div id='interactive-areas'> in HTML.");
                return;
            }

            for (let area of areas) {
                let id = area.getAttribute('id');
                let x = parseInt(area.getAttribute('x'));
                let y = parseInt(area.getAttribute('y'));
                let booked = area.getAttribute('booked') === 'true';
                let capacity = parseInt(area.getAttribute('capacity'));
                let cost = parseFloat(area.getAttribute('cost'));

                let btn = document.createElement('div');
                btn.className = 'map-area' + (booked ? ' booked' : '');
                btn.style.position = 'absolute';
                btn.style.left = `${x}px`;
                btn.style.top = `${y}px`;
                btn.style.width = '40px';
                btn.style.height = '40px';
                btn.style.backgroundColor = booked ? 'red' : 'green';
                btn.style.borderRadius = '50%';
                btn.style.cursor = 'pointer';
                btn.title = `ID: ${id}\nCapacity: ${capacity}\nCost: $${cost}\nBooked: ${booked ? 'Yes' : 'No'}`;

                btn.onclick = () => {
                    if (booked) {
                        alert("This area is already booked.");
                    } else {
                        let people = parseInt(document.getElementById("capacity").value);
                        let checkIn = new Date(document.getElementById("checkIn").value);
                        let checkOut = new Date(document.getElementById("checkOut").value);
                        let days = (checkOut - checkIn) / (1000 * 3600 * 24);

                        if (isNaN(people) || isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
                            alert("Please fill in all fields.");
                            return;
                        }

                        if (people > capacity) {
                            alert("Too many people for this area!");
                        } else if (days <= 0) {
                            alert("Check-out must be after check-in.");
                        } else {
                            let total = cost * days;
                            alert(`Booked Area ${id} for ${days} days. Total: $${total}`);
                        }
                    }
                };

                container.appendChild(btn);
            }
        })
        .catch(err => {
            console.error("Error loading XML areas:", err);
        });
}
