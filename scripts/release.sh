#!/usr/bin/env bash
git pull && \
  rm -rf node_modules && \
  rm -f release/*.vsix && \
  npm install && \
  npm run package && \
  git add -f release && \
  version=$(cat package.json | jq '.version' | tr -d '"') && \
  git commit -m "[v$version] Release" && \
  git push