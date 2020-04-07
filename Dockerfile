FROM node:12-alpine

WORKDIR /server

COPY ./package.json /server/

RUN npm install

COPY ./ /server/

EXPOSE 4000

CMD npm start
