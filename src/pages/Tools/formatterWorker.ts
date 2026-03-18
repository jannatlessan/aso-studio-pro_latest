self.onmessage = async function(e: MessageEvent) {
  try {
    if (e.data.type === 'format-text') {
      const parsed = JSON.parse(e.data.text);
      const formatted = JSON.stringify(parsed, null, e.data.indentSize);
      if (formatted.length > 500000) {
        const blob = new Blob([formatted], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const preview = formatted.slice(0, 50000);
        self.postMessage({ success: true, isLarge: true, url, preview });
      } else {
        self.postMessage({ success: true, isLarge: false, formatted });
      }
    } else if (e.data.type === 'format-file') {
      const file = e.data.file;
      
      if (file.size < 20 * 1024 * 1024) {
        let text = await file.text();
        const parsed = JSON.parse(text);
        text = ""; // Free memory
        const formatted = JSON.stringify(parsed, null, e.data.indentSize);
        const blob = new Blob([formatted], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const preview = formatted.slice(0, 50000);
        self.postMessage({ success: true, isLarge: true, url, preview });
        return;
      }
      
      const stream = file.stream();
      // @ts-ignore - TS might miss stream on File
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      const indentBytes = " ".repeat(e.data.indentSize);
      
      let inString = false;
      let isEscaped = false;
      let indentLevel = 0;
      
      const chunks: (string | Blob)[] = [];
      let currentChunk = "";
      let preview = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value, { stream: true });
        
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          
          if (inString) {
             currentChunk += char;
             if (char === '\\\\' && !isEscaped) {
               isEscaped = true;
             } else {
               if (char === '"' && !isEscaped) inString = false;
               if (isEscaped) isEscaped = false;
             }
             continue;
          }
          
          if (char === '"') {
            inString = true;
            currentChunk += char;
            continue;
          }
          
          if (char === ' ' || char === '\\n' || char === '\\r' || char === '\\t') {
            continue;
          }
          
          if (char === '{' || char === '[') {
            indentLevel++;
            currentChunk += char + '\\n' + indentBytes.repeat(indentLevel);
          } else if (char === '}' || char === ']') {
            indentLevel = Math.max(0, indentLevel - 1);
            currentChunk += '\\n' + indentBytes.repeat(indentLevel) + char;
          } else if (char === ',') {
            currentChunk += char + '\\n' + indentBytes.repeat(indentLevel);
          } else if (char === ':') {
            currentChunk += ': ';
          } else {
            currentChunk += char;
          }
          
          if (currentChunk.length > 500000) {
            if (preview.length < 50000) preview += currentChunk;
            chunks.push(currentChunk);
            currentChunk = "";
            
            if (chunks.length > 100) {
               const intermediateBlob = new Blob(chunks as any);
               chunks.length = 0;
               chunks.push(intermediateBlob);
            }
          }
        }
      }
      
      if (currentChunk.length > 0) {
        if (preview.length < 50000) preview += currentChunk;
        chunks.push(currentChunk);
      }
      
      const finalBlob = new Blob(chunks as any, { type: 'application/json' });
      const url = URL.createObjectURL(finalBlob);
      self.postMessage({ success: true, isLarge: true, url, preview: preview.slice(0, 50000) });
    }
  } catch (err: any) {
    self.postMessage({ success: false, error: err.message || 'Error parsing large JSON file.' });
  }
};
