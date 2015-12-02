var csv = require('csv');

var request = require('request');

var sys = require('sys')
var exec = require('child_process').exec;

var moment = require("moment");

var xpath = require('xpath');
var parse5 = require('parse5');
var xmlser = require('xmlserializer');
var dom = require('xmldom').DOMParser;


var PROJECTS = [
    'iot.smarthome',
    //    'iot.mihini',
    'iot.paho',
    'iot.eclipsescada',
    'iot.ponte',
    'iot.concierge',
    'iot.mosquitto',
    'iot.kura',
    'iot.krikkit',
    'iot.om2m',
    'iot.californium',
    'iot.wakaama',
    'iot.moquette',
    'iot.leshan',
    'iot.risev2g',
    'iot.4diac',
    'iot.vorto',
    'iot.paho.incubator'
]

var DATES = []

var m = moment("2012-01-31");
var beginningOfCurrentMonth = moment().startOf('month')

while (m.isBefore(beginningOfCurrentMonth)) {
    DATES.push(m.format('YYYY-MM-DD'));
    m.add(1, 'month').endOf('month');
}

function computeMailingListsStats(mailmanList) {
    var mailing_lists = {};
    var idx = 0;

    var parser = new parse5.Parser();
    mailmanList = mailmanList.replace(/<Mailman\.htmlformat\.Italic instance at 0x.+>/g, "")
    var doc = parser.parse(mailmanList)
    var xhtml = xmlser.serializeToString(doc);
    doc = new dom().parseFromString(xhtml);

    var select = xpath.useNamespaces({
        "x": "http://www.w3.org/1999/xhtml"
    });

    for (var i in PROJECTS) {
        var p = PROJECTS[i];

        console.log('Requesting info for ' + p);

        request({
            url: 'https://projects.eclipse.org/json/project/' + p,
            json: true
        }, function(error, response, result) {
            if (!error && response.statusCode == 200) {
                for (var project in result.projects) {

                    var nodes = select("//x:tr/x:td//x:strong[text() = '" + result.projects[project].dev_list.name + "']/text()/ancestor::x:tr/x:td[2]/text()" , doc);
                    console.log(nodes[0].nodeValue);

                    mailing_lists[project] = nodes[0].nodeValue.match(/\d+/)[0]

                }

                console.log(mailing_lists);
            }
        });

    }
}


request({
    url: 'https://dev.eclipse.org/mailman/listinfo'
}, function(error, response, result) {
    computeMailingListsStats(result);
});