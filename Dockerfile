FROM mcr.microsoft.com/playwright:v1.42.1-jammy

RUN curl -O https://downloads.mongodb.com/compass/mongosh-2.2.4-linux-x64.tgz && \
    tar -xvzf mongosh-2.2.4-linux-x64.tgz && \
    mv mongosh-*/bin/mongosh /usr/local/bin/ && \
    rm -rf mongosh-*

RUN curl -O https://downloads.mongodb.com/tools/db/mongodb-database-tools-ubuntu2204-x86_64-100.7.0.tgz && \
    tar -xvzf mongodb-database-tools-ubuntu2204-x86_64-100.7.0.tgz && \
    mv mongodb-database-tools-*/bin/* /usr/local/bin/ && \
    rm -rf mongodb-database-tools-*

COPY package*.json ./

RUN npm install
RUN npm install && npx playwright install --with-deps

WORKDIR /app
COPY . .

RUN chmod +x ./mongo-tools/scripts/*.sh

CMD ["bash", "./mongo-tools/scripts/run_tests.sh"]

