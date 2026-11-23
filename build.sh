#!/bin/bash
# Assemble client.js from src/ and run every offline check.
#
# The browser bundle is one file: the module loader loads it by id, so the parts
# are concatenated in order, syntax-checked, and rendered against a real index
# slice. The Host route is exercised separately, because its naming rules and the
# persistence they feed are not reachable from the browser half.
set -euo pipefail
cd "$(dirname "$0")"
cat src/head.js src/part1.js src/part2.js src/part3.js src/part4.js src/tail.js > client.js
node --check client.js
node --check index.js
node test/render-smoke.mjs
node test/naming.mjs "${NAMING_INDEX:-/tmp/dshopen.json}" "${EXTRA_INDEX:-/tmp/idx.json}"
node test/host-naming.mjs "${NAMING_INDEX:-/tmp/dshopen.json}"

# The published index is what a reader's DSH actually parses, so it is checked here
# rather than after a failed install.
if [ -f dist/index.json ]; then node test/publish-index.mjs; fi
