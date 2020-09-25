Cypress.Commands.add("parseXlsx", (inputFile) => {
    return cy.task('parseXlsx', { filePath: inputFile })
    });

// Cypress.Commands.add("readFromZip", (inputFile) => {
//     return cy.task('readFromZip', inputFile)
//     });
