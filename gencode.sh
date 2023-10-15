#!/usr/bin/sh

PROTO_PATH=./proto/v1

# 
# golang
#
rm -f gencode/go/proto/v1/*.pb.go

buf generate --path ${PROTO_PATH}

cd ./gencode/go/proto
if [ ! -e ./go.mod ]; then
    echo "go.mod is not exist, init gomodule."
    go mod init github.com/yuxsr/yuxsr-dev-pb/gencode/go/proto
fi

go mod tidy
