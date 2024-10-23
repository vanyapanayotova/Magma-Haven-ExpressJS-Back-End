import { query, Router } from "express";
import itemService from "../services/itemService.js";
import { isAuth } from "../middlewares/authMiddleware.js";
import { isOwner } from "../middlewares/authMiddleware.js";
import { getErrorMessage } from "../utils/errorUtils.js";
import Volcano from "../models/Volcano.js";

const router = Router();

router.get('/', async (req, res) => {
    const volcanoes = await itemService.getAll().lean();
    res.render('volcanoes/catalog', { volcanoes, title: 'Catalog Page' });
});

router.get('/search', async (req, res) => {
    const query = req.query;
    const volcanoes = await itemService.getAll(query).lean();
    res.render('volcanoes/search', { volcanoes, title: 'Search Page', volcanoTypes: getVolcanoTypeViewData(query.volcanoType), query });
});

router.get('/create', isAuth, (req, res) => {
    res.render('volcanoes/create', { title: 'Create Page', volcanoTypes: getVolcanoTypeViewData() });
});

router.post('/create', isAuth, async (req, res) => {
    const itemData = req.body;
    const ownerId = req.user?._id;
    const volcanoType = itemData.volcanoType;

    try {
        await itemService.create(itemData, ownerId);
    } catch (err) {
        const errorMessage = getErrorMessage(err);
        return res.render('volcanoes/create', {
            error: errorMessage,
            volcano: itemData,
            volcanoTypes: getVolcanoTypeViewData(volcanoType),
            title: 'Create Page'
        });
    }

    res.redirect('/volcanoes');
});

// router.get('/search', async (req, res) => {
//     const filter = req.query;
//     const movies = await itemService.getAll(filter).lean();

//     res.render('home', { isSearch: true, movies, filter });
// });

router.get('/:volcanoId', async (req, res) => {
    const volcanoId = req.params.volcanoId;
    const volcano = await itemService.getOne(volcanoId).lean();
    const isOwner = volcano.owner && volcano.owner.toString() === req.user?._id;
    const hasVoted = volcano.voteList.some(userID => userID == req.user?._id);

    res.render('volcanoes/details', { volcano: volcano, isOwner, title: 'Details Page', hasVoted });
});


// router.get('/:volcanoId/vote', async (req, res) => {
//     const volcanoId = req.params.volcanoId;
//     const volcano = await itemService.getOne(volcanoId).lean();
//     res.render('volcanoes/details', { volcano: volcano, isOwner, title:'Details Page'});
// });

// router.get('/:movieId/attach', isAuth, async (req, res) => {
//     const volcano = await itemService.getOne(req.params.volcanoeId).lean();
//     const casts = await castService.getAllWithout(volcano.casts).lean();

//     res.render('movies/attach', { volcano: volcano, casts });
// });

// router.post('/:movieId/attach', isAuth, async (req, res) => {
//     const volcanoeId = req.params.volcanoeId;
//     const castId = req.body.cast;
//     const character = req.body.character;

//     await itemService.attach(volcanoeId, castId, character);

//     res.redirect(`/movies/${volcanoeId}/details`);
// });

router.get('/:volcanoId/delete', isAuth, isOwner, async (req, res) => {
    const volcanoId = req.params.volcanoId;

    // // Check if owner
    // const volcano = await itemService.getOne(volcanoId).lean();
    // if (volcano.owner?.toString() !== req.user._id) {
    //     // return res.render('movies/details', { movie, isOwner: false, error: 'You cannot delete this movie!' });
    //     res.setError('You cannot delete this volcano!');
    //     return res.redirect('/404');
    // }

    await itemService.remove(volcanoId);

    res.redirect('/volcanoes');
});

router.get('/:volcanoId/edit', isAuth, async (req, res) => {
    const volcanoId = req.params.volcanoId;
    const volcano = await itemService.getOne(volcanoId).lean();

    if (volcano.owner?.toString() !== req.user._id) {
        // return res.render('movies/details', { movie, isOwner: false, error: 'You cannot delete this movie!' });
        res.setError('You cannot edit this volcano!');
        return res.redirect('/404');
    }

    res.render('volcanoes/edit', {
        volcano: volcano,
        volcanoTypes: getVolcanoTypeViewData(volcano.volcanoType),
        title: 'Edit Page'
    });
});

router.post('/:volcanoId/edit', isAuth, async (req, res) => {
    const itemData = req.body;
    const volcanoId = req.params.volcanoId;
    const volcanoType = itemData.volcanoType;

    try {
        await itemService.edit(volcanoId, itemData);
    } catch (err) {
        const errorMessage = getErrorMessage(err);
        return res.render('volcanoes/edit', {
            error: errorMessage,
            volcano: itemData,
            volcanoTypes: getVolcanoTypeViewData(volcanoType),
            title: 'Edit Page'
        });
    }

    res.redirect(`/volcanoes/${volcanoId}`);
});


router.get('/:volcanoId/vote', isAuth, async (req, res) => {
    const volcanoId = req.params.volcanoId;
    const volcano = await itemService.getOne(volcanoId).lean();
    const hasVoted = volcano.voteList.some(userID => userID == req.user?._id);

    if (volcano.owner?.toString() === req.user._id || hasVoted ) {
        res.setError('You cannot vote for this volcano!');
        return res.redirect(`/volcanoes/${volcanoId}`);
    }
    
    const userID = req.user._id;
    await itemService.vote(volcanoId, userID);
    res.redirect(`/volcanoes/${volcanoId}`);
});




function getVolcanoTypeViewData(typeVolcano = null) {
    let volcanoTypes = [
        'Supervolcanoes',
        'Submarine',
        'Subglacial',
        'Mud',
        'Stratovolcanoes',
        'Shield'
    ];

    const viewData = volcanoTypes.map(type => ({
        value: type,
        label: type,
        selected: typeVolcano === type ? 'selected' : ''
    }));

    return viewData;
}

export default router;
