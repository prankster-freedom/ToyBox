const nameInput = document.getElementById('nameInput');
const greetButton = document.getElementById('greetButton');
const healthCheckButton = document.getElementById('healthCheckButton');
const chatHistory = document.getElementById('chatHistory');
const chatInput = document.getElementById('chatInput');
const chatButton = document.getElementById('chatButton');
const resultParagraph = document.getElementById('result');

const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const userNameSpan = document.getElementById('userName');

// ページロード時に認証状態をチェック
// サーバーサイドで認証済みの場合のみこのページに到達するため、常にapp-sectionを表示
window.onload = async () => {
    try {
        const response = await fetch('/user'); // ユーザー情報を取得する新しいエンドポイントを想定
        if (response.ok) {
            const user = await response.json();
            if (user && user.displayName) {
                userNameSpan.textContent = user.displayName;
                authSection.style.display = 'none';
                appSection.style.display = 'block';
                
                // 投稿一覧を取得・表示
                fetchPosts(user);
            } else {
                // ユーザー情報が取得できない場合は、ログインボタンを表示（何もしない）
                console.log('User not logged in');
            }
        } else {
            // 応答がOKでない場合も、ログインボタンを表示（何もしない）
            console.log('Failed to fetch user info');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        // エラー時もログインボタンを表示（何もしない）
    }
};

async function fetchPosts(currentUser) {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '<p>Loading posts...</p>';
    try {
        const response = await fetch('/api/posts');
        if (response.ok) {
            const posts = await response.json();
            renderPosts(posts, currentUser);
        } else {
            postsContainer.innerHTML = '<p>Failed to load posts.</p>';
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
        postsContainer.innerHTML = '<p>Error loading posts.</p>';
    }
}

function renderPosts(posts, currentUser) {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = ''; // Clear loading message

    if (posts.length === 0) {
        postsContainer.innerHTML = '<p>No posts yet.</p>';
        return;
    }

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.style.border = '1px solid #ddd';
        postElement.style.padding = '10px';
        postElement.style.marginBottom = '10px';
        postElement.style.borderRadius = '5px';
        postElement.style.backgroundColor = '#fff';

        const meta = document.createElement('div');
        meta.style.fontSize = '0.9em';
        meta.style.color = '#666';
        meta.textContent = `${post.author.displayName} - ${new Date(post.createdAt).toLocaleString()}`;
        postElement.appendChild(meta);

        const content = document.createElement('div');
        content.style.marginTop = '5px';
        content.textContent = post.content;
        postElement.appendChild(content);

        // Show delete button only if the current user is the author
        if (currentUser && currentUser.id === post.author.id) {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.style.marginTop = '10px';
            deleteButton.style.backgroundColor = '#ffebee';
            deleteButton.style.color = '#c62828';
            deleteButton.style.border = '1px solid #ef9a9a';
            deleteButton.onclick = () => deletePost(post.id, currentUser);
            postElement.appendChild(deleteButton);
        }

        postsContainer.appendChild(postElement);
    });
}

async function deletePost(postId, currentUser) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }

    try {
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE'
        });

        if (response.status === 204) {
            // Reload posts
            fetchPosts(currentUser);
        } else {
            alert('Failed to delete post.');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post.');
    }
}

greetButton.addEventListener('click', async () => {
    const name = nameInput.value || 'World'; // 入力が空なら'World'を使う
    resultParagraph.textContent = '通信中...';

    try {
        const response = await fetch('/api/greet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: name }),
        });

        if (!response.ok) {
            throw new Error('サーバーからの応答が正常ではありません。');
        }

        const data = await response.json();
        resultParagraph.textContent = data.message;
    } catch (error) {
        console.error('エラーが発生しました:', error);
        resultParagraph.textContent = 'エラーが発生しました。';
    }
});

chatButton.addEventListener('click', async () => {
    const message = chatInput.value;
    if (!message) return;

    appendMessage('You', message);
    chatInput.value = '';
    resultParagraph.textContent = 'AIが応答を生成中...';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        });

        if (!response.ok) {
            throw new Error('サーバーからの応答が正常ではありません。');
        }

        const data = await response.json();
        appendMessage('AI', data.message);
        resultParagraph.textContent = ''; // 応答が成功したらクリア
    } catch (error) {
        console.error('チャットエラー:', error);
        appendMessage('System', 'エラーが発生しました。');
        resultParagraph.textContent = 'エラーが発生しました。';
    }
});

function appendMessage(sender, message) {
    const messageElement = document.createElement('p');
    messageElement.textContent = `[${sender}]: ${message}`;
    chatHistory.appendChild(messageElement);
    chatHistory.scrollTop = chatHistory.scrollHeight; // 自動スクロール
}

healthCheckButton.addEventListener('click', async () => {
    resultParagraph.textContent = '通信中...';

    try {
        // GETリクエストなので、fetchの第二引数は省略可能です
        const response = await fetch('/api/health');

        if (!response.ok) {
            throw new Error('サーバーからの応答が正常ではありません。');
        }

        const data = await response.json();
        resultParagraph.textContent = `Status: ${data.status}, Timestamp: ${data.timestamp}`;
    } catch (error) {
        console.error('エラーが発生しました:', error);
        resultParagraph.textContent = 'エラーが発生しました。';
    }
});