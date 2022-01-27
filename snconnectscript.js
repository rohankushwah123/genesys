document.addEventListener("DOMContentLoaded", function () {
  var recordSysId,
    getWrapUpValue,
    getStartTime,
    splittimefromdatetime = "",
    interactionId = "",
    instanceOrigin = "",
    config = {},
    interactionRecordId,
    contactData = null,
    caseRecordData = null,
    loginUser = null,
    callInteraction = null,
    chatInteraction = null,
    searchNumber = null,
    searchChatName = null,
    liveChat = [],
    liveChatWrapUp = [],
    liveChatRecordId = "",
    deallocate = "deallocate",
    associationRecordId = "",
    caseInteractionId,
    contactInteractionId,
    chatBody = null,
    emailInteraction = false,
    emailAttribute = "",
    chatFlag = false,
    interactionLogId,
    interactionObject = [],
    interactionRecord,
    recrodFlag = false,
    activeTab;

  window.addEventListener("beforeunload", removeAllSessionAndRelatedTabs());
  
  function removeAllSessionAndRelatedTabs() {
    var chatId = localStorage.setItem("liveChat", []);
  }

  const vis = (c) => {
    let self = this;
    const browserProps = {
      hidden: "visibilitychange",
      msHidden: "msvisibilitychange",
      webkitHidden: "webkitvisibilitychange",
      mozHidden: "mozvisibilitychange",
    };
    for (item in browserProps) {
      if (item in document) {
        eventKey = browserProps[item];
        break;
      }
    }

    if (c) {
      if (!self._init && !(typeof document.addEventListener === "undefined")) {
        document.addEventListener(eventKey, c);
        self._init = true;
        c();
      }
    }
    return !document[item];
  };

  vis(() => {
    let tabVisibility = vis()
      ? "active"
      : setTimeout(() => {
          "nonActive";
        }, 1500);
    activeTab = tabVisibility;
  });

  function getOrigin() {
    var CrmOrigin = "";
    if (
      location.ancestorOrigins != null &&
      (location.ancestorOrigins != undefined) &
        (location.ancestorOrigins[0] != undefined)
    ) {
      CrmOrigin = location.ancestorOrigins[0];
    } else {
      var filtered = document.referrer.split("/").filter(function (el) {
        return el != null && el != "";
      });
      CrmOrigin = filtered[0] + "//" + filtered[1];
    }
    return CrmOrigin;
  }

  instanceOrigin = getOrigin();

  localStorage.setItem("origin", instanceOrigin);

  function startTimeCall(getTime) {
    if (getTime != "" && getTime != undefined) {
      getStartTime = new Date(getTime).toLocaleString(undefined, {
        timeZone: "Asia/Kolkata",
      });

      var getsplitstartTime = getStartTime.split(",");
      var splitdatefromdatetime = getsplitstartTime[0]; // 3/17/2021
      splittimefromdatetime = getsplitstartTime[1]; // 6:17:31 PM
      var splitTimebycolon = splittimefromdatetime.split(":");
      var splitTimebyspace = splitTimebycolon[2].split(" "); // Separate seconds & PM
      var hoursvsminuteformat =
        '"' +
        splitTimebycolon[0] +
        ":" +
        splitTimebycolon[1] +
        " " +
        splitTimebyspace[1] +
        '"'; // "12:20 PM "

      function getTwentyFourHourTime(amPmString1) {
        var d1 = new Date("1/1/2013 " + amPmString1);
        return d1.getHours() + ":" + d1.getMinutes();
      }
      var timeresult = getTwentyFourHourTime(hoursvsminuteformat);

      var datesplit = splitdatefromdatetime.split("/");
      var changedateformat =
        datesplit[2] + "-" + datesplit[0] + "-" + datesplit[1];
      var final1 =
        changedateformat + " " + timeresult + ":" + splitTimebyspace[0];
      return final1;
    }
  }

  function secondsConvert(GetSecond) {
    hours = Math.floor(GetSecond / 3600);
    minutes = Math.floor((GetSecond - hours * 3600) / 60);
    seconds = GetSecond - hours * 3600 - minutes * 60;
    time =
      hours.toString().padStart(2, "0") +
      ":" +
      minutes.toString().padStart(2, "0") +
      ":" +
      seconds.toString().padStart(2, "0");
    return time;
  }

  function fetchRecord(id, recordType) {
    var requestBody = "";
    var client = new XMLHttpRequest();
    var origin = instanceOrigin;

    if (recordType == "chat") {
      client.open(
        "get",
        `${origin}/api/now/table/u_my_chat_log?sysparm_query=u_interaction_id%3D${id}&sysparm_limit=1`
      );
    }

    if (recordType == "call") {
      client.open(
        "get",
        `${origin}/api/now/table/u_my_calling_log?sysparm_query=u_interaction_id%3D${id}&sysparm_limit=1`
      );
    }

    if (recordType == "email") {
      client.open(
        "get",
        `${origin}/api/now/table/u_my_email_log?sysparm_query=u_interaction_id%3D${id}&sysparm_limit=1`
      );
    }

    client.setRequestHeader("Accept", "application/json");
    client.setRequestHeader("Content-Type", "application/json");

    //Eg. UserName="admin", Password="admin" for this code sample.
    client.setRequestHeader(
      "Authorization",
      "Basic " + btoa("sngenesysclouduser" + ":" + "/7${AnbDfLy^hE(5")
    );

    client.onreadystatechange = function () {
      if (this.readyState == this.DONE) {
        var recordResponse; 
        if (isJSON(this.response)) {
          recordResponse = JSON.parse(this.response);
        } else {
          return;
        }
    
       if (recordResponse.length != 0) {
          recrodFlag = false;
        } else {
          recrodFlag = true;
        }
      }
    };
    client.send(requestBody);
  }

  function checkrecord(number, recordType) {
    var requestBody = "";
    var client = new XMLHttpRequest();

    var origin = instanceOrigin;

    var contactName = number.replace(/\s+/g, "%20");

    if (recordType == "call") {
      var createUrl = `${origin}/api/now/table/customer_contact?sysparm_query=phoneLIKE${number}%5EORmobile_phoneLIKE${number}&sysparm_fields=mobile_phone%2Cphone&sysparm_limit=10`;
      client.open("get", createUrl);
    } else {
      /* 
	  if (recordType == "chat")
      {
        var createUrl = `${origin}/api/now/table/customer_contact?sysparm_query=name%3D${contactName}&sysparm_fields=sys_id&sysparm_limit=1`
        client.open("get", createUrl);
      } else {
		*/

      var email = number.toLowerCase();
      var createUrl = `${origin}/api/now/table/customer_contact?sysparm_query=email%3D${email}&sysparm_fields=sys_id&sysparm_limit=1`;
      client.open("get", createUrl);
      // }
    }

    client.setRequestHeader("Accept", "application/json");
    client.setRequestHeader("Content-Type", "application/json");
    client.setRequestHeader(
      "Authorization",
      "Basic " + btoa("sngenesysclouduser" + ":" + "/7${AnbDfLy^hE(5")
    );
    client.onreadystatechange = function () {
      if (this.readyState == this.DONE) {
        var parseResponse = JSON.parse(this.response);
        var response = parseResponse.result[0];
        if (response != undefined) {
          associationRecordId = response.sys_id;
        }

        if (response != undefined) {
          if (recordType == "call") {
            incomingCall(number, "", "searchNumber");
          } else {
            if (recordType == "chat") {
              var email = number.toLowerCase();
              incomingCall(email, searchChatName, "searchChatName");
            } else {
              if (recordType == "email") {
                var email = number.toLowerCase();
                incomingCall(email, "", "searchEmail");
              }
            }
          }
        }
        if (response == undefined) {
          if (interactionRecord == contactInteractionId) {
          } else {
            if (recordType == "call") {
              //	var sign = "+";
              //number = sign.concat(number);
              var link = `${origin}/nav_to.do?uri=%2Fcustomer_contact.do%3Fsys_id%3D-1%26sys_is_list%3Dtrue%26sys_target%3Dcustomer_contact%26sysparm_checked_items%3D%26sysparm_fixed_query%3D%26sysparm_group_sort%3D%26sysparm_list_css%3D%26sysparm_query%3Dmobile_phone%3D${number}%255Ephone%253D${number}%26sysparm_referring_url%3Dcustomer_contact_list.do%253fsysparm_view%253dcase%26sysparm_target%3D%26sysparm_view%3Dcase`;
              window.open(link);
            } else {
              var email = number.toLowerCase();
              var link = `${origin}/nav_to.do?uri=%2Fcustomer_contact.do%3Fsys_id%3D-1%26sys_is_list%3Dtrue%26sys_target%3Dcustomer_contact%26sysparm_checked_items%3D%26sysparm_fixed_query%3D%26sysparm_group_sort%3D%26sysparm_list_css%3D%26sysparm_query%3Demail%3D${email}%255Efirst_name%253D${searchChatName}%26sysparm_referring_url%3Dcustomer_contact_list.do%253fsysparm_view%253dcase%26sysparm_target%3D%26sysparm_view%3Dcase`;
              window.open(link);
              interactionRecord = contactInteractionId;
            }
          }

          /*
		incomingCall("", "", "openEmptyRecord");
			
			//If record is not found then record will be created 
          var body = {}
          if ((searchNumber != "" && searchNumber != undefined) && (emailInteraction != true) ) {
          var phoneNumber = "+" + number;
          var mobileNumber = "+" + number;

          body =  {
            mobile_phone : phoneNumber,
            phone : mobileNumber
          }
          }
           else {
			   
			   var email = number.toLowerCase(); 
				body =  {
				name : searchChatName,
				email : email
				}
		/*		
            if ((searchChatName != undefined) && (emailInteraction != true))
            {
              body =  {
               name : number,
              }
            } else {
			var email = number.toLowerCase(); 
				body =  {
				name : searchChatName,
				email : email
				}
			}
			*/
          /*        
		}


          var requestBody = JSON.stringify(body);
          var client = new XMLHttpRequest();
          var origin = instanceOrigin;
          var url = `${origin}/api/now/table/customer_contact?sysparm_fields=sys_id`;

          window.onload = client.open("post", url);
          client.setRequestHeader("Accept", "application/json");
          client.setRequestHeader("Content-Type", "application/json");
          client.setRequestHeader('Authorization', 'Basic '+btoa('sngenesysclouduser'+':'+'/7${AnbDfLy^hE(5'));

          client.onreadystatechange = function () {

            if (this.readyState == this.DONE) {
              var parseResponse = JSON.parse(this.response);
              var response = parseResponse.result[0];
              if(response != undefined) {
                associationRecordId = response.sys_id;
              }

              if (recordType == "call") {
                incomingCall(number, "", "searchNumber");
              }
               else {
                if (recordType == "chat")
                {
                  var email = number.toLowerCase()
				  incomingCall(email, searchChatName, "searchChatName");
                }
				else {
				if (recordType == "email")
                {
                  incomingCall(number, "", "searchEmail");
                }}
              }

            }
          };
          client.send(requestBody);
         /*
		 if (searchNumber != "" && searchNumber != undefined) {
            incomingCall(number, "", "searchNumber");
          }
           else {
            if (searchChatName != undefined)
            {
              incomingCall(number, "", "searchChatName");
            }
          }
		  */

          // End here
        }
      }
    };
    client.send(requestBody);
  }

  function createCallRecord(body) {
    var requestBody = JSON.stringify(body);
    
    var chatId = localStorage.getItem("liveChat");
    var createLogFlag = true;
    if (chatId != null && chatId != "") {
      liveChat = JSON.parse(chatId);

      liveChat.map((data) => {
        if (data.interactionId == body.u_interaction_id) {
          createLogFlag = false;
        }
      });
    } else {
      liveChat = [];
    }

    var client = new XMLHttpRequest();
    var origin = instanceOrigin;

    if (createLogFlag == true && recrodFlag == false) {
      if (callInteraction != undefined && emailInteraction != true) {
        var url = `${origin}/api/now/table/u_my_calling_log`;
        client.open("post", url);
      } else {
        if (
          chatInteraction == true &&
          emailInteraction != true &&
          createLogFlag == true
        ) {
          var url = `${origin}/api/now/table/u_my_chat_log`;
          client.open("post", url);
     
        } else {
          if (emailInteraction == true) {
            var url = `${origin}/api/now/table/u_my_email_log`;
            client.open("post", url);
          }
        }
      }

      client.setRequestHeader("Accept", "application/json");
      client.setRequestHeader("Content-Type", "application/json");

      client.setRequestHeader(
        "Authorization",
        "Basic " + btoa("sngenesysclouduser" + ":" + "/7${AnbDfLy^hE(5")
      );

      client.onreadystatechange = function () {
        if (this.readyState == this.DONE) {
          var Sysidobj = JSON.parse(this.response);
         
          recordSysId = Sysidobj.result.sys_id;
          //	interactionLogId = Sysidobj.result.sys_id;

          localStorage.setItem("interactionLogId", recordSysId);
          var interactionType = localStorage.getItem("interactionType");
     
          liveChat.push({
            sysId: recordSysId,
            interactionId: body.u_interaction_id,
            name: searchChatName,
            interactionType: interactionType,
          });
          localStorage.setItem("liveChat", JSON.stringify(liveChat));
          chatBody = liveChat;

          sendProcessSuccess(body.u_interaction_id, recordSysId);
        }
      };
      client.send(requestBody);
      chatFlag = false;
    }
  }

  function updateCallRecord(body, record_id, u_interaction_id, eventName) {
    var interactionType = localStorage.getItem("interactionType");
    var requestBody = JSON.stringify(body);
 
    var client = new XMLHttpRequest();
    var origin = instanceOrigin;
 
    if (
      (callInteraction != undefined || interactionType == "call") &&
      emailInteraction != true
    ) {
      client.open(
        "put",
        `${origin}/api/now/table/u_my_calling_log/${record_id}`
      );
    } else {
      if (chatInteraction == true || interactionType == "chat") {
        client.open(
          "put",
          `${origin}/api/now/table/u_my_chat_log/${record_id}`
        );
      } else {
        if (emailInteraction == true || interactionType == "email") {
          client.open(
            "put",
            `${origin}/api/now/table/u_my_email_log/${record_id}`
          );
        }
      }
    }

    client.setRequestHeader("Accept", "application/json");
    client.setRequestHeader("Content-Type", "application/json");
    client.setRequestHeader(
      "Authorization",
      "Basic " + btoa("sngenesysclouduser" + ":" + "/7${AnbDfLy^hE(5")
    );

    client.onreadystatechange = function () {
      if (this.readyState == this.DONE) {
        if (this.response != null && this.response != "") {
          var response = JSON.parse(this.response);
        }

        sendProcessSuccess(u_interaction_id, record_id);
        if (eventName == "openCallLog" || eventName == "wrapUp") {
          openCallLog(record_id);
        }
      }
    };
    client.send(requestBody);
  }

  // openFrameAPI.init(config, initSuccess, initFailure);
  function initSuccess(snConfig) {
    try {
      openFrameAPI.subscribe(
        openFrameAPI.EVENTS.COMMUNICATION_EVENT,
        handleCommunictionEvent
      );

      openFrameAPI.subscribe(
        openFrameAPI.EVENTS.HEADER_ICON_CLICKED,
        handleHeaderIconClick
      );
    } catch (ex) {
      console.log(ex);
    }
  }

  function initFailure(snConfig) {
    // openFrameAPI.log(openFrameAPI.LOG_LEVELS.ERROR, "OpenFrame init failed..");
  }

  function handleCommunicationEvent(context) {
    if (context.type == "OUTGOING_CALL") {
      openFrameAPI.show();

      var phoneNo = context.data.phoneNumber;
      openFrameAPI.setTitle("Outgoing");
      openFrameAPI.setSubtitle(phoneNo);

      var iconList = [
        {
          imageURL: "/images/com.sn_open_frame/mute.png",
          imageTitle: "mute",
          id: 100,
        },
      ];
      openFrameAPI.setIcons(iconList);

      getElement("message").innerHTML =
        "Implementation for outgoing call goes here....";

      var el = getElement("contact_link");
      el.setAttribute("data-id", context.data.caller[0].name_sys_id);
      el.innerHTML = context.data.caller[0].name;
      getElement("contact_id").style.display = "block";

      el = getElement("account_link");
      el.setAttribute("data-id", context.data.caller[0].company_sys_id);
      el.innerHTML = context.data.caller[0].company;
      getElement("account_id").style.display = "block";

      var el = getElement("case_link");
      el.setAttribute("data-id", context.data.cases[0].case_id);
      el.innerHTML = context.data.cases[0].case_number;
      getElement("case_id").style.display = "block";
    }
  }
  function handleHeaderIconClick(context) {
    if (context.id == 100) {
      var iconList = [
        {
          imageURL: "/images/com.sn_open_frame/mute_active.png",
          imageTitle: "unmute",
          id: 110,
        },
      ];
      openFrameAPI.setIcons(iconList);
    } else if (context.id == 110) {
      var iconList = [
        {
          imageURL: "/images/com.sn_open_frame/mute.png",
          imageTitle: "mute",
          id: 100,
        },
      ];
      openFrameAPI.setIcons(iconList);
    }
  }

  function incomingCall(callerId, caseNumber, caseType) {
    if (caseType == "openRecordList") {
      var contactListUrl = "https://dev116323.service-now.com/navpage.do";
      window.open(contactListUrl, "_self");
    }

    if (caseType == "opencontactlist") {
      var home = "%2Fhome.do";
      //	openFrameAPI.openCustomURL(home);
      //var contactListUrl = 'https://dev116323.service-now.com/navpage.do';
      //window.open(contactListUrl,"_self")
      //window.close();
    }
    if (caseType == "searchNumber") {
      openFrameAPI.setSubtitle(callerId);
      openFrameAPI.setTitle("Calling");

      //   var number = "%2B" + callerId;
      //"customer_contact.do%3Fsysparm_query%3Dmobile_phone%253D"12053786717

      var number = callerId;

      /*
	openFrameAPI.openCustomURL(
        "customer_contact.do?sysparm_query=phone=" +
          number +
          "&sysparm_view=case"
      ); */
      openFrameAPI.openCustomURL(
        "customer_contact.do?sysparm_query=mobile_phone=" +
          number +
          "&sysparm_view=case"
      );
    }

    if (caseType == "searchEmail") {
      openFrameAPI.setSubtitle(callerId);
      openFrameAPI.setTitle("Email");

      var number = "%2B" + callerId;
      openFrameAPI.openCustomURL(
        "customer_contact.do?sysparm_query=email=" +
          callerId +
          "&sysparm_view=case"
      );
    }

    if (caseType == "searchChatName") {
      openFrameAPI.setTitle("Chating");
      openFrameAPI.setSubtitle(caseNumber);
      var number = "%2B" + callerId;
      openFrameAPI.openCustomURL(
        "customer_contact.do?sysparm_query=email=" +
          callerId +
          "&sysparm_view=case"
      );
    }

    if (caseType == "callRecord") {
      var TablePath = "u_my_calling_log.do?sys_id=";
      var url = TablePath.concat(callerId);
      openFrameAPI.openCustomURL(url);
    }

    if (caseType == "chatRecord") {
      var TablePath = "u_my_chat_log.do?sys_id=";
      var url = TablePath.concat(callerId);
      openFrameAPI.openCustomURL(url);
    }

    if (caseType == "emailRecord") {
      var TablePath = "u_my_email_log.do?sys_id=";
      var url = TablePath.concat(callerId);
      openFrameAPI.openCustomURL(url);
    }

    var iconList = [
      {
        imageURL: "/images/com.sn_open_frame/mute.png",
        imageTitle: "mute",
        id: 100,
      },
    ];
    openFrameAPI.setIcons(iconList);

    if (callerId) {
      var queryDetails = {
        entity: "customer_contact",
        query: "phone=" + callerId,
      };
      if (openFrameAPI.query != undefined) {
        openFrameAPI.query(
          queryDetails,
          function (results) {
            if (results && results.length > 0) {
              var contact = results[0];
              var el = getElement("contact_link");
              el.setAttribute("data-id", contact["sys_id"].display_value);
              el.innerHTML = contact["name"].display_value;
              getElement("contact_id").style.display = "block";

              el = getElement("account_link");
              el.setAttribute("data-id", contact["account"].value);
              el.innerHTML = contact["account"].display_value;
              getElement("account_id").style.display = "block";
            } else {
            }
          },
          function (results) {}
        );
      }
    }

    if (caseNumber) {
      var queryDetails = {
        entity: "sn_customerservice_case",
        query: "number=" + caseNumber,
      };
      if (openFrameAPI.query != undefined) {
        openFrameAPI.query(
          queryDetails,
          // / query success /
          function (results) {
            if (results && results.length > 0) {
              var cs = results[0];
              //show case link
              var el = getElement("case_link");
              el.setAttribute("data-id", cs["sys_id"].display_value);
              //
              el.innerHTML = cs["number"].display_value;
              getElement("case_id").style.display = "block";
            } else {
            }
          },
          function (results) {}
        );
      }
    }
    openFrameAPI.show();
  }

  function getElement(id) {
    return document.getElementById(id);
  }

  function addAssociation(data) {
    document.getElementById("softphone").contentWindow.postMessage(
      JSON.stringify({
        type: "addAssociation",
        data: data,
      }),
      "*"
    );
  }

  function sendProcessSuccess(interaction_id, SN_record_sysid) {
    var data = {
      interactionId: interaction_id,
      phoneCallId: "PhoneCallLog|" + SN_record_sysid,
    };
    
    document.getElementById("softphone").contentWindow.postMessage(
      JSON.stringify({
        type: "processSuccess",
        data: data,
      }),
      "*"
    );
  }

  function associationData(text, id, type) {
    var text = text;
    var sys_id = id;
    var associationType = type;
    var data = {
      type: associationType,
      id: sys_id,
      text: text,
      select: true,
    };

    return data;
  }

  function contactFormAssociation(message) {
    var fullName = message.first_name + " " + message.last_name;
    var sys_id = message.sys_id;
    loginUser = message.login_user;

    if (loginUser != localStorage.getItem('loginUser')) {
    localStorage.setItem('loginUser', loginUser);
    }

    contactData = {
      type: "contact",
      id: sys_id,
      text: fullName,
      select: true,
    };
    if (
      contactInteractionId != undefined &&
      contactData != null &&
      fullName.length != 1
    ) {
      contactData.interactionId = contactInteractionId;

      addAssociation(contactData);
      if (message.email) {
        incomingCall("", "", "opencontactlist");
      }
      setTimeout(function () {
        contactData = null;
      }, 3000);
    } else {
      if (contactData != null && fullName.length != 1) {
        contactData.interactionId = localStorage.getItem(
          "contactInteractionId"
        );

        addAssociation(contactData);
        if (message.email) {
          incomingCall("", "", "opencontactlist");
        }
        setTimeout(function () {
          contactData = null;
        }, 3000);
      }
    }
  }

  function caseFormAssociation(message) {
    sys_id = message.sys_id;
    number = message.number;
    caseRecordData = {
      type: "relation",
      id: sys_id,
      text: number,
      select: true,
    };

    if (caseInteractionId != undefined) {
      caseRecordData.interactionId = caseInteractionId;

      addAssociation(caseRecordData);
      setTimeout(function () {
        caseRecordData = null;
      }, 3000);
    } else {
      caseInteractionId = localStorage.getItem("caseInteractionId");

      addAssociation(caseRecordData);
      setTimeout(function () {
        caseRecordData = null;
      }, 3000);
    }
  }

  function screenPopEvent(message) {
    searchNumber = null;
    searchChatName = null;
    emailInteraction = null;
    searchNumber = message.data.interactionId.displayAddress;
    searchChatName = message.data.interactionId.remoteName;
    contactInteractionId = message.data.interactionId.id;
    emailInteraction = message.data.interactionId.isEmail;
    var searchString = message.data.searchString;

    localStorage.setItem("contactInteractionId", contactInteractionId);
   
    var number = searchNumber.slice(1);
    if (
      number != "" &&
      number != undefined &&
      searchChatName != undefined &&
      emailInteraction != true
    ) {
      checkrecord(number, "call");
    } else {
      if (searchChatName != undefined && emailInteraction != true) {
        emailAttribute = message.data.interactionId.attributes.my_emailaddress;

        checkrecord(emailAttribute, "chat");
        var id = message.data.interactionId.id;
        var name = message.data.interactionId.name;

        var body = {
          id: associationRecordId,
          interactionId: id,
          select: true,
          text: name,
          type: "contact",
        };
        addAssociation(body);
      } else {
        checkrecord(searchString, "email");
        var id = message.data.interactionId.id;
        var name = message.data.interactionId.name;

        var body = {
          id: associationRecordId,
          interactionId: id,
          select: true,
          text: name,
          type: "contact",
        };
        addAssociation(body);
      }
    }
  }

  function callLog(data) {
    var Processobj = JSON.parse(data);

    interactionId = Processobj.data.interactionId.id;

    var eventName = Processobj.data.eventName;

    loginUser = localStorage.getItem('loginUser');

    var chatId = localStorage.getItem("liveChat");
    if (chatId != null && chatId != "") {
      liveChat = JSON.parse(chatId);
    } else {
      liveChat = [];
    }
  
    if (liveChat.length != 0) {
      liveChat.map((data) => {
        if (data.interactionId == interactionId) {
  
          if (liveChat.length > 0) {
            var addObjectFlag = false;
            liveChatWrapUp.map((element) => {
              if (element.interactionId == data.interactionId) {
                addObjectFlag = true;
              }
            });
            if (addObjectFlag == false) {
              liveChatWrapUp.push(data);

              localStorage.setItem(
                "liveChatWrapUp",
                JSON.stringify(liveChatWrapUp)
              );
            }
          } else {
            liveChatWrapUp.push(data);
            localStorage.setItem(
              "liveChatWrapUp",
              JSON.stringify(liveChatWrapUp)
            );
          }

          /*
		   liveChatWrapUp.push({
			   sysId : data.sysId,
			   interactionId : data.interactionId
		   })
		   */
          liveChatRecordId = data.sysId;
        }
      });
    }

    if (eventName.toLowerCase() == "interactiondisconnected") {
      openFrameAPI.setTitle("");
      openFrameAPI.setSubtitle("");
      var endTime = startTimeCall(Processobj.data.interactionId.endTime);
      var duration = secondsConvert(
        Processobj.data.interactionId.interactionDurationSeconds
      );

      var callDirection =
        Processobj &&
        Processobj.data &&
        Processobj.data.interactionId &&
        Processobj.data.interactionId.direction;

      if (callDirection === "Inbound") {
        var body = {
          u_duration: duration,
          u_actual_end: endTime,
          u_call_to: loginUser,
        };
        SplitbyPie = Processobj.data.callLog.id.split("|");
        // var recordId = SplitbyPie[1];

        var recordId = liveChatRecordId;
        updateCallRecord(body, recordId, interactionId, eventName);
      } else {
        var body = {
          u_duration: duration,
          u_actual_end: endTime,
          u_call_from: loginUser,
        };
        SplitbyPie = Processobj.data.callLog.id.split("|");
        // var recordId = SplitbyPie[1];
        var recordId = liveChatRecordId;
        updateCallRecord(body, recordId, interactionId, eventName);
      }
    }

    if (
      Processobj.data.callLog.id != undefined &&
      Processobj.data.callLog.id.includes("|")
    ) {
   
      SplitbyPie = Processobj.data.callLog.id.split("|");
      //  var recordId = SplitbyPie[1];
      var recordId = liveChatRecordId;
      var notesData =
        Processobj &&
        Processobj.data &&
        Processobj.data.callLog &&
        Processobj.data.callLog.notes;
      var caseData =
        Processobj &&
        Processobj.data &&
        Processobj.data.callLog &&
        Processobj.data.callLog.selectedRelation &&
        Processobj.data.callLog.selectedRelation.id;
      var caseText =
        Processobj &&
        Processobj.data &&
        Processobj.data.callLog &&
        Processobj.data.callLog.selectedRelation &&
        Processobj.data.callLog.selectedRelation.text;

      var direction =
        Processobj &&
        Processobj.data &&
        Processobj.data.interactionId &&
        Processobj.data.interactionId.direction;
      if (
        notesData != undefined ||
        (caseData != "" && caseData != undefined) ||
        caseText == "None" ||
        notesData == ""
      ) {
        if (
          notesData != "" &&
          notesData != undefined &&
          caseData != "" &&
          caseData != undefined
        ) {
          if (direction == "Inbound") {
            var body = {
              u_description: notesData,
              u_regarding: caseData,
              u_call_to: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          } else {
            var body = {
              u_description: notesData,
              u_regarding: caseData,
              u_call_from: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          }
        } else if (
          notesData != "" &&
          notesData != undefined &&
          caseText == "None"
        ) {
          if (direction == "Inbound") {
            var body = {
              u_regarding: caseText,
              u_description: notesData,
              u_call_to: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          } else {
            var body = {
              u_regarding: caseText,
              u_description: notesData,
              u_call_from: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          }
        } else if (caseText == "None") {
          if (direction == "Inbound") {
            var body = {
              u_regarding: caseText,
              u_call_to: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          } else {
            var body = {
              u_regarding: caseText,
              u_call_from: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          }
        } else if (notesData != "" && notesData != undefined) {
          if (direction == "Inbound") {
            var body = {
              u_description: notesData,
              u_call_to: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          } else {
            var body = {
              u_description: notesData,
              u_call_from: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          }
        } else if (caseData != "" && caseData != undefined) {
          if (direction == "Inbound") {
            var body = {
              u_regarding: caseData,
              u_call_to: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          } else {
            var body = {
              u_regarding: caseData,
              u_call_from: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          }
        } else if (notesData == "" && caseData != "" && caseData != undefined) {
          if (direction == "Inbound") {
            var body = {
              u_description: notesData,
              u_regarding: caseData,
              u_call_to: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          } else {
            var body = {
              u_description: notesData,
              u_regarding: caseData,
              u_call_from: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          }
        } else if (notesData == "" && caseText == "None") {
          var body = {
            u_description: notesData,
            u_regarding: caseText,
          };
          updateCallRecord(body, recordId, interactionId, eventName);
          if (direction == "Inbound") {
            var body = {
              u_description: notesData,
              u_regarding: caseText,
              u_call_to: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          } else {
            var body = {
              u_description: notesData,
              u_regarding: caseText,
              u_call_from: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          }
        } else if (notesData == "") {
          if (direction == "Inbound") {
            var body = {
              u_description: notesData,
              u_call_to: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          } else {
            var body = {
              u_description: notesData,
              u_call_from: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          }
        }
      }
    } else {
      var startTime = startTimeCall(
        Processobj.data.interactionId.connectedTime
      );

      if (activeTab == "active") {
        recrodFlag = false;
        var phoneNumber = Processobj.data.interactionId.displayAddress;
        phoneNumber = phoneNumber.replace("+", "");
        var subectData = `PhoneCall - ${startTime}`;
        var body = {
          u_called_number: Processobj.data.interactionId.calledNumber,
          u_subject: subectData,
          u_phone: phoneNumber,
          u_actual_start: startTime,
          u_direction: Processobj.data.interactionId.direction,
          u_interaction_id: Processobj.data.interactionId.id,
          u_queue_name: Processobj.data.interactionId.queueName,
          u_remote_name: Processobj.data.interactionId.remoteName,
        };

        fetchRecord(body.u_interaction_id, "call");

        createCallRecord(body);
      }
    }
  }

  function emailLog(data) {
    var Processobj = JSON.parse(data);
    interactionId = Processobj.data.interactionId.id;
    loginUser = localStorage.getItem('loginUser');

    var eventName = Processobj.data.eventName;

    var chatId = localStorage.getItem("liveChat");
    if (chatId != null && chatId != "") {
      liveChat = JSON.parse(chatId);
    } else {
      liveChat = [];
    }

  
    if (liveChat.length != 0) {
      liveChat.map((data) => {
        if (data.interactionId == interactionId) {
      
          if (liveChat.length > 0) {
            var addObjectFlag = false;
            liveChatWrapUp.map((element) => {
              if (element.interactionId == data.interactionId) {
                addObjectFlag = true;
              }
            });
            if (addObjectFlag == false) {
              liveChatWrapUp.push(data);

              localStorage.setItem(
                "liveChatWrapUp",
                JSON.stringify(liveChatWrapUp)
              );
            }
          } else {
            liveChatWrapUp.push(data);
            localStorage.setItem(
              "liveChatWrapUp",
              JSON.stringify(liveChatWrapUp)
            );
          }

          /*
		   liveChatWrapUp.push({
			   sysId : data.sysId,
			   interactionId : data.interactionId
		   })
		   */
          liveChatRecordId = data.sysId;
        }
      });
    }

 
    if (eventName.toLowerCase() == "interactiondisconnected") {
      openFrameAPI.setTitle("");
      openFrameAPI.setSubtitle("");
      var endTime = startTimeCall(Processobj.data.interactionId.endTime);
      var duration = secondsConvert(
        Processobj.data.interactionId.interactionDurationSeconds
      );

      var callDirection =
        Processobj &&
        Processobj.data &&
        Processobj.data.interactionId &&
        Processobj.data.interactionId.direction;

      if (callDirection === "Inbound") {
        var body = {
          u_duration: duration,
          u_actual_end: endTime,
          u_email_to: loginUser,
        };
        SplitbyPie = Processobj.data.callLog.id.split("|");
        //liveChatRecordId
        //var recordId = SplitbyPie[1];
        var recordId = liveChatRecordId;
        updateCallRecord(body, recordId, interactionId, eventName);
      } else {
        var body = {
          u_duration: duration,
          u_actual_end: endTime,
          u_email_from: loginUser,
        };
        SplitbyPie = Processobj.data.callLog.id.split("|");
        //  var recordId = SplitbyPie[1];
        var recordId = liveChatRecordId;
        updateCallRecord(body, recordId, interactionId, eventName);
      }
    }

    if (
      Processobj.data.callLog.id != undefined &&
      Processobj.data.callLog.id.includes("|")
    ) {
  
      SplitbyPie = Processobj.data.callLog.id.split("|");
      //  var recordId = SplitbyPie[1];
      var recordId = liveChatRecordId;
      var notesData =
        Processobj &&
        Processobj.data &&
        Processobj.data.callLog &&
        Processobj.data.callLog.notes;
      var caseData =
        Processobj &&
        Processobj.data &&
        Processobj.data.callLog &&
        Processobj.data.callLog.selectedRelation &&
        Processobj.data.callLog.selectedRelation.id;
      var caseText =
        Processobj &&
        Processobj.data &&
        Processobj.data.callLog &&
        Processobj.data.callLog.selectedRelation &&
        Processobj.data.callLog.selectedRelation.text;

      var direction =
        Processobj &&
        Processobj.data &&
        Processobj.data.interactionId &&
        Processobj.data.interactionId.direction;
      if (
        notesData != undefined ||
        (caseData != "" && caseData != undefined) ||
        caseText == "None" ||
        notesData == ""
      ) {
        if (
          notesData != "" &&
          notesData != undefined &&
          caseData != "" &&
          caseData != undefined
        ) {
          if (direction == "Inbound") {
            var body = {
              u_description: notesData,
              u_regarding: caseData,
              u_email_to: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          } else {
            var body = {
              u_description: notesData,
              u_regarding: caseData,
              u_email_from: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          }
        } else if (
          notesData != "" &&
          notesData != undefined &&
          caseText == "None"
        ) {
          if (direction == "Inbound") {
            var body = {
              u_regarding: caseText,
              u_description: notesData,
              u_email_to: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          } else {
            var body = {
              u_regarding: caseText,
              u_description: notesData,
              u_email_from: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          }
        } else if (caseText == "None") {
          if (direction == "Inbound") {
            var body = {
              u_regarding: caseText,
              u_email_to: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          } else {
            var body = {
              u_regarding: caseText,
              u_email_from: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          }
        } else if (notesData != "" && notesData != undefined) {
          if (direction == "Inbound") {
            var body = {
              u_description: notesData,
              u_email_to: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          } else {
            var body = {
              u_description: notesData,
              u_email_from: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          }
        } else if (caseData != "" && caseData != undefined) {
          if (direction == "Inbound") {
            var body = {
              u_regarding: caseData,
              u_email_to: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          } else {
            var body = {
              u_regarding: caseData,
              u_email_from: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          }
        } else if (notesData == "" && caseData != "" && caseData != undefined) {
          if (direction == "Inbound") {
            var body = {
              u_description: notesData,
              u_regarding: caseData,
              u_email_to: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          } else {
            var body = {
              u_description: notesData,
              u_regarding: caseData,
              u_email_from: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          }
        } else if (notesData == "" && caseText == "None") {
          var body = {
            u_description: notesData,
            u_regarding: caseText,
          };
          updateCallRecord(body, recordId, interactionId, eventName);
          if (direction == "Inbound") {
            var body = {
              u_description: notesData,
              u_regarding: caseText,
              u_email_to: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          } else {
            var body = {
              u_description: notesData,
              u_regarding: caseText,
              u_email_from: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          }
        } else if (notesData == "") {
          if (direction == "Inbound") {
            var body = {
              u_description: notesData,
              u_email_to: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          } else {
            var body = {
              u_description: notesData,
              u_email_from: loginUser,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
          }
        }
      }
    } else {
      var startTime = startTimeCall(
        Processobj.data.interactionId.connectedTime
      );

      if (activeTab == "active") {
        recrodFlag = false;
        var subectData = `PhoneCall - ${startTime}`;
        var body = {
          u_called_number: Processobj.data.interactionId.calledNumber,
          u_subject: subectData,
          u_phone: Processobj.data.interactionId.displayAddress,
          u_actual_start: startTime,
          u_direction: Processobj.data.interactionId.direction,
          u_interaction_id: Processobj.data.interactionId.id,
          u_queue_name: Processobj.data.interactionId.queueName,
          u_remote_name: Processobj.data.interactionId.remoteName,
          u_email_subject: Processobj.data.interactionId.emailSubject,
          u_email: Processobj.data.interactionId.displayAddress,
        };

        fetchRecord(body.u_interaction_id, "email");
        createCallRecord(body);
      }
    }
  }

  function chatLog(data) {
    var Processobj = JSON.parse(data);
    loginUser = localStorage.getItem('loginUser');

    interactionId = Processobj.data.interactionId.id;
    var endValue = Processobj.data.interactionId.endTime;
    var chatId = localStorage.getItem("liveChat");
    if (chatId != null && chatId != "") {
      liveChat = JSON.parse(chatId);
    } else {
      liveChat = [];
    }

    if (liveChat.length != 0) {
      liveChat.map((data) => {
        if (data.interactionId == interactionId) {
    
    
          liveChatRecordId = data.sysId;
        }
          });
    }

    
    var eventName = Processobj.data.eventName;

    
    if (eventName.toLowerCase() == "interactiondisconnected") {
      openFrameAPI.setTitle("");
      openFrameAPI.setSubtitle("");
      var endTime = startTimeCall(Processobj.data.interactionId.endTime);
      var duration = secondsConvert(
        Processobj.data.interactionId.interactionDurationSeconds
      );

      var callDirection =
        Processobj &&
        Processobj.data &&
        Processobj.data.interactionId &&
        Processobj.data.interactionId.direction;

      SplitbyPie = Processobj.data.callLog.id.split("|");
      var recordId;
    
    
      if (liveChatRecordId != "") {
        recordId = liveChatRecordId;
      } else {
        recordId = SplitbyPie[1];
      }
     
      if (callDirection === "Inbound") {
        var body = {
          u_duration: duration,
          u_actual_end: endTime,
          u_chat_to: loginUser,
        };
     
        updateCallRecord(body, recordId, interactionId, eventName);
      } else {
        var body = {
          u_duration: duration,
          u_actual_end: endTime,
          u_chat_from: loginUser,
        };
       
        updateCallRecord(body, recordId, interactionId, eventName);
      }
    }
    // Processobj.data.eventName != "interactionChanged" || 
    if (Processobj.data.eventName != "interactionChanged" || Processobj.data.eventName == "openCallLog") {
      if (
        (Processobj.data.callLog.id != undefined &&
          Processobj.data.callLog.id.includes("|")) ||
        liveChatRecordId != ""
      ) {
     
        SplitbyPie = Processobj.data.callLog.id.split("|");
        var recordId;
     
        if (liveChatRecordId != "") {
          recordId = liveChatRecordId;
        } else {
          recordId = SplitbyPie[1];
        }

        var notesData =
          Processobj &&
          Processobj.data &&
          Processobj.data.callLog &&
          Processobj.data.callLog.notes;
        var caseData =
          Processobj &&
          Processobj.data &&
          Processobj.data.callLog &&
          Processobj.data.callLog.selectedRelation &&
          Processobj.data.callLog.selectedRelation.id;
        var caseText =
          Processobj &&
          Processobj.data &&
          Processobj.data.callLog &&
          Processobj.data.callLog.selectedRelation &&
          Processobj.data.callLog.selectedRelation.text;

        var direction =
          Processobj &&
          Processobj.data &&
          Processobj.data.interactionId &&
          Processobj.data.interactionId.direction;
        if (
          notesData != undefined ||
          (caseData != "" && caseData != undefined) ||
          caseText == "None" ||
          notesData == ""
        ) {
          if (
            notesData != "" &&
            notesData != undefined &&
            caseData != "" &&
            caseData != undefined
          ) {
            if (direction == "Inbound") {
              var body = {
                u_description: notesData,
                u_regarding: caseData,
                u_chat_to: loginUser,
              };
              updateCallRecord(body, recordId, interactionId, eventName);
            } else {
              var body = {
                u_description: notesData,
                u_regarding: caseData,
                u_chat_from: loginUser,
              };
              updateCallRecord(body, recordId, interactionId, eventName);
            }
          } else if (
            notesData != "" &&
            notesData != undefined &&
            caseText == "None"
          ) {
            if (direction == "Inbound") {
              var body = {
                u_regarding: caseText,
                u_description: notesData,
                u_chat_to: loginUser,
              };
              updateCallRecord(body, recordId, interactionId, eventName);
            } else {
              var body = {
                u_regarding: caseText,
                u_description: notesData,
                u_chat_from: loginUser,
              };
              updateCallRecord(body, recordId, interactionId, eventName);
            }
          } else if (caseText == "None") {
            if (direction == "Inbound") {
              var body = {
                u_regarding: caseText,
                u_chat_to: loginUser,
              };
              updateCallRecord(body, recordId, interactionId, eventName);
            } else {
              var body = {
                u_regarding: caseText,
                u_chat_from: loginUser,
              };
              updateCallRecord(body, recordId, interactionId, eventName);
            }
          } else if (notesData != "" && notesData != undefined) {
            if (direction == "Inbound") {
              var body = {
                u_description: notesData,
                u_chat_to: loginUser,
              };
              updateCallRecord(body, recordId, interactionId, eventName);
            } else {
              var body = {
                u_description: notesData,
                u_chat_from: loginUser,
              };
              updateCallRecord(body, recordId, interactionId, eventName);
            }
          } else if (caseData != "" && caseData != undefined) {
            if (direction == "Inbound") {
              var body = {
                u_regarding: caseData,
                u_chat_to: loginUser,
              };
              updateCallRecord(body, recordId, interactionId, eventName);
            } else {
              var body = {
                u_regarding: caseData,
                u_chat_from: loginUser,
              };
              updateCallRecord(body, recordId, interactionId, eventName);
            }
          } else if (
            notesData == "" &&
            caseData != "" &&
            caseData != undefined
          ) {
            if (direction == "Inbound") {
              var body = {
                u_description: notesData,
                u_regarding: caseData,
                u_chat_to: loginUser,
              };
              updateCallRecord(body, recordId, interactionId, eventName);
            } else {
              var body = {
                u_description: notesData,
                u_regarding: caseData,
                u_chat_from: loginUser,
              };
              updateCallRecord(body, recordId, interactionId, eventName);
            }
          } else if (notesData == "" && caseText == "None") {
            var body = {
              u_description: notesData,
              u_regarding: caseText,
            };
            updateCallRecord(body, recordId, interactionId, eventName);
            if (direction == "Inbound") {
              var body = {
                u_description: notesData,
                u_regarding: caseText,
                u_chat_to: loginUser,
              };
              updateCallRecord(body, recordId, interactionId, eventName);
            } else {
              var body = {
                u_description: notesData,
                u_regarding: caseText,
                u_chat_from: loginUser,
              };
              updateCallRecord(body, recordId, interactionId, eventName);
            }
          } else if (notesData == "") {
            if (direction == "Inbound") {
              var body = {
                u_description: notesData,
                u_chat_to: loginUser,
              };
              updateCallRecord(body, recordId, interactionId, eventName);
            } else {
              var body = {
                u_description: notesData,
                u_chat_from: loginUser,
              };
              updateCallRecord(body, recordId, interactionId, eventName);
            }
          }
        }
      }
    }
    if (Processobj.data.eventName == "interactionChanged") {
      if (activeTab == "active") {
        var startTime = startTimeCall(
          Processobj.data.interactionId.connectedTime
        );
      
        var subectData = `PhoneCall - ${startTime}`;
        recrodFlag = false;
        var body = {
          //  u_name : Processobj.data.interactionId.name,
          u_queue_name: Processobj.data.interactionId.queueName,
          u_direction: Processobj.data.interactionId.direction,
          u_actual_start: startTime,
          u_remote_name: Processobj.data.interactionId.remoteName,
          u_subject: subectData,
          u_interaction_id: Processobj.data.interactionId.id,
          u_email: Processobj.data.interactionId.attributes.my_emailaddress,
        };

        fetchRecord(body.u_interaction_id, "chat");
        createCallRecord(body);
      }
    }
  }

  function interactionSubscription(message) {
    getWrapUpValue = message.data.interaction.disposition;
    interactionRecordId = message.data.interaction.id;
    var categorySelection = message.data.category;
    categorySelection = categorySelection.toLowerCase();
    liveChatRecordId = "";
    callInteraction = null;
    chatInteraction = null;
    emailInteraction = null;
    
    callInteraction =
      message &&
      message.data &&
      message.data.interaction &&
      message.data.interaction.calledNumber;
    chatInteraction =
      message &&
      message.data &&
      message.data.interaction &&
      message.data.interaction.isChat;
    emailInteraction =
      message &&
      message.data &&
      message.data.interaction &&
      message.data.interaction.isEmail;

    var chatId = localStorage.getItem("liveChat");
    if (chatId != null && chatId != "") {
      liveChat = JSON.parse(chatId);
    } else {
      liveChat = [];
    }

   
    if (message.data.category == "add") {
      interactionRecordId = message.data.interaction.id;
    }

    if (message.data.category == "station") {
      interactionRecordId = message.data.interaction.id;
    }

    if (message.data.category == "change") {
    }

    if (deallocate == "deallocate") {
      liveChat.map((data, index) => {
        if (data.interactionId == message.data.interaction.id) {
          liveChat = liveChat.splice(index, 1);
          localStorage.setItem("liveChat", JSON.stringify(liveChat));
        }
      });
    }

    var body = {
      u_wrap_up: getWrapUpValue,
    };

    if (getWrapUpValue != undefined) {
      liveChatWrapUp = localStorage.getItem("liveChat");
      if (liveChatWrapUp != null && liveChatWrapUp != "") {
        liveChatWrapUp = JSON.parse(liveChatWrapUp);
      } else {
        liveChatWrapUp = [];
      }

      interactionRecordId = message.data.interaction.id;
      
      if (chatBody != null) {
        chatBody.map((data) => {
          if (
            data.interactionId.toLowerCase() ==
            interactionRecordId.toLowerCase()
          ) {
            
            liveChatRecordId = data.sysId;
          }
        });
      } else {
        if (chatId != null && chatId != "") {
          liveChatWrapUp = JSON.parse(chatId);
        } else {
          liveChatWrapUp = [];
        }

        liveChatWrapUp.map((data) => {
          if (data.interactionId == interactionRecordId) {
           
            liveChatRecordId = data.sysId;
          }
       
        });
      }

      if (callInteraction != undefined) {
        updateCallRecord(body, liveChatRecordId);
       
      } else {
        if (chatInteraction == true) {
        
          interactionRecordId = message.data.interaction.id;

          updateCallRecord(body, liveChatRecordId, interactionRecordId, "");

                 } else {
          updateCallRecord(body, liveChatRecordId, interactionRecordId, "");
        }
      }
    }
  }

  function isJSON(data) {
    var ret = true;
    try {
      JSON.parse(data);
    } catch (e) {
      ret = false;
    }
    return ret;
  }

  window.addEventListener("message", function (event) {
    var message;
    if (isJSON(event.data)) {
      message = JSON.parse(event.data);
    } else {
      return;
    }

    var categorySelection = message && message.data && message.data.category;

    if (categorySelection == "interactionSelection") {
      var id = message.data.data.interactionId;
      localStorage.setItem("caseInteractionId", id);
      localStorage.setItem("contactInteractionId", id);
      caseInteractionId = id;
      contactInteractionId = id;

      if (chatInteraction == true || emailInteraction == true) {
        if (emailInteraction == true) {
          openFrameAPI.setTitle("Email");
        } else {
          openFrameAPI.setTitle("Chatting");
        }

        if (chatBody != null) {
          liveChat = chatBody;
        } else {
          var chatId = localStorage.getItem("liveChat");
          if (isJSON(chatId)) {
            liveChat = JSON.parse(chatId);
          } else {
            return;
          }
          
        }
      
        id = caseInteractionId;
        liveChat.map((element) => {
          if (element.interactionId == id) {
            localStorage.setItem("caseInteractionId", id);
            localStorage.setItem("contactInteractionId", id);
            caseInteractionId = id;
            contactInteractionId = id;
            
            openFrameAPI.setSubtitle(element.name);
          }
        });
      }
    }

    switch (message.type) {
      case "snow_name":
        try {
          var callRecordId = localStorage.getItem("interactionLogId");
          var selectedInteraction = localStorage.getItem(
            "contactInteractionId"
          );
          var interactionType;
          var chatId = localStorage.getItem("liveChat");
          if (chatId != null && chatId != "") {
            liveChat = JSON.parse(chatId);
          } else {
            liveChat = [];
          }
        
          if (liveChat.length != 0) {
            liveChat.map((data) => {
              if (data.interactionId == selectedInteraction) {
                
                localStorage.setItem("interactionLogId", data.sysId);
                localStorage.setItem(
                  "contactInteractionId",
                  data.interactionType
                );
              }
            });
          }

          contactFormAssociation(message);

          // var liveRecord = JSON.parse(chatId);
          var callType = message.callType;
          loginUser = message.login_user;
          if (callType == undefined) {
            interactionType = localStorage.getItem("contactInteractionId");

            switch (interactionType) {
              case "call":
                callRecordId = localStorage.getItem("interactionLogId");
                var body = {
                  u_call_from: message.sys_id,
                  u_call_to: loginUser,
                };
                
                localStorage.setItem("interactionType", "call");
                updateCallRecord(body, callRecordId, "", "");
                localStorage.setItem("interactionLogId", callRecordId);
                break;

              case "chat":
                callRecordId = localStorage.getItem("interactionLogId");
                var body = {
                  u_chat_from: message.sys_id,
                  u_chat_to: loginUser,
                };
                
                localStorage.setItem("interactionType", "chat");
                updateCallRecord(body, callRecordId, "", "");
                localStorage.setItem("interactionLogId", callRecordId);
                break;

              case "email":
                callRecordId = localStorage.getItem("interactionLogId");
                var body = {
                  u_email_from: message.sys_id,
                  u_email_to: loginUser,
                };
                
                localStorage.setItem("interactionType", "email");
                updateCallRecord(body, callRecordId, "", "");
                localStorage.setItem("interactionLogId", callRecordId);
                break;
            }
          }
        } catch (ex) {
          console.log(ex);
        }
        break;

      case "outGoingCall":
        try {
          var data = {
            number: message.number,
          };
          clickToDial(data);
          openFrameAPI.setTitle("Calling");
          openFrameAPI.setSubtitle(message.number);
          var fullName = message.first_name + " " + message.last_name;
          var sys_id = message.sys_id;
          contactData = associationData(fullName, sys_id, "contact");
        } catch (ex) {
          console.log(ex);
        }
        break;

      case "snow_case_number":
        try {
          caseFormAssociation(message);
        } catch (ex) {
          console.log(ex);
        }
        break;

      case "screenPop":
        try {
          screenPopEvent(message);
        } catch (ex) {
          console.log(ex);
        }
        break;

      case "processCallLog":
        try {
          var interationBody;
          callInteraction = null;
          chatInteraction = null;
          emailInteraction = null;
          interationBody = JSON.parse(event.data);

          callInteraction =
            interationBody &&
            interationBody.data &&
            interationBody.data.interactionId &&
            interationBody.data.interactionId.calledNumber;
          chatInteraction =
            interationBody &&
            interationBody.data &&
            interationBody.data.interactionId &&
            interationBody.data.interactionId.isChat;
          emailInteraction =
            interationBody &&
            interationBody.data &&
            interationBody.data.interactionId &&
            interationBody.data.interactionId.isEmail;
          
          if (callInteraction != undefined && emailInteraction != true) {
            setTimeout(callLog(event.data), 2000);
            localStorage.setItem("interactionType", "call");
          } else {
            if (chatInteraction == true) {
              setTimeout(chatLog(event.data), 2000);
              localStorage.setItem("interactionType", "chat");
            } else {
              if (emailInteraction == true) {
                setTimeout(emailLog(event.data), 2000);
                localStorage.setItem("interactionType", "email");
              }
            }
          }
        } catch (ex) {
          console.log(ex);
        }
        break;

      case "openCallLog":
        try {
          var SplitbyPie = message.data.callLog.id.split("|");
          var recordId = SplitbyPie[1];
          openCallLog(recordId);
        } catch (ex) {
          console.log(ex);
        }
        break;

      case "interactionSubscription":
        try {
          interactionSubscription(message);
        } catch (ex) {
          console.log(ex);
        }
        break;
      default:
        if (
          interactionRecordId != undefined &&
          contactData != null &&
          contactData.text.length != 1
        ) {
          contactData.interactionId = interactionRecordId;
          if (searchChatName != undefined) {
          } else {
            addAssociation(contactData);
          }
          setTimeout(function () {
            contactData = null;
          }, 3000);
        }
        break;
    }

    //}
  });
  function openCallLog(recordId) {
    if (callInteraction != undefined && emailInteraction != true) {
      incomingCall(recordId, "", "callRecord");
    } else {
      if (chatInteraction == true) {
        incomingCall(recordId, "", "chatRecord");
      } else {
        incomingCall(recordId, "", "emailRecord");
      }
    }
  }

  function clickToDial(data) {
    document.getElementById("softphone").contentWindow.postMessage(
      JSON.stringify({
        type: "clickToDial",
        data: {
          number: data.number,
          autoPlace: true,
        },
      }),
      "*"
    );
  }
});
