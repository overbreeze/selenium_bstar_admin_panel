'use strict';
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const path = require('path');
const { createLogger, format, transports } = require('winston');
const filename = path.join(__dirname, '../logs/access.log');
var dateFormat = require('dateformat');

const timezoned = () => {
    //console.log(process.env.TZ);
    return new Date().toLocaleString('en-US', {
        timeZone: process.env.TZ,
        hour12: false,
    });
}

const timezonedToString = () => {
    return dateFormat(timezoned(), 'yyyy-mm-dd HH:MM:ss');

}

const logger = createLogger({
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
            //format: timezonedToString()
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename })
    ]
});

class CustomLogger {
    constructor() {

    }

    info(data) {
        logger.log('info', data);
    }

    error(data) {
        logger.log('error', data);
    }

};

module.exports = CustomLogger;