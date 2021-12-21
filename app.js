#!/usr/local/bin/node
const puppeteer = require('puppeteer');
require('dotenv').config()
const mysql = require('mysql')


function addto_db(object){
    var con = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_DATABASE,
    });
    
    con.connect(function(err) {
        if (err) {
            throw err
        };
        console.log("Connected!");
    });
    var sql = "INSERT INTO data SET ?";

    con.query(sql, object, function(err, result) {
        if (err) {
            throw err
        };
        console.log("1 record inserted");
    });
    con.end()
}



function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}
(async () => {
    // Time how long the script is going to take
    var start = performance.now()

    // Launch Browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // await page.setViewport({width:1920, height:1080});

    // Goto the Login Page
    await page.goto('https://www.klikvoorwonen.nl/mijn-klik-voor-wonen/inloggen');
    delay(1000)
    
    // Accept the cookie notification if allowed
    await page.evaluate( () => {
        const $el = document.querySelector('.cookie-notice button.cm-btn-success')  
        if($el !== null){
            $el.click()
        }
    });
    
    // Wait till the login form is visible
    await page.waitForSelector('form[name="loginForm"]', {
        visible: true,
    });

    // Put in login data
    await page.type('#username', process.env.USERNAME)
    await page.type('#password', process.env.PASSWORD)
    
    await page.click('form[name="loginForm"] input[type="submit"]')

    // await page.screenshot({path: 'screenshots/login.png'})

    // Make sure that the login is processed to the fullest
    await page.waitForNavigation({
        waitUntil: 'networkidle0',
    });
    
    // Go to your filter environment
    await page.goto('https://www.klikvoorwonen.nl/aanbod/te-huur#?gesorteerd-op=zoekprofiel&locatie=Gemeente%2BBreda');

    // Guess when the page is loaded. Mostly ~3 seconds
    await delay(3000)

    // Get the listings
    const data = await page.$$('section.list-item.ng-scope a[ng-click="goToDetails($event)"]')

    const urls = [] // Empty array for the URLS on which you can respond
    const images = [] // Empty array for the images

    for (let i = 0; i < data.length; i++) {
        // Check if you already have responded to the listing
        const responded = (await (await data[i].getProperty('innerText')).jsonValue()).includes('Je hebt al gereageerd')
        if(responded === false){
            urls.push(await (await data[i].getProperty('href')).jsonValue())
        }
    }

    // Iterate over the URL's to submit
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        await page.goto(url);
        await page.waitForSelector('form[name="reactForm"] input[type="submit"]', {
            visible: true,
        });
        
        // Submit the form ONLY if element exists
        const formSubmit = await page.evaluate( () => {
            const $el = document.querySelector('form[name="reactForm"] input[type="submit"]')  
            if($el !== null && $el.value !=='Verwijder reactie'){
                $el.click()
            } else {
                return false
            }
        });
        if(formSubmit === false){
            continue;
        }
        delay(1000)
        
        // Confirm the confirmation popup. ('Huurtoeslag is niet geldig')
        await page.evaluate( () => {
            const $el = document.querySelector('.confirm-popup-content a.button.confirm-accept')
            if($el !== null){
                $el.click()
            }
        });
        const bg_image = await page.evaluate( () => {
                var regex = new RegExp(/([\w+]+\:\/\/)?([\w\d-]+\.)*[\w-]+[\.\:]\w+([\/\?\=\&\#\.]?[\w-]+)*\/?/gm)
                const html = (window.getComputedStyle(document.querySelector("div.object-header-image.ng-scope")).getPropertyValue('background-image')).match(regex)[0]
                return html
            });
        images.push(bg_image)
    }
    // Close the browser
    await browser.close();
    
    // Initiate variables for confirmation message
    var response = ''
        total_time =  Math.round(performance.now() - start) / 1000
        urls_count = urls.length
        urls_list = urls.join('\n- ')
    
    if(urls_count > 0){
        response += `Responded on ${urls_count} possible houses.\nWhich are:\n- ${urls_list}`
    } else {
        response += `0 new possible houses. Nothing to do. Total response time was ${total_time}s`
    }
    
    console.log(response)

    const db_vars = {
        urls: JSON.stringify(urls),
        count: urls_count,
        message: response,
        bg_image: JSON.stringify(images)
    }
    console.log(db_vars)

    addto_db(db_vars)

   
    
})();