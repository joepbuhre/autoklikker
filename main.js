const { KlikVoorWonen, mvgm } = require("./src/app");
require('dotenv').config()

// KlikVoorWonen()

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const args = yargs(hideBin(process.argv))
    .option('names', {
        alias: 'n',
        type: 'array'
    })
    .parse()

const sites = {
    klikvoorwonen: KlikVoorWonen,
    mvgm: mvgm,
    test: () => {
        console.log('test succes!')
    }
}
process.args = args

args.names.forEach(name => {
    if(name in sites) {
        sites[name]()
    }
});
