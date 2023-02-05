const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    let results = await db.adminOsoba(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

router.get("/admin/:id", async (req, res, next) => {
  try {
    let results = await db.getUserById(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

router.get("/number", async (req, res, next) => {
  try {
    let results = await db.getNOOsoba(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    let results = await db.deleteOsoba(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

router.put("/", async (req, res, next) => {
  try {
    let results = await db.updateUser(req, res, next);
    return results;
  } catch (e) {
    // console.log(e);
    // res.sendStatus(500);
  }
});

module.exports = router;
