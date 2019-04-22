FROM node:8

WORKDIR /server

COPY ./package.json \
    ./index.js \
    ./*.json \
    /server/

RUN apt-get update && apt-get install -y nmap bash curl && \
    npm install

EXPOSE 4000

CMD npm start
