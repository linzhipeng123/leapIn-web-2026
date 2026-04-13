# 法律文档内容管理

本目录包含网站的法律文档内容（隐私政策和服务条款）。

## 文件结构

- `privacy-policy-zh.md` - 中文隐私政策
- `privacy-policy-en.md` - 英文隐私政策
- `terms-of-service-zh.md` - 中文服务条款
- `terms-of-service-en.md` - 英文服务条款
- `security-policy-zh.md` - 中文安全政策
- `security-policy-en.md` - 英文安全政策

## 如何更新内容

### 方法 1: 从 DOCX 文件转换（推荐）

1. 打开 `src/assets/terms/` 目录中的 DOCX 文件
2. 使用在线工具（如 [Pandoc](https://pandoc.org/try/) 或 [Word to Markdown](https://word2md.com/)）将 DOCX 转换为 Markdown
3. 将转换后的内容复制到对应的 `.md` 文件中
4. 调整格式以确保：
   - 标题层级正确（# 为一级标题，## 为二级标题，等等）
   - 列表格式正确
   - 链接和强调文本正确
   - 特殊样式（如邮箱高亮）使用 `<span class="highlight-email">email@example.com</span>`

### 方法 2: 直接编辑 Markdown

直接在对应的 `.md` 文件中编辑内容。

## Markdown 格式说明

### 标题
```markdown
# 一级标题
## 二级标题
### 三级标题
```

### 列表
```markdown
- 无序列表项 1
- 无序列表项 2

1. 有序列表项 1
2. 有序列表项 2
```

### 强调
```markdown
**粗体文本**
*斜体文本*
```

### 链接
```markdown
[链接文本](https://example.com)
```

### 特殊样式

#### 高亮邮箱
```html
<span class="highlight-email">contact@leapin.ai</span>
```

## 工作原理

### 语言切换机制

本项目使用 `localStorage` 来存储用户的语言偏好，而不是通过 URL 路径区分语言。

**语言存储：**
```javascript
localStorage.setItem('language', 'zh'); // 或 'en'
```

**LegalContent 组件工作流程：**
1. 服务端渲染时，同时读取中英文两个版本的 Markdown 文件
2. 将两个版本的内容都存储在 HTML 的 `data-lang-zh` 和 `data-lang-en` 属性中
3. 客户端 JavaScript 根据 `localStorage.getItem('language')` 的值显示对应语言的内容
4. 当用户切换语言时，LanguageSwitcher 组件会刷新页面，新页面会根据新的语言设置显示内容

### 页面路由

所有语言共享相同的 URL：
- 隐私政策：`/legal/privacy`
- 服务条款：`/legal/terms`
- 安全政策：`/legal/security`

语言通过 `localStorage` 中的 `language` 键来控制（值为 `'zh'` 或 `'en'`）。

## 注意事项

1. 文件名格式必须为：`{page-name}-{lang}.md`
2. 语言代码：`zh` (中文) 或 `en` (英文)
3. 第一个 `#` 标题会被自动提取为页面标题
4. 保存文件后，需要重启开发服务器才能看到更改
