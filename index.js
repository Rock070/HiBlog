const express = require('express')
const bodyParser = require('body-parser')
const blogControl = require('./controls/blog.js')
const flash = require('connect-flash');
const session = require('express-session')


const app = express()
const port = 5001


function redirectIndex(req, res) {
    res.redirect('back')
}

// app set
app.set('view engine', 'ejs');  

// app use (middleware)

// 1. body-parse
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// 2. express-session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}))

// 3. connect-flash

app.use(flash());

// 4. 內建提供靜態檔案

app.use('/css', express.static('./views/css'));

// 5. local 儲存全域變數

app.use((req, res, next) => {
    res.locals.nickname = req.session.nickname || false
    res.locals.userId = req.session.userId || false
    res.locals.errMessage = req.flash('errMessage')
    next()
})


// app get
app.get('/', blogControl.index)
// login
app.get('/login', blogControl.login)
app.post('/login', blogControl.loginPost, redirectIndex)

// logout
app.get('/logout', blogControl.logout)

// register
app.get('/register', blogControl.register)
app.post('/register', blogControl.registerPost, redirectIndex)

// article
app.get('/article/:id', blogControl.article)
app.get('/articleList', blogControl.articleList, redirectIndex)
app.get('/articleAdd', blogControl.articleAdd, redirectIndex)
app.post('/articleAdd', blogControl.articleAddPost, redirectIndex)
app.get('/articleEdit/:id', blogControl.articleEdit, redirectIndex)
app.post('/articleEdit/:id', blogControl.articleEditPost, redirectIndex)
app.get('/articleDelete/:id', blogControl.articleDelete, redirectIndex)
app.get('/admin', blogControl.admin, redirectIndex)



app.listen(port, () => {
    console.log(`success!listen to ${port}`)
})


