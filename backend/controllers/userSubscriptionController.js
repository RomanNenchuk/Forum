import { pool } from "../db.js";

export const addSubscription = async (req, res) => {
    const {user1_id} = req.body;
    const user2_id = req.params.user2_id;

    if(user1_id == user2_id) return res.status(400).json({ done: false })

    const query1 = 
    `
    INSERT INTO user_subscriptions (user_id, subscription_id) VALUES ($1, $2);
    `;
    
    try {
        const result = await pool.query(`SELECT * FROM user_subscriptions WHERE user_id = $1 AND subscription_id = $2;`, [user1_id, user2_id]);
        if(result.rows.length > 0){
            res.status(201).json({done : false})
        } else {
            await pool.query(query1, [user1_id, user2_id]);
            res.status(201).json({done : true});
            
        }
    }
    catch (error) {
        console.error("Subscribing error:");
        res.status(500).json({message : "Internal Server Error"});
    }
}
export const deleteSubscription = async (req, res) => {
    const {user1_id} = req.body;
    const user2_id = req.params.user2_id;
    if(user1_id == user2_id) return res.status(400).json({ done: false })
    console.log("deleting");
    const query2 = 
    `
    DELETE FROM user_subscriptions WHERE user_id = $1 AND subscription_id = $2;
    `;
    try {
        const result = await pool.query(`SELECT * FROM user_subscriptions WHERE user_id = $1 AND subscription_id = $2;`, [user1_id, user2_id]);
        if (result.rows.length > 0){
            await pool.query(query2, [user1_id, user2_id]);
            res.status(201).json({done : true});
        }
        else {
            res.status(201).json({done : false});
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message : "Internal Server Error"});
    }
}