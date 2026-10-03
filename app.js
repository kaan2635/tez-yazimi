(() => {
  'use strict';

  const STORAGE_KEY = 'tezpusulasi.project.v1';
  const STARTER_URL = './data/starter-project.json';
  const fieldNames = [
    'title', 'degreeLevel', 'discipline', 'institution', 'department', 'studyPeriod', 'ageRange',
    'language', 'targetLength', 'researchSubject', 'researchObjective', 'researchQuestion',
    'studyDesign', 'inclusionCriteria', 'exclusionCriteria', 'followUpAvailable', 'dataStatus',
    'findings', 'guidelineUrl', 'citationStyle', 'ethicsStatus', 'sourceUrls', 'notes'
  ];
  const requiredFields = [
    ['title', 'Tez başlığı'],
    ['institution', 'Kurum'],
    ['department', 'Klinik / bölüm'],
    ['studyPeriod', 'Çalışma dönemi'],
    ['ageRange', 'Yaş aralığı'],
    ['researchObjective', 'Araştırma amacı'],
    ['researchQuestion', 'Araştırma sorusu'],
    ['studyDesign', 'Çalışma tasarımı'],
    ['guidelineUrl', 'Yazım yönergesi'],
    ['sourceUrls', 'Başlangıç kaynakları']
  ];

  const byId = (id) => document.getElementById(id);
  const deepCopy = (value) => JSON.parse(JSON.stringify(value));
  let defaults = null;
  let state = null;
  let saveTimer = null;
  let toastTimer = null;
  let dirty = false;

  function normalizeSourceText(value) {
    if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean).join('\n');
    return String(value || '');
  }

  function safeProject(input, fallback) {
    const result = deepCopy(fallback || {});
    const incoming = input && typeof input === 'object' ? input : {};
    for (const key of fieldNames) {
      if (!Object.prototype.hasOwnProperty.call(incoming, key)) continue;
      if (key === 'sourceUrls') {
        result[key] = normalizeSourceText(incoming[key]).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      } else {
        result[key] = typeof incoming[key] === 'string' ? incoming[key] : String(incoming[key] ?? '');
      }
    }
    if (!Array.isArray(result.sourceUrls)) result.sourceUrls = [];
    return result;
  }

  async function loadDefaults() {
    try {
      const response = await fetch(STARTER_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error('Başlangıç profili okunamadı.');
      const data = await response.json();
      if (!data || !data.project || typeof data.project !== 'object') throw new Error('Başlangıç profili biçimi geçersiz.');
      return { schemaVersion: 1, project: safeProject(data.project, {}), updatedAt: null };
    } catch (error) {
      throw new Error('Başlangıç profili yüklenemedi. Uygulamayı yerel bir web sunucusu üzerinden açın.');
    }
  }

  function setSaveStatus(label, mode = 'saved') {
    const indicator = byId('save-indicator');
    const text = byId('save-status');
    if (!indicator || !text) return;
    text.textContent = label;
    indicator.classList.toggle('is-dirty', mode === 'dirty');
    indicator.classList.toggle('is-error', mode === 'error');
  }

  function showToast(message, type = 'success') {
    const toast = byId('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.toggle('error', type === 'error');
    toast.classList.add('visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 3000);
  }

  function readSavedState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !parsed.project || typeof parsed.project !== 'object') return null;
      return {
        schemaVersion: 1,
        project: safeProject(parsed.project, defaults.project),
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null
      };
    } catch (error) {
      console.warn('Yerel tez profili okunamadı:', error);
      return null;
    }
  }

  function populateForm() {
    for (const key of fieldNames) {
      const field = byId(key);
      if (!field) continue;
      const value = state.project[key];
      field.value = key === 'sourceUrls' ? normalizeSourceText(value) : String(value ?? '');
    }
  }

  function collectForm() {
    const project = { ...state.project };
    for (const key of fieldNames) {
      const field = byId(key);
      if (!field) continue;
      project[key] = key === 'sourceUrls'
        ? field.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
        : field.value.trim();
    }
    state = { schemaVersion: 1, project, updatedAt: state.updatedAt || null };
    return state;
  }

  function isComplete(value) {
    if (Array.isArray(value)) return value.some((item) => String(item).trim());
    return String(value || '').trim().length > 0;
  }

  function getDesignLabel(design) {
    const text = String(design || '').toLowerCase();
    if (text.includes('retrospektif')) return 'Retrospektif';
    if (text.includes('prospektif')) return 'Prospektif';
    if (!design) return 'Tanımlanmadı';
    return String(design).split(/[.;]/)[0].slice(0, 28);
  }

  function shortInstitution(institution) {
    const text = String(institution || '').trim();
    if (!text) return 'Kurum belirtilmedi';
    return text
      .replace(/^Sağlık Bilimleri Üniversitesi\s*/i, 'SBÜ ')
      .replace('Eğitim ve Araştırma Hastanesi', 'Eğitim ve Araştırma');
  }

  function updateChecklist(project) {
    const completed = requiredFields.filter(([key]) => isComplete(project[key])).length;
    const percent = Math.round((completed / requiredFields.length) * 100);
    byId('metric-completion').textContent = `${percent}%`;
    byId('metric-fields').textContent = `${completed} / ${requiredFields.length} temel alan`;
    byId('readiness-count').textContent = `${completed}/${requiredFields.length}`;
    byId('completion-bar').style.width = `${percent}%`;
    byId('readiness-bar').style.width = `${percent}%`;

    const list = byId('check-list');
    list.replaceChildren();
    const missing = requiredFields.filter(([key]) => !isComplete(project[key]));
    const entries = missing.length ? missing : [['__complete__', 'Temel proje tanımı hazır']];
    for (const [key, label] of entries) {
      const item = document.createElement('li');
      item.classList.toggle('missing', key !== '__complete__');
      item.textContent = key === '__complete__' ? `${label} · etik ve veri adımları ayrıca bekliyor` : `Eksik: ${label}`;
      list.appendChild(item);
    }
  }

  function render() {
    const project = state.project;
    const title = project.title || 'Başlıksız tez projesi';
    byId('sidebar-project-title').textContent = title.length > 31 ? `${title.slice(0, 29)}…` : title;
    byId('metric-period').textContent = project.studyPeriod || 'Belirlenmedi';
    byId('metric-design').textContent = getDesignLabel(project.studyDesign);
    byId('metric-center').textContent = shortInstitution(project.institution);
    byId('metric-department').textContent = project.department || 'Klinik / bölüm belirtilmedi';
    byId('preview-title').textContent = title;
    byId('preview-meta-text').textContent = [project.studyPeriod, project.institution].filter(Boolean).join(' · ') || 'Dönem ve merkez belirtilmedi';
    byId('preview-design').textContent = project.studyDesign || 'Çalışma tasarımı belirtilmedi';
    byId('preview-aim').textContent = project.researchObjective || 'Araştırmanın amacı henüz tanımlanmadı.';
    updateChecklist(project);
    document.title = `${title.slice(0, 55)}${title.length > 55 ? '…' : ''} — TezPusulası`;
  }

  function persist(showMessage = false) {
    collectForm();
    state.updatedAt = new Date().toISOString();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      dirty = false;
      setSaveStatus('Bu cihazda kaydedildi');
      if (showMessage) showToast('Proje bilgileri bu tarayıcıya kaydedildi.');
      return true;
    } catch (error) {
      setSaveStatus('Yerel kayıt yapılamadı', 'error');
      if (showMessage) showToast('Tarayıcı depolamasına erişilemedi. JSON dışa aktarımını kullanın.', 'error');
      return false;
    }
  }

  function schedulePersist() {
    dirty = true;
    setSaveStatus('Değişiklikler kaydediliyor…', 'dirty');
    collectForm();
    render();
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => persist(false), 650);
  }

  function exportProject() {
    collectForm();
    state.updatedAt = new Date().toISOString();
    const exportObject = {
      schemaVersion: 1,
      exportedAt: state.updatedAt,
      application: 'TezPusulası Faz 1',
      project: state.project
    };
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'tezpusulasi-proje-profili.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('Proje profili JSON olarak dışa aktarıldı.');
  }

  function importProject(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ''));
        const incomingProject = parsed && parsed.project && typeof parsed.project === 'object' ? parsed.project : parsed;
        if (!incomingProject || typeof incomingProject !== 'object' || Array.isArray(incomingProject)) throw new Error('Dosya proje profili içermiyor.');
        state.project = safeProject(incomingProject, defaults.project);
        state.updatedAt = new Date().toISOString();
        populateForm();
        render();
        persist(false);
        showToast('Proje profili içe aktarıldı ve bu tarayıcıya kaydedildi.');
      } catch (error) {
        showToast('JSON dosyası okunamadı. Dışa aktarılan TezPusulası profilini seçin.', 'error');
      }
      byId('import-file').value = '';
    };
    reader.onerror = () => showToast('Dosya okunamadı.', 'error');
    reader.readAsText(file, 'utf-8');
  }

  function resetProject() {
    const approved = window.confirm('Bu tarayıcıdaki proje düzenlemeleri başlangıç profiliyle değiştirilsin mi? Önce JSON dışa aktarmanız önerilir.');
    if (!approved) return;
    state = deepCopy(defaults);
    state.updatedAt = new Date().toISOString();
    populateForm();
    render();
    persist(false);
    showToast('Başlangıç profili geri yüklendi.');
  }

  function buildBrief() {
    collectForm();
    const p = state.project;
    const sources = Array.isArray(p.sourceUrls) ? p.sourceUrls.length : 0;
    return [
      `TEZ PROJE ÖZETİ`,
      `Başlık: ${p.title || 'Belirtilmedi'}`,
      `Derece / alan: ${[p.degreeLevel, p.discipline].filter(Boolean).join(' — ') || 'Belirtilmedi'}`,
      `Merkez: ${[p.institution, p.department].filter(Boolean).join(' — ') || 'Belirtilmedi'}`,
      `Dönem / yaş: ${[p.studyPeriod, p.ageRange].filter(Boolean).join(' / ') || 'Belirtilmedi'}`,
      `Amaç: ${p.researchObjective || 'Henüz tanımlanmadı'}`,
      `Araştırma sorusu: ${p.researchQuestion || 'Henüz tanımlanmadı'}`,
      `Tasarım: ${p.studyDesign || 'Henüz belirlenmedi'}`,
      `Yazım yönergesi: ${p.guidelineUrl || 'Belirtilmedi'}`,
      `Kaynak bağlantısı: ${sources}`,
      `Veri durumu: ${p.dataStatus || 'Belirtilmedi'}`,
      `Etik kurul: ${p.ethicsStatus || 'Kullanıcı tarafından eklenecek'}`,
      `Not: Verilmeyen bilgi veya bulgu üretilmez; hasta kimlik bilgileri bu profile eklenmemelidir.`
    ].join('\n');
  }

  async function copyBrief() {
    const text = buildBrief();
    try {
      await navigator.clipboard.writeText(text);
      showToast('Proje özeti panoya kopyalandı.');
    } catch (error) {
      const temporary = document.createElement('textarea');
      temporary.value = text;
      temporary.setAttribute('readonly', '');
      temporary.style.position = 'fixed';
      temporary.style.opacity = '0';
      document.body.appendChild(temporary);
      temporary.select();
      const copied = document.execCommand('copy');
      temporary.remove();
      showToast(copied ? 'Proje özeti panoya kopyalandı.' : 'Özet kopyalanamadı; metni seçerek kopyalayın.', copied ? 'success' : 'error');
    }
  }

  function setupTabs() {
    const tabs = Array.from(document.querySelectorAll('.tab-button'));
    const panels = Array.from(document.querySelectorAll('.tab-panel'));
    function activate(tab) {
      const id = tab.dataset.tab;
      for (const candidate of tabs) {
        const active = candidate === tab;
        candidate.classList.toggle('active', active);
        candidate.setAttribute('aria-selected', String(active));
        candidate.tabIndex = active ? 0 : -1;
      }
      for (const panel of panels) {
        const active = panel.dataset.panel === id;
        panel.hidden = !active;
        panel.classList.toggle('active', active);
      }
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const next = tabs[(index + direction + tabs.length) % tabs.length];
        activate(next);
        next.focus();
      });
    });
  }

  function setupNavigation() {
    const links = Array.from(document.querySelectorAll('.nav-link'));
    const sections = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    const activateLink = (id) => {
      for (const link of links) link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    };
    const sourceLink = links.find((link) => link.getAttribute('href') === '#sources');
    if (sourceLink) {
      sourceLink.addEventListener('click', (event) => {
        event.preventDefault();
        const sourceTab = byId('tab-sources');
        if (sourceTab) sourceTab.click();
        window.setTimeout(() => byId('sources').scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
      });
    }
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) activateLink(visible.target.id);
      }, { rootMargin: '-18% 0px -68% 0px', threshold: [0, .15, .4] });
      sections.forEach((section) => observer.observe(section));
    }
  }

  function bindEvents() {
    byId('project-form').addEventListener('input', schedulePersist);
    byId('project-form').addEventListener('change', schedulePersist);
    byId('save-button').addEventListener('click', () => persist(true));
    byId('save-button-bottom').addEventListener('click', () => persist(true));
    byId('export-button').addEventListener('click', exportProject);
    byId('import-button').addEventListener('click', () => byId('import-file').click());
    byId('import-file').addEventListener('change', (event) => importProject(event.target.files && event.target.files[0]));
    byId('reset-button').addEventListener('click', resetProject);
    byId('copy-brief-button').addEventListener('click', copyBrief);
    byId('copy-brief-small').addEventListener('click', copyBrief);
    window.addEventListener('beforeunload', (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    });
  }

  async function init() {
    try {
      defaults = await loadDefaults();
      const saved = readSavedState();
      state = saved || deepCopy(defaults);
      populateForm();
      render();
      if (saved) setSaveStatus('Bu cihazda kaydedildi');
      else setSaveStatus('Başlangıç profili yüklendi');
      setupTabs();
      setupNavigation();
      bindEvents();
    } catch (error) {
      console.error(error);
      setSaveStatus('Profil yüklenemedi', 'error');
      showToast(error.message, 'error');
    }
  }

  init();
})();
