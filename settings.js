exports.db_username = '';
exports.db_password = '';
exports.db_name = 'c2cdb';
exports.db_host = '';  //. この値が true ならば CouchDB
exports.db_protocol = 'http';
exports.db_port = 5984;
exports.app_port = 0;
exports.search_analyzer = 'japanese';
exports.search_fields = '[doc.name]';

if( process.env.VCAP_SERVICES ){
  var VCAP_SERVICES = JSON.parse( process.env.VCAP_SERVICES );
  if( VCAP_SERVICES && VCAP_SERVICES.cloudantNoSQLDB ){
    exports.cloudant_username = VCAP_SERVICES.cloudantNoSQLDB[0].credentials.username;
    exports.cloudant_password = VCAP_SERVICES.cloudantNoSQLDB[0].credentials.password;
  }
}

if( !exports.db_host && exports.db_username && exports.db_password ){
  exports.db_host = db_username + '.cloudant.com';
  exports.db_protocol = 'https';
  exports.db_port = 443;
}

