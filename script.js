window.addEventListener("load", init);

function init() {
    loadMapPoints();
}

function loadMapPoints() {
    let map = document.getElementById("map-container");
    let position = [[90, 330]];

    for (let i = 0; i < position.length; i++) {
        // Create wrapper div
        let pointWrapper = document.createElement('div');
        pointWrapper.style.position = 'absolute';
        pointWrapper.style.left = position[i][0] + 'px';
        pointWrapper.style.top = position[i][1] + 'px';
        pointWrapper.style.width = '70px';
        pointWrapper.style.height = '70px';
        pointWrapper.style.textAlign = 'center';
        pointWrapper.style.color = 'white'; // Change based on your design

        // Add the point image
        let pointImg = document.createElement('img');
        pointImg.src = './assets/Point.png';
        pointImg.style.width = '100%';
        pointImg.style.height = '100%';

        // Add the text
        let label = document.createElement('div');
        label.innerText = i + 1;  // Change to whatever label you want
        label.style.position = 'absolute';
        label.style.left = '50%';
        label.style.top = '40%';
        label.style.transform = 'translate(-50%, -50%)';
        label.style.fontWeight = 'bold';
        label.style.pointerEvents = 'none'; // So text doesn't block clicks

        // Combine them
        pointWrapper.appendChild(pointImg);
        pointWrapper.appendChild(label);
        map.appendChild(pointWrapper);
    }
}