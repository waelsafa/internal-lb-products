const fs = require('fs');
const path = require('path');

// Function to check if a folder name is a product code (not a brand)
function isProductCode(folderName) {
  const productCodePatterns = [
    /^[A-Z]{2,3}\d+[A-Z]*$/,  // AU5050, AU17G2B, etc.
    /^RE\d+$/,                // RE291, etc.
    /^\d+$/,                  // Pure numbers
    /^[A-Z]{1,2}\d+[A-Z]*\d*$/ // Various alphanumeric codes
  ];
  
  return productCodePatterns.some(pattern => pattern.test(folderName));
}

// Function to clean brand name
function cleanBrandName(brandName) {
  return brandName
    .replace(/\s*PICS?\s*/gi, '')
    .replace(/\s*PICTURES?\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Brand categorization
const brandCategories = {
  // Cold cuts brands
  'LEVONI': 'cold-cuts',
  'IBIS': 'cold-cuts',
  
  // Cheese brands  
  'AURICCHIO': 'cheese',
  'CENTRAL CHEESE': 'cheese',
  'MALDERA': 'cheese',
  
  // Fish brands
  'ANGELO PARODI': 'fish',
  'CALLIPO': 'fish',
  'ZAROTTI': 'fish',
  
  // Sauce brands
  'BOSCHETTO': 'sauces',
  'CANNAMELA': 'sauces',
  'LEONARDI': 'sauces',
  'LEONARDITURES': 'sauces',
  'PONTI': 'sauces',
  
  // Sweet brands
  'BELLI': 'sweets',
  'MARIO FONGO': 'sweets',
  'NOVI': 'sweets',
  'PANEALBA - CAMPIELLO': 'sweets',
  
  // Antipasti brands
  'D\'AMICO': 'antipasti',
  'URBANI': 'antipasti',
  'URBANI TRUFFLE': 'antipasti',
  
  // Pasta, Rice, Flour brands
  'CAPUTO': 'pasta-rice-flour',
  'DE CECCO': 'pasta-rice-flour',
  'PAGANI': 'pasta-rice-flour',
  'RUSTICHELLA D\'ABRUZZO': 'pasta-rice-flour',
  'SCOTTI': 'pasta-rice-flour'
};

// Function to categorize based on product name and brand
function categorizeProduct(brandName, productName, originalCategory) {
  const cleanBrand = cleanBrandName(brandName);
  
  // First check brand-based categorization
  if (brandCategories[cleanBrand]) {
    return brandCategories[cleanBrand];
  }
  
  // If brand not found, try to categorize by product name
  const productLower = productName.toLowerCase();
  
  // Cold cuts keywords
  const coldCutsKeywords = [
    'prosciutto', 'salame', 'coppa', 'pancetta', 'bresaola', 
    'guanciale', 'speck', 'mortadella', 'nduja', 'salsiccia',
    'cacciatore', 'cotto', 'crudo', 'san daniele', 'parma'
  ];
  
  // Cheese keywords  
  const cheeseKeywords = [
    'mascarpone', 'gorgonzola', 'parmigiano', 'pecorino', 
    'mozzarella', 'ricotta', 'formaggio', 'cheese'
  ];
  
  if (coldCutsKeywords.some(keyword => productLower.includes(keyword))) {
    return 'cold-cuts';
  }
  
  if (cheeseKeywords.some(keyword => productLower.includes(keyword))) {
    return 'cheese';
  }
  
  // Fallback to original category mapping
  return originalCategory;
}

// Function to get image files from a directory
function getImageFiles(dirPath) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  let imageFiles = [];
  
  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase();
        if (imageExtensions.includes(ext)) {
          imageFiles.push(filePath);
        }
      } else if (stat.isDirectory()) {
        if (isProductCode(file)) {
          const subImages = getImageFiles(filePath);
          imageFiles = imageFiles.concat(subImages);
        } else {
          const subImages = getImageFiles(filePath);
          imageFiles = imageFiles.concat(subImages);
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dirPath}:`, error.message);
  }
  
  return imageFiles;
}

// Function to extract product name from file path
function extractProductName(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  
  let productName = fileName
    .replace(/^\d+[-_\s]*/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  productName = productName.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return productName || fileName;
}

// Category mapping for folders
const folderCategoryMapping = {
  '1 CHEESE AND COLD CUTS': 'mixed', // Will be split based on brands/products
  '2 PASTA RICE FLOUR': 'pasta-rice-flour',
  '4 SAUCES CONDIMENTS': 'sauces',
  '7 SWEETS SNACKS': 'sweets',
  'FISH PRODUCTS': 'fish',
  'antipasti': 'antipasti',
  'TRUFFLE PRODUCTS': 'antipasti'
};

// Function to get brand names from a category folder
function getBrands(categoryPath) {
  const brands = [];
  
  try {
    const items = fs.readdirSync(categoryPath);
    
    for (const item of items) {
      const itemPath = path.join(categoryPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && !isProductCode(item)) {
        const cleanedBrandName = cleanBrandName(item);
        if (cleanedBrandName && cleanedBrandName.length > 1) {
          brands.push({
            originalName: item,
            cleanName: cleanedBrandName
          });
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read category directory ${categoryPath}:`, error.message);
  }
  
  return brands;
}

