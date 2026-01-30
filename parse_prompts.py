#!/usr/bin/env python3
"""
Parse the GitHub markdown file and extract prompts into JSON format
"""
import re
import json
import sys

def parse_markdown_to_json(md_content):
    """Parse markdown content and extract prompt cases"""
    cases = []
    
    # Split by case headers
    pattern = r'<a id="prompt-(\d+)"></a>\n## 案例 \d+[:：](.+?)(?:\(来源.*?\))?\n'
    sections = re.split(pattern, md_content)
    
    # Process sections (skip first empty one)
    for i in range(1, len(sections), 3):
        if i+2 >= len(sections):
            break
            
        case_id = sections[i].strip()
        title = sections[i+1].strip()
        content = sections[i+2]
        
        # Extract images
        img_pattern = r'<img src="\./(images/\d+(?:-\d+)?\.(?:png|jpeg|jpg))"'
        images = re.findall(img_pattern, content)
        image_url = f"https://raw.githubusercontent.com/songguoxs/gpt4o-image-prompts/master/{images[0]}" if images else ""
        
        # Extract prompt text
        prompt_match = re.search(r'```\n(.*?)\n```', content, re.DOTALL)
        prompt = prompt_match.group(1).strip() if prompt_match else ""
        
        if not prompt:
            continue
            
        # Auto-assign categories based on title keywords
        categories = []
        title_lower = title.lower()
        
        if any(keyword in title_lower for keyword in ['logo', '标志', '品牌']):
            categories.append('branding')
        if '3d' in title_lower or '雕塑' in title or '立体' in title:
            categories.append('3d')
        if any(keyword in title for keyword in ['摄影', 'photograph', '相机']):
            categories.append('photography')
        if any(keyword in title for keyword in ['插画', 'illustration', '绘画']):
            categories.append('illustration')
        if any(keyword in title for keyword in ['卡通', 'cartoon', '可爱']):
            categories.append('character')
        if any(keyword in title for keyword in ['复古', 'retro', '怀旧']):
            categories.append('retro')
        if any(keyword in title for keyword in ['霓虹', 'neon', '发光']):
            categories.append('neon')
        if any(keyword in title for keyword in ['产品', 'product']):
            categories.append('product')
        if any(keyword in title for keyword in ['食物', 'food', '美食', '零食']):
            categories.append('food')
        if any(keyword in title for keyword in ['时尚', 'fashion']):
            categories.append('fashion')
        if any(keyword in title for keyword in ['极简', 'minimal']):
            categories.append('minimalist')
        if any(keyword  in title for keyword in ['奇幻', 'fantasy', '魔法']):
            categories.append('fantasy')
        if any(keyword in title for keyword in ['风景', 'landscape', '自然']):
            categories.append('landscape')
        if any(keyword in title for keyword in ['科幻', 'sci-fi', '未来']):
            categories.append('sci-fi')
            
        if not categories:
            categories = ['other']
        
        cases.append({
            "id": int(case_id),
            "title": title,
            "prompt": prompt,
            "image": image_url,
            "categories": categories
        })
    
    return cases

if __name__ == "__main__":
    # Read from stdin
    md_content = sys.stdin.read()
    
    # Parse
    cases = parse_markdown_to_json(md_content)
    
    # Output JSON
    print(json.dumps(cases, ensure_ascii=False, indent=2))
