const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    let results = await db.all(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

router.post("/", async (req, res, next) => {
  try {
    let results = await db.register(req, res, next);
    // return res.json(results);
  } catch (e) {
    // console.log(e);
    // res.sendStatus(500);
  }
});

router.post("/duplicateEmail", async (req, res, next) => {
  try {
    let results = await db.duplicateEmail(req, res, next);
    return results;
  } catch (e) {
    // console.log(e);
    // res.sendStatus(500);
  }
});

module.exports = router;
