const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let results = await db.getAllResults(req, res);
    return results;
  } catch (e) {
    // console.log(e);
    // res.status(500);
  }
});

router.get("/resultsByComp", async (req, res) => {
  try {
    let results = await db.getResultsByComp(req, res);
    return results;
  } catch (e) {
    // console.log(e);
    // res.status(500);
  }
});

router.put("/", async (req, res, next) => {
  try {
    let results = await db.updateResult(req, res, next);
    return results;
  } catch (e) {
    // console.log(e);
    // res.sendStatus(500);
  }
});

router.get("/idtimeline", async (req, res) => {
  try {
    let results = await db.getIdTimeline(req, res);
    return results;
  } catch (e) {
    // console.log(e);
    // res.status(500);
  }
});

router.get("/idosoba", async (req, res) => {
  try {
    let results = await db.getIdZapisujucaOsoba(req, res);
    return results;
  } catch (e) {
    // console.log(e);
    // res.status(500);
  }
});

router.get("/:id", async (req, res) => {
  try {
    let results = await db.getResultById(req, res);
    return results;
  } catch (e) {
    // console.log(e);
    // res.status(500);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    let results = await db.deleteResult(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

router.post("/", async (req, res, next) => {
  try {
    let results = await db.addResult(req, res, next);
  } catch (e) {
    // console.log(e);
    // res.status(500);
  }
});

router.post("/byteam", async (req, res) => {
  try {
    let results = await db.getResultsByTeam(req, res);
    return results;
  } catch (e) {
    // console.log(e);
    // res.status(500);
  }
});

module.exports = router;
