import createDOMPurify from 'dompurify';

let dompurifyInstance: ReturnType<typeof createDOMPurify> | null = null;

function getDOMPurify() {
  if (dompurifyInstance) return dompurifyInstance;

  if (typeof window === 'undefined') {
    return null;
  }

  dompurifyInstance = createDOMPurify(window);
  return dompurifyInstance;
}

export function sanitizeHtml(dirtyHtml: string): string {
  const DOMPurify = getDOMPurify();

  if (!DOMPurify) {
    return dirtyHtml;
  }

  return DOMPurify.sanitize(dirtyHtml, {
    USE_PROFILES: { html: true },
  });
}
