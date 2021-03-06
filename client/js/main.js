'use strict';

require('./util/polyfill.js');
const misc = require('./util/misc.js');
const views = require('./util/views.js');
const router = require('./router.js');

history.scrollRestoration = 'manual';

router.exit(
    null,
    (ctx, next) => {
        ctx.state.scrollX = window.scrollX;
        ctx.state.scrollY = window.scrollY;
        router.replace(router.url, ctx.state);
        if (misc.confirmPageExit()) {
            next();
        }
    });

const mousetrap = require('mousetrap');
router.enter(
    null,
    (ctx, next) => {
        mousetrap.reset();
        next();
    });

const tags = require('./tags.js');
const api = require('./api.js');

api.fetchConfig().then(() => {
    // register controller routes
    let controllers = [];
    controllers.push(require('./controllers/home_controller.js'));
    controllers.push(require('./controllers/help_controller.js'));
    controllers.push(require('./controllers/auth_controller.js'));
    controllers.push(require('./controllers/password_reset_controller.js'));
    controllers.push(require('./controllers/comments_controller.js'));
    controllers.push(require('./controllers/snapshots_controller.js'));
    controllers.push(require('./controllers/post_detail_controller.js'));
    controllers.push(require('./controllers/post_main_controller.js'));
    controllers.push(require('./controllers/post_list_controller.js'));
    controllers.push(require('./controllers/post_upload_controller.js'));
    controllers.push(require('./controllers/tag_controller.js'));
    controllers.push(require('./controllers/tag_list_controller.js'));
    controllers.push(require('./controllers/tag_categories_controller.js'));
    controllers.push(require('./controllers/settings_controller.js'));
    controllers.push(require('./controllers/user_controller.js'));
    controllers.push(require('./controllers/user_list_controller.js'));
    controllers.push(require('./controllers/user_registration_controller.js'));

    // 404 controller needs to be registered last
    controllers.push(require('./controllers/not_found_controller.js'));

    for (let controller of controllers) {
        controller(router);
    }
}, error => {
    window.alert('Could not fetch basic configuration from server');
}).then(() => {
    api.loginFromCookies().then(() => {
            tags.refreshCategoryColorMap();
            router.start();
        }, error => {
            if (window.location.href.indexOf('login') !== -1) {
                api.forget();
                router.start();
            } else {
                const ctx = router.start('/');
                ctx.controller.showError(
                    'An error happened while trying to log you in: ' +
                        error.message);
            }
        });
});
