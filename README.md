# SynEditMsgDesigner

A web-based designer for creating and validating message files for SynEdit syntax highlighters. This tool provides an intuitive interface to design and manage `.msg` files that define highlighting rules for custom languages in SynEdit.

**[🚀 Try the Demo](https://groovermd.github.io/SynEditMsgDesigner/)**

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [What's Coming](#whats-coming)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [License](#license)

## Overview

SynEditMsgDesigner is a visual tool designed to simplify the creation and editing of SynEdit message files. It eliminates the need to manually write complex syntax highlighting configurations by providing a user-friendly interface for designing language-specific syntax rules.

## ✨ Features

- **Interactive Web-Based Designer** - No installation required, run directly in your browser
- **Real-Time Preview** - See changes instantly as you design
- **Visual Configuration** - Intuitive UI for creating highlighting rules
- **Export Capabilities** - Generate `.msg` files for use in SynEdit

## 🚀 What's Coming

- **Reverse Parser** - Automatic extraction of highlighting rules from existing `SynHighlighter.pas` files
- **File Validation** - Load and validate `.msg` files to ensure correctness
- **Advanced Rule Editor** - More sophisticated options for complex highlighting scenarios
- **Import/Export Wizard** - Simplified workflow for managing multiple language configurations

## Getting Started

### Online (Recommended)

Visit the [live demo](https://groovermd.github.io/SynEditMsgDesigner/) to start using the designer immediately.

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/GrooverMD/SynEditMsgDesigner.git
   cd SynEditMsgDesigner
   ```

2. Install dependencies (if applicable):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000` (or the provided URL)

## Usage

1. **Create a New Project** - Start with a blank `.msg` file or import an existing one
2. **Define Language Rules** - Add highlighting rules for keywords, comments, strings, etc.
3. **Preview Results** - View how your rules will look in a SynEdit component
4. **Export** - Download your `.msg` file and use it in your SynEdit installation

## Architecture

The project is built with a focus on simplicity and usability:

- **Frontend** - JavaScript-based web interface for the designer
- **Core Logic** - Parser and validator for `.msg` file format
- **Export Engine** - Converts visual configurations to standard `.msg` format

For more details on the project structure, see the repository file listing.

## Contributing

Contributions are welcome! If you'd like to help improve SynEditMsgDesigner:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is currently unlicensed. Please check back soon or contact the repository owner for licensing information.

---

**Questions or Feedback?** Feel free to [open an issue](https://github.com/GrooverMD/SynEditMsgDesigner/issues) on GitHub.
