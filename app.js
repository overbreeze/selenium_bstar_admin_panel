global.__base = global.__base || __dirname + '/';

const webServer = require(__base + 'services/web-server.js');
const path = require('path');
const Logger = require(__base + 'lib/logger.js');
global.logger = new Logger(); 
global.PARTNER = 'ARTAJASA';

async function startup() {
        
    try {
        logger.info('Initializing web server module');
        await webServer.initialize();
    } catch (err) {
        logger.error(err);

        process.exit(1); // Non-zero failure code
    }
}

startup();

async function shutdown(e) {
    let err = e;

    logger.info('Shutting down');

    try {
       logger.info('Closing web server module');

        await webServer.close();
    } catch (e) {
        logger.error('Encountered error', e);

        err = err || e;
    }
    
    logger.info('Exiting process');

    if (err) {
        process.exit(1); // Non-zero failure code
    } else {
        process.exit(0);
    }
}

process.on('SIGTERM', () => {
    logger.info('Received SIGTERM');

    shutdown();
});

process.on('SIGINT', () => {
    logger.info('Received SIGINT');

    shutdown();
});

process.on('uncaughtException', err => {
    logger.info('Uncaught exception');
    logger.error(err);

    shutdown(err);
});