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
import re
import shutil
import subprocess
import sys
import tempfile
from urllib.parse import urlparse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8137
ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, 'data', 'projects.json')

# --- Local-repo resolution for the ?admin "open in cmux" button ----------------
# Clones live across two roots (the second is a partial migration). The git
# remote is the only reliable key, since project ids, repo names and folder
# names all diverge. Scanned per request (cheap; ~70 small file reads).
HOME = os.path.expanduser('~')
SEARCH_ROOTS = []
for _r in (os.path.join(HOME, 'Dev'), os.path.join(HOME, 'Documents', 'Dev')):
    if os.path.isdir(_r):
        _rp = os.path.realpath(_r)
        if _rp not in SEARCH_ROOTS:
            SEARCH_ROOTS.append(_rp)

CMUX_BIN = '/Applications/cmux.app/Contents/Resources/bin/cmux'
if not os.path.exists(CMUX_BIN):
    CMUX_BIN = shutil.which('cmux')

_ORIGIN_RE = re.compile(r'\[remote "origin"\][^\[]*?url\s*=\s*(\S+)')


def _normalize_remote(url):
    """github.com remote (https or ssh, optional .git) -> 'owner/repo' lowercased."""
    u = url.strip()
    if u.endswith('.git'):
        u = u[:-4]
    m = re.search(r'github\.com[:/]+([^/]+)/([^/]+)$', u)
    return (m.group(1) + '/' + m.group(2)).lower() if m else None


def scan_repos():
    """{ 'owner/repo': abspath, 'repo': abspath } for every clone under the roots."""
    out = {}
    for root in SEARCH_ROOTS:
        try:
            names = sorted(os.listdir(root))
        except OSError:
            continue
        for name in names:
            d = os.path.join(root, name)
            cfg = os.path.join(d, '.git', 'config')
            if not os.path.isfile(cfg):
                continue
            try:
                with open(cfg, encoding='utf-8', errors='ignore') as f:
                    m = _ORIGIN_RE.search(f.read())
            except OSError:
                continue
            slug = _normalize_remote(m.group(1)) if m else None
            if not slug:
                continue
            # First clone wins; ~/Dev is scanned before ~/Documents/Dev.
            out.setdefault(slug, d)
            out.setdefault(slug.split('/', 1)[1], d)
    return out


def derive_repo_from_url(url):
    """'<owner>/<repo>' from a *.github.io deploy URL, else None (custom domains)."""
    try:
        p = urlparse(url or '')
    except ValueError:
        return None
    host = (p.hostname or '').lower()
    if host.endswith('github.io'):
        owner = host.split('.')[0]
        segs = [s for s in p.path.split('/') if s]
        if owner and segs:
            return (owner + '/' + segs[0]).lower()
    return None


def resolve_project(project, repos):
    """(path, resolved). Falls back to the first search root when no clone matches."""
    key = (project.get('repo') or derive_repo_from_url(project.get('url', '')) or '').lower()
    if key:
        path = repos.get(key) or (repos.get(key.split('/', 1)[1]) if '/' in key else None)
        if path:
            return path, True
    return (SEARCH_ROOTS[0] if SEARCH_ROOTS else HOME), False


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

    def _body(self):
        n = int(self.headers.get('Content-Length', 0))
        return json.loads(self.rfile.read(n)) if n else {}

    def do_POST(self):
        route = self.path.split('?')[0]
        if route == '/api/save':
            self._handle_save()
        elif route == '/api/open':
            self._handle_open()
        else:
            self._json(404, {'ok': False, 'error': 'not found'})

    def _handle_save(self):
        try:
            payload = self._body()
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

    def _handle_open(self):
        """Resolve a project id -> its local clone and open it in cmux.

        Accepts ONLY an id; the path is resolved server-side and validated to be
        a real directory under a search root, so the page can never hand us an
        arbitrary path to open.
        """
        try:
            pid = (self._body() or {}).get('id')
            if not pid:
                raise ValueError('missing id')
            with open(DATA, encoding='utf-8') as f:
                data = json.load(f)
            project = next((p for p in data.get('projects', []) if p.get('id') == pid), None)
            if project is None:
                raise ValueError('unknown id: %s' % pid)
            path, resolved = resolve_project(project, scan_repos())
            path = os.path.realpath(path)
            if not os.path.isdir(path):
                raise ValueError('resolved path is not a directory: %s' % path)
            if not any(path == r or path.startswith(r + os.sep) for r in SEARCH_ROOTS):
                raise ValueError('path escapes search roots: %s' % path)
            repo = project.get('repo') or derive_repo_from_url(project.get('url', ''))
            if not CMUX_BIN:
                self._json(200, {'ok': False, 'path': path, 'resolved': resolved,
                                 'repo': repo, 'error': 'cmux CLI not found'})
                return
            # Run synchronously (argv list, no shell -> no injection) and capture
            # the result. cmux opens a workspace at the dir and prints
            # "OK workspace:N"; it returns near-instantly. Waiting lets us report
            # real success/failure instead of fire-and-forget.
            try:
                proc = subprocess.run([CMUX_BIN, path], capture_output=True,
                                      text=True, timeout=20)
            except subprocess.TimeoutExpired:
                self._json(200, {'ok': False, 'path': path, 'resolved': resolved,
                                 'repo': repo, 'error': 'cmux timed out'})
                return
            resp = {'ok': proc.returncode == 0, 'path': path, 'resolved': resolved,
                    'repo': repo, 'cmux': (proc.stdout or proc.stderr or '').strip()}
            if proc.returncode != 0:
                resp['error'] = (proc.stderr or proc.stdout or 'cmux failed').strip()
            self._json(200, resp)
        except Exception as e:  # noqa: BLE001
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
