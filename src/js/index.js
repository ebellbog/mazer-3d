import '../less/demo.less';
import '../less/demo-mobile.less';
import MazeDemoPage from './MazeDemoPage.js';
import {initUtils} from './utils.js';

let DemoPage;

$(document).ready(() => {
    initUtils();
    DemoPage = new MazeDemoPage();
    DemoPage.startMaze();
});