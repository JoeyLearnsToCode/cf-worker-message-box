# 消息箱

这是一个简单的 Cloudflare Worker 应用程序，用于储存带有标题和内容的消息到 Cloudflare D1 数据库，并且可以在网页上显示它们。

## 功能

1. **添加消息**: 可以通过向 `/add` 发送请求并附带 JSON 格式的主体来添加消息。
2. **消息数量上限**: 消息箱最多存储 50 条消息。达到限制时，将删除最旧的消息。
3. **数据存储**: 消息存储在 Cloudflare D1 数据库中。
4. **查看消息**: 通过向 `/` 发送请求，可以获取一个显示所有消息的简单网页。消息按添加时间倒序排列。
5. **认证**: `/add` 和 `/` 端点都需要一个名为 `token` 的 HTTP 查询字符串进行鉴权。

## API

### 添加消息

```bash
curl 'https://yourdomain.com/add?token=your_secret_token' -d '{"title":"hello", "content":"world"}'
```

### 查看消息

使用浏览器打开`https://yourdomain.com/?token=your_secret_token`

## 部署

1. 克隆本仓库
2. 在仓库目录打开控制台，执行`npm install`
3. 修改`wrangler.toml`中的`database_id`值为你的 [Cloudflare D1 数据库](https://developers.cloudflare.com/d1/) ID。`database_name`的值也一样
4. 在仓库目录打开控制台，执行`wrangler deploy`，将会自动创建好名为 `message-box` 的 Worker

## 环境变量

- `TOKEN`：添加、查看消息所需的鉴权 token，即上文中的`your_secret_token`。推荐配置，如果不配置则不会鉴权。
- `MAX_MSG_COUNT`：最大消息数量，默认为 20。超过后将会开始淘汰最老的消息。
- `MAX_TITLE_LENGTH`：消息标题的最大长度，默认为 20。
- `MAX_CONTENT_LENGTH`：消息内容的最大长度，默认为 70。

# Message Box (English README)

This is a simple Cloudflare Worker application used for storing messages with titles and content into the Cloudflare D1 database and displaying them on a webpage.

## Features

1. **Add Message**: Messages can be added by sending a request to `/add` with a JSON-formatted body.
2. **Message Limit**: The message box can store up to 50 messages. When the limit is reached, the oldest message will be deleted.
3. **Data Storage**: Messages are stored in the Cloudflare D1 database.
4. **View Messages**: By sending a request to `/`, a simple webpage that displays all messages can be accessed. Messages are sorted in descending order by the time they were added.
5. **Authentication**: Both `/add` and `/` endpoints require an HTTP query string named `token` for authentication.

## API

### Add Message

```bash
curl 'https://yourdomain.com/add?token=your_secret_token' -d '{"title":"hello", "content":"world"}'
```

### View Messages

Open in browser: `https://yourdomain.com/?token=your_secret_token`

## Deployment

1. Clone this repository.
2. Open the console in the repository directory and execute `npm install`.
3. Modify the `database_id` value in `wrangler.toml` to your [Cloudflare D1 Database](https://developers.cloudflare.com/d1/) ID. The `database_name` value should be modified accordingly.
4. Open the console in the repository directory and execute `wrangler deploy`, which will automatically create a Worker named `message-box`.

## Environment Variables

- `TOKEN`: The authentication token required to add and view messages, as mentioned above as `your_secret_token`. It's recommended to configure this; if not configured, there will be no authentication.
- `MAX_MSG_COUNT`: The maximum number of messages, set to 20 by default. When exceeded, the oldest messages will begin to be culled.
- `MAX_TITLE_LENGTH`: The maximum length of message titles, set to 20 by default.
- `MAX_CONTENT_LENGTH`: The maximum length of message content, set to 70 by default.
