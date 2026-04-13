# DOCX 转 Markdown 转换指南

本指南将帮助您将 `src/assets/terms/` 目录中的 DOCX 文件转换为 Markdown 格式。

## 推荐工具

### 1. Pandoc（命令行工具）

Pandoc 是最强大的文档转换工具。

#### 安装
```bash
# macOS
brew install pandoc

# Windows
choco install pandoc

# Linux
sudo apt-get install pandoc
```

#### 使用方法
```bash
# 转换隐私政策（英文）
pandoc "src/assets/terms/LeapIn Website Privacy Policy (2026-4-11).docx" \
  -f docx -t markdown \
  -o src/content/legal/privacy-policy-en.md

# 转换隐私政策（中文）
pandoc "src/assets/terms/LeapIn 官网隐私政策（2026-4-11）.docx" \
  -f docx -t markdown \
  -o src/content/legal/privacy-policy-zh.md

# 转换服务条款（英文）
pandoc "src/assets/terms/LeapIn Website Terms of Service (2026-4-11).docx" \
  -f docx -t markdown \
  -o src/content/legal/terms-of-service-en.md

# 转换服务条款（中文）
pandoc "src/assets/terms/LeapIn 官网服务条款（2026-4-11）.docx" \
  -f docx -t markdown \
  -o src/content/legal/terms-of-service-zh.md
```

### 2. 在线转换工具

如果不想安装命令行工具，可以使用以下在线工具：

#### Word to Markdown
- 网址：https://word2md.com/
- 步骤：
  1. 上传 DOCX 文件
  2. 点击 "Convert"
  3. 复制生成的 Markdown
  4. 粘贴到对应的 `.md` 文件中

#### Pandoc Online
- 网址：https://pandoc.org/try/
- 步骤：
  1. 选择 "docx" 作为输入格式
  2. 选择 "markdown" 作为输出格式
  3. 上传或粘贴内容
  4. 点击 "Convert"
  5. 复制结果

#### CloudConvert
- 网址：https://cloudconvert.com/docx-to-md
- 步骤：
  1. 上传 DOCX 文件
  2. 选择 "MD" 作为输出格式
  3. 点击 "Convert"
  4. 下载转换后的文件

## 转换后的清理工作

转换完成后，您可能需要手动调整以下内容：

### 1. 标题层级
确保标题层级正确：
```markdown
# 一级标题（文档标题）
## 二级标题（主要章节）
### 三级标题（子章节）
#### 四级标题（小节）
```

### 2. 列表格式
检查列表是否正确：
```markdown
- 无序列表项
  - 嵌套列表项
  
1. 有序列表项
2. 有序列表项
```

### 3. 链接格式
确保链接格式正确：
```markdown
[链接文本](https://example.com)
```

### 4. 强调文本
```markdown
**粗体文本**
*斜体文本*
```

### 5. 特殊样式

#### 邮箱高亮
将普通邮箱文本替换为：
```html
<span class="highlight-email">contact@leapin.ai</span>
```

#### 日期格式
在文档开头添加更新日期：
```markdown
*最后更新时间：2026年4月11日*
```
或
```markdown
*Last updated April 11, 2026*
```

### 6. 删除多余空行
Pandoc 可能会生成多余的空行，建议删除连续的空行，保持文档整洁。

### 7. 表格格式
如果文档包含表格，确保表格格式正确：
```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容1 | 内容2 | 内容3 |
```

## 验证转换结果

转换完成后：

1. 在浏览器中访问对应页面查看效果
2. 检查所有标题、列表、链接是否正确显示
3. 确保中英文内容都已正确转换
4. 验证特殊样式（如邮箱高亮）是否生效

## 常见问题

### Q: 转换后的 Markdown 格式混乱怎么办？
A: 可以尝试：
1. 使用不同的转换工具
2. 在 Word 中先清理格式（清除所有格式，然后重新应用基本格式）
3. 手动调整 Markdown 格式

### Q: 中文字符显示异常？
A: 确保文件编码为 UTF-8。可以使用文本编辑器（如 VS Code）检查和修改文件编码。

### Q: 图片如何处理？
A: 如果 DOCX 中包含图片：
1. 将图片保存到 `public/legal/` 目录
2. 在 Markdown 中使用相对路径引用：
   ```markdown
   ![图片描述](/legal/image-name.png)
   ```

## 批量转换脚本

如果需要批量转换所有文件，可以创建一个 shell 脚本：

```bash
#!/bin/bash

# 转换所有法律文档
pandoc "src/assets/terms/LeapIn Website Privacy Policy (2026-4-11).docx" \
  -f docx -t markdown -o src/content/legal/privacy-policy-en.md

pandoc "src/assets/terms/LeapIn 官网隐私政策（2026-4-11）.docx" \
  -f docx -t markdown -o src/content/legal/privacy-policy-zh.md

pandoc "src/assets/terms/LeapIn Website Terms of Service (2026-4-11).docx" \
  -f docx -t markdown -o src/content/legal/terms-of-service-en.md

pandoc "src/assets/terms/LeapIn 官网服务条款（2026-4-11）.docx" \
  -f docx -t markdown -o src/content/legal/terms-of-service-zh.md

echo "转换完成！"
```

保存为 `convert-legal-docs.sh`，然后运行：
```bash
chmod +x convert-legal-docs.sh
./convert-legal-docs.sh
```
