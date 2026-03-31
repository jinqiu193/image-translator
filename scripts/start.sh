#!/bin/bash
set -Eeuo pipefail

PORT=5000
cd "$(dirname "$0")/.."

kill_port_if_listening() {
    local pids
    pids=$(ss -H -lntp 2>/dev/null | awk -v port="${PORT}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true)
    if [[ -z "${pids}" ]]; then
        echo "Port ${PORT} is free."
        return
    fi
    echo "Port ${PORT} in use by PIDs: ${pids} (killing)"
    echo "${pids}" | xargs -I {} kill -9 {} 2>/dev/null || true
    sleep 1
}

echo "Clearing port ${PORT}..."
kill_port_if_listening
echo "Starting dev server on port ${PORT}..."
NODE_OPTIONS='--max-old-space-size=4096' pnpm dev --port ${PORT}
