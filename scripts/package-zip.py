#!/usr/bin/env python3
import os
import zipfile

def create_project_zip():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    output_zip = os.path.join(base_dir, 'public', 'koperasi-hws-aplikasi-lengkap.zip')
    
    os.makedirs(os.path.dirname(output_zip), exist_ok=True)
    if os.path.exists(output_zip):
        os.remove(output_zip)

    exclude_dirs = {
        'node_modules', 
        'dist', 
        'dev-dist', 
        '.git', 
        '.npm', 
        '__pycache__', 
        '.aistudio',
        '.cache',
        'tmp'
    }
    
    exclude_files = {
        'koperasi-hws-aplikasi-lengkap.zip',
        '.DS_Store',
        'package-lock.json.bak'
    }

    print(f"Creating ZIP archive from {base_dir}...")
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for root, dirs, files in os.walk(base_dir):
            # Prune excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
            
            for file in files:
                if file in exclude_files or file.endswith('.pyc') or file.startswith('.'):
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, base_dir)
                
                # Exclude root zip if located anywhere in the tree
                if file == 'koperasi-hws-aplikasi-lengkap.zip':
                    continue

                archive_path = os.path.join('koperasi-hws-app', rel_path)
                zf.write(full_path, arcname=archive_path)

    size_kb = os.path.getsize(output_zip) / 1024
    print(f"Archive generated successfully: {output_zip} ({size_kb:.2f} KB)")

if __name__ == '__main__':
    create_project_zip()
