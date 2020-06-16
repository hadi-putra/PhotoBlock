FROM tarampampam/node:13-alpine

RUN mkdir -p /app
WORKDIR '/app'

#RUN apk add -t .gyp --no-cache python g++ make \
#    && npm install -g truffle@3.2.x \
#    && apk del .gyp


#COPY contracts ./contracts
#COPY migrations ./migrations
#COPY test ./test
#COPY truffle-config.js ./truffle-config.js


#COPY client/src ./client/src
#COPY client/public ./client/public
COPY client/package.json ./client/package.json
COPY client/package-lock.json ./client/package-lock.json

ENV PATH /app/client/node_modules/.bin:$PATH

RUN cd client \
    && apk add -t .gyp --no-cache --virtual python g++ make \
    && npm i -g npm && npm ci \
    && apk del .gyp

COPY . ./