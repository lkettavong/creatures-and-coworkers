#! /bin/bash

/usr/src/wait-for-it.sh postgres:5432 -t 30 -- npm run migrate && npm start
