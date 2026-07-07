<div align="center">
  <img src="https://img.icons8.com/?size=100&id=16279&format=png&color=15803D" alt="GovGuide AI Logo" width="80" />
  <h1>🧭 GovGuide AI</h1>
  <p><strong>Tell us your problem. We'll tell you exactly what to do.</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Theme-GovTech%20Green-15803D?style=for-the-badge" alt="Theme" />
    <img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Jest_Tested-100%25-brightgreen?style=for-the-badge&logo=jest" alt="Testing Coverage" />
  </p>
</div>

---

## 📖 Overview

GovGuide AI is an intelligent platform designed to simplify complex government procedures for citizens. 

Instead of searching across multiple government websites or reading complicated documentation, users simply describe their situation in plain English (or Hindi!). 

**Example:**
> *"I lost my Aadhaar card."*

The AI understands the user's intent and instantly generates a complete roadmap containing required documents, official links, application steps, and processing times. The goal is to reduce confusion, save time, and make government services accessible for everyone.

---

## 🎯 Problem & Primary Goal

### The Problem
Citizens often struggle to access government services because:
- They don't know which exact service they need.
- Required documents are difficult to find or understand.
- Instructions are complicated and spread across different portals.
- Missing just one document often means visiting the office again.

### The Solution (Our Goal)
Transform a user's problem into a structured government action plan. Instead of asking *"What documents are required for a Passport?"*, users simply ask: *"I want to study abroad."*
GovGuide AI will automatically determine they need a Passport, a Police Clearance Certificate, and specific Visa documents, providing a single starting point for their entire journey.

---

## ✨ Core Features

### 🎙️ Multi-Lingual Speech-to-Text
Speak your problem directly into the microphone! GovGuide features built-in Web Speech API integration that seamlessly understands both **English (en-IN)** and **Hindi (hi-IN)**, parsing your query dynamically into text.

### 🌐 Native i18n Support (English / Hindi)
Access the entire interface in either English or Hindi. Powered by a robust React Context, users can switch languages instantly with zero lag. Our custom fallback routers even map Devanagari script queries (like *"मुझे पासपोर्ट बनवाना है"*) directly to the correct backend services.

### 🧠 Gemini AI & Fallback Router
GovGuide leverages the **Google Gemini API** (`@google/genai`) to generate highly contextual action plans. 
Don't have an API key? No problem! The app automatically switches to **Demo Mode**, utilizing a custom RegEx-powered Mock Fallback Router that reads from a local JSON knowledge base to serve accurate paths instantly.

### 📑 Personalized Action Plans
- **Step-by-step Guidance**: Clear instructions on how to apply.
- **Interactive Checklists**: Keep track of mandatory vs optional documents.
- **Micro-interactions**: Modal popups for specific document insights and verified official government links.

---

## 👥 Target Users

GovGuide AI is built for everyone, but especially benefits:
- Students applying for higher education or visas
- Senior Citizens who struggle with complex portals
- Working Professionals short on time
- Rural Citizens navigating bureaucracy for the first time

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js**: v18.17.0 or higher
- **Package Manager**: npm, yarn, or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ShaileshSethi/govguideai.git
   cd govguideai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   # Add this to enable intelligent generation (otherwise runs in Mock Demo mode)
   GEMINI_API_KEY=your_google_gemini_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 🧪 Testing

We take code reliability seriously. The platform is fully equipped with **Jest** and **React Testing Library**, covering everything from UI Component interactions to API endpoint mocking.

Run the test suite:
```bash
npm run test
```

Generate a test coverage report:
```bash
npm run test -- --coverage
```
*Current API logic and Component rendering paths are highly covered, including edge cases for empty queries and API failure states.*

---

## 📂 Architecture & Folder Structure

```
├── data/                      # Local JSON knowledge base for 12+ government services
├── src/
│   ├── app/
│   │   ├── api/generate/      # Next.js API route handling Gemini AI / Mock Routing
│   │   ├── feedback/          # User feedback and survey page
│   │   ├── globals.css        # Tailwind V4 & custom glassmorphic variables
│   │   └── page.tsx           # Main Dashboard and Action Plan Renderer
│   ├── components/            # Reusable UI components (NavigationLayout, etc.)
│   └── context/               # React Context providers (LanguageContext.tsx)
├── __tests__/                 # Jest Test suites for API, Context, and Pages
└── jest.config.mjs            # Jest configuration mapped for Next.js SWC
```

---

## 🎨 Design Philosophy

GovGuide AI breaks away from the clunky "2010 government portal" look. Instead, it uses a **GovTech Green** palette (`#15803D`, `#F8FAF8`) combined with premium UI aesthetics:
- **Glassmorphism**: Frosted glass panels over gradient mesh backgrounds.
- **Micro-Animations**: Smooth hover states, expanding accordions, and tactile button feedback.
- **Typography**: Spacious, legible sans-serif fonts prioritizing readability for all age groups.

<div align="center">
  <br/>
  <i>Made in India 🇮🇳 Built for Smart Bharat 🏙️</i>
</div>
