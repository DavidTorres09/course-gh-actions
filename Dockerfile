FROM mcr.microsoft.com/playwright:v1.42.1-jammy

# Update the package list to ensure access to the latest versions
RUN apt-get update && \
    # Install essential tools for adding new repositories and handling certificates
    apt-get install -y gnupg curl ca-certificates && \
    # Download and store MongoDB's GPG key to verify package authenticity
    curl -fsSL https://pgp.mongodb.com/server-6.0.asc | \
    gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg && \
    # Add MongoDB's official repository to the system's package sources
    echo "deb [ arch=amd64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] \
    https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" > \
    /etc/apt/sources.list.d/mongodb-org-6.0.list && \
    # Update the package list again to include MongoDB's repository
    apt-get update && \
    # Install MongoDB Shell (mongosh) and database tools like mongodump and mongorestore
    apt-get install -y mongodb-mongosh mongodb-org-tools && \
    # Clean up the package lists to reduce image size
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install
RUN npm install && npx playwright install --with-deps

WORKDIR /app
COPY . .

RUN chmod +x ./mongo-tools/scripts/*.sh

CMD ["bash", "./mongo-tools/scripts/run_tests.sh"]

