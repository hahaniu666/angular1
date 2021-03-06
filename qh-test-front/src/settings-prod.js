// 生产环境的配置
angular.module('qh-test-front').factory('appConfig', function () {
    var domain = "//kingsilk.net";
    // var rootPath = domain + "/qh/jngy/?showwxpaytitle=1"
    var rootPath = domain + "/qh/mall/jngy/?showwxpaytitle=1&wxPub=jngy";
    var apiPath = domain + "/qh/mall/api";
    var appVersion = "3.0.0";
    return {
        rootPath: rootPath,
        share: "https:" + rootPath + "#/share",
        apiPath: apiPath,
        appVersion: appVersion,
        maxSize: 5,  // 页数多少多少翻页数
        pageSize: 10, // 每页多少条数据
        imgUrl: "//img.kingsilk.net/",   // 图片地址
        cdnUrl: "//img.kingsilk.net/prod/qh-jngy-front/" + appVersion + "/",// cdn地址访问本地图片
        imgView1: "?imageView2/2/w/500/h/500",// 对图片进行缩放(首页)
        imgView2: "?imageView2/2/w/100/h/100",// 对图片进行缩放(用户中心)
        imgUpload: "/common/uploadImgS",
        tokenImg: apiPath + "/common/generatorToken",
        indexUrl:"https://kingsilk.net/qh/jngy/?showwxpaytitle=1#/",
        storeUrl:"https://kingsilk.net/qh/jngy/wineshop.html?showwxpaytitle=1#/store/",
        screenshotImgApi:"https://kingsilk.net/qh/html/api/img?",  //用于截图分享
        dwzApiPath: 'https://dwz.kingsilk.net/admin/rs/api/dwz/addDwz', //添加短网址，返回data
        dwzUrlPath: 'https://dwz.kingsilk.net/admin/rs/api/s/',         //data 直接加在后边
    };
});