window.addEventListener("load", init);

function init() {
    //loadMapPoints();     // Loads default map points
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
                let cost = area.getAttribute('cost');

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
                        <strong>Cost:</strong> $${cost}<br/>
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
            }
        })
        .catch(err => console.error("Error loading XML areas:", err));
}


