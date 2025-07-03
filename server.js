const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const app = express();
const PORT = 8000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static('.'));

// API endpoint to list products
app.get('/api/products', (req, res) => {
    try {
        const productsDir = path.join(__dirname, '_products');
        const files = fs.readdirSync(productsDir);
        
        const products = files
            .filter(file => file.endsWith('.md'))
            .map(file => {
                const fullPath = path.join(productsDir, file);
                const content = fs.readFileSync(fullPath, 'utf8');
                const { data } = matter(content);
                
                return {
                    slug: file.replace('.md', ''),
                    path: `_products/${file}`,
                    ...data
                };
            });
        
        res.json(products);
    } catch (error) {
        console.error('Error reading products:', error);
        res.status(500).json({ error: 'Failed to read products' });
    }
});

// API endpoint to get a single product
app.get('/api/products/:slug', (req, res) => {
    try {
        const slug = req.params.slug;
        const filePath = path.join(__dirname, '_products', `${slug}.md`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const { data, content: body } = matter(content);
        
        res.json({
            slug,
            path: `_products/${slug}.md`,
            ...data,
            body
        });
    } catch (error) {
        console.error('Error reading product:', error);
        res.status(500).json({ error: 'Failed to read product' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin interface: http://localhost:${PORT}/admin/`);
});
