/* 
        v3.5 - to do:
        - Poll: -> lowercase
        - help en !help      
*/

var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

// SQLite connection
var sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('/home/pogo/TRTDD-Bot/db/trtddraidbot.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        logger.error(err.message);
    } else {
        logger.info(getLogTime()+': Connected to the TRTDD Raid Bot database.');
    }
});

// custom include vars
var gymlist = require('./gyms.js').gymlist;
var pokelist = require('./mons.js').pokelist;
var mapsapikey = require('./vars.js').mapsapikey;
var iconpath = require('./vars.js').iconpath;

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

bot.once('ready', function (evt) {
    logger.info('Connected');
    //logger.info('Logged in as: ');
    //logger.info(bot.username + ' - (' + bot.id + ')');
    bot.setPresence({ game: { name: '!raid' } });
});

bot.on('disconnect', function() {
    logger.info(getLogTime()+': Bot disconnected');
    bot.connect() //Auto reconnect
});


/*//////////////////////////////////////////////// MESSAGES  //////////////////////////////////////////////*/

bot.on('message', function (user, userID, channelID, message, evt) {    
    // Our bot needs to know if it will execute a command
    
    var serverID    = bot.channels[channelID].guild_id;
    var server      = bot.servers[serverID];
    var roles       = server.roles;
    var member      = server.members[userID];
    
    if (member) { // or else it will break when webhooks are caled (no member role)
        var hasAdmin    = member.roles.some(roleID => roles[roleID].GENERAL_ADMINISTRATOR);
    }
    
    if (message.substring(0, 5) == 'poll:') {
        
        bot.sendMessage({
            to: channelID,
            message: 'Poll: werkt niet meer <@'+userID+'>. Gebruik voortaan `!raid`. Lees snel de instructies bovenaan het kanaal.'
        }, function(err, res) {
            if (!err) {

                setTimeout(function() {
                    bot.deleteMessage({                                    
                        channelID: channelID,
                        messageID: res.id,
                    });
                    logger.info(getLogTime()+': poll warning auto deleted');
                }, 30000); // delete after 1 min
                
            } else {
                logger.info(err);
            }
        });

        bot.deleteMessage({
            channelID: channelID,
            messageID: evt.d.id,
        });        
    }    
    
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        
        //remove space between ! and cmd
        if (message.substring(1, 2) == ' ') {
            var args = message.substring(2).split(' ');
        } else {
            var args = message.substring(1).split(' ');
        }
        var cmd = args[0].toLowerCase();
        
        // pokemon name & edit code
        var pokemon = args[1]; // case: raid
        var editcode = pokemon; // case: start / edit / delete
        
        // start time (maybe..)
        var starttime = args[2]; // case: start
        if (starttime == null) starttime = ''; // case: start
        
        // gym name
        var gymname = locationName(message); // case // raid
        
        var invalidchar = false;
        if (message.indexOf('<') > -1 || message.indexOf('>') > -1) {
            invalidchar = true;
            logger.info(getLogTime()+': ongeldige char?: '+invalidchar);
        }
        
        // everything after the gym name
        var msgslit = message.split('%');
        var otherinfo = msgslit.pop();
        
        var totalparticipants = countParticipants(user, otherinfo);
        
        // get new info after edit code
        var a = message.split(' ');        
        var newinfo = a.slice(2).join(' '); // case: edit
        
        // gym location
        var longlat = getGymLocation(gymlist, gymname);
        
        args = args.splice(1);
        
        switch(cmd) {   
                
            /*//////////////////////////////////////////////// CASE: CREATE RAID  //////////////////////////////////////////////*/  
                
            case 'raid':
            case 'poll':
                
                //bot.simulateTyping( channelID );
                
                // check if the gym name is correct
                var embedmap = '';
                var embedurl = '';
                var urltitle = '';                
                
                if (longlat) {
                    embedmap = 'https://maps.googleapis.com/maps/api/staticmap?center='+longlat+'&zoom=15&size=250x125&markers=&markers=icon:'+iconpath+'%7Clabel:P%7C'+longlat+'&key='+mapsapikey;
                    embedurl = 'http://maps.google.com/maps?q='+longlat;
                    urltitle = 'Google Maps link';
                } else {
                    embedurl = 'https://outgress.com/portals/';
                    urltitle = 'Gymlocatie onbekend, zoek op outgress.com';
                }
                if (gymname && !invalidchar) {
					
					var pokeid 	= searchList(pokelist, pokemon, 1);
					var imgpath = 'http://assets22.pokemon.com/assets/cms2/img/pokedex/full/'+pokeid+'.png';
					if (pokeid > 990) var imgpath = 'https://www.ubierfestival.nl/trtddraidbot/images/'+pokeid+'.png';
                    
                    gymname = toTitleCase(gymname);
                    var shinypossible = '';
                    if (searchList(pokelist, pokemon, 6)=='yes') {
                        shinypossible = ' | shiny possible!';
                    }
					var editcode = genEditCode();
                    
                    bot.sendMessage({
                        to: channelID,
                        message: '`'+capitalizeFirstLetter(pokemon)+' bij '+gymname+otherinfo+'`',
                        embed: {
                            color: 14417972,
                            description: '`'+otherinfo+'`',
                            image: {
                              url: embedmap
                            },
                            author: {
                              name: '\''+gymname+'\'',
                                url: embedurl,
                              icon_url: imgpath
                            },
                            thumbnail: {
                              url: imgpath
                            },
                            footer: {
                                text: 'wijzigcode: '+editcode+' | 100% IV: '+searchList(pokelist, pokemon, 2)+' CP | '+searchList(pokelist, pokemon, 3)+'? 100% IV: '+searchList(pokelist, pokemon, 4)+' CP'
                            },
                            title: urltitle,
                            url: embedurl,                            
                            fields: [
                                {
                                    name: 'Starttijd',
                                    value: '`n.t.b.`',
                                },
                                {
                                    name: 'Gestart door',
                                    value: '`'+user+'`'
                                },
                                {
                                    name: 'Deelnemers ('+totalparticipants+')',
                                    value: '`'+user+'`'
                                }
                            ]                
                    
                        }
                    }, function(err, res) {
                        if (!err) {
							
							var raidmsgid = res.id;
                            
                            setTimeout(function() {
                                bot.deleteMessage({                                    
                                    channelID: channelID,
                                    messageID: raidmsgid,
                                });
                                logger.info(getLogTime()+': raid auto deleted');
                            }, 7200000); // delete after 2 hours

                            logger.info(getLogTime()+': raid created by '+user+': '+raidmsgid);
                            bot.addReaction({
                                channelID: channelID,
                                messageID: raidmsgid,
                                reaction: '👍'
                            });							
												
							// insert raid in to db file
							db.run("INSERT INTO raids(gym_name,date,gym_longlat,raid_boss,created_by,editcode,messageid) VALUES('"+gymname+"','"+getLogTime()+"','"+longlat+"','"+pokemon+"','"+userID+"','"+editcode+"','"+raidmsgid+"')", (err, row) => {
								if (err){
									throw err;
								} else {
									logger.info(getLogTime()+': raid bij '+gymname+ ' toegevoegd aan database.');
								}
							});
							
                        } else {
                            logger.info(err);
                        }
                    });
                    
                    // delete as soon as the bot has added the raid
                    bot.deleteMessage({
                        channelID: channelID,
                        messageID: evt.d.id,
                    });
					
                    
                } else {
                    
                    bot.sendMessage({
                        to: channelID,
                        message: 'Er ging iets mis bij het invoeren <@'+userID+'>. Vergeet niet om % voor en na de gymnaam te plaatsen. (bv. %De Denker%). En de tekens \'>\' en \'<\' zijn niet toegestaan.'
                    }, function(err, res) {
                        if (!err) {

                            setTimeout(function() {
                                bot.deleteMessage({                                    
                                    channelID: channelID,
                                    messageID: res.id,
                                });
                                logger.info(getLogTime()+': invalid location or character warning auto deleted');
                            }, 30000); // delete after 1 min

                        } else {
                            logger.info(err);
                        }
                    });					
					
                    bot.deleteMessage({
                        channelID: channelID,
                        messageID: evt.d.id,
                    });
                    
                }
                
            break;
                
            /*//////////////////////////////////////////////// CASE: ADD START TIME  //////////////////////////////////////////////*/
                
            case 'start':
                
                if ( (starttime.indexOf(':') != -1) || (starttime.indexOf('.') != -1) || isNumeric(starttime) ) {
                    starttime = starttime.replace('uur','').replace('u','').replace('U','').replace('h','') +' uur';
                } else {
                    logger.info(getLogTime()+': invalid time entered by '+user);
                    break;
                }
                
                bot.getMessages({
                    channelID: channelID,
                    limit: 75
                }, function(error, response) {
                    if (!error) {
                        //logger.info(response);                        
                        //var userMessages = messages.filter(msg => msg.userID === userID);                        
                        var msgid = getIdByCheckcode(response, editcode, user, channelID, bot.id, hasAdmin );
                        
                        if (msgid!='') {
                            
                            bot.getMessage({
                                channelID: channelID,
                                messageID: msgid
                            }, function(error, message) {
                                if (!error) {
                                    //logger.info(getLogTime()+': log: '+JSON.stringify(message, null, 4));
                                    
                                    var orgembed = message['embeds'];
                                    
                                    for(var j = 0; j < orgembed.length; j++) {
                                        if (orgembed[j]['url']!=null) var orgurl = orgembed[j]['url'];
                                        var orgtitle = orgembed[j]['title'];
                                        var orgeditcode = orgembed[j]['footer']['text'];
                                        var orgthumb = orgembed[j]['thumbnail']['url'];
                                        var orgraidtitle = orgembed[j]['author']['name'];
                                        if (orgembed[j]['description']!=null) var orginfo = orgembed[j]['description'];
                                        if (orgembed[j]['image']!=null) var orgmap = orgembed[j]['image']['url'];
                                        // all participants
                                        var orgstarter = orgembed[j]['fields'][1]['value'];
                                        var orgparticipants = orgembed[j]['fields'][2]['value'];
                                    }
                                    
                                    editMsg(channelID, msgid, orginfo, orgraidtitle, orgurl, orgthumb, '`'+starttime+'`', 
                                            orgstarter, orgparticipants, orgmap, orgthumb, orgeditcode, orgtitle);
                                    logger.info(getLogTime()+': starttime added by '+user+' to: '+msgid);
                                }
                            });
                                                       
                        } else {
							bot.sendMessage({
								to: channelID,
								message: 'Je bent niet bevoegd deze actie uit te voeren <@'+userID+'>.'
							}, function(err, res) {
								if (!err) {
									setTimeout(function() {
										bot.deleteMessage({                                    
											channelID: channelID,
											messageID: res.id,
										});
										logger.info(getLogTime()+': invalid user action warning auto deleted');
									}, 30000); // delete after 1 min

								} else {
									logger.info(err);
								}
							});
						}

					}
				}); 
                
                setTimeout(function() {
                    bot.deleteMessage({
                        channelID: channelID,
                        messageID: evt.d.id,
                    }, function(error, response) {
                        if (!error) {
                            logger.info(getLogTime()+': start time added msg auto deleted');
                        }
                    });
                }, 30000); // delete after 1 min     
               
            break;
                
            /*//////////////////////////////////////////////// CASE: CHANGE INFO  //////////////////////////////////////////////*/
                
            case 'wijzig':
            case 'edit':
                                
                bot.getMessages({
                    channelID: channelID,
                    limit: 75
                }, function(error, response) {
                    if (!error) {
                        //logger.info(response);                        
                        //var userMessages = messages.filter(msg => msg.userID === userID);                        
                        var msgid = getIdByCheckcode(response, editcode, user, channelID, bot.id, hasAdmin);
                        
                        if (msgid!='') {
                            
                            bot.getMessage({
                                channelID: channelID,
                                messageID: msgid
                            }, function(error, message) {
                                if (!error) {
                                    //logger.info(getLogTime()+': log: '+JSON.stringify(message, null, 4));
                                    
                                    var orgembed = message['embeds'];
                                    
                                    for(var j = 0; j < orgembed.length; j++) {
                                        if (orgembed[j]['url']!=null) var orgurl = orgembed[j]['url'];
                                        var orgtitle = orgembed[j]['title'];
                                        var orgeditcode = orgembed[j]['footer']['text'];
                                        var orgthumb = orgembed[j]['thumbnail']['url'];
                                        var orgraidtitle = orgembed[j]['author']['name'];
                                        if (orgembed[j]['image']!=null) var orgmap = orgembed[j]['image']['url'];
                                        // all participants
                                        var orgstarter = orgembed[j]['fields'][1]['value'];
                                        var orgparticipants = orgembed[j]['fields'][2]['value'];
                                        var orgstarttime = orgembed[j]['fields'][0]['value'];
                                    }
                                    
                                    editMsg(channelID, msgid, newinfo, orgraidtitle, orgurl, orgthumb, orgstarttime, 
                                            orgstarter, orgparticipants, orgmap, orgthumb, orgeditcode, orgtitle);
                                    logger.info(getLogTime()+': info changed by '+user+' to: '+msgid);
                                }
                            });
                                                       
                        } else {
							bot.sendMessage({
								to: channelID,
								message: 'Je bent niet bevoegd deze actie uit te voeren <@'+userID+'>.'
							}, function(err, res) {
								if (!err) {
									setTimeout(function() {
										bot.deleteMessage({                                    
											channelID: channelID,
											messageID: res.id,
										});
										logger.info(getLogTime()+': invalid user action warning auto deleted');
									}, 30000); // delete after 1 min

								} else {
									logger.info(err);
								}
							});
						}

					}
				}); 
                
                setTimeout(function() {
                    bot.deleteMessage({
                        channelID: channelID,
                        messageID: evt.d.id,
                    }, function(error, response) {
                        if (!error) {
                            logger.info(getLogTime()+': info changed msg auto deleted');
                        }
                    });
                }, 30000); // delete after 1 min     
               
            break;
                
            /*//////////////////////////////////////////////// CASE: CHANGE LOCATION  //////////////////////////////////////////////*/
                
            case 'locatie':
            case 'location':
                
                // check if the gym name is correct
                var embedmap = '';
                var embedurl = '';
                var urltitle = '';
                
                if (longlat) {
                    embedmap = 'https://maps.googleapis.com/maps/api/staticmap?center='+longlat+'&zoom=15&size=250x125&markers=&markers=icon:'+iconpath+'%7Clabel:P%7C'+longlat+'&key='+mapsapikey;
                    embedurl = 'http://maps.google.com/maps?q='+longlat;
                    urltitle = 'Google Maps link';
                } else {
                    embedurl = 'https://outgress.com/portals/';
                    urltitle = 'Gymlocatie onbekend, zoek op outgress.com';
                }
                if (gymname) {
                    
                    gymname = toTitleCase(gymname);
                                
                    bot.getMessages({
                        channelID: channelID,
                        limit: 75
                    }, function(error, response) {
                        if (!error) {
                            //logger.info(response);                        
                            //var userMessages = messages.filter(msg => msg.userID === userID);                        
                            var msgid = getIdByCheckcode(response, editcode, user, channelID, bot.id, hasAdmin);

                            if (msgid!='') {

                                bot.getMessage({
                                    channelID: channelID,
                                    messageID: msgid
                                }, function(error, message) {
                                    if (!error) {
                                        //logger.info(getLogTime()+': log: '+JSON.stringify(message, null, 4));

                                        var orgembed = message['embeds'];

                                        for(var j = 0; j < orgembed.length; j++) {
                                            if (orgembed[j]['url']!=null) var orgurl = orgembed[j]['url'];
                                            var orgeditcode = orgembed[j]['footer']['text'];
                                            var orgthumb = orgembed[j]['thumbnail']['url'];                                            
                                            if (orgembed[j]['description']!=null) var orginfo = orgembed[j]['description']; 
                                            // all participants
                                            var orgstarter = orgembed[j]['fields'][1]['value'];
                                            var orgparticipants = orgembed[j]['fields'][2]['value'];
                                            var orgstarttime = orgembed[j]['fields'][0]['value'];
                                        }

                                        editMsg(channelID, msgid, orginfo, '\''+gymname+'\'', embedurl, orgthumb, orgstarttime, 
                                                orgstarter, orgparticipants, embedmap, orgthumb, orgeditcode, urltitle);
                                        logger.info(getLogTime()+': location changed by '+user+' to: '+msgid);
                                    }
                                });

                            } else {
                                bot.sendMessage({
                                    to: channelID,
                                    message: 'Je bent niet bevoegd deze actie uit te voeren <@'+userID+'>.'
                                }, function(err, res) {
                                    if (!err) {
                                        setTimeout(function() {
                                            bot.deleteMessage({                                    
                                                channelID: channelID,
                                                messageID: res.id,
                                            });
                                            logger.info(getLogTime()+': invalid user action warning auto deleted');
                                        }, 30000); // delete after 1 min

                                    } else {
                                        logger.info(err);
                                    }
                                });
                            }

                        }
                    }); 

                    setTimeout(function() {
                        bot.deleteMessage({
                            channelID: channelID,
                            messageID: evt.d.id,
                        }, function(error, response) {
                            if (!error) {
                                logger.info(getLogTime()+': location changed msg auto deleted');
                            }
                        });
                    }, 30000); // delete after 1 min   
                } else {
                    
                    bot.sendMessage({
                        to: channelID,
                        message: 'Geen geldige gymnaam opgegeven <@'+userID+'>. Vergeet niet om % voor en na de gymnaam te plaatsen. (bv. %De Denker%)'
                    }, function(err, res) {
                        if (!err) {

                            setTimeout(function() {
                                bot.deleteMessage({                                    
                                    channelID: channelID,
                                    messageID: res.id,
                                });
                                logger.info(getLogTime()+': invalid location warning auto deleted');
                            }, 30000); // delete after 1 min

                        } else {
                            logger.info(err);
                        }
                    });
                    bot.deleteMessage({
                        channelID: channelID,
                        messageID: evt.d.id,
                    });
                    
                }
               
            break;
                
            /*//////////////////////////////////////////////// CASE: DELETE  //////////////////////////////////////////////*/
                
            case 'verwijder':
            case 'delete':
            case 'del':
                
                bot.getMessages({
                    channelID: channelID,
                    limit: 100
                }, function(error, response) {
                    if (!error) {
                        //logger.info(response);
                        
                        var msgid = getIdByCheckcode(response, editcode, user, channelID, bot.id, hasAdmin);
                        
                        if (msgid!='') {
                            bot.deleteMessage({
                                channelID: channelID,
                                messageID: msgid,
                            });
                            logger.info(getLogTime()+': raid deleted by '+user+': '+msgid);
							
							// remove raid from db file
							db.run("DELETE FROM raids WHERE messageid = "+msgid+"", (err, row) => {
								if (err){
									throw err;
								} else {
									logger.info(getLogTime()+': raid verwijderd uit database.');
								}
							});
							
							
                        } else {
							bot.sendMessage({
								to: channelID,
								message: 'Je bent niet bevoegd deze actie uit te voeren <@'+userID+'>.'
							}, function(err, res) {
								if (!err) {
									setTimeout(function() {
										bot.deleteMessage({                                    
											channelID: channelID,
											messageID: res.id,
										});
										logger.info(getLogTime()+': invalid user action warning auto deleted');
									}, 30000); // delete after 1 min

								} else {
									logger.info(err);
								}
							});
						}
                    } 
                });
                
                setTimeout(function() {
                    bot.deleteMessage({
                        channelID: channelID,
                        messageID: evt.d.id,
                    }, function(error, response) {
                        if (!error) {
                            logger.info(getLogTime()+': delete raid msg auto deleted');
                        }
                    });
                }, 30000); // delete after 1 min 
               
            break;
        
            case 'help':

                bot.sendMessage({
                    to: channelID,
                    message: '**Typ**: `!raid Pokemon bij %Gymnaam% tot 15:00`\n\nKijk bovenaan het kanaal voor meer uitleg <@'+userID+'>.'
                        }, function(err, res) {
                    if (!err) {
                        setTimeout(function() {
                            bot.deleteMessage({                                    
                                channelID: channelID,
                                messageID: res.id,
                            });
                            logger.info(getLogTime()+': help explanation auto deleted');
                        }, 30000); // delete after 1 min

                    } else {
                        logger.info(err);
                    }
                });            
                
                bot.deleteMessage({
                    channelID: channelID,
                    messageID: evt.d.id,
                }, function(error, response) {
                    if (!error) {
                        logger.info(getLogTime()+': help msg auto deleted');
                    }
                });                
                
            break;
         }
     }
});

