const { authenticateToken } = require("../../middlewares");
const { pool } = require("../../config/postgresConfig");
require("dotenv").config();
const router = require("express").Router();


// creating a review by customer.
router.post("/create", authenticateToken, async (req, res, next) => {
    const user = req.user;
    const body = req.body;
    const parameters = req.query;

    // reviews can only be made by customers
    if (user.status !== 'customer') {
        return res.status(401).json({ status: false, message: "Unauthorised: not a customer." });
    }

    if (!parameters.service_id) {
        return res.status(400).json({ status: false, message: "You didn't use the 'service_id' parameter" });
    }

    let sqlQuery = `INSERT INTO public.review (id, customer_id, service_id, title, description, rating) 
    VALUES (DEFAULT, ${user.id}, ${parameters.service_id}, '${body.title}', '${body.description}', ${body.rating})
     RETURNING id`

    console.log(sqlQuery);

    try {
        const newReview = await pool.query(sqlQuery);

        return res.status(200).json({ status: true, message: {"review_id": newReview.rows[0].id} });
    } catch (err) {
        res.status(500);
        next(err);
    }
});

router.get("/reviews", authenticateToken, async (req, res, next) => {
    // const user = req.user;
    const parameters = req.query;

    if (!parameters.service_id) {
        return res.status(400).json({ status: false, message: "You didn't use the 'service_id' parameter" });
    }

    let sqlQuery =
        'SELECT review.id, review.customer_id AS "customerID", review.service_id AS "serviceID", review.title, review.description, review.rating'  +
        " FROM review";


    try {
        const data = await pool.query(sqlQuery);

        return res.status(200).json(data.rows);
    } catch (err) {
        res.status(500);
        next(err);
    }
});


module.exports = router;
