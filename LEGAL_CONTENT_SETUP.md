# 法律内容管理系统设置完成

## 概述

已成功修改 `src/components/LegalContent.astro` 组件，使其支持从 Markdown 文件读取中英文法律文档内容。

## 文件结构

```
src/
├── components/
│   └── LegalContent.astro          # 法律内容展示组件（已修改）
├── content/
│   └── legal/                      # 法律文档内容目录（新建）
│       ├── README.md               # 使用说明
│       ├── CONVERSION_GUIDE.md     # DOCX 转 Markdown 指南
│       ├── privacy-policy-zh.md    # 中文隐私政策
│       ├── privacy-policy-en.md    # 英文隐私政策
│       ├── terms-of-service-zh.md  # 中文服务条款
│       ├── terms-of-service-en.md  # 英文服务条款
│       ├── security-policy-zh.md   # 中文安全政策
│       └── security-policy-en.md   # 英文安全政策
├── pages/
│   └── legal/
│       ├── privacy.astro           # 隐私政策页面（已更新）
│       ├── terms.astro             # 服务条款页面（已更新）
│       └── security.astro          # 安全政策页面（已更新）
└── assets/
    └── terms/                      # 原始 DOCX 文件
        ├── LeapIn Website Privacy Policy (2026-4-11).docx
        ├── LeapIn Website Terms of Service (2026-4-11).docx
        ├── LeapIn 官网隐私政策（2026-4-11）.docx
        └── LeapIn 官网服务条款（2026-4-11）.docx
```

## 主要改动

### 1. LegalContent.astro 组件

**改动内容：**
- 移除了 i18n JSON 依赖
- 添加了 Markdown 文件读取功能
- 支持根据 URL 路径自动切换中英文
- 使用 `marked` 库将 Markdown 转换为 HTML
- 优化了样式，支持更多标题层级

**工作原理：**
```typescript
// 服务端：同时读取中英文两个版本
const markdownZh = fs.readFileSync(`${pageName}-zh.md`, 'utf-8');
const markdownEn = fs.readFileSync(`${pageName}-en.md`, 'utf-8');

// 客户端：根据 localStorage 显示对应语言
const lang = localStorage.getItem('language') || 'zh';
const content = lang === 'zh' 
    ? element.getAttribute('data-lang-zh')
    : element.getAttribute('data-lang-en');
```

### 2. 页面路由更新

- `/legal/privacy` → 读取 `privacy-policy-en.md`
- `/zh/legal/privacy` → 读取 `privacy-policy-zh.md`
- `/legal/terms` → 读取 `terms-of-service-en.md`
- `/zh/legal/terms` → 读取 `terms-of-service-zh.md`
- `/legal/security` → 读取 `security-policy-en.md`
- `/zh/legal/security` → 读取 `security-policy-zh.md`

### 3. 新增依赖

```json
{
  "dependencies": {
    "marked": "^18.0.0"
  },
  "devDependencies": {
    "@types/node": "^25.6.0"
  }
}
```

## 下一步操作

### 1. 转换 DOCX 文件为 Markdown

目前 Markdown 文件中的内容是占位文本。您需要：

1. 查看 `src/content/legal/CONVERSION_GUIDE.md` 了解详细转换步骤
2. 使用推荐工具（Pandoc 或在线工具）转换 DOCX 文件
3. 将转换后的内容替换到对应的 `.md` 文件中
4. 手动调整格式以确保显示正确

**快速转换命令（需要安装 Pandoc）：**

```bash
# 安装 Pandoc
brew install pandoc  # macOS

# 转换所有文档
pandoc "src/assets/terms/LeapIn Website Privacy Policy (2026-4-11).docx" \
  -f docx -t markdown -o src/content/legal/privacy-policy-en.md

pandoc "src/assets/terms/LeapIn 官网隐私政策（2026-4-11）.docx" \
  -f docx -t markdown -o src/content/legal/privacy-policy-zh.md

pandoc "src/assets/terms/LeapIn Website Terms of Service (2026-4-11).docx" \
  -f docx -t markdown -o src/content/legal/terms-of-service-en.md

pandoc "src/assets/terms/LeapIn 官网服务条款（2026-4-11）.docx" \
  -f docx -t markdown -o src/content/legal/terms-of-service-zh.md
```

### 2. 测试页面

启动开发服务器并访问以下页面进行测试：

```bash
pnpm dev
```

访问：
- http://localhost:4321/legal/privacy
- http://localhost:4321/legal/terms
- http://localhost:4321/legal/security

然后使用页面右上角的语言切换器（Cn/En）切换语言查看效果。

### 3. 验证内容

检查以下内容：
- [ ] 标题是否正确显示
- [ ] 列表格式是否正确
- [ ] 链接是否可点击
- [ ] 邮箱高亮样式是否生效
- [ ] 中英文切换是否正常
- [ ] 移动端显示是否正常

## 样式说明

### 支持的 Markdown 元素

- **标题**：`#` 到 `#####`（一级到五级标题）
- **段落**：普通文本段落
- **列表**：有序列表和无序列表
- **强调**：`**粗体**` 和 `*斜体*`
- **链接**：`[文本](URL)`
- **特殊样式**：`<span class="highlight-email">email@example.com</span>`

### 自定义样式类

- `.highlight-email`：邮箱高亮样式，带渐变背景

## 维护指南

### 更新法律文档

1. 编辑对应的 `.md` 文件
2. 保存文件
3. 重启开发服务器（如果正在运行）
4. 刷新浏览器查看更改

### 添加新的法律文档

1. 在 `src/content/legal/` 创建新的 Markdown 文件
   - 命名格式：`{document-name}-{lang}.md`
2. 在 `src/pages/legal/` 创建新的页面文件
3. 使用 `<LegalContent pageName='{document-name}' />` 组件
4. 更新 Footer 组件添加链接

## 技术细节

### 语言检测逻辑

```javascript
// 客户端立即执行，根据 localStorage 显示内容
const lang = localStorage.getItem('language') || 'zh';
```

- 从 `localStorage` 读取 `language` 键
- 默认值为 `'zh'`（中文）
- 用户通过页面右上角的语言切换器更改语言

### Markdown 解析

使用 `marked` 库进行 Markdown 到 HTML 的转换：
- 支持 GitHub Flavored Markdown (GFM)
- 自动处理代码块、表格等高级特性
- 安全的 HTML 输出

### 错误处理

如果 Markdown 文件不存在或读取失败：
- 显示 "Content not available." 消息
- 在控制台输出错误信息
- 页面不会崩溃

## 常见问题

### Q: 为什么不直接使用 i18n JSON？
A: 法律文档通常很长且格式复杂，使用 Markdown 文件更易于维护和编辑。

### Q: 可以使用 HTML 而不是 Markdown 吗？
A: 可以，但 Markdown 更简洁且易于编辑。如果需要复杂的 HTML 结构，可以在 Markdown 中直接嵌入 HTML。

### Q: 如何添加图片？
A: 将图片放在 `public/legal/` 目录，然后在 Markdown 中使用：
```markdown
![图片描述](/legal/image-name.png)
```

### Q: 如何添加表格？
A: 使用 Markdown 表格语法：
```markdown
| 列1 | 列2 |
|-----|-----|
| 内容1 | 内容2 |
```

## 相关文档

- `src/content/legal/README.md` - 内容管理说明
- `src/content/legal/CONVERSION_GUIDE.md` - DOCX 转换指南

## 支持

如有问题，请联系开发团队或查看相关文档。
