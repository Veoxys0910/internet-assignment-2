window.addEventListener("load", init);

function init() {
    loadMapPoints();
}

function loadMapPoints() {
    let map = document.getElementById("map-container");
    let position = [
        [90, 330], [20, 250], [100, 200], [80, 100], 
        [220, 60], [400, 120], [485, 60], [470, 230],
        [250, 210], [290, 330]];

    let pointWrapper;
    let pointIMG;
    let pointLabel;

    for (let i = 0; i < position.length; i++) {
        
        pointWrapper = document.createElement('div');
        pointWrapper.style.position = 'absolute';
        pointWrapper.style.left = position[i][0] + 'px';
        pointWrapper.style.top = position[i][1] + 'px';
        pointWrapper.style.width = '70px';
        pointWrapper.style.height = '70px';
        pointWrapper.style.textAlign = 'center';
        pointWrapper.style.color = 'white';

        pointIMG = document.createElement('img');
        pointIMG.src = './assets/Point.png';
        pointIMG.style.width = '100%';
        pointIMG.style.height = '100%';

        pointLabel = document.createElement('div');
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