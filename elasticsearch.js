/**
 * Created by Freeman on 2016/4/6.
 */
var elasticsearch = require('elasticsearch');

var elasticClient = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'info'
});

var indexName = "blogs";

var typeName = "blog";

/**
 * Delete an existing index
 */
function deleteIndex() {
    return elasticClient.indices.delete({
        index: indexName
    });
}
exports.deleteIndex = deleteIndex;

/**
 * create the index
 */
function initIndex() {
    return elasticClient.indices.create({
        index: indexName
    });
}
exports.initIndex = initIndex;

/**
 * check if the index exists
 */
function indexExists() {
    return elasticClient.indices.exists({
        index: indexName
    });
}
exports.indexExists = indexExists;

function initMapping() {
    return elasticClient.indices.putMapping({
        index: indexName,
        type: typeName,
        body: {
            properties: {
                id: {type: "string"},
                title: { type: "string" },
                post: { type: "string" }
            }
        }
    });
}
exports.initMapping = initMapping;


function addDocument(document) {
    return elasticClient.index({
        index: indexName,
        type: typeName,
        body: {
            id: document._id,
            title: document.title,
            post: document.post
        }
    });
}
exports.addDocument = addDocument;

function search(input) {
    return elasticClient.search({
            q:input
    })
}
exports.search = search;