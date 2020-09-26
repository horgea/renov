Cypress.Commands.add("parseXlsx", (inputFile) => {
    return cy.task('parseXlsx', { filePath: inputFile })
    });

Cypress.Commands.add('unzip', (file, folder) => {
    return cy.task('unzip', (file, folder))
})
