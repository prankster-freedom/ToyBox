const { createApp } = Vue;

const app = createApp({
  template: `
    <div>
      <div class="user-info">
        <div v-if="user">
          <p>Welcome, {{ user.displayName }}! <button @click="logout">Logout</button></p>
        </div>
        <div v-else>
          <p>You are not logged in. <button @click="login">Login with Google</button></p>
        </div>
      </div>

      <div v-if="user">
        <div class="new-post-form">
          <h2>Create New Post</h2>
          <input v-model="newPost.title" placeholder="Title">
          <textarea v-model="newPost.content" placeholder="Content"></textarea>
          <button @click="createPost">Create</button>
        </div>

        <h2>Posts</h2>
        <ul class="posts-list">
          <li v-for="post in posts" :key="post.id" class="post-item">
            <h3>{{ post.title }}</h3>
            <p>{{ post.content }}</p>
            <small>Created at: {{ new Date(post.createdAt).toLocaleString() }}</small>
            <div v-if="user.id === post.authorId">
              <button @click="deletePost(post.id)">Delete</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `,
  data() {
    return {
      user: null,
      posts: [],
      newPost: {
        title: '',
        content: ''
      }
    };
  },
  async created() {
    await this.fetchUser();
    if (this.user) {
      await this.fetchPosts();
    }
  },
  methods: {
    async fetchUser() {
      try {
        const response = await fetch('/user');
        if (response.ok) {
          this.user = await response.json();
        } else {
          this.user = null;
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        this.user = null;
      }
    },
    async fetchPosts() {
      try {
        const response = await fetch('/api/posts');
        if (response.ok) {
          this.posts = await response.json();
        } else {
          console.error('Error fetching posts:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    },
    async createPost() {
      try {
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.newPost)
        });
        if (response.ok) {
          this.newPost.title = '';
          this.newPost.content = '';
          await this.fetchPosts();
        } else {
          console.error('Error creating post:', response.statusText);
        }
      } catch (error) {
        console.error('Error creating post:', error);
      }
    },
    async deletePost(postId) {
      if (!confirm('Are you sure you want to delete this post?')) return;
      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          await this.fetchPosts();
        } else {
          console.error('Error deleting post:', response.statusText);
        }
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    },
    login() {
      window.location.href = '/auth/google';
    },
    logout() {
      window.location.href = '/auth/logout';
    }
  }
});

app.mount('#app');
