/**
 * Created by Freeman on 2016/3/27.
 */
var config = {

    cookieSecret: 'myblog',

    //mongodb

    db: 'blog',
    host: '127.0.0.1',
    port: 27017,


    // redis 配置，默认是本地
    redis_host: '127.0.0.1',
    redis_port: 6379

};


module.exports = config;