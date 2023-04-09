//Author-Nikhil Panikkassery (B00934514)

const getError = require("../utils/getError");
const movies = require("../models/movies/movies.model");
const users = require("../models/users.model");
const books = require("../models/books/books.model");
const watchlist = require("../models/watchlist.model");
const mongoose = require("../utils/dbConn");
const watched = require("../models/watched.model");

const addInitialEmptyWatchlist = async (currentUserId) => {
  let initialEmptyWatchlist = {
    userId: currentUserId,
    bookId: [],
    movieId: [],
  };
  await watchlist.insertMany(initialEmptyWatchlist);
};

const addInitialEmptyWatched = async (currentUserId) => {
  let initialEmptyWatched = {
    userId: currentUserId,
    bookId: [],
    movieId: [],
  };
  await watched.insertMany(initialEmptyWatched);
};

const addToWatchlist = async (req, res, next) => {
  try {
    if (req.body && req.body.type && req.body.content && req.body.userid) {
      const currentUserId = req.data.user._id;
      let watchlistResult = await watchlist.find({
        userId: currentUserId,
      });
      if (watchlistResult.length == 0) {
        await addInitialEmptyWatchlist(currentUserId);
        watchlistResult = await watchlist.find({
          userId: currentUserId,
        });
      }
      if (req.body.type === "movies") {
        let oldMovieArray = watchlistResult[0].movieId;
        oldMovieArray.push(req.body.content._id);
        const updateResult = await watchlist.findOneAndUpdate(
          { userId: currentUserId },
          { movieId: oldMovieArray }
        );
        res.status(200).json({
          success: true,
        });
      } else {
        let oldBookArray = watchlistResult[0].bookId;
        oldBookArray.push(req.body.content._id);
        const updateResult = await watchlist.findOneAndUpdate(
          { userId: currentUserId },
          { bookId: oldBookArray }
        );
        res.status(200).json({
          success: true,
        });
      }
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const removeFromWatchlist = async (req, res, next) => {
  try {
    if (req.body && req.body.type && req.body.content && req.body.userid) {
      const currentUserId = req.data.user._id;
      const watchlistResult = await watchlist.find({
        userId: currentUserId,
      });
      if (req.body.type === "movies") {
        let oldMovieArray = watchlistResult[0].movieId;
        oldMovieArray.remove(req.body.content._id);
        const updateResult = await watchlist.findOneAndUpdate(
          { userId: currentUserId },
          { movieId: oldMovieArray }
        );
        res.status(200).json({
          success: true,
        });
      } else {
        let oldBookArray = watchlistResult[0].bookId;
        oldBookArray.remove(req.body.content._id);
        const updateResult = await watchlist.findOneAndUpdate(
          { userId: currentUserId },
          { bookId: oldBookArray }
        );
        res.status(200).json({
          success: true,
        });
      }
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const getWatchlist = async (req, res, next) => {
  try {
    const currentUserId = req.data.user._id;
    let watchlistResult = await watchlist.find({
      userId: currentUserId,
    });
    if (watchlistResult.length == 0) {
      await addInitialEmptyWatchlist(currentUserId);
      watchlistResult = await watchlist.find({
        userId: currentUserId,
      });
    }
    let moviesResult = await movies.find({
      _id: {
        $in: watchlistResult[0].movieId,
      },
    });
    let booksResult = await books.find({
      _id: {
        $in: watchlistResult[0].bookId,
      },
    });
    moviesResult = moviesResult.map((item) => ({
      ...item.toObject(),
      watchlist: true,
    }));
    booksResult = booksResult.map((item) => ({
      ...item.toObject(),
      watchlist: true,
    }));
    const finalResult = {
      movies: moviesResult,
      books: booksResult,
    };
    res.status(200).json({
      success: true,
      result: finalResult,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const addToWatched = async (req, res, next) => {
  try {
    if (req.body && req.body.type && req.body.content && req.body.userid) {
      const currentUserId = req.data.user._id;
      let watchedResult = await watched.find({
        userId: currentUserId,
      });
      if (watchedResult.length == 0) {
        await addInitialEmptyWatched(currentUserId);
        watchedResult = await watched.find({
          userId: currentUserId,
        });
      }
      if (req.body.type === "movies") {
        let oldMovieArray = watchedResult[0].movieId;
        oldMovieArray.push(req.body.content._id);
        const updateResult = await watched.findOneAndUpdate(
          { userId: currentUserId },
          { movieId: oldMovieArray }
        );
        res.status(200).json({
          success: true,
        });
      } else {
        let oldBookArray = watchedResult[0].bookId;
        oldBookArray.push(req.body.content._id);
        const updateResult = await watched.findOneAndUpdate(
          { userId: currentUserId },
          { bookId: oldBookArray }
        );
        res.status(200).json({
          success: true,
        });
      }
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const removeFromWatched = async (req, res, next) => {
  try {
    if (req.body && req.body.type && req.body.content && req.body.userid) {
      const currentUserId = req.data.user._id;
      const watchedResult = await watched.find({
        userId: currentUserId,
      });
      if (req.body.type === "movies") {
        let oldMovieArray = watchedResult[0].movieId;
        oldMovieArray.remove(req.body.content._id);
        const updateResult = await watched.findOneAndUpdate(
          { userId: currentUserId },
          { movieId: oldMovieArray }
        );
        res.status(200).json({
          success: true,
        });
      } else {
        let oldBookArray = watchedResult[0].bookId;
        oldBookArray.remove(req.body.content._id);
        const updateResult = await watched.findOneAndUpdate(
          { userId: currentUserId },
          { bookId: oldBookArray }
        );
        res.status(200).json({
          success: true,
        });
      }
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const getWatched = async (req, res, next) => {
  try {
    const currentUserId = req.data.user._id;
    let watchedResult = await watched.find({
      userId: currentUserId,
    });
    if (watchedResult.length == 0) {
      await addInitialEmptyWatched(currentUserId);
      watchedResult = await watched.find({
        userId: currentUserId,
      });
    }
    let moviesResult = await movies.find({
      _id: {
        $in: watchedResult[0].movieId,
      },
    });
    let booksResult = await books.find({
      _id: {
        $in: watchedResult[0].bookId,
      },
    });
    moviesResult = moviesResult.map((item) => ({
      ...item.toObject(),
      watched: true,
    }));
    booksResult = booksResult.map((item) => ({
      ...item.toObject(),
      watched: true,
    }));
    const finalResult = {
      movies: moviesResult,
      books: booksResult,
    };
    res.status(200).json({
      success: true,
      result: finalResult,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  addToWatched,
  removeFromWatched,
  getWatched,
};
