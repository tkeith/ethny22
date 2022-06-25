import exampleRoutes from './example-routes.js'
import { Router } from "express"
import getMongo from '../lib/mongo.js'

export const router = Router()

router.use('/examples', exampleRoutes)

export default router

router.route('/trees').get(async (req, res) => {
  res.json(
    await (await getMongo()).collection('trees').find({}).sort({ tokenId: 1 }).toArray()
  )
})

router.route('/treesByUser/:user').get(async (req, res) => {
  const user = req.params.user;
  var trees = [];

  for (var tree of (await (await getMongo()).collection('trees').find({ owners: user }).sort({ tokenId: 1 }).toArray())) {
    tree.currentlyOwned = user == tree.currentOwner;
    trees.push(tree);
  }

  res.json(
    trees
  )
})
