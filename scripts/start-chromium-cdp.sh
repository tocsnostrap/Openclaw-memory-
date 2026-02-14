#!/bin/bash
# Chromium CDP Auto-Start Script for OpenClaw
# Supports stealth mode via puppeteer-extra

CDP_PORT=9220
CHROMIUM_DATA_DIR=/tmp/chromium-data
STEALTH_DATA_DIR=/tmp/chromium-stealth-data
LOG_FILE=/tmp/chromium.log
STEALTH_LOG=/tmp/stealth-browser.log

start_stealth() {
    # Kill existing on stealth port
    pkill -f "remote-debugging-port=$CDP_PORT" 2>/dev/null
    pkill -f "stealth-browser" 2>/dev/null
    sleep 1
    
    # Check if already running
    if curl -s http://127.0.0.1:$CDP_PORT/json/version > /dev/null 2>&1; then
        echo "Stealth Chromium already running on port $CDP_PORT"
        exit 0
    fi
    
    cd /home/azureuser/.openclaw/workspace
    
    # Start stealth browser via Node/puppeteer-extra
    nohup node scripts/stealth-browser.js $CDP_PORT $STEALTH_DATA_DIR > $STEALTH_LOG 2>&1 &
    
    # Wait for CDP
    for i in {1..15}; do
        if curl -s http://127.0.0.1:$CDP_PORT/json/version > /dev/null 2>&1; then
            echo "Stealth Chromium started on port $CDP_PORT"
            exit 0
        fi
        sleep 1
    done
    
    echo "Failed to start stealth browser"
    cat $STEALTH_LOG
    exit 1
}

start_chromium() {
    # Kill any existing Chromium on this port
    pkill -f "remote-debugging-port=$CDP_PORT" 2>/dev/null
    sleep 1
    
    # Check if port is already in use
    if curl -s http://127.0.0.1:$CDP_PORT/json/version > /dev/null 2>&1; then
        echo "Chromium CDP already running on port $CDP_PORT"
        exit 0
    fi
    
    # Start Chromium with xvfb if needed, otherwise direct
    if command -v xvfb-run > /dev/null 2>&1; then
        nohup xvfb-run -a chromium-browser \
            --remote-debugging-port=$CDP_PORT \
            --no-first-run \
            --no-default-browser-check \
            --user-data-dir=$CHROMIUM_DATA_DIR \
            --headless=new \
            --disable-gpu \
            > $LOG_FILE 2>&1 &
    else
        nohup chromium-browser \
            --remote-debugging-port=$CDP_PORT \
            --no-first-run \
            --no-default-browser-check \
            --user-data-dir=$CHROMIUM_DATA_DIR \
            --headless=new \
            --disable-gpu \
            > $LOG_FILE 2>&1 &
    fi
    
    # Wait for CDP to be ready
    for i in {1..10}; do
        if curl -s http://127.0.0.1:$CDP_PORT/json/version > /dev/null 2>&1; then
            echo "Chromium started successfully on port $CDP_PORT"
            exit 0
        fi
        sleep 1
    done
    
    echo "Failed to start Chromium CDP"
    cat $LOG_FILE
    exit 1
}

case "$1" in
    stealth)
        start_stealth
        ;;
    start)
        start_chromium
        ;;
    restart)
        start_stealth
        ;;
    status)
        if curl -s http://127.0.0.1:$CDP_PORT/json/version > /dev/null 2>&1; then
            echo "Chromium CDP running on port $CDP_PORT"
            exit 0
        else
            echo "Chromium CDP not running"
            exit 1
        fi
        ;;
    *)
        echo "Usage: $0 {start|restart|stealth|status}"
        exit 1
        ;;
esac
