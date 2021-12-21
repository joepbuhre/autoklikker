'use strict';
const puppeteer = require('puppeteer');
const fs = require('fs');
(async() => {
    console.info("Starting browser");
    let browser;
    try {
        browser = await puppeteer.launch({});
    } catch (e) {
        console.info("Unable to launch browser mode in sandbox mode. Launching Chrome without sandbox.");
        browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    }
    console.info("Browser successfully started");
    console.info("Closing browser");
    await browser.close();
    console.info("Done");
})();