/*//////////////////////////////////////////////// REACTIONS  //////////////////////////////////////////////*/

bot.on('messageReactionAdd', function(reaction) {
    
    var msginfo = reaction.d;
    var userid = msginfo['user_id'];   
    //logger.info(getLogTime()+JSON.stringify(reaction));
    
    var msgid = msginfo['message_id'];
    var channelid = msginfo['channel_id'];
    //logger.info('User is: '+userid+' - '+msgid);
    
    if (msgid!='' && (userid != bot.id)) {
        
        var serverid = bot.channels[channelid].guild_id;
        //logger.info(getLogTime());

        bot.getMessage({
            channelID: channelid,
            messageID: msgid
        }, function(error, message) {
            if (!error && (message['author'].id == bot.id)) {
                //logger.info(getLogTime()+': log: '+JSON.stringify(message, null, 4));
                //logger.info(getLogTime()+': log: '+message['author'].id);
                var orgembed = message['embeds'];

                for(var j = 0; j < orgembed.length; j++) {
                    if (orgembed[j]['url']!=null) var orgurl = orgembed[j]['url'];
                    var orgtitle = orgembed[j]['title'];
                    var orgeditcode = orgembed[j]['footer']['text'];
                    var orgthumb = orgembed[j]['thumbnail']['url'];
                    var orgraidtitle = orgembed[j]['author']['name'];
                    if (orgembed[j]['description']!=null) var orginfo = orgembed[j]['description'];
                    if (orgembed[j]['image']!=null) var orgmap = orgembed[j]['image']['url'];
                    // all participants
                    var orgstarttime = orgembed[j]['fields'][0]['value'];
                    var orgstarter = orgembed[j]['fields'][1]['value'].substr(1).slice(0, -1);
                    var orgparticipants = orgembed[j]['fields'][2]['value'].substr(1).slice(0, -1);                    
                    var username = bot.servers[serverid].members[userid].username;
                    
                    if ((orgparticipants.indexOf(username) == -1) && (username != orgstarter)){
                        orgparticipants = orgparticipants+'\n'+username;
                        
                        // only sent if it's not the creator
                        editMsg(channelid, msgid, orginfo, orgraidtitle, orgurl, orgthumb, orgstarttime, 
                                '`'+orgstarter+'`', '`'+orgparticipants+'`', orgmap, orgthumb, orgeditcode, orgtitle);
                        logger.info(getLogTime()+': participant added: '+username+' to: '+msgid);
						
						// add reaction to db file
						db.run("INSERT INTO raid_participants(discord_id,messageid) VALUES('"+userid+"','"+msgid+"')", (err, row) => {
							if (err){
								throw err;
							} else {
								logger.info(getLogTime()+': reaction toegevoegd aan database.');
							}
						});
						
						// send pm's						
						/* db.all("SELECT discord_id FROM raid_participants WHERE messageid = "+msgid+"", [], (err, rows) => {
							if (err) {
								throw err;
							} else {
								rows.forEach((row) => {							

									bot.sendMessage({
										to: row.discord_id,
										message: 'Er heeft iemand een duimpje gezet bij een raid waar jij naartoe gaat.'
									}, function(err, res) {
										if (!err) {
											logger.info(getLogTime()+': pm sent to users');
										} else {
											logger.info(err);
										}
									});								

								});
							}
						});	*/			
						
                    }
					
                }
            }
        });
        
    }
    
});


