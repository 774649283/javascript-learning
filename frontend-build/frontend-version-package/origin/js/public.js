$(document)
    //修改密码
    .on('click', '#changPWModal .btn-primary', function (ev) {
        $modal = $('#changPWModal');
        var oldpwd, newpwd, renewpwd;
        oldpwd = trim($modal.find('#old_ipasswd').val());
        newpwd = trim($modal.find('#new_ipasswd').val());
        renewpwd = trim($modal.find('#newa_ipasswd').val());

        if (oldpwd === '' || newpwd === '' || renewpwd === '') {
            DisplayTips(lang.user.input_oldpwd_and_newpwd);
            return false;
        }
        if (newpwd != renewpwd) {
            DisplayTips(lang.user.confirm_newpwd_not_same);
            return false;
        }
        if (newpwd.length < 6) {
            DisplayTips(lang.user.pwd_length_morethan_six);
            return false;
        }

        var parameter = {
            'oldpwd': oldpwd,
            'newpwd': newpwd
        }
        var dncallback = function (res) {
            if (res.code === CODE_SUCCESS) {
                DisplayTips(lang.user.modify_pwd_success);
                $modal.modal('hide');
            } else {
                var msg = res.msg || '';
                DisplayTips(lang.user.modify_pwd_fail + msg);
            }
            $modal.find('.modal-body').LoadData("hide");
        }
        $modal.find('.modal-body').LoadData("show");
        DataModel["modifyPwd"](parameter, dncallback, true);
    })
    //设置焦点
    .on('shown.bs.modal', '#changPWModal', function (ev) {
        $('#old_ipasswd').focus();
    })
    .on('click', '.js-plus-subdisks', function (ev) {
        $this = $(this);
        $tr = $this.closest('.js-node');
        $tr.next('.subdisks').removeClass('hidden');
        $this.siblings('.js-minus-subdisks').removeClass('hidden');
        $this.addClass('hidden');
        $this.parent().parent().parent().find('.bound-sub').show();

    })
    .on('click', '.js-minus-subdisks', function (ev) {
        $this = $(this);
        $this.closest('tr').next('.subdisks').addClass('hidden');
        $this.siblings('.js-plus-subdisks').removeClass('hidden');
        $this.addClass('hidden');
        $this.parent().parent().parent().find('.bound-sub').hide();
    })
    .on('click', '.js-node .sub-check-disk', function (ev) {
        $this = $(this);
        $tr = $(this).closest('tr');
        $subtrs = $tr.next('tr.subdisks');
        $inputs = $subtrs.find('table input.sub-check-disk');

        if ($this.prop('checked') == true) {
            $inputs.each(function (i) {
                $(this).prop("checked", true);
            })
        } else {
            // 读写全选 取消勾选
            $('.js-sel-all').prop("checked", false);
            $inputs.each(function (i) {
                $(this).prop("checked", false);
            })
        }
    })
    .on('click', '.subdisks .sub-check-disk', function (ev) {
        $this = $(this);
        $tr = $this.closest('tr.js-disk');
        $inputs = $this.closest('.subdisks').find('table input.sub-check-disk');
        if ($this.prop('checked') == true) {
            $('.r-and-w-all').prop("checked", false);
            var len = 0;
            if ($this.prop('checked') == true) {
                $inputs.each(function (i) {
                    if ($(this).prop("checked") == true) {
                        ++len;
                        if (len == $inputs.length) {
                            $this.closest('.subdisks').prev('tr.js-node').find('.sub-check-disk').prop("checked", true);
                        }
                    }
                });
            }
        } else {
            $('.js-sel-all').prop("checked", false);
            $inputs.each(function (i) {
                if ($(this).prop("checked") == true) {
                    --len;
                    if (len != $inputs.length) {
                        $this.closest('.subdisks').prev('tr.js-node').find('.sub-check-disk').prop("checked", false);
                    }
                } else {
                    $this.closest('.subdisks').prev('tr.js-node').find('.sub-check-disk').prop("checked", false);
                }
            });
        }
    })
    .on('click', '.js-sel-all', function (ev) {
        //全选按钮被选，执行两件事情
        //1、所有的checkbox被选中
        $this = $(this);
        var $inputs = $(this).closest('table').siblings().find('.wizard-disk-body').find('tr td .sub-check-disk');
        if ($(this).prop('checked') == true) {
            $inputs.each(function (i) {
                $(this).prop("checked", true);
            })
        } else {
            $inputs.each(function (i) {
                $(this).prop("checked", false);
            })
        }
    })
    .on('click', '.js-language', function (ev) {
        var la = $(this).attr('lang') || 'zh_cn';
        setCookie('lang', la, 24 * 30);
        window.location.reload();
    });
