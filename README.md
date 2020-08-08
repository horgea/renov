## How to run it

The steps below will take you all the way through Cypress. It is assumed you have nothing installed except for node + git.

**If you get stuck, here is more help:**

* [Gitter Channel](https://gitter.im/cypress-io/cypress)
* [Cypress Docs](https://on.cypress.io)

### Install Cypress

[Follow these instructions to install Cypress.](https://on.cypress.io/guides/installing-and-running#section-installing)

```bash
## clone this repo to a local directory
git clone https://github.com/horgea/dingo.git

## cd into the cloned repo
cd dingo

## install the node_modules
npm install

## run tests directly from terminal
npx cypress run

## or open cypress UI interface and click on test.js
npx cypress open

## once its finished you can inspect more details from it's top frame (check test execution.png)
```

Tests are available under cypress/integration/tests.js
Implementations are referenced from cypress/modules/petModule.js