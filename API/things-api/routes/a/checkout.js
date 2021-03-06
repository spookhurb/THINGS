/*
Copyright (c) 2016 CATTHINGS: Nicholas McHale, Andrew McCann, Susmita Awasthi,
Manpreet Bahl, Austen Ruzicka, Luke Kazmierowicz, Hillman Chen

See LICENSE.txt for full information.
*/
/****************************************************
* /path     a/checkout/:id/:person/:qty
* /params   id
*           person
*           qty
* /brief    Route to remove some :qty from inventory
****************************************************/
module.exports = (req, res) =>{


  // If the value to checkin is negative
  if (req.params.qty < 0) {
    // Respond with forbidden (403) status
    res.status(403);
    res.jsonp("ERROR: You cannot checkout a negative value. Operation canceled.");

  } else {
    res.app.locals.helpers.transaction(req.params.id, req.params.person, -req.params.qty,
      req.app.locals.helpers.errResultHandler, res);


    res.app.locals.helpers.doThresholdCheck(req.params.id, req.params.qty, req.app.locals.helpers.errResultHandler, res);


  }
};
