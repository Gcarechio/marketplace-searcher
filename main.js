const { Builder, By, until, Key } = require('selenium-webdriver');
const fs = require('fs');
const { resolve } = require('path');

const MARKETPLACES = [
    {
        id: "tenda",
        url: "https://www.tendaatacado.com.br/"
    }
];

(async function run() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        let rows = await _readFile('2021-07-06.csv');
        let output = [];
        
        for(let marketplace of MARKETPLACES) {
            await driver.get(marketplace.url);
            
            
            await driver.wait(until.elementLocated(By.xpath(`//input[@placeholder='Como podemos te ajudar hoje?']`)));
            let inputs = await driver.findElements(By.xpath(`//input[@placeholder='Como podemos te ajudar hoje?']`));

            for(let i = 0; i < rows.length; i++) {
                await _clearInput(inputs[0]);
                await inputs[0].sendKeys(rows[i]);

                await driver.findElement(By.xpath(`//button[text()='Buscar']`)).click();

                let mosaicCard = await driver.wait(until.elementLocated(By.xpath(`//section[@class='MosaicCardContainer']`)));
                let cardsRow = await mosaicCard.findElement(By.xpath("./child::*"));
                await cardsRow.findElement(By.xpath("./child::*")).click();
    
                await driver.wait(until.elementLocated(By.xpath(`//span[@class='price-txt']`)));
                let price = (await (await driver.findElement(By.xpath(`//span[@class='price-txt']`))).getAttribute("innerHTML")).split(";")[1];
                
                console.log(price);
                output.push({product: rows[i], price: price});

                sleep(1000)
            }
        }
        console.log(output)
        return;
    }
    catch(err) {
        console.log(err);
        console.log("Execução falhou");
        return ``
    }
    finally {
        driver.quit();
        return;
    }
})();

function _readFile(file) {
    return new Promise((resolve, reject) => {
        fs.readFile(`./input/${file}`, 'utf8' , (err, data) => {
            if (err) {
                console.error(err)
                return
            }
            resolve(data.split(/\r?\n/));
        });
    });
}

async function _clearInput(input) {
    for (let i = 0; i < 60; i++) {
        await input.sendKeys(Key.BACK_SPACE);
    }
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}