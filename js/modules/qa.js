/* Static questions and full law articles remain readable without JavaScript. */
(() => {
  'use strict';
  const form = document.getElementById('qaSearchForm');
  if (!form) return;
  const input = document.getElementById('qaSearch');
  const clear = document.getElementById('qaClearSearch');
  const resultCount = document.getElementById('qaResultCount');
  const empty = document.getElementById('qaEmpty');
  const expand = document.getElementById('qaExpandAll');
  const collapse = document.getElementById('qaCollapseAll');
  const items = Array.from(document.querySelectorAll('.qa-item'));
  const groups = Array.from(document.querySelectorAll('.qa-group'));
  const categories = Array.from(document.querySelectorAll('[data-category-filter]'));
  const normalize = text => text.normalize('NFKC').toLowerCase().replace(/\s+/g, '');
  const searchText = new Map(items.map(item => [item, normalize(item.textContent + ' ' + item.dataset.keywords)]));
  let currentCategory = 'all';
  const categoryTitle = () => categories.find(button => button.dataset.categoryFilter === currentCategory).querySelector('span').textContent;
  const visibleItems = () => items.filter(item => !item.hidden);

  function update() {
    const query = input.value.trim();
    const tokens = query.split(/\s+/).filter(Boolean).map(normalize);
    const questionMatch = query.normalize('NFKC').match(/^q\s*(\d+)$/i);
    for (const item of items) {
      const matches = questionMatch ? item.id === 'q' + Number(questionMatch[1]) : tokens.every(token => searchText.get(item).includes(token));
      item.hidden = (currentCategory !== 'all' && item.dataset.category !== currentCategory) || !matches;
    }
    for (const group of groups) {
      const count = Array.from(group.querySelectorAll('.qa-item')).filter(item => !item.hidden).length;
      group.hidden = count === 0;
      group.querySelector('.qa-group-count').textContent = count + ' 題';
    }
    const count = visibleItems().length;
    resultCount.textContent = categoryTitle() + (query ? '，搜尋「' + query + '」' : '') + '，共 ' + count + ' 題';
    empty.hidden = count !== 0;
    clear.hidden = !query;
    expand.disabled = count === 0;
    collapse.disabled = count === 0;
    categories.forEach(button => {
      const selected = button.dataset.categoryFilter === currentCategory;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function reset() { input.value = ''; currentCategory = 'all'; update(); }
  form.addEventListener('submit', event => { event.preventDefault(); update(); });
  input.addEventListener('input', update);
  clear.addEventListener('click', () => { input.value = ''; update(); input.focus(); });
  categories.forEach(button => button.addEventListener('click', () => {
    currentCategory = button.dataset.categoryFilter;
    update();
    const results = document.getElementById('qaResults');
    if (results.getBoundingClientRect().top < 0) results.scrollIntoView({block:'start', behavior:'auto'});
  }));
  expand.addEventListener('click', () => visibleItems().forEach(item => { item.open = true; }));
  collapse.addEventListener('click', () => visibleItems().forEach(item => { item.open = false; }));
  document.getElementById('qaResetFilters').addEventListener('click', () => { reset(); input.focus(); });
  document.querySelectorAll('[data-close-question]').forEach(button => button.addEventListener('click', () => {
    const item = document.getElementById(button.dataset.closeQuestion);
    item.open = false;
    item.querySelector('summary').focus();
    item.scrollIntoView({ block:'start', behavior:'auto' });
  }));
  function openLinkedQuestion() {
    const item = items.find(entry => '#' + entry.id === location.hash);
    if (!item) return;
    reset(); item.open = true;
    item.scrollIntoView({ block:'start', behavior:'auto' });
  }
  window.addEventListener('hashchange', openLinkedQuestion);
  update(); openLinkedQuestion();
})();
