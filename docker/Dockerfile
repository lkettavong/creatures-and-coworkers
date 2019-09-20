FROM node:12.8 AS build_npm
WORKDIR /usr/src/app
COPY package*.json ./
RUN ["npm", "install"]

FROM node:12.8
WORKDIR /usr/src/app
COPY --from=build_npm /usr/src/app/node_modules ./node_modules
COPY . .
RUN chmod +x /usr/src/app/scripts/wait-for-it.sh
RUN chmod +x /usr/src/app/scripts/startup.sh
CMD ["/usr/src/app/scripts/startup.sh"]
