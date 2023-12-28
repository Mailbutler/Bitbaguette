#!/bin/bash
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

# start in project root
cd "$SCRIPT_DIR/.."

# get version and build number
VERSION_NUMBER=$(cat package.json | jq -r '.version')

GIT=$(
    sh /etc/profile
    which git
)
BRANCH_NAME=$("$GIT" rev-parse --abbrev-ref HEAD)
BUILD_NUMBER=$(expr $("$GIT" rev-list $BRANCH_NAME --count) - $("$GIT" rev-list HEAD..$BRANCH_NAME --count))
if [ $BRANCH_NAME != "main" ]; then
    BUILD_NUMBER=$BUILD_NUMBER-$BRANCH_NAME
fi

# Set the Xcode project file path
PROJECT_FILE="Bitbaguette/Bitbaguette.xcodeproj/project.pbxproj"

# Update the MARKETING_VERSION and CURRENT_PROJECT_VERSION values in the Xcode project file
sed -i "" "s/MARKETING_VERSION = .*/MARKETING_VERSION = $VERSION_NUMBER;/g" "$PROJECT_FILE"
sed -i "" "s/CURRENT_PROJECT_VERSION = .*/CURRENT_PROJECT_VERSION = $BUILD_NUMBER;/g" "$PROJECT_FILE"

git add "$PROJECT_FILE"
