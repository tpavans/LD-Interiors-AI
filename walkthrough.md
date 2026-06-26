# Walkthrough - LD Interiors AI Chatbot Upgrade

This document outlines the changes implemented to upgrade the virtual assistant to the **LD Interiors AI - Enterprise System Prompt** specifications.

## Changes Implemented

### 1. Stateful Conversational Machine & Slot-Filling Workflows
- **Workflows Added**: 
  - **Interior Design Consultation**: Prompts for `room`, `dimensions`, `budget`, `style`, `colors`, `location`, and `timeline`. At the end, summarizes the details and recommends matching products.
  - **Custom Furniture**: Prompts for `furnitureType`, `length`, `width`, `height`, `material`, `finish`, `color`, `timeline`, `specialRequirements`, and `budget`. Walks the user through confirmation (`yes` / `confirm`) before calling the backend.
  - **Order Checkout**: Prompts for `product`, `name`, `phone`, `address`, `city`, `pincode`, `deliveryAddress`, `deliveryDate`, `customization`, and `quantity`. Incorporates the mandatory **Price Confirmation** Mr. Nagaraju alert, summarizes the details, and waits for explicit `yes` / `confirm` confirmation.
- **Language Detection**: Automatically detects Telugu script (`'te'`), Tanglish (`'tan'`), or English (`'en'`), and dynamically serves questions in that language style.
- **Pre-filling**: Prefills the customer's name, phone, and selected product from local registration states so the bot does not ask duplicate questions.

### 2. Cleaner Chat Layout & Non-Repetitive Headers
- Removed the repetitive profile header from the top of every chatbot reply bubble.
- Added a tiny logged-in status badge (`👤 Logged in as: {Name}`) directly in the chatbot window's top header.
- On-demand tracking details are only printed when the user explicitly asks about their orders.

### 3. Rich Image Recommendations inside Chat Bubbles
- Updated the bot response message schema to support `images: string[]`.
- Formatted RAG search results to render product image grids directly inside the chatbot speech bubble.
- Added click interactions to the recommended images: clicking any recommended product image automatically redirects the user to the checkout tab with that product pre-selected.

### 4. Image Upload & Layout Analysis Simulation
- Added a `Camera` icon button next to the chat text input.
- Added a hidden file input supporting image selections.
- When a user uploads a room layout photo:
  1. The preview of the uploaded room image is displayed inside the user's chat bubble.
  2. The bot runs a 1.5-second simulation analyzing the room type, style, colors, materials, and recommending matching products from the live database.

### 5. Female Showroom Receptionist Voice Mode
- Enforced `isChatOpen` check: voice synthesis will not start if the chatbot is closed, and cancels immediately when the user exits/closes the chat.
- Prioritizes female local Telugu and English voices, operating at a slow, pleasant rate (`0.85`).

---

## Verification Results

### Build Verification
- **Command**: `npm run build` inside `frontend/`
- **Result**: **SUCCESS** (Compiled and optimized all static/dynamic routes successfully with zero warnings or errors).
