const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const app = express();
const PORT = 8081;

// Enable CORS for all routes with specific options
app.use(cors({
    origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Parse JSON bodies
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// CMS API endpoints
app.get('/api/v1/entries/:collection', (req, res) => {
    const collection = req.params.collection;
    console.log(`Fetching entries for collection: ${collection}`);
    
    if (collection === 'products') {
        try {
            const productsDir = path.join(__dirname, '_products');
            const files = fs.readdirSync(productsDir);
            
            const entries = files
                .filter(file => file.endsWith('.md'))
                .map(file => {
                    const fullPath = path.join(productsDir, file);
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const { data, content: body } = matter(content);
                    
                    return {
                        slug: file.replace('.md', ''),
                        path: `_products/${file}`,
                        data: data,
                        body: body,
                        partial: false
                    };
                });
            
            console.log(`Found ${entries.length} entries`);
            res.json(entries);
        } catch (error) {
            console.error('Error reading products:', error);
            res.status(500).json({ error: 'Failed to read products' });
        }
    } else {
        res.json([]);
    }
});

// Get single entry
app.get('/api/v1/entries/:collection/:slug', (req, res) => {
    const collection = req.params.collection;
    const slug = req.params.slug;
    
    if (collection === 'products') {
        try {
            const filePath = path.join(__dirname, '_products', `${slug}.md`);
            
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: 'Entry not found' });
            }
            
            const content = fs.readFileSync(filePath, 'utf8');
            const { data, content: body } = matter(content);
            
            res.json({
                slug,
                path: `_products/${slug}.md`,
                data: data,
                body: body,
                partial: false
            });
        } catch (error) {
            console.error('Error reading entry:', error);
            res.status(500).json({ error: 'Failed to read entry' });
        }
    } else {
        res.status(404).json({ error: 'Collection not found' });
    }
});

// Save entry
app.put('/api/v1/entries/:collection/:slug', (req, res) => {
    const collection = req.params.collection;
    const slug = req.params.slug;
    const { data, body } = req.body;
    
    if (collection === 'products') {
        try {
            const filePath = path.join(__dirname, '_products', `${slug}.md`);
            const frontMatter = matter.stringify(body || '', data);
            
            fs.writeFileSync(filePath, frontMatter);
            
            res.json({
                slug,
                path: `_products/${slug}.md`,
                data: data,
                body: body || '',
                partial: false
            });
        } catch (error) {
            console.error('Error saving entry:', error);
            res.status(500).json({ error: 'Failed to save entry' });
        }
    } else {
        res.status(404).json({ error: 'Collection not found' });
    }
});

// Create entry
app.post('/api/v1/entries/:collection', (req, res) => {
    const collection = req.params.collection;
    const { data, body } = req.body;
    
    if (collection === 'products') {
        try {
            const slug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const filePath = path.join(__dirname, '_products', `${slug}.md`);
            const frontMatter = matter.stringify(body || '', data);
            
            fs.writeFileSync(filePath, frontMatter);
            
            res.json({
                slug,
                path: `_products/${slug}.md`,
                data: data,
                body: body || '',
                partial: false
            });
        } catch (error) {
            console.error('Error creating entry:', error);
            res.status(500).json({ error: 'Failed to create entry' });
        }
    } else {
        res.status(404).json({ error: 'Collection not found' });
    }
});

app.listen(PORT, () => {
    console.log(`CMS Proxy server running at http://localhost:${PORT}`);
});
