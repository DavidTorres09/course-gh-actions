#!/bin/bash
set -e

apt-get update && \
# Install tools for adding new repositories and handling certificates
apt-get install -y gnupg curl ca-certificates && \
# Download and store MongoDB GPG key to verify package authenticity
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | \
gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg && \
# Add MongoDB official repository to the system package sources
echo "deb [ arch=amd64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] \
https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" > \
/etc/apt/sources.list.d/mongodb-org-6.0.list && \
# Update the package list again to include MongoDB repository
apt-get update && \
# Install mongosh and database tools like mongodump and mongorestore
apt-get install -y mongodb-mongosh mongodb-org-tools && \
# Clean up the package lists to reduce image size
rm -rf /var/lib/apt/lists/*
