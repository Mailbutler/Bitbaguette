#!/bin/sh

# install some dependencies
brew install node@18

# install JavaScript dependencies in project root
cd ..
npm ci

# build browser extension
npm run build
