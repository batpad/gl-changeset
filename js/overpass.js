var xhr = require('xhr');
var config = require('./config');
var osm = require('./osm');
var overpassToGeoJSON = require('./overpassToGeoJSON');
var geojsonChanges = require('./geojsonChanges');

var query = function(changesetID, callback) {
    osm.query(changesetID, function(err, changeset) {
        var data = getDataParam(changeset);
        var bbox = getBboxParam(changeset.bbox);
        var url = config.overpassBase + '?data=' + data + '&bbox=' + bbox;
        var xhrOptions = {
            'responseType': 'json'
        };
        xhr.get(url, xhrOptions, function(err, response) {
            console.log('overpass response', response);
            if (err) {
                return callback(err, null);
            }
            var elements = response.body.elements;
            var geojson = overpassToGeoJSON(elements);
            var changes = geojsonChanges(geojson, changeset);

            var ret = {
                'geojson': changes.geojson,
                'featureMap': changes.featureMap,
                'changeset': changeset
            };
            return callback(null, ret);
        });
    });
};

function getDataParam(c) {
    return '[out:json][adiff:%22' + c.from.toString()  + ',%22,%22' + c.to.toString() + '%22];(node(bbox)(changed);way(bbox)(changed););out%20meta%20geom(bbox);';
}

function getBboxParam(bbox) {
    return [bbox.left, bbox.bottom, bbox.right, bbox.top].join(',');
}

module.exports = {
    'query': query
};