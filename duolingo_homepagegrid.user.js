// ==UserScript==
// @name         Duo-homepage-grid
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Changes the lessons layout to a grid view
// @author       Blaarkies
// @match        https://www.duolingo.com/
// ==/UserScript==

let setHomepageAsGrid = () => {
    document.getElementsByClassName('LFfrA _3MLiB').item(0).style.maxWidth = 'unset';
    let lessonsContainer = Array.from(document.getElementsByTagName('div')).find(e => e.dataset.test == 'skill-tree');
    lessonsContainer.style.cssText += `
display: grid;
grid-template-columns: repeat(11, 125px);
grid-template-rows: repeat(16, 125px);
place-items: center;
grid-gap: 8px;`;

    let lessons = Array.from(Array.from(lessonsContainer.childNodes).map(n => n.childNodes))
    .reduce((sum, c) => [...sum,...c],[])
    .filter(n => ['A'].some(test => test == n.tagName))
    .forEach(l => lessonsContainer.appendChild(l));

    Array.from(Array.from(lessonsContainer.childNodes))
        .filter(n => ['DIV'].some(test => test == n.tagName))
        .forEach(l => l.remove());
};

setInterval(() => {
    if (window.location.href == 'https://www.duolingo.com/') {
        setHomepageAsGrid();
    }
}, 50);

console.log('Duo-homepage-grid script ran. From blaarkies.com');



