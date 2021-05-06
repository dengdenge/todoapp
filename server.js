const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
const MongoClient = require('mongodb').MongoClient; 
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
const methodOverride = require('method-override');
app.use(methodOverride('_method'));


var db;

MongoClient.connect('mongodb+srv://eodeoddl5252:1234@cluster0.zmyk7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', function(err, client){
    
    if(err) return console.log(err)
    db = client.db('todoapp');
   


    app.listen(8080, function(){
        console.log('listening on 8080')
    });

    
});

app.get('/', function(req, res){
    res.render('index.ejs');
});

app.get('/write', function(req, res){
    res.render('write.ejs');
});

app.post('/add', function(req, res){
    res.send('전송완료');
    db.collection('counter').findOne({name : '게시물갯수'},function(err, result){
        console.log(result.totalPost)
        var cnt = result.totalPost;
        
        db.collection('post').insertOne({ _id : cnt + 1, 제목 : req.body.title, 날짜 : req.body.date},function(err,result){
        console.log('저장완료');
        db.collection('counter').updateOne({name:'게시물갯수'},{ $inc : {totalPost:1}},function(err, result){
            if (err) return console.log(err);            
            });
        });
    });      
});

app.get('/list',function(req,res){
    
    db.collection('post').find().toArray(function(err, result){
        console.log(result);
        res.render('list.ejs', {posts : result});
    });    
});

app.delete('/delete', function(req, res){
    console.log(req.body);
    req.body._id = parseInt(req.body._id);
    db.collection('post').deleteOne(req.body, function(err, result){
        console.log('삭제완료');
        res.status(200).send({ message : '성공'});
    });
});

app.get('/detail/:id', function(req, res){
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(err, result){
        console.log(result);
        res.render('detail.ejs', { data : result });
    });   
});

app.get('/edit/:id', function(req, res){
    
    db.collection('post').findOne({_id : parseInt(req.params.id)},function(err, result){
        res.render('edit.ejs', {post : result});        
    });        
});

app.put('/edit', function(req,res){
  db.collection('post').updateOne({ _id : parseInt(req.body.id) },{$set : {제목 : req.body.title , 날짜 : req.body.date }},function(err, result){
    console.log('수정완료');
    res.redirect('/list');
  });
});

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized:false}));
app.use(passport.initialize());
app.use(passport.session()); 

app.get('/login', function(req, res){
  res.render('login.ejs')  
});

app.post('/login',passport.authenticate('local', {
  failureRedirect : '/fail'
}) ,function(req, res){
  res.redirect('/')  
});


app.get('/mypage', 로그인했니, function(req,res){
  console.log(req.user);
  res.render('mypage.ejs', {사용자 : req.user})    
});

function 로그인했니(req,res, next){
  if(req.user){
    next()
  } else {
    res.send('로그인 안하셨는데요');
  }
}


passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
  //console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
    if (에러) return done(에러)

    if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
    if (입력한비번 == 결과.pw) {
      return done(null, 결과)
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));

passport.serializeUser(function(user, done){
  done(null, user.id)  
});
passport.deserializeUser(function(아이디, done){
  db.collection('login').findOne({id : 아이디}, function(err, result){
    done(null,{result})
  })  
});

let multer = require('multer');
var storage = multer.diskStorage({
  destination : function(req, file, cb){
    cb(null, './public/image')
  },
  filename : function(req, file, cb){
    cb(null, file.originalname + '날짜' + new Date())
  }

});

var upload = multer({storage : storage});


app.use('/shop', require('./routes/shop.js'));

app.use('/board/sub', require('./routes/board.js'));

app.get('/upload', function(req, res){
  res.render('upload.ejs')
});

app.post('/upload', upload.single('프로필'), function(req, res){
  res.send('완료');
});
