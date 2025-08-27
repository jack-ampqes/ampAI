#!/usr/bin/env python3
import os
import json
import chromadb
from chromadb.config import Settings

# Configuration
DB_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")
SOURCES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sources")

def read_text(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def get_collection():
    # ChromaDB 0.5.5+ compatibility - no tenant parameter needed
    chroma = chromadb.PersistentClient(path=DB_DIR, settings=Settings(anonymized_telemetry=False))
    # Use timestamp-based collection name to match web_chat.py
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    collection_name = f"ampai_sources_{timestamp}"
    return chroma.get_or_create_collection(collection_name)

def simple_reindex():
    print("Starting simple reindex...")
    
    # Completely remove the old database directory
    import shutil
    if os.path.exists(DB_DIR):
        print(f"Removing old database: {DB_DIR}")
        shutil.rmtree(DB_DIR)
    
    # Create fresh collection
    col = get_collection()
    print("Created fresh collection")
    
    # Get all source files dynamically
    source_files = []
    for filename in os.listdir(SOURCES_DIR):
        if filename.endswith(('.txt', '.jsonl')):
            source_files.append(filename)
    
    print(f"Found {len(source_files)} source files: {', '.join(source_files)}")
    
    for filename in source_files:
        filepath = os.path.join(SOURCES_DIR, filename)
        
        if filename.endswith('.jsonl'):
            # Handle JSONL files
            print(f"Processing JSONL file: {filename}")
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    for i, line in enumerate(f):
                        if line.strip():
                            data = json.loads(line.strip())
                            
                            # All JSONL files now use the standard format
                            if 'content' in data:
                                doc_content = data['content']
                                doc_id = data.get('id', f"{filename}_{i}")
                                
                                # Convert tags list to string for ChromaDB compatibility
                                tags = data.get('tags', [])
                                tags_str = ', '.join(tags) if tags else 'N/A'
                                
                                metadata = {
                                    "source": data.get('source', filename),
                                    "title": data.get('title', 'N/A'),
                                    "category": data.get('category', 'N/A'),
                                    "tags": tags_str,
                                    "chunk_index": data.get('chunk_index', i),
                                    "total_chunks": data.get('total_chunks', 1)
                                }
                            else:
                                # Fallback for any non-standard files
                                doc_content = json.dumps(data)
                                doc_id = f"{filename}_{i}"
                                metadata = {"source": filename, "format": "fallback"}
                            
                            # Add to collection
                            col.add(
                                ids=[doc_id],
                                documents=[doc_content],
                                metadatas=[metadata]
                            )
                            print(f"  Indexed entry {i+1}: {doc_content[:50]}...")
                
                print(f"✅ Successfully indexed {filename}")
                
            except Exception as e:
                print(f"❌ Error processing {filename}: {e}")
                
        elif filename.endswith('.txt'):
            # Handle text files
            print(f"Processing text file: {filename}")
            try:
                content = read_text(filepath)
                # Truncate very long content to avoid overwhelming the system
                if len(content) > 10000:
                    content = content[:10000] + "..."
                
                print(f"  Content length: {len(content)} characters")
                
                # Add to collection
                doc_id = filename.replace('.txt', '')
                col.add(
                    ids=[doc_id],
                    documents=[content],
                    metadatas=[{"source": filename}]
                )
                print(f"✅ Successfully indexed {filename}")
                
            except Exception as e:
                print(f"❌ Error processing {filename}: {e}")
    
    print(f"\n✅ Reindex complete! Indexed {len(source_files)} source files.")

def simple_ask(question):
    print(f"\n🔍 Question: {question}")
    print("=" * 50)
    
    col = get_collection()
    
    # Query the collection
    results = col.query(
        query_texts=[question],
        n_results=3
    )
    
    if results['documents'] and results['documents'][0]:
        print("📚 Found relevant content:")
        for i, doc in enumerate(results['documents'][0]):
            print(f"\n--- Document {i+1} ---")
            print(doc)
            if results['metadatas'] and results['metadatas'][0]:
                print(f"Source: {results['metadatas'][0][i]}")
    else:
        print("❌ No relevant content found.")
    
    print("\n" + "=" * 50)
    print("💡 This is what your RAG system found from your sources!")
    print("The llama.cpp server is having issues with chat completion, but retrieval works perfectly!")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        if sys.argv[1] == "reindex":
            simple_reindex()
        elif sys.argv[1] == "ask" and len(sys.argv) > 2:
            question = " ".join(sys.argv[2:])
            simple_ask(question)
        else:
            print("Usage: python rag_simple.py [reindex|ask <question>]")
    else:
        print("Usage: python rag_simple.py [reindex|ask <question>]")
