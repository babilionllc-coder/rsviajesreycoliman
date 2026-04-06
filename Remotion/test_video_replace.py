import re
import os

files = {
    'lead-capture-demo.html': 'videos/ai-sales-capture.webm',
    'seo-aeo-demo.html': 'videos/seo-aeo-dashboard.webm',
    'local-seo-demo.html': 'videos/local-seo.webm',
    'social-media-demo.html': 'videos/social-media-hub.webm',
    'website-demo.html': 'videos/website-performance.webm',
    'property-videos-demo.html': 'videos/listing-videos.webm',
    'admin-crm-demo.html': 'videos/crm-admin-panel.webm',
    'email-marketing-demo.html': 'videos/email-marketing.webm'
}

base_dir = '/Users/mac/Desktop/Websites/jegodigital/website'

for file, webm in files.items():
    filepath = os.path.join(base_dir, file)
    if os.path.exists(filepath):
        print(f"Processing {file}")
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Replace iframe
        pattern_iframe = re.compile(r'<iframe\s+id="video-iframe"[^>]*>.*?</iframe>', re.DOTALL)
        video_tag = f'<video id="video-iframe" src="{webm}" playsinline loop muted style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;"></video>'
        
        if pattern_iframe.search(content):
            content = pattern_iframe.sub(video_tag, content)
            print("  - replaced iframe")
        
        # Replace startVideo src assignment
        startVideo_pattern = re.compile(r'document\.getElementById\(\'video-iframe\'\)\.src=\'[^\']+\';')
        startVideo_replacement = "var v = document.getElementById('video-iframe'); if(v) v.play();"
        if startVideo_pattern.search(content):
            content = startVideo_pattern.sub(startVideo_replacement, content)
            print("  - replaced src assignment")

        # Replace scaleVideoIframe removal
        scale_pattern2 = re.compile(r'function scaleVideoIframe\(\)\s*\{[^}]*\}\s*scaleVideoIframe\(\);\s*window\.addEventListener\(\'resize\',\s*scaleVideoIframe\);')
        if scale_pattern2.search(content):
            content = scale_pattern2.sub('', content)
            print("  - removed scaleVideoIframe")
            
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Finished {file}")
    else:
        print(f"File not found: {file}")
