const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM companies;`);
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
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404);
    }
    results.rows[0].invoices = invoiceResults.rows;
    return res.json({ company: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const results = await db.query(
      "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description",
      [code, name, description]
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
