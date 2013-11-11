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
    fastclick = require("fastclick"),
    appDbName = "hailer",
    currentpage = "#main",
    composition;

var startX, startY, endX, endY;
document.addEventListener("touchstart", function(e){
                          startX = e.touches[0].pageX;
                          startY = e.touches[0].pageY;
                        //  console.log("start:",startX,startY,e.touches[0]);
                       //   e.preventDefault();//Stops the default behavior
                          }, false);

document.addEventListener("touchend", function(e){
                          endX = e.touches[0].pageX;
                          endY = e.touches[0].pageY;
                          console.log("end",endX,endY,e);
                        //  e.preventDefault();//Stops the default behavior
                          }, false);

var message = function () {
    this.type = "message";
    this.pictures = [];
    this.text = "null";
    this.user = "lorin@adobe.com";
}

var album = {
    preview : function(message) {
        $("#preview").empty();
        var children = [];
        for(var i in message.pictures) {
            children.push('<img src="'+"data:image/jpeg;base64,"+message.pictures[i]+'" width="100"></img>');
        }
        $("#preview").append(children.join());
    },
    
    getPhoto : function(source, dest) {
        navigator.camera.getPicture(function(imageData){
                                    console.log(composition.pictures.length);
                                    composition.pictures.push(imageData);
                                    album.preview(composition);

                                    },
                                    function(msg) {},
                                    {quality: 50, sourceType : source, destinationType:dest});
    }
}

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
        $('#share')  .toggle();
      //  $('#history').toggle();

        
        $('#share_button').bind('touchstart', function (e) {
                                console.log("TOUCH STARTED");
                                app.navpage('#share');
                                composition = new message();
                                $('#main_input').val("");
                                album.preview(composition);
                                
        });
    
        $('#img_button').bind('touchstart', function(e) {
           console.log(navigator.camera.PictureSourceType);
           album.getPhoto(navigator.camera.PictureSourceType.PHOTOLIBRARY,
                          navigator.camera.DestinationType.DATA_URL);
                              
        });

        $('#share').on('click', function(e) {
            composition.text = $('#main_input').val();
                       console.log(composition.pictures.length);
                       if(composition.id) {
                       window.config.site.db.get(composition.id, function(err, doc) {
                                                 doc.pictures = composition.pictures;
                                                 doc.text = composition.text;
                          window.config.site.db.put(composition.id, doc, function(err, ok) {
                                                    
                                                    
                                                    console.log(err,ok.pictures.length)
                                                                           });
                                                 
                                                  });
                       
                       } else {
            window.config.site.db.post(composition, function(err, ok) {
                                       console.log(err,ok.id);
                                       });
                       }
                       
        });
        
        
        $('#cam_button').bind('touchstart', function(e) {
            if (!(navigator.camera && navigator.camera.getPicture)) {return}
            
            navigator.camera.getPicture(function(imageData) {
                        
              console.log(composition.pictures.length);
              composition.pictures.push(imageData);
              album.preview(composition);

                }, function(message) { console.log("cam failed");
                }, {
                                                          quality: 50,
                                                          targetWidth : 1000,
                                                          targetHeight : 1000,
                                                          destinationType: Camera.DestinationType.DATA_URL
                                                          });
                              
                              
                              });
        
        $('.history').on("click", "li", function() {
                         console.log('list element clicked');
        })

        
        
        $('#history_button').bind('touchstart', function(e) {
        var history = '<div class="topcoat-list"><h3 class="topcoat-list__header">History</h3><ul class="topcoat-list__container">';
                                  console.log("HISTORY BUTTON");
                             //     $('#history').toggle();
            $('#history').empty();
                                  var id=[];
            window.config.site.views(["messages", {descending : true}], function(err, view) {
                        view.rows.forEach(function(row) {
                            history = history+ ('<li class="Topcoat-list__item" id="'+row.id+'">'+row.key+'</li>');
                                          id.push(row.id);
    
             
                        });
                    history = history + '</ul></div>';
                                     
                                

                  //  $('#history').empty();
                   $('#history').append(history);
                    for(i=0;i<id.length;i++) {
                        console.log(id[i]);
                        $('#'+id[i]).bind("click", function(e) {
                                          var i = $(this).attr("id");
                                          app.loadmessage(i);
                                            });
                        $('#'+id[i]).on("swipeRight", function(e) {
                                        console.log($(this).attr("id"), 'swiped right');
                        });
                    }
                                     //console.log(history);
                                     
            });
        });
            

        $('#back_button').bind('touchstart', function(e) {
                               app.navpage('#main');
        });
        
        app.onstartconfig();
        /*
        triggerSync(function(err) {
                    if (err) {console.log("error on sync"+ JSON.stringify(err))}
                    });
        */
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
                                                 triggerSync();
                                        registrationRequest('lorin@adobe.com','lorin');
                                        });
            
                                });
  
                        console.log("this doesn't Work?");
                                });
     
    
    },

    navpage: function(pageid) {
        console.log("nav to page", pageid);
        $(currentpage).toggle();
        $(pageid).toggle();
        currentpage = pageid;
    },
    
    loadmessage: function(id) {
        console.log("shiiiit");
        if(!composition) {
            composition = new message();
        }
        window.config.site.db(id, function(err,doc){
            composition.pictures = doc.pictures;
            composition.id = id;
            $('#main_input').val(doc.text);
            album.preview(composition);
            app.navpage('#share');
        });
    }
};


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
    var design = "_design/hailer"
    db.put(design, {
           views : {
            registration : {
                map : function(doc) {
                    if (doc.type == "registration" && doc.user && doc.name) {
                        emit(doc.name)
                    }
                    }.toString()
            },
           messages : {
           map : function(doc) {
                if(doc.type == "message" && doc.text && doc.user) {
                    emit(doc.user);
           }
           }.toString()
           }
           }}, function(){
           cb(false, db([design, "_view"]))
           })
}

