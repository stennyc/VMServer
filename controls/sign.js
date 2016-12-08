/**
 * Created by lzan13 on 16/9/20.
 * 注册登录相关控制器，主要处理和登录注册相关的操作
 */

    // 获取事件代理模块儿，解决回调嵌套灾难
var EventProxy = require('eventproxy');
// 获取配置文件
var config = require('../app.config');

var User = require('../proxy').User;

/**
 * 处理 get 方式注册请求，显示注册界面
 * @param req 请求参数
 * @param res 响应数据
 */
exports.showSignup = function (req, res) {
    res.render('sign/signup.ejs');
};

/**
 * 处理 post 方式的注册请求方法
 * @param req 请求数据，包含注册参数信息
 * @param res 响应数据，包含处理结果信息
 */
exports.signup = function (req, res) {
    var eventProxy = new EventProxy();
    // 错误处理程序
    eventProxy.on('error', function (data) {
        res.status(422);
        res.render('sign/signup', {data: data});
    });

    var data = {};

    // 获取请求提交的数据
    var username = req.body.username;
    var password = req.body.password;

    // 校验数据，判断必须数据是否有空值
    var isEmpty = [username, password].some(function (item) {
        return item === '';
    });
    if (isEmpty) {
        data.error = config.error_sign_username_password_null;
        data.msg = '用户名密码不能为空';
        eventProxy.emit('error', data);
        return;
    }
    User.getUserByUsername(username, function (error, users) {
        if (error) {
            // 服务器数据库错误
            data.error = config.error_server_db;
            data.msg = '服务器查询数据失败';
            eventProxy.emit('error', data);
            return;
        }
        if (users.length > 0) {
            data.error = config.error_sign_already_exit;
            data.msg = '账户已存在';
            eventProxy.emit('error', data);
            return;
        }
        User.saveUser(username, password, function (error, result) {
            if (result) {
                // 注册成功，跳转到登录页，或直接登录跳转到主页面
                res.render('sign/signin', {data: data});
            } else {
                // 注册失败
                data.error = config.error_sign_sign_up_failed;
                eventProxy.emit('error', data);
            }
        });
    });
};

/**
 * 处理 get 方式的登录请求，展示登录界面
 * @param req
 * @param res
 */
exports.showSignin = function (req, res) {
    res.render('sign/signin');
};

/**
 * 处理 post 方式的登录请求，处理登录逻辑和结果
 * @param req
 * @param res
 */
exports.signin = function (req, res) {
    var eventProxy = new EventProxy();
    eventProxy.on('error', function (error) {
        res.status(422);
        res.render('sign/signin.ejs', {data: error});
    });

    var data = {};

    var username = req.body.username;
    var password = req.body.password;
    var isEmpty = [username, password].some(function (item) {
        return item === '';
    });
    if (isEmpty) {
        data.error = config.error_sign_username_password_null;
        data.msg = '用户名和密码不能为空';
        eventProxy.emit('error', data);
        return;
    }
    User.getUserByUsernameAndKey(username, password, function (error, user) {
        if (user) {
            req.session.user = user;
            res.status(200);
            res.render('index');
        } else {
            data.error = config.error_sign_user_not_exit;
            data.msg = '用户名密码错误';
            eventProxy.emit('error', data);
            return;
        }
    });

};

/**
 * 处理注销请求
 * @param req
 * @param res
 */
exports.signout = function (req, res) {
    req.session.destory();
    // 退出登录之后重定向到主页
    res.redirect('/');
};

exports.getToken = function (req, res) {

}