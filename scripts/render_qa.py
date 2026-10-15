"""Render the public, JavaScript-independent FAQ from the reviewed JSON sources."""
from pathlib import Path
from html import escape
import argparse
import json
import re

ROOT = Path(__file__).resolve().parents[1]
START = '<!-- QA_CONTENT_START -->'
END = '<!-- QA_CONTENT_END -->'


def law_html(key, law, number):
    label = f"{law['law']}第 {law['article'].replace('-', ' 條之 ')}" + (' 條' if '-' not in law['article'] else '')
    title_id = f'q{number}-{key}-title'
    paragraphs = []
    for text in law['paragraphs']:
        cls = 'law-subitem' if text.startswith('（') else 'law-item' if re.match(r'^[一二三四五六七八九十]+、', text) else 'law-paragraph'
        paragraphs.append(f'<p class="{cls}">{escape(text)}</p>')
    effective = f'<p class="law-effective">{escape(law["effectiveDate"])}</p>' if law.get('effectiveDate') else ''
    return (f'<details class="qa-law" data-law-id="{escape(key)}" aria-labelledby="{title_id}">'
            f'<summary class="qa-law-summary" id="{title_id}"><span class="qa-law-title">{escape(label)}（全文）</span>'
            '<span class="qa-law-state" aria-hidden="true"></span><span class="qa-toggle" aria-hidden="true"></span></summary>'
            f'<div class="qa-law-body"><p class="qa-law-source">來源：<a href="{escape(law["sourceUrl"], quote=True)}" target="_blank" rel="noopener noreferrer">官方法規資料庫<span class="sr-only">（另開新分頁）</span></a></p>'
            f'{effective}<div class="qa-law-text">{"".join(paragraphs)}</div></div></details>')


def render(content, laws, current):
    questions = content['questions']
    numbers = [q['number'] for q in questions]
    if sorted(numbers) != list(range(1, len(questions) + 1)):
        raise ValueError('Question numbers must be unique and consecutive from 1.')
    categories = {c['id']: c for c in content['categories']}
    if any(q['category'] not in categories for q in questions):
        raise ValueError('Unknown category')
    groups = []
    for category in content['categories']:
        key = category['id']
        entries = sorted((q for q in questions if q['category'] == key), key=lambda q: q['number'])
        group = [f'<section class="qa-group" id="category-{key}" aria-labelledby="heading-{key}"><div class="qa-group-heading"><h2 id="heading-{key}">{escape(category["title"])}</h2><span class="qa-group-count">{len(entries)} 題</span></div>']
        for question in entries:
            n = question['number']
            law_ids = question.get('lawIds', [])
            badge = '<span class="qa-law-badge" aria-hidden="true">附條文全文</span>' if law_ids else ''
            references = ''.join(law_html(key, laws[key], n) for key in law_ids)
            group.append(f'<details class="qa-item" id="q{n}" data-category="{key}" data-keywords="{escape(question.get("keywords", ""), quote=True)}"><summary id="q{n}-summary"><span class="qa-number">Q{n}</span><span class="qa-question">{escape(question["title"])}</span>{badge}<span class="qa-toggle" aria-hidden="true"></span></summary><div class="qa-answer" aria-labelledby="q{n}-summary">{question["answerHtml"]}{references}<button type="button" class="qa-close-answer" data-close-question="q{n}">收合此題</button></div></details>')
        group.append('</section>')
        groups.append('\n'.join(group))
    block = START + '\n' + '\n'.join(groups) + '\n' + END + '\n'
    if START in current and END in current:
        current = re.sub(re.escape(START) + r'.*?' + re.escape(END) + r'\n?', lambda _: block, current, count=1, flags=re.S)
    else:
        first = current.index('<section class="qa-group"')
        last = current.index('        <div class="qa-empty"')
        current = current[:first] + block + current[last:]
    current = re.sub(r'資料更新：[^<]+', '資料更新：' + content['updatedDate'], current, count=1)
    current = re.sub(r'全部問題，共 \d+ 題', f'全部問題，共 {len(questions)} 題', current)
    counts = {'all':len(questions), **{key:sum(q['category']==key for q in questions) for key in categories}}
    for key, count in counts.items():
        pattern = r'(data-category-filter="' + re.escape(key) + r'"[^>]*>.*?<span class="qa-category-count">)\d+(</span>)'
        current = re.sub(pattern, lambda m: m[1]+str(count)+m[2], current, count=1)
    return current


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Fail when faq.html differs from its JSON sources.')
    args = parser.parse_args()
    content = json.loads((ROOT/'js/data/qa_content.json').read_text(encoding='utf-8'))
    laws = json.loads((ROOT/'js/data/qa_law_articles.json').read_text(encoding='utf-8'))
    target = ROOT/'faq.html'
    current = target.read_text(encoding='utf-8')
    result = render(content, laws, current)
    if args.check:
        if result != current:
            raise SystemExit('faq.html must be regenerated from its JSON sources.')
        print('FAQ content matches the JSON sources.')
    else:
        target.write_text(result, encoding='utf-8')
        print(f'Rendered {len(content["questions"])} questions to faq.html')
