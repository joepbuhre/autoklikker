const crypto = require('crypto')
const { create_table } = require('./database/dbconfig.js')
const { encrypt } = require('./password.js')
const readline = require('readline');
const chalk = require("chalk");


function askQuestion(query, muted = false) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl._writeToOutput = function _writeToOutput(stringToWrite) {
        if (muted)
            rl.output.write("\x1B[2K\x1B[200D" + query + "[" + ((rl.line.length % 2 == 1) ? "=-" : "-=") + "]");
        else
            rl.output.write(stringToWrite);
    };
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}


(async() => {
    console.clear()
    const ans = await askQuestion("Do you have already set up a secret key in the .env file? (Y,n)");
    if (ans === 'n') {
        console.log(`Your secret key is ${chalk.red.underline.bold(crypto.randomBytes(32).toString('hex'))}. Please store this in the .env file under SECRET_KEY`)
        await askQuestion("\nPress enter if you've saved it to your .env file")
    }
    require('dotenv').config()
    console.log(`Your secret key = ${process.env.SECRET_KEY}\n`)

    console.log("What is your password to the site? Press enter when done.\n")
    const password = await askQuestion("", true)
    password_enc = encrypt(password)

    console.log(`\nYour encrypted password is '${password_enc}'. Please store this in the .env file under PASSWORD_ENC.`)
    await askQuestion("\nPress enter if you've saved it to your .env file")

    create_table()

    console.log(`Table created. Run ${chalk.inverse('node app.js')} to test the new script`)
})();