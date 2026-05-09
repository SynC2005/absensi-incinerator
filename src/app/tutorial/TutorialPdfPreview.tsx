'use client';

import { useEffect, useRef } from 'react';
import { LoaderCircle } from 'lucide-react';

const pdfWorkerUrl = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

type TutorialPdfPreviewProps = {
  pdfUrl: string;
};

function setStatus(statusNode: HTMLDivElement | null, message: string) {
  if (statusNode) {
    statusNode.textContent = message;
  }
}

function appendFallback(
  hostNode: HTMLDivElement,
  pdfUrl: string,
  statusNode: HTMLDivElement | null
) {
  statusNode?.remove();
  hostNode.replaceChildren();

  const wrapper = document.createElement('div');
  wrapper.className =
    'flex min-h-full flex-col items-center justify-center gap-3 px-6 py-10 text-center text-slate-500';

  const title = document.createElement('p');
  title.className = 'text-sm font-bold';
  title.textContent = 'Pratinjau PDF gagal dimuat.';

  const link = document.createElement('a');
  link.href = pdfUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.className =
    'inline-flex items-center justify-center rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-900';
  link.textContent = 'Buka PDF';

  wrapper.append(title, link);
  hostNode.append(wrapper);
}

export default function TutorialPdfPreview({ pdfUrl }: TutorialPdfPreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let destroyDocument: (() => Promise<void>) | null = null;

    async function renderPdf() {
      const hostNode = hostRef.current;
      const statusNode = statusRef.current;

      if (!hostNode) return;

      hostNode.replaceChildren();
      setStatus(statusNode, 'Memuat pratinjau PDF...');

      try {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

        const loadingTask = pdfjs.getDocument({ url: pdfUrl });
        destroyDocument = () => loadingTask.destroy();

        const pdfDocument = await loadingTask.promise;

        for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
          if (cancelled) return;

          setStatus(
            statusNode,
            `Memuat halaman ${pageNumber}/${pdfDocument.numPages}...`
          );

          const page = await pdfDocument.getPage(pageNumber);
          if (cancelled) return;

          const baseViewport = page.getViewport({ scale: 1 });
          const pageWrapper = document.createElement('section');
          pageWrapper.className =
            'mx-auto mb-4 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-sm';

          const pageLabel = document.createElement('div');
          pageLabel.className =
            'pb-2 text-center text-[11px] font-bold text-slate-400';
          pageLabel.textContent = `Halaman ${pageNumber}`;

          const canvas = document.createElement('canvas');
          canvas.className = 'mx-auto block max-w-full rounded-xl bg-white';
          canvas.setAttribute('aria-label', `Halaman ${pageNumber}`);

          pageWrapper.append(pageLabel, canvas);
          hostNode.append(pageWrapper);

          const availableWidth = Math.max(
            240,
            Math.min(hostNode.clientWidth - 24, baseViewport.width)
          );
          const deviceScale = Math.min(window.devicePixelRatio || 1, 2);
          const cssScale = availableWidth / baseViewport.width;
          const viewport = page.getViewport({ scale: cssScale * deviceScale });

          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.style.width = `${Math.floor(viewport.width / deviceScale)}px`;
          canvas.style.height = `${Math.floor(viewport.height / deviceScale)}px`;

          await page.render({ canvas, viewport }).promise;
          page.cleanup();
        }

        statusNode?.remove();
      } catch (error) {
        console.error('Gagal memuat pratinjau PDF:', error);

        if (!cancelled) {
          appendFallback(hostNode, pdfUrl, statusNode);
        }
      }
    }

    void renderPdf();

    return () => {
      cancelled = true;
      void destroyDocument?.();
    };
  }, [pdfUrl]);

  return (
    <div className="h-full overflow-y-auto bg-slate-100 p-3">
      <div
        ref={statusRef}
        className="flex h-full min-h-64 flex-col items-center justify-center gap-3 text-center text-slate-500"
      >
        <LoaderCircle className="h-7 w-7 animate-spin text-emerald-700" />
        <span className="text-xs font-bold">Memuat pratinjau PDF...</span>
      </div>

      <div ref={hostRef} className="mx-auto max-w-full" />
    </div>
  );
}
