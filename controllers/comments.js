// require model

const Article = require("../models/article");
const User = require("../models/user");
const Comment = require("../models/comment");

exports.addSingleComment = async (req, res, next) => {
  try {
      console.log(req, res);
      
    var user = await User.findById(req.user.userId);
    var article = await Article.findOne({ slug: req.params.slug });
    req.body.comment.author = user._id;
    req.body.comment.article = article._id;
    var comment = await Comment.create(req.body.comment);
    res.status(201).json({
      comment,
    });
  } catch (error) {
    next(error);
  }
};

exports.getComments = async (req, res, next) => {
    try {
      var article = await Article.findOne({ slug: req.params.slug });
      var comments = await Comment.find({ article: article._id })
        .populate("author", "username email")
        .populate("article", "title");
      console.log(comments);
      res.status(200).json({
        comments,
      });
    } catch (error) {
      next(error);
    }
  }

exports.deleteSingleComment =  async (req, res, next) => {
    try {
      var article = await Article.findOne({ slug: req.params.slug });
      var DeletedComment = await Comment.findByIdAndDelete(
        req.params.id
      ).populate("author", "username email");
      res.status(200).json({
        DeletedComment,
      });
    } catch (error) {
      next(error);
    }
  }