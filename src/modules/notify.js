const { default: axios } = require("axios")

module.exports.slacknotify = json => {
    return new Promise((resolve, reject) => {
        if(process.env.NODE_ENV === 'production') {
            axios.post(process.env.SLACK_NOTIFY_WEBHOOK, JSON.stringify(json)).then(resolve).catch(resolve)
        } else {
            console.log(JSON.stringify(json, null, 4))
            resolve(true)
        }
    })
}