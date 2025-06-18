const fs = require('fs');
const path = require('path');

// Category mapping for proper categorization
const categoryMapping = {
  'cheese-cold-cuts': [
    'cheese', 'cold cuts', 'salami', 'prosciutto', 'bresaola', 'mortadella', 
    'coppa', 'pancetta', 'guanciale', 'speck', 'ham', 'parma', 'san daniele',
    'parmigiano', 'gorgonzola', 'pecorino', 'mozzarella', 'burrata', 'ricotta',
    'mascarpone', 'asiago', 'taleggio', 'grana', 'provolone', 'scamorza',
    'auricchio', 'levoni', 'ibis', 'central', 'maldera'
  ],
  'antipasti': [
    'olive', 'olives', 'antipasto', 'antipasti', 'bruschetta', 'taralli',
    'grissini', 'crackers', 'marinated', 'pickled', 'preserved', 'artichoke',
    'sun dried', 'tomato', 'pepper', 'eggplant', 'zucchini', 'capers',
    'anchovies', 'tuna', 'sardines', 'fish', 'seafood', 'callipo', 'parodi', 'zarotti'
  ],
  'sauces-condiments': [
    'sauce', 'condiment', 'pesto', 'vinegar', 'oil', 'olive oil', 'balsamic',
    'tomato sauce', 'pasta sauce', 'dressing', 'marinade', 'seasoning',
    'herbs', 'spices', 'salt', 'pepper', 'garlic', 'basil', 'oregano',
    'boschetto', 'cannamela', 'leonardi', 'ponti'
  ],
  'sweets-snacks': [
    'chocolate', 'cookie', 'biscuit', 'cake', 'pastry', 'candy', 'sweet',
    'dessert', 'snack', 'nuts', 'dried fruit', 'wafer', 'bar', 'gelato',
    'ice cream', 'panettone', 'pandoro', 'amaretti', 'biscotti', 'torrone',
    'belli', 'mario fongo', 'novi', 'panealba', 'campiello'
  ],
  'pasta-rice-flour': [
    'pasta', 'spaghetti', 'penne', 'fusilli', 'linguine', 'fettuccine',
    'ravioli', 'tortellini', 'gnocchi', 'rice', 'risotto', 'flour',
    'semolina', 'grain', 'cereal', 'barley', 'wheat'
  ],
  'wine-liquor': [
    'wine', 'vino', 'prosecco', 'champagne', 'beer', 'liquor', 'spirits',
    'grappa', 'limoncello', 'amaro', 'aperitif', 'digestif', 'brandy',
    'whiskey', 'vodka', 'gin', 'rum'
  ],
  'seasonal': [
    'christmas', 'easter', 'holiday', 'seasonal', 'special', 'limited',
    'celebration', 'festive', 'gift', 'natale', 'pasqua'
  ]
};

// Function to determine category based on filename and brand
function determineCategory(filename, brand, folderPath) {
  const lowerFilename = filename.toLowerCase();
  const lowerBrand = brand.toLowerCase();
  const lowerFolderPath = folderPath.toLowerCase();
  
  // Check folder path first for strong indicators
  if (lowerFolderPath.includes('cheese') || lowerFolderPath.includes('cold cuts')) {
    return 'cheese-cold-cuts';
  }
  if (lowerFolderPath.includes('fish') || lowerFolderPath.includes('seafood')) {
    return 'antipasti';
  }
  if (lowerFolderPath.includes('sauce') || lowerFolderPath.includes('condiment')) {
    return 'sauces-condiments';
  }
  if (lowerFolderPath.includes('sweet') || lowerFolderPath.includes('snack')) {
    return 'sweets-snacks';
  }
  
  // Check against category keywords
  for (const [category, keywords] of Object.entries(categoryMapping)) {
    for (const keyword of keywords) {
      if (lowerFilename.includes(keyword) || lowerBrand.includes(keyword)) {
        return category;
      }
    }
  }
  
  // Default fallback based on folder structure
  if (lowerFolderPath.includes('1 cheese')) return 'cheese-cold-cuts';
  if (lowerFolderPath.includes('4 sauces')) return 'sauces-condiments';
  if (lowerFolderPath.includes('7 sweets')) return 'sweets-snacks';
  if (lowerFolderPath.includes('fish products')) return 'antipasti';
  
  return 'cheese-cold-cuts'; // Default category
}

