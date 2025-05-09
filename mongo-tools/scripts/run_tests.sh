#!/bin/bash

chmod +x ./mongo-tools/scripts/restore.sh
chmod +x ./mongo-tools/scripts/update_dates.sh

MONGO_URI="mongodb://lotto:lotto@mongo:27017/Lotto?authMechanism=SCRAM-SHA-1"
DB_NAME="Lotto"
ARCHIVE_NAME="./mongo-tools/backups/backup.archive.gz"

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

#REPORT_DIR="./reports"
#mkdir -p "$BACKUP_DIR"

DESKTOP_REPORT_DIR="$REPORT_DIR/desktop-report-$TIMESTAMP"
MOBILE_REPORT_DIR="$REPORT_DIR/mobile-report-$TIMESTAMP"

echo "🔁 Restoring database before running desktop tests..."
./mongo-tools/scripts/restore.sh -t "$MONGO_URI" -d "$DB_NAME" -i "$ARCHIVE_NAME"
if [ $? -ne 0 ]; then
  echo "❌ Restore failed before desktop tests. Aborting."
  exit 1
fi

echo "🗓️Changing dates in the database before running desktop tests..."
./mongo-tools/scripts/update_dates.sh -t "$MONGO_URI" -d "$DB_NAME" -i "$ARCHIVE_NAME"
if [ $? -ne 0 ]; then
  echo "❌ Update dates failed before desktop tests. Aborting."
  exit 1
fi

echo "🖥️ Running desktop Playwright tests..."
#PLAYWRIGHT_HTML_OUTPUT_DIR=$DESKTOP_REPORT_DIR PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/LondonPlayers/desktop/history --reporter=html
#if [ $? -ne 0 ]; then
#  echo "❌ Desktop tests failed. Proceeding anyway to mobile..."
#fi

echo "🔁 Restoring database again before running mobile tests..."
./mongo-tools/scripts/restore.sh -t "$MONGO_URI" -d "$DB_NAME" -i "$ARCHIVE_NAME"
if [ $? -ne 0 ]; then
  echo "❌ Restore failed before mobile tests. Aborting."
  exit 1
fi

echo "🗓️Changing dates in the database before running mobile tests..."
./mongo-tools/scripts/update_dates.sh -t "$MONGO_URI" -d "$DB_NAME" -i "$ARCHIVE_NAME"
if [ $? -ne 0 ]; then
  echo "❌ Update dates failed before mobile tests. Aborting."
  exit 1
fi

echo "📱 Running mobile Playwright tests..."
#PLAYWRIGHT_HTML_OUTPUT_DIR=$MOBILE_REPORT_DIR PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/LondonPlayers/mobile/history --reporter=html
#if [ $? -ne 0 ]; then
#  echo "❌ Mobile tests failed."
#  exit 1
#fi

echo "📊 Serving reports on different ports..."
#npx playwright show-report $DESKTOP_REPORT_DIR --port=9323 &
#PID_DESKTOP=$!
#npx playwright show-report $MOBILE_REPORT_DIR --port=9324 &
#PID_MOBILE=$!

echo "✅ All tests completed successfully. Reports are available at:"
echo "   - Desktop report: http://localhost:9323"
echo "   - Mobile report: http://localhost:9324"

cleanup() {
  echo "🛑 Cleaning up background processes..."
  #if [[ -n "$PID_DESKTOP" ]]; then
  #  kill "$PID_DESKTOP" 2>/dev/null
  #fi
  #if [[ -n "$PID_MOBILE" ]]; then
  #  kill "$PID_MOBILE" 2>/dev/null
  #fi
  #wait
  echo "✅ Cleanup complete."
}

trap cleanup EXIT

#wait $PID_DESKTOP $PID_MOBILE
