#!/bin/bash
cd "$(dirname "$0")/.."

# Launch everything in background and exit immediately
(
    # Check if system Python 3.9 exists and has required packages
    if ! /usr/bin/python3 -c "import chromadb, flask, openai" 2>/dev/null; then
        osascript -e 'display alert "Dependencies Missing" message "Required packages not found in system Python 3.9. Please run: /usr/bin/python3 -m pip install chromadb==0.4.15 flask openai"'
        exit 1
    fi

    # Check if model file exists
    MODEL_PATH="models/Llama-3.2-3B-Instruct-Q6_K.gguf"
    if [ ! -f "$MODEL_PATH" ]; then
        osascript -e 'display alert "Model Missing" message "AI model not found. Please ensure ampAI is properly installed."'
        exit 1
    fi

    # Check if llama-server binary exists
    if [ ! -f "./llama.cpp/build/bin/llama-server" ]; then
        osascript -e 'display alert "Llama Server Missing" message "llama-server binary not found. Please ensure llama.cpp is built."'
        exit 1
    fi

    echo "🚀 Starting ampAI..."

    # 1. START UI SERVER
    echo "🌐 Starting UI server..."
    cd rag
    /usr/bin/python3 web_chat.py > /dev/null 2>&1 &
    WEB_PID=$!
    cd ..

    # Wait for web server to start
    echo "⏳ Waiting for UI server..."
    for i in {1..15}; do
        if curl -s http://localhost:8081/loading > /dev/null 2>&1; then
            echo "✅ UI server is running"
            break
        fi
        if [ $i -eq 15 ]; then
            osascript -e 'display alert "Server Error" message "Failed to start UI server. Please check your setup."'
            kill $WEB_PID 2>/dev/null
            exit 1
        fi
        sleep 1
    done
    
    # Give web server extra time to fully initialize
    echo "⏳ Allowing web server to fully initialize..."
    sleep 3

    # 2. WAIT FOR SERVER READY (no loading screen needed)
    echo "⏳ Waiting for server to be ready..."

    # 3. START LLAMA SERVER
    echo "🤖 Starting Llama server..."
    ./llama.cpp/build/bin/llama-server -m "$MODEL_PATH" --port 8000 --host 0.0.0.0 > /dev/null 2>&1 &
    LLAMA_PID=$!

    # Wait for Llama server to start
    echo "⏳ Waiting for Llama server..."
    for i in {1..15}; do
        if curl -s http://localhost:8000/v1/models > /dev/null 2>&1; then
            echo "✅ Llama server is running"
            break
        fi
        if [ $i -eq 15 ]; then
            osascript -e 'display alert "Llama Server Error" message "Failed to start Llama server. Please check your setup."'
            kill $WEB_PID $LLAMA_PID 2>/dev/null
            exit 1
        fi
        sleep 2
    done

    # 4. CHECK RAG SYSTEM
    echo "🔍 Checking RAG system..."
    
    # Check if RAG collection exists
    if [ ! -d "rag/chroma_db" ] || [ -z "$(find rag/chroma_db -name '*.sqlite3' 2>/dev/null)" ]; then
        osascript -e 'display alert "RAG System Error" message "RAG collection not found. Please run: cd rag && /usr/bin/python3 rag_simple.py"'
        kill $WEB_PID $LLAMA_PID 2>/dev/null
        exit 1
    fi
    
    # Wait for RAG system to be ready
    echo "⏳ Waiting for RAG system to be ready..."
    for i in {1..20}; do
        RAG_STATUS=$(curl -s http://localhost:8081/api/status 2>/dev/null)
        if [ $? -eq 0 ] && echo "$RAG_STATUS" | grep -F -q '"rag_system":"available"' && echo "$RAG_STATUS" | grep -F -q 'documents'; then
            echo "✅ RAG system is ready with documents"
            break
        fi
        if [ $i -eq 20 ]; then
            echo "❌ RAG system failed to initialize after 20 attempts"
            echo "Last status: $RAG_STATUS"
            osascript -e 'display alert "RAG System Error" message "RAG system failed to initialize. Please check your setup."'
            kill $WEB_PID $LLAMA_PID 2>/dev/null
            exit 1
        fi
        echo "⏳ Waiting for RAG system... (attempt $i/20)"
        sleep 2
    done

    # 5. OPEN CHAT INTERFACE
    echo "🌍 Opening chat interface..."
    open http://localhost:8081/chat

    echo "🎉 ampAI is ready!"
    echo "Web server: http://localhost:8081/"
    echo "Chat interface: http://localhost:8081/chat (opened directly)"
    echo "Llama server: http://localhost:8000/"

    # Keep both processes running in background
    wait $WEB_PID $LLAMA_PID
) > /dev/null 2>&1 &

# Exit immediately - no terminal window
exit 0
