/* ── SECTION NAVIGATION ── */
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const sec = document.getElementById(id);
  if (sec) sec.classList.add('active');
  const nav = document.querySelector(`[data-section="${id}"]`);
  if (nav) nav.classList.add('active');
  const crumbs = { dashboard:'⚡ Dashboard', linkedin:'💼 LinkedIn Optimizer', github:'🐙 GitHub Analyzer', jobs:'🎯 Job Hunter', tracker:'📊 Job Tracker', growth:'📣 Growth Engine', recruiter:'🧲 Recruiter Magnet', strategy:'🗺️ Strategy Hub' };
  document.getElementById('breadcrumb').textContent = crumbs[id] || id;
  window.scrollTo({ top:0, behavior:'smooth' });
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }

document.addEventListener('click', e => {
  const sb = document.getElementById('sidebar');
  const hb = document.getElementById('hamburger');
  if (window.innerWidth <= 768 && sb && !sb.contains(e.target) && hb && !hb.contains(e.target))
    sb.classList.remove('open');
});

/* ── CLOCK ── */
function updateClock() {
  const n = new Date();
  const el = document.getElementById('current-time');
  if (el) el.textContent = n.toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'}) + ' • ' + n.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
}
setInterval(updateClock, 1000); updateClock();

/* ── JOB TRACKER ── */
let jobs = JSON.parse(localStorage.getItem('vk-jobs') || 'null');
if (!jobs) {
  jobs = JOB_LISTINGS.map((j, i) => ({ ...j, id: Date.now() + i }));
  saveJobs();
}
function saveJobs() { localStorage.setItem('vk-jobs', JSON.stringify(jobs)); }

// Fetch live jobs from the agent API and merge into tracker + job hunter
async function fetchAndMergeAPIJobs() {
  try {
    const res = await fetch('/api/jobs/all');
    if (!res.ok) return;
    const apiJobs = await res.json();
    if (!Array.isArray(apiJobs) || apiJobs.length === 0) return;

    // Normalize API jobs into the same shape as JOB_LISTINGS
    const normalized = apiJobs.map(j => ({
      id:       j.id,                // string UUID from DB
      company:  j.company || 'Unknown',
      role:     j.title || 'Internship',
      type:     j.isInternship ? 'Remote Internship' : 'Remote',
      location: j.location || 'Remote',
      salary:   j.salary || 'Not specified',
      skills:   (j.description || '').split(/[,\n]/).slice(0,4).map(s => s.trim()).filter(s => s.length > 1 && s.length < 30),
      match:    j.matchScore || 0,
      link:     j.url,          // ← DIRECT job URL from scraper
      source:   j.source || '', // 'linkedin' / 'internshala'
      posted:   j.createdAt ? new Date(j.createdAt).toLocaleDateString('en-IN') : 'Recently',
      status:   j.status || 'Not Applied',
      urgent:   (j.matchScore || 0) >= 85,
      notes:    j.matchReasoning || '',
      recruiter: '',
      recruiterLinkedIn: '',
      fromAPI:  true
    }));

    // Merge into global JOB_LISTINGS for the Job Hunter view (deduplicate by link)
    const existingLinks = new Set(JOB_LISTINGS.map(j => j.link));
    normalized.forEach(j => {
      if (j.link && !existingLinks.has(j.link)) {
        JOB_LISTINGS.unshift(j);
        existingLinks.add(j.link);
      }
    });

    // Re-render job hunter with merged list
    filteredJobs = [...JOB_LISTINGS];
    renderJobCards();

    // Sync API jobs with local tracker jobs
    let trackerUpdated = false;
    normalized.forEach(j => {
      let trackerStatus = 'Not Applied';
      if (['Not Applied','Applied','Screening','Interview','Offer','Rejected'].includes(j.status)) {
        trackerStatus = j.status;
      }
      
      const isTrackerJob = j.match >= 70 || ['MATCHED', 'READY_TO_APPLY', 'Applied', 'Screening', 'Interview', 'Offer'].includes(j.status);
      
      if (isTrackerJob) {
        const existingIdx = jobs.findIndex(x => String(x.id) === String(j.id) || x.link === j.link || (x.company === j.company && x.role === j.role));
        if (existingIdx >= 0) {
          const existingJob = jobs[existingIdx];
          jobs[existingIdx] = {
            ...existingJob,
            id: j.id,
            link: j.link || existingJob.link,
            match: j.match || existingJob.match,
            notes: j.notes || existingJob.notes || j.notes
          };
        } else {
          jobs.push({
            ...j,
            status: trackerStatus
          });
          trackerUpdated = true;
        }
      }
    });

    if (trackerUpdated) {
      saveJobs();
      renderTracker();
    }

    // Update dashboard top jobs
    renderDashboard();

    // Update sidebar job count badge
    const badge = document.getElementById('sidebar-jobs-count');
    if (badge) badge.textContent = JOB_LISTINGS.length;

    console.log(`✅ Loaded ${normalized.length} real jobs from agent API`);
  } catch (e) {
    console.warn('Agent API not reachable — showing cached jobs only');
  }
}

