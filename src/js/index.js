import '../less/style.less';
import '../less/style.less';
import MazeDemoPage from './MazeDemoPage.js';
import {initUtils} from './utils.js';

let DemoPage;

$(document).ready(() => {
    initUtils();
    DemoPage = new MazeDemoPage();
    DemoPage.startMaze();
});