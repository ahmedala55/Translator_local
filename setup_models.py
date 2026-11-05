"""Download only English/Arabic translation packages."""
import engine
from argostranslate import package

package.update_package_index()
available = package.get_available_packages()
installed = {(p.from_code, p.to_code) for p in package.get_installed_packages()}
for source, target in [('en', 'ar')]:
    if (source, target) not in installed:
        model = next(p for p in available if p.from_code == source and p.to_code == target)
        print(f'Downloading {source} -> {target}', flush=True)
        package.install_from_path(model.download())
print('Installed:', [(p.from_code, p.to_code) for p in package.get_installed_packages()], flush=True)
for text, source, target in [('Hello, how are you?', 'en', 'ar')]:
    print(f'{source} -> {target}: {engine.translate(text, source, target)}', flush=True)
