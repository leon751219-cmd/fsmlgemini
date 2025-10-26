/**
 * 为html2canvas应用兼容的CSS变量值
 * 解决html2canvas无法解析CSS变量的问题
 */
function applyCompatibleCSS(element: HTMLElement) {
  // 定义CSS变量的实际颜色值
  const cssVariableMap = {
    '--background': '220 40% 5%',
    '--foreground': '210 40% 98%',
    '--card': '220 40% 10%',
    '--primary': '195 90% 60%',
    '--accent': '45 90% 60%',
    '--border': '210 40% 25%',
    '--input': '210 40% 20%',
    '--muted': '210 40% 15%',
    '--destructive': '0 84% 60%',
    '--chart-1': '195 100% 70%',
    '--chart-2': '43 74% 49%',
    '--chart-3': '280 60% 70%',
    '--chart-4': '45 93% 47%',
    '--chart-5': '340 75% 55%',
  };

  // 为克隆的元素添加兼容的CSS样式
  const style = document.createElement('style');
  let cssText = '';

  // 转换CSS变量为hsl值
  for (const [variable, hslValue] of Object.entries(cssVariableMap)) {
    cssText += `* { ${variable}: hsl(${hslValue}); }\n`;
  }

  // 添加基础的兼容样式
  cssText += `
    * {
      box-sizing: border-box !important;
    }

    [data-radix-select-trigger] {
      height: 3rem !important;
      line-height: 3rem !important;
      background-color: hsl(220 40% 10%) !important;
      color: hsl(210 40% 98%) !important;
      border: 1px solid hsl(210 40% 25%) !important;
    }

    input[type="date"],
    input[type="time"],
    input[type="text"] {
      background-color: hsl(220 40% 10%) !important;
      color: hsl(210 40% 98%) !important;
      border: 1px solid hsl(210 40% 25%) !important;
      height: 3rem !important;
      padding: 0.75rem !important;
    }
  `;

  style.textContent = cssText;
  element.appendChild(style);
}

export async function generateReportImage(element: HTMLElement) {
  // 动态导入 html2canvas，确保只在客户端加载，避免Vercel部署时的构建问题
  const html2canvas = (await import('html2canvas')).default;
  // 1. 克隆报告元素以便在后台操作，不影响前台显示
  const reportClone = element.cloneNode(true) as HTMLElement;
  reportClone.style.position = 'absolute';
  reportClone.style.left = '-9999px'; // 移出屏幕外
  reportClone.style.top = '-9999px';
  // 确保克隆的宽度与原始元素一致，以保持布局
  reportClone.style.width = `${element.offsetWidth}px`;
  document.body.appendChild(reportClone);

  try {
    // 2. 强制所有隐藏内容可见

    // a. 展开所有Tabs的内容
    const tabsContents = reportClone.querySelectorAll<HTMLElement>('[role="tabpanel"]');
    tabsContents.forEach(tc => {
      // 使用 !important 来确保样式被应用
      tc.style.setProperty('display', 'block', 'important');
    });

    // 隐藏Tabs切换按钮列表，因为它在完整报告中不再需要
    const tabsList = reportClone.querySelector<HTMLElement>('[role="tablist"]');
    if (tabsList) {
      tabsList.style.display = 'none';
    }

    // b. 展开所有Accordion折叠面板
    // 找到所有的trigger并模拟打开状态
    const accordionTriggers = reportClone.querySelectorAll<HTMLElement>('button[data-state="closed"]');
    accordionTriggers.forEach(trigger => {
        if (trigger.getAttribute('aria-controls')?.startsWith('radix-')) {
            trigger.setAttribute('data-state', 'open');
            trigger.setAttribute('aria-expanded', 'true');
            // 旋转图标
            const icon = trigger.querySelector('svg');
            if (icon) {
              icon.style.transform = 'rotate(180deg)';
            }
        }
    });

    // 强制显示所有Accordion的内容区域
    const accordionContents = reportClone.querySelectorAll<HTMLElement>('div[data-state="closed"]');
    accordionContents.forEach(content => {
      if (content.id.startsWith('radix-')) {
        content.setAttribute('data-state', 'open');
        // 关键：使用 setProperty 和 !important 来覆盖动画样式
        content.style.setProperty('height', 'auto', 'important');
        content.style.setProperty('opacity', '1', 'important');
        content.style.setProperty('visibility', 'visible', 'important');

        // 移除动画类，以防干扰
        if (content.classList.contains('animate-accordion-up')) {
          content.classList.remove('animate-accordion-up');
        }
        content.style.overflow = 'visible';
      }
    });

    // 3. 为html2canvas应用兼容的CSS变量值，解决颜色解析问题
    applyCompatibleCSS(reportClone);

    // 4. 使用html2canvas进行渲染
    const canvas = await html2canvas(reportClone, {
        backgroundColor: '#0a1628', // 设置背景色以匹配主题
        useCORS: true,
        scale: 4, // 超高清分辨率，清晰度提升一倍
        ignoreElements: (element) => {
          // 忽略可能导致问题的元素
          return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
        }
    });

    // 4. 生成Data URL并触发下载
    const dataUrl = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.download = '常清阁-命运启示.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error("生成报告图片时出错:", error);
    // 在这里可以添加一个用户提示，例如使用 toast
  } finally {
    // 5. 清理克隆的DOM元素
    document.body.removeChild(reportClone);
  }
}