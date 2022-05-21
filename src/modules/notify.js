const { default: axios } = require("axios")

const slackapi = axios.create({
    baseURL: 'https://hooks.slack.com/services/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'
})


module.exports.notify = params = {

}

module.exports.slacknotify = json => {
    return axios.post('https://hooks.slack.com/services/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', JSON.stringify(json))
}