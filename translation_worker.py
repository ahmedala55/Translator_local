"""Persistent JSON-lines bridge used by the Node.js server."""
import json
import sys
import engine

sys.stdin.reconfigure(encoding='utf-8')
sys.stdout.reconfigure(encoding='utf-8')
for line in sys.stdin:
    try:
        request = json.loads(line)
        result = engine.translate(request['text'], request['source'], request['target'])
        response = {'id': request['id'], 'translation': result}
    except Exception as exc:
        print(str(exc), file=sys.stderr, flush=True)
        response = {'id': request.get('id'), 'error': 'Translation failed'}
    print(json.dumps(response, ensure_ascii=False), flush=True)
