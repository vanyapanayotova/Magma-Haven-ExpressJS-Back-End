import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {

    res.render('home', { title: "Home page" });
});

router.get('/about', (req, res) => {
    res.render('home/about');
});

export default router;
