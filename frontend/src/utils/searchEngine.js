/**
 * LD Interiors & Furnitures - Amazon-Grade Smart Search & Discovery Engine
 * 
 * Features:
 * 1. Natural Language Price Queries: "under 500", "below 1000", "less than 2000", "500 to 2000", "above 5000", "1000-3000"
 * 2. Freshness & Trending Intent: "latest models", "new arrivals", "trending", "bestsellers"
 * 3. Deep Multilingual & Colloquial Synonym Mapping (English & Telugu): "gummalu", "simhadwaram", "puja mandiram", "mancham", "sofa", etc.
 * 4. Multi-Token Relevance Scoring (A9-style algorithm simulation)
 * 5. Typo-Tolerant Matching
 * 6. Quick Filter Presets & Sorting (Price Low-High, High-Low, Newest Arrivals, Best Match)
 */

// Popular Quick-Filter Chips for Amazon-style browsing
export const QUICK_SEARCH_CHIPS = [
  { label: '🌟 All Designs', query: '', icon: 'all' },
  { label: '⚡ Latest Models', query: 'latest models', filterType: 'latest' },
  { label: '💰 Under ₹500', query: 'under 500', maxPrice: 500 },
  { label: '🏷️ Under ₹1,500', query: 'under 1500', maxPrice: 1500 },
  { label: '🛋️ Under ₹5,000', query: 'under 5000', maxPrice: 5000 },
  { label: '👑 Under ₹20,000', query: 'under 20000', maxPrice: 20000 },
  { label: '🚪 Doors & Gummalu', query: 'doors', category: 'Gummalu' },
  { label: '🕉️ Puja Mandiralu', query: 'mandir', category: 'Puja Mandiralu' },
  { label: '🛏️ Cots & Beds', query: 'beds', category: 'Wooden Beds' },
  { label: '🍽️ Dining Tables', query: 'dining', category: 'Dining Tables' },
  { label: '🛋️ Sofas & Living', query: 'sofas', category: 'Sofas' },
  { label: '🍳 Kitchen Items', query: 'kitchen', category: 'Kitchen' },
  { label: '🪵 100% Teakwood', query: 'teakwood' },
];

// Comprehensive Synonym & Colloquial Category Dictionaries
export const CATEGORY_SYNONYMS = {
  'Gummalu': ['gummalu', 'door', 'doors', 'main door', 'simhadwaram', 'simha dwaram', 'frame', 'mesh door', 'dwaram', 'wood door'],
  'Puja Mandiralu': ['mandir', 'mandiram', 'puja', 'pooja', 'temple', 'devudi gudi', 'mandapam', 'puja room', 'pooja mandapam'],
  'Wooden Beds': ['bed', 'beds', 'cot', 'cots', 'mancham', 'mattress', 'king size', 'queen size', 'bedroom cot', 'double cot'],
  'Sofas': ['sofa', 'sofas', 'couch', 'living room', 'seating', 'cushion', 'l shape sofa', 'wooden sofa', 'recliner'],
  'Dining Tables': ['dining', 'dining table', 'bhojanam table', 'dinner table', 'dining chair', 'dining set', 'dining chairs'],
  'TV Units': ['tv unit', 'tv stand', 'entertainment unit', 'tv cabinet', 'led unit', 'tv console'],
  'Kitchen': ['kitchen', 'masher', 'mashers', 'spices', 'storage box', 'wooden spoon', 'chopping board', 'pan stand', 'pot stand'],
  'Uyyala Swings': ['uyyala', 'swing', 'swings', 'jhula', 'indoor swing', 'wooden swing'],
  'Wooden Windows': ['window', 'windows', 'wooden window', 'ventilator'],
  'Mesh Doors': ['mesh', 'mesh door', 'mosquito mesh', 'net door', 'wire mesh'],
  'Dressing Tables': ['dressing', 'dressing table', 'mirror', 'vanity', 'makeup table'],
  'Glass Windows': ['glass window', 'sliding window'],
  'Living Room': ['living', 'living room', 'hall', 'drawing room'],
  'Bedroom': ['bedroom', 'bed room', 'master bedroom'],
  'Kids Room': ['kids', 'kids room', 'children'],
  'Polish Items': ['polish', 'gun polish', 'varnish'],
  'Money Boxes': ['money box', 'cash box', 'hundi', 'wooden box', 'jewellery box'],
  'Office': ['office', 'office table', 'desk', 'study table', 'work desk']
};

/**
 * Parses numeric price from string with support for 'k' / 'thousand' suffixes
 * e.g. "500" -> 500, "2k" -> 2000, "1.5k" -> 1500, "15,000" -> 15000
 */
