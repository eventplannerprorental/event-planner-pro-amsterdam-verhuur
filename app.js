/* =========================================================
   BNS DOCUMENT OUTPUT PATCH v3 - PDF download + mail + WhatsApp
   Doel: 1 generieke patch voor Tapwagen.nl, Amsterdam-verhuur en Rental.
   Werkt zonder klantnamen, Firebase of storage keys.

   Wat v2 toevoegt:
   - PDF downloaden als echt .pdf bestand via html2pdf.js CDN.
   - Fallback naar Print -> Opslaan als PDF als CDN/PDF-generator niet laadt.
   - Browser mag niet rechtstreeks op Bureaublad schrijven; download gaat naar de
     downloadmap van de gebruiker. Zet die map in browserinstellingen op Bureaublad
     als je hem daar direct wilt hebben.
   - Download HTML is vervangen door WhatsApp delen.
   ========================================================= */
(function DOCUMENT_OUTPUT_PATCH_V3(){
  'use strict';
  if(window.__DOCUMENT_OUTPUT_PATCH_V3__) return;
  window.__DOCUMENT_OUTPUT_PATCH_V3__ = true;

  function injectIntoHtml(html){
    html = String(html == null ? '' : html);
    if(!html || html.indexOf('__DOC_POPUP_HELPERS_V3__') >= 0 || html.indexOf('documentToolbarV3') >= 0) return html;
    var out = html;
    if(/<\/head>/i.test(out)) out = out.replace(/<\/head>/i, patchCss() + patchScript() + '</head>');
    else out = patchCss() + patchScript() + out;
    if(/<body([^>]*)>/i.test(out)) out = out.replace(/<body([^>]*)>/i, '<body$1>' + toolbarHtml());
    else out = toolbarHtml() + out;
    return out;
  }

  function patchCss(){
    return ''+
      '<style id="documentOutputPatchCssV3">'+
      '.doc-toolbar{position:sticky;top:0;z-index:2147483647;background:#0f172a;color:#fff;padding:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-family:Arial,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.25)}'+
      '.doc-toolbar button{border:0;border-radius:9px;padding:10px 13px;font-weight:900;cursor:pointer;background:#2563eb;color:white;font-size:14px}'+
      '.doc-toolbar button.green{background:#16a34a}.doc-toolbar button.orange{background:#f97316}.doc-toolbar button.grey{background:#64748b}.doc-toolbar button.red{background:#dc2626}'+
      '.doc-toolbar .hint{font-size:12px;opacity:.9;margin-left:auto}'+
      '.doc-pdf-note{font-size:11px;opacity:.85}'+
      'body>.actions:not(.doc-toolbar){display:none!important}'+
      '@media print{.doc-toolbar,body>.actions{display:none!important}body{background:white!important}.page,main{box-shadow:none!important}}'+
      '</style>';
  }

  function patchScript(){
    return ''+
      '<script id="documentOutputPatchScriptV3">(function(){'+
      'if(window.__DOC_POPUP_HELPERS_V3__)return;window.__DOC_POPUP_HELPERS_V3__=true;'+
      'var PDF_CDN="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";'+
      'function safeName(v){return String(v||"document").replace(/[^a-z0-9\\-_. ]/gi,"_").replace(/\\s+/g,"_").slice(0,80)||"document"}'+
      'function cleanClone(){var c=document.documentElement.cloneNode(true);c.querySelectorAll(".doc-toolbar,body>.actions,script#documentOutputPatchScriptV3,style#documentOutputPatchCssV3").forEach(function(e){e.remove()});return c}'+
      'function htmlBody(){var c=cleanClone();return "<!doctype html>\\n"+c.outerHTML}'+
      'function textBody(){var c=cleanClone();return (c.querySelector("main,.page,body")||c).innerText||document.body.innerText||""}'+
      'function mainEl(){return document.querySelector("main,.page,.invoice-preview,.document,.doc,body")||document.body}'+
      'function downloadBlob(name,type,content){var blob=new Blob([content],{type:type});var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},1000)}'+
      'function loadPdfLib(cb){if(window.html2pdf)return cb(true);var s=document.createElement("script");s.src=PDF_CDN;s.async=true;s.onload=function(){cb(!!window.html2pdf)};s.onerror=function(){cb(false)};document.head.appendChild(s)}'+
      'function mailSubject(){return document.title||"Document"}'+
      'function filename(){return safeName(mailSubject())+".pdf"}'+
      'window.docPrintPdf=function(){alert("Kies in het printervenster bij Bestemming/Printer: Opslaan als PDF.");setTimeout(function(){try{window.print()}catch(e){alert("Printvenster kon niet openen: "+e.message)}},80)};'+
      'window.docDownloadPdf=function(){var note=document.getElementById("pdfNoteV3");if(note)note.textContent="PDF wordt gemaakt...";loadPdfLib(function(ok){if(!ok||!window.html2pdf){if(note)note.textContent="PDF-generator niet geladen; gebruik Print PDF.";window.docPrintPdf();return}try{var el=mainEl();var opt={margin:[8,8,8,8],filename:filename(),image:{type:"jpeg",quality:0.98},html2canvas:{scale:2,useCORS:true,backgroundColor:"#ffffff",scrollX:0,scrollY:0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:["css","legacy"]}};window.html2pdf().set(opt).from(el).save().then(function(){if(note)note.textContent="PDF gedownload. Staat in je downloadmap."}).catch(function(err){if(note)note.textContent="PDF maken mislukt; gebruik Print PDF.";alert("PDF maken mislukt: "+(err&&err.message?err.message:err));});}catch(e){if(note)note.textContent="PDF maken mislukt; gebruik Print PDF.";alert("PDF maken mislukt: "+e.message)}})};'+
      'window.docDownloadHtml=function(){downloadBlob(safeName(mailSubject())+".html","text/html;charset=utf-8",htmlBody())};'+
      'window.docCopyText=function(){var t=textBody();if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){alert("Documenttekst gekopieerd.")}).catch(function(){prompt("Kopieer de tekst:",t)})}else{prompt("Kopieer de tekst:",t)}};'+
      'window.docDownloadEml=function(){var subj=mailSubject();var html=htmlBody();var eml="To: \\r\\nSubject: =?UTF-8?B?"+btoa(unescape(encodeURIComponent(subj)))+"?=\\r\\nMIME-Version: 1.0\\r\\nContent-Type: text/html; charset=UTF-8\\r\\nContent-Transfer-Encoding: 8bit\\r\\n\\r\\n"+html;downloadBlob(safeName(subj)+".eml","message/rfc822;charset=utf-8",eml);};'+
      'window.docMail=function(){var subj=mailSubject();var txt=textBody();var url="mailto:?subject="+encodeURIComponent(subj)+"&body="+encodeURIComponent(txt);if(url.length<1800){location.href=url}else{window.docDownloadEml();alert("De e-mailtekst is te groot voor mailto. Er is daarom een .eml mailbestand gedownload. Open dat bestand om te mailen, of gebruik Kopieer tekst.")}};'+
      'window.docWhatsApp=function(){var subj=mailSubject();var txt=textBody();var msg=subj+"\n\n"+txt;var url="https://wa.me/?text="+encodeURIComponent(msg);if(msg.length>4500){window.docCopyText();alert("De tekst is te lang voor WhatsApp. De tekst is gekopieerd; plak hem zelf in WhatsApp.");return}window.open(url,"_blank")};'+
      '})();<\/script>';
  }

  function toolbarHtml(){
    return ''+
      '<div class="actions doc-toolbar" id="documentToolbarV3">'+
        '<button type="button" class="green" onclick="docDownloadPdf()">PDF downloaden</button>'+        
        '<button type="button" onclick="docPrintPdf()">Print / PDF</button>'+        
        '<button type="button" class="orange" onclick="docMail()">Mail</button>'+        
        '<button type="button" class="green" onclick="docWhatsApp()">WhatsApp</button>'+        
        '<button type="button" class="grey" onclick="docDownloadEml()">Download mailbestand</button>'+        
        '<button type="button" class="grey" onclick="docCopyText()">Kopieer tekst</button>'+        
        '<button type="button" class="red" onclick="try{window.close()}catch(e){}">Sluiten</button>'+        
        '<span class="hint">Powered by Tapwagen.nl <span class="doc-pdf-note" id="pdfNoteV3"></span></span>'+        
      '</div>';
  }

  function patchDocObject(doc){
    if(!doc || doc.__bnsDocumentOutputPatchedV2) return;
    doc.__bnsDocumentOutputPatchedV2 = true;
    var oldWrite = doc.write;
    var oldWriteln = doc.writeln;
    doc.write = function(){
      var args = Array.prototype.slice.call(arguments).map(function(a){
        var s = String(a == null ? '' : a);
        if(/<html|<body|<main|class=["']page|FACTUUR|OPDRACHT|Offerte|Opdracht/i.test(s)) return injectIntoHtml(s);
        return a;
      });
      return oldWrite.apply(doc,args);
    };
    doc.writeln = function(){
      var args = Array.prototype.slice.call(arguments).map(function(a){
        var s = String(a == null ? '' : a);
        if(/<html|<body|<main|class=["']page|FACTUUR|OPDRACHT|Offerte|Opdracht/i.test(s)) return injectIntoHtml(s);
        return a;
      });
      return oldWriteln.apply(doc,args);
    };
  }

  var oldOpen = window.open;
  window.open = function(){
    var w = oldOpen.apply(window, arguments);
    try{ if(w && w.document) patchDocObject(w.document); }catch(e){}
    return w;
  };

  function patchVisibleDocument(){
    try{
      if(!document.body || document.getElementById('documentToolbarV3')) return;
      var isDoc = /factuur|opdracht|offerte|opdrachtbevestiging/i.test(document.title || '') || document.querySelector('.page .doc-title, main.page, .invoice-preview');
      if(!isDoc) return;
      if(!document.getElementById('documentOutputPatchCssV3')) document.head.insertAdjacentHTML('beforeend', patchCss() + patchScript());
      document.body.insertAdjacentHTML('afterbegin', toolbarHtml());
    }catch(e){}
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patchVisibleDocument);
  else setTimeout(patchVisibleDocument, 50);

  console.info('[Document output patch v3] PDF, mail en WhatsApp actief.');
})();
