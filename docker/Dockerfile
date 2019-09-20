FROM node:12.8 AS build_npm
WORKDIR /usr/src/app
COPY package*.json ./
RUN ["npm", "install"]

FROM node:12.8
WORKDIR /usr/src/app
COPY --from=build_npm /usr/src/app/node_modules ./node_modules
CMD ["node", "src/index.js"]
