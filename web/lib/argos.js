import { spawn } from 'node:child_process';
import path from 'node:path';
import readline from 'node:readline';

const key = Symbol.for('alwafi.argos');
function getWorker() {
  if (globalThis[key]) return globalThis[key];
  const root = path.resolve(process.cwd(), '..');
  const python = process.env.ARGOS_PYTHON || path.join(root, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
  const child = spawn(python, ['-u', path.join(root, 'translation_worker.py')], { cwd: root, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
  const state = { child, pending: new Map(), counter: 0 };
  globalThis[key] = state;
  const fail = () => {
    for (const p of state.pending.values()) { clearTimeout(p.timer); p.reject(new Error('Engine unavailable')); }
    state.pending.clear();
    if (globalThis[key] === state) delete globalThis[key];
  };
  child.on('error', fail);
  child.on('exit', fail);
  child.stdin.on('error', fail);
  child.stderr.on('data', data => console.error('[Argos]', data.toString()));
  readline.createInterface({ input: child.stdout }).on('line', line => {
    let result;
    try { result = JSON.parse(line); } catch { return; }
    const pending = state.pending.get(result.id);
    if (!pending) return;
    state.pending.delete(result.id);
    clearTimeout(pending.timer);
    if (result.error) pending.reject(new Error(result.error));
    else pending.resolve(result.translation);
  });
  return state;
}

export async function translate(text, source, target) {
  if (process.env.ARGOS_API_URL) {
    const response = await fetch(process.env.ARGOS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.ARGOS_API_KEY || ''}` },
      body: JSON.stringify({ text, source, target }),
      signal: AbortSignal.timeout(110000),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Remote translation failed');
    const result = await response.json();
    if (typeof result.translation !== 'string') throw new Error('Invalid translation response');
    return result.translation;
  }
  if (process.env.VERCEL && process.env.ARGOS_LOCAL_ENGINE !== '1') throw new Error('Configure ARGOS_API_URL or use the Argos container');
  const state = getWorker();
  if (state.pending.size >= 8) return Promise.reject(new Error('Engine busy'));
  return new Promise((resolve, reject) => {
    const id = ++state.counter;
    const timer = setTimeout(() => { state.child.kill(); }, 120000);
    state.pending.set(id, { resolve, reject, timer });
    state.child.stdin.write(JSON.stringify({ id, text, source, target }) + '\n');
  });
}
