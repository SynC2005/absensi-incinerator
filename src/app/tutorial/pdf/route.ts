import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const runtime = 'nodejs';

function getByteRange(rangeHeader: string | null, fileSize: number) {
  if (!rangeHeader?.startsWith('bytes=')) return null;

  const range = rangeHeader.replace('bytes=', '').split(',')[0];
  const [startText, endText] = range.split('-');

  if (!startText && !endText) return null;

  const isSuffixRange = startText === '' && endText !== '';
  const start = isSuffixRange ? fileSize - Number(endText) : Number(startText);
  const end = endText && !isSuffixRange ? Number(endText) : fileSize - 1;

  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end >= fileSize ||
    start > end
  ) {
    return null;
  }

  return { start, end };
}

export async function GET(request: Request) {
  const filePath = join(process.cwd(), 'public', 'manual_book', 'tutorial.pdf');
  const file = await readFile(filePath);
  const fileSize = file.byteLength;
  const byteRange = getByteRange(request.headers.get('range'), fileSize);
  const responseFile = byteRange
    ? file.subarray(byteRange.start, byteRange.end + 1)
    : file;
  const body = responseFile.buffer.slice(
    responseFile.byteOffset,
    responseFile.byteOffset + responseFile.byteLength
  ) as ArrayBuffer;

  return new Response(body, {
    status: byteRange ? 206 : 200,
    headers: {
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=0',
      'Content-Disposition': 'inline; filename="tutorial.pdf"',
      'Content-Length': String(responseFile.byteLength),
      ...(byteRange && {
        'Content-Range': `bytes ${byteRange.start}-${byteRange.end}/${fileSize}`,
      }),
      'Content-Type': 'application/pdf',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
