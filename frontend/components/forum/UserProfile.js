// User profile component with forum activity integration
class UserProfile {
  constructor(container, userId, apiClient) {
    this.container = container;
    this.userId = userId;
    this.apiClient = apiClient;
    this.user = null;
    this.render();
  }

  async fetchUserData() {
    // In a real app, this would fetch from the API
    // For demo, we'll use mock data
    this.user = {
      id: this.userId,
      username: 'DemoUser',
      email: 'user@example.com',
      avatar: 'https://via.placeholder.com/150',
      joined: '2025-03-15',
      posts: 24,
      comments: 42,
      reputation: 128,
      badges: [
        { name: 'Helpful', icon: '👍', count: 5 },
        { name: 'Quality Writer', icon: '✍️', count: 3 },
        { name: 'Problem Solver', icon: '🔧', count: 2 }
      ],
      activity: [
        {
          type: 'comment',
          title: 'Game Design Principles',
          content: 'I think this is a great approach to procedural generation!',
          timestamp: new Date(Date.now() - 7200000),
          link: '/forum/posts/5'
        },
        {
          type: 'post',
          title: 'Implementing User Profiles',
          content: 'Started a new discussion about profile systems in web applications.',
          timestamp: new Date(Date.now() - 86400000),
          link: '/forum/posts/12'
        },
        {
          type: 'project',
          title: '3D Visualization',
          content: 'Added new features to the visualization component.',
          timestamp: new Date(Date.now() - 259200000),
          link: '/projects/3d-visualization'
        },
        {
          type: 'post',
          title: 'Integrating Editor and Preview',
          content: 'How to create a seamless editing experience with shared windows.',
          timestamp: new Date(Date.now() - 432000000),
          link: '/forum/posts/8'
        }
      ],
      preferences: {
        theme: 'light',
        emailNotifications: true,
        forumDigest: 'weekly'
      }
    };
  }

