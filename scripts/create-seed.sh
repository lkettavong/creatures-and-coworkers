#! /bin/bash

docker-compose run --rm service npx knex seed:make "$1"
