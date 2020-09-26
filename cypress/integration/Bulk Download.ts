require("cypress-downloadfile/lib/downloadFileCommand");

describe("Test bulk download", () => {
  before(() => {
    cy.server();

    cy.route("**/all_codelists/**").as("myRequest"); //last request before page is loaded

    cy.route(
      "POST",
      "https://webgate.acceptance.ec.europa.eu/eurostat/databrowser-backend/api/bulk/1.0/LIVE/export/codeListItems"
    ).as("exportCodeListItems");

    cy.route(
      "POST",
      "https://webgate.acceptance.ec.europa.eu/eurostat/databrowser-backend/api/bulk/1.0/LIVE/export/status/*"
    ).as("exportStatus");
  });

  beforeEach(() => {
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
      cy.get(".form-control").invoke("val", item).trigger("change");

      cy.get(`#${item}`)
        .should("be.visible")
        .find("input")
        //.should("not.be.checked")
        .check({ force: true });
    });
  }

  it("1. Download Code Lists", () => {
    const myCodeLists = [
      "AGE",
      "AGRIPROD",
      "ANIMALS",
      "CONTRIB",
      "FACILITY",
      "LEARNING",
      "OPERATOR",
      "VEHICLE",
      "VICTIM",
      "VOLUME",
    ];
    //const myCodeLists = ["AGE", "AGRIPROD"];
    cy.contains("Code lists", { timeout: 10000 }).should("be.visible").click();

    cy.wait("@myRequest", { timeout: 25000 });
    selectCodeLists(myCodeLists);

    cy.contains("code list (sdmx") //select sdmx
      .parent()
      .find(".md-icon")
      .click({ force: true });

    cy.contains("code list (.tsv") //select tsv
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

    cy.contains("CONFIRMATION").should("be.visible");

    cy.get(".nav-pills li")
      .first()
      .should("have.text", "Items selected: " + myCodeLists.length);

    cy.contains("Start").should("be.visible").click();

    cy.wait("@exportCodeListItems").then((xhr: any) => {
      expect(xhr.status).to.eql(200);
      expect(xhr.responseBody.uuid).to.exist;
      const fileName: string = "archives_" + xhr.responseBody.uuid + ".zip";
      const downloadFolder: string = "cypress/fixtures/";
      const downloadStatus: string = `https://webgate.acceptance.ec.europa.eu/eurostat/databrowser-backend/api/bulk/1.0/LIVE/export/status/${xhr.responseBody.uuid}`;
      const dowloadLink: string = `https://webgate.acceptance.ec.europa.eu/eurostat/databrowser-backend/api/bulk/1.0/LIVE/export/download/bulk/${xhr.responseBody.uuid}`;

      //workaroud for page still loading
      cy.visit("/eurostat/databrowser/bulk?lang=en", {
        timeout: 500,
        failOnStatusCode: false,
      });

      cy.request({
        method: "POST",
        url: downloadStatus,
      }).then((response) => {
        expect(response.status).to.eql(200);
        cy.downloadFile(dowloadLink, downloadFolder, fileName).then(() => {
          cy.readFile(downloadFolder + fileName).then(() => {
            cy.exec(`zipinfo -1 ${downloadFolder +fileName}`).then((results) => {
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
});