// Main parsing function
function parseMediaFolder() {
  const mediaPath = './media';
  const products = [];
  
  try {
    const categories = fs.readdirSync(mediaPath);
    
    for (const category of categories) {
      const categoryPath = path.join(mediaPath, category);
      const stat = fs.statSync(categoryPath);
      
      if (!stat.isDirectory()) continue;
      
      const originalCategory = folderCategoryMapping[category];
      if (!originalCategory) {
        console.log(`Skipping unmapped category: ${category}`);
        continue;
      }
      
      console.log(`\nProcessing category: ${category} -> ${originalCategory}`);
      
      const brands = getBrands(categoryPath);
      console.log(`Found brands:`, brands.map(b => b.cleanName));
      
      for (const brand of brands) {
        const brandPath = path.join(categoryPath, brand.originalName);
        const imageFiles = getImageFiles(brandPath);
        
        console.log(`  Brand: ${brand.cleanName} - Found ${imageFiles.length} images`);
        
        for (const imagePath of imageFiles) {
          const relativePath = path.relative('./media', imagePath).replace(/\\/g, '/');
          const productName = extractProductName(imagePath);
          
          // Determine final category based on brand and product
          const finalCategory = categorizeProduct(brand.cleanName, productName, originalCategory);
          
          const product = {
            name: productName,
            category: finalCategory,
            subcategory: brand.cleanName,
            image: `media/${relativePath}`,
            id: `${finalCategory}-${brand.cleanName.toLowerCase().replace(/\s+/g, '-')}-${products.length + 1}`
          };
          
          products.push(product);
        }
      }
      
      // Process direct images in category folder
      const directImages = [];
      try {
        const items = fs.readdirSync(categoryPath);
        for (const item of items) {
          const itemPath = path.join(categoryPath, item);
          const stat = fs.statSync(itemPath);
          
          if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
            if (imageExtensions.includes(ext)) {
              directImages.push(itemPath);
            }
          }
        }
        
        for (const imagePath of directImages) {
          const relativePath = path.relative('./media', imagePath).replace(/\\/g, '/');
          const productName = extractProductName(imagePath);
          
          const product = {
            name: productName,
            category: originalCategory === 'mixed' ? 'cheese' : originalCategory, // Default mixed to cheese
            subcategory: null,
            image: `media/${relativePath}`,
            id: `${originalCategory === 'mixed' ? 'cheese' : originalCategory}-direct-${products.length + 1}`
          };
          
          products.push(product);
        }
      } catch (error) {
        console.warn(`Warning: Could not process direct images in ${categoryPath}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('Error reading media directory:', error);
    return [];
  }
  
  return products;
}

// Generate products and save to JSON
console.log('Starting media parsing with cheese/cold-cuts separation...');
const products = parseMediaFolder();

console.log(`\nGenerated ${products.length} products`);

// Group by category and subcategory for summary
const summary = {};
products.forEach(product => {
  if (!summary[product.category]) summary[product.category] = {};
  const subcat = product.subcategory || 'No Brand';
  if (!summary[product.category][subcat]) summary[product.category][subcat] = 0;
  summary[product.category][subcat]++;
});

console.log('\nSummary by category and brand:');
Object.entries(summary).forEach(([category, subcats]) => {
  console.log(`\n${category.toUpperCase()}:`);
  Object.entries(subcats).forEach(([subcat, count]) => {
    console.log(`  ${subcat}: ${count} products`);
  });
});

// Save to products.json
const outputPath = './_data/products.json';
fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
console.log(`\nProducts saved to ${outputPath}`);

// Generate markdown files
const markdownDir = './_products';
if (!fs.existsSync(markdownDir)) {
  fs.mkdirSync(markdownDir, { recursive: true });
}

// Clear existing markdown files
try {
  const existingFiles = fs.readdirSync(markdownDir);
  existingFiles.forEach(file => {
    if (file.endsWith('.md')) {
      fs.unlinkSync(path.join(markdownDir, file));
    }
  });
  console.log('Cleared existing markdown files');
} catch (error) {
  console.warn('Warning: Could not clear existing markdown files:', error.message);
}

// Generate new markdown files
products.forEach((product, index) => {
  const slug = product.name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  const filename = `${String(index + 1).padStart(3, '0')}-${slug}.md`;
  
  const frontmatter = `---
title: "${product.name}"
category: "${product.category}"
${product.subcategory ? `subcategory: "${product.subcategory}"` : ''}
image: "${product.image}"
id: "${product.id}"
---

${product.name}
`;
  
  fs.writeFileSync(path.join(markdownDir, filename), frontmatter);
});

console.log(`Generated ${products.length} markdown files in ${markdownDir}`);
console.log('Parsing complete!');
