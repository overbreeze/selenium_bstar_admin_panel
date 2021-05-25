'use strict';
let Page = require('../lib/basePage');
const locator = require('../utils/locator');
const fake = require('../utils/fakeData');
const { Key } = require('selenium-webdriver');
const { username, password } = require('../utils/locator');
const fs = require('fs');

const searchInputSelectorId = locator.searchInputSelectorId;
const searchButtonSelectorName = locator.searchButtonSelectorName;
const resultConfirmationSelectorId = locator.resultConfirmationId;
const fakeNameKeyword = fake.nameKeyword;
let searchInput, searchButton, resultStat;

const userInput = locator.username;
const passInput = locator.password;
let searchUsername, searchPassword, resultSubmitLogin;
const confTimeout = 30000; //30 Seconds

Page.prototype.findInputAndButton = async function () {
    searchInput = await this.findById(searchInputSelectorId);
    searchButton = await this.findByName(searchButtonSelectorName);

    await this.driver.wait(async function () {
        const searchButtonText = await searchButton.getAttribute('value');
        const searchInputEnableFlag = await searchInput.isEnabled();

        return {
            inputEnabled: searchInputEnableFlag,
            buttonText: searchButtonText
        }
    }, 5000);
};

Page.prototype.submitKeywordAndGetResult = async function() {
    await this.findInputAndButton();
    await this.write(searchInput, fakeNameKeyword);
    await searchButton.click();
    resultStat = await this.findById(resultConfirmationSelectorId);
    await this.driver.wait(async function () {
        return resultStat.getText();
    }, 5000);
};

Page.prototype.findUsernameAndPasswordLogin = async function () {    
    searchPassword = await this.findByName(password);
    searchUsername = await this.findByName(username);
    
    await this.driver.wait(async function () {        
        const _password = await searchPassword.getAttribute('name');
        const _username = await searchUsername.getAttribute('name');
        return {
            fInputLogin: _username,
            fInputPassword: _password
        }
    }, 5000);
};

Page.prototype.doLoginSuccess = async function (scenario) {
    try{        
        await capture_image(this.driver, scenario+'01');
        await this.driver.wait(async() => {
            return this.driver.executeScript('return document.readyState').then(function(readyState) {
                console.log(readyState);
                return readyState === 'complete';
            }, confTimeout);
        });

        await this.findUsernameAndPasswordLogin(); 
        await this.write(searchUsername, 'admin1234');       
        await this.write(searchPassword, '1234567');

        let submitButton = await this.driver.wait(this.findByXPath("//button[@type='submit']"), 15000, 'Looking for element Versi');
        const _submit = await submitButton.getAttribute('name');	
        await capture_image(this.driver, scenario+'02');
        
        //await submitButton.submit();
        await submitButton.sendKeys(Key.RETURN);
        
        await this.driver.manage().setTimeouts( { implicit: confTimeout } );
        //This config timeout value must be grather than cek element
        await this.driver.wait(async() => {
            return this.driver.executeScript('return document.readyState').then(function(readyState) {
                console.log(readyState);
                return readyState === 'complete';
            }, confTimeout);
        });
        const elemVersi = await this.driver.wait(this.findByXPath("//footer/div/a"), 10000, 'Looking for element Versi');
        const elemVersiValue = await elemVersi.getText();    

        if(elemVersiValue){    
            await capture_image(this.driver, scenario+'03Success');
            return {
                fresult: true,
                fdata: elemVersiValue
            }
        } else {
            return {
                fresult: false,
                fdata: 'Element Not Found'
            }
        }
        
    } catch(err){
        console.log("Page: did not load within certain seconds!");
        await capture_image(this.driver, scenario+'03Failed');
        return {
            fresult: false,
            fmessage: err
        }
    }
};


async function check_title(driver){
    driver.getTitle().then(
        function(title){
            return title;
        }
    );
}

async function capture_image(driver, file){
    await driver.takeScreenshot().then(
		function(image, err) {
			fs.writeFile(file+'.png', image, 'base64', function(errFs) {
				console.log(errFs);
			});
		}
	);
}

module.exports = Page;