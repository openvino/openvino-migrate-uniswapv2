#!/bin/sh

echo "\n 1) Preparing the migration environment... \n"
docker build -t migrations . > /dev/null 2>&1

echo "\n 2) Migrating the liquidity...\n"
docker run migrations --name migrations

echo "\n 3) Cleaning the setup...\n"
docker rmi -f node:13.11.0 migrations > /dev/null 2>&1

