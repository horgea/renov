import { range } from "../core/utils";

describe('Test some complicated scenarios', () => {

    beforeEach(() => {
        cy.viewport('macbook-13')
        cy.setCookie('eu_cookie_consent', '%7B%22a%22%3A%7B%22estat%22%3A%5B%22customSavedPresentation%22%2C%22userSelection-list%22%2C%22navtree-user-settings%22%5D%2C%22europa%22%3A%5B%22all_documented%22%5D%7D%2C%22r%22%3A%7B%7D%7D')
        cy.server()
        cy.route('**/GEO/getCodeListJson/**').as('myTable') //last request before page is loaded

        //Go to required dataset view
        cy.visit('/eurostat/databrowser/view/T2020_10/default/table?lang=en')

        //wait for required Table to load on page
        cy.wait('@myTable', { timeout: 15000 })
        cy.get('#loading-bar-spinner', { timeout: 10000 })
            .should('not.exist', 'Wait for page to load')
    })

    it.skip('1. Check Custom Format - Static Positions - From-to', () => {

        cy.contains('Create custom dataset')
            .should('be.visible')
            .click()

        cy.contains('Define your custom dataset')
            .should('be.visible')

        cy.contains('Static positions')
            .should('be.visible')
            .click()

        cy.contains('From-to')  //select Filter
            .should('be.visible')
            .click()

        cy.get('#rangeFromId')
            .children()
            .first()
            .then(fromItem => {
                const fromValue = parseInt(fromItem.text())

                cy.get('#rangeToId')
                    .children()
                    .first()
                    .then(toItem => {
                        const toValue = parseInt(toItem.text())

                        cy.get('#dimension-4')
                            .children()
                            .first()
                            .should('contain', 'Time')
                            .then(item => {
                                const requiredItems = parseInt(item.text().split('/')[1].split(')')[0])

                                //scroll and save the found values to a List
                                let mySet = new Set();

                                const myRange = range(1, requiredItems, 16); //how many times I need to scroll
                                cy.wrap(myRange)
                                    .each(() => {
                                        cy.get('.md-virtual-repeat-offsetter')
                                            .find('.label')
                                            .each(item => {
                                                let myYear = parseInt(item.text())
                                                mySet.add(myYear)
                                            })
                                        cy.get('.md-virtual-repeat-offsetter')
                                            .find('.label')
                                            .last()
                                            .scrollIntoView()
                                            .wait(500)
                                    })

                                // Data Validation
                                cy.wrap(mySet)
                                    .should('have.length', requiredItems, 'Total rows in table')
                                    .then(content => {
                                        const myArray = Array.from(content.values())
                                        cy.wrap(myArray).each(year => {
                                            expect(year).to.be.within(fromValue, toValue, 'Validate Year')
                                        })
                                    })
                            })
                    })
            })
    })

    it.skip('2. Check Change Format of Decimal Symbol to Comma', () => {
        cy.contains('Format')
            .should('be.visible')
            .click()

        // get all available cells and count the Dots
        cy.get('.cell-value')
            .then(allCells => {
                const currentDots = allCells.text().match(/[.]/g).length

                cy.contains('comma')
                    .click()

                cy.get('#loading-bar-spinner')
                    .should('not.exist')

                //get all available cells and count the Commas 
                cy.get('.cell-value')
                    .then(allCells => {
                        const currentCommas = allCells.text().match(/[:]/g).length

                        expect(currentDots).to.eql(currentCommas, 'All Dots have changed to Commas')
                    })
            })
    })
})