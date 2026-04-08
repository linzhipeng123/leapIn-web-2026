/**
 * 区域滚动控制器配置
 */
export interface SectionScrollConfig {
  /** 区域容器的 ID */
  sectionId: string;
  /** 总共有多少个滑动状态 */
  totalSlides: number;
  /** 滚动阈值（像素） */
  scrollThreshold?: number;
  /** 动画持续时间（毫秒） */
  animationDuration?: number;
  /** 更新滑动状态的回调函数 */
  onSlideUpdate: (index: number) => void;
  /** 是否在移动端禁用 */
  disableOnMobile?: boolean;
}

/**
 * 创建区域滚动控制器
 * 用于处理区域内的滚动事件，实现平滑的滑动切换效果
 */
export function createSectionScroll(config: SectionScrollConfig) {
  const {
    sectionId,
    totalSlides,
    scrollThreshold = 50,
    animationDuration = 800,
    onSlideUpdate,
    disableOnMobile = true,
  } = config;

  const section = document.getElementById(sectionId);
  if (!section) {
    console.warn(`Section with id "${sectionId}" not found`);
    return null;
  }

  // 检查是否为移动端
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (disableOnMobile && isMobile) {
    return null;
  }

  // 滚动控制变量
  let currentIndex = 0;
  let isAnimating = false;
  let scrollAccumulator = 0;
  let lastScrollDirection = 0;
  let animationTimeout: number | null = null;

  // 更新全局滚动状态（如果存在）
  const updateScrollState = () => {
    if ((window as any).scrollState) {
      (window as any).scrollState.canScrollToPrev = currentIndex === 0;
      (window as any).scrollState.canScrollToNext = currentIndex === totalSlides - 1;
      (window as any).scrollState.isInnerScrolling = isAnimating;
    }
  };

  // 更新滑动状态
  const updateSlide = (index: number) => {
    currentIndex = index;
    onSlideUpdate(index);
    updateScrollState();
  };

  // 处理滚轮事件
  const handleWheel = (e: WheelEvent) => {
    const scrollDirection = e.deltaY > 0 ? 1 : -1;

    // 检查是否在边界
    const atStart = currentIndex === 0 && scrollDirection < 0;
    const atEnd = currentIndex === totalSlides - 1 && scrollDirection > 0;

    // 在边界时，允许滚动传递到父级
    if (atStart || atEnd) {
      scrollAccumulator = 0;
      lastScrollDirection = 0;
      updateScrollState();
      return;
    }

    // 不在边界，阻止默认滚动行为
    e.preventDefault();
    e.stopPropagation();

    // 检测方向改变
    if (lastScrollDirection !== 0 && scrollDirection !== lastScrollDirection) {
      if (animationTimeout) {
        clearTimeout(animationTimeout);
        animationTimeout = null;
      }
      isAnimating = false;
      scrollAccumulator = 0;
    }

    lastScrollDirection = scrollDirection;

    // 如果正在动画中且方向相同，累积滚动量
    if (isAnimating) {
      scrollAccumulator += Math.abs(e.deltaY);
      if (scrollAccumulator < scrollThreshold) {
        return;
      }
    }

    // 累积滚动量
    scrollAccumulator += Math.abs(e.deltaY);

    // 未达到阈值，不触发切换
    if (scrollAccumulator < scrollThreshold) {
      return;
    }

    // 达到阈值，执行切换
    scrollAccumulator = 0;
    isAnimating = true;

    const targetIndex = scrollDirection > 0 ? currentIndex + 1 : currentIndex - 1;
    updateSlide(targetIndex);

    // 动画完成后重置状态
    if (animationTimeout) {
      clearTimeout(animationTimeout);
    }
    animationTimeout = window.setTimeout(() => {
      isAnimating = false;
      scrollAccumulator = 0;
      animationTimeout = null;
      updateScrollState();
    }, animationDuration);
  };

  // 添加事件监听
  section.addEventListener('wheel', handleWheel, { passive: false });

  // 监听区域是否在视口中
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          // 离开视口时重置状态
          if ((window as any).scrollState) {
            (window as any).scrollState.isInnerScrolling = false;
          }
        }
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(section);

  // 初始化
  updateSlide(0);

  // 返回控制器 API
  return {
    /** 获取当前索引 */
    getCurrentIndex: () => currentIndex,
    /** 跳转到指定索引 */
    goToSlide: (index: number) => {
      if (index >= 0 && index < totalSlides) {
        updateSlide(index);
      }
    },
    /** 销毁控制器 */
    destroy: () => {
      section.removeEventListener('wheel', handleWheel);
      observer.disconnect();
      if (animationTimeout) {
        clearTimeout(animationTimeout);
      }
    },
  };
}
