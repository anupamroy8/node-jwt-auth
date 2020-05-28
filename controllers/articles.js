// require model

const Article = require("../models/article");
const User = require("../models/user");

// Feed article
exports.feedArticle = async (req, res, next) => {
  try {
    var user = await User.findById(req.user.userId);
    var articleFeed = await Article.find({ author: { $in: user.following } })
      .sort({ updatedAt: -1 })
      .limit(+req.query.limit || 20);
    console.log(articleFeed);
    res.status(200).json({
      articleFeed,
    });
  } catch (error) {
    next(error);
  }
};

// List article
exports.listArticles = async (req, res, next) => {
  var filter = {};
  var limit = +req.query.limit || 20;
  var offset = +req.query.offset || 0;

  if (req.query.tag) filter.tagList = req.query.tag;

  if (req.query.author) {
    var user = await User.findOne({ username: req.query.author });
    filter.author = user.id;
  }

  if (req.query.favorited) {
    var user = await User.findOne({ username: req.query.favorited });
    filter.favorited = user.id;
  }

  console.log(filter, limit, offset);

  var articleList = await Article.find(filter)
    .populate("author", "username email")
    .limit(limit)
    .skip(offset)
    .sort({ updatedAt: -1 });

  console.log(articleList);

  res.status(200).json({
    articleList,
  });
};

exports.createArticle = async (req, res, next) => {
  try {
    var user = await User.findById(req.user.userId);

    req.body.article.author = user._id;
    var article = await Article.create(req.body.article);
    console.log(article);
    article.tagList.forEach((tag) => {
      Tag.findOne({ tagName: tag }, (err, tagToFind) => {
        if (err) return res.json({ success: false, err });
        if (tagToFind) {
          Tag.findOneAndUpdate(
            { tagName: tag },
            { $push: { article: article._id } },
            (err, updatedArticle) => {
              if (err) return res.json({ success: false, err });
            }
          );
        } else {
          Tag.create(
            { tagName: tag, article: article._id },
            (err, createdTag) => {
              if (err) return res.json({ success: false, err });
            }
          );
        }
      });
    });
    res.status(201).json({
      title: article.title,
      description: article.description,
      body: article.body,
      tagList: article.tagList,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSingleArticle = async (req, res, next) => {
  try {
    var article = await Article.findOne({ slug: req.params.slug }).populate(
      "author",
      "username email"
    );
    console.log(article);
    res.status(200).json({
      article,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSingleArticle = async (req, res, next) => {
  try {
    var user = await User.findById(req.user.userId);
    if(user) req.body.article.author = user.id;
    
    if (req.body.article.title) {
      req.body.article.slug = slug(req.body.article.title, { lower: true });
    }
    var article = await Article.findOneAndUpdate(
      { slug: req.params.slug },
      req.body.article,
      { new: true }
    );
    console.log("article", article);
    res.json({
      article,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSingleArticle = async (req, res, next) => {
  try {
    var user = await User.findById(req.user.userId);
    var article = await Article.findOneAndDelete({ slug: req.params.slug });
    console.log(article);
    res.status(200).json({
      article,
    });
  } catch (error) {
    next(error);
  }
};

exports.favoriteSingleArticle = async (req, res, next) => {
  try {
    var user = await User.findById(req.user.userId);
    // console.log(user);

    var article = await Article.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { favoritesCount: 1 }, $addToSet: { favorited: user._id } },
      { new: true }
    );
    // console.log(article);

    res.status(201).json({
      article,
    });
  } catch (error) {
    next(error);
  }
};

exports.unfavoriteSingleArticle = async (req, res, next) => {
  try {
    var user = await User.findById(req.user.userId);
    console.log(user);

    var article = await Article.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { favoritesCount: -1 }, $pull: { favorited: user._id } },
      { new: true }
    );
    console.log(article);

    res.status(201).json({
      article,
    });
  } catch (error) {
    next(error);
  }
};
