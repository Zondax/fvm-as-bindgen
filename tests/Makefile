install_deps:
	yarn install
	cargo install wizer --all-features --force

build:
	yarn asbuild
	wizer build/release-tmp.wasm -f init -o build/release.wasm
	rm build/release-tmp.wasm

test:
	yarn tests:rpc

.PHONY: install_deps build
