/**
  * @swagger
  * definition:
  *   group:
  *     description: group object
  *     type: object
  *     properties:
  *       id:
  *         type: string
  *         format: uuid
  *       creator:
  *         type: string
  *       email:
  *         type: string
  *       members:
  *         type: array
  *         items:
  *           type: object
  *           properties:
  *             member:
  *               $ref: "#/definitions/Tuple"
  *             _id:
  *               type: string
  *               format: uuid
  *       name:
  *         type: string
  */
