import glob

html_files = glob.glob('*.html')
snippet = """
    <link href="https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css" rel="stylesheet" />
    <script type="module">
        import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
        createChat({ webhookUrl: 'https://krishchobe01.app.n8n.cloud/webhook/bc6a9a09-e909-4a32-a7b8-9a05f3a75bb8/chat' });
    </script>
</body>
"""

for f in html_files:
    if f not in ['settings.html', 'analytics.html', 'alerts.html', 'inventory.html']:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        if 'webhookUrl' not in content:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(content.replace('</body>', snippet))
