# Resume Generator

An AI-powered resume tailoring application built with React that helps you optimize your resume for specific job descriptions. Get match scores, keyword analysis, and AI-powered suggestions to improve your chances of getting noticed.

## 🚀 Features

- **AI Resume Parsing**: Paste your existing resume and let AI extract and structure all information automatically
- **Smart Profile Builder**: Fill out your profile step-by-step with a guided form
- **Job-Specific Tailoring**: Input a job description, and AI rewrites your resume to match the requirements
- **Match Analysis**: See a match score (0-100), matched keywords, missing keywords, and AI suggestions
- **ATS-Optimized PDF**: Download your tailored resume in an Applicant Tracking System (ATS) friendly format
- **Saved Profiles**: Your profile is saved locally in your browser for quick access on return visits
- **Multi-Entry Support**: Start fresh, paste an existing resume, or continue with saved profile

## 🛠 Tech Stack

- **Frontend**: React 18.3.1 with Tailwind CSS 3.4.19
- **PDF Generation**: @react-pdf/renderer 4.3.2
- **AI Integration**: OpenRouter API with Claude Sonnet 4
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Data Persistence**: Browser localStorage
- **State Management**: React Hooks (useState, useEffect)

### Security Status
- ✅ All production dependencies are secure
- ⚠️ See [AUDIT.md](AUDIT.md) for npm audit report details

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenRouter API key (free tier available)

## 🔧 Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd resumeCreator
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Get OpenRouter API Key
1. Visit [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Create a free account or sign in
3. Generate a new API key
4. Copy the key (starts with `sk-or-v1-`)

### 4. Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Open .env and add your OpenRouter API key
REACT_APP_OPENROUTER_API_KEY=your_api_key_here
```

⚠️ **Security Note**: Never commit `.env` to version control. It's already in `.gitignore`.

### 5. Start the Development Server
```bash
npm start
```

The app will open at `http://localhost:3000`

## 📱 Usage Workflow

### First Time Users

1. **Landing Page**: Choose one of three options:
   - ✨ **Paste Existing Resume** - AI parses your resume text
   - 📝 **Build From Scratch** - Fill out form manually
   - ✓ **Continue with Saved Profile** - (if you have a saved profile)

2. **Profile Completion** (if building from scratch):
   - Personal info (name, email, phone, etc.)
   - Professional summary
   - Work experiences
   - Education (with GPA and honors)
   - Skills
   - Projects
   - Certifications

3. **Job Description**:
   - Paste job description OR provide job posting URL
   - AI analyzes and matches to your resume

4. **Results**:
   - View match score and keyword analysis
   - Read AI suggestions
   - Preview tailored resume
   - Download ATS-optimized PDF

### Returning Users

- App detects saved profile
- Automatically skips to job input step
- OR click "Continue with Saved Profile" on landing page

## 📂 Project Structure

```
src/
├── components/
│   ├── ProfileForm.jsx          # Step 1: Profile input form
│   ├── JobInput.jsx             # Step 2: Job description input
│   ├── ResumePreview.jsx        # Resume preview display
│   ├── JobAnalysis.jsx          # Match score & keyword analysis
│   ├── SmartResumeInput.jsx     # AI resume parser modal
│   ├── ResumeTextParser.jsx     # Resume text import modal
│   ├── DownloadButton.jsx       # PDF download button
│   └── index.js                 # Component exports
├── services/
│   ├── jobTargetingService.js   # Job matching & analysis
│   └── resumeParserService.js   # AI resume parsing
├── templates/
│   └── ResumePDF.jsx            # ATS-compliant PDF template
├── hooks/
│   └── useProfile.js            # localStorage profile management
├── App.js                       # Main app orchestrator (4-step workflow)
├── App.css                      # Styling
└── index.js                     # React entry point
```

## 🔐 Security & Privacy

### Data Storage
- **Profiles**: Stored locally in browser localStorage (not sent to any server)
- **Job Descriptions**: Sent only to OpenRouter for AI analysis
- **API Key**: Should never leave your local machine (use .env)

### Best Practices
- ✅ `.env` file is in `.gitignore` and won't be committed
- ✅ All API calls use HTTPS
- ✅ No personal data is logged or tracked
- ✅ No cookies or analytics

### Before Deploying to Production
If you deploy this app publicly:
1. Move API key to backend server (don't expose in React)
2. Implement backend proxy for OpenRouter calls
3. Add rate limiting
4. Consider user authentication if required

## 📝 Data Fields

### Profile Structure
```javascript
{
  fullName: string,
  email: string,
  phone: string,
  linkedIn: string,
  github: string,
  location: string,
  summary: string,
  skills: string[],
  workExperiences: [{
    company, title, startDate, endDate, bulletPoints[]
  }],
  education: [{
    institution, degree, fieldOfStudy, 
    startDate, graduationDate, gpa, highlights[]
  }],
  projects: [{
    name, tech, description, githubUrl
  }],
  certifications: string[]
}
```

## 🐛 Troubleshooting

### "API key not configured" Error
- Ensure `.env` file exists in project root
- Verify `REACT_APP_OPENROUTER_API_KEY` is set
- Restart dev server after updating `.env`

### Empty Profile on Return Visit
- Clear browser cache and localStorage
- Check browser's private/incognito mode (localStorage doesn't persist)
- Verify localStorage isn't disabled in browser settings

### PDF Download Not Working
- Check browser's pop-up blocker settings
- Try a different browser
- Ensure resume data is complete (name, email required)

### Poor Match Scores
- Use specific, detailed job descriptions
- Include required keywords in your resume
- AI matches based on content similarity, not title

## 📝 Available Scripts

```bash
npm start       # Run development server on port 3000
npm build       # Build optimized production bundle
npm test        # Run test suite
npm eject       # Eject from Create React App (irreversible)
```

## 🌐 API Reference

### OpenRouter Integration
- **Model**: `anthropic/claude-sonnet-4-6`
- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`

### Available Services

**jobTargetingService.js**
```javascript
const result = await tailorResumeToJob(profileData, jobDescription);
// Returns: { summary, workExperiences, skills, projects, 
//            matchScore, matchedKeywords, missingKeywords, suggestions }
```

**resumeParserService.js**
```javascript
const { parsedResume, followUpQuestions } = 
  await parseAndAnalyzeResume(rawResumeText);
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
# Add REACT_APP_OPENROUTER_API_KEY to environment variables
```

### Deploy to Netlify
```bash
npm run build
# Upload 'build' folder to Netlify
# Add REACT_APP_OPENROUTER_API_KEY to environment variables
```

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [React PDF Renderer](https://react-pdf.org)
- [OpenRouter API Docs](https://openrouter.ai/docs)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the MIT License.

## ⚡ Quick Tips

1. **Export Resumes**: Use the "Download" button to get an ATS-friendly PDF
2. **Try Multiple Jobs**: Test your resume against different job descriptions
3. **Check Keywords**: Review the keyword analysis to identify gaps
4. **Update Profile**: Use "Build From Scratch" to edit your saved profile
5. **Start Over**: Click "Start Over" in header to clear everything and begin fresh

---

**Version**: 1.0.0 | Built with ❤️ using React and Claude AI
