#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "Starting ILO Radiograph Viewer..."
# Run server in the background
npm start &

echo "Waiting for server to start..."
sleep 3

# Open default browser depending on the operating system
if which xdg-open > /dev/null
then
  xdg-open http://localhost:3000
elif which open > /dev/null
then
  open http://localhost:3000
else
  echo "Please open http://localhost:3000 in your web browser."
fi
