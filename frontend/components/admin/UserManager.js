// User Manager component for admin interface
class UserManager {
  constructor(container) {
    this.container = container;
    this.users = [];
    this.currentPage = 1;
    this.usersPerPage = 10;
    this.totalPages = 1;
    this.filters = {
      status: 'all',
      search: '',
      sortBy: 'joined',
      sortDir: 'desc'
    };
    this.render();
  }

  async fetchUsers() {
    // In a real app, this would fetch from the API with pagination and filters
    // For demo, we'll use mock data
    
    // Generate some mock users
    const statuses = ['active', 'pending', 'suspended', 'inactive'];
    const mockUsers = [];
    
    for (let i = 1; i <= 45; i++) {
      const randomDays = Math.floor(Math.random() * 60);
      const joinDate = new Date();
      joinDate.setDate(joinDate.getDate() - randomDays);
      
      mockUsers.push({
        id: i,
        username: `user${i}`,
        email: `user${i}@example.com`,
        joined: joinDate,
        lastActive: i % 5 === 0 ? null : new Date(Date.now() - Math.random() * 10000000000),
        posts: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 120),
        reputation: Math.floor(Math.random() * 500),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        role: i === 1 ? 'admin' : i % 15 === 0 ? 'moderator' : 'user'
      });
    }
    
    // Apply filters
    let filteredUsers = [...mockUsers];
    
