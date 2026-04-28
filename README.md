# Loomin - Distraction-Free YouTube Learning

Loomin is a platform that transforms YouTube playlists into structured, distraction-free courses using Gemini AI, now built with the Next.js App Router.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [VS Code](https://code.visualstudio.com/) (recommended editor)

## Getting Started Locally

Follow these steps to run Loomin on your local machine:

1. **Download the Source Code**:
   - If you exported this as a ZIP, extract it to a folder.
   - If you cloned it from GitHub, open the folder in your terminal.

2. **Open in VS Code**:
   - Open VS Code.
   - Go to `File > Open Folder...` and select the project folder.

3. **Install Dependencies**:
   - Open the integrated terminal in VS Code (`Ctrl + ` ` or `View > Terminal`).
   - Run the following command:
     ```bash
     npm install
     ```

4. **Set Up Environment Variables**:
   - Create a file named `.env.local` in the root directory.
   - Add your API keys (you can find these in the AI Studio Settings menu):
     ```env
     VITE_YOUTUBE_API_KEY=your_youtube_api_key
     GEMINI_API_KEY=your_gemini_api_key
     ```

5. **Run the Development Server**:
   - In the terminal, run:
     ```bash
     npm run dev
     ```
   - The app will be available at `http://localhost:3000`.

## Project Structure

- `src/app/`: Next.js App Router directory.
  - `layout.tsx`: Root layout with ThemeProvider.
  - `page.tsx`: Main landing page.
  - `api/`: Backend API routes for secure API calls.
- `src/components/`: Reusable UI components.
- `src/services/`: Logic for YouTube and Gemini API integrations (calling internal APIs).
- `src/app/globals.css`: Global styles using Tailwind CSS.

## Features

- **Next.js App Router**: Modern, performant architecture.
- **Secure API Routes**: API keys are handled server-side for security.
- **Playlist to Course**: Convert any YouTube playlist into a structured course.
- **Focus Mode**: Distraction-free video player.
- **AI Insights**: Gemini-powered summaries for every video.
- **Progress Tracking**: Keep track of your learning journey.
- **Theme Support**: Light, Dark, and Midnight modes.

## Troubleshooting

- **API Errors**: Ensure your `.env` file contains valid API keys for YouTube and Gemini.
- **Module Not Found**: Run `npm install` again to ensure all packages are correctly installed.
- **Port Conflict**: If port 3000 is in use, Vite will automatically try another port. Check the terminal output for the correct URL.
