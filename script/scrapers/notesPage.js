const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin())

async function scrapeFragranticaNotePage(url) {
    try {
        const browser = await puppeteer.launch({ headless: true })
        const page = await browser.newPage()
        await page.goto(url)

        await page.waitForXPath('//*[@id="main-content"]/div[1]/div[1]/div/div[1]/div/div[1]/h1')
        await page.waitForXPath('//*[@id="main-content"]/div[1]/div[1]/div/div[1]/div/div[1]/h3/b')
        await page.waitForXPath('//*[@id="main-content"]/div[1]/div[1]/div/div[2]/p')

        // name
        const noteName = await page.$eval('#main-content > div.grid-x.grid-margin-x > div.small-12.medium-8.large-9.cell > div > div:nth-child(1) > div > div:nth-child(1) > h1', noteNameEl => {
            return noteNameEl.textContent.trim()
        })

        // category
        const noteCategory = await page.$eval('#main-content > div.grid-x.grid-margin-x > div.small-12.medium-8.large-9.cell > div > div:nth-child(1) > div > div:nth-child(1) > h3 > b', noteCategoryEl => {
            return noteCategoryEl.textContent.trim()
        })

        // Odor Profile
        const noteOdorProfile = await page.$eval('#main-content > div.grid-x.grid-margin-x > div.small-12.medium-8.large-9.cell > div > div.cell.callout > p', noteProfileEl => {
            let initialTextContent = noteProfileEl.textContent.trim()
            if (initialTextContent.startsWith('Odor profile: ')) {
                initialTextContent = initialTextContent.slice(14)
            }
            if (initialTextContent.endsWith('.')) {
                initialTextContent = initialTextContent.slice(0, -1)
            }
            return initialTextContent
        })

        await browser.close()

        return [{
            name: noteName,
            odorProfile: noteOdorProfile,
            url
        },
        {
            name: noteCategory
        }]
    } catch (err) {
        console.error(err)
        await browser.close()
    }
}

// DON'T RUN YET
async function scrapeFragranticaNotesPage() {
    try {
        const browser = await puppeteer.launch({ headless: true })
        const page = await browser.newPage()
        await page.goto('https://www.fragrantica.com/notes/')

        await page.waitForXPath('//*[@id="main-content"]/div[1]/div[1]/div/div[6]/div/div[1]/a')

        const notePageUrls = await page.$$eval('#main-content > div.grid-x.grid-margin-x > div.small-12.medium-8.large-9.cell > div > div > div > div > a', arrOfNotes => {
            return arrOfNotes.map(noteEl => noteEl.getAttribute('href'))
        })

        await browser.close()

        console.log('scraping...')

        const scrapedUrls = notePageUrls.map(url => scrapeFragranticaNotePage(url))

        console.log('done scraping', `the first note and category are ${scrapedUrls[0][0].name}, ${scrapedUrls[0][1].name}`)

        // return notePageUrls.map(url => scrapeFragranticaNotePage(url))
    } catch (err) {
        await browser.close()
        console.error(err)
    }
}

module.exports = scrapeFragranticaNotesPage

scrapeFragranticaNotesPage()

// test url 1
// scrapeFragranticaNotePage('https://www.fragrantica.com/notes/Bergamot-75.html')

// test url 2
// scrapeFragranticaNotePage('https://www.fragrantica.com/notes/Bearberry-344.html')

// test url 3
// scrapeFragranticaNotePage('https://www.fragrantica.com/notes/White-Ginger-Lily-739.html')