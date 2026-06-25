"use client";
import { useState, useEffect, useRef } from 'react';
import { Sparkles, MessageSquare, X, Send, Phone, User, Check, Hammer, HelpCircle, ShoppingBag, MessageCircle, MapPin, Loader2 } from 'lucide-react';
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
  
  // WhatsApp Order Form State
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
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
    
    if (!registered) {
      setShowRegisterModal(true);
    } else {
      setIsRegistered(true);
      setUserName(savedName);
      setUserPhone(savedPhone);
      setOrderName(savedName);
      setOrderPhone(savedPhone);
      setTrackPhone(savedPhone);
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

    // Personalize bot greeting
    setMessages([
      {
        sender: 'bot',
        text: `Namaste ${userName.trim()}! Welcome to LD Interiors & Furnitures. How can I help you today? Available products or pricing details edaina adagandi!`
      }
    ]);
  };

  // Bot response logic based on RAG query matching and keyword mapping (Telugu & English)
  const getBotResponse = (input) => {
    const query = input.toLowerCase().trim();

    // 1. GREETINGS
    if (query.includes('hello') || query.includes('hi') || query.includes('namaste') || query.includes('hey') || query.includes('hello assistant') || query.includes('hai')) {
      return `Namaste andi! LD Interiors & Furnitures AI Assistant ki welcome! 
Nenu meeku design options, available products list, lead times, pricing and address estimations details explain cheyagalanu. Ee roju em wooden works lead plans details discuss chedham? TV units, uyyala, mesh doors, kitiki windows with glass, sofa sets, beds - edhaina adagandi!`;
    }

    // 2. PRICING & ESTIMATION
    if (query.includes('price') || query.includes('cost') || query.includes('estimation') || query.includes('budget') || query.includes('ధర') || query.includes('ఖర్చు') || query.includes('rate')) {
      return `Maa custom wood designs build values and cost estimations custom wood sizing specifications, and wood type (Teak wood, Rosewood, Pine) select chesukune option batti adjust calculations chestham andi. Direct project manager, Nagaraju garini contact chesthe precise estimation metrics dynamic and simple ga calculations clear ga details provide chestharu. Mobile: +916281653998!`;
    }

    // 3. TECHNICAL DEV AND SYSTEM ADMIN (Pavan Sai)
    if (query.includes('developer') || query.includes('website') || query.includes('admin') || query.includes('pavan') || query.includes('pawansai')) {
      return `Website system updates, support, admin dashboard access logins lead issues and technical server setup controls direct dynamic updates support admin Pavan Sai handles coordinates. Phone: +919346325291!`;
    }

    // 4. ADDRESS & LOCATION
    if (query.includes('address') || query.includes('location') || query.includes('where') || query.includes('office') || query.includes('place') || query.includes('ఎక్కడ')) {
      return `Maa studio workshop details address andi: Door No. 6-132, Mulasthanam, Alamuru Mandal, Konaseema District, Andhra Pradesh, PIN: 533233. Konaseema regional locations surroundings lo direct delivery installations setup clear ga provide chestham. Map directions guides direct ga explain chestham andi!`;
    }

    // 5. EXPERIENCE & TRUST
    if (query.includes('experience') || query.includes('years') || query.includes('trust') || query.includes('అనుభవం')) {
      return `LD Interiors & Furnitures ki Konaseema area surroundings lo total 25+ years experience and solid quality wood carpentry trust records undi andi. Strong teak wood carvings designs durability criteria checks is standard high level!`;
    }

    // 6. PRODUCT SEARCH & QUERY MATCHING (Telugu/English Synonyms mapping)
    const categorySynonyms = {
      sofa: ['sofa', 'sofas', 'couch', 'సోఫా', 'సోఫాలు', 'కరుచూ', 'cushion'],
      bed: ['bed', 'beds', 'wooden bed', 'మంచం', 'మంచాలు', 'బెడ్', 'డబుల్ బెడ్', 'మంచాల'],
      table: ['table', 'tables', 'dining', 'slab', 'డైనింగ్', 'టేబుల్', 'బల్ల', 'బల్లలు'],
      door: ['door', 'doors', 'entrance', 'తలుపు', 'తలుపులు', 'ద్వారం'],
      window: ['window', 'windows', 'kitiki', 'కిటికీ', 'కిటికీలు'],
      uyyala: ['uyyala', 'swing', 'swings', 'ఉయ్యాల', 'ఉయ్యాలలు'],
      mesh: ['mesh', 'net', 'jalli', 'మెష్', 'జాలి', 'నెట్'],
      tv: ['tv unit', 'tv', 't.v', 'టీవీ', 'టెలివిజన్', 'tv console'],
      polish: ['polish', 'varnish', 'పోలిష్', 'మెరుగు', 'పాలిష్'],
      box: ['money box', 'hundi', 'పెట్టె', 'హుండీ', 'బాక్స్', 'మనీ బాక్స్'],
      glass: ['glass', 'kitiki windowswith glases', 'గ్లాస్', 'అద్దం', 'అద్దాలు'],
      office: ['office', 'desk', 'ఆఫీస్', 'డెస్క్'],
      bathroom: ['bathroom', 'బాత్ రూమ్', 'బాత్', 'స్నానాల'],
      kids: ['kids', 'child', 'పిల్లల', 'బంక్ బెడ్', 'bunk']
    };

    // Determine if query matches any category synonyms
    let matchedCategoryKey = null;
    for (const [catKey, keywords] of Object.entries(categorySynonyms)) {
      if (keywords.some(kw => query.includes(kw))) {
        matchedCategoryKey = catKey;
        break;
      }
    }

    // Stop words to remove from search query
    const stopWords = ['do', 'you', 'have', 'show', 'me', 'please', 'the', 'a', 'in', 'of', 'and', 'or', 'for', 'with', 'want', 'need', 'details', 'availability', 'any', 'is', 'are', 'what', 'give', 'how', 'many', 'కావాలి', 'ఉందా', 'ఉన్నాయి', 'చూపించు', 'చెప్పు', 'లిస్ట్', 'చేయండి', 'చేయి', 'గురించి', 'గూర్చి'];
    const queryTokens = query
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
      .split(/\s+/)
      .filter(token => token.length > 1 && !stopWords.includes(token));

    // General products listing inquiry
    const generalKeywords = ['product', 'items', 'list', 'catalog', 'showcase', 'portfolio', 'stock', 'available', 'design', 'furniture', 'ఏమేమి', 'ఉన్నాయి', 'లిస్ట్', 'ప్రొడక్ట్స్', 'కలప', 'wood', 'all', 'designs'];
    const isGeneralInquiry = generalKeywords.some(kw => query.includes(kw)) && !matchedCategoryKey;

    if (matchedCategoryKey || queryTokens.length > 0) {
      // Find matching items in live dbProducts
      const matchedItems = dbProducts.filter(p => {
        const titleLower = p.title.toLowerCase();
        const catLower = p.category.toLowerCase();
        const descLower = (p.description || '').toLowerCase();

        // 1. Try category key matching
        if (matchedCategoryKey) {
          if (matchedCategoryKey === 'sofa' && (catLower.includes('sofa') || titleLower.includes('sofa') || titleLower.includes('couch'))) return true;
          if (matchedCategoryKey === 'bed' && (catLower.includes('bed') || titleLower.includes('bed') || catLower.includes('bedroom'))) return true;
          if (matchedCategoryKey === 'table' && (catLower.includes('table') || titleLower.includes('table') || titleLower.includes('dining') || catLower.includes('dining'))) return true;
          if (matchedCategoryKey === 'door' && (catLower.includes('door') || titleLower.includes('door') || titleLower.includes('entrance') || catLower.includes('entrance'))) return true;
          if (matchedCategoryKey === 'window' && (catLower.includes('window') || titleLower.includes('window') || catLower.includes('kitiki') || titleLower.includes('kitiki'))) return true;
          if (matchedCategoryKey === 'uyyala' && (catLower.includes('uyyala') || titleLower.includes('uyyala') || titleLower.includes('swing') || catLower.includes('uyyala'))) return true;
          if (matchedCategoryKey === 'mesh' && (catLower.includes('mesh') || titleLower.includes('mesh') || titleLower.includes('jalli') || titleLower.includes('net'))) return true;
          if (matchedCategoryKey === 'tv' && (catLower.includes('tv') || titleLower.includes('tv') || titleLower.includes('unit') || catLower.includes('unit'))) return true;
          if (matchedCategoryKey === 'polish' && (catLower.includes('polish') || titleLower.includes('polish') || titleLower.includes('varnish'))) return true;
          if (matchedCategoryKey === 'box' && (catLower.includes('box') || titleLower.includes('money') || titleLower.includes('box') || titleLower.includes('hundi'))) return true;
          if (matchedCategoryKey === 'glass' && (titleLower.includes('glass') || catLower.includes('glass') || titleLower.includes('glases'))) return true;
          if (matchedCategoryKey === 'office' && (catLower.includes('office') || titleLower.includes('office') || titleLower.includes('desk'))) return true;
          if (matchedCategoryKey === 'bathroom' && (catLower.includes('bathroom') || titleLower.includes('bathroom') || titleLower.includes('vanity'))) return true;
          if (matchedCategoryKey === 'kids' && (catLower.includes('kids') || titleLower.includes('kids') || titleLower.includes('child') || titleLower.includes('bunk'))) return true;
        }

        // 2. Try token matching on title, category, and description
        return queryTokens.some(token => 
          titleLower.includes(token) || 
          catLower.includes(token) || 
          descLower.includes(token)
        );
      });

      if (matchedItems.length > 0) {
        let response = `Haa andi, vetiki chusa! Maa database lo matching list premium options matching dhorikayi. Chusi cheppandi:\n\n`;
        matchedItems.slice(0, 7).forEach((item, index) => {
          const formattedPrice = item.price && item.price > 0 ? `₹${item.price.toLocaleString('en-IN')}` : 'Contact for Price';
          const stars = '★'.repeat(item.rating || 5) + '☆'.repeat(5 - (item.rating || 5));
          response += `${index + 1}. *${item.title}*\n   - Category: ${item.category}\n   - Price: ${formattedPrice}\n   - Rating: ${stars} (${item.rating || 5}.0)\n\n`;
        });
        response += `Maa daggara custom sizing and design carvings customizations ready chestham andi. Ee model direct order or query pattaniki 'Order Now' tab or WhatsApp direct coordinate andi!`;
        return response;
      } else if (matchedCategoryKey) {
        // Synonym matched but database has no uploads
        let response = `Maa workshop lo custom *${matchedCategoryKey.toUpperCase()}* collections ready designs details available unnai andi.\n\n`;
        response += `Kani, database digital uploads lo current active matching lists levu clear ga. Custom measurements designs coordinate details and pricing lists direct ga constructor Nagaraju (+916281653998) coordinate updates call chesthe explain chestharu. Custom ga sizing parameters dynamically ready chestham andi!`;
        return response;
      }
    }

    if (isGeneralInquiry) {
      let response = `Maa LD Interiors & Furnitures showroom catalog items list local designs details options dynamic available unnai andi. Mamulga categories lists ivi:\n\n`;
      response += `- TV Units (టీవీ యూనిట్లు)\n`;
      response += `- Uyyala Swings (ఉయ్యాలలు)\n`;
      response += `- Wooden Windows (కిటికీలు)\n`;
      response += `- Mesh Doors (జాలి తలుపులు)\n`;
      response += `- Polish Items (మెరుగు బల్లలు)\n`;
      response += `- Money Boxes (హుండీ పెట్టెలు)\n`;
      response += `- Glass Windows (అద్దాల కిటికీలు)\n`;
      response += `- Sofa Sets, Wooden Beds, Dining Tables, Office sets & Bathroom cabinets.\n\n`;

      if (dbProducts.length > 0) {
        response += `*Showroom database catalog available items:\n*`;
        dbProducts.slice(0, 8).forEach((item, index) => {
          const formattedPrice = item.price && item.price > 0 ? `₹${item.price.toLocaleString('en-IN')}` : 'Contact for Price';
          response += `- *${item.title}* (${item.category}) - Price: ${formattedPrice}\n`;
        });
        response += `\n`;
      }
      response += `Meeku sizing and design changes customizable, details customization discussion kaavalante call direct checks. Direct orders coordinates or checkout updates submit the 'Order Now' tab!`;
      return response;
    }

    // DEFAULT RESPONSE
    return `Namaste andi! Mee message received checks support team. Custom wood carvings estimates, item catalogs or address details updates gurinchi coordinates adagandi:
- Manager Nagaraju (+916281653998)
- Tech Admin Pavan Sai (+919346325291)
Or options scroll target check 'Order Now' / 'Track' tab features!`;
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
      const reply = getBotResponse(userMsg);
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 500);
  };

  // Quick prompt handle
  const handleQuickPrompt = (promptText) => {
    setMessages(prev => [...prev, { sender: 'user', text: promptText }]);
    setTimeout(() => {
      const reply = getBotResponse(promptText);
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 500);
  };

  const fetchTrackedOrders = async (phoneToQuery) => {
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

    const whatsappMessage = `Hello Pavan Sai! I would like to place a design order/inquiry via LD Interiors & Furnitures website:

*Customer Details:*
- Name: ${orderName.trim()}
- Phone: ${orderPhone.trim()}

*Order Details:*
- Selected Design: ${selectedProduct}
- Price: ${productPrice > 0 ? `₹${productPrice.toLocaleString('en-IN')}` : 'Contact for pricing'}
${absoluteImageUrl ? `- Image URL: ${absoluteImageUrl}\n` : ''}- Customizations / Notes: ${orderNotes.trim() || 'No custom notes.'}

Please review this order and provide availability and pricing details. Thank you!`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/919346325291?text=${encodedMessage}`;
    
    // Open WhatsApp URL
    window.open(whatsappUrl, '_blank');
    setOrderSuccess(true);
    
    // Add success confirmation to Chatbot log as well
    setMessages(prev => [
      ...prev,
      {
        sender: 'bot',
        text: `Order Details received for "${selectedProduct}"! Sent to Admin Pavan Sai via WhatsApp successfully. Contact matching confirmations are processing.`
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
            <div className="w-80 sm:w-[420px] h-[520px] bg-wood-cream border border-wood-border rounded-3xl shadow-2xl flex flex-col mb-4 overflow-hidden animate-slideUp">
              {/* Header */}
              <div className="bg-wood-dark px-5 py-4 text-white border-b border-wood-border/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-wood-accent flex items-center justify-center text-wood-dark font-serif font-extrabold text-sm shadow-inner">
                      LD
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm leading-none">LD Assistant</h3>
                      <span className="text-[9px] text-wood-cream/70 font-light tracking-wide inline-flex items-center gap-1 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        Online • Conversational Search
                      </span>
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
                  <div className="flex-grow overflow-y-auto p-4 bg-wood-beige/10 space-y-3">
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
                          {msg.text}
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
                  <form onSubmit={handleChatSubmit} className="p-3 bg-wood-cream border-t border-wood-border/50 flex gap-2">
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
                      Send Order to Pavan Sai
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
                              <p className="text-[9px] text-wood-light mt-0.5">
                                Ordered {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
