import { pool } from "../db.js";

export const getTagList = async (req, res) => {
  const { search, all } = req.query; // Додаємо параметр "all"
  try {
    let query, params;

    if (all === "true") {
      query = `
          SELECT *
          FROM popular_tags
          WHERE tag_name ILIKE $1
        `;
      params = [`%${search || ""}%`];
    } else {
      if (!search || search.trim() === "") {
        query = "SELECT * FROM popular_tags LIMIT 15;";
      } else {
        query = `
            SELECT * 
            FROM popular_tags 
            WHERE tag_name ILIKE $1
            LIMIT 15;
          `;
        params = [`%${search}%`];
      }
    }

    const { rows } = await pool.query(query, params);
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshPopuarTagsView = async () => {
  try {
    await pool.query("REFRESH MATERIALIZED VIEW popular_tags");
    console.log("Materialized view refreshed");
  } catch (err) {
    console.error("Error refreshing materialized view:", err);
  }
};
