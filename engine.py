"""Local English/Arabic Argos engine and command-line entry point."""
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent
os.environ['XDG_DATA_HOME'] = str(ROOT / 'data')
os.environ['XDG_CACHE_HOME'] = str(ROOT / 'cache')
os.environ['XDG_CONFIG_HOME'] = str(ROOT / 'config')
os.environ['ARGOS_PACKAGES_DIR'] = str(ROOT / 'models')
os.environ['ARGOS_CHUNK_TYPE'] = 'MINISBD'


def translate(text: str, source: str = 'en', target: str = 'ar') -> str:
    if (source, target) != ('en', 'ar'):
        raise ValueError('Only en -> ar is supported')
    from argostranslate.translate import translate as argos_translate
    return argos_translate(text, source, target)


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('text')
    parser.add_argument('--source', choices=['en'], default='en')
    args = parser.parse_args()
    print(translate(args.text, args.source, 'ar'))
