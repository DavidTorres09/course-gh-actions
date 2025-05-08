FROM mcr.microsoft.com/playwright:v1.42.1-jammy

RUN apt-get update && apt-get install -y \
    RUN apt-get update && \
    apt-get install -y wget curl gnupg ca-certificates && \
    wget -qO - https://pgp.mongodb.com/server-6.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/mongodb-server.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" > /etc/apt/sources.list.d/mongodb-org-6.0.list && \
    apt-get update && \
    apt-get install -y mongodb-database-tools && \
    # Instalar mongosh manualmente
    curl -LO https://downloads.mongodb.com/compass/mongosh-2.2.4-linux-x64.tgz && \
    tar -xvzf mongosh-2.2.4-linux-x64.tgz && \
    mv mongosh-*/bin/mongosh /usr/local/bin/ && \
    rm -rf mongosh-*

WORKDIR /app
COPY . .

#RUN npm ci
RUN chmod +x ./mongo-tools/scripts/*.sh

CMD ["bash", "./mongo-tools/scripts/run_tests.sh"]

