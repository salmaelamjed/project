import express from "express";
const router = express.Router();
import { verifyToken } from "../utils/verifyUser.js";
import {createListing, deleteListing, getListing,getListings, updateListing } from "../controllers/listing.controller.js";
router.post('/create', verifyToken, createListing);
router.delete('/delete/:id', verifyToken,deleteListing );
router.post('/update/:id', verifyToken, updateListing);
router.get('/get/:id', getListing);
router.get('/get', getListings);

export default router;
