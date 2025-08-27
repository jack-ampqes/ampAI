#!/bin/bash

# Reindex Command Script for ampAI
# This script reindexes all knowledge sources for the RAG system

echo "🚀 Starting ampAI Reindex Process..."
echo "=================================="

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Navigate to the rag directory
cd ../rag

echo "📍 Working directory: $(pwd)"
echo ""

# Check if Python is available
if ! command -v /usr/bin/python3 &> /dev/null; then
    echo "❌ Error: Python 3 not found at /usr/bin/python3"
    echo "Please ensure Python 3.9+ is installed"
    read -p "Press Enter to continue..."
    exit 1
fi

# Check if required packages are installed
echo "🔍 Checking required packages..."
if ! /usr/bin/python3 -c "import chromadb, flask, openai" 2>/dev/null; then
    echo "❌ Error: Required packages not found"
    echo "Installing required packages..."
    /usr/bin/python3 -m pip install chromadb==0.4.15 flask openai
fi

echo "✅ All required packages are available"
echo ""

# Start the reindex process
echo "🔄 Starting reindex process..."
echo "This may take a few minutes depending on the number of documents..."
echo ""

# Run the reindex
/usr/bin/python3 rag_simple.py reindex

echo ""
echo "=================================="
echo "🎉 Reindex process completed!"
echo ""

# Check if reindex was successful
if [ $? -eq 0 ]; then
    echo "✅ Reindex successful! Your RAG system is now updated."
    echo "You can now use the web interface or ask questions."
else
    echo "❌ Reindex failed. Please check the error messages above."
fi

echo ""
echo "Press Enter to close this window..."
read -p ""