function mClass(m) { return m >= 80 ? 'hi' : m >= 60 ? 'me' : 'lo'; }
function mbClass(m) { return m >= 80 ? 'mb-h' : m >= 60 ? 'mb-m' : 'mb-l'; }

function renderTracker() {
  const tbody = document.getElementById('tracker-body');
  if (!tbody) return;
  const statuses = ['Not Applied','Applied','Screening','Interview','Offer','Rejected'];
  const sorted = [...jobs].sort((a,b) => b.match - a.match);

  tbody.innerHTML = sorted.map((j,i) => {
    // Use j.link for apply button — direct URL from scraper or user-entered
    const applyUrl = j.link || '';
    const sourceTag = j.source ? `<span style="font-size:9px;color:var(--c);margin-left:4px">via ${j.source}</span>` : '';
    const idAttr = typeof j.id === 'string' ? `'${j.id}'` : j.id; // handle UUID vs numeric id
    return `
    <tr class="${mClass(j.match)}">
      <td>${i+1}</td>
      <td>
        <div style="font-weight:600;color:var(--t1)">${j.company}</div>
        ${j.urgent ? '<span class="badge br" style="font-size:9px">🔥 Urgent</span>' : ''}
        ${sourceTag}
      </td>
      <td>${j.role}</td>
      <td><span class="badge bv" style="font-size:9px">${j.type}</span></td>
      <td>${j.location}</td>
      <td style="color:var(--g);font-weight:600">${j.salary}</td>
      <td><div style="display:flex;flex-wrap:wrap;gap:3px">${(Array.isArray(j.skills)?j.skills:[j.skills||'']).slice(0,3).map(s=>`<span class="tech-tag">${s}</span>`).join('')}</div></td>
      <td><span class="mb ${mbClass(j.match)}">${j.match}%</span></td>
      <td>
        <select class="st-sel" onchange="updateStatus(${idAttr}, this.value)">
          ${statuses.map(s=>`<option${s===j.status?' selected':''}>${s}</option>`).join('')}
        </select>
      </td>
      <td style="color:var(--t3)">${j.posted||'-'}</td>
      <td style="max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${j.notes||''}">${j.notes||'-'}</td>
      <td>
        <div style="display:flex;gap:4px">
          ${applyUrl
            ? `<a href="${applyUrl}" target="_blank" class="btn btn-sm btn-g" title="${applyUrl}">Apply ↗</a>`
            : '<span style="font-size:10px;color:var(--t3)">No link</span>'}
          <button class="btn btn-sm" style="color:var(--r)" onclick="deleteJob(${idAttr})">✕</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  renderSummary();
  updateCounters();
}

function renderSummary() {
  const el = document.getElementById('tracker-summary');
  if (!el) return;
  const total=jobs.length, applied=jobs.filter(j=>j.status!=='Not Applied').length,
        hi=jobs.filter(j=>j.match>=80).length, iv=jobs.filter(j=>j.status==='Interview').length,
        of=jobs.filter(j=>j.status==='Offer').length;
  const colors=['var(--vl)','var(--c)','var(--g)','var(--a)','var(--vl)'];
  const labels=[['Total',total],['Applied',applied],['High Match',hi],['Interviews',iv],['Offers',of]];
  el.innerHTML = labels.map(([l,v],i)=>`<div class="sum-card"><span class="sum-n" style="color:${colors[i]}">${v}</span><div class="sum-l">${l}</div></div>`).join('');
}

async function updateStatus(id, status) {
  // id can be numeric (legacy) or UUID string from API
  const j = jobs.find(x => String(x.id) === String(id));
  if (j) {
    j.status = status;
    saveJobs();
    renderTracker();          // ← FIX: re-render so status change shows immediately
    showToast(`📋 Status updated to: ${status}`);

    // If it's a backend DB job (UUID string), update status in DB
    if (typeof id === 'string' && id.includes('-')) {
      try {
        await fetch(`/api/jobs/${id}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
      } catch (e) {
        console.error('Failed to sync status to backend:', e);
      }
    }
  }
}

