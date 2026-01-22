const express = require('express');
const session = require('express-session');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'ecommerce-secret', resave: false, saveUninitialized: true }));

// --- MOCK DATABASE ---
const products = [
    { id: 1, name: "Wireless Mouse", price: 25, desc: "Ergonomic 2.4G optical mouse." },
    { id: 2, name: "Mechanical Keyboard", price: 75, desc: "RGB backlit tactile switches." },
    { id: 3, name: "Gaming Monitor", price: 200, desc: "144Hz refresh rate, 1ms response." }
];
let users = []; // Temporary user storage

// --- HTML TEMPLATE HELPER ---
const layout = (title, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; background: #c7e347; }
        nav { background: #4f2929; color: #c81414; padding: 1rem; border-radius: 5px; margin-bottom: 20px; }
        nav a { color: white; margin-right: 15px; text-decoration: none; }
        .card { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 15px; }
        .btn { background: #28a745; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; }
        .btn-alt { background: #007bff; }
    </style>
</head>
<body>
    <nav>
        <a href="/">Home Store</a>
        <a href="/cart">Cart (${session.cart ? session.cart.length : 0})</a>
        <a href="/login">Login</a>
    </nav>
    ${content}
</body>
</html>`;

// --- ROUTES ---

// 1. Product Listing (Home)
app.get('/', (req, res) => {
    let html = '<h1>Products</h1>';
    products.forEach(p => {
        html += `<div class="card">
            <h3>${p.name}</h3>
            <p>$${p.price}</p>
            <a class="btn btn-alt" href="/product/${p.id}">View Details</a>
        </div>`;
    });
    res.send(layout('Home', html));
});

// 2. Product Details
app.get('/product/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    const html = `
        <div class="card">
            <h1>${product.name}</h1>
            <p>${product.desc}</p>
            <h2>$${product.price}</h2>
            <form action="/add-to-cart" method="POST">
                <input type="hidden" name="productId" value="${product.id}">
                <button class="btn">Add to Cart</button>
            </form>
            <br><a href="/">Back to products</a>
        </div>`;
    res.send(layout(product.name, html));
});

// 3. Shopping Cart
app.post('/add-to-cart', (req, res) => {
    if (!req.session.cart) req.session.cart = [];
    const product = products.find(p => p.id == req.body.productId);
    req.session.cart.push(product);
    res.redirect('/cart');
});

app.get('/cart', (req, res) => {
    const cart = req.session.cart || [];
    let cartHtml = '<h1>Your Cart</h1>';
    if(cart.length === 0) cartHtml += '<p>Your cart is empty.</p>';
    
    cart.forEach(item => {
        cartHtml += `<div class="card"><p>${item.name} - $${item.price}</p></div>`;
    });
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartHtml += `<h3>Total: $${total}</h3>`;
    if(cart.length > 0) cartHtml += `<a href="/checkout" class="btn">Proceed to Checkout</a>`;
    
    res.send(layout('Cart', cartHtml));
});

// 4. Order Processing (Simple Checkout)
app.get('/checkout', (req, res) => {
    req.session.cart = [];
    res.send(layout('Success', '<h1>Order Placed!</h1><p>Thank you for your purchase.</p><a href="/">Back Home</a>'));
});

// 5. User Login (Basic UI)
app.get('/login', (req, res) => {
    const html = `
        <div class="card">
            <h1>Login</h1>
            <form>
                <input type="text" placeholder="Username" required><br><br>
                <input type="password" placeholder="Password" required><br><br>
                <button type="button" class="btn" onclick="alert('Login Successful (Demo)')">Login</button>
            </form>
        </div>`;
    res.send(layout('Login', html));
});

app.listen(3000, () => console.log('Server running: http://localhost:3000'));