# Implementation Plan - LD Interiors AI Enterprise Chatbot Upgrade

This plan details the updates to upgrade the virtual assistant to the **LD Interiors AI - Enterprise System Prompt** specifications. We will add a stateful conversational slot-filling machine, direct image rendering in chat bubbles, image uploading and simulated analysis, and a calmer, more pleasant voice mode matching the showroom receptionist profile.

## User Review Required

> [!IMPORTANT]
> - **No Repetitive Headers**: Based on your feedback, the chatbot will **not** prepend the customer's account/order header on every message.
> - **Top Header Status**: Instead, a small status indicator will be shown in the chatbot window title header (e.g., `Logged in as Sai (9346325291)`).
> - **On-Demand Tracking**: The bot will only print the detailed order status when the user explicitly asks about their orders or tracking.

## Proposed Changes

### 1. Stateful Conversational Slot-Filling Machine

#### [MODIFY] [ClientWrapper.js](file:///d:/ai/frontend/src/components/ClientWrapper.js)
- Add a new React state `workflowState` to track active slot-filling sessions:
  ```javascript
  const [workflowState, setWorkflowState] = useState({
    type: 'idle', // 'idle', 'interior', 'custom', 'order'
    step: 0,
    lang: 'en', // 'en', 'te', 'tan'
    collected: {},
    awaitingConfirmation: false
  });
  ```
- Define workflow step arrays:
  - `INTERIOR_STEPS`: room, dimensions, budget, style, colors, location, timeline.
  - `CUSTOM_STEPS`: name, phone, address, city, furnitureType, length, width, height, material, finish, color, timeline, specialRequirements, budget.
  - `ORDER_STEPS`: product, name, phone, address, city, pincode, deliveryAddress, deliveryDate, customization, quantity.
- Implement helper functions:
  - `detectLanguageStyle(input)`: returns `'te'` for Telugu script, `'tan'` for Tanglish, and `'en'` for English.
  - `getQuestionText(field, lang)`: returns the translated question based on language.
  - `findNextEmptyStep(steps, collected)`: finds the index of the first uncompleted field.
  - `formatProductDetails(item, lang)`: returns formatted product details (Material, Finish, Available Colors, Dimensions, Availability, Price).
- Upgrade `getBotResponse(input, currentWorkflow)` to handle:
  - Entering a workflow when matching keywords are detected.
  - Advancing through steps and saving answers.
  - Displaying a summary and requesting confirmation (`yes` / `confirm`) once all slots are filled.
  - Submitting orders to the backend on confirmation and displaying a success message.
  - Normal RAG product searches with similar product recommendations.

---

### 2. Rendering Product Images in Chat Bubbles & Image Recommendation

#### [MODIFY] [ClientWrapper.js](file:///d:/ai/frontend/src/components/ClientWrapper.js)
- Update the chatbot's message history structure to optionally include an `images` array:
  ```javascript
  { sender: 'bot', text: '...', images: ['url1', 'url2'], action: ... }
  ```
- Update `handleChatSubmit` and `handleQuickPrompt` to extract the `images` returned by `getBotResponse` and append them to the message state.
- Update the message bubble renderer JSX around line 935 to display these images in a neat 2-column grid when present. When clicked, these images will select the product in the checkout tab.

---

### 3. Image Understanding & Upload Support

#### [MODIFY] [ClientWrapper.js](file:///d:/ai/frontend/src/components/ClientWrapper.js)
- Add a hidden file input `<input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />` to the chat footer.
- Add a `Camera` icon button next to the chat text input.
- Implement `handleImageUpload(e)`:
  - Read the selected image, generate a local preview URL, and append a user message with the image to the chat history.
  - Trigger a chatbot response after 1.5 seconds simulating "image understanding" (identifying room type, style, colors, materials, and recommending matching products from the database).
- Update the message bubble renderer to display the user's uploaded image inside the user's bubble.

---

### 4. Voice Mode Refinements

#### [MODIFY] [ClientWrapper.js](file:///d:/ai/frontend/src/components/ClientWrapper.js)
- Ensure the welcome message speaks on first-visit vs returning-visit:
  - **First visit**: Speaks `"Welcome to LD Interiors and Furniture! We are delighted to have you here. How can I help you today?"`.
  - **Returning user**: Speaks `"Welcome back! What would you like to explore today?"`.
- Update `speakMessage` to:
  - Exit early if the chatbot is not open (`if (!isChatOpen) return;`).
  - Correctly filter for local female voices for both Telugu (`te-IN`) and English/Indian English (`en-IN`/`en-US`).
  - Maintain a slow showroom receptionist speech rate (`rate = 0.85`).

---

## Verification Plan

### Automated Tests
- Run `npm run build` inside `frontend/` to verify that Next.js compiles the updated ClientWrapper component without type or layout errors.

### Manual Verification
- Open the chatbot and verify that the first-time welcome message is shown and spoken.
- Refresh the page and verify that the returning welcome message is shown instead.
- Type "I want modular kitchen interiors" and walk through the step-by-step slot-filling process in English, then test in Telugu/Tanglish.
- Upload an image and verify that the bot analyzes it and recommends matching products.
- Close the chatbot mid-speech and verify that the voice synthesis cancels immediately.
