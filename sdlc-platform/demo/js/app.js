// SDLC Platform Demo - Common JavaScript Functionality

// Global state management
const appState = {
  currentProject: 'E-commerce Platform',
  currentUser: 'Admin User',
  userRole: 'Admin',
  notifications: 3,
  integrations: {
    jiraCloud: {
      connected: true,
      syncItems: ['requirements', 'test-cases', 'deployments', 'risks', 'fmea'],
      lastSync: new Date().toISOString(),
      syncStatus: 'Successful'
    }
  }
};

// Common utility functions
function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toastContainer');
  
  if (!toastContainer) {
    // Create toast container if it doesn't exist
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
  }
  
  // Generate a unique ID for the toast
  const toastId = 'toast-' + Date.now();
  
  // Create toast HTML
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${type} border-0`;
  toast.id = toastId;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  
  // Add toast to container
  document.getElementById('toastContainer').appendChild(toast);
  
  // Initialize and show the toast
  const toastInstance = new bootstrap.Toast(toast);
  toastInstance.show();
  
  // Remove toast after it's hidden
  toast.addEventListener('hidden.bs.toast', function () {
    toast.remove();
  });
}

// Generic function to create and show a modal dialog
function showModal(options) {
  const { title, body, primaryAction, secondaryAction, size } = options;
  
  // Create modal container if it doesn't exist
  let modalContainer = document.getElementById('dynamicModalContainer');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'dynamicModalContainer';
    document.body.appendChild(modalContainer);
  }
  
  // Generate a unique ID for the modal
  const modalId = 'modal-' + Date.now();
  
  // Create modal HTML
  const modalHTML = `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-label" aria-hidden="true">
      <div class="modal-dialog ${size ? 'modal-' + size : ''}">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${modalId}-label">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            ${body}
          </div>
          <div class="modal-footer">
            ${secondaryAction ? `<button type="button" class="btn btn-secondary" data-action="secondary" data-bs-dismiss="modal">${secondaryAction.label}</button>` : ''}
            ${primaryAction ? `<button type="button" class="btn btn-primary" data-action="primary">${primaryAction.label}</button>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to container
  modalContainer.innerHTML = modalHTML;
  
  // Get modal element
  const modalElement = document.getElementById(modalId);
  
  // Initialize Bootstrap modal
  const modal = new bootstrap.Modal(modalElement);
  
  // Add event listeners for actions
  if (primaryAction && primaryAction.handler) {
    modalElement.querySelector('[data-action="primary"]').addEventListener('click', () => {
      primaryAction.handler();
      if (primaryAction.closeAfter !== false) {
        modal.hide();
      }
    });
  }
  
  if (secondaryAction && secondaryAction.handler) {
    modalElement.querySelector('[data-action="secondary"]').addEventListener('click', secondaryAction.handler);
  }
  
  // Clean up modal when hidden
  modalElement.addEventListener('hidden.bs.modal', function () {
    modalElement.remove();
  });
  
  // Show the modal
  modal.show();
  
  return modal;
}

// Generic confirmation dialog
function confirmAction(message, onConfirm, onCancel) {
  showModal({
    title: 'Confirmation',
    body: `<p>${message}</p>`,
    primaryAction: {
      label: 'Confirm',
      handler: onConfirm
    },
    secondaryAction: {
      label: 'Cancel',
      handler: onCancel || function() {}
    }
  });
}

// Generic form dialog
function showFormDialog(title, formHTML, onSubmit) {
  const formId = 'form-' + Date.now();
  const body = `<form id="${formId}">${formHTML}</form>`;
  
  showModal({
    title,
    body,
    primaryAction: {
      label: 'Submit',
      handler: () => {
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
          data[key] = value;
        }
        
        onSubmit(data);
      }
    },
    secondaryAction: {
      label: 'Cancel'
    }
  });
}

// Function to initialize all action buttons
function setupActionButtons() {
  // View buttons
  document.querySelectorAll('.btn-outline-primary, [data-action="view"]').forEach(button => {
    if (!button.hasAttribute('data-initialized')) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const itemId = this.closest('tr')?.querySelector('td:first-child')?.textContent || 'Unknown';
        const itemName = this.closest('tr')?.querySelector('td:nth-child(2)')?.textContent || 'item';
        
        showModal({
          title: `View Details: ${itemName}`,
          body: `<p>Viewing details for ${itemName} (ID: ${itemId})</p>
                 <div class="alert alert-info">
                   Detailed information for this item would appear here in a production environment.
                 </div>`,
          primaryAction: {
            label: 'Close'
          }
        });
      });
      button.setAttribute('data-initialized', 'true');
    }
  });
  
  // Edit buttons
  document.querySelectorAll('.btn-outline-secondary, [data-action="edit"]').forEach(button => {
    if (!button.hasAttribute('data-initialized')) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const row = this.closest('tr');
        const itemId = row?.querySelector('td:first-child')?.textContent || 'Unknown';
        const itemName = row?.querySelector('td:nth-child(2)')?.textContent || 'item';
        
        showFormDialog(
          `Edit ${itemName}`,
          `<div class="mb-3">
            <label class="form-label">ID</label>
            <input type="text" class="form-control" name="id" value="${itemId}" readonly>
          </div>
          <div class="mb-3">
            <label class="form-label">Name</label>
            <input type="text" class="form-control" name="name" value="${itemName}">
          </div>
          <div class="mb-3">
            <label class="form-label">Description</label>
            <textarea class="form-control" name="description" rows="3">Description for ${itemName}</textarea>
          </div>`,
          (data) => {
            showToast(`Successfully updated ${data.name}`);
          }
        );
      });
      button.setAttribute('data-initialized', 'true');
    }
  });
  
  // Add new item buttons
  document.querySelectorAll('.btn-primary:not([data-action])[class*="btn-sm"]').forEach(button => {
    if (!button.hasAttribute('data-initialized') && button.textContent.includes('Add') || button.textContent.includes('New')) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Determine what we're adding based on the button text
        let itemType = 'Item';
        if (button.textContent.includes('Project')) itemType = 'Project';
        else if (button.textContent.includes('Requirement')) itemType = 'Requirement';
        else if (button.textContent.includes('Test')) itemType = 'Test Case';
        else if (button.textContent.includes('Deploy')) itemType = 'Deployment';
        else if (button.textContent.includes('User')) itemType = 'User';
        
        showFormDialog(
          `Add New ${itemType}`,
          `<div class="mb-3">
            <label class="form-label">Name</label>
            <input type="text" class="form-control" name="name" placeholder="Enter name">
          </div>
          <div class="mb-3">
            <label class="form-label">Description</label>
            <textarea class="form-control" name="description" rows="3" placeholder="Enter description"></textarea>
          </div>`,
          (data) => {
            showToast(`Successfully added new ${itemType}: ${data.name || 'Unnamed'}`);
          }
        );
      });
      button.setAttribute('data-initialized', 'true');
    }
  });
  
  // Run buttons (for test cases)
  document.querySelectorAll('.btn-outline-success, [data-action="run"]').forEach(button => {
    if (!button.hasAttribute('data-initialized') && button.textContent.includes('Run')) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const itemId = this.closest('tr')?.querySelector('td:first-child')?.textContent || 'Unknown';
        const itemName = this.closest('tr')?.querySelector('td:nth-child(2)')?.textContent || 'test';
        
        showModal({
          title: `Run Test: ${itemName}`,
          body: `<p>Running test ${itemName} (ID: ${itemId})</p>
                 <div class="progress mb-3">
                   <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 100%"></div>
                 </div>
                 <div class="alert alert-info">
                   This is a simulation. In a real environment, the test would execute and show results here.
                 </div>`,
          primaryAction: {
            label: 'Close'
          }
        });
        
        setTimeout(() => {
          showToast(`Test ${itemId} completed successfully`, 'success');
        }, 2000);
      });
      button.setAttribute('data-initialized', 'true');
    }
  });
  
  // Configure buttons
  document.querySelectorAll('[data-action="configure"]').forEach(button => {
    if (!button.hasAttribute('data-initialized')) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const configType = this.getAttribute('data-config-type') || 'item';
        
        showModal({
          title: `Configure ${configType}`,
          body: `<p>Configuration options for ${configType}</p>
                 <div class="alert alert-info">
                   Configuration interface would appear here in a production environment.
                 </div>`,
          primaryAction: {
            label: 'Save Configuration',
            handler: () => {
              showToast(`${configType} configuration saved successfully`);
            }
          },
          secondaryAction: {
            label: 'Cancel'
          }
        });
      });
      button.setAttribute('data-initialized', 'true');
    }
  });
  
  // Delete/Cancel buttons
  document.querySelectorAll('.btn-outline-danger, [data-action="delete"], [data-action="cancel"]').forEach(button => {
    if (!button.hasAttribute('data-initialized')) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const itemId = this.closest('tr')?.querySelector('td:first-child')?.textContent || 'Unknown';
        const itemName = this.closest('tr')?.querySelector('td:nth-child(2)')?.textContent || 'item';
        const action = button.textContent.includes('Cancel') ? 'cancel' : 'delete';
        
        confirmAction(
          `Are you sure you want to ${action} ${itemName} (ID: ${itemId})?`,
          () => {
            showToast(`Successfully ${action}ed ${itemName}`, action === 'cancel' ? 'warning' : 'danger');
          }
        );
      });
      button.setAttribute('data-initialized', 'true');
    }
  });
  
  // Form submit buttons in settings
  document.querySelectorAll('form .btn-primary').forEach(button => {
    if (!button.hasAttribute('data-initialized')) {
      button.closest('form').addEventListener('submit', function(e) {
        e.preventDefault();
        showToast('Changes saved successfully');
      });
      button.setAttribute('data-initialized', 'true');
    }
  });
  
  // Tab buttons
  document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
    if (!tab.hasAttribute('data-initialized')) {
      tab.addEventListener('shown.bs.tab', function(e) {
        const targetId = e.target.getAttribute('data-bs-target');
        const tabName = e.target.textContent.trim();
        console.log(`Switched to tab: ${tabName}`);
      });
      tab.setAttribute('data-initialized', 'true');
    }
  });
}

// Function to show risk and FMEA details modal
function showRiskFmeaDetails(type, itemName) {
  const title = type === 'risk' ? 'Risk Details' : 'FMEA Analysis Details';
  const modalContent = `
    <div class="mb-3">
      <h6>${itemName}</h6>
      <p>The following ${type === 'risk' ? 'risk assessment' : 'FMEA analysis'} details are synchronized with Jira Cloud:</p>
    </div>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th scope="col">${type === 'risk' ? 'Risk ID' : 'FMEA ID'}</th>
          <th scope="col">Description</th>
          <th scope="col">${type === 'risk' ? 'Impact' : 'Failure Mode'}</th>
          <th scope="col">${type === 'risk' ? 'Likelihood' : 'Effect'}</th>
          <th scope="col">Severity</th>
          <th scope="col">Mitigation</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${type === 'risk' ? 'R-101' : 'F-201'}</td>
          <td>${type === 'risk' ? 'Security vulnerability in authentication' : 'Database connection failure'}</td>
          <td>${type === 'risk' ? 'High' : 'Application crash'}</td>
          <td>${type === 'risk' ? 'Medium' : 'Complete data loss'}</td>
          <td>High</td>
          <td>${type === 'risk' ? 'Implement OAuth 2.0 and MFA' : 'Implement connection pooling and retry logic'}</td>
        </tr>
        <tr>
          <td>${type === 'risk' ? 'R-102' : 'F-202'}</td>
          <td>${type === 'risk' ? 'Performance bottleneck in API' : 'Memory leak in UI component'}</td>
          <td>${type === 'risk' ? 'Medium' : 'Gradual performance degradation'}</td>
          <td>${type === 'risk' ? 'High' : 'Application becomes unresponsive'}</td>
          <td>Medium</td>
          <td>${type === 'risk' ? 'Implement caching and query optimization' : 'Fix memory management in component lifecycle'}</td>
        </tr>
      </tbody>
    </table>
    <div class="alert alert-info">
      <small>This data is synchronized with Jira Cloud. Last sync: ${new Date().toLocaleString()}</small>
    </div>
  `;

  showModal({
    title,
    body: modalContent,
    size: 'lg',
    primaryAction: {
      label: 'Close'
    }
  });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Setup navigation between pages
  const menuItems = document.querySelectorAll('.sidebar-menu li');
  for (const item of menuItems) {
    item.addEventListener('click', function() {
      const section = this.dataset.section;
      const currentSection = document.querySelector('.sidebar-menu li.active').dataset.section;
      
      if (section !== currentSection) {
        location.href = section === 'dashboard' ? 'index.html' : section + '.html';
      }
    });
  }
  
  // Initialize all action buttons
  setupActionButtons();
  
  // Add event listeners for risk and FMEA items
  document.querySelectorAll('.list-group-item:contains("Risk"), .list-group-item:contains("FMEA")').forEach(item => {
    if (!item.hasAttribute('data-risk-fmea-initialized')) {
      item.style.cursor = 'pointer';
      item.addEventListener('click', function() {
        const itemText = this.textContent.trim();
        const isRisk = itemText.includes('Risk');
        showRiskFmeaDetails(isRisk ? 'risk' : 'fmea', itemText.split('\n')[0].trim());
      });
      item.setAttribute('data-risk-fmea-initialized', 'true');
    }
  });
  
  // Add contains selector for jQuery-like functionality
  if (!HTMLElement.prototype.contains) {
    Element.prototype.contains = function(text) {
      return this.textContent.includes(text);
    };
  }
});

// Helper function to be called by pages with submenus
function setupSubMenus() {
  const subMenuLinks = document.querySelectorAll('.list-group-item-action, .nav-link');
  
  for (const link of subMenuLinks) {
    if (!link.hasAttribute('data-initialized')) {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          
          // Remove active class from all links in the same group
          const links = this.closest('.list-group, .nav')?.querySelectorAll('.list-group-item-action, .nav-link');
          links?.forEach(l => l.classList.remove('active'));
          
          // Add active class to clicked link
          this.classList.add('active');
          
          // Scroll to section for ID links
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            window.scrollTo({
              top: targetElement.offsetTop - 20,
              behavior: 'smooth'
            });
          }
        }
      });
      link.setAttribute('data-initialized', 'true');
    }
  }
}
