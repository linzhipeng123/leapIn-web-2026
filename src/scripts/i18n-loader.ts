import zhTranslations from '../i18n/locales/zh.json';
import enTranslations from '../i18n/locales/en.json';

const translations = { zh: zhTranslations, en: enTranslations };

function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

export function loadTranslations() {
  const lang = (localStorage.getItem('language') || 'zh') as 'zh' | 'en';
  const t = translations[lang];

  // 更新所有带 data-i18n 属性的元素（纯文本）
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      const value = getNestedValue(t, key);
      if (value) el.textContent = value;
    }
  });

  // 更新所有带 data-i18n-html 属性的元素（支持 HTML）
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (key) {
      const value = getNestedValue(t, key);
      if (value) (el as HTMLElement).innerHTML = value;
    }
  });

  // 更新列表
  document.querySelectorAll('[data-i18n-list]').forEach(el => {
    const key = el.getAttribute('data-i18n-list');
    if (key) {
      const items = getNestedValue(t, key);
      if (Array.isArray(items)) {
        el.innerHTML = items.map((item: string) => `<li>${item}</li>`).join('');
      }
    }
  });

  // 更新数组渲染（用于 industries 等）
  document.querySelectorAll('[data-i18n-array]').forEach(container => {
    const key = container.getAttribute('data-i18n-array');
    const template = container.getAttribute('data-i18n-template');
    
    if (key && template) {
      const items = getNestedValue(t, key);
      if (Array.isArray(items)) {
        container.innerHTML = items.map((item: any, index: number) => {
          let html = template;
          // 替换模板中的占位符
          Object.keys(item).forEach(prop => {
            html = html.replace(new RegExp(`{{${prop}}}`, 'g'), item[prop]);
          });
          // 添加图标映射
          const iconMap: Record<string, string> = {
            '科技行业': '💻', 'Technology': '💻',
            '医疗健康': '🏥', 'Healthcare': '🏥',
            '金融服务': '🏦', 'Financial Services': '🏦',
            '制造业': '🏭', 'Manufacturing': '🏭',
            '零售电商': '🛒', 'Retail & E-commerce': '🛒',
            '教育培训': '📚', 'Education': '📚'
          };
          html = html.replace('{{icon}}', iconMap[item.title] || '📚');
          return html;
        }).join('');
      }
    }
  });
}

// 初始化
if (typeof window !== 'undefined') {
  loadTranslations();
  
  // 监听语言变化
  window.addEventListener('storage', (e) => {
    if (e.key === 'language') {
      loadTranslations();
    }
  });
}
