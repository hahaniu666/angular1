/**
 * Created by susf on 17-4-27.
 */
(function () {
    angular.module('qh-test-front')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state("main.groupOrder.refund", {
                url: "/refund?groupOrderId&status&orgId",
                resolve: {
                    curUser: ['userService', function (userService) {
                        return userService.getCurUser(true, true);
                    }]
                },
                views: {
                    "@": {
                        templateUrl: 'views/main/groupOrder/refund/index.root.html',
                        controller: refundController,
                        controllerAs: "vm"
                    }
                }
            })
            ;
        }]);


    // ----------------------------------------------------------------------------
    refundController.$inject = ['$scope', '$http', '$state', '$httpParamSerializer', 'alertService', 'appConfig', "imgService", "wxService", "FileUploader",'$cookies'];
    function refundController($scope, $http, $state, $httpParamSerializer, alertService, appConfig, imgService, wxService, FileUploader,$cookies) {
        $scope.gotoTop = function () {
            window.scrollTo(0, 0);//滚动到顶部
        };
        $cookies.orgId = '584662c0dc8d4c2a21c37234';
        var vm = this;
        $scope.gotoTop();
        $scope.refund = {};
        $scope.simpleImg = imgService.simpleImg;
        $scope.itemImg = imgService.itemImg;
        $scope.imgUrl = appConfig.imgUrl;
        $scope.groupOrderId = $state.params.groupOrderId;
        vm.orgId = $state.params.orgId;

        $scope.orderStatus = $state.params.status;
        var ua = window.navigator.userAgent.toLowerCase();
        $scope.isWxClient = false;
        if (ua.match(/MicroMessenger/i)) {
            $scope.isWxClient = true;
            wxService.init();
        }

        // 回退页面
        $scope.fallbackPage = function () {
            if (history.length === 1) {
                $state.go("main.index", {orgId: '584662c0dc8d4c2a21c37234'}, {reload: true});
            } else {
                history.back();
            }
        };
        // 评论的预览图片
        $scope.imgPreviewReply = function (reply, img) {
            var imgs = [];
            for (var n = 0; n < reply.length; n++) {
                imgs.push($scope.imgUrl + reply[n].avatar +
                    "?imageView2/1/w/" + $scope.itemImg.w + "/h/" + $scope.itemImg.h);
            }
            var imgUrl = $scope.imgUrl + img +
                "?imageView2/1/w/" + $scope.itemImg.w + "/h/" + $scope.itemImg.h;
            wx.previewImage({
                current: imgUrl, // 当前显示图片的http链接
                urls: imgs // 需要预览的图片http链接列表
            });
        };


        $scope.queryDetail = function () {
            $http({
                method: 'GET',
                url: appConfig.apiPath + '/groupOrder/orderRefundDetail?groupOrderId=' + $scope.groupOrderId
            }).then(function (resp) {
                $scope.refund = resp.data;
                $scope.refund.price = resp.data.refundPrice / 100;
                $scope.maxPrice = resp.data.refundPrice / 100;
                $scope.maxNum = resp.data.applyedNum;
            }, function (resp) {
                var data = resp.data;
                if (data.code === "NOT_LOGINED") {
                    $state.go("main.newLogin", {backUrl: window.location.href});
                }
            });
        };
        $scope.queryDetail();


        // 默认退货退款
        $scope.initRefundType = function () {
            if ($scope.orderStatus === 'UNSHIP') {
                $scope.patterns = 0;
                $scope.refundType = [{
                    name: '仅退款',
                    value: 'GROUP_MONEY_ONLY'
                }];
            } else {
                $scope.patterns = 1;
                $scope.refundType = [{
                    name: '退货退款',
                    value: 'GROUP_SKU'
                }, {
                    name: '仅退款',
                    value: 'GROUP_MONEY_ONLY'
                }];
            }
        };
        $scope.initRefundType();

        $scope.changeType = function () {
            if (vm.type === "GROUP_MONEY_ONLY") {
                $scope.patterns = 1;
            } else if (vm.type === "GROUP_SKU") {
                $scope.patterns = 0;
            }
        };

        $scope.requirePrice = function () {
            if (!$scope.refund.price) {
                $scope.refund.price = "";
            }
            if (isNaN($scope.refund.price)) {
                return;
            }
            if ($scope.refund.price < 0) {
                $scope.refund.price = 0;
            } else if ($scope.refund.price > $scope.maxPrice) {
                $scope.refund.price = $scope.maxPrice;
            }
        };

        // 校验每次输入的退货数量
        $scope.requireNum = function () {
            if ($scope.refund.applyedNum < 0) {
                $scope.refund.applyedNum = 0;
            } else if ($scope.refund.applyedNum > $scope.maxNum) {
                $scope.refund.applyedNum = $scope.maxNum;
            }
        };
        //说明 里面 剩余字数实时变化
        //初始化
        $scope.numWords = 400;
        $scope.checkText = function () {
            if (vm.memo.length > 400) {
                vm.memo = vm.memo.substr(0, 400);
            }
            //剩余字数
            vm.numWords = 400 - vm.memo.length;
        };


        // 初始化图片
        $scope.imgs = [];
        $scope.uploadWx = function () {
            wxService.wxUploadImg().then(function (data) {
                var s = {};
                s.id = data.id;
                s.avatar = data.avatar;
                $scope.imgs.push(s);
            });
        };
        // 代替图片上传的点击,隐藏自己的控件
        $scope.uploaderFiles = function () {
            var ua = window.navigator.userAgent.toLowerCase();
            if (ua.match(/MicroMessenger/i) && !ua.match(/windows/i)) {
                wxService.wxUploadImg(1).then(function (data) {
                    $scope.imgs.push(data);
                });
            } else {
                if ($scope.imgs.length < 3) {
                    angular.element("#uploaderFile").click();
                } else {
                    alertService.msgAlert("exclamation-circle", "最多上传3张");
                }
            }
        };
        var uploader = $scope.uploader = new FileUploader({
            url: appConfig.apiPath + '/common/uploadImgS',
            autoUpload: true
        });
        // FILTERS
        uploader.filters.push({
            name: 'customFilter',
            fn: function (item /*{File|FileLikeObject}*/, options) {
                return this.queue.length < 30;
            }
        });
        uploader.onSuccessItem = function (fileItem, response) {
            var s = {};
            s.id = response.id;
            s.avatar = response.avatar;
            $scope.imgs.push(s);
        };

        // 删除图片
        $scope.removeOneImg = function (id) {
            for (var i = 0; i < $scope.imgs.length; i++) {
                if ($scope.imgs[i].id === id) {
                    $scope.imgs.splice(i, 1);
                    //从当前的这个i起 删除一个(也就是删除本身)
                    return;
                }
            }
        };


        $scope.orderRefund = function () {

            if (!vm.type) {
                alertService.msgAlert("exclamation-circle", "请选择服务类型");
                return;
            }

            if (!vm.reason) {
                alertService.msgAlert("exclamation-circle", "请选择退货原因");
                return;
            }
            /**
             if (vm.type === 'MONEY_ONLY' && $scope.orderType == 'ITEM') {
                if (!vm.logistics) {
                    alertService.msgAlert("exclamation-circle", "请选择货物状态");
                    return;
                }
            }*/


            if (vm.type === "GROUP_SKU") {
                // 退货退款的时候才进行检查这些状态
                if (!$scope.refund.applyedNum) {
                    alertService.msgAlert("exclamation-circle", "请填写正确退货数量");
                    return;
                }
                if ($scope.refund.applyedNum < 0 || $scope.refund.applyedNum > $scope.maxNum) {
                    alertService.msgAlert("exclamation-circle", "请填写正确退货数量");
                    return;
                }
            }

            if ($scope.refund.price === 0) {
                // 为0时未被计算入内
            } else {
                if (!$scope.refund.price || isNaN($scope.refund.price)) {
                    alertService.msgAlert("exclamation-circle", "请填写正确的金额");
                    return;
                }
                if ($scope.refund.price < 0 || $scope.refund.price > $scope.maxPrice) {
                    alertService.msgAlert("exclamation-circle", "请填写正确的金额");
                    return;
                }
            }

            var imgsTemp = [];
            for (var i = 0; i < $scope.imgs.length; i++) {
                imgsTemp.push($scope.imgs[i].id);
            }
            // 将价格转为分传入
            $scope.maxBranchPrice = $scope.refund.price * 100;
            /*alertService.confirm(null, "确认提交并返回等待员工审核", "")*/
            alertService.confirm(null, "", "确认提交并返回等待员工审核?", "取消", "确定").then(function (data) {
                if (data) {
                    // 申请退货,
                    $http({
                        method: "POST",
                        url: appConfig.apiPath + '/groupOrder/refund',
                        data: $httpParamSerializer({
                            type: vm.type,
                            reason: vm.reason,
                            applyedNum: $scope.refund.applyedNum,
                            groupOrderId: $scope.refund.groupOrderId,
                            skuId: $scope.refund.skuId,
                            price: $scope.maxBranchPrice,
                            imgs: imgsTemp,
                            memo: vm.memo
                            //logistics: vm.logistics
                            //content: $scope.content
                        }),
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                        }
                    }).success(function () {
                        $scope.fallbackPage();
                    }).error(function (data) {
                        if (data.code === "NOT_LOGINED") {
                            $state.go("main.newLogin", {backUrl: window.location.href});
                        }
                    });
                }
            });
        };


    }
})();