#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "Starting DICOM Push Utility on port 3001..."
# Run server in the background
npx next start -p 3001 &

echo "Waiting for server to start..."
sleep 3

# Open default browser depending on the operating system
if which xdg-open > /dev/null
then
  xdg-open http://localhost:3001
elif which open > /dev/null
then
  open http://localhost:3001
else
  echo "Please open http://localhost:3001 in your web browser."
fi
