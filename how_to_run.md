# How to Run the Hero Banner Demo

To run this demo locally:

1. Simply open the `public/index.html` file directly in your web browser

OR

2. Use a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Or using Node.js http-server
   npx http-server
   ```
   Then open http://localhost:8000/public/index.html in your browser

## Features
- Auto-sliding image carousel (5-second intervals)
- Previous/Next navigation buttons
- Pause on hover
- Responsive design
- Smooth transitions

The demo uses placeholder images from placekitten.com. You can replace these with your own images by modifying the `images` array in the script.