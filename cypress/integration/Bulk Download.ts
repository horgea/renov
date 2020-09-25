import { range } from "../core/utils";
import { stubTrue } from "cypress/types/lodash";

describe('Test bulk download', () => {

    beforeEach(() => {
        cy.viewport('macbook-13')
        cy.setCookie('eu_cookie_consent', '%7B%22a%22%3A%7B%22estat%22%3A%5B%22customSavedPresentation%22%2C%22userSelection-list%22%2C%22navtree-user-settings%22%5D%2C%22europa%22%3A%5B%22all_documented%22%5D%7D%2C%22r%22%3A%7B%7D%7D')
        cy.server()
        cy.route('**/all_codelists/**').as('myRequest') //last request before page is loaded
        cy.route('POST', '/eurostat/databrowser-backend/api/bulk/1.0/LIVE/export/status/*').as('downloadStatus')

        //Go to Download
        cy.visit('/eurostat/databrowser/bulk?lang=en')
    })

    function selectCodeLists(codeLists: string[]) {
        codeLists.forEach(item => {
            cy.get('.form-control')
                .clear()
                .type(item)

            cy.get(`#${item}`)
                .should('be.visible')
                .find('input')
                .should('not.be.checked')
                .check({force:true})
        })
        
    }

    it.only('test', () => {
        
        cy.readFromZip()
    })

    it('1. Download Code Lists', () => {
        //const myCodeLists = ['AGE', 'AGRIPROD', 'ANIMALS', 'CONTRIB', 'FACILITY', 'LEARNING', 'OPERATOR', 'VEHICLE', 'VICTIM', 'VOLUME']
        const myCodeLists = ['AGE', 'AGRIPROD']
        cy.contains('Code lists', { timeout: 10000 })
            .should('be.visible')
            .click()



        cy.wait('@myRequest', { timeout: 25000 })
        selectCodeLists(myCodeLists)


        cy.contains('code list (sdmx') //select sdmx
            .parent().find('.md-icon')
            .click({force:true})
        
        cy.contains('code list (.tsv') //select tsv
            .parent().find('.md-icon')
            .click({force:true})

        //#region remove ovelaped objects
        cy.get('#select_container_4')
            .invoke('attr', 'style', 'display: none')

        cy.get('.md-select-backdrop')
            .invoke('attr', 'style', 'display: none')

        cy.get('.md-scroll-mask')
            .invoke('attr', 'style', 'display: none')
        //#endregion

        cy.get('[ng-click="bulkDispatcher(ACTION_EXECUTE)"]') //Apply
            .should('be.visible')
            .click()

        cy.contains('CONFIRMATION')
            .should('be.visible')

        cy.get('.nav-pills li')
            .first()
            .should('have.text', 'Items selected: ' + myCodeLists.length)
    
        cy.contains('Start')
            .should('be.visible')
            .click()

        cy.wait('@downloadStatus').then((xhr:any) => {
            expect(xhr.responseBody.progressPercentage).to.eql('100.0', 'Download 100% successful')
        })

        cy.visit('/eurostat/databrowser/bulk?lang=en')

        cy.get('@downloadStatus').its('url').then(zipFile => {
            let fullZipFile:string = 'cypress/downloads/archives_' + zipFile.split('status/')[1] + '.zip'
            //cy.readFromZip(fullZipFile)
            cy.readFromZip('archives_0e549074-b9de-4b0c-83b1-25e3584a6ce3.zip').then((zip:any) => {
                console.log(zip.path)
            // for (const entry of zip) {
            //     const fileName = entry.path;
            //     const type = entry.type; // 'Directory' or 'File'
            //     const size = entry.vars.uncompressedSize; // There is also compressedSize;
            //     console.log(fileName)
            //     entry.autodrain();
            //     }
            })
        })
    })
})  