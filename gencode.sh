#!/usr/bin/sh

PROTO_PATH=./proto/v1

buf generate --path ${PROTO_PATH}

# 
# golang
#
cd ./gencode/go/proto
if [ ! -e ./go.mod ]; then
    echo "go.mod is not exist, init gomodule."
    go mod init github.com/yuxsr/yuxsr-dev-pb/gencode/go/proto
fi

go mod tidy

#
# TypeScript
#
tsc
