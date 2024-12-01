// 检查当前是否在阅读页面
function isReadingPage() {
    return window.location.href.includes('weread.qq.com/web/reader/');
}

// 等待页面加载完成
document.addEventListener('DOMContentLoaded', function() {
    if (isReadingPage()) {
        initializePageTurner();
    }
});

// 初始化页面翻转功能
function initializePageTurner() {
    // 监听滚轮事件
    document.addEventListener('wheel', handleWheelEvent, { passive: false });
}

// 处理滚轮事件
function handleWheelEvent(event) {
    // 确保仍在阅读页面
    if (!isReadingPage()) {
        return;
    }

    // 防止默认滚动行为
    event.preventDefault();
    
    // 获取滚动方向
    const direction = event.deltaY > 0 ? 'next' : 'prev';
    
    // 查找翻页按钮（使用新的选择器）
    const prevButton = document.querySelector('.renderTarget_pager_button:not(.renderTarget_pager_button_right)');
    const nextButton = document.querySelector('.renderTarget_pager_button.renderTarget_pager_button_right');
    
    // 根据滚动方向模拟点击
    try {
        if (direction === 'next' && nextButton) {
            nextButton.click();
        } else if (direction === 'prev' && prevButton) {
            prevButton.click();
        }
    } catch (error) {
        console.error('WeRead Page Turner: Error clicking button:', error);
    }
}

// 添加 MutationObserver 以处理动态加载的内容
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length && isReadingPage()) {
            // 检查是否需要重新初始化事件监听
            const pagerExists = document.querySelector('.renderTarget_pager');
            if (pagerExists) {
                // 页面导航元素已加载，确保事件监听器已设置
                initializePageTurner();
            }
        }
    });
});

// 配置观察选项
const config = { 
    childList: true, 
    subtree: true 
};

// 只在阅读页面启动观察器
if (isReadingPage()) {
    observer.observe(document.body, config);
}
