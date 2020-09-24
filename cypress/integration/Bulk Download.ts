import { range } from "../core/utils";

describe('Test bulk download', () => {

    beforeEach(() => {
        cy.viewport('macbook-13')

        //Go to Download
        cy.visit('/eurostat/databrowser/bulk?lang=en')

        //wait for page to load
        
        cy.get('#loading-bar-spinner', { timeout: 10000 })
            .should('not.exist', 'Wait for page to load')
    })

    it('1. First test', () => {
        
    })
})