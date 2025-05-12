#!/bin/bash
set -e

export DEBIAN_FRONTEND=noninteractive

apt-get update && apt-get install -y gnupg curl ca-certificates

curl -fsSL https://pgp.mongodb.com/server-6.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg

echo "deb [ arch=amd64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" > /etc/apt/sources.list.d/mongodb-org-6.0.list

apt-get update && apt-get install -y mongodb-mongosh mongodb-org-tools

rm -rf /var/lib/apt/lists/*
