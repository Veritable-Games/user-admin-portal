// Forum post detail component
class PostDetail {
  constructor(container, postId, apiClient) {
    this.container = container;
    this.postId = postId;
    this.apiClient = apiClient;
    this.post = null;
    this.editMode = false;
    this.render();
  }

  async fetchPost() {
    // In a real app, this would fetch from the API
    // For demo, we'll use mock data
    this.post = {
      id: this.postId,
      title: 'Integrating Editor and Preview in the Same Window',
      content: '## The Challenge\n\nWhen creating a content editor, one common challenge is how to handle the edit and preview modes. Many editors use separate tabs or windows, but this can disrupt the user experience.\n\n**Benefits of a shared window:**\n\n- Maintains spatial context\n- Reduces UI clutter\n- Provides immediate feedback\n- Streamlines the editing workflow\n\nThe key is to use clear visual indicators when switching modes so users always know whether they are editing or previewing.',
      author: 'user1',
      authorId: 1,
      timestamp: new Date(Date.now() - 86400000),
      tags: ['UI Design', 'UX', 'Content Management'],
      votes: 42,
      comments: [
        {
          id: 1,
          content: 'I completely agree. Having to switch between tabs breaks concentration.',
          author: 'user2',
          timestamp: new Date(Date.now() - 43200000),
          votes: 12
        },
        {
          id: 2,
          content: 'Have you considered how this would work on mobile devices with limited screen space?',
          author: 'user3',
          timestamp: new Date(Date.now() - 21600000),
          votes: 8
        },
        {
          id: 3,
          content: 'This is exactly what we implemented in our project. We used a colored indicator in the corner to show the current mode, along with keyboard shortcuts to toggle quickly.',
          author: 'user4',
          timestamp: new Date(Date.now() - 10800000),
          votes: 15
        }
      ]
    };
  }

  async render() {
    // Show loading state
    this.container.innerHTML = '<div class="loading">Loading post...</div>';
    
    // Fetch post data
    await this.fetchPost();
    
    if (!this.post) {
      this.container.innerHTML = '<div class="error">Post not found</div>';
      return;
    }
    
    // Render post
    this.container.innerHTML = `
      <div class="post-detail">
        <div class="post-header">
          <div class="post-votes">
            <button class="vote-up">↑</button>
            <span class="vote-count">${this.post.votes || 0}</span>
            <button class="vote-down">↓</button>
          </div>
          <div class="post-info">
            <h1 class="post-title">${this.post.title}</h1>
            <div class="post-meta">
              <span class="post-author">Posted by ${this.post.author || 'Anonymous'}</span>
              <span class="post-date">${this.formatDate(this.post.timestamp)}</span>
            </div>
            <div class="post-tags">
              ${(this.post.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </div>
          <div class="post-actions">
            <button class="edit-post">Edit</button>
            <button class="share-post">Share</button>
            <button class="save-post">Save</button>
          </div>
        </div>
        
        <div class="post-content-container">
          ${this.editMode ? this.renderEditor() : this.renderContent()}
        </div>
        
        <div class="comments-section">
          <h3>${this.post.comments ? this.post.comments.length : 0} Comments</h3>
          <div class="comment-form">
            <textarea placeholder="Add a comment..."></textarea>
            <button class="submit-comment">Comment</button>
          </div>
          <div class="comments-list">
            ${this.renderComments()}
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    this.container.querySelector('.edit-post').addEventListener('click', this.toggleEditMode.bind(this));
    this.container.querySelector('.submit-comment').addEventListener('click', this.addComment.bind(this));
  }

  renderContent() {
    return `
      <div class="post-content">
        ${this.convertMarkdownToHTML(this.post.content)}
      </div>
    `;
  }

  renderEditor() {
    return `
      <div class="content-window edit-mode">
        <div class="window-header">
          <div>
            <span class="mode-indicator">Editing</span>
            <span class="file-name">${this.post.title}</span>
          </div>
          <div class="window-controls">
            <button id="toggle-post-mode">Preview (Ctrl+P)</button>
            <button class="save-edit">Save</button>
            <button class="cancel-edit">Cancel</button>
          </div>
        </div>
        <div class="window-content">
          <textarea id="post-editor" rows="15" style="width: 100%; border: none; outline: none; resize: none;">${this.post.content}</textarea>
        </div>
      </div>
    `;
  }

  renderComments() {
    if (!this.post.comments || this.post.comments.length === 0) {
      return '<div class="no-comments">No comments yet. Be the first to comment!</div>';
    }

    return this.post.comments.map(comment => `
      <div class="comment" data-id="${comment.id}">
        <div class="comment-votes">
          <button class="vote-up">↑</button>
          <span class="vote-count">${comment.votes || 0}</span>
          <button class="vote-down">↓</button>
        </div>
        <div class="comment-content">
          <div class="comment-meta">
            <span class="comment-author">${comment.author || 'Anonymous'}</span>
            <span class="comment-date">${this.formatDate(comment.timestamp)}</span>
          </div>
          <p>${comment.content}</p>
          <div class="comment-actions">
            <button class="reply-btn">Reply</button>
            <button class="share-btn">Share</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    
    // Re-render the post content container
    const contentContainer = this.container.querySelector('.post-content-container');
    contentContainer.innerHTML = this.editMode ? this.renderEditor() : this.renderContent();
    
    if (this.editMode) {
      // Add event listeners for the editor
      this.container.querySelector('#toggle-post-mode').addEventListener('click', this.togglePreviewMode.bind(this));
      this.container.querySelector('.save-edit').addEventListener('click', this.saveEdit.bind(this));
      this.container.querySelector('.cancel-edit').addEventListener('click', () => {
        this.editMode = false;
        this.render();
      });
    }
  }

  togglePreviewMode(e) {
    const contentWindow = this.container.querySelector('.content-window');
    const modeIndicator = this.container.querySelector('.mode-indicator');
    const toggleButton = this.container.querySelector('#toggle-post-mode');
    const editor = this.container.querySelector('#post-editor');
    
    if (contentWindow.classList.contains('edit-mode')) {
      // Switch to preview mode
      contentWindow.classList.remove('edit-mode');
      contentWindow.classList.add('preview-mode');
      modeIndicator.textContent = 'Preview';
      toggleButton.textContent = 'Edit (Ctrl+P)';
      
      // Convert editor content to preview
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
      this.container.querySelector('.preview-content').remove();
      editor.style.display = 'block';
    }
  }

  saveEdit() {
    const editor = this.container.querySelector('#post-editor');
    this.post.content = editor.value;
    this.editMode = false;
    this.render();
    
    // In a real app, this would send an API request to update the post
    console.log('Post updated:', this.post);
    alert('Post updated successfully! (This is just a demo)');
  }

  addComment() {
    const commentTextarea = this.container.querySelector('.comment-form textarea');
    const commentText = commentTextarea.value.trim();
    
    if (!commentText) {
      alert('Please enter a comment');
      return;
    }
    
    // Add the comment
    const newComment = {
      id: (this.post.comments.length + 1),
      content: commentText,
      author: 'CurrentUser', // In a real app, this would be the logged-in user
      timestamp: new Date(),
      votes: 0
    };
    
    this.post.comments.push(newComment);
    commentTextarea.value = '';
    
    // Re-render comments
    const commentsList = this.container.querySelector('.comments-list');
    commentsList.innerHTML = this.renderComments();
    
    // In a real app, this would send an API request to add the comment
    console.log('Comment added:', newComment);
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  convertMarkdownToHTML(markdown) {
    if (!markdown) return '';
    
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
export default PostDetail;