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
