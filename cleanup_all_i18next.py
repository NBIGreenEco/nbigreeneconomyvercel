#!/usr/bin/env python3
"""
Simple, safe script to remove all i18next code from files.
Focus on complete removal without breaking file structure.
"""
import os
import re
import glob

def remove_i18next_blocks(content):
    """Remove i18next initialization blocks"""
    # Pattern 1: i18next.use().use().init({...}, (err, t) => {...});
    content = re.sub(
        r'//\s*Initialize i18next\s*\n\s*i18next\.use\(\)\.use\(\)\s*\n\s*\.init\(\{[^}]*(?:\{[^}]*\}[^}]*)*\},\s*\(err[^;]*?\)\s*\};?\s*',
        '// Initialize page\nfinalizeLoading();\n',
        content,
        flags=re.DOTALL | re.MULTILINE
    )
    
    # Pattern 2: Single line i18next.use().use().init
    content = re.sub(
        r'i18next\.use\(\)\.use\(\)\s*\.init\([^)]*\),?\s*',
        '',
        content,
        flags=re.DOTALL
    )
    
    return content

def remove_data_i18n(content):
    """Remove data-i18n attributes"""
    content = re.sub(r'\s*setAttribute\(["\']data-i18n["\'],[^)]*\);?\s*', '', content)
    return content

def remove_i18next_calls(content):
    """Remove i18next.t() and other i18next calls"""
    # i18next.t(...) calls
    content = re.sub(
        r'i18next\.t\(["\']([^"\']*)["\'][^)]*\)',
        r"'\1'",
        content
    )
    
    # i18next.language
    content = re.sub(r'i18next\.language', "'en'", content)
    
    # i18next.isInitialized
    content = re.sub(r'i18next\.isInitialized', 'true', content)
    
    # i18next.on/changeLanguage
    content = re.sub(r'i18next\.(on|changeLanguage|loadResources|addResourceBundle)\([^)]*\);?', '', content)
    
    return content

def clean_file(filepath):
    """Clean a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        
        original_size = len(content)
        
        # Apply removals
        content = remove_i18next_blocks(content)
        content = remove_data_i18n(content)
        content = remove_i18next_calls(content)
        
        # Save if changed
        if len(content) != original_size:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"❌ Error processing {filepath}: {e}")
        return None

def main():
    """Main cleanup function"""
    print("=" * 60)
    print("REMOVING ALL i18next CODE FROM CODEBASE")
    print("=" * 60)
    
    # Target files with i18next
    target_patterns = [
        'ADMIN/*.html',
        'Dashboard/*.html',
        'LandingPage/**/*.html',
        'scripts/*.js',
        'demo/js/*.js',
        'encodingdecoding/*.html',
        '*.js',
        '*.html'
    ]
    
    changed_files = []
    unchanged_files = []
    error_files = []
    
    for pattern in target_patterns:
        for filepath in glob.glob(pattern, recursive=True):
            # Skip cleanup scripts
            if 'cleanup' in filepath or '.git' in filepath:
                continue
            
            result = clean_file(filepath)
            if result is None:
                error_files.append(filepath)
            elif result:
                changed_files.append(filepath)
                print(f"✏️  CLEANED: {filepath}")
            else:
                # Check if it still has i18next references
                with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
                    if 'i18next' in f.read():
                        unchanged_files.append(filepath)
    
    # Final report
    print("\n" + "=" * 60)
    print("CLEANUP REPORT")
    print("=" * 60)
    print(f"✏️  CLEANED: {len(changed_files)} files")
    for f in changed_files:
        print(f"   - {f}")
    
    if unchanged_files:
        print(f"\n⚠️  STILL CONTAINS i18next: {len(unchanged_files)} files")
        for f in unchanged_files:
            print(f"   - {f}")
    
    if error_files:
        print(f"\n❌ ERRORS: {len(error_files)} files")
        for f in error_files:
            print(f"   - {f}")
    
    print(f"\n📊 Total changed: {len(changed_files)}")

if __name__ == '__main__':
    main()
