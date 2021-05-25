'use strict';
global.__base = global.__base || __dirname + '/';
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const { describe, it, after, before } = require('mocha');
const Page = require('../lib/homePage');
const locator = require('../utils/locator');

const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

process.on('unhandledRejection', () => {
    console.log('Throw Unhandle Rejection');
});


(async function example() {
    try {
        describe ('BSTAR Login Automated Testing', async function () {
            this.timeout(120000);
            let driver, page;

            beforeEach (async () => {
                page = new Page();
                driver = page.driver;
                await driver.manage().window().setRect({width:1024, height: 768});
                await page.visit(process.env.APP_URL.toString());
            });

            afterEach (async () => {
                //await page.quit();
                setTimeout(async () => {
                    console.log("Prepartion Close Web After 2 Seconds");
                    await this.driver.close();
                }, 2000);
            });
			
            it.only('Do Login', async () => {
                let result = await page.doLoginSuccess('Scenario1');
                expect(result.fdata,'Version Login Not Match').to.equal('1.11.7');
            });

        });
    } catch (ex) {
        console.log ('Exception ' + new Error(ex.message));
    } 
})();