const express = require("express");
const db = require("../db");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    let results = await db.addTeam(req, res);
    return results;
  } catch (e) {
    // console.log(e);
    // res.status(500);
  }
});

router.get("/", async (req, res, next) => {
  try {
    let results = await db.adminTeam(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

router.get("/team/:id", async (req, res, next) => {
  try {
    let results = await db.getAdminTeamById(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

router.get("/admin/:id", async (req, res, next) => {
  try {
    let results = await db.getTeamById(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

router.get("/competition/:id", async (req, res, next) => {
  try {
    let results = await db.getTeamCompetitions(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

router.get("/number", async (req, res) => {
  try {
    let results = await db.getNOTeams(req, res);
    return results;
  } catch (e) {
    // console.log(e);
    // res.status(500);
  }
});

router.post("/timSutaz", async (req, res) => {
  try {
    let results = await db.addTeamComp(req, res);
    return results;
  } catch (e) {
    // console.log(e);
    // res.status(500);
  }
});

router.post("/sutazTim", async (req, res) => {
  try {
    let results = await db.addCompTeam(req, res);
    return results;
  } catch (e) {
    // console.log(e);
    // res.status(500);
  }
});

// router.put("/timSutaz", async (req, res, next) => {
//   try {
//     let results = await db.updateTeamComp(req, res);
//     return results;
//   } catch (e) {
//     console.log(e);
//     // res.status(500);
//   }
// });

// router.delete("/timSutaz", async (req, res, next) => {
//   try {
//     let results = await db.deleteTeamComp(req, res);
//     return results;
//   } catch (e) {
//     console.log(e);
//     // res.status(500);
//   }
// });

router.delete("/:id", async (req, res, next) => {
  try {
    let results = await db.deleteTeam(req, res);
    return results;
  } catch (e) {
    console.log(e);
    // res.status(500);
  }
});

router.put("/", async (req, res, next) => {
  try {
    let results = await db.updateTeam(req, res, next);
    return results;
  } catch (e) {
    // console.log(e);
    // res.sendStatus(500);
  }
});

module.exports = router;
