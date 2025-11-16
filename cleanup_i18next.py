#!/usr/bin/env python3
import os
import re
from pathlib import Path

# Root directory
root = Path(r"c:\Users\user\Pictures\nbigreeneconomyvercel")

# i18next pattern to remove: the entire .use().use().init({...}, callback) block
i18next_init_pattern = re.compile(
    r'//\s*Initialize i18next\s*\n\s*i18next\.use\(\)\.use\(\)\s*\n\s*\.init\(\{[^}]*(?:\{[^}]*\}[^}]*)*\}[^)]*\)\s*[,;]\s*(?:\(err[^}]*?\{[^}]*?\}(?:\s*\})+)?',
    re.DOTALL | re.MULTILINE
)

# Simpler pattern for just the i18next block
simpler_pattern = re.compile(
    r'i18next\.use\(\)\.use\(\)\s*\.init\(\{[\s\S]*?\}, \(err',
    re.MULTILINE
)

# Pattern for i18next.t() calls
i18next_t_pattern = re.compile(r"i18next\.t\(['\"]([^'\"]*)['\"][^)]*\)", re.MULTILINE)

files_to_clean = [
    "LandingPage/Opportunities/opportunities.html",
    "LandingPage/IRM-Sector/IRMSector.html",
    "LandingPage/Knowledge-Hub/knowledge-hub.html",
    "LandingPage/About Page/about.html",
    "LandingPage/SignInAndSignUp/verifycode.html",
    "LandingPage/legal/Legal.html",
    "encodingdecoding/restored.html",
    "Funding Hub/Funding-Hub.html",
    "Dashboard/dashboard.html",
    "ADMIN/TranslationManager.html",
    "ADMIN/managefunding.html",
    "ADMIN/managenews.html",
    "ADMIN/ManageOpprtunities.html",
    "ADMIN/database.html",
    "ADMIN/analytics.html",
    "ADMIN/admin-dashboard.html",
    "scripts/Trans.js",
    "demo/js/main.js",
]

print("=" * 80)
print("I18NEXT CLEANUP REPORT")
print("=" * 80)

for rel_path in files_to_clean:
    full_path = root / rel_path
    if not full_path.exists():
        print(f"❌ NOT FOUND: {rel_path}")
        continue
    
    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Count matches
        init_matches = len(re.findall(r'i18next\.use\(\)', content))
        t_matches = len(re.findall(r'i18next\.t\(', content))
        
        if init_matches == 0 and t_matches == 0:
            print(f"✅ CLEAN: {rel_path} (no i18next found)")
            continue
        
        # Replace i18next.t() calls with their defaults
        content = re.sub(
            r"i18next\.t\(['\"]([^'\"]*)['\"],\s*\{?\s*defaultValue:\s*['\"]([^'\"]*)['\"]",
            r"'\2'",
            content
        )
        
        # Simple fallback for remaining i18next.t() 
        content = re.sub(r"i18next\.t\(['\"]([^'\"]*)['\"][^)]*\)", r"'Text: \1'", content)
        
        # Remove i18next variable references (e.g., i18next.language, i18next.isInitialized)
        content = re.sub(r"i18next\.(language|isInitialized|on\([^)]*\)|loadResources\([^)]*\)|addResourceBundle\([^)]*\))", "", content)
        
        # Remove entire i18next.use().use().init() blocks
        content = re.sub(
            r"//\s*Initialize i18next\s*\n\s*i18next\.use\(\)\.use\(\)\s*\n\s*\.init\(\{[^}]*(?:\{[^}]*\}[^}]*)*\},\s*\(err[^}]*\}\s*\}\s*\);",
            "// Initialization moved to finalizeLoading();\nfinalizeLoading();",
            content,
            flags=re.DOTALL
        )
        
        if content != original_content:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✏️  CLEANED: {rel_path} (init: {init_matches}, t(): {t_matches})")
        else:
            print(f"⚠️  NO CHANGE: {rel_path}")
    
    except Exception as e:
        print(f"❌ ERROR: {rel_path} - {str(e)}")

print("=" * 80)
print("Cleanup complete!")
print("=" * 80)
