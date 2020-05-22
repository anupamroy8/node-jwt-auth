var express = require('express');
var router = express.Router();
var User = require("../models/user");
var Article = require("../models/article");
var Tag = require("../models/tag");
var auth = require("../middlewares/auth");
var Comment = require("../models/comment");

// Create article:

router.post("/", auth.verifyToken, async (req, res, next)=>{
    try {
        var user = await User.findById(req.user.userId);
        
        req.body.article.author = user._id;
        var article = await Article.create(req.body.article);
        console.log(article);        
        article.tagList.forEach(tag => {
           Tag.findOne({tagName:tag},(err,tagToFind) => {
               if(err) return res.json({success:false,err})
            if(tagToFind){
                Tag.findOneAndUpdate({tagName:tag},{$push:{article:article._id}},(err,updatedArticle) => {
                    if(err) return res.json({success:false,err})
                })
               } else {
                   Tag.create({tagName:tag,article:article._id},(err,createdTag)  => {
                    if(err) return res.json({success:false,err})
                   });  
               }  
           });            
        });               
        res.status(201).json({
            title: article.title,
            description: article.description,
            body: article.body,
            tagList: article.tagList, 
          })     
    } catch (error) {
      next(error);
    }
  });

// Get Single article:
router.get("/:slug", async (req, res, next)=>{
    try {
        var article = await Article.findOne({slug: req.params.slug}).populate("author","username email");
        console.log(article);
        res.status(200).json({
            article
        })  
    } catch (error) {
        next(error)
    }

})

// Update single article:
router.put("/:slug", auth.verifyToken, async (req, res, next)=>{
    try {
        var user = await User.findById(req.user.userId);
        req.body.article.author = req.user.userId;
        var article = await Article.findOneAndUpdate({slug: req.params.slug}, req.body.article, {new:true});
        console.log(article);
        res.status(200).json({
            article
        }) 
    } catch (error) {
        next(error)
    }
 
})

// Delete single article:
router.delete("/:slug", auth.verifyToken, async (req, res, next)=>{
    try {
        var user = await User.findById(req.user.userId);
        var article = await Article.findOneAndDelete({slug: req.params.slug});
        console.log(article);
        res.status(200).json({
            article
        })  
    } catch (error) {
        next(error)
    }

})

////////////////// Comment ////////////////////

// Add comment
router.post("/:slug/comments", auth.verifyToken, async (req, res, next)=>{
    try {
        var user = await User.findById(req.user.userId);
        var article = await Article.findOne({slug: req.params.slug});
        req.body.comment.author = user._id;
        req.body.comment.article = article._id;
        var comment = await Comment.create(req.body.comment);
        res.status(201).json({
            comment
        })
    } catch (error) {
        next(error)
    }

})

// Get comment - (no auth required)
router.get("/:slug/comments",  async (req, res, next)=>{
    try {
        var article = await Article.findOne({slug: req.params.slug});
        var comments = await Comment.find({article: article._id}).populate("author","username email").populate("article", "title");
        console.log(comments);
        res.status(200).json({
            comments
        })
    } catch (error) {
        next(error)
    }
})

// Delete comment - with auth
router.delete("/:slug/comments/:id", auth.verifyToken, async (req, res, next)=>{
    try {
        var article = await Article.findOne({slug: req.params.slug});
        var DeletedComment = await Comment.findByIdAndDelete(req.params.id).populate("author","username email");
        res.status(200).json({
            DeletedComment
        })  
    } catch (error) {
        next(error)
    }
})

////////////////// Favorite ////////////////////
// Favorite an article- with auth
router.post("/:slug/favorite", auth.verifyToken, async(req, res, next)=>{
    try {
        var user = await User.findById(req.user.userId);
        console.log(user);
        
        var article = await Article.findOneAndUpdate({slug: req.params.slug}, {$inc:{favoritesCount:1},$addToSet:{favorited: user._id}},{ new:true });
        console.log(article);
        
        res.status(201).json({
            article
        })
    } catch (error) {
        next(error)
    }
})

// Unfavorite an article- with auth
router.delete("/:slug/favorite", auth.verifyToken, async(req, res, next)=>{
    try {
        var user = await User.findById(req.user.userId);
        console.log(user);
        
        var article = await Article.findOneAndUpdate({slug: req.params.slug}, {$inc:{favoritesCount:-1},$pull:{favorited: user._id}},{ new:true });
        console.log(article);
        
        res.status(201).json({
            article
        })
    } catch (error) {
        next(error)
    }

})



module.exports = router;