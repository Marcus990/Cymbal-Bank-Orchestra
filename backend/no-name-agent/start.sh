#!/bin/bash

# Google Calendar Authentication Startup Script
# This script ensures Google Calendar is properly authenticated before starting the backend server

echo "🚀 Starting Google Calendar Authentication Setup..."

# Check if credentials.json exists
if [ ! -f "credentials.json" ]; then
    echo "❌ Error: credentials.json not found!"
    echo "Please download OAuth 2.0 credentials from Google Cloud Console and save as 'credentials.json'"
    exit 1
fi

echo "✅ Found credentials.json"

# Check if token exists and is valid
if [ -f "$HOME/.credentials/calendar_token.json" ]; then
    echo "🔍 Checking existing token..."
    
    # Check if token is expired (basic check)
    if python3 -c "
import json
import datetime
from pathlib import Path

token_path = Path.home() / '.credentials' / 'calendar_token.json'
try:
    with open(token_path) as f:
        data = json.load(f)
    
    if 'expiry' in data:
        expiry = datetime.datetime.fromisoformat(data['expiry'].replace('Z', '+00:00'))
        now = datetime.datetime.now(datetime.timezone.utc)
        
        if expiry > now:
            print('Token is still valid')
            exit(0)
        else:
            print('Token has expired')
            exit(1)
    else:
        print('No expiry found in token')
        exit(1)
except Exception as e:
    print(f'Error reading token: {e}')
    exit(1)
" 2>/dev/null; then
        echo "✅ Token is valid, proceeding to start server..."
    else
        echo "⚠️  Token expired or invalid, re-authenticating..."
        rm -f "$HOME/.credentials/calendar_token.json"
        python3 setup_calendar_auth.py
    fi
else
    echo "🔑 No token found, setting up authentication..."
    python3 setup_calendar_auth.py
fi

# Check if authentication was successful
if [ ! -f "$HOME/.credentials/calendar_token.json" ]; then
    echo "❌ Authentication failed! Please check the error above."
    exit 1
fi

echo "✅ Google Calendar authentication complete!"
echo "🚀 Starting backend server..."

# Start the backend server
uvicorn main:app --host 0.0.0.0 --port 8001 --reload