#!/bin/bash
# 发布到 npm（路线 1）并刷新索引里要填的 Git commit（路线 2）。
#
# 用之前要先改掉两处占位符，见 README 的「发布」一节：
#   package.json / dist/index.json 里的 YOUR-GITHUB-NAME、YOUR-NAME
#
# 用法：
#   ./publish.sh check    只做检查，不发布
#   ./publish.sh npm      构建 + 发布到 npm
#   ./publish.sh git      提交并打印索引要填的 commit
#   ./publish.sh all      以上全部
set -euo pipefail
cd "$(dirname "$0")"

MODE="${1:-check}"

# 占位符没替换就不许发布，否则发出去的包会指向一个不存在的主页。
check_placeholders() {
  local bad=0
  for token in YOUR-GITHUB-NAME YOUR-NAME YOUR-CONTACT YOUR-DOMAIN REPLACE-WITH-FULL-COMMIT-SHA; do
    if grep -rq "$token" package.json dist/index.json docs/DETAIL.md 2>/dev/null; then
      echo "✗ 还有占位符未替换：$token"
      bad=1
    fi
  done
  if [ "$bad" -eq 1 ]; then
    echo
    echo "请先替换上面这些占位符再运行。它们出现在："
    echo "  package.json        homepage / repository / author"
    echo "  dist/index.json     author / homepage / repository / git commit"
    echo "  docs/DETAIL.md      联系方式与索引地址"
    exit 1
  fi
  echo "✓ 占位符已全部替换"
}

check_build() {
  echo "== 构建与全部检查"
  ./build.sh
}

publish_npm() {
  local name version published
  name=$(node -p "require('./package.json').name")
  version=$(node -p "require('./package.json').version")
  published=$(npm view "$name@$version" version 2>/dev/null || true)
  if [ -n "$published" ]; then
    echo "✗ $name@$version 已经发布过了，请先改 package.json 的 version"
    exit 1
  fi
  echo "== npm 发布 $name@$version"
  echo
  echo "这一步需要你本人确认：npm 会打开浏览器让你授权，"
  echo "或者在终端里问一次性验证码（30 秒有效，请当场输入）。"
  echo
  # 索引走的是公共 npm，用公共 registry 发布，而不是本机配置的镜像。
  npm publish --access public --registry=https://registry.npmjs.org
  echo "✓ 已发布：https://www.npmjs.com/package/$name"
}

git_step() {
  echo "== 同步索引并提交"
  ./sync-index.sh
  git add -A
  if ! git diff --cached --quiet; then
    local msg
    msg="发布 $(node -p "require('./package.json').version")"
    git -c user.email="${GIT_AUTHOR_EMAIL:-dev@local}" -c user.name="${GIT_AUTHOR_NAME:-dev}" commit -qm "$msg"
    echo "✓ 已提交：$msg"
  else
    echo "（没有新改动需要提交）"
  fi
  local sha
  sha=$(git rev-parse HEAD)
  echo
  echo "索引已指向本次提交：$sha"
  echo "把 dist/index.json 放到公网即为最新索引。"
}

case "$MODE" in
  check)
    check_placeholders
    check_build
    echo
    echo "✓ 检查通过。可以发布："
    echo "  ./publish.sh npm    发布到 npm"
    echo "  ./publish.sh git    提交并拿到 commit"
    ;;
  npm)
    check_placeholders
    check_build
    publish_npm
    ;;
  git)
    git_step
    ;;
  all)
    check_placeholders
    check_build
    publish_npm
    git_step
    ;;
  *)
    echo "用法: ./publish.sh [check|npm|git|all]"
    exit 1
    ;;
esac
