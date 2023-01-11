## 配置说明
### cookie.json
注入你想要注入的 Cookie 信息，如 OAuth
示例：
```json
{
  "OauthExpires": "1671113188",
  "OauthUserID": "DuXiZhi",
  "OauthAccessToken": "dev.myones.netDuXiZhi1671113188"
}
```

### website.txt 
需要执行测试脚本的链接地址，回车区分
```txt
https://ones.com/ja/
https://ones.com/ja/products/project
```

TODO:
[] 支持 cli 版本, cli 读取 website.txt 文件
[] 支持通过 github.secret 读取 cookies，格式： a=b;c=d;