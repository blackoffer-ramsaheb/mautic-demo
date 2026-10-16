#!/usr/bin/env python3
"""
Simple local development server for Mautic Demo UI.
Usage: python server.py [port]
Default port: 3000
"""

import http.server
import socketserver
import sys
import webbrowser
from pathlib import Path

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
DIRECTORY = Path(__file__).resolve().parent

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)

    def log_message(self, format, *args):
        # Clean logging
        sys.stdout.write(f"[{self.log_date_time_string()}] {format % args}\n")

def run():
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            url = f"http://localhost:{PORT}/index.html"
            print("=" * 60)
            print(f"🚀 Mautic Demo UI Server running at: http://localhost:{PORT}")
            print(f"📄 Landing Page:      http://localhost:{PORT}/index.html")
            print(f"📊 Campaign Dashboard: http://localhost:{PORT}/dashboard.html")
            print("=" * 60)
            print("Press Ctrl+C to stop the server.\n")
            webbrowser.open(url)
            httpd.serve_forever()
    except OSError as e:
        if e.errno == 98 or e.errno == 10048:
            print(f"Port {PORT} is already in use. Try: python server.py {PORT + 1}")
        else:
            raise

if __name__ == "__main__":
    run()


