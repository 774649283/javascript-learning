$(function (ev) {
	// 加载告警设置信息
	var callback = function (result){
		$(".alarm-info-list").LoadData ("hide");
		if (result == undefined)
			return;
		if (result.code == 200) {
			var htm = "";
			var data = result.result;
			for (var i = 0; i < data.length; i++) {
				htm += 	'<div class="wizard-mag alarm-mag">'+
							'<div class="col-lg-3 basic-lg-3 inlineblock js-module-name ellipsis" style="margin-left:-7%;">'+
								'<span title='+ data[i]['name'] +'>' + data[i]['name'] + '</span>'+
							'</div>'+
							'<div class="col-lg-3 basic-lg-3 inlineblock js-state" style="text-align: left;margin-left:7%;">'+
								'<span>' + data[i]['state'] + '</span>'+
							'</div>'+
							'<div class="col-lg-3 basic-lg-3 inlineblock js-level" style="text-align: left;">'+
								'<span>' + data[i]['filterlevel'] + '</span>'+
							'</div>'+
							'<div class="col-lg-2 basic-lg-2 inlineblock js-duptime" style="text-align: left;">'+
								'<span>' + data[i]['scheduletime'] + 's' + '</span>'+
							'</div>'+
							'<div class="col-lg-1 basic-lg-1 inlineblock" style="height:30px;text-align:right;">'+
								'<a href="javascript:;" class="js-edit-alarm-items hidden" title="'+ lang.edit +'">'+
									'<span class="glyphicon glyphicon-edit"></span>'+
								'</a>'+
							'</div>'+
						'</div>';
			}
			$(".alarm-info-list").html(htm);
		}
		else if (result.code == 701){}
		else {
			DisplayTips (lang.optlog.list_alarm_config_fail);
		}
	}
	$(".alarm-info-list").LoadData ("show");
	DataModel['listAlarmCong'](null, callback, true, null);

	// 加载SNMP信息
	var callback = function (result){
		$(".snmp-content").LoadData ("hide");
		if (result == undefined)
			return;
		if (result.code == 200) {
			var htm = "";
			var data = result.result;
			$cont = $('.snmp-content');
			$cont.find('.js-nms-ip').val( data['nms_ip'] );
			$cont.find('.js-msg-oid').val( data['msg_oid'] );
		}
		else if (result.code == 701){}
		else {
			DisplayTips ( lang.optlog.list_snmp_info_fail );
		}
		$('.grid').masonry({
			itemSelector: '.grid-item',
			columnWidth: '.col-lg-6',
			percentPosition: true
		});
	}
	$(".snmp-content").LoadData ("show");
	DataModel['getSnmp'](null, callback, true, null);

	// 加载SMTP信息
	var callback = function (result){
		$(".smtp-content").LoadData ("hide");
		if (result == undefined)
			return;
		if (result.code == 200) {
			var htm = "";
			var data = result.result;
			$cont = $('.smtp-content');
			$cont.find('.js-smtp-server').val( data['smtpserver'] );
			$cont.find('.js-send-useremail').val( data['sender'] );
			$cont.find('.js-send-passwd').val( data['password'] );
			$cont.find('.js-port').val( data['port'] );
			$cont.find('.js-email-subject').val( data['subject'] );
		}
		else if(result.code == 701){}
		else {
			DisplayTips ( lang.optlog.list_smtp_info_fail );
		}
	}
	$(".smtp-content").LoadData ("show");
	DataModel['getSmtp'](null, callback, true, null);

	//列举告警状态以及邮件联系人
	var callback = function (result){
		$(".alarm-act-content").LoadData ("hide");
		if (result == undefined)
			return;
		if (result.code == 200) {
			var htm = "";
			var data = result.result;
			$cont = $('.alarm-act-content');
			//邮件告警
			if ( data['email'] == 1 ) {
				$cont.find('.js-emailalarm-status').text( lang.optlog.start );
				$cont.find('.js-start-emailalarm').addClass('hidden');
			} else if ( data['email'] == 0 ) {
				$cont.find('.js-emailalarm-status').text( lang.optlog.pause );
				$cont.find('.js-pause-emailalarm').addClass('hidden');
			}
			//snmp告警
			if ( data['snmptrap'] == 1 ) {
				$cont.find('.js-snmpalarm-status').text( lang.optlog.start );
				$cont.find('.js-start-snmpalarm').addClass('hidden');
			} else if ( data['snmptrap'] == 0 ) {
				$cont.find('.js-snmpalarm-status').text( lang.optlog.pause );
				$cont.find('.js-pause-snmpalarm').addClass('hidden');
			}

			// //显示邮件联系人
			// var emails = data['addrs'];
			// for (var i = 0; i < emails.length; i++) {
			// 	htm += 	'<li data-email="' + emails[i].email + ' ">'+
	  // 						'<a href="javascript:;">' + emails[i].email + '</a>' +
	  // 						'<span class="close-email delmailuser js-del-email hidden">×</span>'+
	  // 					'</li>';
			// }
			// $('#emaillist').html(htm);
		}
		else if (result.code == 701){}
		else {
			DisplayTips ( lang.optlog.list_alarm_status_fail );
		}
	}
	$(".alarm-act-content").LoadData ("show");
	DataModel['getAlarmStatus'](null, callback, true, null);

	$(document)
	.on ( 'mouseover', '.alarm-act-content', function (ev) {
		$this = $(this);
		$alarm = $this.find('.js-alarm');
		$alarm.removeClass('hidden');
	})
	.on ( 'mouseout', '.alarm-act-content', function (ev) {
		$this = $(this);
		$alarm = $this.find('.js-alarm');
		$alarm.addClass('hidden');
	})
	.on( 'mouseover', '.wizard-mag.alarm-mag', function (ev) {
		$this = $(this);
		$this.find('.js-edit-alarm-items').removeClass('hidden');
	})
	.on( 'mouseout', '.wizard-mag.alarm-mag', function (ev) {
		$this = $(this);
		$this.find('.js-edit-alarm-items').addClass('hidden');
	})
	//发送测试邮件
	.on( 'click', '#sendTestEmailModal .btn-primary', function (ev) {
		$modal = $('#sendTestEmailModal');
		var email = trim( $modal.find('#testemail').val() );
		if ( !valifyEmail(email) ) {
			DisplayTips( lang.user.email_format_error );
			return;
		}
		var para = {
			'email': email,
		};
		var callback = function (result){
			removeWaitMask();
			$modal.find('.modal-header').LoadData ("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips ( lang.optlog.send_test_email_success );
				$modal.modal('hide');
			} else {
				DisplayTips ( lang.optlog.send_test_email_fail );
			}
		}
		$modal.find('.modal-header').LoadData ("show");
		addWaitMask();
		DataModel['sendTestEmial'](para, callback, true, null);
	})
	//设置焦点
	.on('shown.bs.modal','#sendTestEmailModal',function(ev){
		$('#testemail').focus();
	})
	//邮件告警设置  开启
	.on ( 'click', '.js-start-emailalarm', function (ev) {
		$this = $(this);
		$modal = $('#setemailAlarmModal');
		$modal.find('.modal-body').html( lang.optlog.confirm_start_email_alarm + '？' );
		var value = $this.data('value');
		$modal.modal('show');
		$modal.data('status', value);
	})
	//暂停
	.on ( 'click', '.js-pause-emailalarm', function (ev) {
		$this = $(this);
		$modal = $('#setemailAlarmModal');
		$modal.find('.modal-body').html( lang.optlog.confirm_stop_email_alarm + '？' );
		var value = $this.data('value');
		$modal.modal('show');
		$modal.data('status', value);
	})
	//启动或者关闭邮件告警
	.on ( 'click', '#setemailAlarmModal .btn-primary', function (ev) {
		$modal = $('#setemailAlarmModal');
		var status = $modal.data('status');
		var para = {
			'status': status,
		};
		var callback = function (result){
            removeWaitMask();
			$modal.find('.modal-header').LoadData ("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
				$cont = $('.alarm-act-content');
				$start = $cont.find('.js-start-emailalarm');
				$stop = $cont.find('.js-pause-emailalarm');
				if ( status == '1' ) {
					DisplayTips ( lang.optlog.start_emailalarm_success );
					$cont.find('.js-emailalarm-status').text( lang.optlog.start );
					$start.addClass('hidden');
					$stop.removeClass('hidden');
				} else if ( status == '0' ){
					DisplayTips ( lang.optlog.stop_emailalarm_success );
					$cont.find('.js-emailalarm-status').text( lang.optlog.pause );
					$stop.addClass('hidden');
					$start.removeClass('hidden');
				}
				$modal.modal('hide');
			} else {
				if ( status == '1' ) {
					DisplayTips ( lang.optlog.start_emailalarm_fail );
				} else if ( status == '0' ){
					DisplayTips ( lang.optlog.stop_emailalarm_fail );
				}
			}
		}
		$modal.find('.modal-header').LoadData ("show");
        addWaitMask();
		DataModel['setEmailStatus'](para, callback, true, null);
	})
	//SNMP告警设置  开启
	.on ( 'click', '.js-start-snmpalarm', function (ev) {
		$this = $(this);
		$modal = $('#setSnmpAlarmModal');
		$modal.find('.modal-body').html( lang.optlog.confirm_start_snmp_alarm + '？' );
		var value = $this.data('value');
		$modal.modal('show');
		$modal.data('status', value);
	})
	//暂停
	.on ( 'click', '.js-pause-snmpalarm', function (ev) {
		$this = $(this);
		$modal = $('#setSnmpAlarmModal');
		$modal.find('.modal-body').html( lang.optlog.confirm_stop_snmp_alarm + '？' );
		var value = $this.data('value');
		$modal.modal('show');
		$modal.data('status', value);
	})
	//启动或者关闭邮件告警
	.on ( 'click', '#setSnmpAlarmModal .btn-primary', function (ev) {
		$modal = $('#setSnmpAlarmModal');
		var status = $modal.data('status');
		var nmsip = $('.snmp-content').find('.js-nms-ip').val();
		nmsip = trim( nmsip );
		var para = {
			'nmsip': nmsip,
			'status': status
		};
		var callback = function (result){
            removeWaitMask();
			$modal.find('.modal-header').LoadData ("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
				$cont = $('.alarm-act-content');
				$start = $cont.find('.js-start-snmpalarm');
				$stop = $cont.find('.js-pause-snmpalarm');
				if ( status == '1' ) {
					DisplayTips ( lang.optlog.start_snmpalarm_success );
					$cont.find('.js-snmpalarm-status').text( lang.optlog.start );
					$start.addClass('hidden');
					$stop.removeClass('hidden');
				} else if ( status == '0' ){
					DisplayTips ( lang.optlog.stop_snmpalarm_success );
					$cont.find('.js-snmpalarm-status').text( lang.optlog.pause );
					$stop.addClass('hidden');
					$start.removeClass('hidden');
				}
				$modal.modal('hide');
			} else {
				if ( status == '1' ) {
					DisplayTips ( lang.optlog.start_snmpalarm_fail );
				} else if ( status == '0' ){
					DisplayTips ( lang.optlog.stop_snmpalarm_fail );
				}
			}
		}
		$modal.find('.modal-header').LoadData ("show");
        addWaitMask();
		DataModel['setSnmp'](para, callback, true, null);
	})
	//保存SNMP设置
		.on ( 'keydown', '.js-nms-ip', function (ev) {
			if(ev.keyCode==13){
				$cont = $('.snmp-content');
				$alarm = $('.alarm-act-content').find('.js-snmpalarm-status').siblings('span.js-alarm');
				var status = $alarm.find('a.hidden').data('value');
				var nmsip = $cont.find('.js-nms-ip').val();
				nmsip = trim( nmsip );
				var para = {
					'nmsip': nmsip,
					'status': status
				};
				if (!valifyIP(nmsip)) {
					DisplayTips(lang.cluster.ip_format_error);
					refresh();
					return;
				}
				var callback = function (result){
					$cont.LoadData ("hide");
					if (result == undefined)
						return;
					if (result.code == 200) {
						DisplayTips( lang.optlog.set_snmpalarm_success );
					} else {
						DisplayTips( lang.optlog.set_snmpalarm_fail );
					}
				}
				$cont.LoadData ("show");
				DataModel['setSnmp'](para, callback, true, null);
			}
	} )
	//测试SNMP设置
	.on ( 'click', '.js-test-snmp', function (ev) {
		$cont = $('.snmp-content');
		var nmsip = $cont.find('.js-nms-ip').val();
		nmsip = trim( nmsip );
		if (!valifyIP(nmsip)) {
            DisplayTips(lang.cluster.ip_format_error);
            return;
        }
		var para = {
			'nmsip': nmsip,
		};
		var callback = function (result){
			$cont.LoadData ("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips( lang.optlog.test_snmp_success );
			} else {
				DisplayTips( lang.optlog.test_snmp_fail + result.result);
			}
		}
		$cont.LoadData ("show");
		DataModel['testSnmp'](para, callback, true, null);
	})
	.on ( 'mouseover', 'ul#emaillist>li', function (ev) {
		$this = $(this);
		$this.find('.js-del-email').removeClass('hidden');
	})
	.on ( 'mouseout', 'ul#emaillist>li', function (ev) {
		$this = $(this);
		$this.find('.js-del-email').addClass('hidden');
	})
	//删除邮箱
	.on ( 'click', '.js-del-email', function (ev) {
		$this = $(this);
		$li = $this.closest('li');
		var email = $li.data('email');
		var para = {
			'email': email,
		};
		var callback = function (result){
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips( lang.optlog.del_email_success );
				$li.remove();
			} else {
				DisplayTips( lang.optlog.del_email_fail + result.result);
			}
		}
		DataModel['delEmail'](para, callback, true, null);
	})
	//添加邮箱
	.on ( 'keypress', '.js-add-recipemail', function (ev) {
		ev.stopPropagation();
		var keycode = ev.which;
		if(keycode == 13){
			$this = $(this);
			var email = trim ( $this.val() );
			if (!valifyEmail(email)) {
				DisplayTips( lang.user.email_format_error );
				return;
			}
			var para = {
				'email': email,
			};
			var callback = function (result){
				if (result == undefined)
					return;
				if (result.code == 200) {
					DisplayTips( lang.optlog.add_email_success );
					var htm = "";
					htm += 	'<li data-email="' + email + ' ">'+
	  						'<a href="javascript:;">' + email + '</a>' +
	  						'<span class="close-email delmailuser js-del-email hidden">×</span>'+
	  					'</li>';
	  				$('ul#emaillist').append(htm);
				} else {
					DisplayTips( lang.optlog.add_email_fail + result.result);
				}
			}
			DataModel['addEmail'](para, callback, true, null);
		}
	})
	//编辑告警设置信息
	.on ( 'click', '.js-edit-alarm-items', function (ev) {
		$modal = $('#editAlarmSettingModal');
		$modal.modal('show');
		// $('select.opt-status-value').removeClass('hidden');
		// $modal.find('.js-opt-alarm').get(0).selectedIndex = 0;
		// $('select.opt-level-value').addClass('hidden');
		// $('input.opt-scheduletime-value').addClass('hidden');
		// $('.scheduletime-unit').addClass('hidden');
		$this = $(this);
		$alarm = $this.closest('.alarm-mag');
		var modulename,
			status,
			level,
			runtime;
		modulename = trim( $alarm.find('.js-module-name span').text() );
		status = trim( $alarm.find('.js-state span').text() );
        $('.opt-status-value').data('status',status);
		level = trim ( $alarm.find('.js-level span').text() );
		runtime = trim( $alarm.find('.js-duptime span').text() );
		runtime = runtime.substring(0, runtime.length-1);
        $('.opt-scheduletime-value').data('runtime',runtime);
		$modal.find('.js-module-name').text(modulename);
		$modal.find('.opt-scheduletime-value').val( runtime );
		if (status == 'enable') {
			$modal.find('.opt-status-value').get(0).selectedIndex = 0;
		} else if (status == 'disable') {
			$modal.find('.opt-status-value').get(0).selectedIndex = 1;
		}

		// if (level == 'INFO') {
		// 	$modal.find('.opt-level-value').get(0).selectedIndex = 0;
		// } else if (level == 'NOTICE') {
		// 	$modal.find('.opt-level-value').get(0).selectedIndex = 1;
		// } else if (level == 'WARNING') {
		// 	$modal.find('.opt-level-value').get(0).selectedIndex = 2;
		// } else if (level == 'FATAL') {
		// 	$modal.find('.opt-level-value').get(0).selectedIndex = 3;
		// }
	})
	// .on ( 'change', 'select.js-opt-alarm', function (ev) {
	// 	$this = $(this);
	// 	var value  = $this.val();
	// 	if ( value == '1' ) {
	// 		$('select.opt-status-value').removeClass('hidden');
	// 		// $('select.opt-level-value').addClass('hidden');
	// 		$('input.opt-scheduletime-value').addClass('hidden');
	// 		$('.scheduletime-unit').addClass('hidden');
	// 	} else if ( value == '2' ) {
	// 		// $('select.opt-status-value').addClass('hidden');
	// 		// $('select.opt-level-value').removeClass('hidden');
	// 		// $('input.opt-scheduletime-value').addClass('hidden');
	// 		// $('.scheduletime-unit').addClass('hidden');
	// 	} else if ( value == '3' ) {
	// 		$('select.opt-status-value').addClass('hidden');
	// 		// $('select.opt-level-value').addClass('hidden');
	// 		$('input.opt-scheduletime-value').removeClass('hidden');
	// 		$('.scheduletime-unit').removeClass('hidden');
	// 	}
	// })
	.on ( 'click', '#editAlarmSettingModal .btn-primary', function (ev) {
		$modal = $('#editAlarmSettingModal');
		var name,
			option,
            status,
            scheduleTime;
		name = trim ( $modal.find('.js-module-name').text() );
		// if (optval == '1') {
		// 	option = 'state';
		// 	value = trim ( $modal.find('.opt-status-value').val() );
		// } else if (optval == '2') {
		// 	option = 'filterlevel';
		// 	value = trim ( $modal.find('.opt-level-value').val() );
		// } else if (optval == '3') {
		// 	option = 'scheduletime';
		// 	value = trim ( $modal.find('.opt-scheduletime-value').val() );
		// }

        status = trim ( $modal.find('.opt-status-value').val() );
        scheduleTime = trim ( $modal.find('.opt-scheduletime-value').val() );
        var ifStatusChanged = (status !== $('.opt-status-value').data('status'));
        var ifTimeChanged = (scheduleTime !== $('.opt-scheduletime-value').data('runtime'));

        if ( !ifStatusChanged && !ifTimeChanged ){
            DisplayTips(lang.optlog.parameters_are_not_changed);
            return false;
        }

        if(scheduleTime.match(/\D/g) !== null){
            DisplayTips(lang.optlog.confirm_scheduletime_format);
            return false;
        }

		//cluster模块最小为180s，最大不超过600s
		// disk模块最小为600s，最大超过3600s
		//其他默认最小为10s，最大不超过36000s

        if ( name == 'cluster' ) {
            if ( scheduleTime < 180  || scheduleTime > 600 ) {
                DisplayTips(lang.optlog.confirm_cluster_scheduletime_ranges);
                return false;
            }
        } else if ( name == 'disk' ) {
            if ( scheduleTime < 600  || scheduleTime > 3600 ) {
                DisplayTips(lang.optlog.confirm_disk_scheduletime_ranges);
                return false;
            }
        } else {
            if ( scheduleTime < 10  || scheduleTime > 36000 ) {
                DisplayTips(lang.optlog.confirm_other_module_scheduletime_ranges);
                return false;
            }
        }

		var statePara = {
			'name': name,
			'option': 'state',
			'value': status,
		};
        var timePara = {
            'name': name,
			'option': 'scheduletime',
			'value': scheduleTime,
        }
		var stCallback = function (result){
            removeWaitMask();
			$modal.find('.modal-header').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips( lang.optlog.set_alarmConf_success );
				refresh();
			} else {
				DisplayTips( lang.optlog.set_alarmConf_fail + result.result);
			}
		}
        var timeCallback = function (result){
            removeWaitMask();
			$modal.find('.modal-header').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips( lang.optlog.set_alarmConf_success );
				refresh();
			} else {
				DisplayTips( lang.optlog.set_alarmConf_fail + result.result);
			}
		}
        // var twiceCallback = function (result){
        //     $modal.find('.modal-header').LoadData('hide');
		// 	if (result == undefined)
		// 		return;
		// 	if (result.code == 200) {
        //         DisplayTips( lang.optlog.set_alarmConf_success );
		// 		refresh();
		// 	} else {
		// 		DisplayTips('仅状态修改成功，运行周期修改失败！');
		// 	}
		// }

        // var onceCallback = function (result){
		// 	if (result == undefined){
        //         $modal.find('.modal-header').LoadData('hide');
		// 		return;
        //     }
		// 	if (result.code == 200) {
        //         DisplayTips('状态修改成功！');
		// 	} else {
        //         $modal.find('.modal-header').LoadData('hide');
		// 		DisplayTips( lang.optlog.set_alarmConf_fail + result.result);
		// 	}
        //     console.log('done!');
        //     DataModel['setAlarmCong'](timePara, twiceCallback, true, null);
		// }

		$modal.find('.modal-header').LoadData('show');
        if(ifStatusChanged && !ifTimeChanged)
            DataModel['setAlarmCong'](statePara, stCallback, true, null);
        if(!ifStatusChanged && ifTimeChanged)
            DataModel['setAlarmCong'](timePara, timeCallback, true, null);
        if(ifStatusChanged && ifTimeChanged){
            DisplayTips( lang.optlog.modify_two_parameters_fail );
            $modal.find('.modal-header').LoadData('hide');
            return false;
        }
        addWaitMask();
	} )
	//.on ( 'click', '#saveSmtpConfModal .btn-primary', function (ev) {
	//	$modal = $('#saveSmtpConfModal');
	//	$cont = $('.smtp-content');
		.on('keydown','.smtp-content',function(ev){
			if(ev.keyCode==13){
				$modal = $('#saveSmtpConfModal');
				$cont = $('.smtp-content');
				var smtpserver,
					port,
					sender,
					password,
					subject;
				smtpserver = trim( $cont.find('.js-smtp-server').val() ) ;
				port = trim( $cont.find('.js-port').val() ) ;
				sender = trim( $cont.find('.js-send-useremail').val() ) ;
				password = trim( $cont.find('.js-send-passwd').val() ) ;
				subject = trim( $cont.find('.js-email-subject').val() ) ;

        if ( !valifyServer(smtpserver) ) {
          DisplayTips(lang.user.smtp_format_error);
          return false;
        }

				if ( !valifyEmail(sender) ) {
					DisplayTips(lang.user.email_format_error);
					return false;
				}

				if ( !valifyPort(port) ) {
					DisplayTips(lang.optlog.port_format_is_error_re_input);
					return false;
				}

				var para = {
					'smtpserver': smtpserver,
					'port': port,
					'sender': sender,
					'password': password,
					'subject': subject
				};
				var callback = function (result){
					removeWaitMask();
					$modal.find('.modal-header').LoadData('hide');
					if (result == undefined)
						return;
					if (result.code == 200) {
						DisplayTips( lang.optlog.save_smtpconf_success );
					} else {
						DisplayTips( lang.optlog.save_smtpconf_fail + result.result);
					}
					$modal.modal('hide');
				}
				$modal.find('.modal-header').LoadData('show');
				addWaitMask();
				DataModel['saveSmtpConf'](para, callback, true, null);
			}
		})
	.on ( 'mouseover', '.smtp-content', function (ev) {
		$cont = $('.smtp-content');
		$('.js-send-testemail').removeClass('hidden');
		$('.js-save-smtpconf').removeClass('hidden');
	} )
	.on ( 'mouseout', '.smtp-content', function (ev) {
		$cont = $('.smtp-content');
		$('.js-send-testemail').addClass('hidden');
		$('.js-save-smtpconf').addClass('hidden');
	} )
})
