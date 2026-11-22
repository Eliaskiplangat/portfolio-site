'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '0.0.0.0';
const resumeName = 'Elias_Kiplangat_Resume.pdf';
const resumePath = path.join(root, resumeName);
const maxUploadBytes = 10 * 1024 * 1024;
const adminToken = process.env.ADMIN_TOKEN || '';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.pdf': 'application/pdf', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml'
};

function sendJson(response, status, data) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(data));
}

function authorized(request) {
  if (!adminToken) return true;
  const authorization = request.headers.authorization || '';
  return authorization === `Bearer ${adminToken}`;
}

function collectBody(request, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('The upload exceeds the 10 MB limit.'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => resolve(Buffer.concat(chunks)));
    request.on('error', reject);
  });
}

async function handleResumeUpload(request, response) {
  if (!authorized(request)) {
    sendJson(response, 401, { error: 'Admin authentication required.' });
    return;
  }

  const contentType = request.headers['content-type'] || '';
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!contentType.startsWith('multipart/form-data') || !boundaryMatch) {
    sendJson(response, 400, { error: 'A PDF multipart upload is required.' });
    return;
  }

  try {
    const body = await collectBody(request, maxUploadBytes + 128 * 1024);
    const boundary = Buffer.from('--' + (boundaryMatch[1] || boundaryMatch[2]).trim());
    const first = body.indexOf(boundary);
    if (first < 0) throw new Error('Invalid upload payload.');

    let start = body.indexOf(Buffer.from('\r\n\r\n'), first);
    if (start < 0) throw new Error('Invalid upload payload.');
    start += 4;

    const end = body.indexOf(Buffer.concat([Buffer.from('\r\n'), boundary]), start);
    if (end < 0) throw new Error('Invalid upload payload.');

    const pdf = body.subarray(start, end);
    if (pdf.length > maxUploadBytes) throw new Error('The resume must be 10 MB or smaller.');
    if (pdf.length < 5 || pdf.subarray(0, 5).toString('ascii') !== '%PDF-') {
      throw new Error('The selected file is not a valid PDF.');
    }

    const temporary = resumePath + '.tmp';
    fs.writeFileSync(temporary, pdf);
    fs.renameSync(temporary, resumePath);
    sendJson(response, 200, { ok: true, resume: '/' + resumeName });
  } catch (error) {
    sendJson(response, 400, { error: error.message || 'Could not upload resume.' });
  }
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'POST' && request.url === '/api/resume') {
    await handleResumeUpload(request, response);
    return;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    sendJson(response, 405, { error: 'Method not allowed.' });
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch (_error) {
    response.writeHead(400);
    response.end('Bad request');
    return;
  }

  const requestedPath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(root, requestedPath);
  if (filePath !== root && !filePath.startsWith(root + path.sep)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      'Content-Type': mimeTypes[extension] || 'application/octet-stream',
      'Cache-Control': extension === '.pdf' ? 'no-store' : 'public, max-age=3600'
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    fs.createReadStream(filePath).pipe(response);
  });
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. The portfolio may already be running at http://localhost:${port}.`);
    process.exitCode = 1;
    return;
  }

  console.error('Portfolio server failed:', error);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`Portfolio running at http://localhost:${port}`);
  console.log(adminToken ? 'Resume uploads require ADMIN_TOKEN.' : 'Resume uploads are currently open. Set ADMIN_TOKEN for protection.');
});