// Function to clean and format product name
function formatProductName(filename, brand) {
  let name = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
  
  // Remove common prefixes and codes
  name = name.replace(/^(cod\.|code\s+|art\.|article\s+|\d+-?\s*)/i, '');
  name = name.replace(/^\d{6,}\s*-?\s*/i, ''); // Remove long product codes
  
  // Clean up separators and special characters
  name = name.replace(/[-_]+/g, ' ');
  name = name.replace(/\s+/g, ' ');
  
  // Capitalize properly
  name = name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  // If name is too generic or short, include brand
  if (name.length < 10 || /^(pic|image|photo|\d+)$/i.test(name)) {
    name = `${brand} ${name}`.trim();
  }
  
  return name.trim();
}

// Function to create product description
function createDescription(name, category, brand) {
  const categoryDescriptions = {
    'cheese-cold-cuts': 'Premium artisanal cheese and cold cuts, carefully selected for their exceptional quality and authentic Italian taste.',
    'antipasti': 'Traditional Italian antipasti featuring the finest preserved vegetables, seafood, and gourmet appetizers.',
    'sauces-condiments': 'Authentic Italian sauces and condiments made with traditional recipes and the finest ingredients.',
    'sweets-snacks': 'Delicious Italian sweets and gourmet snacks, perfect for any occasion or as a special treat.',
    'pasta-rice-flour': 'Premium pasta, rice, and flour products made with traditional Italian methods and finest grains.',
    'wine-liquor': 'Fine Italian wines and spirits, representing the best of regional Italian beverage craftsmanship.',
    'seasonal': 'Special seasonal products and holiday specialties, celebrating Italian culinary traditions.'
  };
  
  return categoryDescriptions[category] || 'Premium Italian gourmet product carefully selected for its exceptional quality.';
}

// Function to recursively scan directory for images
function scanDirectory(dirPath, relativePath = '') {
  const products = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const itemRelativePath = path.join(relativePath, item).replace(/\\/g, '/');
      
      if (fs.statSync(fullPath).isDirectory()) {
        // Recursively scan subdirectories
        products.push(...scanDirectory(fullPath, itemRelativePath));
      } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(item)) {
        // Extract brand from folder structure
        const pathParts = relativePath.split('/').filter(part => part);
        const brand = pathParts[pathParts.length - 1] || pathParts[0] || 'Premium';
        
        // Clean brand name
        const cleanBrand = brand.replace(/\s*(pics?|pictures?|images?)\s*$/i, '').trim();
        
        // Generate product data
        const productName = formatProductName(item, cleanBrand);
        const category = determineCategory(item, cleanBrand, relativePath);
        
        const product = {
          id: productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          name: productName,
          image: `media/${itemRelativePath}`,
          category: category,
          description: createDescription(productName, category, cleanBrand),
          brand: cleanBrand
        };
        
        products.push(product);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
  }
  
  return products;
}

// Main execution
function generateProducts() {
  console.log('🔍 Scanning media folder for products...');
  
  const mediaPath = path.join(__dirname, 'media');
  const products = scanDirectory(mediaPath);
  
  console.log(`📦 Found ${products.length} products`);
  
  // Group by category for statistics
  const categoryStats = {};
  products.forEach(product => {
    categoryStats[product.category] = (categoryStats[product.category] || 0) + 1;
  });
  
  console.log('\n📊 Products by category:');
  Object.entries(categoryStats).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} products`);
  });
  
  // Save products.json
  const productsPath = path.join(__dirname, '_data', 'products.json');
  
  try {
    // Ensure _data directory exists
    const dataDir = path.dirname(productsPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
    console.log(`\n✅ Successfully generated ${productsPath}`);
    
    // Generate markdown files for each product
    const productsDir = path.join(__dirname, '_products');
    if (!fs.existsSync(productsDir)) {
      fs.mkdirSync(productsDir, { recursive: true });
    }
    
    // Clear existing markdown files
    const existingFiles = fs.readdirSync(productsDir).filter(file => file.endsWith('.md'));
    existingFiles.forEach(file => {
      fs.unlinkSync(path.join(productsDir, file));
    });
    
    // Generate new markdown files
    products.forEach(product => {
      const markdownContent = `---
id: ${product.id}
name: "${product.name}"
image: ${product.image}
category: ${product.category}
description: "${product.description}"
brand: "${product.brand}"
---

# ${product.name}

${product.description}

**Category:** ${product.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
**Brand:** ${product.brand}
`;
      
      const filename = `${product.id}.md`;
      fs.writeFileSync(path.join(productsDir, filename), markdownContent);
    });
    
    console.log(`✅ Generated ${products.length} markdown files in _products/`);
    
  } catch (error) {
    console.error('❌ Error saving files:', error.message);
  }
}

// Run the script
if (require.main === module) {
  generateProducts();
}

module.exports = { generateProducts };
