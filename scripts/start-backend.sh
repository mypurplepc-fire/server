#!/bin/bash
cd "$(dirname "$0")/../backend"
exec node src/server.js
