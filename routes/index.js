let express = require('express');
let router = express.Router();

router.get('/', function(req, res) {
  res.redirect('/catalog');
});

module.exports = router;
