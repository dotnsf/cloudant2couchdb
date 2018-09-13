# cloudant2couchdb


## Overview

Sample application which can access both Apache CouchDB and IBM Cloudant with Cloudant Node.js Client.


## Setup

- Edit settings.js for your prefered DB.

    - If you are going to use IBM Cloudant, you need to set **exports.db_username** and **exports.db_password** as your username and password for IBM Cloudant.

    - If you are going to use Apache CouchDB, you need to set **exports.db_host**, **exports.db_protocol**, and **exports.db_port** as your Apache CouchDB server. You may need to edit **exports.db_username** and **exports.db_password** too when they are not blank.

- Edit public/doc/swagger.yaml host value for your application server.


## Copyright

2018 [K.Kimura @ Juge.Me](https://github.com/dotnsf) all rights reserved.

