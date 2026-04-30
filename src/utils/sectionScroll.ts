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
  /** 每个 slide 的最小停留时间（毫秒），防止快速滚动跳过 */
  minStayDuration?: number;
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
    minStayDuration = 1000,
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
  let lastSlideChangeTime = Date.now();
  let isInViewport = false;

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

  // 监听区域是否进入视口
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const wasInViewport = isInViewport;
        isInViewport = entry.isIntersecting;

        // 当区域进入视口时，根据滚动方向重置 slide 索引
        if (isInViewport && !wasInViewport) {
          // 检查区域在视口中的位置
          const rect = section.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          
          // 如果区域从上方进入（向下滚动），重置到第一个 slide
          if (rect.top >= 0 && rect.top < viewportHeight) {
            if (currentIndex !== 0) {
              currentIndex = 0;
              lastSlideChangeTime = Date.now();
              updateSlide(0);
              // 重置所有滚动相关状态，防止立即触发滚动
              scrollAccumulator = 0;
              lastScrollDirection = 0;
              isAnimating = true;
              if (animationTimeout) {
                clearTimeout(animationTimeout);
              }
              animationTimeout = window.setTimeout(() => {
                isAnimating = false;
                scrollAccumulator = 0;
                updateScrollState();
              }, minStayDuration);
            }
          }
          // 如果区域从下方进入（向上滚动），重置到最后一个 slide
          else if (rect.bottom > 0 && rect.bottom <= viewportHeight) {
            if (currentIndex !== totalSlides - 1) {
              currentIndex = totalSlides - 1;
              lastSlideChangeTime = Date.now();
              updateSlide(totalSlides - 1);
              // 重置所有滚动相关状态，防止立即触发滚动
              scrollAccumulator = 0;
              lastScrollDirection = 0;
              isAnimating = true;
              if (animationTimeout) {
                clearTimeout(animationTimeout);
              }
              animationTimeout = window.setTimeout(() => {
                isAnimating = false;
                scrollAccumulator = 0;
                updateScrollState();
              }, minStayDuration);
            }
          }
        }

        // 离开视口时重置状态
        if (!entry.isIntersecting) {
          // 离开视口时也重置滚动累积器，防止下次进入时有残留
          scrollAccumulator = 0;
          lastScrollDirection = 0;
          if ((window as any).scrollState) {
            (window as any).scrollState.isInnerScrolling = false;
          }
        }
      });
    },
    { threshold: [0, 0.1, 0.5, 0.9, 1] } // 多个阈值以更精确地检测进入方向
  );

  observer.observe(section);

  // 处理滚轮事件
  const handleWheel = (e: WheelEvent) => {
    const scrollDirection = e.deltaY > 0 ? 1 : -1;

    // 检查是否在边界
    const atStart = currentIndex === 0 && scrollDirection < 0;
    const atEnd = currentIndex === totalSlides - 1 && scrollDirection > 0;

    // 检查最小停留时间
    const timeSinceLastChange = Date.now() - lastSlideChangeTime;
    const hasStayedLongEnough = timeSinceLastChange >= minStayDuration;

    // 在边界时，只有满足最小停留时间才允许滚动传递到父级
    if (atStart || atEnd) {
      if (hasStayedLongEnough) {
        // 已经停留足够时间，允许滚动传递
        scrollAccumulator = 0;
        lastScrollDirection = 0;
        updateScrollState();
        return;
      } else {
        // 还未达到最小停留时间，阻止滚动
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }

    // 不在边界，阻止默认滚动行为
    e.preventDefault();
    e.stopPropagation();

    // 检查最小停留时间，防止快速滚动跳过 slide
    if (!hasStayedLongEnough) {
      // 还未达到最小停留时间，完全忽略滚动（不累积）
      scrollAccumulator = 0;
      return;
    }

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
    lastSlideChangeTime = Date.now(); // 记录切换时间

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

  // 初始化
  updateSlide(0);

  // 创建控制器 API
  const controller = {
    /** 获取当前索引 */
    getCurrentIndex: () => currentIndex,
    /** 获取总 slide 数量 */
    getTotalSlides: () => totalSlides,
    /** 跳转到指定索引 */
    goToSlide: (index: number) => {
      if (index >= 0 && index < totalSlides && index !== currentIndex) {
        lastSlideChangeTime = Date.now();
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

  // 延迟注册到全局，确保 registerSectionController 已定义
  setTimeout(() => {
    if ((window as any).registerSectionController) {
      (window as any).registerSectionController(sectionId, controller);
    }
  }, 0);

  return controller;
}
