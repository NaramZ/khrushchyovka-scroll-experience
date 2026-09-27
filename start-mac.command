#!/bin/bash
# Serves this folder locally and opens DOMA in your default browser.
cd "$(dirname "$0")"
PORT=8000
( sleep 1; open "http://localhost:$PORT/index.html" ) &
echo "DOMA is running at http://localhost:$PORT — close this window to stop."
python3 -m http.server $PORT
