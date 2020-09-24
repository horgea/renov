import { range } from "../core/utils";
import { stubTrue } from "cypress/types/lodash";

describe('Test bulk download', () => {

    beforeEach(() => {
        cy.viewport('macbook-13')
        cy.setCookie('eu_cookie_consent', '%7B%22a%22%3A%7B%22estat%22%3A%5B%22customSavedPresentation%22%2C%22userSelection-list%22%2C%22navtree-user-settings%22%5D%2C%22europa%22%3A%5B%22all_documented%22%5D%7D%2C%22r%22%3A%7B%7D%7D')


        //Go to Download
        cy.visit('/eurostat/databrowser/bulk?lang=en')
    })

    it('1. Download AGRIPROD', () => {
        cy.contains('Code lists', { timeout: 10000 })
            .should('be.visible')
            .click()

        cy.get('.form-control')
            .type('AGRIPROD')

        cy.get('#AGRIPROD', {timeout: 10000})
            .should('be.visible')
            .find('input')
            .should('not.be.checked')
            .check({force:true})

        cy.contains('code list (sdmx') //select sdmx
            .parent().find('.md-icon')
            .click({force:true})
        
        cy.contains('code list (.tsv') //select tsv
            .parent().find('.md-icon')
            .click({force:true})
       

        cy.get('[ng-click="bulkDispatcher(ACTION_EXECUTE)"]') //Apply
            .should('be.visible')
            .click({force:true})
    
        cy.contains('Start')
            .click({force:true})

        cy.wait(20000)
    })
})  