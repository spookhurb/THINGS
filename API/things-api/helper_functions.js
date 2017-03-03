//helper_functions.js Exports a number of funtions that are used in various
// templates.  by locating the functions here, functions from different
// directories can gain access after we attatch this object to the app.locals variable

module.exports = {
  /****************************************************
  * /func name  errResultHandler
  * /params     :err - the error that occured, null if none
  *             :result - the result of the database query
                        (either the rows returned or success message)
                :res - the function to handle the responding the result
  *
  * /brief      Responds with a meaningful status and returns the results
  *
  * /author     Luke
  * /date       2/7/2017
  ****************************************************/


  errResultHandler: function(err, result, res) {

      const util = require('util');

      console.log("Err = " );

      console.log(util.inspect(err, { showHidden: false, depth: 1 }));

      console.log("----------------------------------------");

      console.log("Result = ");

      console.log(util.inspect(result, { showHidden: false, depth: 1 }));

      console.log("------------------------------------------");

      console.log("Res.status = ");

      console.log(util.inspect(res.status, { showHidden: false, depth: 1 }));


      console.log("------------------------------------------");


      if (err) {

        res.status(500); 
        res.jsonp('Database Error');


        var errString = '';
        var statusInt = 500;
        if(err.routine == 'pg_atoi') {
          errString = "ERROR: An integer field contained an invalid integer.";
          statusInt = 400; //Bad request
        } else if(err.routine == 'cash_in') {
          errString = "ERROR: An money field contained an invalid value.";
          statusInt = 400; //Bad request
        } else {
          errString = 'Database Error';
        }

        console.error(errString);

        res.status(statusInt);
        res.jsonp(errString);
        

      } else {

        console.log("Result 2 = " + result);
        res.status(200);

        //console.log("res.jsonp(result) = " + res.jsonp(result));

        //if(res.jsonp(result) === null)
         res.jsonp(result);
        //else
        //return;

 
      }
  },

  /****************************************************
  * /func name  transaction
  * /brief      Helper function for checkin route
  *
  * /author     Luke
  ****************************************************/
  transaction: function(id, person, qty, retFunc, res) {

      res.app.locals.pool.connect(function(err, client, done) {
          if(err) {
              return console.error('error fetching client from pool', err);
          }

           client.query('INSERT INTO transactions(item_id, person, qty_changed) VALUES ($1, $2, $3)', [id, person, qty], function(err, result) {
              //call `done()` to release the client back to the pool
              done();

              if(err) {
                // If the error is because they checked out too many items,
                if (err.toString().includes("items_quantity_check")) {
                  // Respond with conflict (409) status
                  res.status(409);
                  res.jsonp("ERROR: Transaction not completed because it would result in an item with a negative quantity.");
                } else {
                  //console.error('error running query', err);
                  retFunc(err, null, res);
                  
                }
              } else {
                 return retFunc(null, 'Transaction Completed Successfully', res);
                
              }
          });
      });
  

},


  doThresholdCheck: function(id, retFunc, res2) {


    res.app.locals.pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
    }
    
    client.query('SELECT threshold, quantity from items where item_id = $1', [id], function(err, result) {

        done();

        if(err) {
            console.error('Threshold and quantity were not received properly', err);
            retFunc(err, null, res2);
        }
        else {

            console.log("Threshold for this item is:" + result.rows[0].threshold);
            

           

            //res2.rows.q

            if(result.rows[0].quantity <= result.rows[0].threshold) //send emmail to administrator
            console.log("Send email to administrator");  
            //console.log("thresh = " + res2.rows[0].threshold + "/qty remaining=" +res2.rows[0].quantity);

            retFunc(null, 'Threshold found successfully', res2);
        }


    });
  });
 }
 
}
