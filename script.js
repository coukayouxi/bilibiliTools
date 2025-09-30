// API请求函数
async function request(url) {
    try {
        const proxy = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
        const res = await fetch(proxy);
        if (!res.ok) throw new Error('network');
        return await res.json();
    } catch (error) {
        console.error('API请求错误:', error);
        throw error;
    }
}

// 切换页面
function switchPage(pageName) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    // 移除所有导航项的active类
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 显示对应页面
    document.getElementById(pageName + '-page').classList.add('active');
    // 设置对应导航项为active
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
}

// 根据当前URL hash切换页面
function switchPageByHash() {
    const hash = window.location.hash.substring(1); // 移除 '#' 符号
    if (hash) {
        // 检查是否是特殊hash如 user-uid, video-bvid 等
        if (hash.includes('-')) {
            const [pageName, param] = hash.split('-', 2);
            switchPage(pageName);
            // 根据参数类型填充对应输入框
            if (pageName === 'user' && param) {
                document.getElementById('user-uid').value = param;
            } else if (pageName === 'video' && param) {
                document.getElementById('video-bvid').value = param;
            } else if (pageName === 'live' && param) {
                document.getElementById('live-room').value = param;
            } else if (pageName === 'rank' && param) {
                document.getElementById('rank-rid').value = param;
            }
        } else {
            switchPage(hash);
        }
    } else {
        // 如果没有hash，默认显示首页
        switchPage('home');
    }
}

// 页面切换事件
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        const pageName = this.getAttribute('data-page');
        switchPage(pageName);
        // 更新URL hash但不刷新页面
        window.location.hash = pageName;
    });
});

// 监听hash变化事件
window.addEventListener('hashchange', switchPageByHash);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 根据URL中的hash值显示对应页面
    switchPageByHash();
    
    // 生成随机表情
    getRandomEmoji();
    setInterval(getRandomEmoji, 5000);
    
    // 键盘回车事件
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const activePage = document.querySelector('.page.active').id.replace('-page', '');
            
            if (activePage === 'user') {
                if (document.activeElement.id === 'user-uid') {
                    getUserInfo();
                }
            } else if (activePage === 'video') {
                if (document.activeElement.id === 'video-bvid') {
                    getVideoInfo();
                }
            } else if (activePage === 'live') {
                if (document.activeElement.id === 'live-room') {
                    getLiveOnline();
                }
            } else if (activePage === 'rank') {
                if (document.activeElement.id === 'rank-rid') {
                    getRankTop1();
                }
            } else if (activePage === 'comment') {
                if (document.activeElement.id === 'comment-bvid') {
                    getHotComments();
                }
            }
        }
    });
});

// 显示结果
function showResult(page, title, value) {
    const resultsDiv = document.getElementById(page + '-results');
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';
    resultItem.innerHTML = `
        <div class="result-title">${title}</div>
        <div class="result-value">${value}</div>
    `;
    resultsDiv.innerHTML = '';
    resultsDiv.appendChild(resultItem);
}

// 显示多个结果
function showResults(page, results) {
    const resultsDiv = document.getElementById(page + '-results');
    resultsDiv.innerHTML = '';
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <div class="result-title">${result.title}</div>
            <div class="result-value">${result.value}</div>
        `;
        resultsDiv.appendChild(resultItem);
    });
}

// 显示错误
function showError(page, message) {
    const resultsDiv = document.getElementById(page + '-results');
    resultsDiv.innerHTML = `<div class="error">${message}</div>`;
}

// 显示加载状态
function showLoading(page) {
    const resultsDiv = document.getElementById(page + '-results');
    resultsDiv.innerHTML = '<div class="loading">正在查询中，请稍候...</div>';
}

// 获取用户粉丝数
async function getFan(uid) {
    try {
        const json = await request(`https://api.bilibili.com/x/relation/stat?vmid=${uid}`);
        return json.code === 0 ? json.data.follower : '获取失败';
    } catch {
        return '获取失败';
    }
}

// 获取用户关注数
async function getFollow(uid) {
    try {
        const json = await request(`https://api.bilibili.com/x/relation/stat?vmid=${uid}`);
        return json.code === 0 ? json.data.following : '获取失败';
    } catch {
        return '获取失败';
    }
}

// 获取用户拉黑数
async function getBlack(uid) {
    try {
        const json = await request(`https://api.bilibili.com/x/relation/stat?vmid=${uid}`);
        return json.code === 0 ? json.data.black : '获取失败';
    } catch {
        return '获取失败';
    }
}

// 获取投稿视频数
async function getVideoCount(uid) {
    try {
        const json = await request(`https://api.bilibili.com/x/space/navnum?mid=${uid}`);
        return json.code === 0 ? json.data.video : '获取失败';
    } catch {
        return '获取失败';
    }
}

// 获取历史获赞
async function getLiked(uid) {
    try {
        const json = await request(`https://api.bilibili.com/x/space/upstat?mid=${uid}`);
        return json.code === 0 ? json.data.likes : '获取失败';
    } catch {
        return '获取失败';
    }
}

