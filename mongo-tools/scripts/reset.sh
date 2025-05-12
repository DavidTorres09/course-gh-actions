#!/bin/bash

# ⚠️ Safety check: ensure we're only touching the test environment
echo "⚠️  This will reset the TEST MongoDB container and volume."

# Remove test container if it exists
docker rm -f mongo-test-container 2>/dev/null || echo "Container mongo-test-container not found"

# Remove test volume if it exists
docker volume rm -f london-test_mongo-test-data 2>/dev/null || echo "Volume london-test_mongo-test-data not found"

# Start test MongoDB service
docker compose -f ./docker-compose.yml up -d

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
for i in {1..30}; do
  docker exec mongo-test-container mongosh --quiet --eval "db.runCommand({ ping: 1 })" &>/dev/null
  if [ $? -eq 0 ]; then
    echo "✅ MongoDB is ready!"
    break
  fi
  sleep 1
done

if [ $i -eq 30 ]; then
  echo "❌ MongoDB did not become ready in time."
  exit 1
fi
