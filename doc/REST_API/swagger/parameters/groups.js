/**
 * @swagger
 * parameter:
 *   group_id:
 *     name: group_id
 *     in: path
 *     description: id of group
 *     type: string
 *     format: uuid
 *     required: true
 *   group_name:
 *     name: group_name
 *     in: body
 *     description: name of group
 *     required: true
 *     schema:
 *       type: string
 *   group_email:
 *     name: group_email
 *     in: body
 *     description: email of group
 *     required: true
 *     schema:
 *       type: string
 *   group_member_emails:
 *     name: group_member_emails
 *     in: body
 *     required: true
 *     description: List of group member emails.
 *     schema:
 *       type: array
 *       items:
 *          type: string
 *   action:
 *     name: action
 *     in: query
 *     description: action to update the group
 *     required: true
 *     type: string
 *     enum:
 *       - add
 *       - remove
 *   group_members:
 *     name: group_members
 *     in: body
 *     description: list of updated members
 *     required: true
 *     schema:
 *       type: array
 *       items:
 *         $ref: "#/definitions/Tuple"
**/
