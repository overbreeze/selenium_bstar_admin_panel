const Logger = require(__base + 'lib/logger');
const logger = new Logger();
const crypto = require('crypto');

class PasswordCrypto{
    constructor(valueText = '', padding){
        this.valueText = valueText;
        this.padding = padding;
    }

    setValueText(...valueText){
        this.valueText = valueText;
        return this;
    }

    setPadding(...padding){
        this.padding = padding;
        return this;
    }

    async encryptValue(){
        try {
            const chiper=crypto.createCipheriv('aes-256-cbc',process.env.CRYPTO_KEY,process.env.CRYPTO_IV);
            var data = chiper.update(this.valueText,'utf8','hex');	
            data += chiper.final('hex');
            return data;
        } catch(err) {
            logger.error(err);
            return '';
        }
    }

    async decryptValue(){
        try {
            var isPadding = (this.padding === 'true');
            const decipher=crypto.createDecipheriv('aes-256-cbc',process.env.CRYPTO_KEY,process.env.CRYPTO_IV);
            decipher.setAutoPadding(true);
            var data = decipher.update(this.valueText,'hex','utf8');	
            data += decipher.final('utf8');
            var tempdata = data.replace(/[\u0080-\u07ff]/g, '').replace(/\0/g, '');
            logger.info(`Padding True ` + tempdata);
            return tempdata;
        } catch(err) {
            try {
                var isPadding = (this.padding === 'true');
                const decipher=crypto.createDecipheriv('aes-256-cbc',process.env.CRYPTO_KEY,process.env.CRYPTO_IV);
                decipher.setAutoPadding(false);
                var data = decipher.update(this.valueText,'hex','utf8');	
                data += decipher.final('utf8');
                var tempdata = data.replace(/[\u0080-\u07ff]/g, '').replace(/\0/g, '');
                logger.info(`Padding False ` + tempdata);
                return tempdata;
            } catch(err) {
                logger.error(err.message);
                return '';
            }
        }
    }
}

module.exports = PasswordCrypto;