const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    let results = await db.adminOrganization(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    let results = await db.deleteOrganization(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

router.put("/", async (req, res, next) => {
  try {
    let results = await db.updateOrganization(req, res, next);
    return results;
  } catch (e) {
    // console.log(e);
    // res.sendStatus(500);
  }
});

router.get("/admin/:id", async (req, res, next) => {
  try {
    let results = await db.getOrganizationById(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

router.post("/", async (req, res, next) => {
  try {
    let results = await db.addOrganization(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

module.exports = router;
