#!/usr/bin/env node
// Builds a Blogger (Blogspot) post snippet from a standalone HTML page.
// Usage: node blogger/build.js <source.html> <output.html> <embed-id> "<frame title>"
//
// The page is base64-encoded and loaded into an auto-sizing iframe (srcdoc), so:
//  - the blog theme's CSS cannot restyle the page and the page cannot restyle the blog;
//  - Blogger's editor cannot mangle it (the payload is plain [A-Za-z0-9+/=] on one line);
//  - "vh" sizes inside the page follow the reader's screen, not the iframe height.
const fs = require('fs');

const [src, out, id, title] = process.argv.slice(2);
if (!src || !out || !id || !title) {
  console.error('usage: node blogger/build.js <source.html> <output.html> <embed-id> "<frame title>"');
  process.exit(1);
}

let html = fs.readFileSync(src, 'utf8');
// --pvh = 1% of the reader's window height, set from the blog page (see fix() below).
const override = '<style>html{overflow:hidden}#stage{height:min(calc(var(--pvh,6px)*68),600px)!important}</style>';
if (!html.includes('</head>')) throw new Error('source has no </head>');
html = html.replace('</head>', override + '</head>');

const b64 = Buffer.from(html, 'utf8').toString('base64');
const loader = `(function(){
var host=document.getElementById(${JSON.stringify(id)});if(!host||host.getAttribute('data-ready'))return;host.setAttribute('data-ready','1');
var b=atob(${JSON.stringify(b64)}),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);
var html=new TextDecoder('utf-8').decode(u);
var f=document.createElement('iframe');f.title=${JSON.stringify(title)};f.setAttribute('scrolling','no');f.setAttribute('allowfullscreen','');
f.style.cssText='display:block;width:100%;height:1600px;border:0;overflow:hidden;background:transparent';
host.innerHTML='';host.appendChild(f);
function fix(){var d=f.contentDocument;if(!d||!d.body)return;
d.documentElement.style.setProperty('--pvh',(window.innerHeight/100)+'px');
var h=Math.ceil(d.body.getBoundingClientRect().height);if(h>0&&Math.abs(h-f.offsetHeight)>1)f.style.height=h+'px'}
f.addEventListener('load',function(){fix();var w=f.contentWindow;
if(w.ResizeObserver)new w.ResizeObserver(fix).observe(f.contentDocument.body);else setInterval(fix,1000)});
window.addEventListener('resize',fix);
f.srcdoc=html})();`.replace(/\n/g, '');

const snippet =
  `<div id="${id}" style="max-width:900px;margin:0 auto">` +
  `<noscript>આ મોડલ જોવા માટે બ્રાઉઝરમાં JavaScript ચાલુ કરો.</noscript></div>\n` +
  `<script>${loader}</script>\n`;

fs.writeFileSync(out, snippet);
console.log(`${out}: ${snippet.length} bytes`);
