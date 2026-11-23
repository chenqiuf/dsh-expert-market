#!/bin/bash
# 让 dist/index.json 里的版本号与 commit 与当前代码一致。
#
# 索引里的 git 版本必须固定到完整 commit，版本号必须等于 package.json 的版本；
# 两者任一过期，装出去的就是旧代码或直接装不上。与其手工维护，不如每次发布前跑一次。
set -euo pipefail
cd "$(dirname "$0")"

VERSION=$(node -p "require('./package.json').version")
# Only the index may be uncommitted: everything else must already be in the commit
# whose hash the index will name, or the index would point at code without it.
DIRTY=$(git status --porcelain 2>/dev/null | grep -v '^.. dist/index.json$' | head -1)
if [ -n "$DIRTY" ]; then
  echo "✗ 除 dist/index.json 外还有未提交的改动，先提交它们"
  git status --short | head -10
  exit 1
fi
COMMIT=$(git rev-parse HEAD)
STAMP=$(node -p "Date.now()")

/Users/mac/Documents/deepseek-harness/python313/bin/python3 - "$VERSION" "$COMMIT" "$STAMP" <<'PY'
import json, sys, pathlib
version, commit, stamp = sys.argv[1], sys.argv[2], int(sys.argv[3])
p = pathlib.Path('dist') / 'index.json'
d = json.loads(p.read_text())
entry = d['plugins'][0]
for source in entry['versions']:
    source['version'] = version
    source['publishTimestamp'] = stamp
    if source['source']['type'] == 'git':
        source['source']['commit'] = commit
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print(f'索引已同步：版本 {version}，commit {commit[:12]}')
PY

node test/publish-index.mjs 2>&1 | grep -E '✓|✗|插件:' | head -4
