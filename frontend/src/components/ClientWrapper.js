"use client";
import { useState, useEffect, useRef } from 'react';
import { Sparkles, MessageSquare, X, Send, Phone, User, Check, Hammer, HelpCircle, ShoppingBag, MessageCircle, MapPin, Loader2, Camera } from 'lucide-react';
import api from '@/utils/api';

export default function ClientWrapper() {
  // Visitor Registration Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

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
    { field: 'budget', question: 'What is your approximate budget?' }
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
  const [selectedProduct, setSelectedProduct] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [whatsappAdmin, setWhatsappAdmin] = useState('both');

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

We're delighted to have you here.

Whether you're looking for stylish furniture, complete home interiors, modular kitchens, wardrobes, TV units, bedrooms, office furniture, or custom-made designs, I'm here to help you every step of the way.

You can browse our products, explore our latest designs, ask questions, or even place a custom order.

How can I help you today?`;
      sessionStorage.setItem('ld_welcomed', 'true');
    } else {
      welcomeText = `Welcome back! What would you like to explore today?`;
    }

    setMessages([
      {
        sender: 'bot',
        text: welcomeText
      }
    ]);

    if (!registered) {
      setShowRegisterModal(true);
    } else {
      setIsRegistered(true);
      setUserName(savedName);
      setUserPhone(savedPhone);
      setOrderName(savedName);
      setOrderPhone(savedPhone);
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

We're delighted to have you here.

Whether you're looking for stylish furniture, complete home interiors, modular kitchens, wardrobes, TV units, bedrooms, office furniture, or custom-made designs, I'm here to help you every step of the way.

You can browse our products, explore our latest designs, ask questions, or even place a custom order.

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

    // ----------------------------------------------------
    // WORKFLOW STATE MACHINE
    // ----------------------------------------------------
    if (currentWorkflow && currentWorkflow.type !== 'idle') {
      const { type, step, lang, collected, awaitingConfirmation } = currentWorkflow;

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
                product: (collected.product || collected.furnitureType || 'Custom Furniture').trim(),
                imageUrl: absoluteImageUrl,
                notes: `Address: ${collected.address || ''}, City: ${collected.city || ''}, Pincode: ${collected.pincode || ''}. Custom details: Sizing: ${collected.length || ''}x${collected.width || ''}x${collected.height || ''}, Material: ${collected.material || ''}, Finish: ${collected.finish || ''}, Color: ${collected.color || ''}, Timeline: ${collected.timeline || ''}, Budget: ${collected.budget || ''}, Special: ${collected.specialRequirements || collected.customization || ''}`
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
    const isCustomTrigger = query.includes('custom') || query.includes('customise') || query.includes('customization') || query.includes('custom-made') || query.includes('carpenter design') || query.includes('కస్టమ్') || query.includes('కస్టమైజ్');
    const isOrderTrigger = query.includes('buy') || query.includes('order') || query.includes('place order') || query.includes('need this furniture') || query.includes('want to buy') || query.includes('place this order') || query.includes('కొనాలి') || query.includes('ఆర్డర్');

    if (isOrderTrigger) {
      const initialCollected = {
        product: matchedProductTitle || '',
        name: localStorage.getItem('ld_user_name') || userName || '',
        phone: localStorage.getItem('ld_user_phone') || userPhone || '',
      };
      const nextStepIdx = findNextEmptyStep(ORDER_STEPS, initialCollected);
      if (nextStepIdx !== -1) {
        const nextField = ORDER_STEPS[nextStepIdx].field;
        const question = getQuestionText(nextField, langStyle);
        return {
          text: question,
          nextState: { type: 'order', step: nextStepIdx, lang: langStyle, collected: initialCollected }
        };
      }
    }

    if (isCustomTrigger) {
      const initialCollected = {
        name: localStorage.getItem('ld_user_name') || userName || '',
        phone: localStorage.getItem('ld_user_phone') || userPhone || '',
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
      // 1. PRICING & ESTIMATION / QUOTATIONS
      if (query.includes('price') || query.includes('cost') || query.includes('estimation') || query.includes('budget') || query.includes('ధర') || query.includes('ఖర్చు') || query.includes('rate') || query.includes('quotation') || query.includes('quote') || query.includes('negotiation') || query.includes('payment')) {
        return langStyle === 'en'
          ? `For the latest pricing, material selection, and final quotation, please speak with Mr. Nagaraju (+916281653998) or Tech Admin Pavan Sai (+919346325291). Once the quotation is confirmed, I'll proceed with your order.`
          : langStyle === 'te'
          ? `తాజా ధరలు, మెటీరియల్ ఎంపిక మరియు తుది కొటేషన్ కోసం, దయచేసి మిస్టర్ నాగరాజు (+916281653998) లేదా వెబ్ అడ్మిన్ పవన్ సాయి (+919346325291) గారితో మాట్లాడండి. కొటేషన్ ధృవీకరించబడిన తర్వాత, నేను మీ ఆర్డర్‌తో ముందుకుసాగుతాను.`
          : `For the latest pricing, material selection, and final quotation, please speak with Mr. Nagaraju (+916281653998) or Tech Admin Pavan Sai (+919346325291). Once the quotation is confirmed, I'll proceed with your order.`;
      }

      // 2. CONTACT ROUTING FOR PAVAN SAI / TECHNICAL / DESIGNS
      if (query.includes('developer') || query.includes('website') || query.includes('admin') || query.includes('pavan') || query.includes('pawansai') || query.includes('technical') || query.includes('support') || query.includes('design information') || query.includes('product details')) {
        return langStyle === 'en'
          ? `For product design details, technical specifications, website support, or admin dashboard logins, please contact Web Admin Pavan Sai at +919346325291.`
          : langStyle === 'te'
          ? `డిజైన్ సమాచారం, సాంకేతిక ప్రశ్నలు మరియు వెబ్‌సైట్ సహాయం కోసం, దయచేసి పవన్ సాయి (+919346325291) గారిని సంప్రదించండి.`
          : `Design details, website support lera technical questions kosam developer Pavan Sai (+919346325291) garithoti matladandi andi.`;
      }

      // 3. ADDRESS & LOCATION
      if (query.includes('address') || query.includes('location') || query.includes('where') || query.includes('office') || query.includes('place') || query.includes('ఎక్కడ')) {
        return langStyle === 'en'
          ? `Our studio and carpentry workshop is located at Door No. 6-132, Mulasthanam, Alamuru Mandal, Konaseema District, Andhra Pradesh, PIN: 533233. We offer free delivery and setup in the surrounding areas!`
          : langStyle === 'te'
          ? `మా స్టూడియో మరియు వర్క్‌షాప్ చిరునామా: డోర్ నెం. 6-132, మూలస్థానం, ఆలమూరు మండలం, కోనసీమ జిల్లా, ఆంధ్రప్రదేశ్, పిన్: 533233.`
          : `Maa studio workshop details: Door No. 6-132, Mulasthanam, Alamuru Mandal, Konaseema District, Andhra Pradesh, PIN: 533233. Konaseema surroundings lo delivery coordinate chestham andi.`;
      }

      // 4. ORDER STATUS TRACKING
      if (query.includes('my order') || query.includes('ordered') || query.includes('track') || query.includes('status') || query.includes('delivery') || query.includes('naa order')) {
        const savedName = localStorage.getItem('ld_user_name') || '';
        const savedPhone = localStorage.getItem('ld_user_phone') || '';

        if (savedName && savedPhone) {
          if (trackedOrders && trackedOrders.length > 0) {
            const listString = trackedOrders.map(o => `- ${o.product}: Status is ${o.status}`).join('\n');
            return langStyle === 'en'
              ? `Hello ${savedName}! Here is the status of your order(s):\n${listString}\n\nYou can view full live progress timelines on our 'Orders' page.`
              : langStyle === 'te'
              ? `నమస్తే ${savedName} గారు! మీ ఆర్డర్ స్థితి వివరాలు:\n${listString}\n\nమీ ఆర్డర్ స్థితిని చెక్ చేయడానికి ట్రాక్ లింక్ చూడండి.`
              : `Mee order status check cheyyali anukuntey track link check cheyyandi:\n👉 https://ld-interiors-ai.vercel.app/orders\n\n${listString}`;
          } else {
            return langStyle === 'en'
              ? `Hello ${savedName}! You are registered with phone number ${savedPhone}. I could not find any active orders for this number in our database yet.`
              : langStyle === 'te'
              ? `నమస్తే ${savedName} గారు! ఈ ఫోన్ నంబర్‌తో నమోదు చేయబడిన యాక్టివ్ ఆర్డర్‌లు ఏవీ లేవు.`
              : `Namaste ${savedName} Garu! Mee number thoti register ayyi unru, kani database checks lo active orders dhorakaledhu.`;
          }
        } else {
          return langStyle === 'en'
            ? `Please enter your details in our visitor form first. Once registered, I will be able to search the database and tracking logs for your orders instantly!`
            : langStyle === 'te'
            ? `దయచేసి మొదట మీ వివరాలను నమోదు చేయండి, అప్పుడు మీ ఆర్డర్ స్థితిని చూపించగలను.`
            : `Namaste! Dayachesi website entry user register detail complete cheyyandi.`;
        }
      }

      // 5. GREETINGS / HELLO
      if (query.includes('hello') || query.includes('hi') || query.includes('namaste') || query.includes('hey') || query.includes('hai')) {
        return langStyle === 'en'
          ? `Welcome back! What would you like to explore today?`
          : langStyle === 'te'
          ? `నమస్తే! స్వాగతం. ఈ రోజు మీరు ఏమి అన్వేషించాలనుకుంటున్నారు?`
          : `Welcome back! What would you like to explore today?`;
      }

      // 6. EXPERIENCE & TRUST
      if (query.includes('experience') || query.includes('years') || query.includes('trust') || query.includes('అనుభవం')) {
        return langStyle === 'en'
          ? `LD Interiors & Furnitures has over 25 years of local carpentry trust and design legacy in the Konaseema region. We maintain the highest standards of Teak durability.`
          : `LD Interiors & Furnitures ki Konaseema area surroundings lo total 25+ years experience and solid quality wood carpentry trust records undi andi. Strong teak wood carvings designs durability criteria checks is standard high level!`;
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
        productTitle: matchedProductTitle,
        nextState: { type: 'idle', step: 0, lang: langStyle, collected: {} }
      };
    } else {
      return {
        text: baseResponseObj,
        images: [],
        productTitle: matchedProductTitle,
        nextState: { type: 'idle', step: 0, lang: langStyle, collected: {} }
      };
    }
  };

  // Handle chat message submit
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    // Simulate bot thinking and reply
    setTimeout(() => {
      const replyObj = getBotResponse(userMsg, workflowState);
      
      // Update workflow state
      if (replyObj.nextState) {
        setWorkflowState(replyObj.nextState);
      }

      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: replyObj.text,
        images: replyObj.images || [],
        action: replyObj.productTitle ? { type: 'order', productTitle: replyObj.productTitle } : null
      }]);
      
      // Speak the reply
      const isEnglish = checkIsEnglishQuery(userMsg);
      speakMessage(replyObj.text, !isEnglish);
    }, 500);
  };

  // Quick prompt handle
  const handleQuickPrompt = (promptText) => {
    setMessages(prev => [...prev, { sender: 'user', text: promptText }]);
    setTimeout(() => {
      const replyObj = getBotResponse(promptText, workflowState);
      
      // Update workflow state
      if (replyObj.nextState) {
        setWorkflowState(replyObj.nextState);
      }

      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: replyObj.text,
        images: replyObj.images || [],
        action: replyObj.productTitle ? { type: 'order', productTitle: replyObj.productTitle } : null
      }]);
      
      // Speak the reply
      const isEnglish = checkIsEnglishQuery(promptText);
      speakMessage(replyObj.text, !isEnglish);
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

    if (!orderName.trim() || !orderPhone.trim() || !selectedProduct) {
      alert('Please fill out all required fields.');
      return;
    }

    const matchedProduct = dbProducts.find(p => p.title === selectedProduct);
    const productImage = matchedProduct ? matchedProduct.image : '';
    const productPrice = matchedProduct && matchedProduct.price ? matchedProduct.price : 0;
    const absoluteImageUrl = productImage ? (productImage.startsWith('http') ? productImage : `${window.location.origin}${productImage.startsWith('/') ? '' : '/'}${productImage}`) : '';

    // Save order in the database
    try {
      await api.post('/orders', {
        name: orderName.trim(),
        phone: orderPhone.trim(),
        product: selectedProduct,
        imageUrl: absoluteImageUrl,
        notes: orderNotes.trim() || 'No custom notes.'
      });
      // Pre-fill tracking input with the order phone so they can track it immediately
      setTrackPhone(orderPhone.trim());
    } catch (err) {
      console.error('Error saving order record to database:', err);
    }

    const adminGreeting = whatsappAdmin === 'nagaraju' ? 'Nagaraju' : whatsappAdmin === 'pavansai' ? 'Pavan Sai' : 'LD Interiors';
    const whatsappMessage = `Hello ${adminGreeting}! I would like to place a design order/inquiry via LD Interiors & Furnitures website:

*Customer Details:*
- Name: ${orderName.trim()}
- Phone: ${orderPhone.trim()}

*Order Details:*
- Selected Design: ${selectedProduct}
- Price: ${productPrice > 0 ? `₹${productPrice.toLocaleString('en-IN')}` : 'Contact for pricing'}
${absoluteImageUrl ? `- Image URL: ${absoluteImageUrl}\n` : ''}- Customizations / Notes: ${orderNotes.trim() || 'No custom notes.'}

Please review this order and provide availability and pricing details. Thank you!`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    
    let whatsappUrl = '';
    if (whatsappAdmin === 'nagaraju') {
      whatsappUrl = `https://wa.me/916281653998?text=${encodedMessage}`;
    } else if (whatsappAdmin === 'pavansai') {
      whatsappUrl = `https://wa.me/919346325291?text=${encodedMessage}`;
    } else {
      whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    }
    
    // Open WhatsApp URL
    window.open(whatsappUrl, '_blank');
    setOrderSuccess(true);
    
    // Add success confirmation to Chatbot log as well
    setMessages(prev => [
      ...prev,
      {
        sender: 'bot',
        text: `For the latest pricing, material selection, and final quotation, please speak with Mr. Nagaraju (+916281653998) or Tech Admin Pavan Sai (+919346325291). Once the quotation is confirmed, we'll proceed with your order.\n\nThank you! Your order has been submitted successfully. Our team will contact you shortly.`
      }
    ]);
    
    // Reset order notes
    setOrderNotes('');
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
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {/* Chat Panel */}
          {isChatOpen && (
            <div className="w-[calc(100vw-32px)] sm:w-[420px] max-w-[420px] h-[500px] sm:h-[520px] bg-wood-cream border border-wood-border rounded-3xl shadow-2xl flex flex-col mb-4 overflow-hidden animate-slideUp">
              {/* Header */}
              <div className="bg-wood-dark px-5 py-4 text-white border-b border-wood-border/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-wood-accent flex items-center justify-center text-wood-dark font-serif font-extrabold text-sm shadow-inner">
                      LD
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm leading-none">LD Assistant</h3>
                      {userName ? (
                        <p className="text-[7.5px] text-wood-accent font-semibold tracking-wide mt-1">
                          👤 Logged in as: {userName}
                        </p>
                      ) : (
                        <span className="text-[9px] text-wood-cream/70 font-light tracking-wide inline-flex items-center gap-1 mt-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          Online • Conversational Search
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
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm whitespace-pre-line ${
                            msg.sender === 'user'
                              ? 'bg-wood-dark text-white rounded-tr-none'
                              : 'bg-white border border-wood-border/50 text-wood-dark rounded-tl-none font-light'
                          }`}
                        >
                          <div>{msg.text}</div>
                          
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

                  {/* Quick Prompt Suggestions */}
                  <div className="px-4 py-2 bg-wood-cream border-t border-wood-border/30 flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleQuickPrompt('Search sofas design list')}
                      className="px-2.5 py-1 rounded-full bg-wood-beige text-[9px] font-bold text-wood-dark hover:bg-wood-accent hover:text-white transition-colors cursor-pointer"
                    >
                      Sofa sets?
                    </button>
                    <button
                      onClick={() => handleQuickPrompt('Search teak beds')}
                      className="px-2.5 py-1 rounded-full bg-wood-beige text-[9px] font-bold text-wood-dark hover:bg-wood-accent hover:text-white transition-colors cursor-pointer"
                    >
                      Teak Beds?
                    </button>
                    <button
                      onClick={() => handleQuickPrompt('Nagaraju details for estimation')}
                      className="px-2.5 py-1 rounded-full bg-wood-beige text-[9px] font-bold text-wood-dark hover:bg-wood-accent hover:text-white transition-colors cursor-pointer"
                    >
                      Cost estimation?
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
                        Mobile Number
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
                        <option value="Custom Devudi Mandiram (Pooja Temple)">Custom Devudi Mandiram (Pooja Temple)</option>
                        <option value="Custom Teak Gummam (Main Door Frame)">Custom Teak Gummam (Main Door Frame)</option>
                        <option value="Custom Teak Dressing Table with Mirror">Custom Teak Dressing Table with Mirror</option>
                        <option value="Complete Room Interior Design Contract">General Room Design Contract</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                        Custom Sizing / Wood Details / Address
                      </label>
                      <textarea
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        rows="3"
                        className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark placeholder-neutral-400 font-light"
                        placeholder="e.g., 6x6 feet double bed, Teak Wood frame, delivery to Alamuru..."
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                        Send WhatsApp Order To
                      </label>
                      <select
                        value={whatsappAdmin}
                        onChange={(e) => setWhatsappAdmin(e.target.value)}
                        className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark font-light"
                      >
                        <option value="both">Both Admins (Choose in WhatsApp)</option>
                        <option value="nagaraju">Nagaraju (Manager: +916281653998)</option>
                        <option value="pavansai">Pavan Sai (Tech Admin: +919346325291)</option>
                      </select>
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
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-650 px-5 py-3.5 text-xs font-bold tracking-widest text-white uppercase shadow-md transition-colors cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>
                        {whatsappAdmin === 'nagaraju' ? 'Send Order to Nagaraju' : whatsappAdmin === 'pavansai' ? 'Send Order to Pavan Sai' : 'Send Order to WhatsApp'}
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

          {/* Chat Floating Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="flex items-center justify-center h-14 w-14 rounded-full bg-wood-dark text-white hover:bg-wood-medium hover:scale-105 shadow-2xl transition-all duration-300 cursor-pointer relative"
          >
            <MessageSquare className="h-6 w-6" />
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wood-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-wood-accent items-center justify-center text-[8px] font-extrabold text-wood-dark">
                !
              </span>
            </span>
          </button>
        </div>
      )}
    </>
  );
}
