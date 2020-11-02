index 要做 html escape
要做使用者權限
超過多少字要限制 

pageList 要做分頁



文章 post 有 bug
文章新增 html escape 問題 <%= %> || <%- %>

```
((mb_strlen($row['content'],'utf8') > 41) ? mb_substr($row['content'], 0, 41, 'utf8') : $row['content']).((mb_strlen($row['content'],'utf8') > 41) ? 
" ..." : "")
```


編輯刪除
串後端

