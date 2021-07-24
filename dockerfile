FROM node:13.11.0
 
COPY package.json migration/
RUN cd migration && npm install
 
COPY scripts/migrate.js migration/
COPY scripts/utils.js migration/
 
COPY builds/ExchangeV1.abi migration/abi/
COPY builds/Router.abi migration/abi/
COPY builds/Token.abi migration/abi/
 
COPY .env /migration/
 
WORKDIR migration/
 
ENTRYPOINT node migrate.js