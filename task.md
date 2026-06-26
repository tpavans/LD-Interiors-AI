# Task Checklist - LD Interiors AI Chatbot Upgrade

- [x] Declare workflow and file input states in `ClientWrapper.js`
- [x] Define step constants (`INTERIOR_STEPS`, `CUSTOM_STEPS`, `ORDER_STEPS`) and translation helpers
- [x] Update `speakMessage` to cancel on close and check `isChatOpen`
- [x] Update `getBotResponse` with RAG search, similar products, and stateful slot-filling
- [x] Add hidden file input and Camera icon in the chat footer
- [x] Implement `handleImageUpload` logic and simulation response
- [x] Update JSX message bubble renderer to display bot image recommendations and user uploaded images
- [x] Update JSX chat header to show a clean logged-in badge instead of repeating it in chat bubbles
- [x] Run Next.js build verification
- [x] Add Call buttons for both Nagaraju (+916281653998) and Pavan Sai (+919346325291) to product cards and product detail page
- [x] Add select contact dropdown to choose which admin (Nagaraju, Pavan Sai, or both) to send the WhatsApp order/inquiry to
- [x] Update WhatsApp redirection URLs based on chosen admin selector in all modal forms and chatbot panels
- [x] Run Next.js build validation on updated code
