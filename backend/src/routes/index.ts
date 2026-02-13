import { Router } from "express";
import petsRoutes = require("./pets.routes");
import shopRoutes = require("./shop.routes");
import leaderboardRoutes = require("./leaderboard.routes");

const router = Router();

router.use("/pets", petsRoutes);
router.use("/shop", shopRoutes);
router.use("/leaderboard", leaderboardRoutes);

export = router;
