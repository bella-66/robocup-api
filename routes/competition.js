const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    let results = await db.adminCompetition(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

router.get("/number", async (req, res, next) => {
  try {
    let results = await db.getNOComps(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

router.post("/", async (req, res, next) => {
  try {
    let results = await db.addCompetition(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

router.put("/", async (req, res, next) => {
  try {
    let results = await db.updateCompetition(req, res, next);
    return results;
  } catch (e) {
    console.log(e);
    // res.sendStatus(500);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    let results = await db.deleteCompetition(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

router.get("/admin/:id", async (req, res, next) => {
  try {
    let results = await db.getCompetitionById(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

module.exports = router;
