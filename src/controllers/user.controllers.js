import Users from '../models/user.models.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'



const RegisterUser = async (req , res) => {
    
    const {email , password} = req.body

    if (!email) return res.status(400).json({
        message: 'email required'
    })
    if (!password) return res.status(400).json({
        message: 'password required'
    })

    try {
        
        const checkUser = await Users.findOne({ email })
        if (checkUser) return res.json({
            message: ' email already registered'
        }) 

        bcrypt.hash(password, 10, async function(err, hash) {
            
            const createUser = await Users.create({
                email , 
                password: hash
            })
    
            res.json({
                message: 'registration successfull',
                createUser: createUser
            })
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error
        })
    }

}

const LoginUser = async (req , res) => {

    const {email , password} = req.body
    if (!email) return res.status(400).json({
        message: 'email required'
    })
    if (!password) return res.status(400).json({
        message: 'password required'
    })

    try {
        
        const user = await Users.findOne({email})
        
        await bcrypt.compare(password, user.password, async function(err, result) {
            
            if (!result) return res.json({
                message: 'Incorrect Password'
            })
            else if (result) {
    
                let refreshToken = jwt.sign({ email: user.email }, process.env.REFRESH_TOKEN_SECRET , {expiresIn: '7d'}); 
                let accessToken = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET , {expiresIn: '2h'});
    
                // res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true , sameSite: 'None' });
                
                res.cookie("refreshToken", refreshToken, { 
                    httpOnly: true, 
                    secure: process.env.NODE_ENV === 'production',
                    // secure: false,
                    sameSite: 'None', 
                });
                
                res.json({
                    message: 'user logged in successfully',
                    refreshToken,
                    accessToken,
                    user
                })
            }
        });
    } catch (error) {
        res.json({
            error
        })
    }
}

const logoutUser = async (req, res) => {
    res.clearCookie("refreshToken");
    res.json({ message: "user logout successfully" });
}

const regenerateAccessToken = async (req , res) => {
    
    const refreshToken = req.cookies.refreshToken
    // console.log (refreshToken)
    if (!refreshToken) return res.json({
        message: 'no refresh token found'
    })

    try {
        const decodedToken = jwt.verify(refreshToken , process.env.REFRESH_TOKEN_SECRET)
    
        const user = await Users.findOne({email: decodedToken.email})
        if(!user) return res.json({
            message: 'invalid token'
        })
    
        let accessToken = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET , {expiresIn: '2h'});
        res.json({
            message: 'access token generated',
            accesToken: accessToken
        })
    } catch (error) {
        res.json({
            message: error
        })
    }
}

const authenticateUser = async (req, res, next) => {
    const token = req.headers["authorization"];
    const refreshToken = req.cookies.refreshToken; // Get refreshToken from cookies
    
    console.log(refreshToken); // For debugging, ensure the refreshToken is being read from cookies
    
    if (!token) return res.status(404).json({ message: "no token found" });

    const tokenWithoutBearer = token.split(" ").splice(1, 1)[0]; // Extract token part from "Bearer <token>"

    jwt.verify(tokenWithoutBearer, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            // Return error with refreshToken in response
            return res.status(403).json({
                message: "invalid token",
                refreshToken: refreshToken, // Send refreshToken from cookies
                err
            });
        }

        // If token is valid, proceed with the middleware
        res.json({
            message: "valid access token",
            refreshToken // Include refreshToken even for valid access token, if needed
        });
        next();
    });
};

export { RegisterUser , LoginUser , logoutUser , regenerateAccessToken , authenticateUser}