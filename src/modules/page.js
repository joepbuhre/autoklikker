const puppeteer = require("puppeteer")

module.exports.puppeteerOptions = _ => {
    const config = {}

    if(process.env.NODE_ENV !== 'production') {
        config['headless']  = false
    }
    return config
}

module.exports.setPage = async _ => {
    const config = {
        args: ['--start-maximized'],
        headless: false
    }


    const browser = await puppeteer.launch(config)

    const page = await browser.newPage()

    if(process.env.NODE_ENV !== 'production') {
        await page.setViewport({
            width: 1920,
            height: 1080
        })
    }

    return {page, browser}
}

module.exports.setBrowser = async _ => {
    const config = {
        args: ['--start-maximized'],
        headless: false
    }


    const browser = await puppeteer.launch(config)

    const page = await browser.newPage()

    if(process.env.NODE_ENV !== 'production') {
        await page.setViewport({
            width: 1920,
            height: 1080
        })
    }
    return page
}