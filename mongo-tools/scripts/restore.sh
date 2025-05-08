#!/bin/bash

TARGET_URI=""
TARGET_DATABASE="Lotto"
ARCHIVE_NAME="../backups/backup.archive.gz"

usage() {
  echo "Usage: $0 -t <target_uri> [-d <target_database>] [-i <archive_name>]"
  echo "  -t    MongoDB connection URI (required)"
  echo "  -d    Database name to restore (optional, default: Lotto)"
  echo "  -i    Input archive file name (optional, default: backup.archive.gz)"
  exit 1
}

while getopts "t:d:i:h" opt; do
  case $opt in
    t)
      TARGET_URI="$OPTARG"
      ;;
    d)
      TARGET_DATABASE="$OPTARG"
      ;;
    i)
      ARCHIVE_NAME="$OPTARG"
      ;;
    h | *)
      usage
      ;;
  esac
done

if [ -z "$TARGET_URI" ]; then
  echo "Error: MongoDB connection URI is required."
  usage
fi

if [ ! -f "$ARCHIVE_NAME" ]; then
  echo "Error: Archive file '$ARCHIVE_NAME' not found."
  exit 1
fi

echo "Starting restoration to database '$TARGET_DATABASE' at '$TARGET_URI'..."
mongorestore --uri="$TARGET_URI" --nsInclude="$TARGET_DATABASE.*" --drop --archive="$ARCHIVE_NAME" --gzip

if [ $? -eq 0 ]; then
  echo "Restoration completed successfully from '$ARCHIVE_NAME'."
else
  echo "Error: Restoration failed."
  exit 1
fi