bot.on('messageReactionRemove', function(reaction) {    
    var msginfo = reaction.d;
    var userid = msginfo['user_id'];   
    //logger.info(getLogTime()+' stap 1');
    
    var msgid = msginfo['message_id'];
    var channelid = msginfo['channel_id'];
    
    if (msgid!='' && (userid != bot.id)) {
        
        var serverid = bot.channels[channelid].guild_id;
        //logger.info(getLogTime()+' stap 2');

        bot.getMessage({
            channelID: channelid,
            messageID: msgid
        }, function(error, message) {
            if (!error && (message['author'].id == bot.id)) {
                //logger.info(getLogTime()+' stap 3');
                //logger.info(getLogTime()+': log: '+JSON.stringify(message, null, 4));
                var orgembed = message['embeds'];

                for(var j = 0; j < orgembed.length; j++) {
                    if (orgembed[j]['url']!=null) var orgurl = orgembed[j]['url'];
                    var orgtitle = orgembed[j]['title'];
                    var orgeditcode = orgembed[j]['footer']['text'];
                    var orgthumb = orgembed[j]['thumbnail']['url'];
                    var orgraidtitle = orgembed[j]['author']['name'];
                    if (orgembed[j]['description']!=null) var orginfo = orgembed[j]['description'];
                    if (orgembed[j]['image']!=null) var orgmap = orgembed[j]['image']['url'];
                    // all participants
                    var orgstarttime = orgembed[j]['fields'][0]['value'];
                    var orgstarter = orgembed[j]['fields'][1]['value'].substr(1).slice(0, -1);
                    var orgparticipants = orgembed[j]['fields'][2]['value'];                    
                    var username = bot.servers[serverid].members[userid].username;                    
                    
                    if ((orgparticipants.indexOf(username) != -1) && (username != orgstarter)){
                        orgparticipants = orgparticipants.replace('\n'+username, '');                       
                        // only sent if it's not the creator
                        editMsg(channelid, msgid, orginfo, orgraidtitle, orgurl, orgthumb, orgstarttime, 
                                '`'+orgstarter+'`', orgparticipants, orgmap, orgthumb, orgeditcode, orgtitle);
                        logger.info(getLogTime()+': participant removed: '+username+' to: '+msgid);						
											
						// remove reaction to db file
						db.run("DELETE FROM raid_participants WHERE discord_id = '"+userid+"' AND messageid = "+msgid+"", (err, row) => {
							if (err){
								throw err;
							} else {
								logger.info(getLogTime()+': reaction verwijderd van database.');
							}
						});
						
                    }
                }
            }
        });
        
    }
});

