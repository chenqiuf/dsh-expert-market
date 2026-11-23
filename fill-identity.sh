#!/bin/bash
# 一次性填写发布所需的信息，然后自动同步索引里的版本与 commit。
#
# 用法：
#   ./fill-identity.sh <GitHub用户名> <作者名> <联系方式> <索引域名>
#
# 例：
#   ./fill-identity.sh zhangsan "张三" "微信 zs2024" "https://zhangsan.github.io/dsh-expert-market"
set -euo pipefail
cd "$(dirname "$0")"

if [ $# -lt 4 ]; then
  echo "用法: ./fill-identity.sh <GitHub用户名> <作者名> <联系方式> <索引URL>"
  echo
  echo "  GitHub用户名  你的 GitHub 账号，用于生成仓库地址"
  echo "  作者名        显示在索引里的作者，中英文都行，有空格请加引号"
  echo "  联系方式      写进详情页的定制服务联系方式"
  echo "  索引URL       放 index.json 的完整地址"
  exit 1
fi

GH="$1"
AUTHOR="$2"
CONTACT="$3"
INDEX_URL="$4"

/Users/mac/Documents/deepseek-harness/python313/bin/python3 - "$GH" "$AUTHOR" "$CONTACT" "$INDEX_URL" <<'PY'
import json, sys, pathlib, re
gh, author, contact, index_url = sys.argv[1:5]
root = pathlib.Path('.')

# 1) package.json: the identity a registry listing shows.
p = root / 'package.json'
d = json.loads(p.read_text())
repo = f'https://github.com/{gh}/dsh-expert-market'
d['author'] = {'name': author, 'email': contact}
d['homepage'] = f'{repo}#readme'
d['repository'] = {'type': 'git', 'url': f'{repo}.git'}
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

# 2) The index entry: author, home, and both install sources.
p = root / 'dist' / 'index.json'
d = json.loads(p.read_text())
entry = d['plugins'][0]
entry['author'] = author
entry['homepage'] = repo
entry['repository'] = {'url': repo}
# The Git install source is its own field, and the one a reader actually installs from.
for source in entry['versions']:
    if source['source']['type'] == 'git':
        source['source']['url'] = f'{repo}.git'
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

# 3) The detail page: the contact line and the index address a reader copies.
p = root / 'docs' / 'DETAIL.md'
text = p.read_text()
text = text.replace('YOUR-CONTACT', contact)
text = text.replace('https://YOUR-DOMAIN/dsh/index.json', index_url)
p.write_text(text)
(root / 'docs' / 'DETAIL.zh.md').write_text(text)
print('已填写 GitHub 用户名、作者名、联系方式、索引地址')
PY

echo
echo "== 同步索引里的版本与 commit"
./sync-index.sh
echo
./publish.sh check 2>&1 | grep -E '✓|✗' | head -6
