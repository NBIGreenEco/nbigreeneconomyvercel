#!/usr/bin/env python3
"""
Generate search index from all HTML files in the project
"""
import os
import json
import re
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin

class HTMLContentExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.headings = []
        self.paragraphs = []
        self.links = []
        self.current_tag = None
        self.in_script = False
        self.in_style = False
        self.text_content = []
        
    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            self.in_script = True
        elif tag == 'style':
            self.in_style = True
        elif tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            self.current_tag = 'heading'
        elif tag == 'p':
            self.current_tag = 'paragraph'
        elif tag == 'a':
            for attr, value in attrs:
                if attr == 'href':
                    self.links.append(value)
    
    def handle_endtag(self, tag):
        if tag == 'script':
            self.in_script = False
        elif tag == 'style':
            self.in_style = False
        elif tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p']:
            self.current_tag = None
    
    def handle_data(self, data):
        if self.in_script or self.in_style:
            return
        
        text = data.strip()
        if not text:
            return
        
        if self.current_tag == 'heading':
            self.headings.append(text)
        elif self.current_tag == 'paragraph':
            self.paragraphs.append(text)

def extract_content(html_file):
    """Extract content from HTML file"""
    try:
        with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
            html_content = f.read()
        
        # Extract title from <title> tag
        title_match = re.search(r'<title>(.*?)</title>', html_content, re.IGNORECASE)
        title = title_match.group(1) if title_match else ''
        
        # Extract meta description
        desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', html_content, re.IGNORECASE)
        description = desc_match.group(1) if desc_match else ''
        
        # Extract content from body
        body_match = re.search(r'<body[^>]*>(.*)</body>', html_content, re.IGNORECASE | re.DOTALL)
        body_html = body_match.group(1) if body_match else html_content
        
        # Parse HTML
        parser = HTMLContentExtractor()
        parser.feed(body_html)
        
        return {
            'title': title,
            'description': description,
            'headings': parser.headings,
            'paragraphs': parser.paragraphs
        }
    except Exception as e:
        print(f"Error extracting {html_file}: {e}")
        return None

def build_search_index():
    """Build search index from all HTML files"""
    root_dir = Path('.')
    index = []
    
    # Files to include
    html_files = []
    
    # Add root HTML files
    for file in root_dir.glob('*.html'):
        if file.name not in ['start_server.js', 'server.py']:
            html_files.append((file, f'/{file.name}'))
    
    # Add HTML files from subdirectories
    for subdir in root_dir.iterdir():
        if subdir.is_dir() and subdir.name not in ['.git', 'node_modules', '.venv']:
            for file in subdir.rglob('*.html'):
                rel_path = f'/{file.relative_to(root_dir)}'.replace('\\', '/')
                html_files.append((file, rel_path))
    
    print(f"Found {len(html_files)} HTML files")
    
    # Extract content from each file
    for html_file, url_path in html_files:
        print(f"Processing: {url_path}")
        content = extract_content(str(html_file))
        
        if content:
            entry = {
                'url': url_path,
                'title': content['title'],
                'description': content['description'],
                'content': {
                    'headings': content['headings'][:20],  # Limit to first 20 headings
                    'paragraphs': content['paragraphs'][:20]  # Limit to first 20 paragraphs
                }
            }
            index.append(entry)
    
    # Save index
    output_file = 'search-index.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Search index generated: {output_file}")
    print(f"📊 Index contains {len(index)} pages")
    print(f"💾 File size: {os.path.getsize(output_file) / 1024:.2f} KB")
    
    return index

if __name__ == '__main__':
    build_search_index()
