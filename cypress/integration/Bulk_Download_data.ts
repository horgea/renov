require("cypress-downloadfile/lib/downloadFileCommand");

describe("Test bulk download", () => {
  before(() => {
    cy.server();

    cy.route("POST", "https://webgate.acceptance.ec.europa.eu/eurostat/databrowser-backend/api/bulk/1.0/LIVE/export/dataflowItems").as("exportDataflowItems");

    cy.route('/eurostat/databrowser-backend/api/bookmark/LIVE/*').as('dataFlow')
  });

  beforeEach(() => {
    //clear zip download folder
    cy.exec("rm -f cypress/fixtures/*", { failOnNonZeroExit: false });
    cy.viewport("macbook-13");
    cy.setCookie(
      "eu_cookie_consent",
      "%7B%22a%22%3A%7B%22estat%22%3A%5B%22customSavedPresentation%22%2C%22userSelection-list%22%2C%22navtree-user-settings%22%5D%2C%22europa%22%3A%5B%22all_documented%22%5D%7D%2C%22r%22%3A%7B%7D%7D"
    );

    //Go to Download
    cy.visit("/eurostat/databrowser/bulk?lang=en");
  });

  function selectCodeLists(codeLists: string[]) {
    codeLists.forEach((item) => {
      cy.get(".form-control")
        .invoke("val", item)
        .trigger("change")

      cy.get(`#${item}`)
        .should("be.visible")
        .and('have.length', 1, "Not Unique code result")
        .find("input")
        .should("not.be.checked")
        .check({ force: true });
    });
  }

  it("1. Bulk Download Data", () => {
    
    //get RSS feed
    cy.request('http://ec.europa.eu/eurostat/SDMX/diss-web/en/rss.rss').then(response => {
      let mySet = new Set<string>()
      const xml:XMLDocument = Cypress.$.parseXML(response.body)
      const myItem = xml.getElementsByTagName("item")
        Cypress.$(myItem).each(function() {
          const item = Cypress.$(this).find("title").text().replace( /(^.*\[|\].*$)/g, '' )
          mySet.add(item.toUpperCase())
        })

        let myArray = Array.from(mySet);
        let myCodeLists = myArray.filter((item,index) => myArray.indexOf(item) === index);

        if(myArray.length >= 10){
          myCodeLists = myArray.slice(0, 10);
        }
        
        cy.wait('@dataFlow')
        cy.get('.table td', {timeout: 20000})
          .should('be.visible')
        
        selectCodeLists(myCodeLists);
    
        cy.contains("Download data (sdmx") //select sdmx
          .parent()
          .find(".md-icon")
          .click({ force: true });
    
        cy.contains("Download data (.tsv") //select tsv
          .parent()
          .find(".md-icon")
          .click({ force: true });
    
        //#region remove ovelaped objects
        cy.get("#select_container_4").invoke("attr", "style", "display: none");
    
        cy.get(".md-select-backdrop").invoke("attr", "style", "display: none");
    
        cy.get(".md-scroll-mask").invoke("attr", "style", "display: none");
        //#endregion
    
        cy.get('[ng-click="bulkDispatcher(ACTION_EXECUTE)"]') //Apply
          .should("be.visible")
          .click();
    
        cy.contains("CONFIRMATION")
          .should("be.visible");
    
        cy.get(".nav-pills li")
          .first()
          .should("have.text", "Items selected: " + myCodeLists.length);
    
        cy.contains("Start")
          .should("be.visible")
          .click();
    
        //get uuid to request download
        cy.wait("@exportDataflowItems").then((xhr: any) => {
          expect(xhr.status).to.eql(200);
          expect(xhr.responseBody.uuid).to.exist;
          const fileName: string = "archives_" + xhr.responseBody.uuid + ".zip";
          const downloadFolder: string = "cypress/fixtures/";
          const downloadStatus: string = `https://webgate.acceptance.ec.europa.eu/eurostat/databrowser-backend/api/bulk/1.0/LIVE/export/status/${xhr.responseBody.uuid}`;
          const dowloadLink: string = `https://webgate.acceptance.ec.europa.eu/eurostat/databrowser-backend/api/bulk/1.0/LIVE/export/download/bulk/${xhr.responseBody.uuid}`;
    
          //workaroud for page still loading
          cy.visit("/eurostat/databrowser/bulk?lang=en", {
            timeout: 1000,
            failOnStatusCode: false,
          });
    
          //download file by request as UI is browser dependend
          cy.request({
            method: "POST",
            url: downloadStatus,
          }).then((response) => {
            expect(response.status).to.eql(200);
            cy.downloadFile(dowloadLink, downloadFolder, fileName).then(() => {
              cy.readFile(downloadFolder + fileName).then(() => {
                cy.exec(`zipinfo -1 ${downloadFolder + fileName}`).then((results) => {
                  const xmlFile = results.stdout
                    .split("\n")
                    .filter((file) => file.endsWith(".xml"));
                  const tsvFile = results.stdout
                    .split("\n")
                    .filter((file) => file.endsWith(".tsv"));
                  expect(xmlFile).to.have.length(myCodeLists.length);
                  expect(tsvFile).to.have.length(myCodeLists.length);
                });
              });
            });
          });
        });
      });
    })
});
