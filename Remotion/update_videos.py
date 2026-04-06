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
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Replace the literal iframe with video tag. We will use a regex to match the iframe with id="video-iframe"
        pattern_iframe = re.compile(r'<iframe id="video-iframe"[^>]*>.*?</iframe>', re.DOTALL)
        video_tag = f'<video id="video-iframe" src="{webm}" playsinline loop muted style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;"></video>'
        
        content = pattern_iframe.sub(video_tag, content)
        
        # Replace startVideo()
        startVideo_pattern = re.compile(r'document\.getElementById\(\'video-iframe\'\)\.src=\'[^<]*?\.html\';')
        startVideo_replacement = "document.getElementById('video-iframe').play();"
        content = startVideo_pattern.sub(startVideo_replacement, content)
        
        # Now remove the scaleVideoIframe calls if they exist
        scale_pattern1 = re.compile(r'function scaleVideoIframe\(\)\{.*?}.*?scaleVideoIframe\(\);.*?window\.addEventListener\(\'resize\',scaleVideoIframe\);', re.DOTALL)
        content = scale_pattern1.sub('', content)
        
        # Just in case the formatting is slightly different 
        scale_pattern2 = re.compile(r'function scaleVideoIframe\(\)\s*\{[\s\S]*?\}\s*scaleVideoIframe\(\);\s*window\.addEventListener\(\'resize\',\s*scaleVideoIframe\);')
        content = scale_pattern2.sub('', content)

        # Remove stray scaleVideoIframe on resize that wasn't caught
        content = re.sub(r'window\.addEventListener\(\'resize\',scaleVideoIframe\);', '', content)
        content = re.sub(r'scaleVideoIframe\(\);', '', content)

        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {file}")
