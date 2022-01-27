var activeInteractions = {};
window.Framework = {
  config: {
    name: "MoreYeahsSNC",
    clientIds: {
      "mypurecloud.com": "1740fd1b-6f43-407f-8e00-774277045da9",
      "mypurecloud.ie": "1740fd1b-6f43-407f-8e00-774277045da9",
      "mypurecloud.com.au": "1740fd1b-6f43-407f-8e00-774277045da9",
      "mypurecloud.jp": "1740fd1b-6f43-407f-8e00-774277045da9",
      "mypurecloud.de": "1740fd1b-6f43-407f-8e00-774277045da9",
      "apne2.pure.cloud": "1740fd1b-6f43-407f-8e00-774277045da9",
      "euw2.pure.cloud ": "1740fd1b-6f43-407f-8e00-774277045da9",
      "cac1.pure.cloud": "1740fd1b-6f43-407f-8e00-774277045da9",
      "usw2.pure.cloud": "1740fd1b-6f43-407f-8e00-774277045da9",
      "aps1.pure.cloud": "1740fd1b-6f43-407f-8e00-774277045da9"
    },
    customInteractionAttributes: ['my_emailaddress'],
	//customInteractionAttributes.my_emailaddress,
    settings: {
      embedWebRTCByDefault: true,
      hideWebRTCPopUpOption: false,
      enableCallLogs: true,
      enableTransferContext: true,
      hideCallLogSubject: true,
      hideCallLogContact: false,
      hideCallLogRelation: false,
      searchTargets: ["people", "queues", "frameworkcontacts"],
      theme: {
        primary: "#d4cebd",
        text: "#123",
      },
    },
  },

  initialSetup: function () {
    window.PureCloud.subscribe([
      {
        type: "Interaction",
        callback: function (category, interaction) {
          window.parent.postMessage(
            JSON.stringify({
              type: "interactionSubscription",
              data: { category: category, interaction: interaction },
            }),
            "*"
          );
        },
      },
      {
        type: "UserAction",
        callback: function (category, data) {
          window.parent.postMessage(
            JSON.stringify({
              type: "userActionSubscription",
              data: { category: category, data: data },
            }),
            "*"
          );
        },
      },
      {
        type: "Notification",
        callback: function (category, data) {
          window.parent.postMessage(
            JSON.stringify({
              type: "notificationSubscription",
              data: { category: category, data: data },
            }),
            "*"
          );
        },
      },
    ]);

    window.addEventListener("message", function (event) {
      try {
        var message = JSON.parse(event.data);
        if (message) {
          if (message.type == "clickToDial") {
            window.PureCloud.clickToDial(message.data);
          } else if (message.type == "addAssociation") {   
            window.PureCloud.addAssociation(message.data);
          } else if (message.type == "processSuccess") {
            processSuccess(message.data);
          }
        }
      } catch {
        //ignore if you can not parse the payload into JSON
      }
    });
  },

  screenPop: function (searchString, interaction) {
    window.parent.postMessage(
      JSON.stringify({
        type: "screenPop",
        data: { searchString: searchString, interactionId: interaction },
      }),
      "*"
    );
  },
  processCallLog: function (
    callLog,
    interaction,
    eventName,
    onSuccess,
    onFailure
  ) {

   
    window.parent.postMessage(
      JSON.stringify({
        type: "processCallLog",
        data: {
          callLog: callLog,
          interactionId: interaction,
          eventName: eventName,
        },
      }),
      "*"
    );

    var interactionId = interaction.id;
    if (activeInteractions[interactionId] === undefined) {
      activeInteractions[interactionId] = {
        onSuccess: onSuccess,
        onFailure: onFailure,
      };
    }
  },

  openCallLog: function (callLog, interaction) {
    window.parent.postMessage(
      JSON.stringify({
        type: "openCallLog",
        data: { callLog: callLog, interaction: interaction },
      }),
      "*"
    );
  },
};

function processSuccess(data) {

  if (activeInteractions[data.interactionId]) {
    if (data.phoneCallId) {
      activeInteractions[data.interactionId].onSuccess({
        id: data.phoneCallId,
      });
    } else {
      activeInteractions[data.interactionId].onFailure();
    }
  }
}
