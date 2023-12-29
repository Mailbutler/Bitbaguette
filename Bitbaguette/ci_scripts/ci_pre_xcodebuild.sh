#!/bin/sh

# Set the -e flag to stop running the script in case a command returns
# a nonzero exit code.
set -e

# install some dependencies
brew install node

# install JavaScript dependencies in project root
cd ..
npm ci

# build browser extension
npm run build
