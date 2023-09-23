#!/usr/bin/sh

PROTO_PATH=./proto/v1

# 
# golang
#
rm -f gencode/go_proto/*.pb.go

protoc -I=${PROTO_PATH} --go_out=./gencode/go_proto --go_opt=paths=source_relative --go-grpc_out=./gencode/go_proto --go-grpc_opt=paths=source_relative --go-grpc_opt=require_unimplemented_servers=false ${PROTO_PATH}/*.proto

cd ./gencode/go_proto
if [ ! -e ./go.mod ]; then
    echo "go.mod is not exist, init gomodule."
    go mod init github.com/yuxsr/yuxsr-dev-pb/gencode/go_proto
fi

go mod tidy
