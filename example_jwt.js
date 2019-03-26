app.get('/users',validateUser,(req,res)=>{
    const food = req.body.food;
    const id = req.eiei;
  
  })
  
  const req = {
    food:['asdasd','asdfasdf','ewrwer'],
    // userId:'sdksdflsdhfklsdjh'
  }
  function validateUser(req,res,next){
  jwt.verify(req.headers['Authorization'],process.env.secret,function(err,decoded){
    if(err){
      res.json()
    }else{
      const id = decoded.id;
      req.userId = id;
      req.eiei = id;
      next();
      // {name:'bingo',age:20}
    }
  })
}