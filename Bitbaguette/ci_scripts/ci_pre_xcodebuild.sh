#!/bin/sh

# Set the -e flag to stop running the script in case a command returns
# a nonzero exit code.
set -e

# install some dependencies
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
brew install node@20

# install JavaScript dependencies in project root
cd ..
npm ci

# build browser extension
npm run build
