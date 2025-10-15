const jwt = require('jsonwebtoken');

const authenticationToken = (req,res,next)=>{

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log('Auth middleware - authHeader:', authHeader);
    console.log('Auth middleware - token:', token ? 'present' : 'missing');

    if(!token){
        return res.status(401).json({error: 'token required'});
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if(err){
            console.error('JWT verification error:', err);
            return res.status(401).json({error: 'invalid token'});
        }
        console.log('JWT decoded user:', user);
        req.user = user;
        next();
    });


}

module.exports = {authenticationToken};