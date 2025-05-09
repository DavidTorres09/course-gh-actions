FROM mcr.microsoft.com/playwright:v1.42.1-jammy

RUN apt-get update && \
    apt-get install -y mongodb-database-tools && \
    curl -LO https://downloads.mongodb.com/compass/mongosh-2.2.4-linux-x64.tgz && \
    tar -xvzf mongosh-2.2.4-linux-x64.tgz && \
    mv mongosh-*/bin/mongosh /usr/local/bin/ && \
    rm -rf mongosh-*

COPY package*.json ./

RUN npm install
RUN npm install && npx playwright install --with-deps

WORKDIR /app
COPY . .

RUN chmod +x ./mongo-tools/scripts/*.sh

CMD ["bash", "./mongo-tools/scripts/run_tests.sh"]
