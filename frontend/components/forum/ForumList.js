// Forum list component
class ForumList {
  constructor(container, posts) {
    this.container = container;
    this.posts = posts;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="forum-list">
        <div class="forum-header">
          <h2>Forum Discussions</h2>
          <button class="new-post-btn">New Post</button>
        </div>
        <div class="forum-filters">
          <select>
            <option>All Categories</option>
            <option>Game Design</option>
            <option>Programming</option>
            <option>Art & Assets</option>
            <option>Questions</option>
          </select>
          <input type="text" placeholder="Search posts...">
        </div>
        <div class="posts-container">
          ${this.renderPosts()}
        </div>
        <div class="pagination">
          <a href="#" class="active">1</a>
          <a href="#">2</a>
          <a href="#">3</a>
          <a href="#">Next →</a>
        </div>
      </div>
    `;

    // Add event listeners
    this.container.querySelector('.new-post-btn').addEventListener('click', this.showNewPostEditor.bind(this));
  }

  renderPosts() {
    if (!this.posts || this.posts.length === 0) {
      return '<div class="no-posts">No posts yet. Be the first to start a discussion!</div>';
    }

    return this.posts.map(post => `
      <div class="forum-post" data-id="${post.id}">
        <div class="post-votes">
          <button class="vote-up">↑</button>
          <span class="vote-count">${post.votes || 0}</span>
          <button class="vote-down">↓</button>
        </div>
        <div class="post-content">
          <h3 class="post-title">${post.title}</h3>
          <p class="post-excerpt">${this.truncate(post.content, 150)}</p>
          <div class="post-meta">
            <span class="post-author">Posted by ${post.author || 'Anonymous'}</span>
            <span class="post-date">${this.formatDate(post.timestamp)}</span>
            <span class="post-comments">${post.comments ? post.comments.length : 0} comments</span>
          </div>
          <div class="post-tags">
            ${(post.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
      </div>
    `).join('');
  }

  truncate(str, length) {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  showNewPostEditor() {
    // Create a modal for the new post editor
    const modal = document.createElement('div');
    modal.className = 'modal new-post-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Create New Post</h3>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="content-window edit-mode">
            <div class="window-header">
              <div>
                <span class="mode-indicator">Editing</span>
                <span class="file-name">new-post.md</span>
              </div>
              <div class="window-controls">
                <button id="toggle-post-mode">Preview (Ctrl+P)</button>
              </div>
            </div>
            <div class="window-content">
              <input type="text" id="post-title" placeholder="Post title" class="post-title-input">
              <textarea id="post-editor" rows="10" style="width: 100%; border: none; outline: none; resize: none;">Write your post content here using **markdown**.

- You can use lists
- Format text
- And more!

This post will be associated with your user profile.</textarea>
            </div>
          </div>
          <div class="post-options">
            <select id="post-category">
              <option>Select Category</option>
              <option>Game Design</option>
              <option>Programming</option>
              <option>Art & Assets</option>
              <option>Questions</option>
            </select>
            <input type="text" id="post-tags" placeholder="Tags (comma separated)">
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-post">Cancel</button>
          <button class="submit-post">Post</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.querySelector('.cancel-post').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.querySelector('.submit-post').addEventListener('click', () => {
      const title = modal.querySelector('#post-title').value;
      const content = modal.querySelector('#post-editor').value;
      const category = modal.querySelector('#post-category').value;
      const tags = modal.querySelector('#post-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);

      // In a real app, this would send the data to the server
      console.log({ title, content, category, tags });
      
      document.body.removeChild(modal);
      alert('Post submitted successfully! (This is just a demo)');
    });

    // Implementation for toggle mode in the post editor
    modal.querySelector('#toggle-post-mode').addEventListener('click', () => {
      const contentWindow = modal.querySelector('.content-window');
      const modeIndicator = modal.querySelector('.mode-indicator');
      const toggleButton = modal.querySelector('#toggle-post-mode');
      const editor = modal.querySelector('#post-editor');
      
      if (contentWindow.classList.contains('edit-mode')) {
        // Switch to preview mode
        contentWindow.classList.remove('edit-mode');
        contentWindow.classList.add('preview-mode');
        modeIndicator.textContent = 'Preview';
        toggleButton.textContent = 'Edit (Ctrl+P)';
        
        // Simple markdown conversion
        const previewContent = this.convertMarkdownToHTML(editor.value);
        const previewElement = document.createElement('div');
        previewElement.className = 'preview-content';
        previewElement.innerHTML = previewContent;
        
        // Replace editor with preview
        editor.style.display = 'none';
        editor.insertAdjacentElement('afterend', previewElement);
      } else {
        // Switch to edit mode
        contentWindow.classList.remove('preview-mode');
        contentWindow.classList.add('edit-mode');
        modeIndicator.textContent = 'Editing';
        toggleButton.textContent = 'Preview (Ctrl+P)';
        
        // Remove preview element
        modal.querySelector('.preview-content').remove();
        editor.style.display = 'block';
      }
    });
  }

  convertMarkdownToHTML(markdown) {
    // Very simple markdown conversion
    return markdown
      .replace(/## (.+)/g, '<h2>$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/- (.+)/g, '<li>$1</li>')
      .replace(/<li>(.+)<\/li>/g, '<ul><li>$1</li></ul>')
      .replace(/<\/ul><ul>/g, '')
      .replace(/\n\n/g, '<br>');
  }
}

// Export for use in other files
export default ForumList;