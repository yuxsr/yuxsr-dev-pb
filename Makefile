format:
	buf format -w

lint:
	buf lint

gencode:
	./gencode.sh

.PHONY: format, lint, gencode