/*//////////////////////////////////////////////// FUNCTIONS  //////////////////////////////////////////////*/


function editMsg(channelid, msgid, orginfo, orgraidtitle, orgurl, orgthumb, starttime, 
                  orgstarter, orgparticipants, orgmap, orgthumb, orgeditcode, orgtitle) {
    
    var lines = orgparticipants.split(/\r|\r\n|\n/);
    var countlines = lines.length;
    
    var participantsininfo = orginfo.charAt((orginfo.indexOf('+')+1));
    countlines = Number(countlines) + Number(participantsininfo);
    
    var totalparticipants = countParticipants(orgparticipants, orginfo);
    
    bot.editMessage({
        channelID: channelid,
        messageID: msgid,
        embed: {
            color: 14417972,
            description: orginfo,
            author: {
              name: orgraidtitle,
              url: orgurl,
              icon_url: orgthumb
            },
            fields: [
                {
                    name: 'Starttijd',
                    value: starttime
                },
                {
                    name: 'Gestart door',
                    value: orgstarter
                },
                {
                    name: 'Deelnemers ('+totalparticipants+')',
                    value: orgparticipants.trim()
                }
            ],
            image: {
              url: orgmap
            },
            thumbnail: {
              url: orgthumb
            },
            footer: {
                text: orgeditcode
            },
            title: orgtitle,
            url: orgurl
        }
    }, function(err, res) {
        if (err) {
            logger.info(err);
        }
    });
}

