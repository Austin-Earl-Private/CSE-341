const express = require('express');
const body_parser = require('body-parser');

const path = require('path');

const rootDir = require('./util/path');
const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const error = require('./controllers/error');
const app = express();

app.use(body_parser.urlencoded({ extended: false }));

app.use(express.static(path.join(rootDir, 'public')));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use('/admin', adminData.routes);
app.use(shopRoutes);
app.use(error.get404);

app.listen(3000);
