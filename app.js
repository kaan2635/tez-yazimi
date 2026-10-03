(() => {
  'use strict';

  const FIELDS = [
    'title', 'institution', 'department', 'discipline', 'degreeLevel', 'language', 'studyPeriod',
    'ageRange', 'targetLength', 'citationStyle', 'researchSubject', 'researchObjective', 'researchQuestions', 'studyDesign',
    'population', 'inclusionCriteria', 'exclusionCriteria', 'methodPlan', 'followUpAvailable',
    'ethicsStatus', 'guidelineNotes', 'bibliography', 'sourceNotes', 'findings'
  ];

  const SECTIONS = {
    abstract: { title: 'Özet', number: '01', requires: ['findings'], reason: 'Bulgular alanına analiz edilmiş çalışma sonuçlarını ekleyin.' },
    introduction: { title: 'Giriş ve Amaç', number: '02', requires: ['sources'], reason: 'Kaynakça ve doğrulanmış kaynak notları ekleyin.' },
    background: { title: 'Genel Bilgiler', number: '03', requires: ['sources'], reason: 'Kaynakça ve doğrulanmış kaynak notları ekleyin.' },
    methods: { title: 'Gereç ve Yöntem', number: '04', requires: ['method'], reason: 'Tasarım, çalışma evreni ve değişken/analiz planını tamamlayın.' },
    results: { title: 'Bulgular', number: '05', requires: ['findings'], reason: 'Gerçek, analiz edilmiş ve kimliksizleştirilmiş bulguları ekleyin.' },
    discussion: { title: 'Tartışma', number: '06', requires: ['findings', 'sources'], reason: 'Hem analiz edilmiş bulgular hem doğrulanmış kaynak notları gereklidir.' },
    conclusion: { title: 'Sonuç ve Öneriler', number: '07', requires: ['findings'], reason: 'Gerçek, analiz edilmiş çalışma bulgularını ekleyin.' },
    references: { title: 'Kaynakça', number: '08', requires: ['bibliography'], reason: 'En az bir doğrulanabilir kaynak künyesi ekleyin.' }
  };

  const SECTION_CONTEXT_FIELDS = {
    abstract: ['title', 'degreeLevel', 'discipline', 'institution', 'department', 'studyPeriod', 'ageRange', 'language', 'researchObjective', 'studyDesign', 'population', 'findings', 'guidelineNotes'],
    introduction: ['title', 'degreeLevel', 'discipline', 'institution', 'department', 'studyPeriod', 'ageRange', 'language', 'targetLength', 'researchSubject', 'researchObjective', 'researchQuestions', 'citationStyle', 'guidelineNotes', 'bibliography', 'sourceNotes'],
    background: ['title', 'degreeLevel', 'discipline', 'institution', 'department', 'studyPeriod', 'ageRange', 'language', 'targetLength', 'researchSubject', 'researchObjective', 'citationStyle', 'guidelineNotes', 'bibliography', 'sourceNotes'],
    methods: ['title', 'degreeLevel', 'discipline', 'institution', 'department', 'studyPeriod', 'ageRange', 'language', 'researchObjective', 'researchQuestions', 'studyDesign', 'population', 'inclusionCriteria', 'exclusionCriteria', 'methodPlan', 'followUpAvailable', 'ethicsStatus', 'guidelineNotes'],
    results: ['title', 'studyPeriod', 'ageRange', 'researchObjective', 'findings'],
    discussion: ['title', 'studyPeriod', 'ageRange', 'language', 'researchObjective', 'researchQuestions', 'findings', 'followUpAvailable', 'citationStyle', 'bibliography', 'sourceNotes'],
    conclusion: ['title', 'studyPeriod', 'ageRange', 'researchObjective', 'findings', 'followUpAvailable']
  };

  const inputById = (id) => document.getElementById(id);
  const fieldElements = Object.fromEntries(FIELDS.map((field) => [field, inputById(field)]));
  const selectedOutputs = new Map();
  const outputSnapshots = new Map();
  let projectBase = {};
  let isGenerating = false;
  let modelAvailable = false;
  let writeToken = '';

  function fieldHasValue(id) {
    return Boolean(fieldElements[id]?.value.trim());
  }

  function collectProject() {
    const project = { ...projectBase };
    for (const id of FIELDS) {
      if (fieldElements[id]) project[id] = fieldElements[id].value.trim();
    }
    project.schemaVersion = 2;
    return project;
  }

  function projectForSection(sectionId, project) {
    const fields = SECTION_CONTEXT_FIELDS[sectionId] || [];
    return Object.fromEntries(fields.map((field) => [field, project[field] ?? '']));
  }

  function populateProject(project) {
    projectBase = { ...project };
    for (const id of FIELDS) {
      if (fieldElements[id]) fieldElements[id].value = project[id] ?? '';
    }
    const guideUrl = project.guidelineUrl;
    const guideLink = inputById('guideline-link');
    if (guideUrl && guideLink) {
      guideLink.href = guideUrl;
      guideLink.textContent = 'Tez yazım kılavuzunu aç ↗';
    }
    updateInterface();
  }

  function ethicsLooksLikePlaceholder(value) {
    const text = value.toLocaleLowerCase('tr-TR');
    return !text || /bilgi bekleniyor|kullanıcı tarafından eklenecek|henüz tanımlanmadı|henüz eklenmedi|karar tarihi.*numarası.*eklenecek|girilmedi/.test(text);
  }

  function hasSources() {
    return fieldHasValue('bibliography') && fieldHasValue('sourceNotes');
  }

  function checkSection(sectionId) {
    const section = SECTIONS[sectionId];
    if (!section) return { ready: false, reason: 'Bölüm tanımı bulunamadı.' };
    if (sectionId !== 'references' && (!fieldHasValue('title') || !fieldHasValue('researchObjective'))) {
      return { ready: false, reason: 'Tez başlığını ve araştırma amacını tamamlayın.' };
    }
    for (const requirement of section.requires) {
      if (requirement === 'findings' && !fieldHasValue('findings')) return { ready: false, reason: section.reason };
      if (requirement === 'sources' && !hasSources()) return { ready: false, reason: section.reason };
      if (requirement === 'method' && (!fieldHasValue('studyDesign') || !fieldHasValue('population') || !fieldHasValue('methodPlan'))) {
        return { ready: false, reason: section.reason };
      }
      if (requirement === 'bibliography' && !fieldHasValue('bibliography')) return { ready: false, reason: section.reason };
    }
    return { ready: true, reason: '' };
  }

  function readinessItems() {
    const ethics = fieldHasValue('ethicsStatus') && !ethicsLooksLikePlaceholder(fieldElements.ethicsStatus.value);
    return [
      { label: 'Tez başlığı', ready: fieldHasValue('title'), target: 'title' },
      { label: 'Araştırma amacı', ready: fieldHasValue('researchObjective'), target: 'researchObjective' },
      { label: 'Tasarım, evren ve analiz planı mevcut', ready: fieldHasValue('studyDesign') && fieldHasValue('population') && fieldHasValue('methodPlan'), target: !fieldHasValue('studyDesign') ? 'studyDesign' : !fieldHasValue('population') ? 'population' : 'methodPlan' },
      { label: 'Dahil / dışlanma ölçütleri gözden geçirildi', ready: fieldHasValue('inclusionCriteria') && fieldHasValue('exclusionCriteria') && !/taslak|protokol|eşleştir/i.test(`${fieldElements.inclusionCriteria.value} ${fieldElements.exclusionCriteria.value}`), target: 'inclusionCriteria' },
      { label: 'Kaynakça eklendi', ready: fieldHasValue('bibliography'), target: 'bibliography' },
      { label: 'Kaynak notları eklendi (tam metin kontrolü gerekli)', ready: fieldHasValue('sourceNotes'), target: 'sourceNotes' },
      { label: 'Etik kurul bilgisi girildi', ready: ethics, target: 'ethicsStatus' },
      { label: 'Analiz edilmiş bulgular eklendi', ready: fieldHasValue('findings'), target: 'findings' }
    ];
  }

  function updateReadiness() {
    const items = readinessItems();
    const count = items.filter((item) => item.ready).length;
    const percentage = Math.round((count / items.length) * 100);
    inputById('readiness-score').textContent = `${percentage}%`;
    inputById('readiness-fill').style.width = `${percentage}%`;
    const missing = items.length - count;
    inputById('readiness-copy').textContent = missing === 0
      ? 'Kontrol listesindeki bilgiler girildi. Tez içeriği ayrıca doğrulanmalıdır.'
      : `${missing} bilgi bekliyor. Bu puan akademik yeterlilik veya onay anlamına gelmez.`;

    const ethicsLabel = inputById('ethics-status-label');
    const ethicsReady = items.find((item) => item.label === 'Etik kurul bilgisi girildi').ready;
    ethicsLabel.textContent = ethicsReady ? 'Bilgi girildi' : 'Bilgi bekleniyor';
    ethicsLabel.classList.toggle('is-set', ethicsReady);
  }

  function updatePreview() {
    const project = collectProject();
    inputById('project-title-preview').textContent = project.title || 'Başlıksız çalışma';
    const meta = [project.institution, project.department, project.studyPeriod, project.ageRange].filter(Boolean);
    inputById('project-meta-preview').textContent = meta.join(' · ');
  }

  function sectionRequirementLabel(sectionId, ready) {
    if (!ready) return checkSection(sectionId).reason;
    if (sectionId === 'references') return 'Model kullanılmaz · doğrudan aktarılır';
    if (sectionId !== 'methods') return 'Gerekli girdiler mevcut';
    const notices = [];
    if (ethicsLooksLikePlaceholder(fieldElements.ethicsStatus.value)) notices.push('Etik bilgisi eksikse yer tutucu kullanılır');
    if (/taslak|eşleştir|uyumlu hale getirilecek/i.test(fieldElements.studyDesign.value)) notices.push('Tasarım taslak');
    if (/taslak|protokol|eşleştir/i.test(`${fieldElements.inclusionCriteria.value} ${fieldElements.exclusionCriteria.value}`)) notices.push('Dahil / dışlanma ölçütleri taslak');
    if (/önerilen|taslak|nihai .* sayılmamalı/i.test(fieldElements.methodPlan.value)) notices.push('Analiz planı taslak');
    return notices.join(' · ') || 'Gerekli girdiler mevcut';
  }

  function updateSections() {
    const checkboxes = [...document.querySelectorAll('#section-grid input[type="checkbox"]')];
    for (const checkbox of checkboxes) {
      const card = checkbox.closest('.section-option');
      const { ready, reason } = checkSection(checkbox.value);
      if (!ready && checkbox.checked) checkbox.checked = false;
      checkbox.disabled = !ready;
      card.classList.toggle('is-blocked', !ready);
      card.classList.toggle('is-selected', checkbox.checked);
      card.title = ready ? '' : reason;
      const requirement = card.querySelector('.option-requirement');
      if (requirement) requirement.textContent = sectionRequirementLabel(checkbox.value, ready);
    }

    const chosen = checkboxes.filter((box) => box.checked);
    const blockedByModel = chosen.some((box) => box.value !== 'references') && !modelAvailable;
    const invalid = chosen.some((box) => !checkSection(box.value).ready);
    const feedback = inputById('selection-feedback');
    if (!chosen.length) {
      feedback.textContent = 'Bölüm seçilmedi.';
    } else if (invalid) {
      feedback.textContent = 'Seçilen bölümler için eksik bilgileri tamamlayın.';
    } else if (blockedByModel) {
      feedback.textContent = `${chosen.length} bölüm seçildi · model bağlantısı gerekli.`;
    } else {
      feedback.textContent = `${chosen.length} bölüm seçildi · üretime hazır.`;
    }

    inputById('generate-button').disabled = isGenerating || !chosen.length || invalid || blockedByModel;
    inputById('offline-note').hidden = modelAvailable;
    inputById('generate-button').querySelector('span:nth-child(2)').textContent = isGenerating ? 'Bölüm hazırlanıyor…' : 'Seçili bölümleri hazırla';
  }

  function outputSnapshotFor(id, project = collectProject()) {
    return id === 'references' ? String(project.bibliography || '') : JSON.stringify(projectForSection(id, project));
  }

  function outputIsStale(id) {
    const snapshot = outputSnapshots.get(id);
    return !snapshot || snapshot !== outputSnapshotFor(id);
  }

  function refreshOutputFreshness() {
    document.querySelectorAll('.output-item').forEach((article) => {
      const id = article.dataset.outputId;
      const note = article.querySelector('.output-item-foot strong');
      if (!id || !note) return;
      const stale = outputIsStale(id);
      article.classList.toggle('is-stale', stale);
      note.classList.toggle('is-stale', stale);
      note.textContent = stale
        ? (outputSnapshots.has(id) ? 'Girdiler değişti · bu bölümü yeniden üretin' : 'İçe aktarıldı · girdi sürümü doğrulanamıyor')
        : id === 'references'
          ? 'Girilen kaynakça metni · künyeleri ve atıf sırasını doğrula'
          : 'Yapay zekâ taslağı · kaynak ve içerik doğrulaması gerekli';
    });
  }

  function updateInterface() {
    updatePreview();
    updateReadiness();
    updateSections();
    refreshOutputFreshness();
  }

  function setModelStatus(ready, message, error = false) {
    modelAvailable = ready;
    const status = inputById('api-status');
    status.classList.toggle('is-ready', ready);
    status.classList.toggle('is-error', error);
    status.querySelector('span:last-child').textContent = message;
    updateSections();
  }

  async function checkModelStatus() {
    try {
      const response = await fetch('/api/status', { headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (!response.ok) throw new Error('Model sunucusu yanıt vermedi.');
      const status = await response.json();
      writeToken = typeof status.writeToken === 'string' ? status.writeToken : '';
      if (status.configured) {
        const modelName = status.model ? ` · ${status.model}` : '';
        setModelStatus(true, `Model ayarlı${modelName}`);
      } else {
        setModelStatus(false, 'Model bağlantısı yapılandırılmamış');
      }
    } catch (error) {
      setModelStatus(false, 'Yerel sunucuya ulaşılamıyor', true);
    }
  }

  function renderOutputs() {
    const list = inputById('output-list');
    list.replaceChildren();
    const empty = inputById('empty-output');
    const actions = inputById('output-actions');
    empty.hidden = selectedOutputs.size > 0;
    actions.hidden = selectedOutputs.size === 0;

    for (const [id, text] of selectedOutputs.entries()) {
      const meta = SECTIONS[id];
      if (!meta) continue;
      const article = document.createElement('article');
      article.className = 'output-item';
      article.dataset.outputId = id;

      const header = document.createElement('div');
      header.className = 'output-item-header';
      const headingWrap = document.createElement('div');
      headingWrap.className = 'output-item-heading';
      const number = document.createElement('span');
      number.textContent = meta.number;
      const heading = document.createElement('h3');
      heading.textContent = meta.title;
      headingWrap.append(number, heading);

      const tools = document.createElement('div');
      tools.className = 'output-item-actions';
      const copy = document.createElement('button');
      copy.className = 'mini-button';
      copy.type = 'button';
      copy.textContent = 'Kopyala';
      copy.addEventListener('click', () => copyText(selectedOutputs.get(id) || '', copy));
      const remove = document.createElement('button');
      remove.className = 'mini-button';
      remove.type = 'button';
      remove.textContent = 'Kaldır';
      remove.title = 'Bu bölümü yalnızca sayfadan kaldır';
      remove.addEventListener('click', () => {
        selectedOutputs.delete(id);
        outputSnapshots.delete(id);
        renderOutputs();
        updateOutputCount();
      });
      tools.append(copy, remove);
      header.append(headingWrap, tools);

      const textarea = document.createElement('textarea');
      textarea.setAttribute('aria-label', `${meta.title} metni; düzenlemek için yazın`);
      textarea.spellcheck = true;
      textarea.value = text;
      textarea.addEventListener('input', () => {
        selectedOutputs.set(id, textarea.value);
        const count = article.querySelector('.char-count');
        if (count) count.textContent = `${textarea.value.length.toLocaleString('tr-TR')} karakter`;
      });

      const footer = document.createElement('div');
      footer.className = 'output-item-foot';
      const note = document.createElement('strong');
      const stale = outputIsStale(id);
      note.classList.toggle('is-stale', stale);
      note.textContent = stale
        ? (outputSnapshots.has(id) ? 'Girdiler değişti · bu bölümü yeniden üretin' : 'İçe aktarıldı · girdi sürümü doğrulanamıyor')
        : id === 'references'
          ? 'Girilen kaynakça metni · künyeleri ve atıf sırasını doğrula'
          : 'Yapay zekâ taslağı · kaynak ve içerik doğrulaması gerekli';
      const chars = document.createElement('span');
      chars.className = 'char-count';
      chars.textContent = `${text.length.toLocaleString('tr-TR')} karakter`;
      footer.append(note, chars);
      article.append(header, textarea, footer);
      list.append(article);
    }
    updateOutputCount();
  }

  function updateOutputCount() {
    const count = selectedOutputs.size;
    inputById('rail-output-count').textContent = count ? `${count} bölüm hazır` : 'Henüz bölüm yok';
    const link = document.querySelector('[data-step-link="draft-output"]');
    link.classList.toggle('is-complete', count > 0);
  }

  function copyText(text, button) {
    const original = button.textContent;
    const fallback = () => {
      const helper = document.createElement('textarea');
      helper.value = text;
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.append(helper);
      helper.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
      helper.remove();
      button.textContent = copied ? 'Kopyalandı ✓' : 'Kopyalanamadı';
      window.setTimeout(() => { button.textContent = original; }, 1800);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        button.textContent = 'Kopyalandı ✓';
        window.setTimeout(() => { button.textContent = original; }, 1800);
      }).catch(fallback);
    } else fallback();
  }

  function buildMarkdown() {
    const parts = [];
    for (const [id, text] of selectedOutputs.entries()) {
      if (SECTIONS[id]) parts.push(`# ${SECTIONS[id].title}\n\n${text.trim()}`);
    }
    return parts.join('\n\n---\n\n');
  }

  function saveBlob(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function safeFilename(value, extension) {
    const base = (value || 'tez-taslagi')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 55) || 'tez-taslagi';
    return `${base}.${extension}`;
  }

  function exportProject() {
    const payload = {
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      project: collectProject(),
      outputs: Object.fromEntries(selectedOutputs),
      outputSnapshots: Object.fromEntries(outputSnapshots)
    };
    saveBlob(safeFilename(payload.project.title, 'json'), `${JSON.stringify(payload, null, 2)}\n`, 'application/json;charset=utf-8');
  }

  function showGenerationMessage(text, type = 'info') {
    const box = inputById('generation-message');
    box.textContent = text;
    box.classList.toggle('is-error', type === 'error');
    box.classList.toggle('is-warning', type === 'warning');
    box.hidden = false;
  }

  function clearGenerationMessage() {
    const box = inputById('generation-message');
    box.hidden = true;
    box.textContent = '';
    box.classList.remove('is-error', 'is-warning');
  }

  function readinessMessage() {
    const missing = readinessItems().filter((item) => !item.ready);
    if (!missing.length) return 'Kontrol listesindeki alanlar doldurulmuş görünüyor. Bilimsel doğruluk için kaynak, protokol ve veri denetimi yine gereklidir.';
    return `Henüz eksik olanlar:\n${missing.map((item) => `• ${item.label}`).join('\n')}\n\nBunlar akademik onay anlamına gelmez; yalnızca form tamlık kontrolüdür.`;
  }

  function hasPlausibleNationalId(text) {
    const candidates = text.match(/\b\d{11}\b/g) || [];
    return candidates.some((value) => {
      const digits = [...value].map(Number);
      if (digits[0] === 0) return false;
      const odd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
      const even = digits[1] + digits[3] + digits[5] + digits[7];
      const tenth = ((((odd * 7) - even) % 10) + 10) % 10;
      const eleventh = digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0) % 10;
      return tenth === digits[9] && eleventh === digits[10];
    });
  }

  function inputLooksIdentifiable(project) {
    const screened = Object.entries(project)
      .filter(([key, value]) => key !== 'sourceUrls' && typeof value === 'string')
      .map(([, value]) => value)
      .join('\n');
    return hasPlausibleNationalId(screened);
  }

  async function generateSelected() {
    const checkboxes = [...document.querySelectorAll('#section-grid input[type="checkbox"]')];
    const chosen = checkboxes.filter((box) => box.checked).map((box) => box.value);
    if (!chosen.length || isGenerating) return;

    const failedReadiness = chosen.filter((id) => !checkSection(id).ready);
    if (failedReadiness.length) {
      showGenerationMessage('Seçilen bazı bölümler için gerekli bilgi eksik. Eksik alanlar eklenmeden üretim yapılmaz.', 'warning');
      return;
    }

    if (chosen.some((id) => id !== 'references') && !modelAvailable) {
      showGenerationMessage('Model bağlantısı hazır değil. Önce README dosyasındaki sunucu tarafı model yapılandırmasını tamamlayın. API anahtarını HTML veya tarayıcı alanlarına yazmayın.', 'warning');
      return;
    }

    const project = collectProject();
    if (inputLooksIdentifiable(project)) {
      showGenerationMessage('Bir metin alanında geçerli olabilecek 11 haneli T.C. kimlik numarası saptandı. Bu içeriği silip kimliksizleştirdiğinizden emin olmadan üretim başlatılamaz.', 'error');
      return;
    }

    isGenerating = true;
    clearGenerationMessage();
    updateSections();
    const errors = [];
    let completed = 0;

    for (const id of chosen) {
      const section = SECTIONS[id];
      showGenerationMessage(id === 'references'
        ? `${completed + 1}/${chosen.length} · ${section.title} kaynakça alanından yerel olarak aktarılıyor; model isteği yapılmıyor.`
        : `${completed + 1}/${chosen.length} · ${section.title} hazırlanıyor… Bu işlem metni yapılandırılmış model hizmetine gönderir.`);
      try {
        let content;
        if (id === 'references') {
          content = project.bibliography.trim();
        } else {
          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Write-Token': writeToken },
            body: JSON.stringify({ section: id, project: projectForSection(id, project) })
          });
          const payload = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(payload.error || `Sunucu yanıtı: ${response.status}`);
          if (typeof payload.content !== 'string' || !payload.content.trim()) throw new Error('Model boş bir yanıt döndürdü.');
          content = payload.content.trim();
        }
        selectedOutputs.set(id, content);
        outputSnapshots.set(id, outputSnapshotFor(id, project));
        renderOutputs();
        completed += 1;
      } catch (error) {
        errors.push(`${section.title}: ${error.message}`);
        break;
      }
    }

    isGenerating = false;
    updateSections();
    if (errors.length) {
      showGenerationMessage(`${completed ? `${completed} bölüm hazırlandı. ` : ''}${errors.join(' ')} Önceki taslaklar korunmuştur; bağlantı ve model ayarlarını kontrol edip tekrar deneyin.`, 'error');
    } else {
      showGenerationMessage(`${completed} bölüm taslak olarak hazırlandı. Metinleri kaynaklarla, onaylı protokolle ve gerçek analiz çıktılarıyla karşılaştırın; taslaklar sayfa kapatıldığında silinir.`);
      inputById('draft-output').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async function loadStarter() {
    try {
      const response = await fetch('/data/starter-project.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Başlangıç profili okunamadı.');
      const data = await response.json();
      const project = data.project || data;
      populateProject(project);
      clearGenerationMessage();
    } catch (error) {
      showGenerationMessage('Başlangıç tez bilgileri yüklenemedi. Uygulamayı README dosyasındaki yerel web sunucusuyla açın.', 'error');
    }
  }

  function importProjectFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const project = data.project || data;
        if (!project || typeof project !== 'object' || Array.isArray(project)) throw new Error('Geçersiz tez taslağı.');
        populateProject(project);
        selectedOutputs.clear();
        outputSnapshots.clear();
        if (data.outputs && typeof data.outputs === 'object') {
          for (const [id, text] of Object.entries(data.outputs)) {
            if (SECTIONS[id] && typeof text === 'string') selectedOutputs.set(id, text);
          }
        }
        if (data.outputSnapshots && typeof data.outputSnapshots === 'object') {
          for (const [id, snapshot] of Object.entries(data.outputSnapshots)) {
            if (SECTIONS[id] && typeof snapshot === 'string') outputSnapshots.set(id, snapshot);
          }
        }
        renderOutputs();
        clearGenerationMessage();
        showGenerationMessage('Taslak bu tarayıcıya yüklendi. Sunucuya kaydedilmedi.');
      } catch (error) {
        showGenerationMessage(`Taslak açılamadı: ${error.message}`, 'error');
      }
    };
    reader.onerror = () => showGenerationMessage('Seçilen dosya okunamadı.', 'error');
    reader.readAsText(file);
  }

  function handleEvidenceFile(file) {
    if (!file) return;
    if (file.size > 1024 * 1024) {
      showGenerationMessage('Dosya 1 MB sınırını aşıyor. Yalnızca küçük, kimliksizleştirilmiş özet metni ekleyin.', 'warning');
      return;
    }
    const extension = file.name.split('.').pop().toLowerCase();
    if (!['txt', 'md', 'csv'].includes(extension)) {
      showGenerationMessage('Yalnızca .txt, .md veya .csv dosyaları destekleniyor.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const findings = fieldElements.findings;
      const text = String(reader.result || '').trim();
      if (!text) {
        showGenerationMessage('Dosyada okunabilir metin bulunamadı.', 'warning');
        return;
      }
      findings.value = findings.value.trim() ? `${findings.value.trim()}\n\n${text}` : text;
      updateInterface();
      showGenerationMessage('Dosya içeriği bulgular alanına eklendi. Devam etmeden önce kimlik bilgisi içermediğini kontrol edin. Dosya sunucuya yüklenmedi.', 'warning');
    };
    reader.onerror = () => showGenerationMessage('Dosya okunamadı.', 'error');
    reader.readAsText(file);
  }

  document.querySelectorAll('[data-field]').forEach((field) => {
    field.addEventListener('input', updateInterface);
    field.addEventListener('change', updateInterface);
  });

  document.querySelectorAll('#section-grid input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      updateSections();
      clearGenerationMessage();
    });
  });

  inputById('select-all-sections').addEventListener('click', () => {
    const checkboxes = [...document.querySelectorAll('#section-grid input[type="checkbox"]')];
    const selectable = checkboxes.filter((checkbox) => !checkbox.disabled);
    const select = selectable.some((checkbox) => !checkbox.checked);
    for (const checkbox of selectable) checkbox.checked = select;
    updateSections();
  });

  inputById('generate-button').addEventListener('click', generateSelected);
  inputById('export-project-button').addEventListener('click', exportProject);
  inputById('import-project-button').addEventListener('click', () => inputById('import-project-input').click());
  inputById('import-project-input').addEventListener('change', (event) => {
    importProjectFile(event.target.files?.[0]);
    event.target.value = '';
  });
  inputById('evidence-file').addEventListener('change', (event) => {
    handleEvidenceFile(event.target.files?.[0]);
    event.target.value = '';
  });
  inputById('show-checklist').addEventListener('click', () => {
    showGenerationMessage(readinessMessage(), 'warning');
    const firstMissing = readinessItems().find((item) => !item.ready);
    if (firstMissing) {
      const target = fieldElements[firstMissing.target];
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => target?.focus({ preventScroll: true }), 250);
    } else {
      inputById('study-info').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  inputById('copy-all-button').addEventListener('click', (event) => copyText(buildMarkdown(), event.currentTarget));
  inputById('download-text-button').addEventListener('click', () => saveBlob(safeFilename(collectProject().title, 'md'), `${buildMarkdown()}\n`, 'text/markdown;charset=utf-8'));

  document.querySelectorAll('[data-step-link]').forEach((link) => {
    link.addEventListener('click', () => {
      document.querySelectorAll('[data-step-link]').forEach((item) => item.classList.toggle('is-active', item === link));
    });
  });

  const observedSections = [...document.querySelectorAll('.main-column > section')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const link = document.querySelector(`[data-step-link="${visible.target.id}"]`);
      if (link) document.querySelectorAll('[data-step-link]').forEach((item) => item.classList.toggle('is-active', item === link));
    }, { rootMargin: '-15% 0px -72% 0px', threshold: [0, .1, .25] });
    observedSections.forEach((section) => observer.observe(section));
  }

  updateInterface();
  renderOutputs();
  checkModelStatus();
  loadStarter();
})();
