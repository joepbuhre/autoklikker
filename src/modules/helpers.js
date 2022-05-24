const puppeteer = require("puppeteer")
const { slacknotify } = require("./notify")

module.exports.querySelectorAll = async (page = puppeteer.Page, selector) => {
    return page.evaluate(() => {
        return document.querySelector(selector)
    })
}


module.exports.mvgmSlack = (html = [{ title: String, price: String, link: String, specs: Array, image: String }]) => {
    const date = new Date()
    const blocks = [
        {
			type: "header",
			text: {
				type: "plain_text",
				text: `Nieuwe huizen gevonden! (${date.toLocaleString('nl-NL', {dateStyle: 'medium', timeStyle: 'short'})})`,
			}
		},{
        type: "section",
        text: {
            type: "mrkdwn",
            text: `Er zijn ${html.length} nieuw huizen gevonden. Bekijk hieronder welke!`
        }
    }]
    html.forEach(item => {
        let specs;
        if(!Array.isArray(item.specs) || !(item.specs.length < 1) ) {
            specs = ['']
        } else {
            specs = item.specs.map(item => {
                const entries = Object.entries(item)[0]
                return `- *${entries[0]}:* ${entries[1]}`
            })
        }
        

        const markdown = `*${item.title}*\n\n${item.price}*\n${specs.join('\n')}\n\n<${item.link}|Bekijk dit huis>`
        blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: markdown
            },
            accessory: {
                type: "image",
                image_url: item.image,
                alt_text: item.title
            }
        })
        blocks.push({
            type: 'divider'
        })
    })
    const jsonSlack = {
        blocks: blocks
    }
    return jsonSlack
}