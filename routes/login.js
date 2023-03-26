const express = require("express");
const db = require("../db");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    let results = await db.login(req, res);
    return results;
  } catch (e) {
    // res.status(500);
  }
});

router.put("/", async (req, res) => {
  try {
    let results = await db.updateProfile(req, res);
    return results;
  } catch (e) {
    // res.status(500);
  }
});

router.post("/tim", async (req, res) => {
  try {
    let results = await db.tim(req, res);
    return results;
  } catch (e) {
    // res.status(500);
  }
});

router.get("/tim", async (req, res, next) => {
  try {
    let results = await db.timDDP(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

router.get("/organizacia", async (req, res, next) => {
  try {
    let results = await db.getOrganizacia(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

router.post("/profile", async (req, res) => {
  try {
    let results = await db.profile(req, res);
    return results;
  } catch (e) {
    // res.status(500);
  }
});

router.get("/:id", async (req, res) => {
  try {
    let results = await db.vysledky(req, res);
    return results;
  } catch (e) {
    // console.log(e);
    // res.status(500);
  }
});

module.exports = router;
