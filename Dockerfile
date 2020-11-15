FROM node:14-alpine

WORKDIR /server

COPY ./package.json /server/

RUN npm install

COPY ./ /server/

RUN npm run build

EXPOSE 4000

CMD npm start
