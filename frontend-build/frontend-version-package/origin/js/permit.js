$(function() {
    var timer = null;
    //加载许可证管理信息
    //机器码
    var host = $('.node-nav-sub-left li.active').data('ip');
    var parameter = {
        'host': host,
    };
    var callback = function (result){
        $(".permit_nodeinfo").LoadData ("hide");
        if (result == undefined)
            return;
        if (result.code == 200) {
            var data = result.result;
            var hwcode = data.hwcode;
            $('.js-hwcode').find('.basic_name_value_code').text(hwcode);
        } else {
            $('.js-hwcode').find('.basic_name_value_code').text('--');
        }
        $('.grid').masonry({
              itemSelector: '.grid-item',
              columnWidth: '.col-lg-6',
              percentPosition: true
        })
    }
    if(host){
        $(".permit_nodeinfo").LoadData ("show");
        DataModel['getHWCode'](parameter, callback, true, '');
    }

    //获取注册码
    var regcallback = function (result){
        $(".permit_nodeinfo").LoadData ("hide");
        if (result == undefined)
            return;
        if (result.code == 200) {
            var data = result.result;
            var htm = "";
            for (var i = 0; i < data.length; i++) {
                var activestatus = data[i]['isactive'];
                if ( activestatus == 1 ) {
                    activestatus = lang.node.has_actived;
                } else{
                    activestatus = lang.node.no_active;
                }

                var activetime = data[i]['activetime'];
                activetime = moment.unix(activetime).format('MM/DD/YY HH:mm:ss');

                htm +=  '<div class="permit-mag" data-liccode="' + data[i]['liccode'] + '" data-time="'+ activetime +'">' +
                            '<div class="col-lg-7 basic-lg-7 col-permitformat-row left lictype-permit">'+
                                '<span>' + data[i]['lictype'] + '</span>' +
                            '</div>'+
                            '<div class="col-lg-3 basic-lg-3 col-permitformat-row left status-permit">'+
                                '<span>'+ activestatus + '</span>' +
                            '</div>' +
                            '<div class="col-lg-2 basic-lg-2 col-permitformat-row left  other-action">'+
                                '<div class="permit-hide hidden">'+
                                    '<a href="javascript:;" title="'+ lang.node.del_liccode +'" class="js-del-regcode" data-backdrop="static" data-target="#delRegCodeModel">'+
                                        '<span class="glyphicon glyphicon-trash"></span>'+
                                    '</a>'+
                                    '<a href="javascript:;" title="'+ lang.node.active_liccode +'" class="js-active-lic">'+
                                        '<span class="glyphicon glyphicon-fire"></span>'+
                                    '</a>'+
                                '</div>'+
                            '</div>'+
                        '</div>';
            };
            $(".permit_nodeinfo").find('#liccode-list').html(htm);
        }
        $('.grid').masonry({
              itemSelector: '.grid-item',
              columnWidth: '.col-lg-6',
              percentPosition: true
        })
    }
    if(host){
        $(".permit_nodeinfo").LoadData ("show");
        DataModel['getLicCode'](parameter, regcallback, true, '');
    }

    $(document)
    .delegate ('.permit_nodeinfo', 'mouseover', function (ev) {
         $this = $(this);
         $this.find('.c_basic_right').removeClass('hidden');
     })
    .delegate ('.permit_nodeinfo', 'mouseout', function (ev) {
         $this = $(this);
         $this.find('.c_basic_right').addClass('hidden');
    })
    .delegate('#liccode-list .permit-mag .lictype-permit', 'mouseover', function (ev) {
        clearInterval( timer );
        $this = $(this);
        $permit = $this.closest('.permit-mag');
        $popver = $('#js-popver-liccode');
        mouseoverPermit ($this, $permit, $popver);
    })
    .delegate('#js-popver-liccode', 'mouseover', function (ev) {
        clearInterval( timer );
        $this = $(this);
        $permit = $('#liccode-list .permit-mag.permit-mouseover');
        $el = $permit.find('.lictype-permit');
        $popver = $('#js-popver-liccode');

        mouseoverPermit ($el, $permit, $popver);
    })
    .delegate('#liccode-list .permit-mag .lictype-permit', 'mouseout', function (ev) {
        $this = $(this);
        $popver = $('#js-popver-liccode');
        if(timer){
            clearTimeout(timer);
        }
        timer = setTimeout(popverOut($popver), 300);
    })
    .delegate ('#js-popver-liccode', 'mouseleave', function (ev) {
        $popver = $('#js-popver-liccode');
        popverOut($popver);
    })

    .delegate ( '.permit-mag' , 'mouseover', function (ev) {
        $this = $(this);
        $this.find('.permit-hide').removeClass('hidden');
    })
    .delegate ( '.permit-mag' , 'mouseout', function (ev) {
        $this = $(this);
        $this.find('.permit-hide').addClass('hidden');
        // $('#js-popver-active').hide();
    })
    .delegate ( '#js-popver-active' , 'mouseover', function (ev) {
        $(this).show();
    })
    .delegate ( '#js-popver-active' , 'mouseout', function (ev) {
        $(this).hide();
    })
    .delegate( '#add_regcode', 'click', function (ev) {
        $modal = $('#addRegisterCodeModal');
        $modal.modal('show');
        $modal.find('textarea').focus();
    })
    //添加注册码
    .delegate ( '#addRegisterCodeModal .btn-primary', 'click', function (ev) {
        var liccodes = trim( $('#input-liccodes').val() );
        var host = $('.node-nav-sub-left li.active').data('ip');
        if (liccodes == '' || liccodes == undefined) {
            DisplayTips(lang.permit.input_register_code);
            return false;
        }
        var str = liccodes.split(",");
        var licarr = [];

        for (var i = 0; i < str.length; i++) {
            licarr.push(str[i]);
        }
        var regcodestr = "";
        for (var i = 0; i < licarr.length; i++) {
            if ( licarr[i] != '' ) {
               regcodestr += licarr[i] + ',';
            }
        };
        if ( regcodestr == '' || regcodestr == undefined ) {
            DisplayTips(lang.permit.input_register_code);
            return false;
        }
        regcodestr = regcodestr.substring( 0 , regcodestr.length-1);
        var parameter = {
            'liccodes': regcodestr,
            'host': host,
        };
        var dncallback = function (result){
            if (result == undefined)
                return;
            if (result.code == 200) {
                var html = '';
                DisplayTips (lang.permit.add_register_code_success);
                // for (var i = 0; i < iparr.length; i++) {
                //     html += ''
                // };
                // autoHeightPermit();
                // $('.fixed_nav_left .v-menu li:last').before(html);
                autoHeightPermit();
                refresh();
            }else {
                DisplayTips(lang.permit.add_register_code_fail + '(' + result.result + ')');
            }
            $('#addRegisterCodeModal').modal('hide');
        }
        DataModel["addRegisterCode"](parameter, dncallback, true, lang.permit.add_register_code);
    })
    .delegate ('.js-del-regcode', 'click', function (ev) {
        $this = $(this);
        $(this).closest('.permit-mag').addClass('pink');
        var liccode = $(this).closest('.permit-mag').data('liccode');
        $('#delRegCodeModel .modal-body p').html(lang.permit.sureto_del_regcode + '<span style="color:red;">&nbsp;' + liccode  + '</span>'+ '?');
        $('#delRegCodeModel').modal({backdrop: 'static', keyboard: false});
        $('#delRegCodeModel').modal('show');
    })

    .on('shown.bs.modal','#addRegisterCodeModal',function(ev){
        $('#input-liccodes').focus();
    })

    //删除注册码
    .delegate ('#delRegCodeModel .btn-primary', 'click', function (ev) {
        $this = $(this);
        $permit = $('.magtable_list_third').find('.permit-mag.pink');
        var host = $('.node-nav-sub-left li.active').data('ip');
        var liccode = $permit.data('liccode');
        var parameter = {
            'liccodes': liccode,
            'host': host,
        };
        var dncallback = function (result){
            if (result == undefined)
                return;
            if (result.code == 200) {
                autoHeightPermit();
                DisplayTips (lang.permit.del_register_code_success);
                $permit.remove();
                autoHeightPermit();
            }else {
                DisplayTips(lang.permit.del_register_code_fail + '(' + result.result + ')' );
                $permit.removeClass('pink');
            }
            $('#delRegCodeModel').modal('hide');
        }
        DataModel["delRegisterCode"](parameter, dncallback, true, lang.permit.del_register_code);
    })
    //取消删除
    .delegate ('#delRegCodeModel .btn-default', 'click', function (ev) {
        $permit = $('.magtable_list_third').find('.permit-mag.pink');
        $permit.removeClass('pink');
    })
    //在线激活注册码
    .delegate ( '#js-online-active' , 'click', function (ev) {

    } )
    //手工激活
    .delegate ( '#js-online-active' , 'click', function (ev) {

    } )
    .delegate ( '.permit-mag .other-action .js-active-lic' , 'click', function (ev) {
        $this = $(this);
        // $popver = $('#js-popver-active');
        // popverPosition($popver, $this);
        // $this.closest('.permit-mag').addClass('pink');
        $modal = $('#activeByHandModel');
        var liccode = $this.closest('.permit-mag').data('liccode');
        $modal.data('liccode', liccode );
        $modal.modal('show');
    })
    //激活注册码
    .delegate ( '#activeByHandModel .btn-primary', 'click', function (ev) {
        $modal = $('#activeByHandModel');
        $modal.find('.modal-header').LoadData('show');
        $permit = $('.magtable_list_third').find('.permit-mag.pink');
        var host = $('.node-nav-sub-left li.active').data('ip');
        var liccode = $modal.data('liccode');
        var key = trim( $('#input-activecode').val() );
        if ( key == '' || key == undefined ) {
            DisplayTips(lang.permit.input_active_code);
            return false;
        }
        var parameter = {
            'liccode': liccode,
            'key': key,
            'host': host,
        };
        var dncallback = function (result){
            $modal.find('.modal-header').LoadData('show');
            if (result == undefined)
                return;
            if (result.code == 200) {
                autoHeightPermit();
                DisplayTips (lang.permit.active_success);
                autoHeightPermit();
                refresh();
            }else {
                DisplayTips(lang.permit.active_fail + '(' + result.result + ')' );
            }
            $permit.removeClass('pink');
            $('#activeByHandModel').modal('hide');
        }
        DataModel["activeCode"](parameter, dncallback, true, lang.permit.active);
    })

    .on('shown.bs.modal','#activeByHandModel',function(ev){
        $('#input-activecode').focus();
    })

    //取消激活
    .delegate ( '#activeByHandModel .btn-default', 'click', function (ev) {
        $permit = $('.magtable_list_third').find('.permit-mag.pink');
        $permit.removeClass('pink');
    })
    // autoHeightPermit();

    //自适应列表高度
    function autoHeightPermit () {
        var h1 = $('.magtable_list_third').height();
        var h2 = $('.magtable_list_parent').height();
        if ( h1 == 0 ) {
            html = '<div class="no-record-parent">' +
                   '<span class="no-record">' +
                   lang.user.no_record +
                   '</span>'+
                   '</div>';
            $('.magtable_list_third').append(html);
        }
        if ( h1 < h2 ) {
            $('.all_table_list_third').css('height', 'auto');
            $('.magtable_list_parent').css('overflow', 'hidden');
        } else{
            $('.all_table_list_third').css('height', '90%');
            $('.magtable_list_parent').css('overflow', 'auto');
        }
    }

    function mouseoverPermit ($el, $permit, $popver) {
        $permit.siblings().removeClass('permit-mouseover');
        $permit.removeClass('permit-mouseover').addClass('permit-mouseover');
        var liccode = $permit.data('liccode');
        var time =  $permit.data('time');
        $popver.find('.usage-container .use-content').find('.js-permit-liccode').text(liccode);
        $popver.find('.usage-container .use-content').find('.js-active-time').text(time);

        popverPosition($popver, $el);
    }

});
