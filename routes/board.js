var router = require('express').Router();

router.get('/sports', function(req, res){
  res.send('스포츠게시판');
});

router.get('/game', function(req, res){
  res.send('게임게시판');
});

module.exports = router;