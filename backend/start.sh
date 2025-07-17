#!/bin/bash
cd "$(dirname "$0")"  # Change to the directory containing this script
source venv/bin/activate  # Activate virtual environment
uvicorn main:app --reload --port 3002 