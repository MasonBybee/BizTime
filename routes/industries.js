const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query("SELECT * FROM industries");
    for (let i = 0; i < results.rows.length; i++) {
      const rowResults = await db.query(
        "SELECT c.code, c.name FROM companies c JOIN company_industries ci ON ci.comp_code = code JOIN industries i ON i.code = ci.industry_code WHERE i.code = $1",
        [results.rows[i].code]
      );
      results.rows[i].companies = rowResults.rows;
      console.log(results.rows[i].code);
    }
    return res.json({ industries: results.rows });
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code, industry } = req.body;
    const results = await db.query(
      "INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry",
      [code, industry]
    );
    return res.status(201).json({ success: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.post("/linkindustry", async (req, res, next) => {
  try {
    const { comp_code, industry_code } = req.body;
    const results = await db.query(
      "INSERT INTO company_industries (comp_code, industry_code) VALUES ($1, $2) RETURNING comp_code, industry_code",
      [comp_code, industry_code]
    );
    return res.status(201).json({ success: results.rows });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
