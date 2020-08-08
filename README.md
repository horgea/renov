## How to run it

The steps below will take you all the way through Cypress. It is assumed you have nothing installed except for node + git.

**If you get stuck, here is more help:**

* [Gitter Channel](https://gitter.im/cypress-io/cypress)
* [Cypress Docs](https://on.cypress.io)

### Install Cypress

[Follow these instructions to install Cypress.](https://on.cypress.io/guides/installing-and-running#section-installing)

```bash
## clone this repo to a local directory
git clone https://github.com/horgea/renov.git

## cd into the cloned repo
cd RENOV

## install the node_modules
npm install

## or open cypress UI interface and click on test.js
npx cypress open


## run tests directly from terminal headless in default browser (electron)
npx cypress run

## run tests directly from terminal headless in defined browser
npx cypress run --browser chrome --headless

## run a script that will run all tests in 3 browsers (chrome, firefox, edge). 
## You must have those browsers installed on the machine where run the tests. 
## You can modify the script from package.json file
npm run cy:run

```
