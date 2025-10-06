# Personal Resume Website

A clean, professional single-page resume website that's mobile-responsive and ready to customize with your personal information.

## Features

- **Single-page design** - All information on one page for easy viewing
- **Mobile-responsive** - Looks great on desktop, tablet, and mobile devices
- **Professional styling** - Clean, modern design with a beautiful gradient header
- **Print-friendly** - Optimized CSS for printing
- **Easy to customize** - Simple HTML structure with placeholder content

## Getting Started

### Customizing Your Resume

1. **Edit `index.html`** - Replace the placeholder content with your information:
   - Update the name and title in the header
   - Add your contact information (email, phone, LinkedIn, location)
   - Write your professional summary
   - Add your work experience with achievements
   - Include your education details
   - List your technical and soft skills

2. **Customize styling** (optional) - Edit `styles.css` to:
   - Change colors by modifying the gradient in `.header`
   - Adjust fonts, spacing, or layout
   - Add your personal branding elements

### Viewing Locally

To test your resume website locally:

```bash
# Navigate to the project directory
cd resume

# Start a local web server (Python 3)
python3 -m http.server 8000

# Or use Python 2
python -m SimpleHTTPServer 8000

# Or use Node.js if you have it installed
npx serve .
```

Then open your browser and go to `http://localhost:8000`

### Deployment Options

#### GitHub Pages
1. Push your changes to GitHub
2. Go to your repository settings
3. Enable GitHub Pages from the main branch
4. Your resume will be available at `https://yourusername.github.io/resume`

#### Netlify
1. Connect your GitHub repository to Netlify
2. Deploy automatically with each push
3. Get a custom domain or use the provided netlify.app URL

#### Vercel
1. Import your GitHub repository to Vercel
2. Deploy with zero configuration
3. Get instant deployments on every push

#### Other Options
- Upload `index.html` and `styles.css` to any web hosting service
- Use services like Firebase Hosting, AWS S3, or traditional web hosts

## File Structure

```
resume/
├── index.html          # Main resume page
├── styles.css          # Styling and responsive design
└── README.md          # This file
```

## Screenshots

### Desktop View
![Desktop Resume](https://github.com/user-attachments/assets/806012ca-e07c-4673-8658-e66cafb632c9)

### Mobile View
![Mobile Resume](https://github.com/user-attachments/assets/d2a380a4-76ea-46bc-8d5d-ecc3c7c33bf0)

## Customization Tips

- **Colors**: The main color scheme uses a purple gradient. Change the `background: linear-gradient()` values in `.header` to use your preferred colors.
- **Fonts**: The resume uses system fonts for fast loading. You can add Google Fonts by including a link in the HTML head and updating the `font-family` in CSS.
- **Sections**: Feel free to add, remove, or reorder sections based on your needs (certifications, projects, awards, etc.).
- **Content**: Keep descriptions concise and focus on achievements with quantifiable results when possible.

## License

This template is free to use and modify for personal and commercial purposes.