  async render() {
    // Show loading state
    this.container.innerHTML = '<div class="loading">Loading profile...</div>';
    
    // Fetch user data
    await this.fetchUserData();
    
    if (!this.user) {
      this.container.innerHTML = '<div class="error">User not found</div>';
      return;
    }
    
    // Render user profile
    this.container.innerHTML = `
      <div class="user-profile-detail">
        <div class="profile-header">
          <div class="profile-avatar">
            <img src="${this.user.avatar}" alt="${this.user.username}'s Avatar">
          </div>
          <div class="profile-info">
            <h1>${this.user.username}</h1>
            <p class="joined-date">Member since: ${new Date(this.user.joined).toLocaleDateString()}</p>
            <div class="user-badges">
              ${this.renderBadges()}
            </div>
          </div>
          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-value">${this.user.posts}</span>
              <span class="stat-label">Posts</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${this.user.comments}</span>
              <span class="stat-label">Comments</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${this.user.reputation}</span>
              <span class="stat-label">Reputation</span>
            </div>
          </div>
        </div>
        
        <div class="profile-body">
          <div class="profile-navigation">
            <ul class="profile-nav-tabs">
              <li class="active"><a href="#activity">Activity</a></li>
              <li><a href="#posts">Posts</a></li>
              <li><a href="#comments">Comments</a></li>
              <li><a href="#saved">Saved</a></li>
              <li><a href="#settings">Settings</a></li>
            </ul>
          </div>
          
          <div class="profile-content">
            <div id="activity" class="tab-content active">
              <h2>Recent Activity</h2>
              <div class="activity-timeline">
                ${this.renderActivity()}
              </div>
            </div>
            
            <div id="posts" class="tab-content">
              <h2>Posts</h2>
              <p>Your posts will appear here.</p>
            </div>
            
            <div id="comments" class="tab-content">
              <h2>Comments</h2>
              <p>Your comments will appear here.</p>
            </div>
            
            <div id="saved" class="tab-content">
              <h2>Saved Items</h2>
              <p>Items you've saved will appear here.</p>
            </div>
            
            <div id="settings" class="tab-content">
              <h2>Account Settings</h2>
              
              <div class="settings-section">
                <h3>Profile Information</h3>
                <form class="settings-form">
                  <div class="form-group">
                    <label for="display-name">Display Name</label>
                    <input type="text" id="display-name" value="${this.user.username}">
                  </div>
                  <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" value="${this.user.email}">
                  </div>
                  <div class="form-group">
                    <label for="bio">Bio</label>
                    <textarea id="bio" rows="4">Tell the community about yourself...</textarea>
                  </div>
                  <button type="submit" class="save-profile">Save Changes</button>
                </form>
              </div>
              
              <div class="settings-section">
                <h3>Preferences</h3>
                <form class="preferences-form">
                  <div class="form-group">
                    <label for="theme">Theme</label>
                    <select id="theme">
                      <option value="light" ${this.user.preferences.theme === 'light' ? 'selected' : ''}>Light</option>
                      <option value="dark" ${this.user.preferences.theme === 'dark' ? 'selected' : ''}>Dark</option>
                      <option value="system" ${this.user.preferences.theme === 'system' ? 'selected' : ''}>System</option>
                    </select>
                  </div>
                  <div class="form-group checkbox">
                    <input type="checkbox" id="email-notifications" ${this.user.preferences.emailNotifications ? 'checked' : ''}>
                    <label for="email-notifications">Email Notifications</label>
                  </div>
                  <div class="form-group">
                    <label for="forum-digest">Forum Digest</label>
                    <select id="forum-digest">
                      <option value="daily" ${this.user.preferences.forumDigest === 'daily' ? 'selected' : ''}>Daily</option>
                      <option value="weekly" ${this.user.preferences.forumDigest === 'weekly' ? 'selected' : ''}>Weekly</option>
                      <option value="never" ${this.user.preferences.forumDigest === 'never' ? 'selected' : ''}>Never</option>
                    </select>
                  </div>
                  <button type="submit" class="save-preferences">Save Preferences</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    const tabs = this.container.querySelectorAll('.profile-nav-tabs li a');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchTab(e.target.getAttribute('href'));
      });
    });
    
    this.container.querySelector('.save-profile').addEventListener('click', (e) => {
      e.preventDefault();
      this.saveProfileChanges();
    });
    
    this.container.querySelector('.save-preferences').addEventListener('click', (e) => {
      e.preventDefault();
      this.savePreferences();
    });
  }

  renderBadges() {
    if (!this.user.badges || this.user.badges.length === 0) {
      return '<p>No badges yet</p>';
    }

    return this.user.badges.map(badge => `
      <div class="badge" title="${badge.name} (${badge.count})">
        <span class="badge-icon">${badge.icon}</span>
        <span class="badge-count">${badge.count}</span>
      </div>
    `).join('');
  }

  renderActivity() {
    if (!this.user.activity || this.user.activity.length === 0) {
      return '<p>No activity yet</p>';
    }

    return this.user.activity.map(item => `
      <div class="activity-item ${item.type}">
        <div class="activity-icon">
          ${this.getActivityIcon(item.type)}
        </div>
        <div class="activity-content">
          <div class="activity-header">
            <span class="activity-type">${this.formatActivityType(item.type)}</span>
            <span class="activity-date">${this.formatDate(item.timestamp)}</span>
          </div>
          <h3 class="activity-title">
            <a href="${item.link}">${item.title}</a>
          </h3>
          <p class="activity-excerpt">${this.truncate(item.content, 120)}</p>
        </div>
      </div>
    `).join('');
  }

  getActivityIcon(type) {
    switch (type) {
      case 'post': return '<i class="icon-post">📝</i>';
      case 'comment': return '<i class="icon-comment">💬</i>';
      case 'project': return '<i class="icon-project">📊</i>';
      default: return '<i class="icon-default">📍</i>';
    }
  }

  formatActivityType(type) {
    switch (type) {
      case 'post': return 'Created a post';
      case 'comment': return 'Commented on';
      case 'project': return 'Updated project';
      default: return type;
    }
  }

  truncate(str, length) {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
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

  switchTab(tabId) {
    // Hide all tab content
    const tabContents = this.container.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
      content.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = this.container.querySelector(tabId);
    if (selectedTab) {
      selectedTab.classList.add('active');
    }
    
    // Update tab navigation
    const tabs = this.container.querySelectorAll('.profile-nav-tabs li');
    tabs.forEach(tab => {
      tab.classList.remove('active');
      if (tab.querySelector('a').getAttribute('href') === tabId) {
        tab.classList.add('active');
      }
    });
  }

  saveProfileChanges() {
    const displayName = this.container.querySelector('#display-name').value;
    const email = this.container.querySelector('#email').value;
    const bio = this.container.querySelector('#bio').value;
    
    // In a real app, this would update the user profile via an API
    console.log('Profile updated:', { displayName, email, bio });
    alert('Profile updated successfully! (This is just a demo)');
  }

  savePreferences() {
    const theme = this.container.querySelector('#theme').value;
    const emailNotifications = this.container.querySelector('#email-notifications').checked;
    const forumDigest = this.container.querySelector('#forum-digest').value;
    
    // Update user preferences
    this.user.preferences = { theme, emailNotifications, forumDigest };
    
    // In a real app, this would update the preferences via an API
    console.log('Preferences updated:', this.user.preferences);
    alert('Preferences updated successfully! (This is just a demo)');
  }
}

// Export for use in other files
export default UserProfile;