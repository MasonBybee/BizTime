const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const slugify = require("slugify");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM companies;`);
    for (let i = 0; i < results.rows.length; i++) {
      const industryResults = await db.query(
        "SELECT i.code, i.industry FROM companies c JOIN company_industries ci ON ci.comp_code = code JOIN industries i ON i.code = ci.industry_code WHERE c.code = $1",
        [results.rows[i].code]
      );
      results.rows[i].industries = industryResults.rows;
    }
    return res.json({ companies: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query("SELECT * FROM companies WHERE code = $1", [
      code,
    ]);
    invoiceResults = await db.query(
      "SELECT * FROM invoices WHERE comp_code=$1",
      [code]
    );
    const industryResults = await db.query(
      "SELECT i.code, i.industry FROM companies c JOIN company_industries ci ON ci.comp_code = code JOIN industries i ON i.code = ci.industry_code WHERE c.code = $1",
      [code]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404);
    }
    results.rows[0].invoices = invoiceResults.rows;
    results.rows[0].industries = industryResults.rows;
    return res.json({ company: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const slugifiedCode = slugify(code, {
      replacement: "",
      remove: undefined,
      lower: true,
      strict: true,
      locale: "en",
      trim: true,
    });
    const results = await db.query(
      "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description",
      [slugifiedCode, name, description]
    );
    return res.status(201).json({ company: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { code: newCode, name, description } = req.body;
    console.log(code, newCode, name, description);
    const results = await db.query(
      "UPDATE companies SET code=$1, name=$2, description=$3 WHERE code=$4 RETURNING code, name, description",
      [newCode, name, description, code]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find company with code of ${id}`, 404);
    }
    return res.json({ company: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const results = await db.query("DELETE FROM companies WHERE code = $1", [
      req.params.code,
    ]);
    return res.status(410).send({ msg: "Company deleted" });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
