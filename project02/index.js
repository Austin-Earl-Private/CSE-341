const express = require('express');
const body_parser = require('body-parser');

const path = require('path');

const rootDir = require('./util/path');
const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const app = express();

app.use(body_parser.urlencoded({ extended: false }));

app.use(express.static(path.join(rootDir, 'public')));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use('/admin', adminData.routes);
app.use(shopRoutes);
app.use((req, res, next) => {
    // res.status(404).sendFile(path.join(rootDir, 'views', '404.html'));
    res.status(404).render('404', { docTitle: '404' });
});

app.listen(3000);
