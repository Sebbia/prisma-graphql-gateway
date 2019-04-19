FROM node:8

WORKDIR /server

COPY ./package.json \
    ./entrypoint.sh \
    ./index.js \
    ./*.json \
    /server/

RUN chmod +x ./*.sh && apt-get update && apt-get install -y nmap bash curl && \
    npm install
    
CMD npm start
