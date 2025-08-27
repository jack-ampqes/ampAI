#!/bin/bash

# Ensure we're in the right directory
cd "$(dirname "$0")"

# Use system Python 3.9 which has ChromaDB 0.4.15
PYTHON_CMD="/usr/bin/python3"

# Check if ChromaDB version is correct
CHROMADB_VERSION=$($PYTHON_CMD -c "import chromadb; print(chromadb.__version__)" 2>/dev/null)
echo "Using ChromaDB version: $CHROMADB_VERSION"

# Verify we're using the correct Python
echo "Using Python from: $PYTHON_CMD"

# Start the web server with system Python 3.9
echo "Starting web server with system Python 3.9..."
nohup $PYTHON_CMD web_chat.py > server.log 2>&1 &
echo "Server started in background. Check server.log for output."
echo "Server PID: $!"
