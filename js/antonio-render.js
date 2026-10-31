/* Markdown sanitizado y LaTeX. Dependencias locales en vendor/. */
(function () {
  'use strict';
  const allowedTags = ['p','br','strong','em','del','ul','ol','li','blockquote',
    'pre','code','h1','h2','h3','h4','h5','h6','hr','table','thead','tbody','tr','th','td','a','span'];
  function render(target, value) {
    const source = String(value == null ? '' : value);
    target.classList.add('antonio-contenido');
    target.textContent = source;
    if (!window.marked || !window.DOMPurify || !window.katex) return;
    try {
      const formulas = [];
      const prefix = 'math-' + Math.random().toString(36).slice(2) + '-';
      function token(src, block) {
        const re = block ? /^(?:\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\])(?:\n|$)/ : /^(?:\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([^\n]+?)\\\)|\$(?!\s)([^\n$]+?)\$(?!\d))/;
        const match = re.exec(src);
        if (!match) return;
        return {type: block ? 'mathBlock' : 'mathInline', raw:match[0],
          text:match[1] || match[2] || match[3] || match[4], display:!!(match[1] || match[2])};
      }
      function placeholder(t) {
        const id = prefix + formulas.length;
        formulas.push({id, text:t.text, display:t.display});
        return '<span data-antonio-math="' + id + '"></span>';
      }
      const parser = new marked.Marked({gfm:true, breaks:true});
      parser.use({extensions:[
        {name:'mathBlock', level:'block', start:src=>src.search(/\$\$|\\\[/), tokenizer:src=>token(src,true), renderer:placeholder},
        {name:'mathInline', level:'inline', start:src=>src.search(/\$|\\[([]/), tokenizer:src=>token(src,false), renderer:placeholder}
      ]});
      // Normalize emphasis only in prose. Block code is never visited here;
      // inline code, raw HTML and math are protected before unescaping stars.
      function normalizeInline(text) {
        const protectedParts = [];
        const marker = 'ANTONIOPROTECTED' + Math.random().toString(36).slice(2) + 'X';
        const inline = parser.Lexer.lexInline(text, parser.defaults);
        parser.walkTokens(inline, t => {
          if (['codespan','mathInline','html'].includes(t.type)) protectedParts.push(t.raw);
        });
        let normalized = text;
        protectedParts.forEach((raw, i) => { normalized = normalized.replace(raw, marker + i + 'Z'); });
        normalized = normalized.replace(/\\\*/g, '*');
        protectedParts.forEach((raw, i) => { normalized = normalized.replace(marker + i + 'Z', () => raw); });
        return parser.Lexer.lexInline(normalized, parser.defaults);
      }
      const tokens = parser.lexer(source);
      parser.walkTokens(tokens, t => {
        if (['paragraph','heading','text'].includes(t.type) && t.tokens) {
          t.tokens = normalizeInline(t.text);
        }
        if (t.type === 'table') {
          [...t.header, ...t.rows.flat()].forEach(cell => {cell.tokens = normalizeInline(cell.text);});
        }
      });
      const clean = DOMPurify.sanitize(parser.parser(tokens), {
        ALLOWED_TAGS:allowedTags, ALLOWED_ATTR:['href','title','start','data-antonio-math'],
        ALLOW_DATA_ATTR:false, ALLOW_ARIA_ATTR:false, RETURN_DOM_FRAGMENT:true
      });
      // Restrict links even further: no scripts, data URLs or unexpected protocols.
      clean.querySelectorAll('a').forEach(a=>{
        const href = a.getAttribute('href');
        if (href && !/^(https?:\/\/|mailto:|#)/i.test(href)) a.removeAttribute('href');
        a.setAttribute('rel','noopener noreferrer');
      });
      // Only KaTeX's own output is inserted after sanitization; no trusted HTML commands.
      formulas.forEach(f=>{
        const slot = clean.querySelector('[data-antonio-math="'+f.id+'"]');
        if (!slot) return;
        slot.removeAttribute('data-antonio-math');
        katex.render(f.text,slot,{displayMode:f.display,throwOnError:false,trust:false,
          strict:'warn',maxExpand:200,maxSize:20,output:'htmlAndMathml'});
      });
      target.replaceChildren(clean);
      target.classList.add('antonio-renderizado');
    } catch (_) {
      target.textContent = source; // Safe, readable fallback if parsing fails.
      target.classList.remove('antonio-renderizado');
    }
  }
  window.AntonioRender = {render};
})();