const parseNumericValue = (str) => {
  if (!str) return null;
  const clean = str.toString().replace(/,/g, '').trim().toLowerCase();
  if (clean.endsWith('k')) {
    const num = parseFloat(clean.slice(0, -1));
    return isNaN(num) ? null : num * 1000;
  }
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
};

/**
 * Intelligent Natural Language Query Parser (Amazon-Style)
 * Extracts: Price constraints, Category hints, Freshness intent, Sort intent, and Clean search tokens.
 */
export function parseSearchQuery(rawQuery = '') {
  if (!rawQuery || typeof rawQuery !== 'string') {
    return {
      rawQuery: '',
      cleanText: '',
      minPrice: null,
      maxPrice: null,
      categoryHint: null,
      isLatestOnly: false,
      sortIntent: null,
      extractedFilters: []
    };
  }

  let text = rawQuery.trim();
  let workingText = text.toLowerCase();
  let minPrice = null;
  let maxPrice = null;
  let isLatestOnly = false;
  let sortIntent = null;
  let categoryHint = null;
  const extractedFilters = [];

  // 1. Check Range Patterns: "between 500 and 2000", "1000 to 5000", "500-2000", "500 - 2000"
  const rangeRegex = /(?:between|from)?\s*₹?\s*(\d+(?:,\d+)?(?:\.\d+)?k?)\s*(?:to|and|-|–)\s*₹?\s*(\d+(?:,\d+)?(?:\.\d+)?k?)/i;
  const rangeMatch = workingText.match(rangeRegex);
  if (rangeMatch) {
    const p1 = parseNumericValue(rangeMatch[1]);
    const p2 = parseNumericValue(rangeMatch[2]);
    if (p1 !== null && p2 !== null) {
      minPrice = Math.min(p1, p2);
      maxPrice = Math.max(p1, p2);
      workingText = workingText.replace(rangeMatch[0], ' ');
      extractedFilters.push({
        type: 'price',
        label: `₹${minPrice.toLocaleString('en-IN')} - ₹${maxPrice.toLocaleString('en-IN')}`,
        minPrice,
        maxPrice
      });
    }
  }

  // 2. Check Under / Below / Less than Patterns: "under 500", "below 1000", "< 2000", "under 15k", "500 lope", "1000 lopala"
  if (maxPrice === null) {
    const underRegex = /(?:under|below|less\s+than|upto|up\s+to|within|<|<=|lope|lopala)\s*₹?\s*(\d+(?:,\d+)?(?:\.\d+)?k?)/i;
    const underMatch = workingText.match(underRegex);
    if (underMatch) {
      const val = parseNumericValue(underMatch[1]);
      if (val !== null) {
        maxPrice = val;
        workingText = workingText.replace(underMatch[0], ' ');
        extractedFilters.push({
          type: 'price',
          label: `Under ₹${maxPrice.toLocaleString('en-IN')}`,
          maxPrice
        });
      }
    }
  }

  // 3. Check Above / Over / More than Patterns: "above 5000", "over 10000", "> 2000", "5000 paina", "more than 3000"
  if (minPrice === null) {
    const aboveRegex = /(?:above|over|more\s+than|>|>=|paina|ekkuva)\s*₹?\s*(\d+(?:,\d+)?(?:\.\d+)?k?)/i;
    const aboveMatch = workingText.match(aboveRegex);
    if (aboveMatch) {
      const val = parseNumericValue(aboveMatch[1]);
      if (val !== null) {
        minPrice = val;
        workingText = workingText.replace(aboveMatch[0], ' ');
        extractedFilters.push({
          type: 'price',
          label: `Above ₹${minPrice.toLocaleString('en-IN')}`,
          minPrice
        });
      }
    }
  }

  // 4. Check Freshness / Latest Models Intent: "latest", "new models", "new arrivals", "recent", "kothavi"
  const latestRegex = /\b(latest\s*models?|latest|new\s*arrivals?|new\s*models?|recent|newest|kothavi|kothadi)\b/i;
  if (latestRegex.test(workingText)) {
    isLatestOnly = true;
    sortIntent = 'newest';
    workingText = workingText.replace(latestRegex, ' ');
    extractedFilters.push({
      type: 'latest',
      label: '⚡ Latest Models',
      isLatestOnly: true
    });
  }

  // 5. Check Trending / Popular Intent
  const popularRegex = /\b(trending|popular|best\s*sellers?|bestseller|top\s*rated)\b/i;
  if (popularRegex.test(workingText)) {
    sortIntent = 'popular';
    workingText = workingText.replace(popularRegex, ' ');
    extractedFilters.push({
      type: 'sort',
      label: '🔥 Trending',
      sortIntent: 'popular'
    });
  }

  // 6. Check Budget / Luxury Sort Intent: "cheap", "budget", "affordable", "premium", "luxury"
  const cheapRegex = /\b(cheap|budget|affordable|low\s*price|kam\s*rate)\b/i;
  if (cheapRegex.test(workingText)) {
    sortIntent = 'price_asc';
    workingText = workingText.replace(cheapRegex, ' ');
    extractedFilters.push({
      type: 'sort',
      label: '💰 Low Price First',
      sortIntent: 'price_asc'
    });
  }

  const luxuryRegex = /\b(expensive|luxury|premium|high\s*end|costly)\b/i;
  if (luxuryRegex.test(workingText)) {
    sortIntent = 'price_desc';
    workingText = workingText.replace(luxuryRegex, ' ');
    extractedFilters.push({
      type: 'sort',
      label: '👑 Premium First',
      sortIntent: 'price_desc'
    });
  }

  // 7. Detect Category Hints from Keywords
  for (const [canonicalCategory, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    for (const syn of synonyms) {
      const synRegex = new RegExp(`\\b${syn}\\b`, 'i');
      if (synRegex.test(workingText)) {
        categoryHint = canonicalCategory;
        extractedFilters.push({
          type: 'category',
          label: canonicalCategory,
          category: canonicalCategory
        });
        break;
      }
    }
    if (categoryHint) break;
  }

  // Clean remaining text tokens (remove extra spaces, symbols, and common stopwords)
  const cleanTokens = workingText
    .replace(/[₹$,]/g, ' ')
    .replace(/\b(in|for|with|of|the|a|an|designs?|items?|models?|furnitures?)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    rawQuery: text,
    cleanText: cleanTokens,
    minPrice,
    maxPrice,
    categoryHint,
    isLatestOnly,
    sortIntent,
    extractedFilters
  };
}

/**
 * Checks if a product belongs to a category with intelligent synonym expansion
 */
export function isCategoryFuzzyMatch(productCategory = '', targetCategory = '') {
  if (!targetCategory || targetCategory === 'All') return true;
  if (!productCategory) return false;

  const pCat = productCategory.toString().trim().toLowerCase();
  const tCat = targetCategory.toString().trim().toLowerCase();

  if (pCat === tCat) return true;
  if (pCat.includes(tCat) || tCat.includes(pCat)) return true;

  // Check synonym dictionaries
  for (const [canonical, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    const isTargetInGroup = canonical.toLowerCase() === tCat || synonyms.some(s => s === tCat || tCat.includes(s));
    if (isTargetInGroup) {
      if (canonical.toLowerCase() === pCat) return true;
      if (synonyms.some(s => s === pCat || pCat.includes(s))) return true;
    }
  }

  return false;
}

/**
 * Amazon-Style Search Filter, Ranker & Sorter
 * Evaluates products across Title, Category, Notes, Price limits, Freshness, and Keywords.
 */
export function filterAndRankProducts(products = [], parsedInfo, options = {}) {
  if (!Array.isArray(products) || products.length === 0) {
    return { results: [], totalMatched: 0, appliedFilters: [] };
  }

  const {
    activeCategory = 'All',
    manualSort = 'relevance',
    customMinPrice = null,
    customMaxPrice = null
  } = options;

  const effectiveMinPrice = customMinPrice !== null ? customMinPrice : parsedInfo?.minPrice;
  const effectiveMaxPrice = customMaxPrice !== null ? customMaxPrice : parsedInfo?.maxPrice;
  const effectiveCategory = activeCategory !== 'All' ? activeCategory : (parsedInfo?.categoryHint || 'All');
  const cleanText = parsedInfo?.cleanText || '';
  const searchTokens = cleanText.split(/\s+/).filter(Boolean);

  // 1. Filter phase
  const candidates = [];

  for (const p of products) {
    // A. Category matching
    if (effectiveCategory !== 'All' && !isCategoryFuzzyMatch(p.category, effectiveCategory)) {
      continue;
    }

    // B. Price filtering
    const price = typeof p.price === 'number' ? p.price : parseFloat(p.price);
    const hasValidPrice = !isNaN(price) && price > 0;

    if (effectiveMinPrice !== null && effectiveMinPrice !== undefined) {
      if (!hasValidPrice || price < effectiveMinPrice) continue;
    }

    if (effectiveMaxPrice !== null && effectiveMaxPrice !== undefined) {
      if (!hasValidPrice || price > effectiveMaxPrice) continue;
    }

    // C. Freshness / Latest filter
    if (parsedInfo?.isLatestOnly) {
      // Allow products flagged isNew or created recently (last 90 days)
      const isNewFlag = p.isNew || p.badge === 'New' || p.badge === 'NEW';
      const isRecent = p.createdAt && (Date.now() - new Date(p.createdAt).getTime() < 90 * 24 * 60 * 60 * 1000);
      if (!isNewFlag && !isRecent) {
        // If not flagged as new, don't strictly exclude if user searched with keywords too, but penalize score
        if (searchTokens.length === 0) continue;
      }
    }

    // D. Keyword Scoring (Relevance engine)
    let score = 0;
    const title = (p.title || '').toLowerCase();
    const category = (p.category || '').toLowerCase();
    const notes = (p.notes || '').toLowerCase();
    const productId = (p._id || '').toLowerCase();

    if (cleanText) {
      let matchedAnyToken = false;

      // Exact full match
      if (title === cleanText) {
        score += 150;
        matchedAnyToken = true;
      } else if (title.includes(cleanText)) {
        score += 80;
        matchedAnyToken = true;
      }

      // Title starts with keyword
      if (title.startsWith(cleanText)) {
        score += 40;
      }

      // Token matching
      for (const token of searchTokens) {
        if (title.includes(token)) {
          score += 30;
          matchedAnyToken = true;
        } else if (category.includes(token)) {
          score += 20;
          matchedAnyToken = true;
        } else if (notes.includes(token)) {
          score += 10;
          matchedAnyToken = true;
        } else if (productId.includes(token)) {
          score += 25;
          matchedAnyToken = true;
        }
      }

      // If user typed search words and none matched this product, exclude it
      if (!matchedAnyToken) {
        continue;
      }
    } else {
      // No search words, base score
      score = 50;
    }

    // Bonus points
    if (p.isNew) score += 10;
    if (hasValidPrice) score += 5;
    if (p.imageUrl || p.image) score += 5;

    candidates.push({ product: p, score, price: hasValidPrice ? price : 9999999 });
  }

  // 2. Sorting Phase
  const effectiveSort = manualSort !== 'relevance' ? manualSort : (parsedInfo?.sortIntent || 'relevance');

  candidates.sort((a, b) => {
    if (effectiveSort === 'price_asc') {
      return a.price - b.price;
    }
    if (effectiveSort === 'price_desc') {
      return b.price - a.price;
    }
    if (effectiveSort === 'newest') {
      const dateA = new Date(a.product.createdAt || 0).getTime();
      const dateB = new Date(b.product.createdAt || 0).getTime();
      return dateB - dateA;
    }
    // Default: Sort by Relevance Score, then by newest
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    const dateA = new Date(a.product.createdAt || 0).getTime();
    const dateB = new Date(b.product.createdAt || 0).getTime();
    return dateB - dateA;
  });

  const results = candidates.map(c => c.product);

  return {
    results,
    totalMatched: results.length,
    effectiveSort,
    effectiveMinPrice,
    effectiveMaxPrice,
    effectiveCategory
  };
}

/**
 * Autocomplete suggestions generator for search inputs
 */
export function getSmartAutocompleteSuggestions(query = '', products = []) {
  if (!query || query.trim().length === 0) {
    return {
      keywordSuggestions: [
        'Under ₹500',
        'Under ₹1,500',
        'Latest Models',
        'Teakwood Dining Tables',
        'Puja Mandirams',
        'Gummalu / Main Doors',
        'Wooden Cots'
      ],
      productSuggestions: products.slice(0, 5)
    };
  }

  const parsed = parseSearchQuery(query);
  const qLower = query.toLowerCase().trim();

  // Keyword suggestions
  const keywords = [];
  const addKeyword = (kw) => {
    if (!keywords.includes(kw) && keywords.length < 5) keywords.push(kw);
  };

  if (qLower.includes('under') || qLower.includes('below')) {
    addKeyword(`${parsed.cleanText || 'Furniture'} under ₹500`);
    addKeyword(`${parsed.cleanText || 'Furniture'} under ₹1,500`);
    addKeyword(`${parsed.cleanText || 'Furniture'} under ₹5,000`);
    addKeyword(`${parsed.cleanText || 'Furniture'} under ₹20,000`);
  } else {
    addKeyword(`${query} under ₹1,000`);
    addKeyword(`${query} under ₹5,000`);
    addKeyword(`Latest ${query} models`);
    addKeyword(`Teakwood ${query}`);
  }

  // Matching products
  const { results } = filterAndRankProducts(products, parsed);
  const productSuggestions = results.slice(0, 6);

  return {
    keywordSuggestions: keywords,
    productSuggestions,
    parsed
  };
}
