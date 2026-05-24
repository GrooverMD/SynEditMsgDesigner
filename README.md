# SynEditMsgDesigner

[![GitHub stars](https://img.shields.io/github/stars/GrooverMD/SynEditMsgDesigner?style=flat-square)](https://github.com/GrooverMD/SynEditMsgDesigner/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Live Demo](https://img.shields.io/badge/🚀%20Demo-Live-green?style=flat-square)](https://groovermd.github.io/SynEditMsgDesigner/)

A web-based designer for creating and validating message files for SynEdit syntax highlighters. This tool provides an intuitive, visual interface to design and manage `.msg` files that define syntax highlighting rules—no manual coding required.

**[🚀 Try the Live Demo](https://groovermd.github.io/SynEditMsgDesigner/)**

## 📋 Table of Contents

- [Overview](#overview)
- [Why SynEditMsgDesigner?](#why-syneditmsgdesigner)
- [Features](#features)
- [What's Coming](#whats-coming)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)
- [Contributing](#contributing)
- [License](#license)

## Overview

SynEditMsgDesigner is a visual tool designed to simplify the creation and editing of SynEdit message files. Manually writing `.msg` files is error-prone and tedious—this designer eliminates that pain by providing a graphical interface where you can:

- Define syntax highlighting rules visually
- See real-time previews of your configurations
- Export production-ready `.msg` files instantly
- Validate and modify existing files

Perfect for developers creating custom syntax highlighters for the SynEdit component.

## Why SynEditMsgDesigner?

### The Problem
Creating SynEdit `.msg` files traditionally requires:
- Manual text editing with complex syntax rules
- Trial-and-error testing to see how rules render
- Understanding the undocumented `.msg` file format
- Tedious copy-paste workflows

### The Solution
SynEditMsgDesigner provides a **visual, interactive workflow** that abstracts away the complexity:

```
Traditional Way:         ❌ Edit text → Test → Validate → Debug
SynEditMsgDesigner Way:  ✅ Design UI → Preview → Export → Done
```

## ✨ Features

- **Interactive Web-Based Designer** - No installation required; run directly in your browser
- **Real-Time Preview** - See changes instantly as you design highlighting rules
- **Visual Rule Configuration** - Intuitive UI for creating keywords, comments, strings, and custom rules
- **Export Capabilities** - Generate production-ready `.msg` files with one click
- **Browser-Based** - Works on Windows, macOS, and Linux
- **No Dependencies** - Use online without any local setup

## 🚀 What's Coming

- **Reverse Parser** - Automatically extract highlighting rules from existing `SynHighlighter.pas` files
- **File Validation** - Load and validate existing `.msg` files to ensure correctness
- **Template Library** - Pre-built highlighting profiles for popular languages

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Architecture:** Modular, client-side only (no backend required)
- **Build:** Ready to deploy as static files

## Getting Started

### Online (Recommended) ⭐

Visit the **[live demo](https://groovermd.github.io/SynEditMsgDesigner/)** to start using the designer immediately. No installation or local setup needed.

### Local Development

#### Prerequisites
- Node.js 14+ and npm
- Git
- A modern web browser (Chrome, Firefox, Safari, or Edge)

#### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/GrooverMD/SynEditMsgDesigner.git
   cd SynEditMsgDesigner
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   - The app will typically open at `http://localhost:3000`
   - If that port is in use, check the terminal for the actual URL

5. **Build for production:**
   ```bash
   npm run build
   ```

## Usage

### Quick Start (5 Minutes)

1. **Open the Designer** - Visit the [live demo](https://groovermd.github.io/SynEditMsgDesigner/) or run locally
2. **Create a New Project** - Start with a blank configuration
3. **Add Highlighting Rules** - Define rules for:
   - **Keywords** - Reserved words (if, else, for, etc.)
   - **Comments** - Single-line and block comments
   - **Strings** - String literals and quotes
   - **Numbers** - Numeric literals
   - **Operators** - Custom operators and symbols
4. **Preview in Real-Time** - See your highlighting rules applied instantly
5. **Export Your File** - Download the `.msg` file and integrate it into your SynEdit installation

### Example Workflow

See the live demo for an interactive walkthrough of creating a custom syntax highlighter.

## Architecture

The project is built with a focus on simplicity and usability:

- **Frontend** - HTML5/CSS3/JavaScript web interface for intuitive design
- **Core Logic** - Parser and validator for `.msg` file format specifications
- **Export Engine** - Converts visual configurations to standard `.msg` format
- **Client-Side** - All processing happens in your browser; no server required

### Project Structure

```
SynEditMsgDesigner/
├── index.html          # Main application entry point
├── css/
│   └── styles.css      # Application styling
├── js/
│   ├── app.js          # Main application logic
│   ├── parser.js       # .msg file parser
│   └── exporter.js     # Export engine
└── README.md           # This file
```

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
# Use a different port
npm start -- --port 3001
```

### Dependencies Installation Issues
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Export Not Working
- Ensure your browser allows downloads
- Check that you have write permissions in your download folder
- Try a different browser if issues persist

### .msg File Won't Load
- Verify the file format matches SynEdit specifications
- Check browser console for error messages (F12 → Console tab)
- Try exporting a new file and comparing the format

## 📚 Resources

- **[SynEdit Component Docs](https://github.com/search?q=SynEdit)** - Learn more about the SynEdit component
- **.msg File Format** - Documentation coming soon
- **[Open an Issue](https://github.com/GrooverMD/SynEditMsgDesigner/issues)** - Report bugs or request features
- **[GitHub Discussions](https://github.com/GrooverMD/SynEditMsgDesigner/discussions)** - Ask questions and share ideas

## Contributing

Contributions are welcome! If you'd like to help improve SynEditMsgDesigner:

1. **Fork the repository** - Click the Fork button on GitHub
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes:**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request** - Describe your changes clearly

### Development Guidelines
- Keep code modular and well-commented
- Test your changes in multiple browsers
- Update documentation if adding new features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Questions or Feedback?** Feel free to:
- 💬 [Open an Issue](https://github.com/GrooverMD/SynEditMsgDesigner/issues)
- 💡 [Start a Discussion](https://github.com/GrooverMD/SynEditMsgDesigner/discussions)
- 📧 Reach out via GitHub

**Enjoying the tool?** Give it a ⭐ on GitHub!
