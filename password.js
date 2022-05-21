const crypto = require("crypto");

class Encrypter {
    constructor(encryptionKey) {
        this.algorithm = "aes-192-cbc";
        this.key = crypto.scryptSync(encryptionKey, "salt", 24);
    }

    encrypt(clearText) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        const encrypted = cipher.update(clearText, "utf8", "hex");
        return [
            encrypted + cipher.final("hex"),
            Buffer.from(iv).toString("hex"),
        ].join("|");
    }

    decrypt(encryptedText) {
        const [encrypted, iv] = encryptedText.split("|");
        if (!iv) throw new Error("IV not found");
        const decipher = crypto.createDecipheriv(
            this.algorithm,
            this.key,
            Buffer.from(iv, "hex")
        );
        return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
    }
}
// Usage


module.exports.encrypt = (password = String) => {
    const encrypter = new Encrypter(process.env.SECRET_KEY)
    return encrypter.encrypt(password)
}
module.exports.decrypt = (encrypted_text = String) => {
    const encrypter = new Encrypter(process.env.SECRET_KEY)
    return encrypter.decrypt(encrypted_text)
}

if(require.main === module) {
    require('dotenv').config()

    const password = process.argv[process.argv.length - 1]
    const encryptedPassword = this.encrypt(password)
    console.log(encryptedPassword)
}