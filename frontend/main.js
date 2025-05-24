document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  
  // Initial render
  renderApp();
  
  function renderApp() {
    app.innerHTML = `
      <header class="site-header">
        <h1>User Admin Portal</h1>
        <nav>
          <ul>
            <li><a href="#" class="active">Dashboard</a></li>
            <li><a href="#">Profile</a></li>
            <li><a href="#">Forums</a></li>
            <li><a href="#">Admin</a></li>
          </ul>
        </nav>
      </header>
      
      <main>
        <section class="dashboard">
          <h2>Dashboard</h2>
          
          <!-- Content Window (Preview/Edit Mode Demo) -->
          <div class="content-window edit-mode">
            <div class="window-header">
              <div>
                <span class="mode-indicator">Editing</span>
                <span class="file-name">welcome-post.md</span>
              </div>
              <div class="window-controls">
                <button id="toggle-mode">Preview (Ctrl+P)</button>
                <button>Save</button>
              </div>
            </div>
            <div class="window-content">
              <textarea id="editor" rows="10" style="width: 100%; border: none; outline: none; resize: none;">## Welcome to the forum!

This is a sample post that demonstrates the **edit/preview** functionality.

- List item one
- List item two
- List item three

The editor and preview mode share the same window.</textarea>
            </div>
          </div>
          
          <!-- User Profile Sample -->
          <h2>Your Profile</h2>
          <div class="user-profile">
            <div class="profile-sidebar">
              <div class="profile-avatar">
                <img src="https://via.placeholder.com/150" alt="Profile Avatar" style="width: 100%; border-radius: 5px;">
              </div>
              <h3>Username</h3>
              <p>Member since: April 2025</p>
              <div class="profile-stats">
                <div>Posts: 24</div>
                <div>Comments: 42</div>
                <div>Reputation: 128</div>
              </div>
            </div>
            <div class="profile-content">
              <h3>Recent Activity</h3>
              <div class="forum-activity">
                <div class="activity-item">
                  <h4>Comment on: "Game Design Principles"</h4>
                  <p>I think this is a great approach to procedural generation!</p>
                  <small>2 hours ago</small>
                </div>
                <div class="activity-item">
                  <h4>Posted: "Implementing User Profiles"</h4>
                  <p>Started a new discussion about profile systems in web applications.</p>
                  <small>Yesterday</small>
                </div>
                <div class="activity-item">
                  <h4>Updated project: "3D Visualization"</h4>
                  <p>Added new features to the visualization component.</p>
                  <small>3 days ago</small>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    `;
    
    // Add event listeners
    document.getElementById('toggle-mode').addEventListener('click', toggleEditPreviewMode);
    document.addEventListener('keydown', (e) => {
      // Check for Ctrl+P key combination
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault(); // Prevent browser print dialog
        toggleEditPreviewMode();
      }
    });
  }
  
  function toggleEditPreviewMode() {
    const contentWindow = document.querySelector('.content-window');
    const modeIndicator = document.querySelector('.mode-indicator');
    const toggleButton = document.getElementById('toggle-mode');
    const editor = document.getElementById('editor');
    
    if (contentWindow.classList.contains('edit-mode')) {
      // Switch to preview mode
      contentWindow.classList.remove('edit-mode');
      contentWindow.classList.add('preview-mode');
      modeIndicator.textContent = 'Preview';
      toggleButton.textContent = 'Edit (Ctrl+P)';
      
      // Convert editor content to preview
      const previewContent = convertMarkdownToHTML(editor.value);
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
      document.querySelector('.preview-content').remove();
      editor.style.display = 'block';
    }
  }
  
  function convertMarkdownToHTML(markdown) {
    // Very simple markdown conversion (just for demo)
    return markdown
      .replace(/## (.+)/g, '<h2>$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/- (.+)/g, '<li>$1</li>')
      .replace(/<li>(.+)<\/li>/g, '<ul><li>$1</li></ul>')
      .replace(/<\/ul><ul>/g, '')
      .replace(/\n\n/g, '<br>');
  }
});
