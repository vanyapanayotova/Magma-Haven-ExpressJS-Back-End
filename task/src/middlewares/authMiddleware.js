import jwt from '../lib/jwt.js';

import { JWT_SECRET } from '../config/constants.js';
import itemService from '../services/itemService.js';

export const authMiddleware = async (req, res, next) => {
    const token = req.cookies['auth'];
    if (!token) {
        return next();
    }

    try {
        const decodedToken = await jwt.verify(token, JWT_SECRET)

        const user = {
            _id: decodedToken._id,
            email: decodedToken.email,
        };

        req.user = user;
        req.isAuthenticated = true;
        res.locals.userId = user._id;
        res.locals.userEmail = user.email;
        res.locals.isAuthenticated = true;

        return next();
    } catch (err) {
        console.log(err);
        res.clearCookie('auth');

        res.redirect('/auth/login')
    }
};

export const isAuth = (req, res, next) => {
    if (!req.isAuthenticated) {
        return res.redirect('/auth/login');
    }
    
    return next();
}

export const isOwner = async (req, res, next) => {
    const volcanoID = req.params.volcanoId;
    const volcano = await itemService.getOne(volcanoID).lean();
    const volcanoOwner = volcano.owner;
    
    // if (req.user._id != volcanoOwner) {
    if (!volcanoOwner.equals(req.user._id)) {
        res.setError('You cannot access this page!');
        return res.redirect('/404');
    }
    
    return next();
}
