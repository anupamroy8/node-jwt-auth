var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Article = require("../models/article");
var Tag = require("../models/tag");
var auth = require("../middlewares/auth");
var Comment = require("../models/comment");
var slug = require("slug");
var articleController = require("../controllers/articles")
var commentController = require("../controllers/comments")


// Article Feed:

router.get("/feed", auth.verifyToken, articleController.feedArticle);

// List of articles:

router.get("/",articleController.listArticles)

// Create article:

router.post("/", auth.verifyToken, articleController.createArticle);


// Get Single article:
router.get("/:slug",articleController.getSingleArticle);

// Update single article:
router.put("/:slug", auth.verifyToken, articleController.updateSingleArticle);

// Delete single article:
router.delete("/:slug", auth.verifyToken, articleController.deleteSingleArticle);

////////////////// Favorite ////////////////////
// Favorite an article- with auth
router.post("/:slug/favorite", auth.verifyToken, articleController.favoriteSingleArticle);

// Unfavorite an article- with auth
router.delete("/:slug/favorite", auth.verifyToken, articleController.unfavoriteSingleArticle);


////////////////// Comment ////////////////////

// Add comment
router.post("/:slug/comments", auth.verifyToken, commentController.addSingleComment);

// Get comment - (no auth required)
router.get("/:slug/comments", commentController.getComments);

// Delete comment - with auth
router.delete(
  "/:slug/comments/:id",
  auth.verifyToken, 
  commentController.deleteSingleComment
);

module.exports = router;