#! /bin/bash

/usr/src/wait-for-it.sh postgres:5432 -t 30 -- npm run migrate && echo Hello && npm run seed && echo There && npm start
