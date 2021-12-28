const fs = require('fs')

fs.readFile('.env', 'utf8', (err, data) => {
    if (err) {
        console.error(err)
        return
    }
    const env_file = data.split("\n")
    var obj = {}
    env_file.forEach(el => {
        obj[el.split('=')[0]] = el.split('=')[1]
    });
    console.log(obj)
})