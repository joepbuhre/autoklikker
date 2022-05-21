const puppeteer = require("puppeteer")
const { slacknotify } = require("./notify")

module.exports.querySelectorAll = async (page = puppeteer.Page, selector) => {
    return page.evaluate(() => {
        return document.querySelector(selector)
    })
}


module.exports.mvgmSlack = (html = [{ title: String, price: String, link: String, specs: String, image: String }]) => {
    const blocks = [
        {
			type: "header",
			text: {
				type: "plain_text",
				text: "Nieuwe huizen gevonden!",
			}
		},{
        type: "section",
        text: {
            type: "mrkdwn",
            text: `Er zijn ${html.length} nieuw huizen gevonden. Bekijk hieronder welke!`
        }
    }]
    html.forEach(item => {
        const specs = item.specs.map(item => {
            const entries = Object.entries(item)[0]
            return `- *${entries[0]}:* ${entries[1]}`
        })

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