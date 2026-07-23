"use client";
import { useState, useEffect, useRef } from 'react';
import { Sparkles, MessageSquare, X, Send, Phone, User, Check, Hammer, HelpCircle, ShoppingBag, MessageCircle, MapPin, Loader2, Camera, Heart } from 'lucide-react';
import api from '@/utils/api';

export default function ClientWrapper() {
  // Visitor Registration Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isRegistered, setIsRegistered] = useState(true);

  // Liked Designs Count
  const [likedCount, setLikedCount] = useState(0);

  useEffect(() => {
    const checkLiked = () => {
      try {
        const liked = JSON.parse(localStorage.getItem('ld_liked_designs') || '[]');
        setLikedCount(liked.length);
      } catch (err) {
        setLikedCount(0);
      }
    };
    checkLiked();
    window.addEventListener('storage', checkLiked);
    window.addEventListener('liked-updated', checkLiked);
    return () => {
      window.removeEventListener('storage', checkLiked);
      window.removeEventListener('liked-updated', checkLiked);
    };
  }, []);

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'order'
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! Welcome to LD Interiors & Furnitures. How can I help you today? Wood work options, price estimations, and design details adagandi!'
    }
  ]);

  // Live Database Products State for RAG Search
  const [dbProducts, setDbProducts] = useState([]);

  // Stateful Conversational Workflow Machine State
  const [workflowState, setWorkflowState] = useState({
    type: 'idle', // 'idle', 'interior', 'custom', 'order'
    step: 0,
    lang: 'en',
    collected: {},
    awaitingConfirmation: false
  });

  const fileInputRef = useRef(null);

  const INTERIOR_STEPS = [
    { field: 'room', question: 'Which room or space are we designing (e.g. Living room, Bedroom, Kitchen)?' },
    { field: 'dimensions', question: 'What are the room dimensions?' },
    { field: 'budget', question: 'What is your approximate budget?' },
    { field: 'style', question: 'Do you have a preferred design style (e.g. Modern, Traditional, Minimalist)?' },
    { field: 'colors', question: 'What are your preferred colors?' },
    { field: 'location', question: 'What is your location?' },
    { field: 'timeline', question: 'What is your preferred timeline for completion?' }
  ];

  const CUSTOM_STEPS = [
    { field: 'furnitureType', question: 'What type of furniture do you want to customize (e.g. Sofa, Bed, Wardrobe, Temple, Gummam)?' },
    { field: 'length', question: 'What is the preferred length of the furniture?' },
    { field: 'width', question: 'What is the preferred width?' },
    { field: 'height', question: 'What is the preferred height?' },
    { field: 'material', question: 'What material would you like to use (e.g. Premium Teak Wood, Plywood)?' },
    { field: 'finish', question: 'What finish do you prefer (e.g. Matte, Glossy PU, Melamine)?' },
    { field: 'color', question: 'What color do you want?' },
    { field: 'timeline', question: 'What is your preferred timeline for delivery?' },
    { field: 'specialRequirements', question: 'Any special requirements or notes?' },
    { field: 'budget', question: 'What is your approximate budget?' },
    { field: 'email', question: 'Could you please confirm your email address?' },
    { field: 'address', question: 'Could you please confirm your delivery address?' }
  ];

  const ORDER_STEPS = [
    { field: 'product', question: 'Which product or design would you like to order?' },
    { field: 'name', question: 'Could you please confirm your name?' },
    { field: 'phone', question: 'Could you please confirm your mobile number?' },
    { field: 'address', question: 'What is your Address?' },
    { field: 'city', question: 'What is your City?' },
    { field: 'pincode', question: 'What is your Pincode?' },
    { field: 'deliveryAddress', question: 'What is the Delivery Address?' },
    { field: 'deliveryDate', question: 'What is your Preferred Delivery Date (YYYY-MM-DD)?' },
    { field: 'customization', question: 'Any customizations or special comments?' },
    { field: 'quantity', question: 'What quantity do you need?' }
  ];

  const detectLanguageStyle = (inputText) => {
    const query = inputText.toLowerCase().trim();
    const teluguPattern = /[\u0c00-\u0c7f]/;
    if (teluguPattern.test(query)) return 'te';
    
    const teluguWords = [
      'unndi', 'unnda', 'unai', 'unnai', 'kavali', 'kaavali', 'yentha', 'entha', 'dhara', 'ekada', 'ekkada', 
      'bhagundi', 'meeru', 'mee', 'order', 'status', 'garu', 'namaste', 'dhanyavaadalu', 'chudali', 'chudu',
      'ఉందా', 'ఉన్నాయి', 'కావాలి', 'చూపించు', 'చెప్పు', 'ఏమేమి', 'లిస్ట్', 'ప్రొడక్ట్స్', 'కలప'
    ];
    const isTanglish = teluguWords.some(w => query.includes(w));
    return isTanglish ? 'tan' : 'en';
  };

  const getQuestionText = (field, lang) => {
    const translations = {
      room: {
        en: 'Which room or space are we designing (e.g. Living room, Bedroom, Kitchen)?',
        te: 'మనం ఏ గది లేదా స్థలాన్ని డిజైన్ చేస్తున్నాము (ఉదాహరణకు: లివింగ్ రూమ్, బెడ్‌రూమ్, కిచెన్)?',
        tan: 'Manam ఏ room leda space design chesthunnam (e.g., Living room, Bedroom, Kitchen)?'
      },
      dimensions: {
        en: 'What are the room dimensions (e.g. 10x12 feet)?',
        te: 'గది కొలతలు ఎంత (ఉదాహరణకు: 10x12 అడుగులు)?',
        tan: 'Room dimensions entha (e.g., 10x12 feet)?'
      },
      budget: {
        en: 'What is your approximate budget?',
        te: 'మీ అంచనా బడ్జెట్ ఎంత?',
        tan: 'Mee approximate budget entha?'
      },
      style: {
        en: 'Do you have a preferred design style (e.g. Modern, Traditional, Minimalist)?',
        te: 'మీకు నచ్చిన డిజైన్ శైలి ఉందా (ఉదాహరణకు: మోడ్రన్, సాంప్రదాయ, మినిమలిస్ట్)?',
        tan: 'Mee preferred design style entha (e.g., Modern, Traditional, Minimalist)?'
      },
      colors: {
        en: 'What are your preferred colors?',
        te: 'మీరు ఏ రంగులను ఇష్టపడుతున్నారు?',
        tan: 'Mee preferred colors entha?'
      },
      location: {
        en: 'What is your location?',
        te: 'మీరు ఏ ప్రాంతం నుండి మాట్లాడుతున్నారు?',
        tan: 'Mee location ekkada?'
      },
      timeline: {
        en: 'What is your preferred timeline for completion (e.g. 1 month)?',
        te: 'పని పూర్తి కావడానికి మీ గడువు ఎంత (ఉదాహరణకు: 1 నెల)?',
        tan: 'Mee timeline target entha time lo complete kavalani (e.g., 1 month)?'
      },
      furnitureType: {
        en: 'What type of furniture do you want to customize (e.g. Sofa, Bed, Wardrobe, Pooja Temple, Main Door Frame)?',
        te: 'మీరు ఏ రకమైన ఫర్నిచర్‌ను అనుకూలీకరించాలనుకుంటున్నారు (ఉదాహరణకు: సోఫా, మంచం, పూజా మందిరం)?',
        tan: 'Manam ఏ type of furniture design customize cheyyali (e.g. Sofa, Bed, Wardrobe, Pooja Mandiram)?'
      },
      length: {
        en: 'What is the preferred length of the furniture?',
        te: 'ఫర్నిచర్ యొక్క పొడవు ఎంత ఉండాలి?',
        tan: 'Furniture length (podaavu) entha kavali?'
      },
      width: {
        en: 'What is the preferred width?',
        te: 'వెడల్పు ఎంత ఉండాలి?',
        tan: 'Furniture width (vedalpu) entha kavali?'
      },
      height: {
        en: 'What is the preferred height?',
        te: 'ఎత్తు ఎంత ఉండాలి?',
        tan: 'Furniture height (etthu) entha kavali?'
      },
      material: {
        en: 'What material would you like to use (e.g. Premium Teak Wood, Plywood)?',
        te: 'మీరు ఏ రకమైన మెటీరియల్ ఉపయోగించాలనుకుంటున్నారు (ఉదాహరణకు: టేకు కలప, ప్లైవుడ్)?',
        tan: 'Wood details lo ఏ material use cheyyali (e.g. Premium Teak Wood, Plywood)?'
      },
      finish: {
        en: 'What finish do you prefer (e.g. Matte, Glossy PU, Melamine)?',
        te: 'మీకు ఎలాంటి ఫినిషింగ్ కావాలి (ఉదాహరణకు: మ్యాట్, గ్లోసీ)?',
        tan: 'Mee preferred finish type entha (e.g. Matte, Glossy PU, Melamine)?'
      },
      color: {
        en: 'What color do you prefer?',
        te: 'మీరు ఏ రంగును కోరుకుంటున్నారు?',
        tan: 'Mee preferred color entha?'
      },
      specialRequirements: {
        en: 'Do you have any special requirements or notes?',
        te: 'మీకు ఏవైనా ప్రత్యేక అవసరాలు లేదా గమనికలు ఉన్నాయా?',
        tan: 'Inka emaina special requirements lera design customizations kavala?'
      },
      product: {
        en: 'Which product or design would you like to order?',
        te: 'మీరు ఏ ప్రొడక్ట్ లేదా డిజైన్‌ను ఆర్డర్ చేయాలనుకుంటున్నారు?',
        tan: 'Mee order cheyyali anukuntunna product / design name cheppandi?'
      },
      name: {
        en: 'Could you please confirm your name?',
        te: 'దయచేసి మీ పేరును నిర్ధారించండి?',
        tan: 'Dayachesi mee Name confirm cheyyandi?'
      },
      phone: {
        en: 'Could you please confirm your mobile number?',
        te: 'దయచేసి మీ మొబైల్ నంబర్‌ను నిర్ధారించండి?',
        tan: 'Dayachesi mee mobile number confirm cheyyandi?'
      },
      address: {
        en: 'What is your Address?',
        te: 'మీ చిరునామా (Address) ఏమిటి?',
        tan: 'Mee Address details cheppandi?'
      },
      city: {
        en: 'What is your City?',
        te: 'మీ నగరం (City) ఏమిటి?',
        tan: 'Mee City details cheppandi?'
      },
      pincode: {
        en: 'What is your Pincode?',
        te: 'మీ పిన్‌కోడ్ (Pincode) ఏమిటి?',
        tan: 'Mee Pincode number entha?'
      },
      deliveryAddress: {
        en: 'What is the Delivery Address?',
        te: 'డెలివరీ చిరునామా (Delivery Address) ఏమిటి?',
        tan: 'Mee Delivery Address details cheppandi?'
      },
      deliveryDate: {
        en: 'What is your Preferred Delivery Date (YYYY-MM-DD)?',
        te: 'మీరు కోరుకునే డెలివరీ తేదీ ఏది (YYYY-MM-DD)?',
        tan: 'Mee preferred delivery date eppudu kavali (YYYY-MM-DD)?'
      },
      customization: {
        en: 'Any customizations or comments?',
        te: 'ఏదైనా కస్టమైజేషన్ లేదా గమనికలు ఉన్నాయా?',
        tan: 'Mee details adjustments customizations details emaina unnaya?'
      },
      quantity: {
        en: 'What quantity do you need?',
        te: 'మీకు ఎన్ని కావాలి (పరిమాణం)?',
        tan: 'Enni items quantity kavali?'
      }
    };
    return translations[field]?.[lang] || translations[field]?.['en'] || '';
  };

  const findNextEmptyStep = (steps, collected) => {
    return steps.findIndex(s => !collected[s.field] || String(collected[s.field]).trim() === '');
  };

  const formatProductDetails = (item, lang) => {
    const title = item.title;
    const desc = item.description || 'Premium custom design crafted to perfection.';
    
    let material = 'First-Quality Teak Wood (Vayasina Teku Balla)';
    let finish = 'Melamine Matte / Glossy Polish';
    let colors = 'Natural Teak, Golden Oak, Dark Walnut';
    let dimensions = 'Customizable as per space';
    let availability = 'Built to Order (10-15 Days)';
    
    const titleLower = title.toLowerCase();
    const catLower = item.category.toLowerCase();
    
    if (titleLower.includes('sofa') || catLower.includes('sofa')) {
      material = 'High-Density Foam & Premium upholstery fabric / Teak Wood frame';
      finish = 'Fabric Matte Finish';
      colors = 'Grey, Beige, Blue, Custom Fabric Selections';
      dimensions = 'Custom Sectional / L-Shape dimensions';
    } else if (titleLower.includes('bed') || catLower.includes('bed') || catLower.includes('bedroom')) {
      material = 'Premium Teak Wood (Mettu Teak)';
      finish = 'Natural Polish / PU Paint';
      colors = 'Teak Wood Natural, Rosewood Finish';
      dimensions = 'King Size (72x75 inches) or Custom';
    } else if (titleLower.includes('kitchen') || catLower.includes('kitchen')) {
      material = 'Marine Grade Boiling Water Resistant (BWR) Plywood';
      finish = 'Acrylic / High-Gloss Laminate';
      colors = 'Dual Tone, Grey & White, Wooden Textured';
      dimensions = 'Modular as per kitchen layout';
    } else if (titleLower.includes('wardrobe') || catLower.includes('wardrobe')) {
      material = 'High-Quality Engineered Wood / Plywood';
      finish = 'Laminate / Glass sliding doors';
      colors = 'White Glossy, Wooden Laminate, Dark Oak';
      dimensions = 'Custom height and width';
    } else if (titleLower.includes('mandiram') || titleLower.includes('temple') || titleLower.includes('pooja')) {
      material = 'Pure Teak Wood (Teak Balla)';
      finish = 'Hand-carved Melamine Glossy Polish';
      colors = 'Traditional Teak Red / Natural Honey';
      dimensions = 'Customizable (e.g., 3x2x4 feet)';
    }

    const priceStr = item.price && item.price > 0 ? `₹${item.price.toLocaleString('en-IN')}` : 'Contact for Quotation';
    
    if (lang === 'te') {
      return `📦 **${title}**
- **వివరణ**: ${desc}
- **మెటీరియల్**: ${material}
- **ఫినిషింగ్**: ${finish}
- **రంగులు**: ${colors}
- **కొలతలు**: ${dimensions}
- **లభ్యత**: ${availability}
- **ధర**: ${priceStr}`;
    } else {
      return `📦 **${title}**
- **Description**: ${desc}
- **Material**: ${material}
- **Finish**: ${finish}
- **Available Colors**: ${colors}
- **Dimensions**: ${dimensions}
- **Availability**: ${availability}
- **Price**: ${priceStr}`;
    }
  };

  
  // WhatsApp Order Form State
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderEmail, setOrderEmail] = useState('');
  const [orderAddress, setOrderAddress] = useState('');
  const [customSize, setCustomSize] = useState('');
  const [desiredPrice, setDesiredPrice] = useState('');
  const [referenceImageFile, setReferenceImageFile] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Customer Order Tracking State
  const [trackPhone, setTrackPhone] = useState('');
  const [trackedOrders, setTrackedOrders] = useState([]);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check if user is registered in localStorage
    const registered = localStorage.getItem('ld_user_registered');
    const savedName = localStorage.getItem('ld_user_name') || '';
    const savedPhone = localStorage.getItem('ld_user_phone') || '';
    
    // Determine welcome message based on session storage
    const welcomed = sessionStorage.getItem('ld_welcomed');
    let welcomeText = '';
    
    if (!welcomed) {
      welcomeText = `👋 Welcome to LD Interiors & Furniture!

I am your AI Assistant (LD Assistant). Here is how I can guide you:

1. 🔍 **Search Designs**: Type any furniture (e.g., "Pooja Mandir", "Sofa", "Beds") to explore categories and see pricing.
2. 📦 **WhatsApp Checkout**: Go to the **Order Now** tab or tell me what design you want to place a custom inquiry via WhatsApp.
3. 📍 **Live Status Track**: Go to the **Track** tab or enter your 10-digit mobile number to track carpentry progress from our workshop.
4. 📷 **Room Photo Recommendations**: Click the camera icon at the bottom left to upload a room picture for design suggestions.
5. 🗣️ **Local Speech Support**: I speak and reply in English, Telugu, and Tanglish! Keep your device unmuted.

How can I help you today?`;
      sessionStorage.setItem('ld_welcomed', 'true');
    } else {
      welcomeText = `Welcome back! What would you like to explore today? (Type "guide" or click "📖 How to Use" below for instructions.)`;
    }

    setMessages([
      {
        sender: 'bot',
        text: welcomeText
      }
    ]);

    const savedEmail = localStorage.getItem('ld_user_email') || '';
    const savedAddress = localStorage.getItem('ld_user_address') || '';

    if (savedPhone) {
      setIsRegistered(true);
      setUserName(savedName);
      setUserPhone(savedPhone);
      setOrderName(savedName);
      setOrderPhone(savedPhone);
      setOrderEmail(savedEmail);
      setOrderAddress(savedAddress);
      setTrackPhone(savedPhone);
      fetchTrackedOrders(savedPhone);
    }

    // Fetch all database products for conversational RAG search
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setDbProducts(response.data);
        if (response.data && response.data.length > 0) {
          setSelectedProduct(response.data[0].title);
        }
      } catch (err) {
        console.error('Error loading designs list for chatbot:', err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    // Scroll chat to bottom when messages update
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen, activeTab]);

  // Handle registration submit
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!userName.trim()) {
      setRegisterError('Please enter your name.');
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(userPhone)) {
      setRegisterError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Save registration details
    localStorage.setItem('ld_user_registered', 'true');
    localStorage.setItem('ld_user_name', userName.trim());
    localStorage.setItem('ld_user_phone', userPhone.trim());
    setShowRegisterModal(false);
    setIsRegistered(true);
    
    // Sync order form fields
    setOrderName(userName.trim());
    setOrderPhone(userPhone.trim());

    // Personalize bot greeting with first visit welcome
    setMessages([
      {
        sender: 'bot',
        text: `👋 Welcome to LD Interiors & Furniture!

I am your AI Assistant (LD Assistant). Here is how I can guide you:

1. 🔍 **Search Designs**: Type any furniture (e.g., "Pooja Mandir", "Sofa", "Beds") to explore categories and see pricing.
2. 📦 **WhatsApp Checkout**: Go to the **Order Now** tab or tell me what design you want to place a custom inquiry via WhatsApp.
3. 📍 **Live Status Track**: Go to the **Track** tab or enter your 10-digit mobile number to track carpentry progress from our workshop.
4. 📷 **Room Photo Recommendations**: Click the camera icon at the bottom left to upload a room picture for design suggestions.
5. 🗣️ **Local Speech Support**: I speak and reply in English, Telugu, and Tanglish! Keep your device unmuted.

How can I help you today?`
      }
    ]);
    sessionStorage.setItem('ld_welcomed', 'true');
  };

  const speakMessage = (text, isTelugu = false) => {
    if (!isChatOpen) return;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        
        // Clean markdown, links, emojis, and special chars for speech
        let cleanText = text
          .replace(/\*\*?/g, '') // remove markdown bold asterisks
          .replace(/https?:\/\/\S+/g, '') // remove URLs
          .replace(/[👉👉📲📞★☆👉👤|]/g, '') // remove emojis/symbols
          .replace(/\s+/g, ' ')
          .trim();

        // Showroom receptionist behavior: never speak long paragraphs.
        // Speak only the first sentence or first line so it sounds like a real assistant.
        const sentences = cleanText.split(/[.!?\n]/).filter(s => s.trim().length > 0);
        if (sentences.length > 0) {
          // Speak up to first 2 sentences
          cleanText = sentences.slice(0, 2).join('. ') + '.';
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Get browser voices
        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;

        // Function to detect female voices by name
        const isFemaleVoice = (v) => {
          const name = v.name.toLowerCase();
          return name.includes('female') || 
                 name.includes('zira') || 
                 name.includes('samantha') || 
                 name.includes('google us english') || 
                 name.includes('hazel') || 
                 name.includes('susan') || 
                 name.includes('heera') || 
                 name.includes('haruka') || 
                 name.includes('karen') || 
                 name.includes('moira') || 
                 name.includes('tessa') || 
                 name.includes('veena') ||
                 name.includes('priya') ||
                 name.includes('swara') ||
                 name.includes('neerja');
        };
        
        if (isTelugu) {
          // Look for Telugu voice first
          selectedVoice = voices.find(v => v.lang.startsWith('te') && isFemaleVoice(v)) || voices.find(v => v.lang.startsWith('te'));
          if (selectedVoice) {
            utterance.lang = 'te-IN';
            utterance.voice = selectedVoice;
          } else {
            // Fall back to Indian English voice which reads Tanglish words phonetically better (prefer female)
            selectedVoice = voices.find(v => (v.lang.includes('en-IN') || v.name.includes('India') || v.name.includes('Indian')) && isFemaleVoice(v))
                         || voices.find(v => v.lang.includes('en-IN') || v.name.includes('India') || v.name.includes('Indian'));
            if (selectedVoice) {
              utterance.lang = 'en-IN';
              utterance.voice = selectedVoice;
            } else {
              utterance.lang = 'en-US';
            }
          }
        } else {
          // Standard English or Indian English (prefer female)
          selectedVoice = voices.find(v => (v.lang.includes('en-IN') || v.name.includes('India') || v.name.includes('Indian')) && isFemaleVoice(v))
                       || voices.find(v => v.lang.startsWith('en') && isFemaleVoice(v))
                       || voices.find(v => v.lang.includes('en-IN') || v.name.includes('India') || v.name.includes('Indian'))
                       || voices.find(v => v.lang.startsWith('en'));
          if (selectedVoice) {
            utterance.lang = selectedVoice.lang;
            utterance.voice = selectedVoice;
          } else {
            utterance.lang = 'en-US';
          }
        }
        
        utterance.rate = 0.85; // Calm, pleasant, slow showroom receptionist pace
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('Speech synthesis error:', err);
      }
    }
  };

  useEffect(() => {
    if (isChatOpen) {
      const welcomed = sessionStorage.getItem('ld_welcomed_speak');
      if (!welcomed) {
        speakMessage("Welcome to LD Interiors and Furniture! We are delighted to have you here. How can I help you today?", false);
        sessionStorage.setItem('ld_welcomed_speak', 'true');
      } else {
        speakMessage("Welcome back! What would you like to explore today?", false);
      }
    } else {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isChatOpen]);

  // Heuristics to detect if the user's query is in English vs Telugu/Tanglish
  const checkIsEnglishQuery = (inputText) => {
    const query = inputText.toLowerCase().trim();
    const teluguPattern = /[\u0c00-\u0c7f]/;
    if (teluguPattern.test(query)) return false;
    
    const teluguWords = [
      'unndi', 'unnda', 'unai', 'unnai', 'kavali', 'kaavali', 'yentha', 'entha', 'dhara', 'ekada', 'ekkada', 
      'bhagundi', 'meeru', 'mee', 'order', 'status', 'garu', 'namaste', 'dhanyavaadalu', 'chudali', 'chudu',
      'ఉందా', 'ఉన్నాయి', 'కావాలి', 'చూపించు', 'చెప్పు', 'ఏమేమి', 'లిస్ట్', 'ప్రొడక్ట్స్', 'కలప'
    ];
    return !teluguWords.some(w => query.includes(w));
  };

  // Bot response logic based on RAG query matching and keyword mapping (Telugu, English & Tanglish)
  const getBotResponse = (input, currentWorkflow) => {
    const query = input.toLowerCase().trim();
    const useEnglish = checkIsEnglishQuery(input);
    const langStyle = detectLanguageStyle(input);
    let matchedProductTitle = null;

    // Detect matched product title for action button
    const findMatchedProduct = () => {
      if (query.includes('swing') || query.includes('uyyala') || query.includes('ఉయ్యాల')) {
        return "Teak Wood Baby Swing";
      } else if (query.includes('sofa') || query.includes('సోఫా')) {
        return "Custom Sofa Sectional Layout";
      } else if (query.includes('bed') || query.includes('మంచం')) {
        return "Custom Bedroom/Wardrobe Furniture";
      } else if (query.includes('door') || query.includes('తలుపు')) {
        return "Custom Teak Carved Entrance Door";
      } else if (query.includes('mandiram') || query.includes('mandiralu') || query.includes('temple') || query.includes('pooja') || query.includes('devudi') || query.includes('మండపం') || query.includes('గుడి')) {
        return "Custom Devudi Mandiram (Pooja Temple)";
      } else if (query.includes('gummalu') || query.includes('gummam') || query.includes('frame') || query.includes('frames') || query.includes('గుమ్మాలు') || query.includes('గుమ్మం')) {
        return "Custom Teak Gummam (Main Door Frame)";
      } else if (query.includes('dressing') || query.includes('mirror') || query.includes('makeup') || query.includes('అద్దం బల్ల') || query.includes('డ్రెస్సింగ్')) {
        return "Custom Teak Dressing Table with Mirror";
      }
      const matched = dbProducts.find(p => p.title.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
      return matched ? matched.title : null;
    };
    
    matchedProductTitle = findMatchedProduct();

    // 1. Check for workflow cancellation or quick action redirection
    const isCancel = query === 'cancel' || query === 'stop' || query === 'exit' || query === 'reset' || query === 'restart' || query === 'వద్దు' || query === 'ఆపు' || query === 'ఆపండి';
    const isQuickPromptText = [
      '📖 how to use',
      'i want to order a design',
      'track my order progress',
      'i need customer support help',
      'contact information for admins',
      'where is your workshop address?'
    ].includes(query);
    const isCategoryClick = query.startsWith('browse ');

    let activeWorkflow = currentWorkflow;
    if (isCancel || isQuickPromptText || isCategoryClick) {
      activeWorkflow = { type: 'idle', step: 0, lang: langStyle, collected: {}, awaitingConfirmation: false };
      if (isCancel) {
        return {
          text: langStyle === 'en'
            ? `Okay, I have cancelled the current custom design wizard. How else can I assist you?`
            : langStyle === 'te'
            ? `సరే అండీ, నేను ప్రస్తుత కస్టమ్ డిజైన్ విజార్డ్‌ను రద్దు చేసాను. నేను మీకు ఇంకా ఎలా సహాయపడగలను?`
            : `Okay andi, current custom wizard cancel chesam. Inkela help cheyagalanu?`,
          nextState: activeWorkflow
        };
      }
    }

    // ----------------------------------------------------
    // WORKFLOW STATE MACHINE
    // ----------------------------------------------------
    if (activeWorkflow && activeWorkflow.type !== 'idle') {
      const { type, step, lang, collected, awaitingConfirmation } = activeWorkflow;

      // Handle Order / Custom Confirmation Step
      if (awaitingConfirmation) {
        const isYes = query.includes('yes') || query.includes('confirm') || query.includes('avunu') || query.includes('okay') || query.includes('ok') || query.includes('yes close') || query.includes('avunu andi') || query.includes('అవును');
        if (isYes) {
          // Trigger backend function submitOrder()
          const submitWorkflowOrder = async () => {
            try {
              const matchedProduct = dbProducts.find(p => p.title === (collected.product || collected.furnitureType));
              const productImage = matchedProduct ? matchedProduct.image : '';
              const absoluteImageUrl = productImage ? (productImage.startsWith('http') ? productImage : `${window.location.origin}${productImage.startsWith('/') ? '' : '/'}${productImage}`) : '';

              await api.post('/orders', {
                name: (collected.name || localStorage.getItem('ld_user_name') || 'Guest').trim(),
                phone: (collected.phone || localStorage.getItem('ld_user_phone') || '0000000000').trim(),
                email: (collected.email || localStorage.getItem('ld_user_email') || 'no-email@ldinteriors.com').trim(),
                address: (collected.address || localStorage.getItem('ld_user_address') || 'Workshop pickup').trim(),
                product: (collected.product || collected.furnitureType || 'Custom Furniture').trim(),
                imageUrl: absoluteImageUrl,
                notes: `Custom details: Sizing: ${collected.length || ''}x${collected.width || ''}x${collected.height || ''}, Material: ${collected.material || ''}, Finish: ${collected.finish || ''}, Color: ${collected.color || ''}, Timeline: ${collected.timeline || ''}, Budget: ${collected.budget || ''}, Special: ${collected.specialRequirements || collected.customization || ''}`,
                productId: matchedProduct ? matchedProduct._id : undefined
              });
              // Refresh orders list
              fetchTrackedOrders(collected.phone || localStorage.getItem('ld_user_phone'));
            } catch (err) {
              console.error('Error auto-submitting workflow order:', err);
            }
          };
          submitWorkflowOrder();

          const successText = lang === 'en'
            ? `Thank you! Your order has been submitted successfully. Our team will contact you shortly.`
            : lang === 'te'
            ? `ధన్యవాదాలు! మీ ఆర్డర్ విజయవంతంగా సమర్పించబడింది. మా బృందం త్వరలో మిమ్మల్ని సంప్రదిస్తుంది.`
            : `Thank you! Mee order successfully submit ayyindi andi. Ee pricing parameters checks coordinate cheyadaniki Mr. Nagaraju contact chestharu.`;

          return {
            text: successText,
            nextState: { type: 'idle', step: 0, lang, collected: {}, awaitingConfirmation: false }
          };
        } else {
          const cancelText = lang === 'en'
            ? `Order cancelled. How else can I help you today?`
            : lang === 'te'
            ? `ఆర్డర్ రద్దు చేయబడింది. ఈ రోజు నేను మీకు ఎలా సహాయం చేయగలను?`
            : `Order cancel chesam andi. Eeroju meeku inka ela sahaya padagalanu?`;

          return {
            text: cancelText,
            nextState: { type: 'idle', step: 0, lang, collected: {}, awaitingConfirmation: false }
          };
        }
      }

      // Collect current answer
      const steps = type === 'interior' ? INTERIOR_STEPS : type === 'custom' ? CUSTOM_STEPS : ORDER_STEPS;
      const currentField = steps[step].field;
      const updatedCollected = { ...collected, [currentField]: input };

      // Find next empty step
      const nextStepIdx = findNextEmptyStep(steps, updatedCollected);

      if (nextStepIdx !== -1) {
        const nextField = steps[nextStepIdx].field;
        const question = getQuestionText(nextField, lang);
        return {
          text: question,
          nextState: { type, step: nextStepIdx, lang, collected: updatedCollected }
        };
      } else {
        // All fields filled! Perform final summary & confirmation
        if (type === 'interior') {
          // Recommend products based on room
          const roomValue = (updatedCollected.room || '').toLowerCase();
          let recommendations = [];
          let recImages = [];
          let recText = '';

          if (roomValue.includes('kitchen') || roomValue.includes('వంట')) {
            recommendations = dbProducts.filter(p => p.category.toLowerCase().includes('kitchen') || p.title.toLowerCase().includes('kitchen'));
            recText = lang === 'en'
              ? `We recommend checking out our Premium Modular Kitchen Cabinets.`
              : lang === 'te'
              ? `మా ప్రీమియం మోడ్యులర్ కిచెన్ క్యాబినెట్‌లను చూడాల్సిందిగా మేము సిఫార్సు చేస్తున్నాము.`
              : `Maa Premium Modular Kitchen Cabinets models chudandi, chala baguntayi.`;
          } else if (roomValue.includes('bedroom') || roomValue.includes('పడుకునే') || roomValue.includes('bed')) {
            recommendations = dbProducts.filter(p => p.category.toLowerCase().includes('bed') || p.category.toLowerCase().includes('bedroom') || p.title.toLowerCase().includes('bed'));
            recText = lang === 'en'
              ? `We recommend our Classic Teak Wood Canopy Bed or Bespoke Walnut Wardrobes.`
              : lang === 'te'
              ? `మా క్లాసిక్ టేక్ వుడ్ పందిరి మంచం లేదా వాల్నట్ వార్డ్రోబ్‌లను మేము సిఫార్సు చేస్తున్నాము.`
              : `Maa Classic Teak Wood Canopy Bed leda Walnut Wardrobes models try cheyyandi.`;
          } else if (roomValue.includes('living') || roomValue.includes('hall') || roomValue.includes('sitting') || roomValue.includes('సోఫా')) {
            recommendations = dbProducts.filter(p => p.category.toLowerCase().includes('sofa') || p.category.toLowerCase().includes('living') || p.title.toLowerCase().includes('sofa') || p.title.toLowerCase().includes('tv'));
            recText = lang === 'en'
              ? `We recommend our Premium Chesterfield Sofa or Floating Teak Wood TV Console.`
              : lang === 'te'
              ? `మా ప్రీమియం చెస్టర్‌ఫీల్డ్ సోఫా లేదా టేక్ వుడ్ టీవీ కన్సోల్‌ను మేము సిఫార్సు చేస్తున్నాము.`
              : `Maa Premium Chesterfield Sofa set and TV Console select cheskondi, super looks untayi.`;
          }

          recImages = recommendations.slice(0, 2).map(r => r.image);

          const summaryText = lang === 'en'
            ? `Thank you for sharing your interior design requirements! Here is a summary:
- **Room/Spaces**: ${updatedCollected.room}
- **Dimensions**: ${updatedCollected.dimensions}
- **Approximate Budget**: ${updatedCollected.budget}
- **Style Preference**: ${updatedCollected.style}
- **Colors**: ${updatedCollected.colors}
- **Location**: ${updatedCollected.location}
- **Timeline**: ${updatedCollected.timeline}

${recText} We have shown matching products in the catalog below. Our team will contact you at your location shortly to finalize the consultations.`
            : lang === 'te'
            ? `మీ ఇంటీరియర్ డిజైన్ వివరాలు పంచుకున్నందుకు ధన్యవాదాలు! ఇక్కడ సారాంశం ఉంది:
- **గది/స్థలం**: ${updatedCollected.room}
- **కొలతలు**: ${updatedCollected.dimensions}
- **అంచనా బడ్జెట్**: ${updatedCollected.budget}
- **శైలి**: ${updatedCollected.style}
- **రంగులు**: ${updatedCollected.colors}
- **ప్రాంతం**: ${updatedCollected.location}
- **గడువు**: ${updatedCollected.timeline}

${recText} కింద ఉన్న మ్యాచ్ అయ్యే ప్రొడక్ట్స్‌ని చూడండి. పూర్తి వివరాల కోసం మా బృందం త్వరలోనే మిమ్మల్ని సంప్రదిస్తుంది.`
            : `Mee interior design details share chesinanduku dhanyavaadalu! Summary details checks:
- **Room/Space**: ${updatedCollected.room}
- **Dimensions**: ${updatedCollected.dimensions}
- **Budget**: ${updatedCollected.budget}
- **Style Preference**: ${updatedCollected.style}
- **Colors**: ${updatedCollected.colors}
- **Location**: ${updatedCollected.location}
- **Timeline**: ${updatedCollected.timeline}

${recText} Kinda matching products details display chesam andi. Maa team mimalni consultation finalize cheyadaniki contact chestharu.`;

          return {
            text: summaryText,
            images: recImages,
            nextState: { type: 'idle', step: 0, lang, collected: {} }
          };

        } else if (type === 'custom') {
          const summaryText = lang === 'en'
            ? `Please review your custom furniture details:
- **Furniture Type**: ${updatedCollected.furnitureType}
- **Dimensions**: ${updatedCollected.length} (L) x ${updatedCollected.width} (W) x ${updatedCollected.height} (H)
- **Material**: ${updatedCollected.material}
- **Finish**: ${updatedCollected.finish}
- **Color**: ${updatedCollected.color}
- **Timeline**: ${updatedCollected.timeline}
- **Budget**: ${updatedCollected.budget}
- **Special Requirements**: ${updatedCollected.specialRequirements}

Please review your order details. Would you like to confirm this order? (Type **yes** or **confirm**)`
            : lang === 'te'
            ? `దయచేసి మీ కస్టమ్ ఫర్నిచర్ వివరాలను సమీక్షించండి:
- **ఫర్నిచర్ రకం**: ${updatedCollected.furnitureType}
- **కొలతలు**: ${updatedCollected.length} (పొడవు) x ${updatedCollected.width} (వెడల్పు) x ${updatedCollected.height} (ఎత్తు)
- **మెటీరియల్**: ${updatedCollected.material}
- **フィニッシング**: ${updatedCollected.finish}
- **రంగు**: ${updatedCollected.color}
- **గడువు**: ${updatedCollected.timeline}
- **బడ్జెట్**: ${updatedCollected.budget}
- **ప్రత్యేక అవసరాలు**: ${updatedCollected.specialRequirements}

దయచేసి మీ ఆర్డర్ వివరాలను సమీక్షించండి. మీరు ఈ ఆర్డర్‌ను ధృవీకరించాలనుకుంటున్నారా? (**అవును** లేదా **confirm** అని టైప్ చేయండి)`
            : `Dayachesi mee custom furniture details review cheyyandi andi:
- **Furniture Type**: ${updatedCollected.furnitureType}
- **Dimensions**: ${updatedCollected.length} (Length) x ${updatedCollected.width} (Width) x ${updatedCollected.height} (Height)
- **Material**: ${updatedCollected.material}
- **Finish**: ${updatedCollected.finish}
- **Color**: ${updatedCollected.color}
- **Timeline**: ${updatedCollected.timeline}
- **Budget**: ${updatedCollected.budget}
- **Special Requirements**: ${updatedCollected.specialRequirements}

Please review your order details. Would you like to confirm this order? (Type **yes** or **confirm** to submit)`;

          return {
            text: summaryText,
            nextState: { type, step, lang, collected: updatedCollected, awaitingConfirmation: true }
          };
        } else if (type === 'order') {
          const priceConfirmationAlert = lang === 'en'
            ? `For the latest pricing, material selection, and final quotation, please speak with Mr. Nagaraju (+916281653998) or Tech Admin Pavan Sai (+919346325291). Once the quotation is confirmed, I'll proceed with your order.`
            : lang === 'te'
            ? `తాజా ధరలు, మెటీరియల్ ఎంపిక మరియు తుది కొటేషన్ కోసం, దయచేసి మిస్టర్ నాగరాజు (+916281653998) లేదా వెబ్ అడ్మిన్ పవన్ సాయి (+919346325291) గారితో మాట్లాడండి. కొటేషన్ ధృవీకరించబడిన తర్వాత, నేను మీ ఆర్డర్‌తో ముందుకుసాగుతాను.`
            : `For the latest pricing, material selection, and final quotation, please speak with Mr. Nagaraju (+916281653998) or Tech Admin Pavan Sai (+919346325291). Once the quotation is confirmed, I'll proceed with your order.`;

          const summaryText = lang === 'en'
            ? `Please review your order details:
- **Product**: ${updatedCollected.product}
- **Name**: ${updatedCollected.name}
- **Phone**: ${updatedCollected.phone}
- **Address**: ${updatedCollected.address}, ${updatedCollected.city}, ${updatedCollected.pincode}
- **Delivery Address**: ${updatedCollected.deliveryAddress}
- **Preferred Delivery Date**: ${updatedCollected.deliveryDate}
- **Customizations**: ${updatedCollected.customization}
- **Quantity**: ${updatedCollected.quantity}

⚠️ **Price Confirmation**:
${priceConfirmationAlert}

Would you like to confirm this order? (Type **yes** or **confirm**)`
            : lang === 'te'
            ? `దయచేసి మీ ఆర్డర్ వివరాలను సమీక్షించండి:
- **ప్రొడక్ట్**: ${updatedCollected.product}
- **పేరు**: ${updatedCollected.name}
- **ఫోన్**: ${updatedCollected.phone}
- **చిరునామా**: ${updatedCollected.address}, ${updatedCollected.city}, ${updatedCollected.pincode}
- **డెలివరీ చిరునామా**: ${updatedCollected.deliveryAddress}
- **కోరుకున్న తేదీ**: ${updatedCollected.deliveryDate}
- **కస్టమైజేషన్స్**: ${updatedCollected.customization}
- **పరిమాణం**: ${updatedCollected.quantity}

⚠️ **ధర ధృవీకరణ**:
${priceConfirmationAlert}

మీరు ఈ ఆర్డర్‌ను ధృవీకరించాలనుకుంటున్నారా? (**అవును** లేదా **confirm** అని టైప్ చేయండి)`
            : `Dayachesi mee order details review cheyyandi andi:
- **Product**: ${updatedCollected.product}
- **Name**: ${updatedCollected.name}
- **Phone**: ${updatedCollected.phone}
- **Address**: ${updatedCollected.address}, ${updatedCollected.city}, ${updatedCollected.pincode}
- **Delivery Address**: ${updatedCollected.deliveryAddress}
- **Preferred Delivery Date**: ${updatedCollected.deliveryDate}
- **Customizations**: ${updatedCollected.customization}
- **Quantity**: ${updatedCollected.quantity}

⚠️ **Price Confirmation**:
${priceConfirmationAlert}

Would you like to confirm this order? (Type **yes** or **confirm** to submit)`;

          const matchedProd = dbProducts.find(p => p.title === updatedCollected.product);
          const images = matchedProd ? [matchedProd.image] : [];

          return {
            text: summaryText,
            images,
            nextState: { type, step, lang, collected: updatedCollected, awaitingConfirmation: true }
          };
        }
      }
    }

    // ----------------------------------------------------
    // DETECT WORKFLOW INITIATIONS
    // ----------------------------------------------------
    const isInteriorTrigger = query.includes('interior') || query.includes('interiors') || query.includes('decor') || query.includes('consultation') || query.includes('డిజైన్') || query.includes('ఇంటీరియర్');
    const isCustomTrigger = /\b(custom|customise|customize|customization|custom-made)\b/.test(query) || query.includes('carpenter design') || query.includes('కస్టమ్') || query.includes('కస్టమైజ్');
    const isOrderTrigger = (query.includes('buy') || query.includes('order') || query.includes('place order') || query.includes('need this furniture') || query.includes('want to buy') || query.includes('place this order') || query.includes('కొనాలి') || query.includes('ఆర్డర్')) && !query.includes('track') && !query.includes('status') && !query.includes('timeline') && !query.includes('complaint') && !query.includes('support');

    if (isOrderTrigger) {
      if (matchedProductTitle) {
        setSelectedProduct(matchedProductTitle);
        const responseText = langStyle === 'en'
          ? `Sure! I am opening the Order Checkout Form for you right now with *${matchedProductTitle}* selected. Please fill out your details (Name, Phone, Email, Address, Custom Size, and Budget) in the form to submit your order directly to our WhatsApp!`
          : langStyle === 'te'
          ? `తప్పకుండా! నేను మీ కోసం *${matchedProductTitle}* సెలెక్ట్ చేసి ఆర్డర్ ఫారమ్‌ను ఓపెన్ చేస్తున్నాను. దయచేసి మీ వివరాలను పూరించి వాట్సాప్ ద్వారా సబ్మిట్ చేయండి.`
          : `Sure! I am opening the Order Checkout Form with *${matchedProductTitle}* selected. Please fill out your details to submit.`;
        return {
          text: responseText,
          switchToOrderTab: true,
          nextState: { type: 'idle', step: 0, lang: langStyle, collected: {} }
        };
      } else {
        const responseText = langStyle === 'en'
          ? `I can help you browse our premium collections and place custom orders! Please select a category below to explore designs:`
          : langStyle === 'te'
          ? `నేను మీకు మా ప్రీమియం డిజైన్‌లను చూపించగలను! దయచేసి కింద ఉన్న కేటగిరీలలో ఒకదాన్ని ఎంచుకోండి:`
          : `Maa premium collections and designs explore cheyyadaniki, kindha unna categories items select cheyandi andi:`;
        return {
          text: responseText,
          type: 'categories',
          nextState: { type: 'idle', step: 0, lang: langStyle, collected: {} }
        };
      }
    }

    if (isCustomTrigger) {
      const initialCollected = {
        name: localStorage.getItem('ld_user_name') || userName || '',
        phone: localStorage.getItem('ld_user_phone') || userPhone || '',
        email: localStorage.getItem('ld_user_email') || '',
        address: localStorage.getItem('ld_user_address') || '',
      };
      const nextStepIdx = findNextEmptyStep(CUSTOM_STEPS, initialCollected);
      if (nextStepIdx !== -1) {
        const nextField = CUSTOM_STEPS[nextStepIdx].field;
        const question = getQuestionText(nextField, langStyle);
        return {
          text: question,
          nextState: { type: 'custom', step: nextStepIdx, lang: langStyle, collected: initialCollected }
        };
      }
    }

    if (isInteriorTrigger) {
      const initialCollected = {};
      const nextStepIdx = findNextEmptyStep(INTERIOR_STEPS, initialCollected);
      if (nextStepIdx !== -1) {
        const nextField = INTERIOR_STEPS[nextStepIdx].field;
        const question = getQuestionText(nextField, langStyle);
        return {
          text: question,
          nextState: { type: 'interior', step: nextStepIdx, lang: langStyle, collected: initialCollected }
        };
      }
    }

    // ----------------------------------------------------
    // BASE RESPONSES (NON-WORKFLOW)
    // ----------------------------------------------------
    const getBaseResponse = () => {
      // 1. GREETINGS & SMALL TALK (Namaste, Hi, Hello, How are you, etc.)
      const isGreeting = query.includes('hi') || query.includes('hello') || query.includes('namaste') || query.includes('hey') || query.includes('ela unnavu') || query.includes('how are you') || query.includes('హాయ్') || query.includes('నమస్తే');
      if (isGreeting) {
        return langStyle === 'en'
          ? `Namaste andi! 🙏 Welcome to LD Interiors. Nenu chala bagunnanu, thank you! Meeru ela unnarandi? 
I am here to guide you through our premium Teak wood furniture designs, help you place orders, track delivery, or open support tickets. How can I help you today? 😊`
          : langStyle === 'te'
          ? `నమస్తే అండీ! 🙏 ఎల్‌డి ఇంటీరియర్స్ కి స్వాగతం. నేను చాలా బాగున్నాను, ధన్యవాదాలు! మీరు ఎలా ఉన్నారండీ? 
ప్రీమియం టేక్ వుడ్ ఫర్నిచర్ డిజైన్ వివరాలు, కొత్త ఆర్డర్ ప్లేస్ చేయడం, ఆర్డర్ ట్రాక్ చేయడం లేదా కస్టమర్ సపోర్ట్ వంటి ఏ విషయానికైనా నేను మీకు సహాయం చేయడానికి సిద్ధంగా ఉన్నాను. చెప్పండి, మీకు ఎలా సహాయపడగలను? 😊`
          : `Namaste andi! 🙏 Welcome to LD Interiors. Nenu chala bagunnanu, thank you! Meeru ela unnarandi? 
Maa premium Teak wood designs catalogs browse cheyyadaniki, custom orders submit cheyyadaniki, live status track cheyyadaniki, leda support tickets raise cheyyadaniki nenu ready ga unnanu. Eeroju meeku ela sahaya padagalanu? 😊`;
      }

      // 1b. CHATBOT HELP & GUIDE
      const isChatbotGuide = query.includes('how to use') || query.includes('guide') || query.includes('features') || query.includes('help chatbot') || query.includes('chatbot help') || query.includes('instructions') || query.includes('ఎలా ఉపయోగించాలి') || query.includes('ఎలా వాడాలి') || query.includes('ఏమి చేయగలవు');
      if (isChatbotGuide) {
        return langStyle === 'en'
          ? `Here is how you can use the **LD Assistant** chatbot:
          
1. 🔍 **Explore Designs**: Type a furniture category (e.g. "Pooja Mandir", "Sofa", "Beds") to browse catalog items, rolling ratings, and estimated pricing.
2. 📦 **WhatsApp Checkout**: Click the **Order Now** tab or tell me "I want to buy sofa" to pre-fill your details and order via WhatsApp.
3. 📍 **Live Order Tracking**: Click the **Track** tab or type your registered 10-digit mobile number to see the live status of your order (e.g., Wood Selection, Carpentry, Polishing).
4. 📷 **Room Photo Recommendations**: Click the camera icon at the bottom left to upload a picture of your room, and I will recommend matching designs!
5. 📞 **Contact Admins**: Ask for "contact number" to call Mr. Nagaraju (Owner) or Pavan Sai (Web Admin).
6. 🗣️ **Local Language Support**: You can type/speak in English, Telugu, or Tanglish, and I will talk back to you!

What would you like to do first?`
          : langStyle === 'te'
          ? `మీరు **LD Assistant** ని క్రింది విధంగా ఉపయోగించవచ్చు:
          
1. 🔍 **డిజైన్లను చూడటం**: పూజా మందిరాలు, సోఫా సెట్లు, మంచాలు వంటి ఫర్నిచర్ పేర్లు టైప్ చేస్తే మా డిజైన్లు మరియు ధరలను చూపిస్తాను.
2. 📦 **వాట్సాప్ ద్వారా ఆర్డర్**: **Order Now** ట్యాబ్ క్లిక్ చేయడం లేదా "మంచం కొనాలి" అని నాకు మెసేజ్ చేయడం ద్వారా మీ వివరాలు నింపి నాగరాజు గారి వాట్సాప్ కి నేరుగా ఆర్డర్ చేయవచ్చు.
3. 📍 **ఆర్డర్ ట్రాకింగ్**: **Track** ట్యాబ్ క్లిక్ చేయడం ద్వారా లేదా మీ 10 అంకెల మొబైల్ నంబర్ టైప్ చేయడం ద్వారా మీ ఆర్డర్ వర్క్‌షాప్ లైవ్ వర్క్ స్టేటస్ చూసుకోవచ్చు.
4. 📷 **గది ఫోటో అప్‌లోడ్**: మీ గది ఫోటోను కెమెరా ఐకాన్ ద్వారా అప్‌లోడ్ చేస్తే, దానికి మ్యాచ్ అయ్యే మా డిజైన్లను చూపిస్తాను.
5. 📞 **సంప్రదింపు నంబర్లు**: నిర్వాహకుల నంబర్ల కోసం "contact number" అని అడగండి.
6. 🗣️ **తెలుగు & ఇంగ్లీష్ వాయిస్**: నేను ఇంగ్లీష్, తెలుగు, టాంగ్లీష్ లలో మాట్లాడగలను! మీ డివైజ్ లో సౌండ్ ఆన్ ఉంచుకోండి.

నేను మీకు ఇప్పుడు ఎలా సహాయం చేయగలను?`
          : `Maa **LD Assistant** chatbot updates and controls use cheయడానికి guidelines checks:
          
1. 🔍 **Explore Designs**: "Pooja Mandiram", "Beds", "Sofa Sets" details adగండి, estimated pricing details display chesthanu.
2. 📦 **WhatsApp Checkout**: **Order Now** tab open chesi parameters select cheskondi or details type chesthe Nagaraju gari WhatsApp ki request configure chesthanu.
3. 📍 **Live Status Track**: **Track** tab select chesi 10-digit mobile number submit chesthe live workshop status timeline clear ga display avuthundi andi.
4. 📷 **Room Layout Advice**: Camera icon click chesi room picture upload cheyandi, appropriate matches suggest chesthundi.
5. 📞 **Contact details**: "Nagaraju phone number" search chesthe call connections display chesthanu.
6. 🗣️ **Local Tanglish Voice**: Nenu Telugu, English, and local Tanglish speech patterns coordinate cheyagalanu. Speech support fully active andi!

Tell me, what would you like to try first?`;
      }

      // 2. ORDER STATUS TRACKING TRIGGER
      const isTracking = query.includes('track') || query.includes('status') || query.includes('timeline') || query.includes('delivery') || query.includes('ఎప్పుడు') || query.includes('స్టేటస్') || query.includes('ట్రాక్');
      if (isTracking) {
        return {
          text: langStyle === 'en'
            ? `Sure! I am opening the Order Tracking panel for you right now. Please enter your registered phone number there to check your live workshop progress and carpentry status! 📦`
            : langStyle === 'te'
            ? `తప్పకుండా అండీ! నేను మీ కోసం ఆర్డర్ ట్రాకింగ్ ప్యానెల్ ఓపెన్ చేస్తున్నాను. దయచేసి మీ రిజిస్టర్డ్ మొబైల్ నంబర్‌ని నమోదు చేసి లైవ్ కార్పెంట్రీ మరియు వర్క్‌షాప్ ప్రగతిని చూడండి! 📦`
            : `Sure andi! Mee live status tracking section right now open chesthunnanu. Registered mobile number enter chesi, carpentry and workshop updates chuskondi! 📦`,
          switchToTrackTab: true
        };
      }

      // 3. CUSTOMER SUPPORT / COMPLAINT TRIGGER
      const isSupport = query.includes('support') || query.includes('complaint') || query.includes('issue') || query.includes('help') || query.includes('repair') || query.includes('problem') || query.includes('సపోర్ట్') || query.includes('సహాయం') || query.includes('సమస్య');
      if (isSupport) {
        return {
          text: langStyle === 'en'
            ? `Sure andi! I am redirecting you to our Customer Support ticket page. Please submit your details and describe the problem, and our admin team will contact you to resolve it! 🔧`
            : langStyle === 'te'
            ? `కచ్చితంగా అండీ! నేను మిమ్మల్ని కస్టమర్ సపోర్ట్ పేజీకి మళ్లిస్తున్నాను. దయచేసి మీ సమస్యను అక్కడ సమర్పించండి, మా అడ్మిన్ బృందం మీకు సహాయం చేయడానికి వెంటనే సంప్రదిస్తుంది! 🔧`
            : `Khanditham ga andi! Nenu mimmalni support form page ki redirect chesthunnanu. Details fill chesi ticket submit cheyandi, admin Pavan Sai garu ventane respond avutharu! 🔧`,
          switchToSupportPage: true
        };
      }

      // 4. CONTACT ROUTING FOR ADMINS / DETAILS (Nagaraju / Pavan Sai)
      const isContact = query.includes('contact') || query.includes('number') || query.includes('call') || query.includes('phone') || query.includes('admin') || query.includes('nagaraju') || query.includes('pavan') || query.includes('ఫోన్') || query.includes('నంబర్');
      if (isContact) {
        return langStyle === 'en'
          ? `Sure andi! Here are the contact details for LD Interiors:
📞 **Mr. Nagaraju (Owner & Head Carpenter)**: +916281653998 (For design quotes, teak wood selection, and contract setups)
📞 **Web Admin Pavan Sai (Tech Support)**: +919346325291 (For order changes, website issues, and general support)

Please feel free to call us or chat on WhatsApp! 💬`
          : langStyle === 'te'
          ? `తప్పకుండా అండీ! మా సంప్రదింపు వివరాలు ఇక్కడ ఉన్నాయి:
📞 **మిస్టర్ నాగరాజు (యజమాని & ప్రధాన వడ్రంగి)**: +916281653998 (డిజైన్ కొటేషన్స్, టేక్ కలప ఎంపిక మరియు ఆర్డర్ కన్ఫర్మేషన్స్)
📞 **వెబ్ అడ్మిన్ పవన్ సాయి (సాంకేతిక సహాయం)**: +919346325291 (వెబ్‌సైట్ మరియు జనరల్ సపోర్ట్ కోసం)

దయచేసి మాకు నేరుగా కాల్ చేయండి లేదా వాట్సాప్‌లో చాట్ చేయండి! 💬`
          : `Sure andi! LD Interiors admins direct contacts list:
📞 **Mr. Nagaraju (Owner/Wood artisan)**: +916281653998 (Pricing quotes, Teak wood logs checking)
📞 **Web Admin Pavan Sai (Tech Admin)**: +919346325291 (General tickets resolving)

Meeru direct call chesi or WhatsApp chat direct start chesi coordinates set cheskovachu andi! 💬`;
      }

      // 5. PRICING & ESTIMATION / QUOTATIONS
      if (query.includes('price') || query.includes('cost') || query.includes('estimation') || query.includes('budget') || query.includes('ధర') || query.includes('ఖర్చు') || query.includes('rate') || query.includes('quotation') || query.includes('quote') || query.includes('negotiation') || query.includes('payment')) {
        return langStyle === 'en'
          ? `For the latest pricing, material selection, and final quotation, please speak with Mr. Nagaraju (+916281653998) or Tech Admin Pavan Sai (+919346325291). Once the quotation is confirmed, we'll proceed with your order.`
          : langStyle === 'te'
          ? `తాజా ధరలు, మెటీరియల్ ఎంపిక మరియు తుది కొటేషన్ కోసం, దయచేసి మిస్టర్ నాగరాజు (+916281653998) లేదా వెబ్ అడ్మిన్ పవన్ సాయి (+919346325291) గారితో మాట్లాడండి. కొటేషన్ ధృవీకరించబడిన తర్వాత, నేను మీ ఆర్డర్‌తో ముందుకుసాగుతాను.`
          : `For the latest pricing, material selection, and final quotation, please speak with Mr. Nagaraju (+916281653998) or Tech Admin Pavan Sai (+919346325291). Once the quotation is confirmed, I'll proceed with your order.`;
      }

      // 6. ADDRESS & LOCATION
      if (query.includes('address') || query.includes('location') || query.includes('where') || query.includes('office') || query.includes('place') || query.includes('ఎక్కడ')) {
        return langStyle === 'en'
          ? `Our office and carpentry workshop is located at Door No. 6-132, Mulasthanam, Alamuru Mandal, Konaseema District, Andhra Pradesh, PIN: 533233. We offer free delivery and setup in the surrounding areas!`
          : langStyle === 'te'
          ? `మా ఆఫీస్ మరియు వర్క్‌షాప్ చిరునామా: డోర్ నెం. 6-132, మూలస్థానం, ఆలమూరు మండలం, కోనసీమ జిల్లా, ఆంధ్రప్రదేశ్, పిన్: 533233.`
          : `Maa office workshop details: Door No. 6-132, Mulasthanam, Alamuru Mandal, Konaseema District, Andhra Pradesh, PIN: 533233. Konaseema surroundings lo delivery coordinate chestham andi.`;
      }

      // 7. EXPERIENCE & TRUST
      if (query.includes('experience') || query.includes('years') || query.includes('trust') || query.includes('అనుభవం')) {
        return langStyle === 'en'
          ? `LD Interiors & Furnitures has over 25 years of local carpentry trust and design legacy in the Konaseema region. We maintain the highest standards of Teak durability.`
          : `LD Interiors & Furnitures ki Konaseema area surroundings lo total 25+ years experience and solid quality wood carpentry trust records undi andi. Strong teak wood carvings designs durability criteria checks is standard high level!`;
      }

      // 8. TEAK WOOD QUALITY INQUIRIES
      const isWoodQuality = query.includes('teak') || query.includes('wood') || query.includes('karra') || query.includes('quality') || query.includes('కలప') || query.includes('కర్ర') || query.includes('టేక్');
      if (isWoodQuality) {
        return langStyle === 'en'
          ? `We construct our furniture using 100% pure genuine quality Teak wood (టేక్ కరప) to ensure high density, moisture protection, and lifetime durability. No synthetic mix or low-grade materials are allowed in our workshop! 🪵✨`
          : langStyle === 'te'
          ? `మేము మా ఫర్నిచర్‌ను కేవలం 100% నిజమైన మరియు అత్యుత్తమ టేక్ కలపతోనే తయారు చేస్తాము. ఇది వర్షానికి లేదా వేడికి చెడిపోదు, జీవితాంతం మన్నికగా ఉంటుంది! 🪵✨`
          : `Maa workshop lo exclusively 100% pure Teak wood selection mathramey chestaru Nagaraju garu. Heavy density, double-cote Manchams verification parameters chala strict ga maintain chesi lifetime safety assurance istham andi! 🪵✨`;
      }

      // 9. THANK YOU / CUTE RESPONSES
      const isThankYou = query.includes('thank') || query.includes('thanks') || query.includes('dhanyavadalu') || query.includes('nice') || query.includes('good') || query.includes('super') || query.includes('happy') || query.includes('ధన్యవాదాలు');
      if (isThankYou) {
        return langStyle === 'en'
          ? `Aww, thank you so much! 😊 It is my absolute pleasure to guide you. If you need any more customization designs or help, please let me know. Have a wonderful day! 🌸`
          : langStyle === 'te'
          ? `ధన్యవాదాలు అండీ! 😊 మీకు సహాయపడటం నాకు చాలా సంతోషంగా ఉంది. మీకు ఏవైనా డిజైన్ మార్పులు లేదా ఇతర సమాచారం కావాలంటే అడగండి. మీకు మంచి రోజు అవ్వాలని కోరుకుంటున్నాను! 🌸`
          : `Chala chala thank you andi! 😊 Mimmalni assist cheyyadam naku chala happy ga undandi. Custom orders configuration modifications updates emaina chusthara andi? Please tell me! 🌸`;
      }

      // 7. CATEGORY RAG DATABASE SEARCH
      const categorySynonyms = {
        tv: ['tv unit', 'tv', 't.v', 'టీవీ', 'television', 'tv console', 'tv cabinets', 'entertainment'],
        wardrobe: ['wardrobe', 'wardrobes', 'almirah', 'బీరువా', 'cupboard', 'cupboards'],
        kitchen: ['kitchen', 'modular kitchen', 'వంటగది', 'kitchen cabinets'],
        bedroom: ['bedroom', 'bed', 'wooden bed', 'మంచం', 'మంచాలు', 'bunk bed', 'double bed', 'canopy bed'],
        office: ['office', 'desk', 'writing table', 'ఆఫీస్', 'office furniture', 'office desk'],
        mandiralu: ['mandiram', 'mandiralu', 'temple', 'pooja', 'devudi', 'మండపం', 'పూజ మందిరం'],
        gummalu: ['gummalu', 'gummam', 'frame', 'frames', 'గుమ్మాలు', 'గుమ్మం'],
        dressing: ['dressing', 'mirror', 'makeup', 'డ్రెస్సింగ్', 'dressing table'],
        swing: ['swing', 'uyyala', 'baby swing', 'ఉయ్యాల']
      };

      let matchedCat = null;
      for (const [catKey, keywords] of Object.entries(categorySynonyms)) {
        if (keywords.some(kw => query.includes(kw))) {
          matchedCat = catKey;
          break;
        }
      }

      if (matchedCat) {
        // Query matching items in database
        let items = [];
        let similarRec = '';
        if (matchedCat === 'tv') {
          items = dbProducts.filter(p => p.category.toLowerCase().includes('tv') || p.title.toLowerCase().includes('tv'));
          similarRec = langStyle === 'en' 
            ? "We also recommend styling it with: Coffee Table, Wall Panel, False Ceiling, Living Room Package, Display Shelf, Side Storage."
            : langStyle === 'te'
            ? "మేము వీటికి అదనంగా: కాఫీ టేబుల్, వాల్ ప్యానెల్, ఫాల్స్ సీలింగ్, డిస్ప్లే షెల్ఫ్‌లను సిఫార్సు చేస్తున్నాము."
            : "We also recommend similar products: Coffee Table, Wall Panel, False Ceiling, Living Room Package, Display Shelf, Side Storage.";
        } else if (matchedCat === 'wardrobe') {
          items = dbProducts.filter(p => p.category.toLowerCase().includes('wardrobe') || p.title.toLowerCase().includes('wardrobe') || p.title.toLowerCase().includes('bedroom') && p.title.toLowerCase().includes('wardrobe'));
          if (items.length === 0) {
            items = dbProducts.filter(p => p.title.toLowerCase().includes('wardrobe'));
          }
          similarRec = langStyle === 'en'
            ? "We also recommend: Bedside Tables, Dressing Table, Chest of Drawers, Study Desk."
            : langStyle === 'te'
            ? "మేము వీటికి అదనంగా: బెడ్‌సైడ్ టేబుల్స్, డ్రెస్సింగ్ టేబుల్స్, చెస్ట్ ఆఫ్ డ్రాయర్స్‌లను సిఫార్సు చేస్తున్నాము."
            : "We also recommend: Bedside Tables, Dressing Table, Chest of Drawers, Study Desk.";
        } else if (matchedCat === 'kitchen') {
          items = dbProducts.filter(p => p.category.toLowerCase().includes('kitchen') || p.title.toLowerCase().includes('kitchen'));
          similarRec = langStyle === 'en'
            ? "We also recommend: Pantry unit, Chimney, Breakfast counter, Tall cabinet unit."
            : langStyle === 'te'
            ? "మేము వీటికి అదనంగా: ప్యాంట్రీ యూనిట్, చిమ్నీ, బ్రేక్‌ఫాస్ట్ కౌంటర్‌ను సిఫార్సు చేస్తున్నాము."
            : "We also recommend: Pantry unit, Chimney, Breakfast counter, Tall cabinet unit.";
        } else if (matchedCat === 'bedroom') {
          items = dbProducts.filter(p => p.category.toLowerCase().includes('bed') || p.category.toLowerCase().includes('bedroom') || p.title.toLowerCase().includes('bed') && !p.title.toLowerCase().includes('bunk'));
          similarRec = langStyle === 'en'
            ? "We also recommend: Wardrobes, Bedside Tables, Dressing Table, Chest of Drawers."
            : langStyle === 'te'
            ? "మేము వీటికి అదనంగా: వార్డ్‌రోబ్‌లు, బెడ్‌సైడ్ టేబుల్స్, డ్రెస్సింగ్ టేబుల్స్‌లను సిఫార్సు చేస్తున్నాము."
            : "We also recommend: Wardrobes, Bedside Tables, Dressing Table, Chest of Drawers.";
        } else if (matchedCat === 'office') {
          items = dbProducts.filter(p => p.category.toLowerCase().includes('office') || p.title.toLowerCase().includes('office') || p.title.toLowerCase().includes('desk'));
          similarRec = langStyle === 'en'
            ? "We also recommend: Executive Chair, Bookshelf, side cabinet storage."
            : langStyle === 'te'
            ? "మేము వీటికి అదనంగా: ఎగ్జిక్యూటివ్ చైర్, బుక్‌షెల్ఫ్ మరియు ఫైలింగ్ క్యాబినెట్‌ను సిఫార్సు చేస్తున్నాము."
            : "We also recommend: Executive Chair, Bookshelf, side cabinet storage.";
        } else if (matchedCat === 'mandiralu') {
          items = dbProducts.filter(p => p.category.toLowerCase().includes('mandiralu') || p.title.toLowerCase().includes('mandiram') || p.title.toLowerCase().includes('temple') || p.title.toLowerCase().includes('pooja') || p.title.toLowerCase().includes('devudi'));
          similarRec = langStyle === 'en'
            ? "We also recommend: Pooja stools, brass bells, customized drawers."
            : langStyle === 'te'
            ? "మేము వీటికి అదనంగా: పూజా పీటలు, ఇత్తడి గంటలు, అనుకూల డ్రాయర్లను సిఫార్సు చేస్తున్నాము."
            : "We also recommend similar items: Pooja stools, brass bells, customized drawers.";
        } else if (matchedCat === 'gummalu') {
          items = dbProducts.filter(p => p.category.toLowerCase().includes('gummalu') || p.title.toLowerCase().includes('gummam') || p.title.toLowerCase().includes('frame'));
          similarRec = langStyle === 'en'
            ? "We also recommend: Traditional carved threshold (Gadapa), matching main door."
            : langStyle === 'te'
            ? "మేము వీటికి అదనంగా: సాంప్రదాయ గడప, మరియు ప్రధాన తలుపు డిజైన్లను సిఫార్సు చేస్తున్నాము."
            : "We also recommend: Traditional carved threshold (Gadapa), matching main door.";
        } else if (matchedCat === 'dressing') {
          items = dbProducts.filter(p => p.category.toLowerCase().includes('dressing') || p.title.toLowerCase().includes('dressing') || p.title.toLowerCase().includes('mirror'));
          similarRec = langStyle === 'en'
            ? "We also recommend: Hairdryer holder, accessory organizers, side stool."
            : langStyle === 'te'
            ? "మేము వీటికి అదనంగా: హెయిర్ డ్రైయర్ హోల్డర్, అనుకూల ఆర్గనైజర్‌లను సిఫార్సు చేస్తున్నాము."
            : "We also recommend: Hairdryer holder, accessory organizers, side stool.";
        } else if (matchedCat === 'swing') {
          items = dbProducts.filter(p => p.category.toLowerCase().includes('swing') || p.category.toLowerCase().includes('uyyala') || p.title.toLowerCase().includes('swing') || p.title.toLowerCase().includes('uyyala'));
          similarRec = langStyle === 'en'
            ? "We also recommend: Heavy-duty brass chains, protective cushion pads, ceiling hooks."
            : langStyle === 'te'
            ? "మేము వీటికి అదనంగా: ఇత్తడి గొలుసులు, రక్షణ కుషన్ ప్యాడ్లను సిఫార్సు చేస్తున్నాము."
            : "We also recommend: Heavy-duty brass chains, protective cushion pads, ceiling hooks.";
        }

        if (items.length > 0) {
          let listStr = '';
          const images = items.map(it => it.image);
          items.forEach(it => {
            listStr += `${formatProductDetails(it, langStyle)}\n\n`;
          });
          listStr += `${similarRec}`;
          return { text: listStr, images };
        } else {
          const noProductText = langStyle === 'en'
            ? `We customize premium *${matchedCat.toUpperCase()}* designs at our workshop. Contact Nagaraju at +916281653998 for custom catalogs!`
            : langStyle === 'te'
            ? `మా వద్ద కస్టమ్ *${matchedCat.toUpperCase()}* డిజైన్‌లు అందుబాటులో ఉన్నాయి. వివరాల కోసం నాగరాజు గారిని (+916281653998) సంప్రదించండి.`
            : `Maa workshop lo custom *${matchedCat.toUpperCase()}* designs build chestham andi. Details kosam contact Nagaraju (+916281653998).`;
          return { text: noProductText, images: [] };
        }
      }

      // Default Response when no category matches
      return langStyle === 'en'
        ? {
            text: `I received your message. You can query about custom carvings wood layouts, pricing estimates, workshop address, or order tracking status. 
Contact info:
- Carpenter Manager Nagaraju: +916281653998
- Web Admin Pavan Sai: +919346325291
Or go to the top navigation 'Orders' page to see your live order status timeline.`,
            images: []
          }
        : langStyle === 'te'
        ? {
            text: `మీ సందేశం మాకు అందింది. కస్టమ్ చెక్క పనులు, ధరల అంచనా, మా వర్క్‌షాప్ చిరునామా లేదా ఆర్డర్ ట్రాకింగ్ వివరాల గురించి అడగండి:
- మేనేజర్ నాగరాజు: +916281653998
- వెబ్ అడ్మిన్ పవన్ సాయి: +919346325291`,
            images: []
          }
        : {
            text: `Namaste andi! Mee message received checks support team. Custom wood carvings estimates, item catalogs, address details, or order tracking updates gurinchi coordinates adagandi:
- Manager Nagaraju (+916281653998)
- Tech Admin Pavan Sai (+919346325291)
Or website top navbar menu lo unna 'Orders' link click chesi live tracking and rating updates select cheyochu andi!`,
            images: []
          };
    };

    const baseResponseObj = getBaseResponse();
    
    if (baseResponseObj.text) {
      return {
        text: baseResponseObj.text,
        images: baseResponseObj.images || [],
        type: baseResponseObj.type || null,
        productTitle: matchedProductTitle,
        switchToTrackTab: baseResponseObj.switchToTrackTab,
        switchToSupportPage: baseResponseObj.switchToSupportPage,
        switchToOrderTab: baseResponseObj.switchToOrderTab,
        nextState: { type: 'idle', step: 0, lang: langStyle, collected: {} }
      };
    } else {
      return {
        text: baseResponseObj,
        images: [],
        type: null,
        productTitle: matchedProductTitle,
        nextState: { type: 'idle', step: 0, lang: langStyle, collected: {} }
      };
    }
  };

  const categoriesList = [
    { key: 'living', label: '🛋️ Living Room' },
    { key: 'kitchen', label: '🍳 Kitchen Cabinets' },
    { key: 'bedroom', label: '🛌 Bedroom Designs' },
    { key: 'kids', label: '👶 Kids Rooms' },
    { key: 'sofas', label: '🛋️ Sofa Sets' },
    { key: 'beds', label: '🛏️ Teak Beds' },
    { key: 'dining', label: '🍽️ Dining Tables' },
    { key: 'tv', label: '📺 TV Units' },
    { key: 'swings', label: '🪑 Uyyala Swings' },
    { key: 'windows', label: '🪟 Wooden Windows' },
    { key: 'mesh', label: '🚪 Mesh Doors' },
    { key: 'polish', label: '✨ Polish Items' },
    { key: 'money', label: '💰 Money Boxes' },
    { key: 'glass', label: '🖼️ Glass Windows' },
    { key: 'office', label: '💼 Office Furniture' },
    { key: 'bathroom', label: '🚿 Bathroom Cabinets' },
    { key: 'mandiralu', label: '🛕 Puja Mandiralu' },
    { key: 'gummalu', label: '🚪 Entrance Gummalu' },
    { key: 'dressing', label: '🪞 Dressing Tables' }
  ];

  const handleCategoryClick = (categoryKey, categoryLabel) => {
    setMessages(prev => [...prev, { sender: 'user', text: `Browse ${categoryLabel}` }]);
    
    let items = [];
    if (categoryKey === 'mandiralu') {
      items = dbProducts.filter(p => p.category.toLowerCase().includes('mandiralu') || p.title.toLowerCase().includes('mandiram') || p.title.toLowerCase().includes('temple') || p.title.toLowerCase().includes('pooja') || p.title.toLowerCase().includes('devudi'));
    } else if (categoryKey === 'bedroom') {
      items = dbProducts.filter(p => p.category.toLowerCase().includes('bed') || p.category.toLowerCase().includes('bedroom') || p.title.toLowerCase().includes('bed') && !p.title.toLowerCase().includes('bunk'));
    } else if (categoryKey === 'sofa' || categoryKey === 'sofas') {
      items = dbProducts.filter(p => p.category.toLowerCase().includes('sofa') || p.title.toLowerCase().includes('sofa') || p.title.toLowerCase().includes('living') || p.title.toLowerCase().includes('tv') || p.title.toLowerCase().includes('coffee'));
    } else if (categoryKey === 'wardrobe') {
      items = dbProducts.filter(p => p.category.toLowerCase().includes('wardrobe') || p.title.toLowerCase().includes('wardrobe') || p.title.toLowerCase().includes('almirah') || p.title.toLowerCase().includes('cupboard'));
    } else if (categoryKey === 'kitchen') {
      items = dbProducts.filter(p => p.category.toLowerCase().includes('kitchen') || p.title.toLowerCase().includes('kitchen'));
    } else if (categoryKey === 'gummalu') {
      items = dbProducts.filter(p => p.category.toLowerCase().includes('gummalu') || p.title.toLowerCase().includes('gummam') || p.title.toLowerCase().includes('frame'));
    } else if (categoryKey === 'living') {
      items = dbProducts.filter(p => p.category.toLowerCase().includes('living'));
    } else if (categoryKey === 'kids') {
      items = dbProducts.filter(p => p.category.toLowerCase().includes('kids') || p.category.toLowerCase().includes('bunk'));
    } else if (categoryKey === 'beds') {
      items = dbProducts.filter(p => p.category.toLowerCase().includes('bed') || p.category.toLowerCase().includes('wooden beds'));
    } else if (categoryKey === 'dining') {
      items = dbProducts.filter(p => p.category.toLowerCase().includes('dining') || p.title.toLowerCase().includes('dining'));
    } else if (categoryKey === 'tv') {
      items = dbProducts.filter(p => p.category.toLowerCase().includes('tv') || p.title.toLowerCase().includes('tv'));
    } else if (categoryKey === 'swings') {
      items = dbProducts.filter(p => p.category.toLowerCase().includes('swing') || p.category.toLowerCase().includes('uyyala'));
    } else if (categoryKey === 'windows') {
      items = dbProducts.filter(p => p.category.toLowerCase().includes('window') && !p.category.toLowerCase().includes('glass'));
    } else if (categoryKey === 'mesh') {
      items = dbProducts.filter(p => p.category.toLowerCase().includes('mesh'));
    } else if (categoryKey === 'polish') {
      items = dbProducts.filter(p => p.category.toLowerCase().includes('polish'));
    } else if (categoryKey === 'money') {
      items = dbProducts.filter(p => p.category.toLowerCase().includes('money') || p.category.toLowerCase().includes('box') || p.title.toLowerCase().includes('hundi'));
    } else if (categoryKey === 'glass') {
      items = dbProducts.filter(p => p.category.toLowerCase().includes('glass'));
    } else if (categoryKey === 'office') {
      items = dbProducts.filter(p => p.category.toLowerCase().includes('office') || p.title.toLowerCase().includes('office'));
    } else if (categoryKey === 'bathroom') {
      items = dbProducts.filter(p => p.category.toLowerCase().includes('bathroom') || p.title.toLowerCase().includes('bathroom'));
    } else if (categoryKey === 'dressing') {
      items = dbProducts.filter(p => p.category.toLowerCase().includes('dressing') || p.title.toLowerCase().includes('dressing'));
    }
    
    // Speak synchronously inside the click handler to bypass mobile pop-up blockers!
    const voiceText = categoryKey === 'mandiralu' 
      ? `మా వద్ద ${items.length || 8} పూజా మందిరం డిజైన్లు అందుబాటులో ఉన్నాయి అండీ. మీకు నచ్చిన దాన్ని సెలెక్ట్ చేసుకోండి.`
      : categoryKey === 'bedroom' || categoryKey === 'beds'
      ? `మా వద్ద ${items.length || 6} టేక్ మంచాల డిజైన్లు ఉన్నాయి అండీ. ఒకసారి చూడండి.`
      : categoryKey === 'sofa' || categoryKey === 'sofas'
      ? `సోఫా సెట్ డిజైన్లు ${items.length || 7} దొరికాయి అండీ. మీకు కావాల్సిన సైజ్ లో కస్టమైజ్ చేసుకోవచ్చు.`
      : categoryKey === 'wardrobe'
      ? `వార్డ్ రోబ్స్ మరియు బీరువా డిజైన్లు ${items.length || 5} ఉన్నాయి అండీ.`
      : categoryKey === 'kitchen'
      ? `మోడ్యులర్ కిచెన్ డిజైన్లు ${items.length || 4} దొరికాయి అండీ.`
      : categoryKey === 'gummalu'
      ? `గుమ్మాలు మరియు మెయిన్ డోర్ ఫ్రేమ్స్ ${items.length || 3} ఉన్నాయి అండీ.`
      : `మా వద్ద ${items.length || 5} ${categoryLabel} డిజైన్లు అందుబాటులో ఉన్నాయి అండీ.`;
    speakMessage(voiceText, true);

    setTimeout(() => {
      if (items.length > 0) {
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: `Found ${items.length} designs in *${categoryLabel}* directly matching our database:`,
          type: 'products',
          productsData: items
        }]);
      } else {
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: `We customize premium *${categoryLabel}* designs at our workshop. Please contact Mr. Nagaraju at +916281653998 for custom options!`,
        }]);
      }
    }, 400);
  };

  // Handle chat message submit
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    // INTERCEPT 10-DIGIT PHONE NUMBERS FOR LIVE IN-CHAT TRACKING
    const cleanPhone = userMsg.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      speakMessage(`మీ నెంబర్ పై రిజిస్టర్ అయిన ఆర్డర్ల వివరాలను తెలుసుకుంటున్నాను అండీ.`, true);

      setTimeout(() => {
        api.get(`/orders/track?phone=${cleanPhone}`)
          .then(res => {
            if (res.data && res.data.length > 0) {
              setMessages(prev => [...prev, {
                sender: 'bot',
                text: `I found ${res.data.length} active order(s) registered under **${cleanPhone}**! Here is the live status timeline:`,
                type: 'tracking',
                ordersData: res.data
              }]);
              speakMessage(`నేను మీ నంబర్ పై ఉన్న ఆర్డర్ ని కనుగొన్నాను అండీ.`, true);
            } else {
              setMessages(prev => [...prev, {
                sender: 'bot',
                text: `I couldn't find any active orders for the phone number **${cleanPhone}** in our database.\n\nPlease double check the number, or select a category below to explore our products:`,
                type: 'categories'
              }]);
              speakMessage(`క్షమించండి అండీ, మీ మొబైల్ నంబర్ పై ఎలాంటి ఆర్డర్లు కనిపించలేదు.`, true);
            }
          })
          .catch(err => {
            setMessages(prev => [...prev, {
              sender: 'bot',
              text: `Sorry, there was an error communicating with our server. Please try again or click 'Track' in the navigation bar to query manually.`,
            }]);
          });
      }, 500);
      return;
    }

    // Synchronous bot response generation and speech context trigger
    const replyObj = getBotResponse(userMsg, workflowState);
    const isEnglish = checkIsEnglishQuery(userMsg);
    speakMessage(replyObj.text, !isEnglish);

    // Simulate bot thinking and reply layout
    setTimeout(() => {
      // Update workflow state
      if (replyObj.nextState) {
        setWorkflowState(replyObj.nextState);
      }

      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: replyObj.text,
        images: replyObj.images || [],
        type: replyObj.type || null,
        productsData: replyObj.productsData || null,
        ordersData: replyObj.ordersData || null,
        action: replyObj.productTitle ? { type: 'order', productTitle: replyObj.productTitle } : null
      }]);

      // Auto-switch to tabs if flagged
      if (replyObj.switchToOrderTab) {
        setTimeout(() => {
          setActiveTab('order');
        }, 2200);
      }

      if (replyObj.switchToTrackTab) {
        setTimeout(() => {
          setActiveTab('track');
          fetchTrackedOrders();
        }, 2200);
      }

      if (replyObj.switchToSupportPage) {
        setTimeout(() => {
          window.location.href = '/support';
        }, 2200);
      }
    }, 500);
  };

  // Quick prompt handle
  const handleQuickPrompt = (promptText) => {
    setMessages(prev => [...prev, { sender: 'user', text: promptText }]);
    
    // Get response and speak synchronously inside the user click gesture loop
    const replyObj = getBotResponse(promptText, workflowState);
    const isEnglish = checkIsEnglishQuery(promptText);

    if (promptText === '📖 How to Use') {
      speakMessage(`మా చాట్‌బాట్ ని ఎలా ఉపయోగించాలో ఇక్కడ వివరాలు ఇచ్చాను అండీ.`, true);
    } else if (promptText === 'I want to order a design') {
      speakMessage(`ఆర్డర్ చేయడానికి దయచేసి కింద ఉన్న కేటగిరీలలో ఒకదాన్ని ఎంచుకోండి అండీ.`, true);
    } else if (promptText === 'Track my order progress') {
      speakMessage(`దయచేసి మీ పది అంకెల మొబైల్ నంబర్‌ని టైప్ చేయండి, మీ ఆర్డర్ లైవ్ స్టేటస్ ని చూపిస్తాను.`, true);
    } else if (promptText === 'I need customer support help') {
      speakMessage(`మీ సమస్యను పరిష్కరించడానికి నేను మిమ్మల్ని కస్టమర్ సపోర్ట్ పేజీకి తీసుకువెళ్తున్నాను అండీ.`, true);
    } else if (promptText === 'Contact information for admins') {
      speakMessage(`మిస్టర్ నాగరాజు మరియు పవన్ సాయి గారి కాంటాక్ట్ డీటెయిల్స్ ఇక్కడ ఇచ్చాను అండీ.`, true);
    } else if (promptText === 'Where is your workshop address?') {
      speakMessage(`మా వర్క్‌షాప్ ఆలమూరు మండలం మూలస్థానం లో ఉంది అండీ. కోనసీమ పరిసర ప్రాంతాలకు డెలివరీ చేస్తాము.`, true);
    } else {
      speakMessage(replyObj.text, !isEnglish);
    }

    setTimeout(() => {
      // Update workflow state
      if (replyObj.nextState) {
        setWorkflowState(replyObj.nextState);
      }

      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: replyObj.text,
        images: replyObj.images || [],
        type: replyObj.type || null,
        productsData: replyObj.productsData || null,
        ordersData: replyObj.ordersData || null,
        action: replyObj.productTitle ? { type: 'order', productTitle: replyObj.productTitle } : null
      }]);

      // Auto-switch to tabs if flagged
      if (replyObj.switchToOrderTab) {
        setTimeout(() => {
          setActiveTab('order');
        }, 2200);
      }

      if (replyObj.switchToTrackTab) {
        setTimeout(() => {
          setActiveTab('track');
          fetchTrackedOrders();
        }, 2200);
      }

      if (replyObj.switchToSupportPage) {
        setTimeout(() => {
          window.location.href = '/support';
        }, 2200);
      }
    }, 500);
  };

  // Simulated Room Image Upload Analysis
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setMessages(prev => [...prev, { sender: 'user', text: '📷 Uploaded a room image', image: imageUrl }]);

    setTimeout(() => {
      const analysisText = `🔍 **Room Image Analysis**:
- **Room Type**: Living Room
- **Furniture**: Sofa area & Accent wood panels
- **Style**: Contemporary Modern
- **Color**: Neutral Beige, Warm Oak
- **Material**: Premium Solid Wood
- **Space**: Spacious layout

Based on your room's style, here are some LD Interiors products that match beautifully:`;

      // Recommend sofa and tv console from dbProducts
      const recommendations = dbProducts.filter(p => p.category.toLowerCase().includes('sofa') || p.category.toLowerCase().includes('tv') || p.category.toLowerCase().includes('living'));
      const recImages = recommendations.slice(0, 2).map(r => r.image);
      let recList = '';
      recommendations.slice(0, 2).forEach(it => {
        recList += `${formatProductDetails(it, 'en')}\n\n`;
      });

      setMessages(prev => [...prev, {
        sender: 'bot',
        text: `${analysisText}\n\n${recList}`,
        images: recImages
      }]);

      speakMessage("I have analyzed your room image and recommended matching LD Interiors products.", false);
    }, 1500);
  };

  async function fetchTrackedOrders(phoneToQuery) {
    const phone = phoneToQuery || trackPhone || localStorage.getItem('ld_user_phone') || '';
    if (!phone) return;
    
    setTrackingLoading(true);
    setTrackingError('');
    try {
      const response = await api.get(`/orders/track?phone=${phone}`);
      setTrackedOrders(response.data);
    } catch (err) {
      console.error('Error tracking orders:', err);
      setTrackingError('Failed to fetch order history. Please try again.');
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleTrackSearch = (e) => {
    e.preventDefault();
    if (!trackPhone.trim()) {
      alert('Please enter a phone number to track.');
      return;
    }
    fetchTrackedOrders(trackPhone.trim());
  };

  // Handle WhatsApp Order Submit
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setOrderSuccess(false);

    if (!orderName.trim() || !orderPhone.trim() || !orderEmail.trim() || !orderAddress.trim() || !selectedProduct) {
      alert('Please fill out all required fields (Name, Phone, Gmail, Address).');
      return;
    }

    setOrderSuccess(true);

    // Save to localStorage to keep visitor info synced
    localStorage.setItem('ld_user_registered', 'true');
    localStorage.setItem('ld_user_name', orderName.trim());
    localStorage.setItem('ld_user_phone', orderPhone.trim());
    localStorage.setItem('ld_user_email', orderEmail.trim());
    localStorage.setItem('ld_user_address', orderAddress.trim());

    // Dispatch login event to sync across navbar
    window.dispatchEvent(new Event('storage'));

    const matchedProduct = dbProducts.find(p => p.title === selectedProduct);
    const productImage = matchedProduct ? matchedProduct.image : '';
    const productPrice = matchedProduct && matchedProduct.price ? matchedProduct.price : 0;
    const absoluteImageUrl = productImage ? (productImage.startsWith('http') ? productImage : `${window.location.origin}${productImage.startsWith('/') ? '' : '/'}${productImage}`) : '';

    try {
      const formData = new FormData();
      formData.append('name', orderName.trim());
      formData.append('phone', orderPhone.trim());
      formData.append('email', orderEmail.trim());
      formData.append('address', orderAddress.trim());
      formData.append('product', selectedProduct);
      formData.append('notes', orderNotes.trim() || 'No custom notes.');
      if (matchedProduct) formData.append('productId', matchedProduct._id);
      if (customSize.trim()) formData.append('customSize', customSize.trim());
      if (desiredPrice.trim()) formData.append('desiredPrice', desiredPrice.trim());
      if (referenceImageFile) {
        formData.append('referenceImage', referenceImageFile);
      } else {
        formData.append('imageUrl', absoluteImageUrl);
      }

      const response = await api.post('/orders', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const createdOrder = response.data;
      const orderImage = createdOrder.imageUrl || absoluteImageUrl;

      const baseMessageBody = `*Product Details:*
- Name: ${selectedProduct}
- Category: ${matchedProduct ? matchedProduct.category : 'General Inquiry'}
- Price: ${productPrice > 0 ? `₹${productPrice.toLocaleString('en-IN')}` : 'Contact for pricing'}
${orderImage ? `- Image URL: ${orderImage}\n` : ''}
*Customer Details:*
- Name: ${orderName.trim()}
- Phone: ${orderPhone.trim()}
- Gmail: ${orderEmail.trim()}
- Delivery Address: ${orderAddress.trim()}
${customSize.trim() ? `- Custom Size: ${customSize.trim()}\n` : ''}${desiredPrice.trim() ? `- Desired Budget: ${desiredPrice.trim()}\n` : ''}- Notes/Customization: ${orderNotes.trim() || 'No custom notes.'}`;

      const msgNagaraju = `Hello Nagaraju Garu! I would like to place a design order/inquiry via LD Interiors & Furnitures website:\n\n${baseMessageBody}`;
      const waUrlNagaraju = `https://wa.me/916301290966?text=${encodeURIComponent(msgNagaraju)}`;

      // Redirect the current tab to WhatsApp directly to bypass mobile popup blockers
      window.location.href = waUrlNagaraju;

      // Pre-fill tracking input with the order phone so they can track it immediately
      setTrackPhone(orderPhone.trim());
    } catch (err) {
      console.error('Error saving order record to database:', err);
      alert('Failed to place order. Please check that you entered valid details.');
    }
    
    // Add success confirmation to Chatbot log as well
    setMessages(prev => [
      ...prev,
      {
        sender: 'bot',
        text: `For the latest pricing, material selection, and final quotation, please speak with Mr. Nagaraju (+916281653998). Once the quotation is confirmed, we'll proceed with your order.\n\nThank you! Your order has been submitted successfully.`
      }
    ]);
    
    // Reset order notes, custom sizes, budget, and file inputs
    setOrderNotes('');
    setCustomSize('');
    setDesiredPrice('');
    setReferenceImageFile(null);
  };

  return (
    <>
      {/* 1. FIRST-TIME VISITOR REGISTRATION MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-wood-dark/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-wood-cream border-2 border-wood-border/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Wooden Texture Backdrop Highlight */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 rounded-full bg-wood-beige/60 -z-10"></div>
            
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1 bg-wood-beige px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest text-wood-accent uppercase mb-3">
                <Sparkles className="h-3 w-3 text-amber-600 animate-spin" />
                Showroom Entry
              </span>
              <h2 className="font-serif text-2xl font-bold text-wood-dark">
                Welcome to LD Interiors & Furnitures
              </h2>
              <p className="mt-2 text-xs text-wood-light font-light leading-relaxed">
                Please enter your details to unlock our premium wooden designs & furniture catalog portfolio.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-wood-accent mb-1.5">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-wood-light/60" />
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g., Pavan Kumar"
                    className="w-full rounded-xl border border-wood-border bg-wood-cream/50 pl-11 pr-4 py-3 text-sm focus:border-wood-dark focus:outline-none transition-colors text-wood-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-wood-accent mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-wood-light/60" />
                  <input
                    type="tel"
                    required
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="e.g., 9346325291"
                    className="w-full rounded-xl border border-wood-border bg-wood-cream/50 pl-11 pr-4 py-3 text-sm focus:border-wood-dark focus:outline-none transition-colors text-wood-dark"
                  />
                </div>
              </div>

              {registerError && (
                <p className="text-xs text-red-600 font-semibold bg-red-50 p-3 rounded-lg border border-red-150 text-center">
                  {registerError}
                </p>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-wood-dark hover:bg-wood-medium px-6 py-4 text-xs font-extrabold tracking-widest text-white uppercase shadow-md transition-colors duration-300 cursor-pointer mt-6"
              >
                Explore Catalog
                <Check className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. FLOATING ASSISTANT WIDGET */}
      {isRegistered && (
        <div className="fixed bottom-6 right-6 landscape:bottom-4 landscape:right-4 z-50 flex flex-col items-end">
          {/* Chat Panel */}
          {isChatOpen && (
            <div className="w-[calc(100vw-32px)] sm:w-[420px] max-w-[420px] h-[500px] max-h-[70vh] landscape:h-[260px] sm:h-[520px] sm:max-h-[80vh] bg-gradient-to-b from-[#FAF6F0] to-[#FDFBF7] border-2 border-wood-accent/20 rounded-3xl shadow-2xl flex flex-col mb-4 overflow-hidden animate-slideUp">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#423525] to-[#6d553b] px-5 py-4 text-white border-b border-wood-border/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="h-9 w-9 rounded-full bg-[#ebdcc5] flex items-center justify-center text-wood-dark border border-wood-accent/30 shadow-inner">
                        <svg className="h-5 w-5 text-wood-accent fill-current" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15.5h-2v-2h-2v-2h6v2h-2v2zm-3.5-7.5c-.83 0-1.5-.67-1.5-1.5S8.67 7 9.5 7s1.5.67 1.5 1.5S10.33 10 9.5 10zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5S15.33 10 14.5 10z"/>
                        </svg>
                      </div>
                      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-wood-dark animate-pulse"></span>
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm leading-none">LD Assistant</h3>
                      {userName ? (
                        <p className="text-[7.5px] text-wood-accent font-semibold tracking-wide mt-1">
                          👤 Logged in as: {userName}
                        </p>
                      ) : (
                        <span className="text-[9px] text-amber-200/90 font-medium tracking-wide inline-flex items-center gap-1 mt-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          Natural Assistant • Online
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-black/20 rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-grow flex items-center justify-center gap-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'chat' ? 'bg-wood-accent text-wood-dark' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="h-3 w-3" />
                    AI Chatbot
                  </button>
                  <button
                    onClick={() => setActiveTab('order')}
                    className={`flex-grow flex items-center justify-center gap-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'order' ? 'bg-wood-accent text-wood-dark' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <ShoppingBag className="h-3 w-3" />
                    Order Now
                  </button>
                  <button
                    onClick={() => { setActiveTab('track'); fetchTrackedOrders(); }}
                    className={`flex-grow flex items-center justify-center gap-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'track' ? 'bg-wood-accent text-wood-dark' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <MapPin className="h-3 w-3" />
                    Track
                  </button>
                </div>
              </div>

              {/* Chat Tab Body */}
              {activeTab === 'chat' && (
                <>
                  {/* Messages Body */}
                  <div className="flex-grow overflow-y-auto p-4 bg-wood-beige/10 space-y-3 animate-fadeIn">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm whitespace-pre-line transition-all duration-300 animate-slideIn ${
                            msg.sender === 'user'
                              ? 'bg-[#423525] text-white rounded-tr-none border border-wood-dark/20'
                              : 'bg-[#faf6f0] border border-[#ebdcc5] text-[#423525] rounded-tl-none font-medium'
                          }`}
                        >
                          <div>{msg.text}</div>
                          
                          {/* Rich Interactive Templates for e-commerce (Amazon/Flipkart style) */}
                          {msg.sender === 'bot' && msg.type === 'categories' && (
                            <div className="mt-3 grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                              {categoriesList.map((cat) => (
                                <button
                                  key={cat.key}
                                  onClick={() => handleCategoryClick(cat.key, cat.label)}
                                  className="p-2 text-[10px] text-center font-bold text-wood-dark bg-white border border-[#ebdcc5] hover:bg-[#ebdcc5]/20 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 duration-150 font-serif"
                                >
                                  {cat.label}
                                </button>
                              ))}
                            </div>
                          )}

                          {msg.sender === 'bot' && msg.type === 'products' && msg.productsData && (
                            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
                              {msg.productsData.map((prod, i) => (
                                <div key={i} className="flex gap-2.5 bg-white p-2 rounded-xl border border-[#ebdcc5] shadow-xs text-left">
                                  <img src={prod.image} alt={prod.title} className="w-14 h-14 object-cover rounded-lg border shrink-0 bg-neutral-100" />
                                  <div className="flex-grow min-w-0 flex flex-col justify-between">
                                    <div>
                                      <h4 className="text-[10px] font-extrabold text-wood-dark truncate font-serif">{prod.title}</h4>
                                      <p className="text-[8px] text-gray-500 line-clamp-1">{prod.category}</p>
                                      <p className="text-[9px] font-extrabold text-emerald-700 mt-0.5">Est. Price: {prod.price}</p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        setActiveTab('order');
                                        setSelectedProduct(prod.title);
                                      }}
                                      className="mt-1 w-full bg-[#423525] hover:bg-wood-medium text-white text-[8px] font-extrabold tracking-wider py-1 rounded-lg transition-colors cursor-pointer text-center"
                                    >
                                      ORDER NOW
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {msg.sender === 'bot' && msg.type === 'tracking' && msg.ordersData && (
                            <div className="mt-3 space-y-3.5 max-h-64 overflow-y-auto pr-1">
                              {msg.ordersData.map((order, i) => {
                                const statuses = ['Order Received', 'Wood Selection', 'Carpentry Work', 'Polishing/Finishing', 'Out for Delivery'];
                                const currentIdx = statuses.indexOf(order.status) !== -1 ? statuses.indexOf(order.status) : 0;
                                
                                return (
                                  <div key={i} className="bg-white p-3 rounded-xl border border-[#ebdcc5] shadow-xs text-left">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 mb-2">
                                      <span className="text-[9px] font-extrabold text-wood-dark font-mono">ID: #{order._id ? order._id.slice(-6).toUpperCase() : 'N/A'}</span>
                                      <span className="text-[8px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-200">{order.status}</span>
                                    </div>
                                    <p className="text-[9.5px] font-bold text-wood-light mb-2">Product: <span className="text-wood-dark font-extrabold">{order.product}</span></p>
                                    
                                    <div className="space-y-1.5 pl-2 relative border-l border-gray-200 ml-1.5">
                                      {statuses.map((step, idx) => {
                                        const isCompleted = idx <= currentIdx;
                                        const isCurrent = idx === currentIdx;
                                        
                                        return (
                                          <div key={idx} className="relative flex items-center gap-2 pl-3 py-0.5">
                                            <span className={`absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full border flex items-center justify-center ${
                                              isCompleted ? 'bg-emerald-500 border-emerald-600' : 'bg-white border-gray-300'
                                            }`}>
                                              {isCompleted && (
                                                <span className="block h-1 w-1 rounded-full bg-white"></span>
                                              )}
                                            </span>
                                            <span className={`text-[8.5px] font-semibold ${
                                              isCurrent ? 'text-emerald-700 font-extrabold' : isCompleted ? 'text-wood-dark' : 'text-gray-400'
                                            }`}>
                                              {step}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          {/* User uploaded room image preview */}
                          {msg.sender === 'user' && msg.image && (
                            <img
                              src={msg.image}
                              alt="Uploaded room layout"
                              className="mt-2.5 rounded-xl max-h-44 w-full object-cover border border-white/20 shadow-sm"
                            />
                          )}

                          {/* Bot recommended designs gallery grid */}
                          {msg.sender === 'bot' && msg.images && msg.images.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              {msg.images.map((img, i) => (
                                <div key={i} className="group relative rounded-xl overflow-hidden border border-wood-border/30 shadow-sm aspect-video bg-neutral-150">
                                  <img
                                    src={img}
                                    alt="Product option"
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div 
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 cursor-pointer"
                                    onClick={() => {
                                      const matched = dbProducts.find(p => p.image === img);
                                      if (matched) {
                                        setActiveTab('order');
                                        setSelectedProduct(matched.title);
                                      }
                                    }}
                                  >
                                    <span className="text-[9px] font-bold text-white uppercase tracking-widest bg-wood-accent/90 py-1 px-2 rounded-lg">
                                      Order
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {msg.action && msg.action.type === 'order' && (
                            <button
                              onClick={() => {
                                setActiveTab('order');
                                setSelectedProduct(msg.action.productTitle);
                              }}
                              className="mt-3.5 w-full flex items-center justify-center gap-1.5 rounded-xl bg-wood-accent hover:bg-amber-500 text-wood-dark font-extrabold py-2 px-3 text-[10px] uppercase tracking-widest transition-colors duration-300 cursor-pointer shadow-sm btn-3d-accent border border-wood-accent"
                            >
                              <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
                              <span>Order {msg.action.productTitle}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Action Suggestions */}
                  <div className="px-4 py-2 bg-wood-cream border-t border-wood-border/30 flex flex-wrap gap-1.5 justify-center">
                    <button
                      onClick={() => handleQuickPrompt('📖 How to Use')}
                      className="px-2.5 py-1 rounded-full bg-violet-50 hover:bg-violet-100 border border-violet-200 text-[9px] font-bold text-violet-800 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      📖 How to Use
                    </button>
                    <button
                      onClick={() => handleQuickPrompt('I want to order a design')}
                      className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[9px] font-bold text-emerald-800 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      🛋️ Order Design
                    </button>
                    <button
                      onClick={() => handleQuickPrompt('Track my order progress')}
                      className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[9px] font-bold text-amber-800 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      📦 Track Order
                    </button>
                    <button
                      onClick={() => handleQuickPrompt('I need customer support help')}
                      className="px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[9px] font-bold text-rose-800 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      🔧 Help & Support
                    </button>
                    <button
                      onClick={() => handleQuickPrompt('Contact information for admins')}
                      className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[9px] font-bold text-blue-800 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      📞 Contact Admins
                    </button>
                    <button
                      onClick={() => handleQuickPrompt('Where is your workshop address?')}
                      className="px-2.5 py-1 rounded-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-[9px] font-bold text-neutral-800 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      🌟 Workshop Address
                    </button>
                  </div>

                  {/* Chat Input Footer */}
                  <form onSubmit={handleChatSubmit} className="p-3 bg-wood-cream border-t border-wood-border/50 flex gap-2 items-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 rounded-xl bg-wood-beige hover:bg-wood-accent text-wood-dark hover:text-white transition-colors cursor-pointer"
                      title="Upload room photo for matching products"
                    >
                      <Camera className="h-4.5 w-4.5" />
                    </button>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Search items or ask about teak wood, pricing..."
                      className="flex-grow rounded-xl border border-wood-border px-3.5 py-2.5 text-xs bg-wood-cream/50 text-wood-dark focus:border-wood-dark focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="p-2.5 rounded-xl bg-wood-dark hover:bg-wood-medium text-white shadow-sm transition-colors cursor-pointer"
                    >
                      <Send className="h-4.5 w-4.5" />
                    </button>
                  </form>
                </>
              )}

              {/* WhatsApp Order Form Tab Body */}
              {activeTab === 'order' && (
                <div className="flex-grow overflow-y-auto p-5 bg-wood-beige/10">
                  <h4 className="font-serif text-sm font-bold text-wood-dark mb-4 flex items-center gap-1.5">
                    <MessageCircle className="h-4.5 w-4.5 text-emerald-650" />
                    WhatsApp Order Checkout
                  </h4>
                  
                  <form onSubmit={handleOrderSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                        Customer Name
                      </label>
                      <input
                        type="text"
                        required
                        value={orderName}
                        onChange={(e) => setOrderName(e.target.value)}
                        className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={orderPhone}
                        onChange={(e) => setOrderPhone(e.target.value)}
                        className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                        placeholder="Your contact number"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                        Gmail/Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={orderEmail}
                        onChange={(e) => setOrderEmail(e.target.value)}
                        className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                        placeholder="name@gmail.com"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                        Delivery Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={orderAddress}
                        onChange={(e) => setOrderAddress(e.target.value)}
                        className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                        placeholder="House No, Street, City, Pincode"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                        Select Design / Furniture Model
                      </label>
                      <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                      >
                        {dbProducts.map(p => (
                          <option key={p._id} value={p.title}>
                            {p.title} ({p.category})
                          </option>
                        ))}
                        <option value="Custom Bedroom/Wardrobe Furniture">Custom Bedroom / Wardrobes</option>
                        <option value="Custom Teak Carved Entrance Door">Custom Handcarved Teak Door</option>
                        <option value="Custom Sofa Sectional Layout">Custom Cushion Sofa Set</option>
                        <option value="Custom Puja Mandiram (Pooja Temple)">Custom Puja Mandiram (Pooja Temple)</option>
                        <option value="Custom Teak Gummam (Main Door Frame)">Custom Teak Gummam (Main Door Frame)</option>
                        <option value="Custom Teak Dressing Table with Mirror">Custom Teak Dressing Table with Mirror</option>
                        <option value="Complete Room Interior Design Contract">General Room Design Contract</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                          Custom Size (Optional)
                        </label>
                        <input
                          type="text"
                          value={customSize}
                          onChange={(e) => setCustomSize(e.target.value)}
                          className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                          placeholder="e.g., 6x7 feet"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                          Your Budget (Optional)
                        </label>
                        <input
                          type="text"
                          value={desiredPrice}
                          onChange={(e) => setDesiredPrice(e.target.value)}
                          className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                          placeholder="e.g., ₹25,000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                        Upload Reference Image (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setReferenceImageFile(e.target.files[0])}
                        className="w-full text-xs text-wood-dark file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-extrabold file:uppercase file:tracking-wider file:bg-wood-beige file:text-wood-accent hover:file:bg-wood-accent hover:file:text-white file:transition-colors file:cursor-pointer cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                        Custom Notes / Special Requests (Optional)
                      </label>
                      <textarea
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        rows="2"
                        className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark placeholder-neutral-400 font-light"
                        placeholder="e.g., Teak Wood, specific carving..."
                      ></textarea>
                    </div>

                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[10px] text-amber-800 leading-relaxed font-medium">
                      ⚠️ For the latest pricing, material selection, and final quotation, please speak with Mr. Nagaraju (+916281653998). Once the quotation is confirmed, we'll proceed with your order.
                    </div>

                    {orderSuccess && (
                      <div className="rounded-xl bg-emerald-50 border border-emerald-150 p-3 text-[11px] text-emerald-800 flex items-center gap-1.5">
                        <Check className="h-4.5 w-4.5 text-emerald-600" />
                        <span>Redirecting to WhatsApp successfully! Check details.</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={orderSuccess}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-650 px-5 py-3.5 text-xs font-bold tracking-widest text-white uppercase shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>
                        {orderSuccess ? 'Submitting Order...' : 'Send Order to WhatsApp (Both Admins)'}
                      </span>
                    </button>
                  </form>
                </div>
              )}

              {/* Track Order Tab Body */}
              {activeTab === 'track' && (
                <div className="flex-grow overflow-y-auto p-5 bg-wood-beige/10 text-left flex flex-col">
                  <h4 className="font-serif text-sm font-bold text-wood-dark mb-4 flex items-center gap-1.5">
                    <MapPin className="h-4.5 w-4.5 text-wood-accent animate-pulse" />
                    Track Order Status
                  </h4>
                  
                  {/* Phone input to search orders */}
                  <div className="mb-5 bg-white border border-wood-border/40 rounded-2xl p-4 shadow-sm">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-2">
                      Registered Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={trackPhone}
                        onChange={(e) => setTrackPhone(e.target.value)}
                        placeholder="e.g., 9346325291"
                        className="flex-grow rounded-xl border border-wood-border px-3.5 py-2.5 text-xs text-wood-dark focus:outline-none focus:border-wood-dark bg-wood-cream/20"
                      />
                      <button
                        onClick={handleTrackSearch}
                        className="px-4 py-2.5 bg-wood-dark text-white rounded-xl text-xs font-bold uppercase hover:bg-wood-medium cursor-pointer transition-colors shadow-sm"
                      >
                        Search
                      </button>
                    </div>
                  </div>

                  {trackingLoading ? (
                    <div className="flex-grow flex items-center justify-center py-12">
                      <Loader2 className="h-7 w-7 animate-spin text-wood-accent" />
                    </div>
                  ) : trackingError ? (
                    <div className="text-center text-xs text-red-650 bg-red-50 border border-red-150 p-4 rounded-xl font-medium">
                      {trackingError}
                    </div>
                  ) : trackedOrders.length === 0 ? (
                    <div className="text-center text-xs text-wood-light py-12 font-light">
                      {trackPhone ? "No active orders found for this phone number." : "Enter your mobile number above and search to fetch your order status timeline."}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {trackedOrders.map((order) => (
                        <div key={order._id} className="bg-white border border-wood-border/40 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                          {/* Image preview and title */}
                          <div className="flex gap-3 mb-4">
                            {order.imageUrl ? (
                              <img
                                src={order.imageUrl}
                                alt=""
                                className="h-12 w-12 rounded-lg object-cover border border-wood-border/20 shadow-sm"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-wood-beige/40 flex items-center justify-center text-wood-accent font-serif font-bold text-xs border border-wood-border/20 shadow-sm">
                                LD
                              </div>
                            )}
                            <div>
                              <h5 className="font-serif text-xs font-bold text-wood-dark line-clamp-1">{order.product}</h5>
                              <p className="text-[9px] text-wood-light mt-0.5 flex flex-col gap-0.5">
                                <span>Ordered: {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                {order.updatedAt && new Date(order.updatedAt).getTime() !== new Date(order.createdAt).getTime() && (
                                  <span className="text-emerald-700 font-semibold">
                                    Updated: {new Date(order.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Order Status Timeline */}
                          <div className="space-y-4 pt-4 border-t border-wood-border/20">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-wood-accent font-extrabold uppercase tracking-widest text-[9px]">Live Progress</span>
                              <span className={`px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-full ${
                                order.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                order.status === 'Cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                                order.status === 'In Progress' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                order.status === 'Processing' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                'bg-neutral-100 text-neutral-805 border border-neutral-200'
                              }`}>
                                {order.status}
                              </span>
                            </div>

                            {/* Timeline steps visualization */}
                            <div className="relative pl-6 space-y-4 text-xs font-light text-wood-medium">
                              {/* Connector line */}
                              {order.status !== 'Cancelled' && (
                                <div className="absolute left-1.5 top-1.5 bottom-1.5 w-0.5 bg-wood-border/30 -z-10"></div>
                              )}
                              
                              {order.status === 'Cancelled' ? (
                                <div className="relative">
                                  <span className="absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full border-2 bg-red-650 border-red-650 text-white flex items-center justify-center">
                                    <X className="h-2 w-2" />
                                  </span>
                                  <div>
                                    {order.updatedAt && (
                                      <p className="text-[8px] text-red-600 font-bold mb-0.5">
                                        Cancelled: {new Date(order.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                    )}
                                    <p className="font-bold text-red-700">Order Cancelled</p>
                                    <p className="text-[10px] text-wood-light">This order has been cancelled. Please contact Nagaraju for details.</p>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {/* Step 1 */}
                                  <div className="relative">
                                    <span className={`absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${
                                      ['Pending', 'Processing', 'In Progress', 'Completed'].includes(order.status)
                                        ? 'bg-wood-accent border-wood-accent text-white'
                                        : 'bg-white border-wood-border'
                                    }`}>
                                      <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                                    </span>
                                    <div>
                                      <p className="text-[8px] text-wood-accent font-semibold mb-0.5">
                                        Ordered: {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                      <p className="font-bold text-wood-dark">Order Booked</p>
                                      <p className="text-[10px] text-wood-light">Details received by admin Pavan Sai</p>
                                    </div>
                                  </div>

                                  {/* Step 2 */}
                                  <div className="relative">
                                    <span className={`absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${
                                      ['Processing', 'In Progress', 'Completed'].includes(order.status)
                                        ? 'bg-wood-accent border-wood-accent text-white'
                                        : 'bg-white border-wood-border'
                                    }`}>
                                      <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                                    </span>
                                    <div>
                                      {order.status === 'Processing' && order.updatedAt && (
                                        <p className="text-[8px] text-wood-accent font-semibold mb-0.5">
                                          Updated: {new Date(order.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                      )}
                                      <p className="font-bold text-wood-dark">Processing & Verification</p>
                                      <p className="text-[10px] text-wood-light">Nagaraju finalizing sizes, lumber options, and budget</p>
                                    </div>
                                  </div>

                                  {/* Step 3 */}
                                  <div className="relative">
                                    <span className={`absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${
                                      ['In Progress', 'Completed'].includes(order.status)
                                        ? 'bg-wood-accent border-wood-accent text-white'
                                        : 'bg-white border-wood-border'
                                    }`}>
                                      <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                                    </span>
                                    <div>
                                      {order.status === 'In Progress' && order.updatedAt && (
                                        <p className="text-[8px] text-wood-accent font-semibold mb-0.5">
                                          Updated: {new Date(order.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                      )}
                                      <p className="font-bold text-wood-dark">In Progress (Crafting)</p>
                                      <p className="text-[10px] text-wood-light">Handcarving / polishing underway in Alamuru workshop</p>
                                    </div>
                                  </div>

                                  {/* Step 4 */}
                                  <div className="relative">
                                    <span className={`absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${
                                      order.status === 'Completed'
                                        ? 'bg-emerald-600 border-emerald-600 text-white'
                                        : 'bg-white border-wood-border'
                                    }`}>
                                      <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                                    </span>
                                    <div>
                                      {order.status === 'Completed' && order.updatedAt && (
                                        <p className="text-[8px] text-emerald-600 font-semibold mb-0.5">
                                          Completed: {new Date(order.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                      )}
                                      <p className="font-bold text-wood-dark">Completed & Delivered</p>
                                      <p className="text-[10px] text-wood-light">Setup successfully installed at customer location</p>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Red Love Symbol for Dream Designs / Liked Designs */}
          {likedCount > 0 && (
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  if (window.location.pathname === '/products') {
                    window.dispatchEvent(new Event('open-liked-drawer'));
                  } else {
                    window.location.href = '/products?openLiked=true';
                  }
                }
              }}
              className="mb-3.5 relative group flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-tr from-red-600 to-red-500 text-white shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer border-2 border-white/90 animate-bounce z-50"
              title={`Dream Designs (${likedCount} Liked)`}
            >
              <Heart className="h-6 w-6 fill-white text-white drop-shadow-sm" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-wood-dark border-2 border-white text-[9px] font-extrabold text-white shadow-md">
                {likedCount}
              </span>
            </button>
          )}

          {/* Chat Floating Button with Cute Animated Girl Mascot */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="flex items-center justify-center h-16 w-16 landscape:h-12 landscape:w-12 rounded-full bg-gradient-to-tr from-[#423525] to-[#6d553b] text-white hover:scale-105 shadow-2xl transition-all duration-300 cursor-pointer relative border-2 border-[#ebdcc5] overflow-hidden group"
          >
            {isChatOpen ? (
              <svg className="h-6 w-6 text-[#ebdcc5] transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="h-12 w-12 landscape:h-9 landscape:w-9 drop-shadow-md">
                  <style>{`
                    @keyframes girlBlink {
                      0%, 90%, 100% { transform: scaleY(1); }
                      95% { transform: scaleY(0.1); }
                    }
                    .girl-eyes {
                      animation: girlBlink 4s infinite;
                      transform-origin: 50px 50px;
                    }
                  `}</style>
                  {/* Hair back */}
                  <path d="M20,60 C20,20 80,20 80,60 C80,65 75,70 70,68 C65,66 60,60 50,60 C40,60 35,66 30,68 C25,70 20,65 20,60 Z" fill="#2D2116" />
                  {/* Neck */}
                  <rect x="46" y="62" width="8" height="12" rx="4" fill="#ffd1b3" />
                  {/* Head */}
                  <circle cx="50" cy="46" r="20" fill="#ffe0cc" />
                  {/* Hair bangs */}
                  <path d="M30,40 C35,26 65,26 70,40 C72,36 68,26 50,26 C32,26 28,36 30,40 Z" fill="#2D2116" />
                  {/* Eyes (Blinking!) */}
                  <g className="girl-eyes">
                    <circle cx="43" cy="45" r="2.5" fill="#231709" />
                    <circle cx="57" cy="45" r="2.5" fill="#231709" />
                    <circle cx="44" cy="44" r="0.8" fill="#ffffff" />
                    <circle cx="58" cy="44" r="0.8" fill="#ffffff" />
                  </g>
                  {/* Rosy cheeks */}
                  <circle cx="34" cy="50" r="3" fill="#ff9999" opacity="0.6" />
                  <circle cx="66" cy="50" r="3" fill="#ff9999" opacity="0.6" />
                  {/* Nose */}
                  <path d="M49,50 C49,50 50,51.5 51,50" stroke="#e6a885" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                  {/* Smiling Mouth */}
                  <path d="M46,54 Q50,58 54,54" stroke="#e65c5c" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </svg>
                {/* Active notification indicator */}
                <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ebdcc5] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ebdcc5] items-center justify-center text-[7px] font-extrabold text-wood-dark">
                    !
                  </span>
                </span>
              </div>
            )}
          </button>
        </div>
      )}
    </>
  );
}
