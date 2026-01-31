#!/usr/bin/env python3
"""
Parse the GitHub markdown file and extract prompts into JSON format
"""
import re
import json
import sys
import os

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
            
        # Comprehensive Category Mapping
        # Format: 'category_id': { 'keywords': [...], 'name': 'Display Name' }
        category_map = {
            'photography': {'keywords': ['摄影', 'photograph', 'photo', 'camera', '照片', '写实', 'realis', '4k', '8k', 'high quality'], 'name': '📷 摄影'},
            'portrait': {'keywords': ['肖像', 'portrait', '人像', 'face', 'girl', 'boy', 'woman', 'man', '少女', '男孩'], 'name': '👤 人像'},
            'nature': {'keywords': ['自然', 'nature', 'plant', 'flower', 'forest', '植物', '花', '森林', 'mountain', '山'], 'name': '🌿 自然'},
            'landscape': {'keywords': ['景观', 'landscape', 'scenery', '风景', '环境', 'environment'], 'name': '🏔️ 景观'},
            'architecture': {'keywords': ['建筑', 'architecture', 'building', 'house', 'room', 'interior', '室内', '房屋'], 'name': '🏛️ 建筑'},
            'interior': {'keywords': ['室内', 'interior', 'room', 'furniture', '家居', 'design'], 'name': '🏠 室内'},
            '3d': {'keywords': ['3d', 'render', 'c4d', 'blender', 'octane', 'unreal', '立体', 'rendering'], 'name': '🧊 3D'},
            'illustration': {'keywords': ['插画', 'illustration', 'drawing', 'sketch', 'painting', 'art', '绘'], 'name': '🎨 插画'},
            'character': {'keywords': ['角色', 'character', 'design', 'ip', 'mascot', '吉祥物'], 'name': '👾 角色'},
            'anime': {'keywords': ['动漫', 'anime', 'manga', 'comic', '二次元', 'cartoon', '动画'], 'name': '🌸 动漫'},
            'fashion': {'keywords': ['时尚', 'fashion', 'cloth', 'dress', 'outfit', 'wear', '服饰', '穿搭'], 'name': '👗 时尚'},
            'product': {'keywords': ['产品', 'product', 'commercial', 'goods', '商品', 'packaging', '包装'], 'name': '📦 产品'},
            'food': {'keywords': ['食物', 'food', 'drink', 'fruit', 'cake', '美食', '餐饮', '水果'], 'name': '🍔 美食'},
            'logo': {'keywords': ['logo', '标志', 'icon', 'symbol', 'iconography', '图标'], 'name': '🔷 Logo'},
            'branding': {'keywords': ['品牌', 'branding', 'identity', 'vi', 'mockup', 'visual'], 'name': '💼 品牌'},
            'typography': {'keywords': ['字体', 'typography', 'text', 'font', 'letter', 'words', '字'], 'name': '🅰️ 字体'},
            'poster': {'keywords': ['海报', 'poster', 'layout', 'magazine', 'cover', '封面', '排版'], 'name': '📜 海报'},
            'ui': {'keywords': ['ui', 'ux', 'interface', 'web', 'app', 'mobile', '界面', '网页'], 'name': '📱 UI'},
            'icon': {'keywords': ['icon', '图标', 'sticker', 'badge', '贴纸', '徽章'], 'name': '🏷️ 图标'},
            'game': {'keywords': ['游戏', 'game', 'gaming', 'rpg', 'pixel', 'sprite', '像素'], 'name': '🎮 游戏'},
            'sci-fi': {'keywords': ['科幻', 'sci-fi', 'space', 'cyberpunk', 'robot', 'future', '未来', '赛博', '太空'], 'name': '🚀 科幻'},
            'fantasy': {'keywords': ['奇幻', 'fantasy', 'magic', 'dragon', 'fairytale', 'dream', '梦幻', '魔法'], 'name': '🦄 奇幻'},
            'retro': {'keywords': ['复古', 'retro', 'vintage', '90s', '80s', 'nostalgic', '怀旧', 'classic'], 'name': '📼 复古'},
            'minimalist': {'keywords': ['极简', 'minimal', 'simple', 'clean', 'white', 'simple background'], 'name': '✨ 极简'},
            'neon': {'keywords': ['霓虹', 'neon', 'light', 'glow', 'cyber', '发光'], 'name': '🎆 霓虹'},
            'clay': {'keywords': ['粘土', 'clay', 'plasticine', 'soft', 'cute', '模型'], 'name': '🧸 粘土'},
            'paper': {'keywords': ['剪纸', 'paper', 'craft', 'origami', 'papercut', '纸艺'], 'name': '✂️ 剪纸'},
            'texture': {'keywords': ['材质', 'texture', 'pattern', 'background', 'surface', '纹理'], 'name': '🧶 材质'},
            'animal': {'keywords': ['动物', 'animal', 'cat', 'dog', 'pet', 'bird', '猫', '狗', '宠物'], 'name': '🐾 动物'},
            'vehicle': {'keywords': ['车辆', 'vehicle', 'car', 'bike', 'ship', 'plane', '汽车', '交通'], 'name': '🚗 车辆'},
        }

        # Assign categories
        categories = []
        title_lower = title.lower()
        prompt_lower = prompt.lower()
        
        # Check title and prompt for keywords
        search_text = title_lower + " " + prompt_lower
        
        for cat_id, data in category_map.items():
            if any(k in search_text for k in data['keywords']):
                categories.append(cat_id)
        
        # Fallback
        if not categories:
            categories = ['other']
            
        # Limit to top 3 categories to avoid clutter
        categories = categories[:3]
        
        # We store the ID, the UI will translate ID to Name using a map found in index.html (or we verify name consistency)
        # Actually, let's just store IDs in the JSON, and update index.html to have the labels.
        # But wait, the current parse script stores specific category IDs.
        
        # Let's verify what the old script did. It stored string IDs like 'branding'.
        # I will keep extracting 'categories' as a list of IDs.
        
        cases.append({
            "id": int(case_id),
            "title": title,
            "prompt": prompt,
            "image": image_url,
            "categories": categories
        })
    
    return cases

if __name__ == "__main__":
    import glob
    
    all_cases = []
    seen_ids = set()
    
    # Get all .md files in data directory
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    md_files = glob.glob(os.path.join(data_dir, '*.md'))
    
    print(f"Found {len(md_files)} markdown files to process...")
    
    for md_file in md_files:
        try:
            with open(md_file, 'r') as f:
                content = f.read()
                cases = parse_markdown_to_json(content)
                
                # Add unique cases
                for case in cases:
                    if case['id'] not in seen_ids:
                        all_cases.append(case)
                        seen_ids.add(case['id'])
                        
            print(f"Processed {os.path.basename(md_file)}: {len(cases)} prompts found")
        except Exception as e:
            print(f"Error processing {md_file}: {e}")
            
    # Sort by ID descending (newest first)
    all_cases.sort(key=lambda x: x['id'], reverse=True)
            
    # Output to data/prompts.json
    output_path = os.path.join(data_dir, 'prompts.json')
    with open(output_path, 'w') as f:
        json.dump(all_cases, f, ensure_ascii=False, indent=2)
        
    print(f"✅ Successfully extracted {len(all_cases)} unique prompts to {output_path}")
