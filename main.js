var csv = require('csv');

var request = require('request');

var sys = require('sys')
var exec = require('child_process').exec;

var moment = require("moment");

var xpath = require('xpath');
var parse5 = require('parse5');
var xmlser = require('xmlserializer');
var dom = require('xmldom').DOMParser;

var async = require('async');


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
    'iot.paho.incubator',
    'iot.hawkbit',
//    'iot.tiaki',
    'iot.tinydtls',
    'iot.hono',
    'iot.edje',
    'iot.milo',
    'iot.whiskers',
    'iot.unide',
    'iot.kapua',
    'iot.iofog',
    'iot.ditto'
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

    async.each(PROJECTS, function(project, callback) {

        request({
            url: 'https://projects.eclipse.org/json/project/' + project,
            json: true
        }, function(error, response, result) {
            if (!error && response.statusCode == 200) {
                for (var project in result.projects) {
                    var nodes = select("//x:tr/x:td//x:strong[text() = '" + result.projects[project].dev_list.name + "']/text()/ancestor::x:tr/x:td[2]/text()", doc);
                // console.log ( project , result.projects[project].dev_list.name,  "\n");
                    mailing_lists[project] = parseInt(nodes[0].nodeValue.match(/(\d+) members?/)[1])
                }
                process.stdout.write(".");
                callback();
            }
        });

    }, function(err) {
        console.log(" DONE!");
        var sorted = [];
        for (var p in mailing_lists) {
            sorted.push([p, mailing_lists[p]])
        }
        sorted.sort(function(a, b) {
            return b[1] - a[1]
        });

        for(var i in sorted) {
            console.log(moment().format('DD-MMM-YYYY') + '\t' + sorted[i][0].replace('iot\.', '').trim(), '\t' + sorted[i][1])
        }
    });

}


request({
    url: 'https://dev.eclipse.org/mailman/listinfo'
}, function(error, response, result) {
    computeMailingListsStats(result);
});