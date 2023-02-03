#!/bin/bash
web_hooks='https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=ed6490eb-9062-432b-9a77-bf80886312e1'

package_name="$(node -pe "require('./package.json')['name']")"
package_version="$(node -pe "require('./package.json')['version']")"
homepage="$(node -pe "require('./package.json')['homepage']")"
git_repo="$(node -pe "require('./package.json')['repository']['url'].replace('git+', '').replace('.git', '')")"

SHORT_COMMIT="$(git rev-parse HEAD | cut -b1-7)"
COMMIT_USER="$(git log --pretty='%cn' -n 1)"
COMMIT_EMAIL="$(git log --pretty='%ce' -n 1)"
LATEST_COMMIT_MESSAGE="$(git log --pretty='%s' -n 1)"

font_color="green"
project_name_text="<font color="${font_color}">${package_name}</font>"
project_commit="[${SHORT_COMMIT}](${git_repo}/commit/${SHORT_COMMIT})"
build_result="成功 🥳"

md_head="🚀 npm 包发布通知\n"
md_project_name="项目：${project_name_text}(${project_commit}) | ${package_version} \n"
md_build_result="发布状态：<font color="${font_color}">${build_result}</font> \n"
md_commit_info="提交用户：[${COMMIT_USER}](mailto://${COMMIT_EMAIL}) \n"
md_commit_msg="提交内容：<font color="comment">${LATEST_COMMIT_MESSAGE}</font> \n"
md_homepage="项目地址：[${homepage}](${homepage})\n"
curl "${web_hooks}" -H 'Content-Type: application/json' -d '
{
    "msgtype": "markdown",
    "markdown": {
        "content": "'"${md_head}${md_project_name}${md_build_result}${md_commit_info}${md_commit_msg}${md_homepage}"'"
    }
}'