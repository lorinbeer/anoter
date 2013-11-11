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
        
        for(var i = 0; i < 100; i=i+1) {
            console.log("device ready");
        }
        
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
                   console.log("HASUHTSHTOEUSTHOEUSTH");
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

