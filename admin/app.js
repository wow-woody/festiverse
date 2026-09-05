const supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

const loginView = document.getElementById('login-view');
const appView = document.getElementById('app-view');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const festivalList = document.getElementById('festival-list');
const newFestivalBtn = document.getElementById('new-festival-btn');
const festivalDialog = document.getElementById('festival-dialog');
const festivalForm = document.getElementById('festival-form');
const festivalCancelBtn = document.getElementById('festival-cancel-btn');

const performanceList = document.getElementById('performance-list');
const performancePanelTitle = document.getElementById('performance-panel-title');
const performanceHint = document.getElementById('performance-hint');
const newPerformanceBtn = document.getElementById('new-performance-btn');
const performanceDialog = document.getElementById('performance-dialog');
const performanceForm = document.getElementById('performance-form');
const performanceCancelBtn = document.getElementById('performance-cancel-btn');

let selectedFestival = null;

function showApp(isLoggedIn) {
  loginView.classList.toggle('hidden', isLoggedIn);
  appView.classList.toggle('hidden', !isLoggedIn);
}

supabaseClient.auth.onAuthStateChange((_event, session) => {
  showApp(Boolean(session));
  if (session) loadFestivals();
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) loginError.textContent = error.message;
});

logoutBtn.addEventListener('click', () => supabaseClient.auth.signOut());

async function loadFestivals() {
  const { data, error } = await supabaseClient
    .from('festivals')
    .select('*')
    .order('start_date', { ascending: true });

  if (error) {
    alert('축제 목록을 불러오지 못했습니다: ' + error.message);
    return;
  }
  renderFestivals(data ?? []);
}

function renderFestivals(festivals) {
  festivalList.innerHTML = '';
  for (const festival of festivals) {
    const li = document.createElement('li');
    li.className = 'list-item' + (selectedFestival?.id === festival.id ? ' selected' : '');
    li.innerHTML = `
      <div>
        <div class="item-title">${festival.name}</div>
        <div class="item-meta">${festival.start_date} ~ ${festival.end_date}${festival.location ? ' · ' + festival.location : ''}</div>
      </div>
      <div class="item-actions">
        <button type="button" data-action="edit" class="ghost-btn">수정</button>
        <button type="button" data-action="delete" class="ghost-btn">삭제</button>
      </div>
    `;
    li.addEventListener('click', () => selectFestival(festival));
    li.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
      e.stopPropagation();
      openFestivalDialog(festival);
    });
    li.querySelector('[data-action="delete"]').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm(`"${festival.name}" 축제와 그 안의 모든 공연 일정을 삭제할까요?`)) return;
      const { error } = await supabaseClient.from('festivals').delete().eq('id', festival.id);
      if (error) {
        alert('삭제 실패: ' + error.message);
        return;
      }
      if (selectedFestival?.id === festival.id) {
        selectedFestival = null;
        renderPerformances([]);
        performancePanelTitle.textContent = '공연 일정';
        performanceHint.classList.remove('hidden');
        newPerformanceBtn.disabled = true;
      }
      loadFestivals();
    });
    festivalList.appendChild(li);
  }
}

function selectFestival(festival) {
  selectedFestival = festival;
  performancePanelTitle.textContent = `${festival.name} 일정`;
  performanceHint.classList.add('hidden');
  newPerformanceBtn.disabled = false;
  loadFestivals();
  loadPerformances(festival.id);
}

function openFestivalDialog(festival) {
  document.getElementById('festival-form-title').textContent = festival ? '축제 수정' : '새 축제';
  document.getElementById('festival-id').value = festival?.id ?? '';
  document.getElementById('festival-name').value = festival?.name ?? '';
  document.getElementById('festival-location').value = festival?.location ?? '';
  document.getElementById('festival-start').value = festival?.start_date ?? '';
  document.getElementById('festival-end').value = festival?.end_date ?? '';
  document.getElementById('festival-cover').value = festival?.cover_image_url ?? '';
  festivalDialog.showModal();
}

newFestivalBtn.addEventListener('click', () => openFestivalDialog(null));
festivalCancelBtn.addEventListener('click', () => festivalDialog.close());

festivalForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('festival-id').value;
  const payload = {
    name: document.getElementById('festival-name').value,
    location: document.getElementById('festival-location').value || null,
    start_date: document.getElementById('festival-start').value,
    end_date: document.getElementById('festival-end').value,
    cover_image_url: document.getElementById('festival-cover').value || null,
  };

  const { error } = id
    ? await supabaseClient.from('festivals').update(payload).eq('id', id)
    : await supabaseClient.from('festivals').insert(payload);

  if (error) {
    alert('저장 실패: ' + error.message);
    return;
  }
  festivalDialog.close();
  loadFestivals();
});

async function loadPerformances(festivalId) {
  const { data, error } = await supabaseClient
    .from('performances')
    .select('*')
    .eq('festival_id', festivalId)
    .order('start_time', { ascending: true });

  if (error) {
    alert('공연 목록을 불러오지 못했습니다: ' + error.message);
    return;
  }
  renderPerformances(data ?? []);
}

function renderPerformances(performances) {
  performanceList.innerHTML = '';
  for (const performance of performances) {
    const li = document.createElement('li');
    li.className = 'list-item';
    const start = new Date(performance.start_time);
    li.innerHTML = `
      <div>
        <div class="item-title">${performance.artist_name}${performance.headliner ? ' ⭐' : ''}</div>
        <div class="item-meta">${start.toLocaleString()}${performance.stage ? ' · ' + performance.stage : ''}${performance.genre ? ' · ' + performance.genre : ''}</div>
      </div>
      <div class="item-actions">
        <button type="button" data-action="edit" class="ghost-btn">수정</button>
        <button type="button" data-action="delete" class="ghost-btn">삭제</button>
      </div>
    `;
    li.querySelector('[data-action="edit"]').addEventListener('click', () => openPerformanceDialog(performance));
    li.querySelector('[data-action="delete"]').addEventListener('click', async () => {
      if (!confirm(`"${performance.artist_name}" 공연을 삭제할까요?`)) return;
      const { error } = await supabaseClient.from('performances').delete().eq('id', performance.id);
      if (error) {
        alert('삭제 실패: ' + error.message);
        return;
      }
      loadPerformances(selectedFestival.id);
    });
    performanceList.appendChild(li);
  }
}

function toLocalInputValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function openPerformanceDialog(performance) {
  document.getElementById('performance-form-title').textContent = performance ? '공연 수정' : '새 공연';
  document.getElementById('performance-id').value = performance?.id ?? '';
  document.getElementById('performance-artist').value = performance?.artist_name ?? '';
  document.getElementById('performance-genre').value = performance?.genre ?? '';
  document.getElementById('performance-stage').value = performance?.stage ?? '';
  document.getElementById('performance-start').value = toLocalInputValue(performance?.start_time);
  document.getElementById('performance-end').value = toLocalInputValue(performance?.end_time);
  document.getElementById('performance-headliner').checked = Boolean(performance?.headliner);
  performanceDialog.showModal();
}

newPerformanceBtn.addEventListener('click', () => openPerformanceDialog(null));
performanceCancelBtn.addEventListener('click', () => performanceDialog.close());

performanceForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!selectedFestival) return;

  const id = document.getElementById('performance-id').value;
  const startValue = document.getElementById('performance-start').value;
  const endValue = document.getElementById('performance-end').value;
  const payload = {
    festival_id: selectedFestival.id,
    artist_name: document.getElementById('performance-artist').value,
    genre: document.getElementById('performance-genre').value || null,
    stage: document.getElementById('performance-stage').value || null,
    start_time: new Date(startValue).toISOString(),
    end_time: endValue ? new Date(endValue).toISOString() : null,
    headliner: document.getElementById('performance-headliner').checked,
  };

  const { error } = id
    ? await supabaseClient.from('performances').update(payload).eq('id', id)
    : await supabaseClient.from('performances').insert(payload);

  if (error) {
    alert('저장 실패: ' + error.message);
    return;
  }
  performanceDialog.close();
  loadPerformances(selectedFestival.id);
});
