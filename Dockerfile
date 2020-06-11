FROM node:latest

WORKDIR '/app'

#ENV PATH /app/client/node_modules/.bin:$PATH

RUN npm install -g truffle && npm config set bin-links false

#COPY contracts ./contracts
#COPY migrations ./migrations
#COPY test ./test
#COPY truffle-config.js ./truffle-config.js


#COPY client/src ./client/src
#COPY client/public ./client/public
COPY client/package.json ./client/package.json
COPY client/package-lock.json ./client/package-lock.json
RUN cd client && npm ci

COPY . ./