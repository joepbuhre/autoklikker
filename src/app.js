#!/usr/local/bin/node
const puppeteer = require('puppeteer');

const { addto_db } = require('./config/dbconfig.js')
const { decrypt } = require('../password.js');
const { setPage, setBrowser } = require('./modules/page.js');
const { querySelectorAll, safeClick, mvgmSlack } = require('./modules/helpers.js');
const { slacknotify } = require('./modules/notify.js');

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}


module.exports.KlikVoorWonen = async _ => {
    let password;

    if (process.env.KLIKVOORWONEN_LOGIN_PASSWORD_ENC) {
        password = decrypt(process.env.KLIKVOORWONEN_LOGIN_PASSWORD_ENC)
    } else {
        throw new Error("No password")
    }
    // Time how long the script is going to take
    var start = performance.now()

    console.log(process.env.KLIKVOORWONEN_LOGIN_USERNAME)

    const { page, browser } = await setPage()

    // Goto the Login Page
    await page.goto('https://www.klikvoorwonen.nl/mijn-klik-voor-wonen/inloggen');
    delay(1000)

    // Accept the cookie notification if allowed
    await page.evaluate(() => {
        const $el = document.querySelector('.cookie-notice button.cm-btn-success')
        if ($el !== null) {
            $el.click()
        }
    });

    // Wait till the login form is visible
    await page.waitForSelector('form[name="loginForm"]', {
        visible: true,
    });

    // Put in login data
    await page.type('#username', process.env.LOGIN_USERNAME)
    await page.type('#password', password)

    await page.click('form[name="loginForm"] input[type="submit"]')

    // Make sure that the login is processed to the fullest
    await page.waitForNavigation({
        waitUntil: 'networkidle0',
    });

    // Go to your filter environment
    await page.goto('https://www.klikvoorwonen.nl/aanbod/te-huur#?gesorteerd-op=zoekprofiel&locatie=Gemeente%2BBreda');

    // Guess when the page is loaded. Mostly ~3 seconds
    const houses = await page.waitForSelector('.object-list-items-container')

    const houseNodes = await querySelectorAll(page, '.object-list-items-container')
    console.log(houseNodes)

    // Get the listings
    const data = await page.$$('section.list-item.ng-scope a[ng-click="goToDetails($event)"]')

    const urls = [] // Empty array for the URLS on which you can respond
    const images = [] // Empty array for the images

    for (let i = 0; i < data.length; i++) {
        // Check if you already have responded to the listing
        const responded = (await (await data[i].getProperty('innerText')).jsonValue()).includes('Je hebt al gereageerd')
        if (responded === false) {
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
        const formSubmit = await page.evaluate(() => {
            const $el = document.querySelector('form[name="reactForm"] input[type="submit"]')
            if ($el !== null && $el.value !== 'Verwijder reactie') {
                $el.click()
            } else {
                return false
            }
        });
        if (formSubmit === false) {
            continue;
        }
        delay(1000)

        // Confirm the confirmation popup. ('Huurtoeslag is niet geldig')
        await page.evaluate(() => {
            const $el = document.querySelector('.confirm-popup-content a.button.confirm-accept')
            if ($el !== null) {
                $el.click()
            }
        });
        const bg_image = await page.evaluate(() => {
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
    total_time = Math.round(performance.now() - start) / 1000
    urls_count = urls.length
    urls_list = urls.join('\n- ')

    if (urls_count > 0) {
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


}

module.exports.mvgm = async _ => {
    const config = {
        args: ['--start-maximized'],
        headless: false
    }

    const browser = await puppeteer.launch(config)

    const page = await browser.newPage()

    if (process.env.NODE_ENV !== 'production') {
        await page.setViewport({
            width: 1920,
            height: 1080
        })
    }

    await page.goto('https://ikwilhuren.nu/alle-woningcomplexen/breda/1349-duurstedestraat-90-t-m-122-heeckerenstraat-13-t-m', {
        waitUntil: 'networkidle2'
    })

    await Promise.all([
        page.waitForSelector('#loginFormUsername'),
        page.waitForSelector('#loginFormPassword')
    ])

    await delay(3000)

    await page.type('#loginFormUsername', process.env.MVGM_LOGIN_USERNAME)
    await page.type('#loginFormPassword', decrypt(process.env.MVGM_LOGIN_PASSWORD))

    await page.waitForSelector('button.loginFormSubmit')

    await page.evaluate(() => {
        const $el = document.querySelector('button.loginFormSubmit')
        if ($el) $el.click()
    })



    const houses = await page.$$('.search-result.search-result-complex.woning')

    const info = []
    for (let i = 0; i < houses.length; i++) {
        const house = houses[i];
        const title = await house.$eval('.street-name.straat', el => el.textContent),
            id = await house.evaluate(node => node.parentElement.id),
            price = await house.$eval('.page-price', el => el.textContent),
            link = await house.$eval('.detaillink', el => el.href),
            image = await house.$eval('.search-result-img.foto img', el => el.src),
            specs = await house.$$eval('.search-result-specs li', el => el.map(item => {
                return {
                    [item.querySelector('.label.d-none').textContent]: item.textContent.replace(item.querySelector('.label.d-none').textContent, '')
                }
            }))
        info.push({
            title: title,
            price: price,
            link: link,
            specs: specs,
            image: image,
        })
    }
    slacknotify(
        mvgmSlack(info)
    ).then(res => {
        browser.close()
    })

}


