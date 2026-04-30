/**
 * 自动滚动配置
 */
export interface AutoScrollConfig {
  /** 区域容器的 ID */
  sectionId: string;
  /** 滚动控制器 */
  scrollController: {
    getCurrentIndex: () => number;
    goToSlide: (index: number) => void;
  };
  /** 总共有多少个滑动状态 */
  totalSlides: number;
  /** 不活动时间（毫秒），默认 5000ms */
  inactivityDelay?: number;
  /** 自动滚动间隔（毫秒），默认 2000ms */
  autoScrollInterval?: number;
  /** 日志前缀，用于调试 */
  logPrefix?: string;
}

/**
 * 创建自动滚动功能
 * 用于在用户停止滚动一段时间后，自动滚动到目标位置
 */
export function createAutoScroll(config: AutoScrollConfig) {
  const {
    sectionId,
    scrollController,
    totalSlides,
    inactivityDelay = 1000,
    autoScrollInterval = 1000,
    logPrefix = '[AutoScroll]',
  } = config;

  const section = document.getElementById(sectionId);
  if (!section) {
    console.warn(`${logPrefix} Section with id "${sectionId}" not found`);
    return null;
  }

  // 状态变量
  let lastWheelDirection: 'up' | 'down' | null = null;
  let inactivityTimer: number | null = null;
  let autoScrollTimer: number | null = null;
  let isInSection = false;
  let lastWheelTime = 0;

  // 清除所有定时器
  const clearTimers = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
    if (autoScrollTimer) {
      clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }
  };

  // 自动滚动到目标
  const autoScrollToTarget = (direction: 'up' | 'down') => {
    clearTimers();

    const currentIndex = scrollController.getCurrentIndex();
    const targetIndex = direction === 'up' ? 0 : totalSlides - 1;

    // 如果已经在目标位置，不需要自动滚动
    if (currentIndex === targetIndex) {
      console.log(`${logPrefix} 已经在目标位置:`, targetIndex);
      return;
    }

    console.log(
      `${logPrefix} 开始自动滚动，方向:`,
      direction,
      '当前索引:',
      currentIndex,
      '目标索引:',
      targetIndex
    );

    // 每隔指定时间滚动一次
    autoScrollTimer = window.setInterval(() => {
      const current = scrollController.getCurrentIndex();
      console.log(`${logPrefix} 自动滚动中，当前索引:`, current);

      // if (direction === 'up' && current > 0) {
      //   // 向上滚动到上一个 slide
      //   scrollController.goToSlide(current - 1);
      // } else 
      if (direction === 'down' && current < totalSlides - 1) {
        // 向下滚动到下一个 slide
        scrollController.goToSlide(current + 1);
      } else {
        // 到达目标，停止自动滚动
        console.log(`${logPrefix} 到达目标位置，停止自动滚动`);
        clearTimers();
      }
    }, autoScrollInterval);
  };

  // 监听 wheel 事件来检测滚动方向
  const handleWheel = (e: WheelEvent) => {
    if (!isInSection) return;

    const now = Date.now();
    lastWheelTime = now;

    // 判断滚动方向
    const direction = e.deltaY > 0 ? 'down' : 'up';
    lastWheelDirection = direction;

    console.log(`${logPrefix} 检测到滚动，方向:`, direction, 'deltaY:', e.deltaY);

    // 清除之前的定时器
    clearTimers();

    // 设置不活动定时器
    inactivityTimer = window.setTimeout(() => {
      const timeSinceLastWheel = Date.now() - lastWheelTime;
      if (timeSinceLastWheel >= inactivityDelay && lastWheelDirection) {
        console.log(`${logPrefix} ${inactivityDelay / 1000}秒无活动，触发自动滚动，方向:`, lastWheelDirection);
        autoScrollToTarget(lastWheelDirection);
      }
    }, inactivityDelay);
  };

  // 使用 Intersection Observer 监听区域进入/离开
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const wasInSection = isInSection;
        isInSection = entry.isIntersecting;

        console.log(`${logPrefix} 区域可见性变化:`, isInSection);

        if (isInSection && !wasInSection) {
          console.log(`${logPrefix} 进入滚动区域`);
        }

        if (!isInSection) {
          // 离开区域时清除所有定时器
          console.log(`${logPrefix} 离开滚动区域，清除定时器`);
          clearTimers();
          lastWheelDirection = null;
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(section);

  // 添加 wheel 监听（使用捕获阶段，在 createSectionScroll 之前捕获）
  section.addEventListener('wheel', handleWheel, { passive: true, capture: true });

  // 清理函数
  const cleanup = () => {
    clearTimers();
    section.removeEventListener('wheel', handleWheel);
    observer.disconnect();
  };

  // 在页面卸载时清理
  window.addEventListener('beforeunload', cleanup);

  // 返回控制器 API
  return {
    /** 手动清理资源 */
    destroy: cleanup,
    /** 清除当前的定时器 */
    clearTimers,
  };
}
