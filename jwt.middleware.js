import jwt from "jsonwebtoken";

const JWT_Auth_Middleware = (req , res , next ) =>{

    const token = req.body.token;

    if(!token){
       return res.status(404).json({
        Message : "Auth Failed",
        Error : "JWT token is missing",
       });
    }

    const {username , email} = jwt.verify(token , process.env.JWT_SECRET_CODE);

    req.auth = {
        username : username ,
        email : email ,
    }

    next();
}

export default JWT_Auth_Middleware ; 






