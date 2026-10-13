/* Only finalized public documents belong in js/data/downloads.json. */
(() => {
  'use strict';
  const panel = document.getElementById('downloadsPanel');
  const list = document.getElementById('downloadsList');
  const count = document.getElementById('downloadsCount');
  const state = document.getElementById('downloadsState');
  const message = document.getElementById('downloadsMessage');
  const help = document.getElementById('downloadsHelp');
  const retry = document.getElementById('downloadsRetry');
  const base = new URL('assets/documents/', document.baseURI);
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  };
  function documentRow(item) {
    if (!item || typeof item.title !== 'string' || !item.title.trim() || typeof item.file !== 'string') throw new Error('Invalid document');
    const url = new URL(item.file, document.baseURI);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname) || url.pathname === base.pathname || url.search || url.hash) throw new Error('Invalid file path');
    const row = element('li', 'download-item', '');
    const info = element('div', 'download-item-info', '');
    info.append(element('h3', '', item.title));
    if (item.description) info.append(element('p', 'download-item-description', item.description));
    const metadata = [item.updated ? '更新日期：' + item.updated : '', item.format || '', item.size || ''].filter(Boolean);
    if (metadata.length) info.append(element('p', 'download-item-meta', metadata.join('　｜　')));
    const link = element('a', 'download-link', '下載 ↓');
    link.href = url.href;
    link.download = '';
    link.setAttribute('aria-label', '下載 ' + item.title + (item.format ? '（' + item.format + '）' : ''));
    row.append(info, link);
    return row;
  }
  async function load() {
    panel.setAttribute('aria-busy', 'true');
    list.hidden = true;
    state.hidden = false;
    help.hidden = true;
    retry.hidden = true;
    count.textContent = '載入文件清單中…';
    message.textContent = '正在取得可下載的文件。';
    try {
      const response = await fetch('js/data/downloads.json', { cache:'no-store' });
      if (!response.ok) throw new Error('Document list unavailable');
      const documents = await response.json();
      if (!Array.isArray(documents)) throw new Error('Invalid document list');
      const rows = documents.map(documentRow);
      list.replaceChildren(...rows);
      count.textContent = '共 ' + rows.length + ' 份文件';
      list.hidden = rows.length === 0;
      state.hidden = rows.length > 0;
      if (!rows.length) {
        message.textContent = '目前尚無提供下載的文件。';
        help.hidden = false;
      }
    } catch {
      count.textContent = '文件清單暫時無法載入';
      message.textContent = '無法取得文件清單，請稍後重新載入。';
      retry.hidden = false;
    } finally {
      panel.setAttribute('aria-busy', 'false');
    }
  }
  retry.addEventListener('click', load);
  load();
})();
