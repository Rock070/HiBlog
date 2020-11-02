const db = require('../models/index.js')
const User = db.User
const Article = db.Article
const bcrypt = require('bcrypt')
const saltRounds = 10;
const someOtherPlaintextPassword = 'not_bacon';

User.associate(db)  
Article.associate(db)  





function checkUser(req, res, cb) {
    const nickname = req.session.nickname
    User.findOne({
        where: {
            nickname
        }
    }).then((result) => {
        if(result) {
            cb()
        }
        res.redirect('/')
    }).catch((err) => {
        res.redirect('/')
    })
}




const blogControls = {
    index: (req, res) => {

        Article.findAll({
            where: {
                is_deleted: null
            },
            include: User,
            limit: 3,
            order: [
                ['id', 'DESC'],
            ],
            
        }).then((result) => {
            
            const articles = JSON.parse(JSON.stringify(result, null, 4))
            res.render('index', {
                articles
            })
        }).catch((err) => {
            console.log(err)
            return
        })
    },
    login: (req, res) => {
        res.render('./user/login')
    },
    loginPost: (req, res, next) => {
        const username = req.body.username
        const password = req.body.password

        if(!username || !password) {
            req.flash('errMessage', '請填寫完整資料')
            next()
        }

        User.findOne({
            where: {
                username
            }
        }).then((result) => {
            console.log('沒有 result')
            if(!result) {
                // console.log('沒有 result')
                req.flash('errMessage', '帳號或密碼錯誤')
                next()
            } 

            const data = JSON.parse(JSON.stringify(result, null, 4))
            const hash = data.password
            bcrypt.compare(password, hash, function(err, result) {
                if(err) {
                    console.log(err)
                    next()
                }
                if(!result) {
                    req.flash('errMessage', '帳號或密碼錯誤')
                    next()
                }
                req.session.nickname = data.nickname
                req.session.userId = data.id
                res.redirect('/')
            });
            
            
            
        }).catch((err) => {
            console.log(err)
            next()
        })

    },
    logout: (req, res) => {
        req.session.destroy(function(err) {
            res.redirect('/')
        })
    },
    register: (req, res) => {
        res.render('./user/register')
    },
    registerPost: (req, res, next) => {
        const nickname = req.body.nickname
        const username = req.body.username
        const password = req.body.password
        const password_2 = req.body.password_2
        
        if(!nickname || !username || !password || !password_2) {
            req.flash('errMessage', '請填寫完整資料')
            next()
        }

        if(password !== password_2) {
            req.flash('errMessage', '兩次密碼不相同')
            next()
        } 

        bcrypt.hash(password, saltRounds, function(err, hash) {
            if(err) {
                console.log(err)
                next()
            }
            User.create({
                nickname,
                username,
                password: hash
            }).then(() => {
                console.log('user create!')
                req.session.nickame = nickname
                res.redirect('/')
            }).catch((err) => {
                console.log(err)
                next()
            })
        });
    },
    article: (req, res) => {
        const id = req.params.id
        Article.findOne({
            where:{
                id
            },
            include: User
        }).then((result) => {
            const article = JSON.parse(JSON.stringify(result, null, 4))
            res.render('article', {
                article
            })
        }).catch((err) => {
            console.log(err)
            res.redirect('/')
        })

       
    },
    articleList: (req, res, next) => {
        Article.findAll({
            where:{
                is_deleted: null
            },
            include: User
        }).then((result) => {
            const articles = JSON.parse(JSON.stringify(result, null, 4))
            res.render('articleList', {
                articles
            })
        }).catch((err) => {
            console.log(err)
            next()
        }) 
    },
    articleAdd: (req, res, next) => {
        if(!req.session.nickname) {
            next()
        }
        checkUser(req, res, function() {
            res.render('articleAdd')
        })
    },
    articleAddPost: (req, res, next) => {

        if(!req.session.nickname) {
            next()
        }
        checkUser(req, res, function() {
            const title = req.body.title
            const type = req.body.type
            const content = req.body.editor1
            const nickname = req.session.nickname

            if(!title || !type || !content) {
                req.flash('errMessage', '標題、分類、內容不可為空')
                next()
            }

            if(req.session.nickname) {
                User.findOne({
                    where: {
                        nickname
                    }
                }).then((result)=> {
                    const user = JSON.parse(JSON.stringify(result, null, 4))
                    const userId = user.id
                    Article.create({
                        UserId: userId,
                        title,
                        type,
                        content
                    }).then(() => {
                        res.redirect('/')
                    }).catch((err) => {
                        if(err) {
                            console.log('ArticleAddErr:', err)
                            next()
                        }
                    })
                }).catch((err) => {
                    console.log('UserErr: ', err)
                    next()
                    return
                })
            }
        })
    },
    articleEditPost: async function(req, res, next) {
        if(!req.session.userId) {
            next()
        }
        const userId = req.session.userId
        const title = req.body.title
        const type = req.body.type
        const content = req.body.editor1
        // const nickname = req.session.nickname

        if(!title || !type || !content) {
            req.flash('errMessage', '標題、分類、內容不可為空')
            next()
        }
        const id = req.params.id
        // const user = JSON.parse(JSON.stringify(result, null, 4))
        await Article.update(
            { 
                title,
                type,
                content 
            }, {
            where: {
                id,
                UserId: userId
            }
        }).then(() => {
            res.redirect('/admin')
        }).catch((err) => {
            if(err) {
                console.log('ArticleEditErr:', err)
                next()
            }
        })  
        
        
    },
    articleEdit: async function (req, res, next) {
        if(!req.session.userId) {
            next()
        }
        const userId = req.session.userId
        const id = req.params.id
            
        Article.findOne({
        where: {
            id,
            UserId: userId,
            is_deleted: null
        }
        }).then((result) => {
            if(!result) {
                next()
            }
            const article = JSON.parse(JSON.stringify(result, null, 4))
            console.log(article)
            res.render('articleEdit', {
                article
            })
        }).catch((err) => {
            console.log(err)
            next()
        })
    },
    articleDelete: async function(req, res, next) {
        if(!req.session.userId) {
            next()
        }
        const userId = req.session.userId
        const id = req.params.id
        await Article.update(
        {
            is_deleted: 1,
            
        },
        {
            where: {
                id,
                UserId: userId
            } 
        }).then(() => {
            next()
        }).catch((err)=> {
            console.log(err)
            next()
        })
    },
    admin: (req, res, next) => {
        if(!req.session.userId) {
            res.redirect('/')
        }
        const userId = req.session.userId
        Article.findAll({
            where: {
                UserId: userId
            }
        }).then((result) => {
            const articles = JSON.parse(JSON.stringify(result, null, 4))
            res.render('admin', {
                articles
            })
        }).catch((err) => {
            console.log(err)
            res.redirect('back')
        })
    }
    
    
}


// npx sequelize-cli model:generate --name User --attributes nickname:string,username:string,password:string
// npx sequelize-cli model:generate --name Article --attributes user_id:number,title:string,content:text,type:string


module.exports = blogControls