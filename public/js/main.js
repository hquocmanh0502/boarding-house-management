// Sidebar toggle
document.getElementById('sidebarToggle')?.addEventListener('click', () => {
  document.getElementById('sidebar')?.classList.toggle('open');
});

// Auto-dismiss alerts after 4s
setTimeout(() => {
  document.querySelectorAll('.alert').forEach(el => {
    const bsAlert = bootstrap.Alert.getOrCreateInstance(el);
    bsAlert.close();
  });
}, 4000);

// Active nav item
const currentPath = window.location.pathname;
document.querySelectorAll('.nav-item').forEach(item => {
  if (item.getAttribute('href') && currentPath.startsWith(item.getAttribute('href'))) {
    item.classList.add('active');
  }
});
