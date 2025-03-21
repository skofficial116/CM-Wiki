const backgroundContainer = document.createElement('div');
backgroundContainer.className = 'background-container';
backgroundContainer.innerHTML = `
    <img class="background-image" src="crowd2.jpeg" alt="Background">
    <div id="validation" style="color:rgb(255, 255, 255)"></div>
    <div class="overlay"></div>
`;

const nav = document.createElement('div');
nav.className = 'nav';
nav.innerHTML = `
    <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="tools.html">Tools</a></li>
        <li><a href="">Guide</a></li>
        <li><a href="">About</a></li>
        <li><a href="spl.html">SPL</a></li>
    </ul>
`;

const center = document.createElement('center');

document.body.appendChild(backgroundContainer);
document.body.appendChild(nav);
document.body.appendChild(center);
