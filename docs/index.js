const fs = require("fs");
const path = require("path");
const { post } = require("../routes/users/users");

const basePath = path.join(__dirname, "swaggerBase.json");
const authPath = path.join(__dirname, "authDocs.json");
const postPath = path.join(__dirname, "postDocs.json");
const userPath = path.join(__dirname, "userDocs.json");

// Read JSON files
const base = JSON.parse(fs.readFileSync(basePath, "utf8"));
const authDocs = JSON.parse(fs.readFileSync(authPath, "utf8"));
const postDocs = JSON.parse(fs.readFileSync(postPath, "utf8"));
const userDocs = JSON.parse(fs.readFileSync(userPath, "utf8"));

// Merge Paths
base.paths = { ...authDocs, ...postDocs, ...userDocs };

// Export the merged Swagger JSON
module.exports = base;