/*
 Sync Manager: this is run on first login, and on every app boot after that.
 
 The way it works is with an initial single push replication. When that
 completes, we know we have a valid connection, so we can trigger a continuous
 push and pull
 
 */

function triggerSync(cb, retryCount) {
    
/*    if (!config.user) {
        return log("no user")
    }
 */
    console.log(window.config.site.syncUrl);
    var remote = {
        url : window.config.site.syncUrl
    },
    push = {
        source : appDbName,
        target : remote,
        continuous : true
    }, pull = {
        target : appDbName,
        source : remote,
        continuous : true
    };
    
    pushSync = syncManager(window.config.site.server, push);
    pullSync = syncManager(window.config.site.server, pull);
    
    if (typeof retryCount == "undefined") {
        retryCount = 3
    }
    /*
    var challenged = false;
    function authChallenge() {
        if (challenged) {return}
        challenged = true;
        pushSync.cancel(function(err, ok) {
                        pullSync.cancel(function(err, ok) {
                                        if (retryCount == 0) {return cb("sync retry limit reached")}
                                        retryCount--
                                        getNewFacebookToken(function(err, ok) {
                                                            if (err) {
                                                            return loginErr(err)
                                                            }
                                                            triggerSync(cb, retryCount)
                                                            })
                                        })
                        })
    }
    */
    
    //pushSync.on("auth-challenge", authChallenge)
    //pullSync.on("auth-challenge", authChallenge)
    
    pushSync.on("error", function(err){
                if (challenged) {return}
                cb(err)
                })
    pushSync.on("connected", function(){
                pullSync.start()
                })
    pullSync.on("error", function(err){
                if (challenged) {return}
                cb(err)
                })
    pullSync.on("connected", function(){
                cb()
                })
    // setTimeout(function(){
    pushSync.start()
    // }, 10000)

}


/*
 Sync manager module TODO extract to NPM
 */

