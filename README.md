# TABEYO Frontend

TABEYO is an AI-powered menu scanning web application designed for travelers and international users who struggle with local paper menus.

Users can:
- Scan restaurant menus using a custom web camera UI
- Analyze menu items with AI
- View structured menu cards
- Get personalized recommendations
- Detect allergy risks
- Generate order-ready text for restaurant staff

This repository contains the frontend implementation built with Next.js, TypeScript, and Tailwind CSS.

---

# Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Context API
- Lucide React

---

# Features

## Menu Scanning
- Custom in-app camera UI
- Multiple image capture
- Image preview and deletion

## AI Menu Analysis
- OCR-based menu extraction
- Structured menu parsing
- Ingredient estimation
- Allergy detection
- Spiciness analysis

## Personalized Recommendations
- Language-based UI
- Recommendation regarding allergy, budget, number of people, etc

## Ordering Support
- Cart system
- Generated order text
- Easy-to-show ordering screen

---

# Routing Overview

| Route | Description |
|---|---|
| `/` | Main landing page |
| `/camera` | Custom camera scanning page |
| `/result` | OCR and AI analysis result page |
| `/menu` | Structured menu list |
| `/detailed/[id]` | Detailed menu item page |

---

# Getting Started

## 1. Install Dependencies

```bash
npm install
```

---

## 2. Run Development Server

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

# Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=your_api_url
```
