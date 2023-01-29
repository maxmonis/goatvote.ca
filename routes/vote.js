const express = require("express")

const Vote = require("../models/Vote")

const router = express.Router()

router.get(
  "/",
  [],
  async ({query: {limit, omitCreatorId, page, ...query}}, res) => {
    try {
      if (
        query.category &&
        query.creatorId &&
        query.subcategory &&
        query.timeframe
      ) {
        const vote = await Vote.findOne(query)
        return res.json({votes: vote ? [vote] : []})
      }
      const params = {
        ...query,
        ...(omitCreatorId && {creatorId: {$ne: omitCreatorId}}),
      }
      if (limit > 0 || page > 0) {
        const resultsPerPage = parseInt(limit) || 12
        const pageIndex = page > 0 ? parseInt(page) - 1 : 0
        const votes = await Vote.find(params)
          .limit(resultsPerPage + 1)
          .skip(pageIndex * resultsPerPage)
          .sort({date: -1})
        return res.json({
          canLoadMore: votes.length > resultsPerPage,
          votes: votes.slice(0, resultsPerPage),
        })
      }
      if (Object.keys(params).length === 0) {
        return res.status(400).send("No params in request")
      }
      const votes = await Vote.find(params).sort({date: -1})
      res.json({votes})
    } catch (error) {
      console.error(error)
      res.status(500).send(`Server error (ノಠ益ಠ)ノ彡┻━┻ ${error.message}`)
    }
  },
)

router.post(
  "/",
  [],
  async (
    {body: {ballot, category, creatorId, creatorName, subcategory, timeframe}},
    res,
  ) => {
    try {
      const existingVote = await Vote.findOne({
        category,
        creatorId,
        subcategory,
        timeframe,
      })
      if (existingVote) {
        return res.status(400).send("User has already voted")
      }
      const newVote = new Vote({
        ballot,
        category,
        creatorId,
        creatorName,
        subcategory,
        timeframe,
      })
      const savedVote = await newVote.save()
      res.json(savedVote)
    } catch (error) {
      console.error(error)
      res.status(500).send(`Server error (ノಠ益ಠ)ノ彡┻━┻ ${error.message}`)
    }
  },
)

router.put("/:id", [], async ({body: {ballot}, params: {id}}, res) => {
  try {
    let vote = await Vote.findById(id)
    if (!vote) {
      return res.status(404).send("Vote not found")
    }
    vote = await Vote.findByIdAndUpdate(id, {$set: {ballot}}, {new: true})
    res.json(vote)
  } catch (error) {
    console.error(error.message)
    res.status(500).send(`Server error (ノಠ益ಠ)ノ彡┻━┻ ${error.message}`)
  }
})

module.exports = router
