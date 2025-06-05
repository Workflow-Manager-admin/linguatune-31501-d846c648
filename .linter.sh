#!/bin/bash
cd /home/kavia/workspace/code-generation/linguatune-31501-d846c648/linguatuve_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

