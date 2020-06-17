FROM nikolaik/python-nodejs:latest

RUN mkdir -p /app
WORKDIR '/app'

RUN npm install -g truffle && npm config set bin-links false

COPY client/package.json ./client/package.json
COPY client/package-lock.json ./client/package-lock.json

ENV PATH /app/client/node_modules/.bin:$PATH

RUN cd client && npm ci

COPY . ./