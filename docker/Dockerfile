FROM node:12.8 AS build_npm
WORKDIR /usr/src/app
COPY package*.json ./
RUN ["npm", "install"]

FROM node:12.8
WORKDIR /usr/src/app
COPY --from=build_npm /usr/src/app/node_modules ./node_modules
COPY . .
COPY scripts/wait-for-it.sh /usr/src/wait-for-it.sh
COPY scripts/startup.sh /usr/src/startup.sh
RUN chmod +x /usr/src/wait-for-it.sh
RUN chmod +x /usr/src/startup.sh
CMD ["/usr/src/startup.sh"]
