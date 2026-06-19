/* =============================================
   ADMIN PANEL — admin.js
   Handles: login, logout, add/edit/delete projects
   ============================================= */

/* ---------- SUPABASE SETUP ---------- */
/* ✏️ same values as in your main script.js */
const SUPABASE_URL = 'https://egyyblxmqbvaatgivscs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVneXlibHhtcWJ2YWF0Z2l2c2NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3Mzc1NDMsImV4cCI6MjA5NzMxMzU0M30.5WADyWuN3GO8kO6YKp0I88qH6Ki6t8uFnQEYP0sKEU0';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ---------- ELEMENT REFERENCES ---------- */
const loginScreen   = document.getElementById('loginScreen');
const adminPanel    = document.getElementById('adminPanel');
const loginBtn      = document.getElementById('loginBtn');
const logoutBtn     = document.getElementById('logoutBtn');
const loginStatus   = document.getElementById('loginStatus');

const projectForm   = document.getElementById('projectForm');
const formTitle     = document.getElementById('formTitle');
const formStatus    = document.getElementById('formStatus');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const adminProjectsList = document.getElementById('adminProjectsList');

/* ---------- AUTH: CHECK SESSION ON LOAD ---------- */
async function checkSession() {
  const { data } = await sb.auth.getSession();
  if (data.session) {
    showAdminPanel();
  } else {
    showLoginScreen();
  }
}

function showAdminPanel() {
  loginScreen.style.display = 'none';
  adminPanel.style.display = 'block';
  loadAdminProjects();
}

function showLoginScreen() {
  loginScreen.style.display = 'flex';
  adminPanel.style.display = 'none';
}

/* ---------- LOGIN ---------- */
loginBtn.addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  loginStatus.textContent = 'logging in...';
  loginStatus.className = 'status-msg';

  const { error } = await sb.auth.signInWithPassword({ email, password });

  if (error) {
    loginStatus.textContent = error.message;
    loginStatus.className = 'status-msg error';
    return;
  }

  loginStatus.textContent = '';
  showAdminPanel();
});

/* ---------- LOGOUT ---------- */
logoutBtn.addEventListener('click', async () => {
  await sb.auth.signOut();
  showLoginScreen();
});

/* ---------- LOAD PROJECTS INTO ADMIN LIST ---------- */
async function loadAdminProjects() {
  const { data: projects, error } = await sb
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    adminProjectsList.innerHTML = `<p class="status-msg error">${error.message}</p>`;
    return;
  }

  if (!projects.length) {
    adminProjectsList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">no projects yet — add your first one above.</p>`;
    return;
  }

  adminProjectsList.innerHTML = projects.map(p => `
    <div class="admin-project-row">
      <div class="admin-project-info">
        <strong>${p.title}</strong>
        <span>${p.type} · ${p.year}</span>
      </div>
      <div class="admin-project-actions">
        <button class="btn-admin secondary" onclick="editProject(${p.id})">edit</button>
        <button class="btn-admin danger" onclick="deleteProject(${p.id})">delete</button>
      </div>
    </div>
  `).join('');

  // cache projects locally so editProject() doesn't need another fetch
  window._cachedProjects = projects;
}

/* ---------- ADD / UPDATE PROJECT ---------- */
projectForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('projectId').value;
  const techTagsRaw = document.getElementById('techTags').value;
  const techTags = techTagsRaw
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);

  const payload = {
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    type: document.getElementById('type').value.trim(),
    year: document.getElementById('year').value.trim(),
    tech_tags: techTags,
    live_link: document.getElementById('liveLink').value.trim() || null,
    github_link: document.getElementById('githubLink').value.trim() || null,
  };

  formStatus.textContent = 'saving...';
  formStatus.className = 'status-msg';

  let error;

  if (id) {
    // editing existing project
    const res = await sb.from('projects').update(payload).eq('id', id);
    error = res.error;
  } else {
    // adding new project
    const res = await sb.from('projects').insert(payload);
    error = res.error;
  }

  if (error) {
    formStatus.textContent = error.message;
    formStatus.className = 'status-msg error';
    return;
  }

  formStatus.textContent = id ? 'project updated ✓' : 'project added ✓';
  formStatus.className = 'status-msg success';
  resetForm();
  loadAdminProjects();
});

/* ---------- EDIT (prefill form) ---------- */
function editProject(id) {
  const project = window._cachedProjects.find(p => p.id === id);
  if (!project) return;

  document.getElementById('projectId').value = project.id;
  document.getElementById('title').value = project.title;
  document.getElementById('description').value = project.description;
  document.getElementById('type').value = project.type;
  document.getElementById('year').value = project.year;
  document.getElementById('techTags').value = (project.tech_tags || []).join(', ');
  document.getElementById('liveLink').value = project.live_link || '';
  document.getElementById('githubLink').value = project.github_link || '';

  formTitle.textContent = '✦ editing project';
  cancelEditBtn.style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- CANCEL EDIT ---------- */
cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
  projectForm.reset();
  document.getElementById('projectId').value = '';
  formTitle.textContent = '✦ add a new project';
  cancelEditBtn.style.display = 'none';
}

/* ---------- DELETE ---------- */
async function deleteProject(id) {
  const confirmed = confirm('Delete this project? This can\'t be undone.');
  if (!confirmed) return;

  const { error } = await sb.from('projects').delete().eq('id', id);

  if (error) {
    alert('Error deleting: ' + error.message);
    return;
  }

  loadAdminProjects();
}

/* ---------- INIT ---------- */
checkSession();