//bootstrap的tooltip
$("body").tooltip({ selector: '[data-toggle=tooltip]' });

//聚焦到input文本框的文本内容最后面
$.fn.setCursorPosition = function (position) {
    if (this.lengh == 0) return this;
    return $(this).setSelection(position, position);
}

$.fn.setSelection = function (selectionStart, selectionEnd) {
    if (this.lengh == 0) return this;
    input = this[0];

    if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    } else if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    }

    return this;
}

$.fn.focusEnd = function () {
    this.setCursorPosition(this.val().length);
}

//下拉组件
$.fn.addFold = function (foldedHeight, callback) {
    !foldedHeight && (foldedHeight = 500);
    if (this.find('.menuToggle').length > 0 || foldedHeight > this.outerHeight()) {
        if (typeof (callback) === 'function') {
            callback();
        }
        return;
    }

    var target = this;
    var heightPx = foldedHeight + 'px';
    target.append('<div class="menuToggle"><span class="glyphicon glyphicon-menu-down"></span></div>');
    target.addClass('folded overflowHiddenY')
        .css('height', heightPx)
        .on('click', '.menuToggle', function () {
            var toggleBtn = this;
            if (target.hasClass('folded')) {
                target.removeClass('folded').addClass('unfolded')
                    .css('height', 'auto')
                    .find('.menuToggle span').css('transform', 'rotate(180deg)');
            } else {
                target.removeClass('unfolded').addClass('folded')
                    .css('height', heightPx)
                    .find('.menuToggle span').css('transform', '');
            }

            if (typeof (callback) === 'function') {
                callback();
            }
        });

    if (typeof (callback) === 'function') {
        callback();
    }
}

//固定弹出框的位置
function popverPosition(ele, $this, position) {
    var height = ele.height();
    var width = ele.width();
    var t = $this.offset().top;
    var h = $this.height();
    var l = $this.offset().left;
    var w = $this.width();

    ele.css('display', 'table');
    if (position === 'top') {
        ele.removeClass('top bottom left marker-on-bottom marker-on-top marker-on-right')
            .addClass('top marker-on-bottom');
        ele.css('top', t - height);
        ele.css('left', l + (w / 2) - (width / 2));
    } else if (position === 'left') {
        ele.removeClass('top bottom left marker-on-bottom marker-on-top marker-on-right')
            .addClass('left marker-on-right');
        ele.css('top', t + (h / 2) - (height / 2));
        ele.css('left', l - width);
    } else if (position === 'bottom') {
        ele.removeClass('top bottom left marker-on-bottom marker-on-top marker-on-right')
            .addClass('bottom marker-on-top');
        ele.css('top', t + h);
        ele.css('left', l + (w / 2) - (width / 2));
    } else if (position === 'topleft') {
        // 左上
        ele.removeClass('top bottom left marker-on-bottom marker-on-top marker-on-right');
        ele.css('top', t - height + (h / 2));
        ele.css('left', l - width + (w / 2));
    } else if (position === 'bottomleft') {
        // 左下
        ele.removeClass('top bottom left marker-on-bottom marker-on-top marker-on-right');
        ele.css('top', t + (h / 2));
        ele.css('left', l - width + (w / 2));
    } else {
        ele.removeClass('top bottom left marker-on-bottom marker-on-top marker-on-right');
        ele.css('top', t + (h / 2) - (height / 2));
        ele.css('left', l + w);
    }
}
//固定弹出框的位置左边
function popverPosition1(ele, $this) {
    var height = ele.height() / 2;
    var t = $this.offset().top;
    var h = $this.height() / 2;
    var l = $this.offset().left;
    var w = $this.width();
    ele.css('display', 'table');
    ele.css('top', t + h - height + 100);
    ele.css('left', l + w - 580);
}
//提交ajax请求时锁定页面
function addWaitMask() {
    if ($('.wait-mask').length === 0) {
        $('body').append('<div class="wait-mask"></div>');
    }
}
function removeWaitMask() {
    $('.wait-mask').remove();
}
//节点信息弹出框移出事件
function popverOut($popver) {
    $popver.css('display', 'none');
}
// 文件系统转化
function getFsType(type) {
    switch (type) {
        case 1:
            return "EXT2";
        case 2:
            return "EXT3";
        case 3:
            return "EXT4";
        case 4:
            return "XFS";
        case 5:
            return "FAT";
        case 6:
            return "D3FS";
        case 10:
            return "MAX";
        default:
            return "UNKNOWN";
    };
}