    if (this.filters.status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === this.filters.status);
    }
    
    if (this.filters.search) {
      const searchLower = this.filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(searchLower) || 
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    filteredUsers.sort((a, b) => {
      let valA = a[this.filters.sortBy];
      let valB = b[this.filters.sortBy];
      
      // Handle date comparison
      if (valA instanceof Date && valB instanceof Date) {
        return this.filters.sortDir === 'asc' ? valA - valB : valB - valA;
      }
      
      // Handle null values
      if (valA === null) return this.filters.sortDir === 'asc' ? -1 : 1;
      if (valB === null) return this.filters.sortDir === 'asc' ? 1 : -1;
      
      // Handle string comparison
      if (typeof valA === 'string' && typeof valB === 'string') {
        return this.filters.sortDir === 'asc' ? 
          valA.localeCompare(valB) : 
          valB.localeCompare(valA);
      }
      
      // Handle number comparison
      return this.filters.sortDir === 'asc' ? valA - valB : valB - valA;
    });
    
    // Calculate pagination
    this.totalPages = Math.ceil(filteredUsers.length / this.usersPerPage);
    
    // Paginate the results
    const startIndex = (this.currentPage - 1) * this.usersPerPage;
    const endIndex = startIndex + this.usersPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    return {
      users: paginatedUsers,
      totalUsers: filteredUsers.length,
      currentPage: this.currentPage,
      totalPages: this.totalPages
    };
  }

  async render() {
    // Show loading state
    this.container.innerHTML = '<div class="loading">Loading users...</div>';
    
    // Fetch users
    const data = await this.fetchUsers();
    this.users = data.users;
    
    // Render user manager
    this.container.innerHTML = `
      <div class="user-manager">
        <div class="manager-header">
          <h1>User Management</h1>
          <button class="add-user">Add New User</button>
        </div>
        
        <div class="filters-bar">
          <div class="search-box">
            <input type="text" placeholder="Search users..." value="${this.filters.search}" class="search-input">
            <button class="search-btn">Search</button>
            ${this.filters.search ? '<button class="clear-search">Clear</button>' : ''}
          </div>
          
          <div class="filter-options">
            <select class="status-filter">
              <option value="all" ${this.filters.status === 'all' ? 'selected' : ''}>All Statuses</option>
              <option value="active" ${this.filters.status === 'active' ? 'selected' : ''}>Active</option>
              <option value="pending" ${this.filters.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="suspended" ${this.filters.status === 'suspended' ? 'selected' : ''}>Suspended</option>
              <option value="inactive" ${this.filters.status === 'inactive' ? 'selected' : ''}>Inactive</option>
            </select>
            
            <div class="sort-options">
              <label>Sort by:</label>
              <select class="sort-by">
                <option value="username" ${this.filters.sortBy === 'username' ? 'selected' : ''}>Username</option>
                <option value="joined" ${this.filters.sortBy === 'joined' ? 'selected' : ''}>Join Date</option>
                <option value="lastActive" ${this.filters.sortBy === 'lastActive' ? 'selected' : ''}>Last Active</option>
                <option value="posts" ${this.filters.sortBy === 'posts' ? 'selected' : ''}>Posts</option>
                <option value="reputation" ${this.filters.sortBy === 'reputation' ? 'selected' : ''}>Reputation</option>
              </select>
              
              <button class="sort-dir ${this.filters.sortDir === 'asc' ? 'asc' : 'desc'}">
                ${this.filters.sortDir === 'asc' ? 'A→Z' : 'Z→A'}
              </button>
            </div>
          </div>
        </div>
        
        <div class="user-table-container">
          <table class="user-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Last Active</th>
                <th>Posts</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this.renderUserRows()}
            </tbody>
          </table>
        </div>
        
        <div class="pagination">
          ${this.renderPagination()}
        </div>
        
        <div class="bulk-actions">
          <select class="bulk-action-select">
            <option value="">Bulk Actions</option>
            <option value="activate">Activate Selected</option>
            <option value="suspend">Suspend Selected</option>
            <option value="delete">Delete Selected</option>
          </select>
          <button class="apply-bulk-action" disabled>Apply</button>
        </div>
      </div>
    `;
    
    // Add event listeners
    this.attachEventListeners();
  }

  renderUserRows() {
    if (!this.users || this.users.length === 0) {
      return `<tr><td colspan="8" class="no-results">No users found</td></tr>`;
    }

    return this.users.map(user => `
      <tr data-id="${user.id}">
        <td>
          <div class="user-info">
            <input type="checkbox" class="user-select" data-id="${user.id}">
            <span class="${user.role === 'admin' ? 'admin-user' : user.role === 'moderator' ? 'mod-user' : ''}">
              ${user.username}
            </span>
          </div>
        </td>
        <td>${user.email}</td>
        <td>${this.formatDate(user.joined)}</td>
        <td>${user.lastActive ? this.formatDate(user.lastActive) : 'Never'}</td>
        <td>${user.posts}</td>
        <td>
          <span class="user-role ${user.role}">${user.role}</span>
        </td>
        <td>
          <span class="status-badge ${user.status}">${user.status}</span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="edit-user" data-id="${user.id}">Edit</button>
            ${user.status === 'suspended' ?
              `<button class="activate-user" data-id="${user.id}">Activate</button>` :
              `<button class="suspend-user" data-id="${user.id}">Suspend</button>`
            }
            <div class="more-actions">
              <button class="more-btn">⋮</button>
              <div class="dropdown-menu">
                <a href="#" class="view-profile" data-id="${user.id}">View Profile</a>
                <a href="#" class="login-as" data-id="${user.id}">Login As</a>
                <a href="#" class="reset-password" data-id="${user.id}">Reset Password</a>
                <a href="#" class="delete-user danger" data-id="${user.id}">Delete User</a>
              </div>
            </div>
          </div>
        </td>
      </tr>
    `).join('');
  }

  renderPagination() {
    if (this.totalPages <= 1) {
      return '';
    }

    let paginationHtml = '';
    
    // Previous button
    paginationHtml += `
      <button class="page-btn prev ${this.currentPage === 1 ? 'disabled' : ''}">
        &laquo; Prev
      </button>
    `;
    
    // Page numbers
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      paginationHtml += `
        <button class="page-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
          ${i}
        </button>
      `;
    }
    
    // Next button
    paginationHtml += `
      <button class="page-btn next ${this.currentPage === this.totalPages ? 'disabled' : ''}">
        Next &raquo;
      </button>
    `;
    
    return paginationHtml;
  }

  attachEventListeners() {
    // Search functionality
    const searchInput = this.container.querySelector('.search-input');
    const searchBtn = this.container.querySelector('.search-btn');
    
    searchBtn.addEventListener('click', () => {
      this.filters.search = searchInput.value.trim();
      this.currentPage = 1;
      this.render();
    });
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.filters.search = searchInput.value.trim();
        this.currentPage = 1;
        this.render();
      }
    });
    
    // Clear search
    const clearSearchBtn = this.container.querySelector('.clear-search');
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        this.filters.search = '';
        this.currentPage = 1;
        this.render();
      });
    }
    
    // Status filter
    const statusFilter = this.container.querySelector('.status-filter');
    statusFilter.addEventListener('change', () => {
      this.filters.status = statusFilter.value;
      this.currentPage = 1;
      this.render();
    });
    
    // Sort options
    const sortBySelect = this.container.querySelector('.sort-by');
    sortBySelect.addEventListener('change', () => {
      this.filters.sortBy = sortBySelect.value;
      this.render();
    });
    
    const sortDirBtn = this.container.querySelector('.sort-dir');
    sortDirBtn.addEventListener('click', () => {
      this.filters.sortDir = this.filters.sortDir === 'asc' ? 'desc' : 'asc';
      this.render();
    });
    
    // Pagination
    const pageButtons = this.container.querySelectorAll('.page-btn[data-page]');
    pageButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.currentPage = parseInt(button.getAttribute('data-page'));
        this.render();
      });
    });
    
    const prevButton = this.container.querySelector('.page-btn.prev');
    if (prevButton && !prevButton.classList.contains('disabled')) {
      prevButton.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.render();
        }
      });
    }
    
    const nextButton = this.container.querySelector('.page-btn.next');
    if (nextButton && !nextButton.classList.contains('disabled')) {
      nextButton.addEventListener('click', () => {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
          this.render();
        }
      });
    }
    
    // User actions
    const editButtons = this.container.querySelectorAll('.edit-user');
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        const userId = button.getAttribute('data-id');
        this.editUser(userId);
      });
    });
    
    const suspendButtons = this.container.querySelectorAll('.suspend-user');
    suspendButtons.forEach(button => {
      button.addEventListener('click', () => {
        const userId = button.getAttribute('data-id');
        this.suspendUser(userId);
      });
    });
    
    const activateButtons = this.container.querySelectorAll('.activate-user');
    activateButtons.forEach(button => {
      button.addEventListener('click', () => {
        const userId = button.getAttribute('data-id');
        this.activateUser(userId);
      });
    });
    
    // More actions dropdown
    const moreButtons = this.container.querySelectorAll('.more-btn');
    moreButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Close all other dropdowns
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
          if (menu !== button.nextElementSibling) {
            menu.classList.remove('show');
          }
        });
        
        // Toggle this dropdown
        button.nextElementSibling.classList.toggle('show');
      });
    });
    
    // Close dropdowns when clicking elsewhere
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
      });
    });
    
    // Dropdown menu actions
    const deleteUserLinks = this.container.querySelectorAll('.delete-user');
    deleteUserLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const userId = link.getAttribute('data-id');
        this.deleteUser(userId);
      });
    });
    
    // Bulk selection
    const bulkActionSelect = this.container.querySelector('.bulk-action-select');
    const applyBulkActionBtn = this.container.querySelector('.apply-bulk-action');
    const userCheckboxes = this.container.querySelectorAll('.user-select');
    
    userCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const anyChecked = Array.from(userCheckboxes).some(cb => cb.checked);
        applyBulkActionBtn.disabled = !anyChecked;
      });
    });
    
    // Apply bulk action
    applyBulkActionBtn.addEventListener('click', () => {
      const action = bulkActionSelect.value;
      if (!action) {
        alert('Please select an action');
        return;
      }
      
      const selectedUserIds = Array.from(userCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.getAttribute('data-id'));
      
      if (selectedUserIds.length === 0) {
        alert('No users selected');
        return;
      }
      
      this.applyBulkAction(action, selectedUserIds);
    });
    
    // Add new user
    const addUserBtn = this.container.querySelector('.add-user');
    addUserBtn.addEventListener('click', () => {
      this.showAddUserForm();
    });
  }

  formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  }

  editUser(userId) {
    // Find the user to edit
    const user = this.users.find(u => u.id.toString() === userId.toString());
    if (!user) return;
    
    // In a real app, this would open a modal form with the user details
    console.log('Editing user:', user);
    alert(`This would open a form to edit ${user.username}`);
  }

  suspendUser(userId) {
    // Find the user to suspend
    const user = this.users.find(u => u.id.toString() === userId.toString());
    if (!user) return;
    
    // In a real app, this would call an API
    console.log('Suspending user:', user);
    
    // Update UI to show suspended state
    const userRow = this.container.querySelector(`tr[data-id="${userId}"]`);
    if (userRow) {
      const statusCell = userRow.cells[6];
      statusCell.innerHTML = '<span class="status-badge suspended">suspended</span>';
      
      const actionCell = userRow.cells[7];
      const suspendBtn = actionCell.querySelector('.suspend-user');
      suspendBtn.className = 'activate-user';
      suspendBtn.textContent = 'Activate';
      suspendBtn.setAttribute('data-id', userId);
      
      // Update the event listener
      suspendBtn.removeEventListener('click', this.suspendUser);
      suspendBtn.addEventListener('click', () => {
        this.activateUser(userId);
      });
    }
    
    alert(`User ${user.username} has been suspended`);
  }

  activateUser(userId) {
    // Find the user to activate
    const user = this.users.find(u => u.id.toString() === userId.toString());
    if (!user) return;
    
    // In a real app, this would call an API
    console.log('Activating user:', user);
    
    // Update UI to show active state
    const userRow = this.container.querySelector(`tr[data-id="${userId}"]`);
    if (userRow) {
      const statusCell = userRow.cells[6];
      statusCell.innerHTML = '<span class="status-badge active">active</span>';
      
      const actionCell = userRow.cells[7];
      const activateBtn = actionCell.querySelector('.activate-user');
      activateBtn.className = 'suspend-user';
      activateBtn.textContent = 'Suspend';
      activateBtn.setAttribute('data-id', userId);
      
      // Update the event listener
      activateBtn.removeEventListener('click', this.activateUser);
      activateBtn.addEventListener('click', () => {
        this.suspendUser(userId);
      });
    }
    
    alert(`User ${user.username} has been activated`);
  }

  deleteUser(userId) {
    // Find the user to delete
    const user = this.users.find(u => u.id.toString() === userId.toString());
    if (!user) return;
    
    // Confirmation dialog
    const confirmed = confirm(`Are you sure you want to delete user ${user.username}? This action cannot be undone.`);
    if (!confirmed) return;
    
    // In a real app, this would call an API
    console.log('Deleting user:', user);
    
    // Update UI to remove the user
    const userRow = this.container.querySelector(`tr[data-id="${userId}"]`);
    if (userRow) {
      userRow.style.backgroundColor = '#ffcccc';
      setTimeout(() => {
        userRow.style.opacity = '0';
        setTimeout(() => {
          userRow.remove();
        }, 300);
      }, 300);
    }
    
    alert(`User ${user.username} has been deleted`);
  }

  applyBulkAction(action, userIds) {
    // In a real app, this would call an API
    console.log(`Applying ${action} to users:`, userIds);
    
    // For demo purposes, we'll just show a confirmation
    alert(`${action} applied to ${userIds.length} users`);
    
    // Reset checkboxes and refresh the view
    this.render();
  }

  showAddUserForm() {
    // In a real app, this would show a modal form to add a new user
    console.log('Showing add user form');
    alert('This would open a form to add a new user');
  }
}

// Export for use in other files
export default UserManager;