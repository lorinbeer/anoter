/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var coax = require("coax"),
    appDbName = "hailer";

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        for(var i = 0; i < 100; i=i+1) {
            console.log("device ready");
        }
        app.onstartconfig();
    },
    
    onstartconfig: function() {
       
        cblite.getURL(function(err,url) {
                        console.log("CBLITE");
                        var db = coax([url, appDbName]);
                        setupDb(db, function(err, info){
                            console.log("setupDb: ", err, info);
                              setupViews(db, function(err, views) {
                                         //console.log(err, views);
                                    window.config = {
                                         site : {
                                         syncUrl : "http://sync.couchbasecloud.com/registration/",
                                         db : db,
                                         s : coax(url),
                                         info : info,
                                         views : views,
                                         server : url
                                         
                                         }
                                         
                                
                                         }
                                         console.log("setting window.config");
                                console.log("config", window.config.site.syncUrl)
                                         registrationRequest('lorin@adobe.com','lorin');
                                        });
            
                                });
  
                        console.log("this doesn't Work?");
                                });
        
    },
    
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
        
    }
};
/*
function pagenav(page) {
    console.log("pagenav");
    /*
    $(currentpage).removeClass('active');
    $(currentpage).addClass('inactive');
    
    $(page).addClass('active');
    $(page).removeClass('inactive');
     
}
*/


var id;

function registrationRequest(user,name) {
 
    var doc = {};
    doc.type = "registration";
    doc.user = user;
    doc.name = name;
    doc.channels = "new-users";
    console.log("hellohello");
 
    
    
    window.config.site.db.post(doc, function(err, ok) {
                   console.log("DB POST RESPONSE",JSON.stringify(err), JSON.stringify(ok));
                               id = ok.id;
                               dbquery(user,name);
    });
    
   
}

function dbquery(user,name) {
    console.log("DB QUERY LEVEL");
    config.site.db(id, function(err, doc){
                   console.log("we did it", doc.name);
                   });
}




/*
function jsonform(elem) {
    var o = {}, list = $(elem).serializeArray();
    for (var i = list.length - 1; i >= 0; i--) {
        var name = list[i].name, value = list[i].value;
        if (o[name]) {
            if (!o[name].push) {
                o[name] = [o[name]];
            }
            o[name].push(value);
        } else {
            o[name] = value;
        }
    };
    return o;
};

*/

function setupDb(db, cb) {
    // db.del(function(){
    db.put(function(){
           db.get(cb)
           })
    // })
}

function setupViews(db, cb) {
    var design = "_design/todo9"
    db.put(design, {
           views : {
            lists : {
                map : function(doc) {
                    if (doc.type == "registration" && doc.user && doc.name) {
                        emit(doc.name)
                    }
                    }.toString()
            }
           
           }
           }, function(){
           cb(false, db([design, "_view"]))
           })
}

