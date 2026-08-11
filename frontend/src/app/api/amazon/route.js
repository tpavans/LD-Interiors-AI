import { NextResponse } from 'next/server';

// Next.js fallback proxy / endpoint for Amazon Affiliate items
let amazonStore = [];

const generateSEO = (title, category) => {
  const cleanTitle = (title || 'Home Essential').trim();
  const cleanCat = (category || 'Home & Living').trim();
  return {
    seoTitle: `${cleanTitle} - Top Rated ${cleanCat} Find | Amazon Deals`,
    seoDescription: `Discover ${cleanTitle} on Amazon! High-quality ${cleanCat} items for modern homes, luxury interior aesthetics & everyday convenience. Check latest price & shop online via Amazon. #${cleanCat.replace(/\s+/g, '')} #AmazonFinds #HomeEssentials #ShoppingDeals #BestDecor #AmazonAffiliate #TrendingHome`
  };
};

export async function GET() {
  try {
    const res = await fetch('https://ld-interiors-ai.onrender.com/api/amazon', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return NextResponse.json(data);
    }
  } catch (err) {
    console.warn('Render GET failed, returning local store');
  }
  return NextResponse.json(amazonStore);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, affiliateUrl, image, category, price } = body;

    if (!title || !affiliateUrl || !image) {
      return NextResponse.json({ message: 'Title, Affiliate Link, and Image URL are required' }, { status: 400 });
    }

    const { seoTitle, seoDescription } = generateSEO(title, category);
    const newItem = {
      _id: `AMZ-${Date.now()}`,
      title,
      affiliateUrl,
      image,
      category: category || 'Amazon Home & Living',
      price: price || 'Check Price on Amazon',
      pinterestSeoTitle: seoTitle,
      pinterestSeoDescription: seoDescription,
      createdAt: new Date().toISOString()
    };

    // Try posting to Render backend
    try {
      const renderRes = await fetch('https://ld-interiors-ai.onrender.com/api/amazon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (renderRes.ok) {
        const renderData = await renderRes.json();
        return NextResponse.json(renderData, { status: 201 });
      }
    } catch (err) {
      console.warn('Render POST failed, storing locally');
    }

    amazonStore.unshift(newItem);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Server error processing Amazon product', error: error.message }, { status: 500 });
  }
}
