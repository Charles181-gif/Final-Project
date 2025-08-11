GHANAHEALTH+ OFFLINE SETUP INSTRUCTIONS
=====================================

To run the GhanaHealth+ website offline, follow these steps:

1. FOLDER STRUCTURE:
   Make sure your folder structure looks like this:
   
   ghana-eclinic/
   ├── index.html
   ├── about.html
   ├── register.html
   ├── login.html
   ├── dashboard.html
   ├── chat.html
   ├── payment.html
   ├── notifications.html
   ├── styles/
   │   ├── main.css
   │   ├── home.css
   │   ├── about.css
   │   ├── auth.css
   │   ├── dashboard.css
   │   ├── chat.css
   │   ├── payment.css
   │   ├── notifications.css
   │   └── icons.css
   └── js/
       ├── main.js
       ├── home.js
       ├── about.js
       ├── register.js
       ├── login.js
       ├── dashboard.js
       ├── chat.js
       ├── payment.js
       ├── notifications.js
       └── firebase-config.js

2. FOR COMPLETE OFFLINE USE:
   
   Option A - Use local icons (recommended):
   - Replace Font Awesome CDN link in HTML files with:
     <link rel="stylesheet" href="styles/icons.css">
   
   Option B - Download Font Awesome:
   - Download Font Awesome from https://fontawesome.com/download
   - Extract to 'fontawesome/' folder in your project
   - Replace CDN link with: <link rel="stylesheet" href="fontawesome/css/all.min.css">

3. REMOVE EXTERNAL DEPENDENCIES:
   - All Firebase features require internet connection
   - For offline demo, comment out Firebase script tags
   - CSS and basic functionality will work offline

4. TESTING OFFLINE:
   - Open index.html in your web browser
   - Disable internet connection to test offline functionality
   - Navigation between pages should work perfectly

5. COMMON ISSUES & SOLUTIONS:

   Issue: CSS not loading
   Solution: Check file paths are correct (styles/main.css, etc.)
   
   Issue: Icons not showing
   Solution: Either use icons.css or download Font Awesome locally
   
   Issue: JavaScript errors
   Solution: Comment out Firebase-related code for offline use

6. FIREBASE SETUP (for online features):
   - Create Firebase project at https://console.firebase.google.com
   - Enable Authentication, Firestore, Storage
   - Replace config in js/firebase-config.js with your credentials

For questions or support, contact: info@ghanahealth.com