// 检查是否直播
async function isLive(uid) {
    try {
        const json = await request(`https://api.live.bilibili.com/room/v1/Room/getRoomIdByUid?uid=${uid}`);
        if (json.code !== 0) return '未开通直播间';
        const roomId = json.data.room_id;
        const info = await request(`https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${roomId}`);
        return info.code === 0 && info.data.live_status === 1 ? '直播中' : '未直播';
    } catch {
        return '获取失败';
    }
}

// 查询用户信息
async function getUserInfo() {
    showLoading('user');
    const uid = document.getElementById('user-uid').value;
    if (!uid) {
        showError('user', '请输入用户UID');
        return;
    }

    try {
        const [fan, follow, black, videoCount, liked] = await Promise.all([
            getFan(uid),
            getFollow(uid),
            getBlack(uid),
            getVideoCount(uid),
            getLiked(uid)
        ]);

        const results = [
            { title: '👥 粉丝数', value: fan },
            { title: '👤 关注数', value: follow },
            { title: '🚫 拉黑数', value: black },
            { title: '🎬 投稿视频数', value: videoCount },
            { title: '👍 历史获赞', value: liked }
        ];
        showResults('user', results);
    } catch (error) {
        showError('user', '查询失败: ' + error.message);
    }
}

// 检查直播状态
async function checkLive() {
    showLoading('user');
    const uid = document.getElementById('user-uid').value;
    if (!uid) {
        showError('user', '请输入用户UID');
        return;
    }

    try {
        const status = await isLive(uid);
        showResult('user', '🔴 直播状态', status);
    } catch (error) {
        showError('user', '查询失败: ' + error.message);
    }
}

// 获取视频信息
async function getVideoInfo() {
    showLoading('video');
    const bvid = document.getElementById('video-bvid').value;
    if (!bvid) {
        showError('video', '请输入视频BVID');
        return;
    }

    try {
        const json = await request(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`);
        if (json.code !== 0) {
            showError('video', '视频不存在');
            return;
        }
        const d = json.data, s = d.stat;
        const info = `📺 标题：${d.title} | 📈 播放：${s.view} | 💬 弹幕：${s.danmaku} | ❤️ 点赞：${s.like}`;
        showResult('video', '🎬 视频信息', info);
    } catch (error) {
        showError('video', '查询失败: ' + error.message);
    }
}

// 获取热评
async function getHotComments() {
    showLoading('comment');
    const bvid = document.getElementById('comment-bvid').value;
    const count = document.getElementById('comment-count').value;
    const sep = document.getElementById('comment-separator').value;
    
    if (!bvid) {
        showError('comment', '请输入视频BVID');
        return;
    }

    try {
        const ps = Math.min(3, Math.max(1, parseInt(count, 10) || 1));
        const json = await request(`https://api.bilibili.com/x/v2/reply?type=1&oid=${bvid}&sort=2&ps=${ps}`);
        
        if (json.code !== 0 || !json.data.replies) {
            showError('comment', '获取评论失败');
            return;
        }

        const map = { '换行': '\n', '空格': ' ', '逗号': '，', '时': '' };
        const separator = map[sep] || '\n';
        const comments = json.data.replies.map(r => r.content.message).join(separator);
        
        showResult('comment', '💬 热评内容', comments);
    } catch (error) {
        showError('comment', '查询失败: ' + error.message);
    }
}

// 获取直播间在线人数
async function getLiveOnline() {
    showLoading('live');
    const room = document.getElementById('live-room').value;
    if (!room) {
        showError('live', '请输入直播间ID');
        return;
    }

    try {
        const json = await request(`https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${room}`);
        const online = json.code === 0 ? json.data.online : '获取失败';
        showResult('live', '👥 在线人数', online);
    } catch (error) {
        showError('live', '查询失败: ' + error.message);
    }
}

// 获取排行榜TOP1
async function getRankTop1() {
    showLoading('rank');
    const rid = document.getElementById('rank-rid').value;
    if (!rid) {
        showError('rank', '请输入分区ID');
        return;
    }

    try {
        const json = await request(`https://api.bilibili.com/x/web-interface/ranking/v2?rid=${rid}&type=all`);
        const title = (json.code === 0 && json.data.list[0]) ? json.data.list[0].title : '获取失败';
        showResult('rank', '🏆 日榜TOP1标题', title);
    } catch (error) {
        showError('rank', '查询失败: ' + error.message);
    }
}

// 随机表情
function getRandomEmoji() {
    const pool = ['(´∀｀)♡', '(￣ω￣)', '(｡>﹏<｡)', '(｡◕‿◕｡)', '(｡>ᴗ<｡)', '(*≥ω≤*)', '(=｀ω´=)', '(｡･ω･｡)', '♡(￣ω￣)', '(￣▽￣)'];
    const emoji = pool[Math.floor(Math.random() * pool.length)];
    document.getElementById('emoji-display').textContent = emoji;
}

