export interface Env {
	DB: D1Database;
	TOKEN: string;
	MAX_MSG_COUNT: number;
	MAX_TITLE_LENGTH: number;
	MAX_CONTENT_LENGTH: number;
}

export default {
	async fetch(request, env): Promise<Response> {
		const { pathname } = new URL(request.url);

		env = {
			...env,
			MAX_MSG_COUNT: env.MAX_MSG_COUNT || 20,
			MAX_TITLE_LENGTH: env.MAX_TITLE_LENGTH || 20,
			MAX_CONTENT_LENGTH: env.MAX_CONTENT_LENGTH || 70,
		};
		const pass = await authenticateRequest(request, env);
		if (!pass) {
			return new Response("Unauthorized", { status: 401 });
		}

		if (pathname === "/add") {
			return addMessage(request, env);
		}

		return allMessages(request, env);
	},
} satisfies ExportedHandler<Env>;

// 鉴权
async function authenticateRequest(request: Request, env: Env): Promise<boolean> {
	if (!env.TOKEN) {
		return true;
	}
	const url = new URL(request.url);
	const token = url.searchParams.get('token');
	return token === env.TOKEN;
}

async function addMessage(request: Request, env: Env): Promise<Response> {
	let { title, content } = await request.json() as { title: string, content: string };
	if (!title || !content) {
		return new Response("Title and content are required", { status: 400 });
	}

	// 如果标题或内容超过设定长度，自动截断
	title = title.slice(0, env.MAX_TITLE_LENGTH);
	content = content.slice(0, env.MAX_CONTENT_LENGTH);

	const { results } = await env.DB.prepare("SELECT COUNT(*) as count FROM messages")
		.all() as { results: { count: number }[] };
	if (results[0].count >= env.MAX_MSG_COUNT) {
		await env.DB.prepare("DELETE FROM messages ORDER BY sys_ctime ASC LIMIT ?")
			.bind(results[0].count + 1 - env.MAX_MSG_COUNT).run();
	}
	await env.DB.prepare("INSERT INTO messages (title, content) VALUES (?, ?)")
		.bind(title, content).run();
	return new Response("Message added successfully");
}

async function allMessages(request: Request, env: Env): Promise<Response> {
	const { results } = await env.DB.prepare("SELECT title, content, sys_ctime FROM messages ORDER BY sys_ctime DESC")
		.all() as { results: { title: string, content: string, sys_ctime: string }[] };

	let html = "<body>"
		+ tableStyle + tableJs
		+ "<table class='msg-table'><tr><th class='title'>标题（title）</th><th class='content'>内容（content）</th><th class='time'>时间（time）</th></tr>";
	results.forEach(msg => {
		html += `<tr><td>${msg.title}</td><td>${msg.content}</td><td>${msg.sys_ctime}</td></tr>`;
	});
	html += "</table></body>";
	return new Response(html, {
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
		}
	});
}

const tableStyle = `
<style>
/* 表格样式 - 自适应宽度 */
table {
    border-collapse: collapse; /* 合并边框 */
    width: 100%; /* 最大宽度 */
    max-width: 100%; /* 最大宽度 */
    background-color: #f2f2f2; /* 背景颜色 */
    table-layout: fixed; /* 固定表格布局 */
}

/* 设置每列宽度比例 */
th.title {
	width: 20%
}
th.content {
	width: 70%
}
th.time {
	width: 10%
}

/* 表格单元格、表头样式 */
th, td {
    text-align: left; /* 文本对齐方式 */
    padding: 8px; /* 填充空间 */
    word-wrap: break-word; /* 单词换行 */
    overflow: hidden; /* 隐藏溢出内容 */
    text-overflow: ellipsis; /* 显示省略符号表示内容过长 */
    border: 1px solid #ddd; /* 单元格边框样式 */
}

/* 表头样式 */
th {
    background-color: #4CAF50; /* 背景颜色 */
    color: white; /* 文本颜色 */
}

/* 表格条纹样式 */
tr:nth-child(odd) {
    background-color: #f9f9f9;
}

/* 表格行鼠标悬停样式 */
tr:hover {
    background-color: #ddd;
}
</style>
`

const tableJs = `
<script>
// 等待DOM内容完全加载完毕，转换UTC时间到本地时间
document.addEventListener('DOMContentLoaded', function() {
  function convertUTCToLocalTime(utcString) {
    const utcDate = new Date(utcString + 'Z');
    return utcDate.toLocaleString();
  }

  const table = document.querySelector('table.msg-table');

  for (let i = 1; i < table.rows.length; i++) {
    const row = table.rows[i];
    const cell = row.cells[2];
    const utcTime = cell.textContent.trim();

    cell.textContent = convertUTCToLocalTime(utcTime);
  }
});
</script>
`