//显示无记录
function noRecord($el) {
    var htm = '<div class="no-record-parent record-style">' +
        '<span class="no-record">' +
        lang.no_record +
        '</span>' +
        '</div>';
    $el.html(htm);
}

//把路径格式化 /a/b 转化成 a,1,b,1的格式
function formatPath1(str) {
    var path = '';
    for (var i = 0; i < str.length; i++) {
        if (str[i].length != 0) {
            var stri = str[i].replace(/,/g,'^'); //把含有，命名的字符换成^
            path += stri + ',' + 1 + ',';
        }
    }
    return path;
}

//把a,1,b,1格式转化成 /a/b
function formatPath2(context) {
    var reg = new RegExp(',1,', 'g');
    var path = '/' + context.data('path');
    path += ',';
    path = path.replace(reg, '/');
    path = path.substring(0, path.length - 1);
    return path;
}

//把/a/b格式转化成 a,1,b,1
function formatPath3(path) {
    path = path.replace(/,/g,'^'); //把含有，命名的字符换成^
    var reg = new RegExp('/', 'g');
    path += ',';
    path = path.substring(1, path.length);
    path = path.replace(reg, ',1,');
    path = path.substring(0, path.length - 1);
    return path;
}

//把 a,b  转换为a|b
function formatPath4(paths){
    if (paths.indexOf('/') >-1) {
        var paths = paths.replace(/,/g,'^');
    }
    path = paths.replace(/,/g,'|');
    path = path.replace(/\|\|/g,',|');
    var path2 = path.replace(/\^/g,',');
    return path2;
}

//把所选磁盘添加到提交页面的磁盘列表位置上，并返回
function addDiskInfo($nodeinputs) {
    var htm = "",
        hostList = [],
        diskList = [],
        hostnameList = [],
        arr = [];
    $nodeinputs.each(function (j) {
        $this_node = $(this);
        var isnodecheck = $this_node.find('input.sub-check-disk').prop('checked');
        $disks = $this_node.next('.subdisks').find('.js-disk input[type="checkbox"]:checked');
        var dlen = $disks.length;
        //如果被选中，则说明他下面的子元素也都被选中（判断下其下是否有子元素）
        if (dlen > 0) {
            $tr = $this_node;
            var ip = $tr.data('ip');
            var host = $tr.data('name');
            hostList.push(ip);
            hostnameList.push(host);
            htm += '<tr class="js-node">' +
                '<td class="left">' +
                '<span>' + host + '</span>' +
                '<span>(' + ip + ')</span>' +
                '</td>' +
                '</tr>' +
                '<tr class="subdisks" data-ip="' + ip + '" data-host="' + host + '">' +
                '<td colspan="2" style="padding:0;">' +
                '<table class="table table-condensed table-hover" style="margin-left:11px;">' +
                '<tbody>';
            var idisk = "";
            for (var i = 0; i < $disks.length; i++) {
                $disk = $($disks[i]).closest('.js-disk');
                var diskname = $disk.data('disk');
                idisk += diskname + ',';
                var text = trim($disk.find('.showleftborder span').text());
                htm += '<tr class="js-disk">' +
                    '<td class="showleftborder">' +
                    '<div class="showcenterline" style="width:15px;float:left;"></div>' +
                    '<span style="float:left;">' + text + '</span>' +
                    '</td>' +
                    '</tr>';
            }
            idisk = idisk.substring(0, idisk.length - 1);
            diskList[j] = idisk;
            htm += '</tbody>' +
                '</table>' +
                '</td>' +
                '</tr>';
            arr.push([ip, idisk, host]);
        }
    })
    return {
        htm: htm,
        arr: arr
    };
}

