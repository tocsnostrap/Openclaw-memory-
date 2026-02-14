#!/bin/bash
# Chromium CDP Auto-Start Script for OpenClaw
# Ensures browser is always available after gateway restart

CDP_PORT=9222
CHROMIUM_DATA_DIR=/tmp/chromium-data
LOG_FILE=/tmp/chromium.log

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
    start)
        start_chromium
        ;;
    restart)
        start_chromium
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
        echo "Usage: $0 {start|restart|status}"
        exit 1
        ;;
esac