function syncManager(serverUrl, syncDefinition) {
    var handlers = {}
    
    function callHandlers(name, data) {
        (handlers[name]||[]).forEach(function(h){
                                     h(data)
                                     })
    };
    /*
    function doCancelPost(cb) {
        /*
        var cancelDef = JSON.parse(JSON.stringify(syncDefinition))
        cancelDef.cancel = true
        coax.post([serverUrl, "_replicate"], cancelDef, function(err, info){
                  if (err) {
                  callHandlers("error", err)
                  if (cb) {cb(err, info)}
                  } else {
                  callHandlers("cancelled", info)
                  if (cb) {cb(err, info)}
                  }
                  })
     
    }
    */
    function doStartPost() {
        /*
        var tooLate;
        function pollForStatus(info, wait) {
            if (wait) {
                setTimeout(function() {
                           tooLate = true
                           }, wait)
            }
            processTaskInfo(info.session_id, function(done){
                            if (!done && !tooLate) {
                            setTimeout(function() {
                                       pollForStatus(info)
                                       }, 200)
                            } else if (tooLate) {
                            callHandlers("error", "timeout")
                            }
                            })
        }
        */
        
        var callBack;
        if (syncDefinition.continuous) {
            // auth errors not detected for continuous sync
            // we could use _active_tasks?feed=continuous for this
            // but we don't need that code for this app...
            callBack = function(err, info) {
                console.log("continuous sync callBack", err, info, syncDefinition)
                console.log(info);
                if (err) {
                    console.log("OH GOD THERE WAS AN ERROR");
                    callHandlers("error", err)
                } else {
                    pollForStatus(info, 10000)
                    callHandlers("started", info)
                }
            }
        } /*else { // non-continuous
            callBack = function(err, info) {
                log("sync callBack", err, info, syncDefinition)
                if (err) {
                    if (info.status == 401) {
                        err.status = info.status;
                        callHandlers("auth-challenge", err)
                    } else {
                        err.status = info.status;
                        callHandlers("error", err)
                    }
                } else {
                    callHandlers("connected", info)
                }
                
            }
        }
        */
        //log("start sync"+ JSON.stringify(syncDefinition))
        console.log("RIGHT HERE RIGHT HERE");
        coax.post([serverUrl, "_replicate"], syncDefinition, callBack)
        
        // coax.post([serverUrl, "_replicator"], syncDefinition, callBack)
    }
    /*
    function processTaskInfo(id, cb) {
        taskInfo(id, function(err, task) {
                 if (err) {return cb(err)}
                 log("task", task)
                 
                 publicAPI.task = task
                 if (task.error && task.error[0] == 401) {
                 cb(true)
                 callHandlers("auth-challenge", {status : 401, error : task.error[1]})
                 } else if (task.error && task.error[0] == 502) {
                 cb(true)
                 callHandlers("auth-challenge", {status : 502, error : task.error[1]})
                 } else if (task.status == "Idle" || task.status == "Stopped" || (/Processed/.test(task.status) && !/Processed 0/.test(task.status))) {
                 cb(true)
                 callHandlers("connected", task)
                 } else if (/Processed 0 \/ 0 changes/.test(task.status)) {
                 // cb(false) // keep polling? (or does this mean we are connected?)
                 cb(true)
                 callHandlers("connected", task)
                 } else {
                 cb(false) // not done
                 }
                 })
    }
    */
    /*
    function taskInfo(id, cb) {
        coax([serverUrl,"_active_tasks"], function(err, tasks) {
             var me;
             for (var i = tasks.length - 1; i >= 0; i--) {
             if (tasks[i].task == id) {
             me = tasks[i]
             }
             }
             cb(false, me);
             })
    }
    */

    var publicAPI = {
        start : doStartPost,
        //cancel : doCancelPost,
        on : function(name, cb) {
            handlers[name] = handlers[name] || []
            handlers[name].push(cb)
        }
    }
    return publicAPI;

}

