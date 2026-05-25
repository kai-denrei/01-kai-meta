#!/usr/bin/env python3
"""Local dev server for the kai-denrei catalog admin.

Serves the static site AND accepts POST /api/save to write data/projects.json,
so the ?admin editor can auto-save completion / category edits straight to disk.
Bound to localhost only. On GitHub Pages (no server) the editor degrades
gracefully to localStorage + the Export button.

    python3 serve.py [port]      # default 8137
"""
import http.server
import json
import os
import sys
import tempfile

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8137
ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, 'data', 'projects.json')


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def _json(self, code, obj):
        body = json.dumps(obj).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path.split('?')[0] != '/api/save':
            self._json(404, {'ok': False, 'error': 'not found'})
            return
        try:
            n = int(self.headers.get('Content-Length', 0))
            payload = json.loads(self.rfile.read(n))
            if (not isinstance(payload, dict)
                    or not isinstance(payload.get('projects'), list)
                    or not isinstance(payload.get('categories'), list)):
                raise ValueError('expected {categories: [...], projects: [...]}')
            # Atomic write so a crash never truncates the data file.
            os.makedirs(os.path.dirname(DATA), exist_ok=True)
            fd, tmp = tempfile.mkstemp(dir=os.path.dirname(DATA), suffix='.tmp')
            with os.fdopen(fd, 'w', encoding='utf-8') as f:
                json.dump(payload, f, ensure_ascii=False, indent=2)
                f.write('\n')
            os.replace(tmp, DATA)
            self._json(200, {'ok': True, 'count': len(payload['projects'])})
        except Exception as e:  # noqa: BLE001 - report any failure to the client
            self._json(400, {'ok': False, 'error': str(e)})

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, *a):
        pass  # quiet


if __name__ == '__main__':
    # ThreadingHTTPServer so the browser's parallel asset requests don't block.
    http.server.ThreadingHTTPServer.allow_reuse_address = True
    with http.server.ThreadingHTTPServer(('127.0.0.1', PORT), Handler) as httpd:
        print('kai-meta dev server  http://127.0.0.1:%d  (POST /api/save -> data/projects.json)' % PORT)
        httpd.serve_forever()
