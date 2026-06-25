const Product = require('../models/Product');

const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count > 5) {
      console.log('Database already has product items. Skipping product seeding.');
      return;
    }

    const items = [
      // 1. Teak Doors & Woodwork (Living Room / Custom)
      {
        title: 'Traditional Hand-Carved Teak Wood Main Door',
        category: 'Living Room',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_door_1',
      },
      {
        title: 'Modern Mahogany Partition Divider Layout',
        category: 'Living Room',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_partition_1',
      },
      // 2. Sofas
      {
        title: 'Premium Handcrafted Chesterfield Tufted Sofa',
        category: 'Sofas',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_sofa_1',
      },
      {
        title: 'Scandinavian Luxury Velvet Sectional Sofa',
        category: 'Sofas',
        image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_sofa_2',
      },
      // 3. Wooden Beds
      {
        title: 'Classic Teak Wood King-Size Canopy Bed',
        category: 'Wooden Beds',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_bed_1',
      },
      {
        title: 'Minimalist Premium Oak Wood Floating Bed Frame',
        category: 'Wooden Beds',
        image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_bed_2',
      },
      // 4. Dining Tables
      {
        title: 'Live Edge Slab Walnut 6-Seater Dining Set',
        category: 'Dining Tables',
        image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_dining_1',
      },
      {
        title: 'Polished Rosewood Round Dining Table with Lazy Susan',
        category: 'Dining Tables',
        image: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_dining_2',
      },
      // 5. Kitchen
      {
        title: 'Premium Modular Kitchen Cabinets in Cedar Finish',
        category: 'Kitchen',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_kitchen_1',
      },
      // 6. Kids Room
      {
        title: 'Handcrafted Pinewood Kids Loft Bunk Bed',
        category: 'Kids Room',
        image: 'https://images.unsplash.com/photo-1531835551805-16d864c8d311?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_kids_1',
      },
      // 7. Office
      {
        title: 'Handcrafted Teak Executive Writing Bureau Desk',
        category: 'Office',
        image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_office_1',
      },
      // 8. Bathroom
      {
        title: 'Modern Premium Oakwood Bathroom Double Vanity Cabinet',
        category: 'Bathroom',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_bathroom_1',
      },
      // 9. Bedroom
      {
        title: 'Bespoke Walnut Wardrobes with Integrated LED Layouts',
        category: 'Bedroom',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_bedroom_1',
      },
      // 10. TV Units
      {
        title: 'Floating Teak Wood TV Console & Entertainment Unit',
        category: 'TV Units',
        image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_tv_1',
      },
      // 11. Uyyala Swings
      {
        title: 'Handcrafted Traditional Teak Uyyala Swing with Brass Chains',
        category: 'Uyyala Swings',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_uyyala_1',
      },
      // 12. Wooden Windows
      {
        title: 'Premium Teak Kitiki Wooden Window Frames',
        category: 'Wooden Windows',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_win_1',
      },
      // 13. Mesh Doors
      {
        title: 'Teak Wood Double Mesh Protection Net Door',
        category: 'Mesh Doors',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_mesh_1',
      },
      // 14. Polish Items
      {
        title: 'Polished Rosewood Corner Display Stand with High Gloss PU Finish',
        category: 'Polish Items',
        image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_polish_1',
      },
      // 15. Money Boxes
      {
        title: 'Handcarved Brass Fitted Teak Money Box (Hundi)',
        category: 'Money Boxes',
        image: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_box_1',
      },
      // 16. Glass Windows
      {
        title: 'Premium Glass Kitiki Wooden Windows with Frosted Panels',
        category: 'Glass Windows',
        image: 'https://images.unsplash.com/photo-1503174971373-b1f69850bded?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_glass_1',
      },
      // 17. Devudi Mandiralu
      {
        title: 'Premium Handcarved Teak Wood Pooja Mandiram / Mandapam',
        category: 'Devudi Mandiralu',
        image: 'https://images.unsplash.com/photo-1609137882611-6110f0cf9813?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_mandiralu_1',
      },
      // 18. Gummalu
      {
        title: 'Solid Teak Wood Gummam Main Door Entrance Frame',
        category: 'Gummalu',
        image: 'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'seeded_asset_gummalu_1',
      }
    ];

    console.log(`Seeding ${items.length} premium design items into the database...`);
    await Product.insertMany(items);
    console.log('SUCCESS: Premium products seeded successfully.');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};

module.exports = seedProducts;
