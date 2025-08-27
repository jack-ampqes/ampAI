#!/usr/bin/env python3
"""
Simple script to start the llama.cpp server for development
"""
import subprocess
import sys
import os
import time
import signal

def start_llama_server():
    """Start the llama.cpp server"""
    # Get the project root directory
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(project_root, "models", "Llama-3.2-3B-Instruct-Q6_K.gguf")
    llama_bin = os.path.join(project_root, "llama.cpp", "build", "bin", "llama-server")
    
    # Check if model exists
    if not os.path.exists(model_path):
        print(f"❌ Model not found at: {model_path}")
        print("Please ensure the model file exists in the models/ directory")
        return False
    
    # Check if llama-server exists
    if not os.path.exists(llama_bin):
        print(f"❌ llama-server not found at: {llama_bin}")
        print("Please ensure llama.cpp is built")
        return False
    
    print(f"🚀 Starting llama.cpp server...")
    print(f"📁 Model: {model_path}")
    print(f"🔧 Binary: {llama_bin}")
    print(f"🌐 Port: 8000")
    print("Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        # Start the server
        process = subprocess.Popen([
            llama_bin,
            "-m", model_path,
            "--port", "8000",
            "--host", "0.0.0.0"
        ])
        
        # Wait for the process
        process.wait()
        
    except KeyboardInterrupt:
        print("\n🛑 Stopping server...")
        if process.poll() is None:
            process.terminate()
            process.wait()
        print("✅ Server stopped")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return False
    
    return True

if __name__ == "__main__":
    start_llama_server()