async function deleteJob(id) {
  if (!confirm('Remove from tracker?')) return;
  jobs = jobs.filter(j=>j.id!==id); 
  saveJobs(); 
  renderTracker(); 
  showToast('Job removed');

  // If it's a backend DB job, reject it in the DB so it doesn't get re-merged
  if (typeof id === 'string' && id.includes('-')) {
    try {
      await fetch(`/api/jobs/${id}/reject`, { method: 'POST' });
    } catch (e) {
      console.error('Failed to reject job in backend:', e);
    }
  }
}

function updateCounters() {
  const applied = jobs.filter(j=>j.status!=='Not Applied').length;
  const el = document.getElementById('stat-applied'); if(el) el.textContent = applied;
  const sc = document.getElementById('sidebar-apps'); if(sc) sc.textContent = jobs.length;
  const tc = document.getElementById('tracker-count'); if(tc) tc.textContent = jobs.length;
}

/* ── MODAL ── */
function openModal() { document.getElementById('modal-overlay').classList.add('open'); }
function closeModal(e) { if(!e||e.target===e.currentTarget) document.getElementById('modal-overlay').classList.remove('open'); }

function saveJob() {
  const company = document.getElementById('jc').value.trim();
  const role = document.getElementById('jr').value.trim();
  if (!company||!role) { showToast('Company & Role required','error'); return; }
  jobs.push({ id:Date.now(), company, role,
    type: document.getElementById('jt').value,
    location: document.getElementById('jl').value||'Remote',
    salary: document.getElementById('js').value||'Not specified',
    match: parseInt(document.getElementById('jm').value)||50,
    skills: document.getElementById('jsk').value.split(',').map(s=>s.trim()).filter(Boolean),
    link: document.getElementById('jlnk').value,
    recruiter: document.getElementById('jrec').value,
    followUp: document.getElementById('jfu').value,
    notes: document.getElementById('jn').value,
    status: 'Not Applied', posted:'Just now', urgent:false, recruiterLinkedIn:''
  });
  saveJobs(); renderTracker(); closeModal(); showToast('✅ Job added!');
  ['jc','jr','jl','js','jm','jsk','jlnk','jrec','jn'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
}

/* ── EXPORT ── */
function exportXLSX() {
  if (!window.XLSX) { showToast('XLSX library not loaded','error'); return; }
  const data = jobs.map((j,i) => ({
    '#':i+1,'Company':j.company,'Role':j.role,'Type':j.type,
    'Location':j.location,'Salary':j.salary,
    'Skills':(Array.isArray(j.skills)?j.skills.join(', '):j.skills)||'',
    'Match%':j.match+'%','Link':j.link||'','Recruiter':j.recruiter||'',
    'Status':j.status,'Posted':j.posted||'','Follow-up':j.followUp||'','Notes':j.notes||''
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols']=[{wch:4},{wch:20},{wch:28},{wch:18},{wch:14},{wch:20},{wch:28},{wch:8},{wch:32},{wch:18},{wch:14},{wch:14},{wch:14},{wch:28}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Job Tracker');
  XLSX.writeFile(wb, 'Vaibhav_Kumar_Job_Tracker.xlsx');
  showToast('📥 Excel downloaded!');
}

function exportCSV() {
  const headers = ['#','Company','Role','Type','Location','Salary','Skills','Match%','Link','Recruiter','Status','Posted','Follow-up','Notes'];
  const rows = jobs.map((j,i) => [i+1,j.company,j.role,j.type,j.location,j.salary,(Array.isArray(j.skills)?j.skills.join(';'):j.skills)||'',j.match+'%',j.link||'',j.recruiter||'',j.status,j.posted||'',j.followUp||'',(j.notes||'').replace(/,/g,';')]);
  const csv = [headers,...rows].map(r=>r.map(v=>`"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='Vaibhav_Kumar_Jobs.csv';
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  showToast('📄 CSV downloaded!');
}

/* ── LINKEDIN OPTIMIZER ── */
function renderLinkedIn() {
  const hc = document.getElementById('headline-options');
  if (hc) hc.innerHTML = LINKEDIN_OPTIMIZER.optimizedHeadlines.map((h,i) => `
    <div class="hl-opt" onclick="copyText('${h.replace(/'/g,"\\'")}','Headline copied!')">
      <div class="cb-lbl">✅ Option ${i+1} — Score: ${92-i*5}/100</div>
      <div class="hl-opt-txt">${h}</div>
      <div class="hl-opt-meta"><span class="badge bg">ATS Optimized</span><span style="font-size:10px;color:var(--c)">Click to copy →</span></div>
    </div>`).join('');

  renderChecklist();

  const ap = document.getElementById('about-prev');
  if (ap) ap.textContent = LINKEDIN_OPTIMIZER.aboutSection;

  const kc = document.getElementById('kw-cloud');
  if (kc) { const cols=['kw-v','kw-c','kw-g']; kc.innerHTML = LINKEDIN_OPTIMIZER.keywords.map((k,i)=>`<span class="kw-tag ${cols[i%3]}" onclick="copyText('${k}','Keyword copied!')">${k}</span>`).join(''); }

  const sc = document.getElementById('skills-cloud');
  if (sc) sc.innerHTML = LINKEDIN_OPTIMIZER.skillsToAdd.map(s=>`
    <div class="sk-item"><span class="sk-name">${s.skill}</span><span class="sk-reason">${s.reason}</span><span class="p-${s.priority}">${s.priority}</span></div>`).join('');
}

function renderChecklist() {
  const data = JSON.parse(localStorage.getItem('vk-cl')||'null') || LINKEDIN_OPTIMIZER.checklist;
  const con = document.getElementById('profile-cl');
  if (!con) return;
  con.innerHTML = data.map((item,i) => `
    <div class="cl-item${item.done?' done':''}" onclick="toggleCL(${i})">
      <div class="cl-check">${item.done?'✓':''}</div>
      <span class="cl-text">${item.item}</span>
      <span class="imp-${item.impact}">${item.impact}</span>
    </div>`).join('');
  const done = data.filter(x=>x.done).length;
  const pe = document.getElementById('cl-progress'); if(pe) pe.textContent=`${done}/${data.length} Done`;
  const se = document.getElementById('stat-score'); if(se) se.textContent=Math.round(62+(done/data.length)*38);
}

function toggleCL(i) {
  const data = JSON.parse(localStorage.getItem('vk-cl')||'null') || LINKEDIN_OPTIMIZER.checklist;
  data[i].done = !data[i].done;
  localStorage.setItem('vk-cl', JSON.stringify(data)); renderChecklist();
}

function copyAbout() { copyText(LINKEDIN_OPTIMIZER.aboutSection,'About section copied!'); }

/* ── GITHUB ── */
const LANG_COLORS = { JavaScript:'#f1e05a',Python:'#3572A5',TypeScript:'#2b7489',HTML:'#e34c26',CSS:'#563d7c',Java:'#b07219','C++':'#f34b7d',Go:'#00ADD8',Rust:'#dea584',Shell:'#89e051' };

function getStrength(r) {
  let s = 20;
  if (r.description) s+=20; if (r.stargazers_count>0) s+=Math.min(r.stargazers_count*5,25);
  if (r.forks_count>0) s+=10; if (r.homepage) s+=15; if (r.has_pages) s+=5; if (r.topics?.length>0) s+=5;
  return Math.min(s, 95);
}

async function fetchGitHub() {
  const st = document.getElementById('repo-status');
  const rg = document.getElementById('repos-grid');
  if (st) st.textContent='Fetching...'; if (st) st.className='badge bc';
  if (rg) rg.innerHTML='<div class="loading-state"><div class="spinner"></div><p>Loading repositories...</p></div>';
  try {
    const [uR, rR] = await Promise.all([
      fetch('https://api.github.com/users/Vaibhav-dev30'),
      fetch('https://api.github.com/users/Vaibhav-dev30/repos?sort=updated&per_page=30')
    ]);
    if (!uR.ok) throw new Error('API limit');
    const user=await uR.json(); const repos=await rR.json();
    const el = id => document.getElementById(id);
    if(el('repo-count')) el('repo-count').textContent=user.public_repos||repos.length;
    if(el('follower-count')) el('follower-count').textContent=user.followers||0;
    if(el('star-count')) el('star-count').textContent=repos.reduce((s,r)=>s+(r.stargazers_count||0),0);
    if(st){st.textContent=`${repos.length} repos found`;st.className='badge bg';}
    renderRepos(repos);
  } catch(e) {
    if(st){st.textContent='Visit GitHub directly';st.className='badge by';}
    if(rg) rg.innerHTML=`<div class="loading-state"><p style="color:var(--a)">⚠️ Could not auto-fetch (GitHub API rate limit or network).</p><a href="https://github.com/Vaibhav-dev30" target="_blank" class="btn btn-c" style="margin-top:12px">View GitHub Profile ↗</a></div>`;
  }
  renderSuggestions();
}

function renderRepos(repos) {
  const grid = document.getElementById('repos-grid'); if(!grid) return;
  const sorted = repos.filter(r=>!r.fork).sort((a,b)=>getStrength(b)-getStrength(a)).slice(0,9);
  if (!sorted.length) { grid.innerHTML='<div class="loading-state"><p>No public repos yet — start building! 🚀</p></div>'; return; }
  grid.innerHTML = sorted.map((r,i) => {
    const str=getStrength(r); const lc=LANG_COLORS[r.language]||'#888';
    const desc=r.description||'No description — add one on GitHub for better discoverability!';
    return `<div class="repo-card">
      <div class="repo-rank">${i+1}</div>
      <div class="repo-name"><a href="${r.html_url}" target="_blank">${r.name} ↗</a></div>
      <div class="repo-desc">${desc}</div>
      <div class="repo-meta">
        ${r.language?`<span class="repo-lang"><span class="lang-dot" style="background:${lc}"></span>${r.language}</span>`:''}
        <span style="font-size:10px;color:var(--t3)">⭐ ${r.stargazers_count}</span>
        <span style="font-size:10px;color:var(--t3)">🍴 ${r.forks_count}</span>
        ${r.homepage?`<a href="${r.homepage}" target="_blank" style="font-size:10px;color:var(--g)">🌐 Demo</a>`:'<span style="font-size:10px;color:var(--r)">❌ No demo</span>'}
      </div>
      <div class="repo-str"><div class="str-bar"><div class="str-fill" style="width:${str}%"></div></div><span class="str-lbl">Strength: ${str}%</span></div>
    </div>`;
  }).join('');
}

function renderSuggestions() {
  const grid = document.getElementById('sug-grid'); if(!grid) return;
  grid.innerHTML = GITHUB_ANALYZER.projectSuggestions.map(p=>`
    <div class="sug-card">
      <div class="sug-pri">${p.priority}</div>
      <div class="sug-name">${p.name}</div>
      <div class="sug-desc">${p.description}</div>
      <div class="sug-why">💡 ${p.reason}</div>
      <div class="sug-time">⏱️ ${p.estimatedTime}</div>
      <div class="sug-tech">${p.tech.map(t=>`<span class="tech-tag">${t}</span>`).join('')}</div>
    </div>`).join('');
}

/* ── JOB HUNTER ── */
function renderBoards() {
  const el = document.getElementById('boards-grid'); if(!el) return;
  el.innerHTML = JOB_BOARDS.map(b=>`
    <a href="${b.url}" target="_blank" class="board-btn">
      <span class="board-emoji">${b.emoji}</span>
      <div><div class="board-name">${b.name}</div><div class="board-tag">${b.tag}</div></div>
    </a>`).join('');
}

let filteredJobs = [...JOB_LISTINGS];

function filterJobs() {
  const role=(document.getElementById('f-role')?.value||'').toLowerCase();
  const match=document.getElementById('f-match')?.value||'';
  const sort=document.getElementById('f-sort')?.value||'match';
  filteredJobs = JOB_LISTINGS.filter(j => {
    const rm=!role||j.role.toLowerCase().includes(role);
    const mm=match==='high'?j.match>=80:match==='medium'?(j.match>=60&&j.match<80):true;
    return rm&&mm;
  });
  filteredJobs.sort((a,b)=>sort==='match'?b.match-a.match:sort==='company'?a.company.localeCompare(b.company):0);
  renderJobCards();
}

function renderJobCards() {
  const grid = document.getElementById('jobs-grid'); if(!grid) return;

  if (filteredJobs.length === 0) {
    grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--t3)">No jobs found. Try different filters.</div>';
    return;
  }

  grid.innerHTML = filteredJobs.map(j => {
    const applyUrl = j.link || '';
    const sourceLabel = j.source ? `<span class="badge bc" style="font-size:9px">🤖 ${j.source}</span>` : '';
    const safeJ = JSON.stringify(j).replace(/'/g, "&#39;");
    return `
    <div class="job-card${j.urgent?' urgent':''}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
        <div>
          <div class="job-co">${j.company}</div>
          <div class="job-role">${j.role}</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">
            <span class="badge bv" style="font-size:9px">${j.type}</span>
            <span class="badge bc" style="font-size:9px">📍 ${j.location}</span>
            ${sourceLabel}
          </div>
        </div>
        <span class="mb ${mbClass(j.match)}" style="font-size:13px;padding:5px 11px">${j.match}%</span>
      </div>
      <div class="job-sal">${j.salary}</div>
      <div class="job-skills">${(Array.isArray(j.skills)?j.skills:[j.skills||'']).map(s=>`<span class="job-skill">${s}</span>`).join('')}</div>
      <div class="job-foot">
        <span class="job-posted">Posted ${j.posted}</span>
        <div class="job-acts">
          <button class="btn btn-sm btn-v" onclick="addToTrackerById('${j.id}')">+ Track</button>
          ${applyUrl
            ? `<a href="${applyUrl}" target="_blank" class="btn btn-sm btn-g" title="${applyUrl}">Apply ↗</a>`
            : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

// Use ID-based add-to-tracker to avoid JSON serialization issues with large descriptions
function addToTrackerById(id) {
  const j = JOB_LISTINGS.find(x => String(x.id) === String(id));
  if (!j) { showToast('Job not found', 'error'); return; }
  if (jobs.find(x => x.company===j.company && x.role===j.role)) {
    showToast('Already in tracker!', 'warn'); return;
  }
  const newId = typeof j.id === 'string' && j.id.includes('-') ? j.id : Date.now();
  jobs.push({...j, id: newId, status:'Not Applied', recruiter:'', recruiterLinkedIn:'', notes:''});
  saveJobs(); updateCounters(); renderTracker();
  showToast(`✅ ${j.company} added to tracker!`);
}

function addToTracker(j) {
  if (jobs.find(x=>x.company===j.company&&x.role===j.role)) { showToast('Already in tracker!','warn'); return; }
  const newId = typeof j.id === 'string' && j.id.includes('-') ? j.id : Date.now();
  jobs.push({...j,id:newId,status:'Not Applied',recruiter:'',recruiterLinkedIn:'',notes:''});
  saveJobs(); updateCounters(); renderTracker(); showToast(`✅ ${j.company} added to tracker!`);
}

/* ── GROWTH ENGINE ── */
let curType='tech', curIdx=0;

function selectPostType(type, btn) {
  curType=type; curIdx=0;
  document.querySelectorAll('#pt-tabs .tab').forEach(t=>t.classList.remove('active'));
  if(btn) btn.classList.add('active');
  generatePost();
}

function generatePost() {
  const posts=POST_TEMPLATES[curType];
  if(!posts?.length) return;
  curIdx=(curIdx+1)%posts.length;
  const p=posts[curIdx===0?0:curIdx-1];
  const pv=document.getElementById('post-prev');
  if(pv) pv.innerHTML=`<div class="post-hook">${p.hook}</div><div class="post-body">${p.body}</div><div class="post-tags">${p.hashtags}</div>`;
}

function copyPost() {
  const pv=document.getElementById('post-prev'); if(!pv) return;
  copyText(pv.textContent,'📋 Post copied!');
}

function renderPostingTimes() {
  const el=document.getElementById('pt-list'); if(!el) return;
  const colors={'Highest':'var(--g)','High':'var(--a)','Medium':'var(--c)','Low':'var(--r)'};
  el.innerHTML=POSTING_TIMES.map(p=>`
    <div class="pt-item">
      <span class="pt-day">${p.day}</span>
      <span class="pt-time">${p.time}</span>
      <span class="pt-reach" style="color:${colors[p.reach]||'var(--t3)'}">${p.emoji} ${p.reach}</span>
    </div>`).join('');
}

function renderHashtags() {
  const tags=['#WebDev','#NodeJS','#JavaScript','#Python','#OpenToWork','#SoftwareEngineering','#Internship','#RemoteWork','#FullStack','#FrontendDev','#BackendDev','#100DaysOfCode','#BuildInPublic','#CSEStudent','#LearningInPublic','#TechInIndia','#Coding','#GitHub','#React','#AITools'];
  const el=document.getElementById('ht-cloud'); if(!el) return;
  el.innerHTML=tags.map(h=>`<span class="ht" onclick="copyText('${h}','Hashtag copied!')">${h}</span>`).join('');
}

let curTmpl='connection';
function showTemplate(type, btn) {
  curTmpl=type;
  document.querySelectorAll('.tmpl-tabs .tab').forEach(t=>t.classList.remove('active'));
  if(btn) btn.classList.add('active');
  const el=document.getElementById('tmpl-prev'); if(el) el.textContent=MESSAGE_TEMPLATES[type]||'';
}
function copyTemplate() { const el=document.getElementById('tmpl-prev'); if(el) copyText(el.textContent,'📋 Template copied! Customize [bracketed] fields.'); }

/* ── RECRUITER MAGNET ── */
function renderRecruiterKeywords() {
  const el=document.getElementById('rec-keywords'); if(!el) return;
  const c=['kw-v','kw-c','kw-g'];
  el.innerHTML=RECRUITER_KEYWORDS.map((k,i)=>`<span class="kw-tag ${c[i%3]}" onclick="copyText('${k}','Copied!')">${k}</span>`).join('');
}

function renderCerts() {
  const el=document.getElementById('cert-list'); if(!el) return;
  el.innerHTML=CERTIFICATIONS.map(cert=>`
    <div class="cert-item">
      <div style="font-size:18px;flex-shrink:0">${cert.priority.split(' ')[0]}</div>
      <div style="flex:1">
        <div class="cert-name">${cert.name}</div>
        <div class="cert-prov">${cert.provider} • ${cert.time}</div>
        <div class="cert-meta">
          <span class="badge ${cert.free?'bg':'by'}">${cert.free?'🆓 Free':'💰 Paid'}</span>
          <span class="badge bv" style="font-size:9px">${cert.priority}</span>
        </div>
      </div>
      <a href="${cert.link}" target="_blank" class="btn btn-sm">Enroll↗</a>
    </div>`).join('');
}

/* ── STRATEGY ── */
function renderWeekly() {
  const data=JSON.parse(localStorage.getItem('vk-weekly')||'null')||WEEKLY_CHECKLIST;
  const el=document.getElementById('weekly-cl'); if(!el) return;
  el.innerHTML=data.map((item,i)=>`
    <div class="cl-item${item.done?' done':''}" onclick="toggleWeekly(${i})">
      <div class="cl-check">${item.done?'✓':''}</div>
      <span class="cl-text">${item.task}</span>
      <span class="badge bv" style="font-size:9px">${item.category}</span>
    </div>`).join('');
  const done=data.filter(x=>x.done).length;
  const pe=document.getElementById('weekly-prog'); if(pe) pe.textContent=`${done}/${data.length} Done`;
}

function toggleWeekly(i) {
  const data=JSON.parse(localStorage.getItem('vk-weekly')||'null')||WEEKLY_CHECKLIST;
  data[i].done=!data[i].done; localStorage.setItem('vk-weekly',JSON.stringify(data)); renderWeekly();
}

function renderRoadmap() {
  const saved=JSON.parse(localStorage.getItem('vk-roadmap')||'null')||ROADMAP_30_DAYS;
  const el=document.getElementById('roadmap-con'); if(!el) return;
  let td=0,tt=0;
  el.innerHTML=saved.map((week,wi)=>{
    const wd=week.days.filter(d=>d.done).length; td+=wd; tt+=week.days.length;
    return `<div class="rm-week">
      <div class="rm-wk-hdr" onclick="toggleWeek(this)">
        <span class="rm-wk-title">Week ${week.week}: ${week.title}</span>
        <span class="rm-wk-prog">${wd}/${week.days.length} ▾</span>
      </div>
      <div class="rm-days">
        ${week.days.map((day,di)=>`
          <div class="rm-day${day.done?' done':''}" onclick="toggleDay(${wi},${di})">
            <div class="rm-daynum">${day.day}</div>
            <span>${day.priority}</span>
            <span class="rm-task">${day.task}</span>
            ${day.done?'<span style="color:var(--g);font-size:13px">✓</span>':''}
          </div>`).join('')}
      </div>
    </div>`;
  }).join('');
  const pe=document.getElementById('roadmap-prog'); if(pe) pe.textContent=`${td}/${tt} Days Done`;
}

function toggleWeek(hdr) { const d=hdr.nextElementSibling; if(d) d.style.display=d.style.display==='none'?'':'none'; }

function toggleDay(wi,di) {
  const rm=JSON.parse(localStorage.getItem('vk-roadmap')||'null')||ROADMAP_30_DAYS;
  rm[wi].days[di].done=!rm[wi].days[di].done;
  localStorage.setItem('vk-roadmap',JSON.stringify(rm)); renderRoadmap();
}

/* ── DASHBOARD ── */
function renderDashboard() {
  const actions=[
    {p:'🔥',t:'Rewrite LinkedIn headline — copy from Optimizer section',tag:'PROFILE',c:'var(--r)'},
    {p:'🔥',t:'Enable "Open to Work" badge on LinkedIn right now',tag:'URGENT',c:'var(--r)'},
    {p:'⭐',t:'Apply to 3 internships on Internshala today',tag:'APPLY',c:'var(--a)'},
    {p:'⭐',t:'Write first LinkedIn post using Growth Engine templates',tag:'CONTENT',c:'var(--c)'},
    {p:'✅',t:'Update GitHub profile README with skills + stats cards',tag:'GITHUB',c:'var(--g)'},
  ];
  const al=document.getElementById('today-actions');
  if(al) al.innerHTML=actions.map(a=>`
    <div class="action-item">
      <span>${a.p}</span>
      <span class="action-txt">${a.t}</span>
      <span class="action-tag" style="background:rgba(255,255,255,.05);color:${a.c};border:1px solid currentColor">${a.tag}</span>
    </div>`).join('');

  const topJobs=[...JOB_LISTINGS].sort((a,b)=>b.match-a.match).slice(0,3);
  const tj=document.getElementById('top-jobs');
  if(tj) tj.innerHTML=topJobs.map(j=>`
    <div class="job-mini">
      <div class="jm-company">${j.company}</div>
      <div class="jm-role">${j.role}</div>
      <div class="jm-footer">
        <span class="mb ${mbClass(j.match)}">${j.match}% Match</span>
        <span style="font-size:11px;color:var(--g);font-weight:600">${j.salary}</span>
      </div>
      <div style="margin-top:8px;display:flex;gap:6px">
        <button class="btn btn-sm btn-v" onclick="addToTrackerById('${j.id}')">+ Track</button>
        ${j.link?`<a href="${j.link}" target="_blank" class="btn btn-sm btn-g">Apply↗</a>`:''}
      </div>
    </div>`).join('');
}

/* ── SVG GRADIENT ── */
function addSVGGrad() {
  const svg=document.querySelector('.score-svg'); if(!svg) return;
  const defs=document.createElementNS('http://www.w3.org/2000/svg','defs');
  defs.innerHTML=`<linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient>`;
  svg.prepend(defs);
}

/* ── UTILITY ── */
function copyText(text, msg='Copied!') {
  navigator.clipboard.writeText(text).then(()=>showToast(msg)).catch(()=>{
    const ta=document.createElement('textarea'); ta.value=text;
    ta.style.cssText='position:fixed;opacity:0'; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy'); document.body.removeChild(ta); showToast(msg);
  });
}

let toastTimer;
function showToast(msg, type='ok') {
  const el=document.getElementById('toast'); if(!el) return;
  clearTimeout(toastTimer); el.textContent=msg;
  el.style.borderColor=type==='error'?'rgba(239,68,68,.4)':type==='warn'?'rgba(245,158,11,.4)':'rgba(16,185,129,.4)';
  el.classList.add('show'); toastTimer=setTimeout(()=>el.classList.remove('show'),3000);
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', async () => {
  renderDashboard();
  renderLinkedIn();
  renderBoards(); renderJobCards();
  renderTracker();
  generatePost(); renderPostingTimes(); renderHashtags();
  showTemplate('connection');
  renderRecruiterKeywords(); renderCerts();
  renderWeekly(); renderRoadmap();
  setTimeout(addSVGGrad, 100);
  fetchGitHub();
  updateCounters();

  // Load real jobs from API and merge into Job Hunter + Tracker
  await fetchAndMergeAPIJobs();
});
