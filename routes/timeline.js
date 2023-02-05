const express = require("express");
const db = require("../db");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    let results = await db.addTimeline(req, res);
    return results;
  } catch (e) {
    // console.log(e);
    // res.status(500);
  }
});

router.get("/", async (req, res) => {
  try {
    let results = await db.getIdSutaz(req, res);
    return results;
  } catch (e) {
    // console.log(e);
    // res.status(500);
  }
});

router.put("/", async (req, res, next) => {
  try {
    let results = await db.updateTimeline(req, res, next);
    return results;
  } catch (e) {
    // console.log(e);
    // res.sendStatus(500);
  }
});

router.get("/admin/:id", async (req, res) => {
  try {
    let results = await db.getTimelineById(req, res);
    return results;
  } catch (e) {
    // console.log(e);
    // res.status(500);
  }
});

router.delete("/admin/:id", async (req, res, next) => {
  try {
    let results = await db.deleteTimeline(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

router.get("/admin", async (req, res, next) => {
  try {
    let results = await db.adminTimeline(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

module.exports = router;
