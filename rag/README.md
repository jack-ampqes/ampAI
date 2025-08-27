# ampAI RAG System

A Retrieval-Augmented Generation (RAG) system for electrical safety and testing standards, built with ChromaDB, Flask, and llama.cpp.

## 🚀 Quick Start

### Option 1: Use the Start Script (Recommended)
```bash
# From the project root directory
./scripts/start_ampai.command
```

### Option 2: Manual Setup
```bash
# 1. Activate virtual environment
source .venv/bin/activate

# 2. Index your sources
cd rag
python3 rag_simple.py reindex

# 3. Start the LLM server (in one terminal)
python3 start_llama_server.py

# 4. Start the web interface (in another terminal)
python3 web_chat.py
```

## 🔧 System Components

### 1. **RAG Engine** (`rag_simple.py`)
- Indexes JSONL source files from `../sources/`
- Provides command-line interface for testing
- Uses ChromaDB for vector storage

### 2. **Web Interface** (`web_chat.py`)
- Flask-based chat interface on port 8081
- Integrates with RAG system for knowledge retrieval
- Connects to llama.cpp server for AI responses

### 3. **LLM Server** (`start_llama_server.py`)
- Starts llama.cpp server on port 8000
- Serves the AI model for chat completions

## 📁 Directory Structure

```
rag/
├── rag_simple.py          # RAG engine and CLI
├── web_chat.py            # Web chat interface
├── start_llama_server.py  # LLM server starter
├── requirements.txt       # Python dependencies
├── templates/             # HTML templates
├── static/                # CSS/JS assets
└── README.md             # This file

../sources/                # JSONL source files
../chroma_db/             # ChromaDB storage
../models/                 # AI model files
../llama.cpp/             # llama.cpp binaries
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. **"Collection ampai_sources does not exist"**
**Solution**: The collection name includes a timestamp. The system now automatically finds the latest collection.

#### 2. **"llama.cpp status check error: Connection error"**
**Solution**: The LLM server isn't running. Start it with:
```bash
python3 start_llama_server.py
```

#### 3. **"RAG system not available"**
**Solution**: Reindex your sources:
```bash
python3 rag_simple.py reindex
```

#### 4. **Web server won't start**
**Solution**: Check if port 8081 is in use:
```bash
lsof -i :8081
# Kill any processes using the port
pkill -f "web_chat.py"
```

### Testing the System

#### Test RAG Retrieval
```bash
python3 rag_simple.py ask "What is NFPA 70E?"
```

#### Test Web Interface
1. Start both servers
2. Open http://localhost:8081
3. Ask a question in the chat interface

#### Check Server Status
```bash
# Check web server
curl http://localhost:8081/api/status

# Check LLM server
curl http://localhost:8000/v1/models
```

## 📚 Available Knowledge Sources

The system includes knowledge from:
- **NFPA 70E**: Electrical safety standards
- **NETA ATS**: Acceptance testing specifications
- **ASTM Standards**: Insulating blankets and PPE
- **Internal Documents**: Testing procedures and guidelines

## 🔍 RAG System Features

- **Semantic Search**: Finds relevant content based on meaning
- **Context-Aware Responses**: AI responses based on retrieved knowledge
- **Multi-Source Integration**: Combines information from multiple standards
- **Real-Time Indexing**: Always up-to-date with latest sources

## 🚨 Safety Notes

- This system provides information about electrical safety standards
- Always consult qualified professionals for actual electrical work
- The system is for informational purposes only
- Follow all applicable safety codes and regulations

## 📞 Support

For issues or questions:
1. Check this README first
2. Review the troubleshooting section
3. Check server logs for error messages
4. Ensure all dependencies are installed

## 🔄 Maintenance

### Regular Tasks
- **Reindex Sources**: Run `python3 rag_simple.py reindex` when sources change
- **Update Model**: Replace model file in `../models/` directory
- **Clean Database**: Delete `../chroma_db/` to start fresh (will reindex on next run)

### Performance Optimization
- Adjust `n_results` in `query_rag()` function for different retrieval strategies
- Modify distance thresholds for relevance filtering
- Adjust document truncation lengths based on your LLM's context window
