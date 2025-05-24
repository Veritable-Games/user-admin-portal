// Admin Dashboard component
class AdminDashboard {
  constructor(container) {
    this.container = container;
    this.render();
  }

  async fetchStats() {
    // In a real app, this would fetch from the API
    // For demo, we'll use mock data
    return {
      users: 1248,
      newUsers24h: 42,
      posts: 3576,
      newPosts24h: 87,
      comments: 15823,
      newComments24h: 324,
      flaggedContent: 12,
      pendingApprovals: 5
    };
  }

  async render() {
    // Show loading state
    this.container.innerHTML = '<div class="loading">Loading admin dashboard...</div>';
    
    // Fetch stats
    const stats = await this.fetchStats();
    
    // Render dashboard
    this.container.innerHTML = `
      <div class="admin-dashboard">
        <div class="admin-header">
          <h1>Admin Dashboard</h1>
          <div class="admin-actions">
            <button class="refresh-data">Refresh Data</button>
            <button class="export-data">Export Reports</button>
          </div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Users</h3>
            <div class="stat-value">${stats.users}</div>
            <div class="stat-change ${stats.newUsers24h > 0 ? 'positive' : 'negative'}">+${stats.newUsers24h} in last 24h</div>
          </div>
          
          <div class="stat-card">
            <h3>Posts</h3>
            <div class="stat-value">${stats.posts}</div>
            <div class="stat-change ${stats.newPosts24h > 0 ? 'positive' : 'negative'}">+${stats.newPosts24h} in last 24h</div>
          </div>
          
          <div class="stat-card">
            <h3>Comments</h3>
            <div class="stat-value">${stats.comments}</div>
            <div class="stat-change ${stats.newComments24h > 0 ? 'positive' : 'negative'}">+${stats.newComments24h} in last 24h</div>
          </div>
          
          <div class="stat-card alert">
            <h3>Flagged Content</h3>
            <div class="stat-value">${stats.flaggedContent}</div>
            <button class="view-details">Review</button>
          </div>
        </div>
        
        <div class="admin-sections">
          <div class="admin-section">
            <div class="section-header">
              <h2>Recent Users</h2>
              <button class="view-all">View All</button>
            </div>
            <div class="section-content">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Joined</th>
                    <th>Email</th>
                    <th>Posts</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>user123</td>
                    <td>Today, 10:45 AM</td>
                    <td>user123@example.com</td>
                    <td>0</td>
                    <td><span class="status active">Active</span></td>
                    <td>
                      <button class="action-btn edit">Edit</button>
                      <button class="action-btn suspend">Suspend</button>
                    </td>
                  </tr>
                  <tr>
                    <td>creativepro</td>
                    <td>Yesterday</td>
                    <td>creative@example.com</td>
                    <td>3</td>
                    <td><span class="status active">Active</span></td>
                    <td>
                      <button class="action-btn edit">Edit</button>
                      <button class="action-btn suspend">Suspend</button>
                    </td>
                  </tr>
                  <tr>
                    <td>devmaster</td>
                    <td>2 days ago</td>
                    <td>dev@example.com</td>
                    <td>5</td>
                    <td><span class="status pending">Pending Email</span></td>
                    <td>
                      <button class="action-btn edit">Edit</button>
                      <button class="action-btn verify">Verify</button>
                    </td>
                  </tr>
                  <tr>
                    <td>spamuser</td>
                    <td>3 days ago</td>
                    <td>spam@example.com</td>
                    <td>42</td>
                    <td><span class="status suspended">Suspended</span></td>
                    <td>
                      <button class="action-btn edit">Edit</button>
                      <button class="action-btn reinstate">Reinstate</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="admin-section">
            <div class="section-header">
              <h2>Pending Content Approvals</h2>
              <button class="approve-all">Approve All</button>
            </div>
            <div class="section-content">
              <div class="approval-list">
                <div class="approval-item">
                  <div class="approval-header">
                    <span class="approval-type">Post</span>
                    <span class="approval-date">Today, 11:23 AM</span>
                  </div>
                  <h3 class="approval-title">Getting Started with 3D Visualization</h3>
                  <p class="approval-excerpt">This tutorial will help beginners understand how to work with three.js and WebGL...</p>
                  <div class="approval-actions">
                    <button class="view-content">View Content</button>
                    <button class="approve">Approve</button>
                    <button class="reject">Reject</button>
                  </div>
                </div>
                
                <div class="approval-item">
                  <div class="approval-header">
                    <span class="approval-type">Comment</span>
                    <span class="approval-date">Today, 09:45 AM</span>
                  </div>
                  <h3 class="approval-title">Re: Editor Design Feedback</h3>
                  <p class="approval-excerpt">I think we should consider adding syntax highlighting to the markdown editor...</p>
                  <div class="approval-actions">
                    <button class="view-content">View Content</button>
                    <button class="approve">Approve</button>
                    <button class="reject">Reject</button>
                  </div>
                </div>
                
                <div class="approval-item">
                  <div class="approval-header">
                    <span class="approval-type">User Profile</span>
                    <span class="approval-date">Yesterday, 22:15 PM</span>
                  </div>
                  <h3 class="approval-title">Username: designguru</h3>
                  <p class="approval-excerpt">This profile needs review due to potentially inappropriate profile picture.</p>
                  <div class="approval-actions">
                    <button class="view-content">View Profile</button>
                    <button class="approve">Approve</button>
                    <button class="reject">Reject</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="admin-sections">
          <div class="admin-section">
            <div class="section-header">
              <h2>System Status</h2>
              <span class="status-indicator online">All Systems Operational</span>
            </div>
            <div class="section-content">
              <div class="system-metrics">
                <div class="metric">
                  <h4>API Response Time</h4>
                  <div class="metric-value">245ms</div>
                  <div class="metric-chart">
                    <div class="chart-bar" style="width: 65%;"></div>
                  </div>
                </div>
                
                <div class="metric">
                  <h4>Database Load</h4>
                  <div class="metric-value">32%</div>
                  <div class="metric-chart">
                    <div class="chart-bar" style="width: 32%;"></div>
                  </div>
                </div>
                
                <div class="metric">
                  <h4>Storage Usage</h4>
                  <div class="metric-value">58%</div>
                  <div class="metric-chart">
                    <div class="chart-bar" style="width: 58%;"></div>
                  </div>
                </div>
                
                <div class="metric">
                  <h4>Memory Usage</h4>
                  <div class="metric-value">74%</div>
                  <div class="metric-chart">
                    <div class="chart-bar warning" style="width: 74%;"></div>
                  </div>
                </div>
              </div>
              
              <div class="system-logs">
                <h4>Recent System Logs</h4>
                <div class="log-entries">
                  <div class="log-entry info">
                    <span class="log-time">12:45:32</span>
                    <span class="log-message">Automatic backup completed successfully</span>
                  </div>
                  <div class="log-entry warning">
                    <span class="log-time">11:32:15</span>
                    <span class="log-message">High memory usage detected (74%)</span>
                  </div>
                  <div class="log-entry info">
                    <span class="log-time">10:15:42</span>
                    <span class="log-message">User session cleanup task executed</span>
                  </div>
                  <div class="log-entry error">
                    <span class="log-time">08:23:11</span>
                    <span class="log-message">Failed login attempt from IP 192.168.1.105</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    this.container.querySelector('.refresh-data').addEventListener('click', this.refreshData.bind(this));
    this.container.querySelector('.export-data').addEventListener('click', this.exportData.bind(this));
    
    // View details for flagged content
    this.container.querySelector('.view-details').addEventListener('click', this.viewFlaggedContent.bind(this));
    
    // Approval buttons
    const approveButtons = this.container.querySelectorAll('.approve');
    approveButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const approvalItem = e.target.closest('.approval-item');
        approvalItem.style.opacity = '0.5';
        approvalItem.style.pointerEvents = 'none';
        
        // In a real app, this would send an API request
        console.log('Approved item:', approvalItem.querySelector('.approval-title').textContent);
        setTimeout(() => {
          approvalItem.remove();
          
          // Update pending approvals count
          const pendingCount = this.container.querySelectorAll('.approval-item').length;
          const statCard = this.container.querySelector('.stat-card.alert .stat-value');
          if (statCard) {
            statCard.textContent = pendingCount;
          }
        }, 500);
      });
    });
    
    // Reject buttons
    const rejectButtons = this.container.querySelectorAll('.reject');
    rejectButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const approvalItem = e.target.closest('.approval-item');
        
        // Show reject reason modal (simplified for demo)
        const reason = prompt('Enter rejection reason:');
        if (reason) {
          approvalItem.style.opacity = '0.5';
          approvalItem.style.pointerEvents = 'none';
          
          // In a real app, this would send an API request with the reason
          console.log('Rejected item:', approvalItem.querySelector('.approval-title').textContent, 'Reason:', reason);
          setTimeout(() => {
            approvalItem.remove();
            
            // Update pending approvals count
            const pendingCount = this.container.querySelectorAll('.approval-item').length;
            const statCard = this.container.querySelector('.stat-card.alert .stat-value');
            if (statCard) {
              statCard.textContent = pendingCount;
            }
          }, 500);
        }
      });
    });
    
    // User management buttons
    const actionButtons = this.container.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const action = e.target.classList.contains('edit') ? 'edit' :
                       e.target.classList.contains('suspend') ? 'suspend' :
                       e.target.classList.contains('verify') ? 'verify' : 'reinstate';
        
        const row = e.target.closest('tr');
        const username = row.cells[0].textContent;
        
        // In a real app, this would perform the action via an API
        console.log(`${action} user:`, username);
        
        if (action === 'suspend') {
          row.cells[4].innerHTML = '<span class="status suspended">Suspended</span>';
          e.target.textContent = 'Reinstate';
          e.target.classList.remove('suspend');
          e.target.classList.add('reinstate');
        } else if (action === 'reinstate') {
          row.cells[4].innerHTML = '<span class="status active">Active</span>';
          e.target.textContent = 'Suspend';
          e.target.classList.remove('reinstate');
          e.target.classList.add('suspend');
        } else if (action === 'verify') {
          row.cells[4].innerHTML = '<span class="status active">Active</span>';
          e.target.textContent = 'Suspend';
          e.target.classList.remove('verify');
          e.target.classList.add('suspend');
        }
      });
    });
  }

  refreshData() {
    // Re-render the dashboard with fresh data
    this.render();
    console.log('Refreshing dashboard data...');
  }

  exportData() {
    // In a real app, this would generate and download reports
    console.log('Exporting dashboard data...');
    alert('Reports would be generated and downloaded here.');
  }

  viewFlaggedContent() {
    // In a real app, this would show a modal or navigate to flagged content page
    console.log('Viewing flagged content...');
    alert('This would open the flagged content review page.');
  }
}

// Export for use in other files
export default AdminDashboard;