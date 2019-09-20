#! /bin/bash

docker-compose run --rm service npx knex migrate:make "$1"
