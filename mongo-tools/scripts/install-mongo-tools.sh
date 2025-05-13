#!/bin/bash
set -e

KEYRING_PATH="/usr/share/keyrings/mongodb-server-6.0.gpg"
REPO_LIST="/etc/apt/sources.list.d/mongodb-org-6.0.list"
MONGO_GPG_URL="https://pgp.mongodb.com/server-6.0.asc"
MONGO_REPO="deb [ arch=amd64 signed-by=${KEYRING_PATH} ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse"

apt-get update && \
apt-get install -y gnupg curl ca-certificates

curl -fsSL "${MONGO_GPG_URL}" | gpg --dearmor --yes -o "${KEYRING_PATH}"

echo "${MONGO_REPO}" > "${REPO_LIST}"

apt-get update && \
apt-get install -y mongodb-mongosh mongodb-org-tools

curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

npm init -y
npm install --save-dev @playwright/test
npx playwright install --with-deps

rm -rf /var/lib/apt/lists/*