function countParticipants(orgparticipants, orginfo) {
    var lines = orgparticipants.split(/\r|\r\n|\n/);
    var countlines = lines.length;
    
    var infocount = '0';
    if (isNumeric(orginfo.charAt((orginfo.indexOf('+')+1)))) {
        infocount = orginfo.charAt((orginfo.indexOf('+')+1));
    }

    countlines = Number(countlines) + Number(infocount);
    return countlines;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function genEditCode() {
    var text = "";
    var possible = "0123456789";

    for (var i = 0; i < 4; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function searchList(what, find, returncol){
    for(var i= 0, L= what.length; i<L; i++){
        if(what[i][0].toLowerCase() === find.toLowerCase()) {
            return what[i][returncol];
        }
    }
}

function getLogTime(){
    var currentdate = new Date(); 
    var datetime = (currentdate.getMonth()+1) + "/"
            + currentdate.getDate() + "/"
            + currentdate.getFullYear() + " "  
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":" 
            + currentdate.getSeconds();
	return datetime;
}

function getGymLocation(what, find){
    for(var i= 0, L= what.length; i<L; i++){
        if(what[i][0].toLowerCase() === find.toLowerCase()) {
            return what[i][1]+','+what[i][2];
        }
    }
}

function locationName(msg) {
    var start_pos = msg.indexOf('%') + 1;
    var end_pos = msg.indexOf('%',start_pos);
    var text_to_get = msg.substring(start_pos,end_pos)
    return text_to_get.trim();
}

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

function getIdByCheckcode(response, editcode, user, channelID, botid, hasAdmin) {
    $string = false;
    
    for (var i in response) {
        var chaine = response[i]['embeds'];
        var msgid = response[i]['id'];
        var author = response[i]['author']['id'];
        
        //logger.info(getLogTime()+' bot en author gelijk? '+author+' - '+botid);
        
        if (isEmpty(chaine)==false && author==botid) {
            
            for(var j = 0; j < chaine.length; j++) {
                //logger.info(getLogTime()+JSON.stringify(chaine[j]['fields']));
                var author = chaine[j]['fields'][1]['value'].substr(1).slice(0, -1);
                //logger.info(getLogTime()+' edit en author gelijk? '+author+' - '+user);                
                var footertext = chaine[j]['footer']['text'];
                if (author == user || hasAdmin) {                    
                    if (footertext.indexOf(editcode) >= 0){
                        $string = msgid;
                    }
                }
            }
        }
    }
    return $string;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}