const express=require('express');
const { body } = require('express-validator');
const router=express.Router();

const isAuth = require('../middleware/is-auth');
const midForRating = require('../middleware/ratings');
const uploadImg = require('../middleware/helpers');
const addimages = require('../middleware/AddImages');

const eventController = require('../controllers/eventposts');
const filterController = require('../controllers/filter');
const getEventsController = require('../controllers/getPosts');

router.post('/create', isAuth, uploadImg, eventController.createPosts);
router.delete('/delete/:postId', isAuth, eventController.deletePost);
router.put('/update/:postId', isAuth, eventController.updatePost);
router.put('/AddImages/:postId', isAuth, addimages, eventController.AddImages);
router.put('/deleteImage/:postId', isAuth, eventController.delImages);

router.get('/events/:postId', midForRating, getEventsController.getPost);
router.get('/getAll', getEventsController.getAll);
router.post('/bookmark/:postId', isAuth, getEventsController.bookmark);
router.put('/unFav/:postId', isAuth, getEventsController.unFav);
router.get('/bookmark', isAuth, getEventsController.getBookmark);
router.post('/book/:postId', isAuth, getEventsController.register);
router.get('/book', isAuth, getEventsController.getBooked);
router.get('/createdEvents', isAuth, getEventsController.getCreated);
router.patch('/rating/:postId', isAuth, getEventsController.ratings);

router.put('/eventSearch', filterController.search);
router.get('/filtered', filterController.filter);
router.get('/dashboard', isAuth, filterController.getUserDetails);

module.exports=router;