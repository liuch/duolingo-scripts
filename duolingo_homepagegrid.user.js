// ==UserScript==
// @name         Duo-homepage-grid
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Changes the lessons layout to a big grid
// @author       Blaarkies
// @match        https://www.duolingo.com/
// ==/UserScript==

let setHomepageAsGrid = () => {
    document.styleSheets[1].addRule('.i12-l > a', 'width: 100%; overflow: hidden;');
    document.styleSheets[1].addRule('.i12-l > a > div > :first-child', 'transform: scale(0.6); height: 76px;');
    document.getElementsByClassName('LFfrA _3MLiB').item(0).style.maxWidth = 'unset';

    let lessonsContainer = Array.from(document.getElementsByTagName('div')).find(e => e.dataset.test == 'skill-tree');
    lessonsContainer.style.cssText += `
    display: grid;
    grid-template-columns: repeat(17 ,80px);
    grid-auto-rows: 90px;
    place-items: center;
    grid-gap: 6px;`;

    let lessons = Array.from(Array.from(lessonsContainer.childNodes).map(n => n.childNodes))
    .reduce((sum, c) => [...sum,...c],[])
    .filter(n => n.tagName == 'A');

    lessons.forEach(lesson => lessonsContainer.appendChild(lesson));

    let oldLessonGroupWrappers = Array.from(Array.from(lessonsContainer.childNodes))
        .filter(n => n.tagName == 'DIV');
    oldLessonGroupWrappers.forEach(wrapper => wrapper.remove());
};

let needsToBeRefreshed = true;
setInterval(() => {
    if (window.location.href == 'https://www.duolingo.com/') {
        if (needsToBeRefreshed) {
            setHomepageAsGrid();
            needsToBeRefreshed = false;
        }
    } else {
        needsToBeRefreshed = true;
    }
}, 50);

console.log('Duo-homepage-grid script ran. Say thanks at blaarkies.com');
