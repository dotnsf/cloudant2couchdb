// app.js

var cfenv = require( 'cfenv' );
var express = require( 'express' );
var bodyParser = require( 'body-parser' );
var request = require( 'request' );
var app = express();

var settings = require( './settings' );
var appEnv = cfenv.getAppEnv();

app.use( express.static( __dirname + '/public' ) );
//app.use( bodyParser.urlencoded( { extended: true, limit: '10mb' } ) );
app.use( bodyParser.urlencoded() );
app.use( bodyParser.json() );


//. https://www.npmjs.com/package/@cloudant/cloudant
var Cloudantlib = require( '@cloudant/cloudant' );
var cloudant = null;
var db = null;

if( !settings.db_host ){
  cloudant = Cloudantlib( { account: settings.db_username, password: db_password } );
}else{
  var url = settings.db_protocol + '://';
  if( settings.db_username && settings.db_password ){
    url += ( settings.db_username + ':' + settings.db_password + '@' );
  }
  url += ( settings.db_host + ':' + settings.db_port );
  cloudant = Cloudantlib( url );
}

if( cloudant ){
  cloudant.db.get( settings.db_name, function( err, body ){
    if( err ){
      if( err.statusCode == 404 ){
        cloudant.db.create( settings.db_name, function( err, body ){
          if( err ){
            db = null;
          }else{
            db = cloudant.db.use( settings.db_name );
          }
        });
      }else{
        db = cloudant.db.use( settings.db_name );
      }
    }else{
      db = cloudant.db.use( settings.db_name );
    }
  });
}

app.post( '/doc', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  console.log( 'POST /doc' );

  var doc = req.body;
  doc.timestamp = ( new Date() ).getTime();
  //console.log( doc );

  if( db ){
    db.insert( doc, function( err, body ){
      if( err ){
        res.status( 400 );
        res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
        res.end();
      }else{
        console.log( body );
        res.write( JSON.stringify( { status: true, body: body }, 2, null ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'db is not initialized.' }, 2, null ) );
    res.end();
  }
});
      
app.get( '/doc/:id', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var id = req.params.id;
  console.log( 'GET /doc/' + id );

  if( db ){
    db.get( id,  function( err, body ){
      if( err ){
        console.log( err );
        res.status( 400 );
        res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
        res.end();
      }else{
        console.log( body );
        res.write( JSON.stringify( { status: true, doc: body }, 2, null ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'db is not initialized.' }, 2, null ) );
    res.end();
  }
});

app.get( '/docs', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  console.log( 'GET /docs' );

  if( db ){
    db.list( { include_docs: true }, function( err, body ){
      if( err ){
        console.log( err );
        res.status( 400 );
        res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
        res.end();
      }else{
        var docs = [];
        body.rows.forEach( function( doc ){
          var _doc = JSON.parse( JSON.stringify( doc.doc ) );
          if( _doc._id.indexOf( '_' ) !== 0 ){
            docs.push( _doc );
          }
        });
            
        res.write( JSON.stringify( { status: true, docs: docs }, 2, null ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'db is not initialized.' }, 2, null ) );
    res.end();
  }
});

app.delete( '/doc/:id', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var id = req.params.id;
  console.log( 'DELETE /doc/' + id );

  if( db ){
    db.get( id,  function( err, doc ){
      if( err ){
        console.log( err );
        res.status( 400 );
        res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
        res.end();
      }else{
        db.destroy( id, doc._rev, function( err, body ){
          if( err ){
            console.log( err );
            res.status( 400 );
            res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
            res.end();
          }else{
            console.log( body );
            res.write( JSON.stringify( { status: true, doc: body }, 2, null ) );
            res.end();
          }
        });
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'db is not initialized.' }, 2, null ) );
    res.end();
  }
});


app.post( '/reset', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  console.log( 'POST /reset' );

  if( db ){
    db.list( {}, function( err, body ){
      if( err ){
        console.log( err );
        res.status( 400 );
        res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
        res.end();
      }else{
        var docs = [];
        body.rows.forEach( function( doc ){
          if( doc.id.indexOf( '_' ) !== 0 ){
            docs.push( { _id: doc.id, _rev: doc.value.rev, _deleted: true } );
          }
        });
        if( docs.length ){
          db.bulk( { docs: docs }, function( err ){
            res.write( JSON.stringify( { status: true, message: docs.length + ' documents are deleted.' }, 2, null ) );
            res.end();
          });
        }else{
          res.write( JSON.stringify( { status: true, message: 'No documents need to be deleted.' }, 2, null ) );
          res.end();
        }
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'db is not initialized.' }, 2, null ) );
    res.end();
  }
});


var port = settings.app_port || appEnv.port || 3000;
app.listen( port );
console.log( 'server started on ' + port );