//磁盘信息的排序函数
function sortDiskInfo(data) {
    data.sort(function (l, r) {
        if (l.ip > r.ip) {
            return 1;
        } else {
            return -1;
        }
    })
}

//转换bytes、M、G、T、
function transformUnit(size, unit) {
    if (unit == 'M') {
        size = size * 1024 * 1024;
    } else if (unit == 'G') {
        size = size * 1024 * 1024 * 1024;
    } else if (unit == 'T') {
        size = size * 1024 * 1024 * 1024 * 1024;
    }
    return size;
}

//转换M、G、T   输入单位M
function transformUnitM(size, unit) {
    if (unit == 'M') {
        size = size;
    } else if (unit == 'G') {
        size = size * 1024;
    } else if (unit == 'T') {
        size = size * 1024 * 1024;
    }
    return size;
}
//获取节点状态
function getNodeState(nstatus) {
    if (nstatus == 1) {
        nstatus = lang.normal;
    } else if (nstatus == 2) {
        nstatus = lang.stop;
    } else if (nstatus == 3) {
        nstatus = lang.offline;
    } else if (nstatus == 4) {
        nstatus = lang.unknown;
    } else if (nstatus == 5) {
        nstatus = lang.breakdown;
    } else if (nstatus == 6) {
        nstatus = lang.disabled;
    } else if (nstatus == 7) {
        nstatus = lang.network_anomaly;
    } else if (nstatus == 8) {
        nstatus = lang.no_join;
    } else if (nstatus == 255) {
        nstatus = lang.uninitialized;
    } else {
        nstatus = lang.unknown;
    }
    return nstatus;
}

//数组除虫
//Maximal performance 
//Only for pure string arr or pure number arr
function uniqPureArr(arr) {
    var seen = {};
    var out = [];
    var len = arr.length;
    for (var i = 0; i < len; i++) {
        var item = arr[i];
        if (seen[item] !== 1) {
            seen[item] = 1;
            out.push(item);
        }
    }
    return out;
}

//搜索
function encode(s) {
    s = s.toLowerCase();
    return s.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/([\\\.\*\[\]\(\)\$\^])/g, "\\$1");
}

function decode(s) {
    s = s.toLowerCase();
    return s.replace(/\\([\\\.\*\[\]\(\)\$\^])/g, "$1").replace(/>/g, ">").replace(/</g, "<").replace(/&/g, "&");
}

function highlight(s, obj) {
    s = s.toLowerCase();
    s = encode(s);
    var t = obj.innerHTML.replace(/<span\s+class=.?highlight.?>([^<>]*)<\/span>/gi, "$1");
    obj.innerHTML = t;
    var cnt = loopSearch(s, obj);
    t = obj.innerHTML;
    var r = /{searchHL}(({(?!\/searchHL})|[^{])*){\/searchHL}/g;
    t = t.replace(r, "<span class='highlight'>$1</span>");
    obj.innerHTML = t;
}
function loopSearch(s, obj) {
    s = s.toLowerCase();
    var cnt = 0;
    if (obj.nodeType == 3) {
        cnt = replace(s, obj);
        return cnt;
    }
    for (var i = 0, c; c = obj.childNodes[i]; i++) {
        if (!c.className || c.className != "highlight");
        cnt += loopSearch(s, c);
    }
    return cnt;
}
function replace(s, dest) {
    s = s.toLowerCase();
    var r = new RegExp(s, "g");
    var tm = null;
    var t = dest.nodeValue;
    var cnt = 0;
    if (tm = t.match(r)) {
        cnt = tm.length;
        t = t.replace(r, "{searchHL}" + decode(s) + "{/searchHL}");
        dest.nodeValue = t;
    }
    return cnt;
}
//获取权限
function getACLType(num) {
    if (0 == num)   //---
        return "forbidden";
    else if (1 == num)  //--x
        return "forbidden";
    else if (2 == num)  //-w-
        return "write";
    else if (3 == num)  //-wx
        return "write";
    else if (4 == num)  //r--
        return "read";
    else if (5 == num)  //r-x
        return "read";
    else if (6 == num)  //rw-
        return "write";
    else if (7 == num)  //rwx
        return "write";
    else
        return "forbidden";
}
