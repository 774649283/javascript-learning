$(function() {
	var undefined;
	var timeSear = null;
	// autoMagtabHeight();//用来自适应高度
	//刚进入用户管理页面的时候，需要列举管理员列表
	var parameter = {
		'value': false
	};
	var dncallback = function (data){
		$('.js-mag-user').LoadData('hide');
		if (data == undefined)
			return;
		if (data.code == 200) {
			$('.js-mag-user').append( data.result );
			$('.js-mag-user .nav-mag-ucount').find('span').text( data.count );
		}else {
			DisplayTips( lang.user.list_subuser_fail + "(" + data.msg + ")");
		}
	}
	autoMagtabHeight();//用来自适应高度
	$('.js-mag-user').LoadData('show');
	DataModel["listAllAdminUser"](parameter, dncallback, true, null);

	//列举本地用户组
	var groupcallback = function (data){
		if (data == undefined)
			return;
		if (data.code == 200) {
			var htm = "", opthtm = "";
			var grouplist = data.result;
			for (var i = 0; i < grouplist.length; i++) {
				var group = grouplist[i];
				var name;
				if ( group['nickname'] != '' ) {
					name = group["groupname"] + '(' + group["nickname"] + ')';
				} else{
					name = group["groupname"];
				};
				if ( group["groupname"] != 'system' ) {
					htm +=  '<li class="sub-menu" data-groupid="'+ group['groupid'] +'" data-groupname="'+ group['groupname'] +'" title="'+ name +'">' +
			        		    '<a href="javascript:void(0);">' +
				        			'<img src="css/image/group.png">' + name +
				        		'</a>' +
				        	'</li>';
				    opthtm += 	'<option data-groupid="'+ group['groupid'] +'" title="' + group['nickname'] + '" >' + name +
							 	'</option>';
				}
			};
			htm += 	'<li>' +
	        			'<a href="javascript:void(0);" class="b_add_localgroup" data-toggle="modal" data-target="#userAddGroupModal" title="'+ lang.user.new_group +'" style="color:#596AE2;">'+
				        '<img src="css/image/add.png" style="width: 15px;height: 15px;margin-left: 5px;">'+lang.user.new_group +'</a>' +
	        		'</li>';
			$('#local-user-act').find('ul.d-menu').html(htm);
			$('#localUserMoveModal').find('#moveto-local-group').html(opthtm);
			$('#localUserDelGroupModal').find('#del-local-group').html(opthtm);
			$('#localUserAddModal').find('#select-user-group').html(opthtm);
			$('#localuserModiModal').find('#md-local-group').html(opthtm);

		}
	}
	autoMagtabHeight();//用来自适应高度
	DataModel["listGroup"](null, groupcallback, true, null);

	//列举AD域用户组
	var domainGroupcallback = function (data) {
		if (data == undefined)
			return;
		if (data.code == 200) {
			var htm = "";
			var grouplist = data.result;
			for (var i = 0; i < grouplist.length; i++) {
				var adgroup = grouplist[i];
				htm += 	'<li class="sub-menu" data-groupname="'+ adgroup['gname'] +'" title="' + adgroup['gname'] + '">' +
		    				'<a href="javascript:void(0);">' +
		    					'<img src="css/image/group.png">' + adgroup["gname"] +
		    				'</a>' +
		    			'</li>';
			}
			$('#domain-user-act').find('ul.d-menu').html(htm);
		}
	}
	DataModel["listAllDomainGroups"](null, domainGroupcallback, true, null);

	//列举LDAP域用户组
	var ldapGroupCallback = function (data) {
		if (!data) {
			return;
		}
		if (data.code === 200) {
			var groups = data.result;
			var html = '';
			for (var i = 0; i < groups.length; i++) {
				html += '<li class="sub-menu" data-gname="' + groups[i].gname + '" data-gid="' + groups[i].gid + '">' +
							'<a href="javascript:;">' +
		    					'<img src="css/image/group.png">' + groups[i].gname +
		    				'</a>' +
		    			'</li>';
			}
			$('#ldap-user-act').find('ul.d-menu').html(html);

		} else {
			console.log('fail');
		}
	}
	DataModel['listLDAPGroup'](null,ldapGroupCallback,true,null);

	$(document)
	//这里之所以从.user-mag 改成了div，是因为稍后我会把user-mag移除，这样的话后续中再用到这个类就达不到效果了
	//下次对于操作多的要多取一个类名
	.delegate('.is-select-all input', 'click', function (ev) {
		var $inputs = $(this).closest('.dt_g_right_subdiv').find('.magtable_list .pic-user input');
		if ($(this).prop('checked') == true) {
			$inputs.each(function (i) {
				$(this).prop("checked", true);
				selectInputSingle($(this));
			})
		} else {
			$inputs.each(function (i) {
				$(this).prop("checked", false);
				selectInputSingle($(this));
			})
		}

		//规避第一个用户不现实勾选的bug
		$($inputs[0]).css('visibility','visible').siblings('img').css('display','none');

	})
	.delegate('.magtable_list div .pic-user input', 'click', function (ev) {
		//全选按钮不勾选
		var $this = $(this);
		selectInputSingle($this);
	})

	.delegate('#mag-user-act>a', 'click', function (ev) {
        //添加锚点
        location.hash = 'admin';
		// //先取消勾选的状态
		// cancelSelectLi();
		// //本地用户和域用户的小三角形都是-45deg
		// $('#local-triangle-rotate').rotate(-45);
		// $('#domain-triangle-rotate').rotate(-45);
		// //右边对应用户列表显示，之前的消失
		// $('.js-mag-user').siblings().css('display', 'none');
		// $('.js-mag-user').css('display', 'block');
		// //菜单，当前点击的有颜色，其余恢复原状
		// $mag = $(this).closest('#mag-user-act');
		// $mag.siblings().removeClass('active')
		// 			   .find('ul').css('display', 'none');
		// $mag.siblings().find('ul li.active').removeClass('active');
		// $mag.addClass('active');
		// $mag.find('ul').toggle();
		// var parameter = {
		// 	'value': true
		// };
		// var dncallback = function (data){
		// 	if (data == undefined)
		// 		return;
		// 	if (data.code == 200) {
		// 		// $('.nav-local-ucount').html( '(' + '<span>' + data.count + '</span>' + lang.user.the_users +')');
		// 		adminUserList(data);
		// 		// autoMagtabHeight();

		// 	}else {
		// 		DisplayTips( lang.user.list_subuser_fail + "(" + data.msg + ")");
		// 	}
		// }
		// autoMagtabHeight();//用来自适应高度
		// DataModel["listAllAdminUser"](parameter, dncallback, true, lang.user.list_sub_local_user);
	})
	.delegate('#local-user-act>a', 'click', function (ev) {
        //添加锚点
        location.hash = 'local';

		// //此时删除组的小图标消失
		// $('.b_del_localgroup').css('display', 'none');
		//先取消勾选的状态
		cancelSelectLi();
		//对应的小三角向上
		// rotateTriangle('local-triangle-rotate', 'local-user-act');
		// $('#domain-triangle-rotate').rotate(-45);
		// //本地用户对应的用户列表出现，其余消失
		// $('.js-local-user').siblings().css('display', 'none');
		// $('.js-local-user').css('display', 'block');
		// //给本地用户Li添加active类，其余的active类移除
		$local = $('#local-user-act');
		// $local.siblings().removeClass('active')
		// 	 			 .find('ul').css('display', 'none');
		// $local.siblings().find('ul li.active').removeClass('active');
		// $local.addClass('active');
		$local.find('ul').toggle(250);
		// //本地用户的子元素的active类也要删除
		// $local.find('ul li.active').removeClass('active');
		// //修改导航条组名和组成员的个数
		// var gname = '所有本地用户';
		// $('.nav-local-gname').html(gname);
		// //点击“本地用户”，本地用户列表出现
		// var parameter = {
		// 	'role':0,
		// 	'page': 1,
		// 	'perpage': -1,
		// };
		// var dncallback = localUserCallback;
		// autoMagtabHeight();//用来自适应高度
		// DataModel["listAllUser"](parameter, dncallback, true, lang.user.list_sub_local_user);
	})
	.delegate('#local-user-act>ul>li.sub-menu', 'click', function (ev) {
		$('#local-user-act').removeClass('active');
		$('#local-user-act').find('.active').removeClass('active');
		$(this).addClass('active');
		//修改导航条组名和组成员的个数
		var gname = $(this).data('groupname');
		var gid = $(this).data('groupid');
        location.hash = 'local_' + gname;
		$('.nav-local-gname').html('<span data-groupid="'+ gid +'">' + gname + '</span>');
		//还要列举出当前用户组下的用户
		var groupid = $(this).data('groupid');
		var parameter = {
			'groupid': groupid,
			'page': 1,
			'perpage': -1,
		};
		var dncallback = localUserCallback;
		autoMagtabHeight();
		DataModel["listUsersByGroupid"](parameter, dncallback, true, lang.user.list_sub_local_user);
		$('.b_del_localgroup').css('display', 'inline');
	})
	.delegate('#domain-user-act>a', 'click', function (ev) {
        //添加锚点
        location.hash = 'domain';
		//先取消勾选的状态
		cancelSelectLi();
		//当前点击的小三角折叠，其余的小三角恢复原状，即一开始的-45度
		// rotateTriangle('domain-triangle-rotate', 'domain-user-act');
		// $('#local-triangle-rotate').rotate(-45);
        // $('.js-domain-user').LoadData('show');

		// //域用户相关列表显示，其余消失
		// $('.js-domain-user').siblings().css('display', 'none');
		// $('.js-domain-user').css('display', 'block');
		// //当前点击的添加active类，其余消失
		$domain = $('#domain-user-act');
		// $domain.siblings().removeClass('active')
		// 				  .find('ul').css('display', 'none');
		// $domain.siblings().find('ul li.active').removeClass('active');
		// $domain.addClass('active');
		$domain.find('ul').toggle(250);
		// //域用户的子元素的active类也要删除
		// $domain.find('ul li.active').removeClass('active');
		// //列举出所有的域用户
		// var parameter = {
		// 	'page': 1,
		// 	'perpage':30,
		// };
		// autoMagtabHeight();
		// DataModel["listAllDomainUserInfo"](parameter, DomainUserCallback, true, lang.user.list_sub_domain_users);
	})
	.delegate('#domain-user-act>ul>li', 'click', function (ev) {
		$(this).closest('#domain-user-act').siblings().find('ul').css('display', 'none');
		$('#domain-user-act').removeClass('active');
		$('#domain-user-act').find('.active').removeClass('active');
		$(this).addClass('active');
        $('.js-domain-user').LoadData('show');
		//根据域用户组名列举当前组下的域用户
		var groupname = $(this).data('groupname');
        location.hash = 'domain_' + groupname;
		var parameter = {
			'groupname': groupname,
		};
		var html = '';
		autoMagtabHeight();
		DataModel["listADUsersByName"](parameter, DomainUserCallback, true, lang.user.list_sub_domain_users);
	})
	.delegate('#local-user-act>ul>li', 'mouseover', function (ev) {
		// $('#local-user-act').removeClass('active');
		// $('#local-user-act').find('.active').removeClass('active');
		// $(this).addClass('active');
	})
	//LDAP
	.on('click', '#ldap-user-act>a', function(ev) {
		location.hash = 'ldap';
		var $ldap = $('#ldap-user-act');
		$ldap.find('ul').toggle(250);
	})
	//分组
	.on('click', '#ldap-user-act>ul>li', function (ev) {
		var $this = $(this);
		if ( !$this.hasClass('active') ) {
			//active类控制
			$this.addClass('active').siblings().removeClass('active');
			var groupname = $this.data('gname');
			location.hash = 'ldap_' + groupname;
			var para = {
				'group': groupname,
				'perpage': 30
			}
			$('.js-ldap-user').LoadData('show')
			DataModel['listLDAPByGroup'](para, ldapUserCallback, true, null);
		} else {
			return;
		}
	})
	//LDAP选页
	.on('click', '.js-ldap-user #js-ldap-pagination .js-ldap-page', function (ev) {
		var $this = $(this);
		//目标页码存储在uldata中
		var targetPage = $this.data('target');
		$this.closest('#js-ldap-pagination').data('curpage', targetPage);
		var para = {};
		var $active = $('#ldap-user-act>ul>li.active');
		if ($active.length === 0) {
			para = {
				'page': targetPage,
				'perpage': 30
			};
			$('.js-ldap-user').LoadData('show')
			DataModel['listLDAPUser'](para, ldapUserCallback, true, null);
		} else {
			para = {
				'group': $active.data('gname'),
				'page': targetPage,
				'perpage': 30
			};
			$('.js-ldap-user').LoadData('show')
			DataModel['listLDAPByGroup'](para, ldapUserCallback, true, null);
		}
	})
	//LDAP域信息弹出框
	.on('mouseover', '#isJoinedLdap>span', function (ev) {
		var $popover = $('#js-popver-ldap-info');
		if ($popover.css('display') === 'none') {
			$('#js-popver-ldap-info').fadeIn(150);
		}
	})
	.on('click', function (ev) {
		if ($(ev.target).closest('#js-popver-ldap-info').length < 1) {
			var $popover = $('#js-popver-ldap-info');
			if ($popover.css('display') !== 'none') {
				$('#js-popver-ldap-info').fadeOut(150);
			}
		}
	})
	//域数据缓存
	.on('click', '#adCacherModal .btn-primary', function (ev) {
		var caCallback = function (result) {
			removeWaitMask();
			$('#adCacherModal').modal('hide');
			if (!result) {
				return;
			}
			if (result.code === 200) {
				DisplayTips(lang.user.cache_complete);
			} else {
				DisplayTips(lang.user.cache_fail);
			}
		}
		addWaitMask();
		DataModel['ADCacher'](null, caCallback, true, null);
	})
	.on('click', '#ldapCacherModal .btn-primary', function (ev) {
		var caCallback = function (result) {
			removeWaitMask();
			$('#ldapCacherModal').modal('hide');
			if (!result) {
				return;
			}
			if (result.code === 200) {
				DisplayTips(lang.user.cache_complete);
			} else {
				DisplayTips(lang.user.cache_fail);
			}
		}
		addWaitMask();
		DataModel['LDAPCacher'](null, caCallback, true, null);
	})
	//添加焦点
	.on('shown.bs.modal','#localUserAddModal',function(ev){
		$('#user_name').focus();
	})
	.on('shown.bs.modal','#userAddMagModal',function(ev){
		$('#mag_user_name').focus();
	})
	.on('shown.bs.modal',"#userAddGroupModal",function(ev){
		$('#group_name').focus();
		$modal = $('#userAddGroupModal');
		$modal.find('#group_name').val('');
		$modal.find('#group_nickname').val('');
		//$modal.find('#group_memo').val('');
	})
	.on('click', '#userAddGroupModal .btn-default', function (ev) {
		$modal = $('#userAddGroupModal');
		$modal.find('#group_name').val('');
		$modal.find('#group_nickname').val('');
		//$modal.find('#group_memo').val('');
	})
	//取消添加管理员清空缓存
	.on('click', '#localUserAddModal .btn-default', function (ev) {
		$modal = $('#localUserAddModal');
		$modal.find('#user_name').val('');
		$modal.find('#user_nickname').val('');
		$modal.find('#user_email').val('');
	})
	.on('click', '#userAddMagModal .btn-default', function (ev) {
		$modal = $('#userAddMagModal');
		$modal.find('#mag_user_name').val('');
		$modal.find('#user_mag_nickname').val('');
		$modal.find('#mag_user_email').val('');
	})
	.on('shown.bs.modal', "#addDomainModal", function (ev) {
		$('#add_domain_controller_host').focus();
	})
	.on('shown.bs.modal', "#adminUserModiModal", function (ev) {
		$('#md_mag_nickname').focus();
	})
	.on('shown.bs.modal', '#localuserModiModal', function (ev) {
		$('#md_local_nickname').focus();
	})

	.on ( 'click', '#b_add_mag', function (ev) {
		$modal = $('#userAddMagModal');
		$modal.modal('show');
	})
	//添加管理员用户
	.delegate('#userAddMagModal .btn-primary', 'click', function (ev) {
		$modal = $('#userAddMagModal');
		var name = $("#mag_user_name").val ();
		var nickname = $("#user_mag_nickname").val ();
		var roleid = trim($('#select-maguser-role option:selected').data('role'));
		var rolename = trim($('#select-maguser-role option:selected').val());
		var email = $("#mag_user_email").val ();
		$('#select-maguser-role').data('chooserole',roleid);

		if (name == "") {
			DisplayTips (lang.user.username_empty);
			return;
		}
		if (name.length > 32) {
			DisplayTips (lang.user.name_too_long);
			return;
		}
		if (email != "" && !valifyEmail(email)) {
			DisplayTips (lang.user.email_format_error);
			return;
		}
		var parameter = {
			'username': name,
			'nickname': nickname,
			'email': email,
			'role': roleid,
		};
		var dncallback = function (result){
			$modal.find('.modal-header').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				var html = '';
				var time = moment().format('MM/DD/YY HH:mm');
				html += '<div class="user-mag js-user" data-userid=' + result.result.userid + ' data-username=' + name + ' data-nickname=' + nickname + '>'+
							'<div class="pic-user col-lg-1">'+
								'<img src="css/image/user-mag.png" width="28px" height="28px" alt="' + name + lang.user.personal_photo +'" title="' + name + '">'+
								'<input type="checkbox" class="mg-user-checked">'+
							'</div>'+
							'<div class="name-user col-lg-2 ellipsis">'+
								'<span id="username-create" title="' + name + '">' + name + '</span>'+
							'</div>'+
							'<div class="permit-user col-lg-2 ellipsis" title="' + rolename + '">' + rolename +
							'</div>'+
							'<div class="email-user col-lg-3 ellipsis" title="' + email + '">' + email + '</div>'+
							'<div class="createDate-user col-lg-2">' + time + '</div>'+
							'<div class="other-action col-lg-2">'+
								'<div class="user-hidden-icons">'+
									'<span class="glyphicon glyphicon-pencil" id="b_modi_adminuser" data-toggle="modal" data-target="#adminUserModiModal" title="' + lang.user.edit_user +'"></span>'+
									'<span class="glyphicon glyphicon-trash" id="b_del_adminuser" data-toggle="modal" data-target="#adminUserDelModal" title="'+ lang.user.del_user +'"></span>'+
									'<span class="glyphicon glyphicon-th" id="b_reset_adminuser" data-toggle="modal" data-target="#resetAdminPwdModal" title="'+ lang.user.reset_pwd +'"></span>'+
								'</div>'+
							'</div>'+
						'</div>';
				$('.js-mag-user .magtable_list').prepend(html);
				if($('#select-maguser-role').data('chooserole') == 1){
					DisplayTips(lang.user.add_auditor_success);
				}else{
					DisplayTips(lang.user.add_admin_success);
				}
				var spancount = parseInt($('.js-mag-user .nav-mag-ucount').find('span').text()) + 1;
				$('.js-mag-user .nav-mag-ucount').find('span').text( spancount );
			}else {
				if($('#select-maguser-role').data('chooserole') == 1){
					DisplayTips(lang.user.add_auditor_fail + "(" + result.result + ")");
				}else{
					DisplayTips(lang.user.add_admin_fail + "(" + result.result + ")");
				}
			}
			$modal.modal('hide');
		}
		$modal.find('.modal-header').LoadData('show');
		DataModel["userCreate"](parameter, dncallback, true, lang.user.add_admin);
	})

	// 删除管理员用户
	.delegate("#b_del_adminuser", 'click', function (){
		var $this = $(this);
		var $mduser = $this.closest('.user-mag');
		 if ($this.closest('.user-mag').length < 1) {
		 	$mduser = $this.closest('.user-mag-pink');
		 } else {
		 	$mduser = $this.closest('.user-mag');
		 }
		$mduser.addClass('pink');
		var name = $mduser.data('username');
		$("#adminUserDelModal").modal('show');
		$("#adminUserDelModal .modal-body p").html (lang.user.confirm_del_user + '<span style="font-size:1.5em;color:red;">' + name + '</span>'+ " ?");
	})
	.delegate("#adminUserDelModal .btn-primary", "click", function (){
		$modal = $('#adminUserDelModal');
		$deluser = $('.js-mag-user .magtable_list').find('.js-user.pink');
		var name = $deluser.data('username');
		if($('.js-user.pink').length > 1){
			DisplayTips (lang.user.choose_one_user);
			$('#adminUserDelModal').modal('hide');
			cancelSelectLi();
			$deluser.removeClass('pink');
			return;
		}
		if (name == "admin") {
			DisplayTips (lang.user.not_admin_del);
            $('#adminUserDelModal').modal('hide');
            cancelSelectLi();
			$deluser.removeClass('pink');
			return;
		}
		var parameter = {
			'username': name,
		};
		var dncallback = function (result){
			$modal.find('.modal-header').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips (lang.user.del_admin_user_success + name);
				$deluser.remove();
				$modal.modal("hide");
				$deluser.removeClass('pink');
				//显示当前组总的用户数目也减一个
				var ulen = $('.js-mag-user .magtable_list .user-mag').length;//用来统计当前的用户个数
				$('.nav-mag-ucount').html('<span>'+ '(' + ulen + lang.user.per_user + ')' + '</span>');
				cancelSelectLi();
			}else {
				DisplayTips(lang.user.del_user + name + lang.fail + "(" + result.result + ")");
				$modal.modal("hide");
				$deluser.removeClass('pink');
				cancelSelectLi();
			}
		}
		$modal.find('.modal-header').LoadData('show');
		DataModel["userRemvoe"](parameter, dncallback, true, lang.user.del_user);
	})
	.delegate("#adminUserDelModal .btn-default", "click", function (){
		$modal = $('#adminUserDelModal');
		$deluser = $('.js-mag-user .magtable_list').find('.user-mag.pink');
		$deluser.removeClass('pink');
	})
	//批量删除管理员
	.delegate("#lotAdminUserDelModal .btn-primary", "click", function (){
		$modal = $('#lotAdminUserDelModal');
		$deluser = $('.js-mag-user .magtable_list').find('.user-mag.pink');
		if ($deluser.length < 1) {
			$deluser = $('.js-mag-user .magtable_list').find('.user-mag-pink.pink');
		}
		var arr = [];
		if ($deluser.length < 1) {
			DisplayTips(lang.user.sel_the_reserpwd_user);
			$modal.modal("hide");
			return;
		} else{
			var temp = [];
			var names = '';
			var delulen = $deluser.length;
			for (var i = 0; i < delulen ; i++) {
				temp[i] = $deluser.eq(i).data('username');
				names += temp[i] + ',';
				if (temp[i] == "admin") {
					DisplayTips (lang.user.not_admin_del);
		            $('#lotAdminUserDelModal').modal('hide');
		            $deluser.removeClass('pink');
		            cancelSelectLi();
		            $('.js-mag-user .magtable_list').find('.js-user .other-action').find('.user-hidden-icons').css('display', 'none');
					$('.js-mag-user').find('.is-select-all').find('input').removeAttr('checked');
					return;
				}
			}
			names = names.substring(0, names.length-1);
		}
		var parameter = {
			'username': names
		};
		var dncallback = function (result){
			$modal.find('.modal-header').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips (lang.user.del_admin_user_success + names);
				$deluser.remove();
				$("#lotAdminUserDelModal").modal("hide");
				$deluser.removeClass('pink');
				//显示当前组总的用户数目也减一个
				var ulen = $('.js-mag-user .magtable_list .user-mag').length;//用来统计当前的用户个数
				$('.nav-mag-ucount').html('<span>'+ '(' + ulen + lang.user.per_user + ')' + '</span>');
				cancelSelectLi();
			}else {
				DisplayTips(lang.user.del_user + names + lang.fail + "(" + result.result + ")");
				$("#lotAdminUserDelModal").modal("hide");
				$deluser.removeClass('pink');
				cancelSelectLi();
			}
		}
		$modal.find('.modal-header').LoadData('show');
		DataModel["userRemvoe"](parameter, dncallback, true, lang.user.del_user);
	})
	// 设置对象存储用户（单个用户）
		.delegate("#b_obj_set", "click", function (){
			$modal = $('#setObjectUserModal');
			$this = $(this);
			var $objuser;
			if ($this.closest('.user-mag').length < 1) {
				$objuser = $this.closest('.user-mag-pink');
			} else{
				$objuser = $this.closest('.user-mag');
				$objuser.addClass('pink');
			}
			var name = $objuser.data('username');
			$("#setObjectUserModal .modal-body p").html (lang.user.confirm_set_object_user + ' <span style="font-size:1.5em;color:red;">' + name + '</span> '+'?');
			$modal.modal('show');
		})
		.delegate("#setObjectUserModal .btn-primary", "click", function (){
      var isFoundObj = false;
      $modal.find('.modal-header').LoadData ("show");
      DataModel['listAllStorages'](null, function (rsp) {
        $modal.find('.modal-header').LoadData ("hide");
        if (rsp.code == 200) {
          rsp.result.forEach(function (pool) {
            if (pool.application.indexOf('rgw') !== -1) isFoundObj = true;
          });
          if (isFoundObj) {
            setObjectUser();
          }else {
            DisplayTips(lang.storage.obj_pool_not_found);
          }
        }else {
          DisplayTips(lang.storage.pool_list_error);
        }

      },true, null);

      var setObjectUser = function () {

        $objuser = $('.magtable_list').find('.user-mag-pink');
  			if ($objuser.length < 1) {
  				$objuser = $('.user-mag.pink');
  			}
  			var name = $objuser.data('username');
  			var parameter = {
  				'username': name
  			};
  			var dncallback = function (result){
  				$modal.find('.modal-header').LoadData ("hide");
  				if (result == undefined)
  					return;
  				if (result.code == 200) {
  					DisplayTips(lang.user.set_objuser_success);
  					refresh();
  				}else {
  					DisplayTips(lang.user.set_objuser_fail + "(" + result.result + ")");
  				}
  				$('.mg-user-checked[type="checkbox"]:checked').prop('checked', false);
  				cancelSelectLi();
  				$modal.modal("hide");
  			}
  			$modal.find('.modal-header').LoadData ("show");
  			DataModel["objuserCreate"](parameter, dncallback, true, '');

      };


		})
		.delegate("#setObjectUserModal .btn-default", "click", function (ev){
			$objuser = $('.js-mag-user .magtable_list').find('.user-mag.pink');
			$objuser.removeClass('pink');
			cancelSelectLi();
		})
		// 删除对象存储用户（单个用户）
		.delegate("#b_obj_del", "click", function (){
			$modal = $('#delObjectUserModal');
			$this = $(this);
			var $objuser;
			if ($this.closest('.user-mag').length < 1) {
				$objuser = $this.closest('.user-mag-pink');
			} else{
				$objuser = $this.closest('.user-mag');
				$objuser.addClass('pink');
			}
			var name = $objuser.data('username');
			var access_key=$objuser.find('#b_obj_del').data('access');
			var secret_key=$objuser.find('#b_obj_del').data('secret');
      $("#delObjectUserModal").data('object_user', name);
			$("#delObjectUserModal .modal-body #access_key").html (access_key);
			$("#delObjectUserModal .modal-body #secret_key").html (secret_key);
			$("#delObjectUserModal .modal-body p").html (' <span style="color:red;">'+ lang.user.confirm_del_object_user + name +'?'+'<br />'+lang.user.confirm_del_object_user1+ '</span> ');
			$modal.modal('show');
		})
		.delegate("#delObjectUserModal .btn-danger", "click", function (){
			// $objuser = $('.js-mag-user .magtable_list').find('.user-mag-pink');
			// if ($objuser.length < 1) {
			// 	$objuser = $('.user-mag.pink');
			// }
			// var name = $objuser.data('username');

      var parameter = {
				'username': $("#delObjectUserModal").data('object_user')
			};
      $("#delObjectUserModal").data('object_user', '');

			var dncallback = function (result){
				$modal.find('.modal-header').LoadData ("hide");
				if (result == undefined)
					return;
				if (result.code == 200) {
					DisplayTips(lang.user.del_objuser_success);
					refresh();
				}else {
					DisplayTips(lang.user.del_objuser_fail + "(" + result.result + ")");
				}
				$('.mg-user-checked[type="checkbox"]:checked').prop('checked', false);
				cancelSelectLi();
				$modal.modal("hide");
			}
			$modal.find('.modal-header').LoadData ("show");
			DataModel["objuserDelete"](parameter, dncallback, true, '');
		})
		.delegate("#delObjectUserModal .btn-default", "click", function (ev){
			$objuser = $('.magtable_list_parent .magtable_list').find('.user-mag.pink');
			$objuser.removeClass('pink');
			cancelSelectLi();
		})

	// 重置管理员密码（单个用户）
	.delegate("#b_reset_adminuser", "click", function (){
		$this = $(this);
		var $resetuser;
		if ($this.closest('.user-mag').length < 1) {
			$resetuser = $this.closest('.user-mag-pink');
		} else{
			$resetuser = $this.closest('.user-mag');
			$resetuser.addClass('pink');
		}
		var name = $resetuser.data('username');
		$("#resetAdminPwdModal .modal-body p").html (lang.user.confirm_reset_user + ' <span style="font-size:1.5em;color:red;">' + name + '</span> ' + lang.user.the_pwd);
	})
	.delegate("#resetAdminPwdModal .btn-primary", "click", function (){
		$modal = $('#resetAdminPwdModal');
		$resetuser = $('.js-mag-user .magtable_list').find('.user-mag-pink');
		if ($resetuser.length < 1) {
			$resetuser = $('.user-mag.pink');
		}
		var name = $resetuser.data('username');
		var parameter = {
			'username': name
		};
		if($('.js-user.pink').length > 1){
			DisplayTips (lang.user.choose_one_user);
			$('#resetAdminPwdModal').modal('hide');
			cancelSelectLi();
			$resetuser.removeClass('pink');
			return;
		}
		if (name == "admin") {
			DisplayTips (lang.user.not_admin_resetpwd);
            $modal.modal('hide');
			$resetuser.removeClass('pink');
            cancelSelectLi();
			return;
		}
		var dncallback = function (result){
			$modal.find('.modal-header').LoadData ("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips(lang.user.resetpwd_success);
				$resetuser.removeClass('pink');
			}else {
				DisplayTips(lang.user.resetpwd_fail + "(" + result.result + ")");
				$resetuser.removeClass('pink');
			}
			$('.mg-user-checked[type="checkbox"]:checked').prop('checked', false);
			cancelSelectLi();
			$modal.modal("hide");
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel["localUserResetPwd"](parameter, dncallback, true, lang.user.reset_pwd);
	})

	.delegate("#resetAdminPwdModal .btn-default", "click", function (ev){
		$resetuser = $('.js-mag-user .magtable_list').find('.user-mag.pink');
		$resetuser.removeClass('pink');
		cancelSelectLi();
	})

	//批量重置管理员用户密码
	.delegate("#resetLotAdminPwdModal .btn-primary", "click", function (ev){
		$modal = $('#resetLotAdminPwdModal');
		$resetuser = $('.js-mag-user .magtable_list').find('.user-mag.pink');
		if ($resetuser.length <1 ) {
			$resetuser = $('.js-mag-user .magtable_list').find('.user-mag-pink.pink');
		} else{
			$resetuser = $('.js-mag-user .magtable_list').find('.user-mag.pink');
		}
		var arr = [];
		if ($resetuser.length < 1) {
			DisplayTips(lang.user.sel_the_reserpwd_user);
			$modal.modal("hide");
			return;
		} else{
			var temp = [];
			var names = '';
			var restulen = $resetuser.length;
			for (var i = 0; i < restulen-1 ; i++) {
				temp[i] = $resetuser.eq(i).data('username');
				names += temp[i] + ',';
				if (temp[i] == "admin") {
					DisplayTips (lang.user.not_admin_resetpwd);
					$('#resetLotAdminPwdModal').modal('hide');
					$resetuser.removeClass('pink');
					cancelSelectLi();
					$('.js-mag-user .magtable_list').find('.js-user .other-action').find('.user-hidden-icons').css('display', 'none');
					$('.js-mag-user').find('.is-select-all').find('input').removeAttr('checked');
					return;
				}
			}
			names +=  $resetuser.eq(restulen-1).data('username');
		}
		var parameter = {
			'username': names
		};
		var dncallback = function (result){
			$modal.find('.modal-header').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips(lang.user.resetpwd_success);
			}else {
				DisplayTips(lang.user.resetpwd_fail + "(" + result.result + ")");
			}
			$modal.modal("hide");
			$resetuser.removeClass('pink');
			$('.mg-user-checked[type="checkbox"]:checked').prop('checked', false);
			cancelSelectLi();
		}
		$modal.find('.modal-header').LoadData('show');
		DataModel["localUserResetPwd"](parameter, dncallback, true, lang.user.reset_pwd);
	})

	//修改管理员用户
	.delegate('#b_modi_adminuser', 'click', function (ev) {
		$modal = $('#adminUserModiModal');
		var $this = $(this);
		var $mduser = $this.closest('.user-mag');
		if ($mduser.length < 1) {
			$mduser = $this.closest('.user-mag-pink');
		}
		$mduser.addClass('pink');
		var name = $mduser.data('username');
		var nickname = $mduser.data('nickname');
		var email = $mduser.find('.email-user').text();
		var role = $mduser.data('role');
		$("#md_mag_name").val (trim (name));
		$("#md_mag_nickname").val (trim (nickname));
		$("#md_mag_email").val (trim (email));
		if(role == undefined){
			if($mduser.find('.permit-user').text()=='管理员'){
				$('#md-mag-role').val(2);
			}else{
				$('#md-mag-role').val(1);
			}
		}else{
			$('#md-mag-role').val(role);
		}
		$modal.modal('show');
	})
	.delegate('#adminUserModiModal .btn-primary', 'click', function (argument) {
		$modal = $('#adminUserModiModal');
		$mduser = $('.js-mag-user .magtable_list').find('.user-mag.pink');
		if ($mduser.length < 1) {
			$mduser = $('.js-mag-user .magtable_list').find('.user-mag-pink.pink');
		}
		var name = $("#md_mag_name").val ();
		var nickname = $("#md_mag_nickname").val ();
		var role = trim($('#md-mag-role option:selected').data('role'));//获取select选中的值
		var email = $("#md_mag_email").val ();
		var groupid = $mduser.data('groupid');
		if (name === "admin" && role === '1') {
			DisplayTips (lang.user.not_admin_modify);
			$('#adminUserModiModal').modal('hide');
			return;
		}
		if (email != "" && !valifyEmail(email)) {
			DisplayTips (lang.user.email_format_error);
			return;
		}
		var parameter = {
			'username': name,
			'nickname': nickname,
			'role': role,
			'email': email,
			'groupid': 10000,
		};
		var rolename = '';
		if (role == 2) {
			rolename = lang.user.administrator;
		} else if(role == 1) {
			rolename = lang.user.audit_user;
		}
		var dncallback = function (result){
			$modal.find('.modal-header').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
					$mduser.find('.email-user').text(email);
					$mduser.find('.permit-user').text(rolename);
					$mduser.data('role', role);
					DisplayTips(lang.user.modify_success);
			}else {
				DisplayTips( lang.user.edit_user_fail + "(" + result.result + ")");
			}
			$mduser.removeClass('pink');
            $('#adminUserModiModal').modal('hide');
		}
		$modal.find('.modal-header').LoadData('show');
		DataModel["userModify"](parameter, dncallback, true, lang.user.modify_local_user);
	})
	.on ( 'click', '#b_add_localuser', function (ev) {
		$modal = $('#localUserAddModal');
		if ($('#local-user-act.active').length < 1) {
			$li = $('#local-user-act ul').find('li.sub-menu.active');
			var groupid = $li.data('groupid');
			$options = $modal.find('#select-user-group').find('option');
			$options.each(function (i) {
				$option = $(this);
				if( trim( $option.data('groupid') ) == groupid ) {
					$option.siblings().removeAttr('selected');
					$option.attr('selected', 'selected');
				}
			})
		}
		$modal.modal('show');
	})
	//添加本地用户
	.delegate('#localUserAddModal .btn-primary', 'click', function (ev) {
		var name = $("#user_name").val ();
		var groupid = trim($('#select-user-group option:selected').data('groupid'));//获取select选中的值
		var nickname = $("#user_nickname").val ();
		var email = $("#user_email").val ();

		if (name == "") {
			DisplayTips (lang.user.username_empty);
			return;
		}
		if (name.length > 32) {
			DisplayTips (lang.user.name_too_long);
			return;
		}
		if (email != "" && !valifyEmail(email)) {
			DisplayTips (lang.user.email_format_error);
			return;
		}
		var parameter = {
			'username': name,
			'nickname': nickname,
			'role': 0,//本地用户角色默认为0
			'groupid': groupid,
			'email': email,
		};
		var dncallback = function (result){
			$modal.find('.modal-body').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				var html = '';
				var time = moment().format('MM/DD/YY HH:mm');
				html += '<div class="user-mag js-user" data-groupid="' + groupid + '" data-userid=' + result.result.userid + ' data-username=' + name + '>'+
							'<div class="pic-user col-lg-1">'+
								'<img src="css/image/user-mag.png" width="28px" height="28px" alt="' + name + lang.user.personal_photo +'" title="' + name + '">'+
								'<input type="checkbox" class="mg-user-checked">'+
							'</div>'+
							'<div class="name-user col-lg-2 ellipsis">'+
								'<span id="username-create" title="' + name + '">' + name + '</span>'+
							'</div>'+
							'<div class="nickname-user col-lg-2 ellipsis" title="' + nickname + '">' + nickname +
							'</div>'+
							'<div class="email-user col-lg-3 ellipsis" title="' + email + '">' + email + '</div>'+
							'<div class="createDate-user col-lg-2">' + time + '</div>'+
							'<div class="other-action col-lg-2">'+
								'<div class="user-hidden-icons">'+
					                '<span class="glyphicon glyphicon-user" id="b_obj_set" title="' + lang.user.set_objuser +'"></span>'+
									'<span class="glyphicon glyphicon-pencil" id="b_local_modi" data-toggle="modal" data-target="#localuserModiModal" title="' + lang.user.modify_local_user +'"></span>'+
									'<span class="glyphicon glyphicon-trash" id="b_local_del" data-toggle="modal" data-target="#localuserDelModal" title="'+ lang.user.del_user +'"></span>'+
									'<span class="glyphicon glyphicon-th"  id="b_reset_local" title="' + lang.user.reset_pwd +'"></span>'+
								'</div>'+
							'</div>'+
						'</div>';
				$norecord = $('.js-local-user .no-record-parent');
				if ( $norecord.length > 0 ) {
					$('.js-local-user .magtable_list').html(html);
				} else{
					$('.js-local-user .magtable_list').prepend(html);
				}
				DisplayTips(lang.user.add_user_success);
        var txt = $('.statistics-user .nav-local-ucount').find('span').text();
				var spancount = parseInt(txt) + 1;
				$('.statistics-user .nav-local-ucount').find('span').text( spancount );
			}else {
				DisplayTips(lang.user.add_user_fail + "(" + result.result + ")");
			}
            $('#localUserAddModal').modal('hide');
		}
		$modal.find('.modal-body').LoadData('show');
		DataModel["userCreate"](parameter, dncallback, true, lang.user.add_local_user);
	})
	//修改本地用户
	.delegate('#b_local_modi', 'click', function (ev) {
		var $this = $(this);
		var $mduser = $this.closest('.user-mag');
		$mduser.addClass('pink');
		if ($mduser.length < 1) {
			$mduser = $this.closest('.user-mag-pink');
		}
		var name = $mduser.find('.name-user').text();
		var nickname = $mduser.find('.nickname-user').text();
		var email = $mduser.find('.email-user').text();
		var groupid = $mduser.data('groupid');
		$options = $('#md-local-group').find('option');
		$options.each(function (i) {
			if( trim( $(this).data('groupid') ) == groupid ) {
				$(this).siblings().removeAttr('selected');
				$(this).attr('selected', 'selected');
			}
		});

		$("#md_local_name").val (trim (name));
		$("#md_local_nickname").val (trim (nickname));
		$("#md_local_email").val (trim (email));
	})
	.delegate('#localuserModiModal .btn-primary', 'click', function (argument) {
		$modal = $('#localuserModiModal');
		var name = $("#md_local_name").val ();
		var nickname = $("#md_local_nickname").val ();
		var groupid = trim($('#md-local-group option:selected').data('groupid'));//获取select选中的值
		var groupname = trim($('#md-local-group option:selected').text());//获取select选中的值
		var email = $("#md_local_email").val ();
		if (email != "" && !valifyEmail(email)) {
			DisplayTips (lang.user.email_format_error);
			return;
		}
		var parameter = {
			'username': name,
			'nickname': nickname,
			'groupid': groupid,
			'email': email,
		};
		$mduser = $('.js-local-user .magtable_list').find('.user-mag.pink');
		if ($mduser.length < 1) {
			$mduser = $('.js-local-user .magtable_list').find('.user-mag-pink.pink');
		}
		var curgroupname = $mduser.data('groupname');
		var dncallback = function (result){
			$modal.find('.modal-header').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				var curgroupid = $mduser.data('groupid');
				if( curgroupid == groupid){
					//判断是否修改了groupid，如果组id不变，执行下面的代码
					$mduser.find('.email-user').text(email);
					$mduser.find('.nickname-user').text(nickname);
	                $('#localuserModiModal').modal('hide');
					$mduser.removeClass('pink');
					DisplayTips(lang.user.modify_success);
				} else {
					//就说明移动了组，那么要在当前组中删除该组员，并添加到移入的组中
					$mduser.remove();
					//如果curgroupname为undefined或者null，说明此时是在所有用户中
					DisplayTips(lang.user.modify_success + lang.user.has_user + name + lang.user.add_the_group + groupname + "," + lang.user.and_from_the_group);
	                $modal.modal('hide');
				}
			}else {
				DisplayTips( lang.user.edit_user_fail + "(" + result.result + ")");
                $('#localuserModiModal').modal('hide');
				$mduser.removeClass('pink');
			}
		}
		$modal.find('.modal-header').LoadData('show');
		DataModel["userModify"](parameter, dncallback, true, lang.user.modify_local_user);
	})
	//修改本地用户信息时，点击“关闭”或者叉掉模态框时，移出pink类
	.delegate('#localuserModiModal .btn-default', 'click', function (argument) {
		$mduser = $('.js-local-user .magtable_list').find('.user-mag.pink');
		$mduser.removeClass('pink');
	})
	.delegate('#adminUserModiModal .btn-default', 'click', function (argument) {
		$mduser = $('.js-mag-user .magtable_list').find('.user-mag.pink');
		$mduser.removeClass('pink');
	})
	.delegate('#localuserModiModal .close', 'click', function (argument) {
		$mduser = $('.js-local-user .magtable_list').find('.user-mag.pink');
		$mduser.removeClass('pink');
	})
	.on( 'click', '.b_modify_localuser', function (ev) {
		$modal = $('#localUserMoveModal');
		$modal.modal('show');
	})
	//移动至某个群组中
		.delegate('#localUserMoveModal .btn-primary', 'click', function (ev) {
			$modal = $('#localUserMoveModal');
			$moveuser = $('.js-local-user .magtable_list').find('.user-mag-pink');
			var name = [];
			var nickname = [];
			var email = [];
			for(var i=0;i<$moveuser.length;i++){
				name.push($moveuser.eq(i).data('username'));
				var arrNickname = $('.js-local-user .magtable_list').find('.user-mag-pink:eq('+i+')').find('.nickname-user').html();
				if(arrNickname != undefined){
					nickname.push(arrNickname);
				}else{
					nickname.push('');
				}
				var arrEmail = $('.js-local-user .magtable_list').find('.user-mag-pink:eq('+i+')').find('.email-user').html();
				if(arrEmail != undefined){
					email.push(arrEmail);
				}else{
					email.push('');
				}
			}
			var groupid = trim($('#moveto-local-group option:selected').data('groupid'));//获取select选中的值的groupid
			var groupname = trim($('#moveto-local-group option:selected').text());//获取select选中的值

			var parameter = {
				'username': name,
				'nickname': nickname,
				'email': email,
				'groupid': groupid,
			};
			var curgroupid = $moveuser.data('groupid');
			var curgroupname = $moveuser.data('groupname');
			if (name == 'admin') {
				DisplayTips(lang.user.admin_not_move);
				$('#localUserMoveModal').modal('hide');
				$moveuser.removeClass('pink');
				cancelSelectLi();
				return false;
			}

			if (curgroupid == groupid) {
				DisplayTips(lang.user.has_cur_group);
				$('#localUserMoveModal').modal('hide');
				$moveuser.removeClass('pink');
				cancelSelectLi();
				return false;
			}
			var dncallback = function (result){
				removeWaitMask();
				$modal.find('modal-header').LoadData('hide');
				if (result == undefined)
					return;
				if (result.code == 200) {
					var curgroupid = $('#local-user-act>ul>li.active').data('groupid');
					//就说明移动了组，那么要在当前组中删除该组员，并添加到移入的组中
					if ( $('#local-user-act.active').length < 1 ) {
						$moveuser.remove();
					}
					//如果curgroupname为undefined或者null，说明此时是在所有用户中
					DisplayTips(lang.user.move_group_success + lang.user.has_user + name + lang.user.add_the_group + groupname + "," + lang.user.and_from_the_group);
				}else if(result.code == 300){
					DisplayTips( lang.user.move_group_fail + result.failed.toString());
					$moveuser.removeClass('pink');
					setTimeout(refresh,2000);
				}
				$modal.modal('hide');
				$moveuser.removeClass('pink');
				cancelSelectLi();
			}
			$modal.find('modal-header').LoadData('show');
			addWaitMask();
			DataModel["userMoveGroup"](parameter, dncallback, true, lang.user.modify_local_user);
		})
	//删除本地用户群组
	.delegate(".b_del_localgroup", 'click', function (){
		var curGid = $('.nav-local-gname span').data('groupid');
		console.log(curGid);
		if (curGid === 10001) {
			DisplayTips(lang.user.cannot_del_default_group);
			return;
		}
		var $groupusers = $('.js-local-user .magtable_list').find('.user-mag');
		var gcount = $groupusers.length;
		if (gcount == 0) {
			$('.noone-in-localgroup').css('display', 'block');
			$('.del-group-users').css('display', 'none');
			$('.del-group-not-users').css('display', 'none');
		} else {
			$('#del-local-group option').attr('disabled',null);
			$('#del-local-group option[data-groupid="' + curGid + '"]').attr('disabled','');
			$('.noone-in-localgroup').css('display', 'none');
			$('.del-group-users').css('display', 'block');
			$('.del-group-not-users').css('display', 'block');
		}
		$("#localUserDelGroupModal").modal('show');
	})
	.delegate("#localUserDelGroupModal .btn-danger", "click", function (){
		$modal = $('#localUserDelGroupModal');
		var $groupusers = $('.js-local-user .magtable_list').find('.user-mag');
		var gcount = $groupusers.length;
		$curgroup = $('#local-user-act ul>li.active');
        $curuserlist = $('.js-local-user').find('.magtable_list');
		var groupid = $curgroup.data('groupid');
		if (gcount == 0) {
			var parameter = {
				'userop': 0,
				'groupid': groupid,
			};
			var dncallback = function (result){
				$modal.find('.modal-header').LoadData('hide');
				if (result == undefined)
					return;
				if (result.code == 200) {
					$curgroup.remove();
                    $('.statistics-user').css('display', 'none');
					DisplayTips (lang.user.del_localgroup_success);
					setTimeout(function() {
						refresh();
					}, 2e3);
				} else {
					DisplayTips (lang.user.del_localgroup_fail);
				}
				$("#localUserDelGroupModal").modal('hide');
			}
			$modal.find('.modal-header').LoadData('show');
			DataModel["localGroupRemvoe"](parameter, dncallback, true, lang.user.del_group);
		} else {
			var userop = $("input[type='radio']:checked").val();
			var destgrp = $('#del-local-group option:selected').data('groupid');
			if ($('.has-in-localgroup').hasClass('hidden')) {
				destgrp = '';
			}
			var parameter = {
				'userop': userop,
				'groupid': groupid,
				'destgrpid': destgrp,
			};
			var dncallback = function (result){
				$modal.find('.modal-header').LoadData('hide');
				if (result == undefined)
					return;
				if (result.code == 200) {
					$curgroup.remove();
                    $curuserlist.empty();
					$('.statistics-user').css('display', 'none');
					$('.has-in-localgroup').addClass('hidden');
					DisplayTips (lang.user.del_localgroup_success);
					if ( destgrp == '' ) {
						var htm = '<div class="no-record-parent">' +
								'<span class="no-record">' +
						   		lang.user.no_record +
						   		'</span>'+
						   '</div>';
						$('.js-local-user').find('.magtable_list').html(htm);
					}
					setTimeout(function() {
						refresh();
					}, 2e3);
				} else {
					DisplayTips (lang.user.del_localgroup_fail + "(" + result.result + ")");
				}
				$("#localUserDelGroupModal").modal('hide');
			}
			$('#localUserDelGroupModal .del-group-users input').prop('checked',true);
			$modal.find('.modal-header').LoadData('show');
			DataModel["localGroupRemvoe"](parameter, dncallback, true, lang.user.del_group);
		}
	})
	//当用户点击取消或者关闭模态框窗口的时候，
	.delegate("#localUserDelGroupModal", "hidden.bs.modal", function (){
		$('.has-in-localgroup').addClass('hidden');
		$('#localUserDelGroupModal .del-group-users input').prop('checked',true);
	})
	.delegate(".del-group-not-users input[type='radio']:checked", 'click', function (ev) {
		$('.has-in-localgroup').removeClass('hidden');
	})
	.delegate(".del-group-users input[type='radio']:checked", 'click', function (ev) {
		$('.has-in-localgroup').addClass('hidden');
	})
	// 删除本地用户
	.delegate("#b_local_del", 'click', function (){
		var $this = $(this);
		$deluser = $this.closest('.user-mag');
		$deluser.addClass('pink');
		if ($deluser.length < 1) {
			$deluser = $this.closest('.user-mag-pink.pink');
		}
		var name = $deluser.data('username');
		$("#localuserDelModal").data('username', name);
		$("#localuserDelModal").modal();
		$("#localuserDelModal .modal-body p").html (lang.user.confirm_del_user + '<span style="font-size:1.5em;color:red;">' + name + '</span>'+ " ?");
	})
	.delegate("#localuserDelModal .btn-primary", "click", function (){
		$modal = $('#localuserDelModal');
		// $deluser = $('.js-local-user .magtable_list').find('.user-mag.pink');
		// if ($deluser.length < 1) {
		// 	$deluser = $('.js-local-user .magtable_list').find('.user-mag-pink');
		// }
		var name = $modal.data('username');
		if($('.user-mag-pink.pink').length > 1){
			DisplayTips (lang.user.choose_one_user);
			$('#localuserDelModal').modal('hide');
			cancelSelectLi();
			$deluser.removeClass('pink');
			return;
		}
		if (name == "admin") {
			DisplayTips (lang.user.not_admin_del);
            $modal.modal('hide');
            cancelSelectLi();
			return;
		}
		var parameter = {
			'username': name,
		};
		var dncallback = function (result){
			$modal.find('.modal-header').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips (lang.user.del_local_user_success);
				$deluser.remove();
				$("#localuserDelModal").modal("hide");
				$deluser.removeClass('pink');
				//显示当前组总的用户数目也减一个
				// $('.nav-local-ucount').
				var ulen = $('.js-local-user .magtable_list .user-mag').length;//用来统计当前的用户个数
				$('.nav-local-ucount').html( '( <span>' +ulen + '</span> '+ '个用户 )');
				cancelSelectLi();
			}else {
				DisplayTips(lang.user.del_user + name + lang.fail + "(" + result.result + ")");
				$modal.modal("hide");
				$deluser.removeClass('pink');
				cancelSelectLi();
			}
		}
		$modal.find('.modal-header').LoadData('show');
		DataModel["userRemvoe"](parameter, dncallback, true, lang.user.del_user);
	})
	//批量删除本地用户
	.delegate("#lotLocaluserDelModal .btn-primary", "click", function (){
		$modal = $('#lotLocaluserDelModal');
		$deluser = $('.js-local-user .magtable_list').find('.user-mag.pink');
		if ($deluser.length <1) {
			$deluser = $('.js-local-user .magtable_list').find('.user-mag-pink');
		}
		var arr = [];
		if ($deluser.length < 1) {
			DisplayTips(lang.user.sel_the_del_user);
			$("#lotLocaluserDelModal").modal("hide");
			return;
		} else{
			var temp = [];
			var names = '';
			var delulen = $deluser.length;
			for (var i = 0; i < delulen-1 ; i++) {
				temp[i] = $deluser.eq(i).data('username');
				names += temp[i] + ',';
				if (temp[i] == "admin") {
					DisplayTips (lang.user.not_admin_del);
		            $('#lotLocaluserDelModal').modal('hide');
		            cancelSelectLi();
					return;
				}
			}
			names +=  $deluser.eq(delulen-1).data('username');
		}
		var parameter = {
			'username': names
		};
		var dncallback = function (result){
			$modal.find('.modal-header').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips (lang.user.del_local_user_success);
				$deluser.remove();
				$("#lotLocaluserDelModal").modal("hide");
				$deluser.removeClass('pink');
				//显示当前组总的用户数目也减一个
				var ulen = $('.js-local-user .magtable_list .user-mag').length;//用来统计当前的用户个数
				$('.nav-local-ucount').html('<span>'+ '(' + ulen + '个用户)' + '</span>');
				cancelSelectLi();
				$('.has-selected-users').css('display', 'none');
			}else {
				DisplayTips(lang.user.del_user + name + lang.fail + "(" + result.result + ")");
				$("#lotLocaluserDelModal").modal("hide");
				$deluser.removeClass('pink');
				cancelSelectLi();
			}
		}
		$modal.find('.modal-header').LoadData('show');
		DataModel["userRemvoe"](parameter, dncallback, true, lang.user.del_user);
	})

	//删除本地用户信息时，点击“关闭”或者叉掉模态框时，移出pink类
	.delegate('#localuserDelModal .btn-default', 'click', function (argument) {
		$mduser = $('.js-local-user .magtable_list').find('.user-mag.pink');
		$mduser.removeClass('pink');
	})
	.delegate('#localuserDelModal .close', 'click', function (argument) {
		$mduser = $('.js-local-user .magtable_list').find('.user-mag.pink');
		$mduser.removeClass('pink');
	})
	// 重置密码（单个用户）
	.delegate("#b_reset_local", "click", function (){
		$modal = $('#resetLocalPwdModal');
		$resetuser = $(this).closest('.user-mag');
		$resetuser.addClass('pink');
		if ($resetuser.length < 1) {
			$resetuser = $(this).closest('.user-mag-pink');
		}
		var name = $resetuser.data('username');
		$modal.find(".modal-body p").html (lang.user.confirm_reset_user + '<span style="font-size:1.5em;color:red;"> ' + name + '</span>' + lang.user.the_pwd);
		$modal.modal('show');
	})
	.delegate("#resetLocalPwdModal .btn-primary", "click", function (){
		$modal = $('#resetLocalPwdModal');
		if($('.user-mag-pink.pink').length > 1){
			DisplayTips (lang.user.choose_one_user);
			$('#resetLocalPwdModal').modal('hide');
			cancelSelectLi();
			$resetuser.removeClass('pink');
			return;
		}
		$resetuser = $('.js-local-user .magtable_list').find('.user-mag.pink');
		if ($resetuser.length < 1) {
			$resetuser = $('.js-local-user .magtable_list').find('.user-mag-pink');
		}
		var name = $resetuser.data('username');
		var parameter = {
			'username': name
		};
		var dncallback = function (result){
		$modal.find('.modal-header').LoadData ("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips(lang.user.resetpwd_success);
				$modal.modal("hide");
				$resetuser.removeClass('pink');
				$('.mg-user-checked[type="checkbox"]:checked').prop('checked', false);
			}else {
				DisplayTips(lang.user.resetpwd_fail + "(" + result.result + ")");
				$modal.modal("hide");
				$resetuser.removeClass('pink');
				$('.mg-user-checked[type="checkbox"]:checked').prop('checked', false);
			}
			$('.mg-user-checked[type="checkbox"]:checked').prop('checked', false);
			cancelSelectLi();
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel["localUserResetPwd"](parameter, dncallback, true, lang.user.reset_pwd);
	})
	.delegate("#resetLocalPwdModal .btn-default", "click", function (){
		$resetuser = $('.js-local-user .magtable_list').find('.user-mag.pink');
		$resetuser.removeClass('pink');
	})
	//批量重置本地用户密码
	.delegate("#resetLotLocalPwdModal .btn-primary", "click", function (){
		$modal = $('#resetLotLocalPwdModal');
		$resetuser = $('.js-local-user .magtable_list').find('.user-mag.pink');
		if ($resetuser.length < 1) {
			$resetuser = $('.js-local-user .magtable_list').find('.user-mag-pink');
		}
		var arr = [];
		if ($resetuser.length < 1) {
			DisplayTips(lang.user.sel_the_reserpwd_user);
			$modal.modal("hide");
			return;
		} else{
			var temp = [];
			var names = '';
			var restulen = $resetuser.length;
			for (var i = 0; i < restulen-1 ; i++) {
				temp[i] = $resetuser.eq(i).data('username');
				names += temp[i] + ',';
			}
			names +=  $resetuser.eq(restulen-1).data('username');
		}
		var parameter = {
			'username': names
		};
		var dncallback = function (result){
			$modal.find('.modal-header').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips(lang.user.resetpwd_success);
				$modal.modal("hide");
				$resetuser.removeClass('pink');
				$('.mg-user-checked[type="checkbox"]:checked').prop('checked', false);
			}else {
				DisplayTips(lang.user.resetpwd_fail + "(" + result.result + ")");
				$modal.modal("hide");
				$resetuser.removeClass('pink');
				$('.mg-user-checked[type="checkbox"]:checked').prop('checked', false);
			}
			$('.mg-user-checked[type="checkbox"]:checked').prop('checked', false);
			cancelSelectLi();
		}
		$modal.find('.modal-header').LoadData('show');
		DataModel["localUserResetPwd"](parameter, dncallback, true, lang.user.reset_pwd);
	})
	//添加用户组
	.delegate('#userAddGroupModal .btn-primary', 'click', function (ev) {
		$modal = $('#userAddGroupModal');
		var name = $("#group_name").val ();
		var nickname = $("#group_nickname").val ();
		//var memo = $("#group_memo").val ();

		if (name == "") {
			DisplayTips (lang.user.groupname_is_empty);
			return;
		}
		var parameter = {
			'groupname': name,
			'nickname': nickname,
			'description': '',
		};
		var dncallback = function (result){
			$modal.find('.modal-header').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				// refresh ();
				DisplayTips( lang.user.add_group_success);
				//提示添加成功，并把用户组添加到左边的导航栏上
				var html = '';
				var namearr = '';
                var optionhtml = '';
				if (nickname != '') {
					namearr = name + '(' + nickname + ')';
				} else{
					namearr = name;
				}
				html = 	'<li class="sub-menu" data-groupid="'+ result.result.groupid +'" data-groupname="' + name +'" title="' + name + '">'+
			        		'<a href="javascript:void(0);">'+
			        			'<img src="css/image/group.png">'+ namearr;
			        		'</a>'+
		        		'</li>';

                opthtm =    '<option data-groupid="'+ result.result.groupid +'" title="' + nickname + '" >' + namearr +
                            '</option>';
				$('#local-user-act .d-menu li:last').before(html);
                $('#localUserMoveModal').find('#moveto-local-group').append(opthtm);
                $('#localUserDelGroupModal').find('#del-local-group').append(opthtm);
                $('#localUserAddModal').find('#select-user-group').append(opthtm);
                $('#localuserModiModal').find('#md-local-group').append(opthtm);

			}else {
				DisplayTips( lang.user.add_group_fail + "(" + result.result + ")");
			}
			$modal.modal("hide");
		}
		$modal.find('.modal-header').LoadData('show');
		DataModel["groupCreate"](parameter, dncallback, true, lang.user.add_group);
	})
	.delegate('.load-moreuser .js-load-moreuser', 'click', function (ev) {
		var userlen = $('.magtable_list .user-mag').length -1;
		var perpage = 10;//每次点击“加载更多”显示的页数
		curpage = userlen / perpage;
		nextpage = curpage + 1;//要请求的下一页页数
		var para = {
			'page': nextpage,
			'perpage': perpage
		};
		var html = '';
		var dncallback = function (data){
			if (data == undefined)
				return;
			if (data.code == 200) {
				$('.load-moreuser').remove();
				var $res = data.result;
				for (var i = 0; i < $res.length; i++) {
					html += '<div class="user-mag" data-userid=' + $res[i]["userid"] + '>'+
								'<div class="pic-user col-lg-1">'+
									'<img src="css/image/user-mag.png" width="28px" height="28px" alt="' + $res[i]["username"] + lang.user.personal_photo +'" title="' + $res[i]["username"] + '">'+
									'<input type="checkbox" class="mg-user-checked">'+
								'</div>'+
								'<div class="name-user col-lg-2 ellipsis">'+
									'<span id="username-create" title="' + $res[i]["username"] + '">' + $res[i]["username"] + '</span>'+
								'</div>'+
								'<div class="permit-user col-lg-1">';
								if($res[i]["userid"] == '10000'){
									html += lang.user.administrator;
								}else{
									html += lang.user.audit_user;
								}
						html += '</div>'+
								'<div class="discrb-user col-lg-2 ellipsis" title="' + $res[i]["description"] + '">' + $res[i]["description"] + '</div>'+
								'<div class="email-user col-lg-2" title="' + $res[i]["email"] + '">' + $res[i]["email"] + '</div>'+
								'<div class="createDate-user col-lg-2">' + $res[i]["createtime"] + '</div>'+
								'<div class="other-action col-lg-2">'+
									'<div class="user-hidden-icons">'+
										'<span class="glyphicon glyphicon-pencil" id="b_modi" data-toggle="modal" data-target="#localuserModiModal" title="' + lang.user.modify_user + '"></span>'+
										'<span class="glyphicon glyphicon-trash" data-toggle="modal" data-target="#userDelModal" title="' + lang.user.del_user + '"></span>'+
										'<span class="glyphicon glyphicon-th" data-toggle="modal" data-target="#resetLocalPwdModalLabel" title="'+ lang.user.reset_pwd +'"></span>'+
									'</div>'+
								'</div>'+
							'</div>';
				};
				var	html2 = '<div class="load-moreuser">'+
							'<a herf="javascript:;" class="js-load-moreuser">'+ lang.user.click_load_more +'</a>'+
						'</div>';
				var notload = data.count - userlen;
				if (notload > perpage) {
					html += html2;
				}
				$('.magtable_list').append(html);
			}else {
				DisplayTips(load_fail + "(" + data.msg + ")");
			}
		}
		DataModel["listAllUser"](para, dncallback, true);
	})
	.delegate('#domain_exit', 'click', function (argument) {
	})
	//加入域
	.delegate('#addDomainModal .btn-primary', 'click', function (ev) {
		$modal = $('#addDomainModal');

		//先判断NAS集群是否做了初始化
		var rolecallback = function (result){
			$modal.find('.modal-header').LoadData ("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
				var role = result.result.role;
				//对role进行说明
				//role 0：未知；1：单机，2：主备，3：双机；4：集群
				//只有role等于4的时候，才允许执行加入域的操作
				if ( role == 4 ) {
					$modal.find('.modal-header').LoadData ("show");
					DataModel["joinDomain"](parameter, dncallback, true, lang.user.join_domain);
				} else {
					DisplayTips( lang.user.notinit_nas_not_permit_joindomain );
				}
			}
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel["getCnasRole"](parameter, rolecallback, true, null);

		var domain = trim( $('#add_belong_domain').val() );
		var domaincontroller = trim( $('#add_domain_controller_host').val() );
		var dns = trim( $('#add_domain_name').val() );
		var uname = trim( $('#add_domain_user').val() );
		var passwd = trim( $('#add_domain_pwd').val() );
		if ( domain == '' || domaincontroller == '' || dns == '' || uname == '' || passwd == '') {
			DisplayTips(lang.user.all_value_not_null_befor_submit);
			return false;
		}

		var parameter = {
			'domain': domain,
			'domaincontroller': domaincontroller,
			'dns': dns,
			'uname': uname,
			'passwd': Base64.encode(passwd),
		};
		var dncallback = function (result){
			$modal.find('.modal-header').LoadData ("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips(lang.user.join_domain_success);
				// $('#isadddomain').css('display', 'none');//退出域相关
				refresh ();
			}else {
				DisplayTips( lang.user.join_domain_fail + "(" + result.result + ")");
			}
			$modal.modal('hide');
		}
	})
	//退出域
	.delegate('#exitDomainModal .btn-primary', 'click', function (ev) {
		$modal = $('#exitDomainModal');
		var domain = trim( $('#belong_domain').val() );
		var domaincontroller = trim( $('#domain_controller_host').val() );
		var dns = trim( $('#domain_name').val() );
		var uname = trim( $('#domain_user').val() );
		var passwd = trim( $('#domain_pwd').val() );
		if ( domain == '' || domaincontroller == '' || dns == '' || uname == '' || passwd == '') {
			DisplayTips(lang.user.all_value_not_null_befor_submit);
			return false;
		}
		var parameter = {
			'domain': domain,
			'domaincontroller': domaincontroller,
			'dns': dns,
			'uname': uname,
			'passwd': Base64.encode(passwd),
		};
		var dncallback = function (result){
			$modal.find('.modal-header').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips(lang.user.out_domain_success);
				$('#isadddomain').css('display', 'none');//退出域相关

			}else {
				DisplayTips( lang.user.out_domain_fail + "(" + result.result + ")");
			}
			refresh ();
			$modal.modal('hide');
		}
		$modal.find('.modal-header').LoadData('show');
		DataModel["logoutDomain"](parameter, dncallback, true, lang.user.out_domain);
	})
	//按username排序(升/降序)
	.delegate('.orderby_name_sort', 'click', 'orderby_name', orderByOption)
	//按createtime排序
	.delegate('.orderby_createtime_sort', 'click', 'orderby_createtime', orderByOption)
	//按nickname排序
	.delegate('.orderby_nickname_sort', 'click', 'orderby_nickname', orderByOption)
	//加入LDAP域
	.on('click', '#joinLdapModal .btn-primary', function (ev) {
		$modal = $('#joinLdapModal');

		//先判断NAS集群是否做了初始化
		var rolecallback = function (result){
			$modal.find('.modal-header').LoadData ("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
				var role = result.result.role;
				//对role进行说明
				//role 0：未知；1：单机，2：主备，3：双机；4：集群
				//只有role等于4的时候，才允许执行加入域的操作
				if ( role == 4 ) {
					$modal.find('.modal-header').LoadData ("show");
					DataModel['joinLDAP'](para, joinCallback, true, null);
				} else {
					DisplayTips( lang.user.notinit_nas_not_permit_joindomain );
				}
			}
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel["getCnasRole"](parameter, rolecallback, true, null);

		var server = trim($modal.find('#add_server').val());
		var basedn = trim($modal.find('#add_base_dn').val());
		var admindn = trim($modal.find('#add_admin_dn').val());
		var domain = trim($modal.find('#ldap_domain').val());
		var password = trim($modal.find('#add_ldap_pwd').val());

		if (!server || !basedn || !admindn || !domain || !password) {
			DisplayTips(lang.user.input_domain_info);
			return;
		}

		var para = {
			'server': server,
			'basedn': basedn,
			'admindn': admindn,
			'domain': domain,
			'password': Base64.encode(password)
		}

		var joinCallback = function (result) {
			$modal.find('.modal-header').LoadData('hide');
			if (!result) {
				return;
			}
			if (result.code === 200) {
				DisplayTips(lang.user.join_domain_success);
				setTimeout(function() {
					refresh();
				}, 1.5e3);
			} else {
				DisplayTips(lang.user.join_domain_fail);
			}
		}
		$modal.find('.modal-header').LoadData('show');
	})
	.on('click', '#leaveLdapModal .btn-primary', function (ev) {

		var leaveCallback = function (result) {
			$('#leaveLdapModal .modal-header').LoadData('hide');
			if (!result) {
				return;
			}
			if (result.code === 200) {
				refresh();
			} else {
				DisplayTips('fail');
			}
		}

		$('#leaveLdapModal .modal-header').LoadData('show');
		DataModel['leaveLDAP'](null, leaveCallback, true, null);
	})

	//搜索
	//管理员
	.delegate('#js-allsearch-magbtn', 'click', function (ev) {
		searchAdmin();
	})
	.delegate('#js-filter-mag', 'keypress', function (ev) {
		var keycode = event.which;
		if(keycode == 13){
			searchAdmin();
		}
	})
	.delegate( '#js-filter-mag', 'keyup', function (ev) {
		clearTimeout(timeSear);
		timeSear = setTimeout(searchAdmin, 600);
	})
	//域用户
	.delegate('#js-allsearch-domainbtn', 'click', function (ev) {
		searchDomain();
	})
	.delegate('#js-filter-domain', 'keypress', function (ev) {
		var keycode = event.which;
		if(keycode == 13){
			searchDomain();
		}
	})
	.delegate( '#js-filter-domain', 'keyup', function (ev) {
		clearTimeout(timeSear);
		timeSear = setTimeout(searchDomain, 600);
	})
	//本地用户
	.delegate('#js-allsearch-localbtn', 'click', function (ev) {
		searchLoacl();
	})
	.delegate('#js-filter-local', 'keypress', function (ev) {
		var keycode = event.which;
		if(keycode == 13){
			searchLoacl();
		}
	})
	.delegate( '#js-filter-local', 'keyup', function (ev) {
		clearTimeout(timeSear);
		timeSear = setTimeout(searchLoacl, 600);
	})
	.delegate('#js-filter-local', 'keyup', function (ev) {
		var keycode = event.which;
		var $this = $(this);
		var val = trim( $this.val() );
		if (val == '' || val == null) {
			$('.cancel-search').css('display', 'none');//取消搜索出现
			$('.statistics-user').css('display', 'inline');
			$('.has-matched-users').css('display', 'none');
			$('.js-local-user .magtable_list .user-mag').show();
			$('.js-local-user .magtable_list .user-mag').find('.highlight').removeClass('highlight');
		} else{
			$('.cancel-search').css('display', 'inline');//取消搜索出现
			$('.statistics-user').css('display', 'none');//统计当前组用户消失
			// $('.has-matched-users').css('display', 'inline');//匹配出现
			var $namematch = $('.js-local-user .magtable_list .name-matched');
			var len = $namematch.length;
			//len大于0，说明此时有用户列表，可以进行匹配
			// if (len > 0 ) {
			// 	for (var i = 0; i < $namematch.length; i++) {
			// 		highlight( val, $namematch[i]);//把匹配的结果高亮显示
			// 		var localLi = $namematch[i].closest('.user-mag');
			// 		var hlen = $(localLi).find('.highlight').length;
			// 		if (hlen < 1) {
			// 			$(localLi).hide();
			// 		} else {
			// 			$(localLi).show();
			// 		}
			// 	}
			// 	//并隐藏不匹配的元素
			// }
		}
		autoMagtabHeight();
	})
	.delegate('.cancel-selectusers a', 'click', function (ev) {
		cancelSelectLi();
	})
	.delegate('.cancel-search', 'click', function (ev) {
		cancelSelectLi();
		$(this).css('display', 'none');
		$('#js-filter-local').val('');
		//该出现的出现，该消失的消失之后，再次列举出当前组的信息
		var gid = $(this).data('groupid');
		// $('.nav-local-gname').html('<span data-groupid="'+ gid +'">' + gname + '</span>');
		//还要列举出当前用户组下的用户
		var $group = $('#local-user-act ul>li.active');
		var glen = $group.length;
		var groupid = $group.data('groupid');
		if (glen > 0) {
			//说明groupid存在
			var parameter = {
				'groupid': groupid||'',
				'page': 1,
				'perpage': -1,
			};
			var dncallback = localUserCallback;
			DataModel["listUsersByGroupid"](parameter, dncallback, true, lang.user.list_sub_local_user);
		} else{
			if($('#mag-user-act').attr('class')=='active'){
				$('#js-filter-mag').val('');
				searchAdmin();
			}else{
				$('#js-filter-local').val('');
				searchLoacl();
			}
		}

	})
	.on('mouseover', '.user-mag', userMouseover)
	.on('mouseout', '.user-mag', userMouseout);
	$('.magtable_list').on('mouseover', '.user-mag', userMouseover);
	$('.magtable_list').on('mouseout', '.user-mag', userMouseout);
	$('.magtable_list_parent').scroll(function(event){
        var htmlHeight=$(this)[0].scrollHeight||$(this)[0].scrollHeight;
        var clientHeight=$(this)[0].clientHeight||$(this)[0].clientHeight;
        var scrollTop=$(this)[0].scrollTop||$(this)[0].scrollTop;
        //原本监听的是滚动到底部，但是不知道我修改了什么，为避免样式影响，当距离底部50px的时候，就执行该事件
        if(scrollTop+clientHeight > htmlHeight - 50){
			// alert('到底部');
			//监听当滚动到div的底部的时候，就发请求进行分页处理
			usersPagination();
        }

    });

    //处理管理员、本地用户、域用户的分页问题
    function usersPagination (argument) {
		var len = $('.magtable_list .js-user').length;
		var curpage = len/30;
		var nextpage = curpage + 1;
    	if ( $('.js-mag-user').css('display') != 'none' ) {
			//对管理员用户进行分页显示
			// adminUserList(result);
		} else if ($('.js-local-user').css('display') != 'none') {
			//对本地用户进行分页显示
			// localUserList(result);
		} else if($('.js-domain-user').css('display') != 'none'){
			//对域用户进行分页显示
			var groupname = $('#domain-user-act li.active').data('groupname');
			var para = '';
			var dncallback = function (data){
                $('.js-domain-user').LoadData('hide');
				if (data == undefined)
					return;
				if (data.code == 200) {
                    if(data.result.length == 0){
                        //DisplayTips(lang.user.all_users_loaded);
                        return;
                    }
                    else{
                        var htm = domainUserList(data);
                        $('.js-domain-user .magtable_list').append(htm);
                        autoMagtabHeight();
                    }
				}else {
					DisplayTips( lang.user.list_sub_domainuser_fail + "(" + data.msg + ")");
				}
			}

			if ( $('#domain-user-act.active').length > 0 ) {
				para = {
					'page': nextpage,
					'perpage': 30,
				};
                $('.js-domain-user').LoadData('show');
				DataModel["listAllDomainUserInfo"](para, dncallback, true, null);
			} else {
				para = {
					'page': nextpage,
					'perpage': 30,
					'groupname': groupname,
				};
                $('.js-domain-user').LoadData('show');
				DataModel["listADUsersByName"](para, dncallback, true, null);
			}
		}
    }

	//列举本地用户列表的回调函数
	function localUserCallback(data){
		if (data == undefined)
			return;
		if (data.code == 200) {
			$('.navbar-right').find('.has-selected-users').css('display', 'none');
			$('.cancel-selectusers').css('display', 'none');
			$('.is-select-all').css('display', 'none');
			$('.nav-local-ucount').html( '(' + '<span>' + data.count + '</span>' + lang.user.the_users +')');
			localUserList(data);
			autoMagtabHeight();
			$('.js-local-user .statistics-user').css('display', 'inline');
			$('.js-local-user .has-matched-users').css('display', 'none');
		}else {
			DisplayTips( lang.user.list_subuser_fail + "(" + data.msg + ")");
		}
	}
	//本地用户列表显示
	function localUserList (data) {
		$('.dt_system_bar').LoadData('show');
		addWaitMask();
		DataModel["objuserList"](null, objusercallback, true, null);
		var html = '';
		$('.js-local-user .magtable_list').html('');
			var $res = data.result;
			if ( $res.length < 1 ) {
				html = '<div class="no-record-parent">' +
							'<span class="no-record">' +
					   		lang.user.no_record +
					   		'</span>'+
					   '</div>';
			} else {
				for (var i = 0; i < $res.length; i++) {
					var nickname = '';
					if ($res[i]["nickname"]) {
						nickname = $res[i]["nickname"];
					} else{
						nickname = '';
					}
					var email = '';
					if ($res[i]["email"]) {
						email = $res[i]["email"];
					} else{
						email = '';
					}
					var t = $res[i]["createtime"]/1000 + 8*60*60*1000;
					var createTime = dateFormat( t, 'MM/dd/yyyy HH:mm');
					html += '<div class="user-mag js-user" data-groupname=' + $res[i]["groupname"] + ' data-groupid=' + $res[i]["groupid"] + ' data-userid=' + $res[i]["userid"] + ' data-username=' + $res[i]["username"] + '>'+
								'<div class="pic-user col-lg-1">'+
									'<img src="css/image/user-mag.png" width="28px" height="28px" alt="' + $res[i]["username"] + lang.user.personal_photo +'" title="' + $res[i]["username"] + '">'+
									'<input type="checkbox" class="mg-user-checked">'+
								'</div>'+
								'<div class="name-matched">'+
									'<div class="name-user col-lg-2 ellipsis">'+
										'<span id="username-create" title="'+ $res[i]["username"] +'">' + $res[i]["username"] + '</span>'+
									'</div>'+
									'<div class="nickname-user col-lg-2 ellipsis" title="' + nickname + '">' + nickname +
									'</div>'+
								'</div>'+
								'<div class="email-user col-lg-3 ellipsis" title="' + $res[i]["email"] + '">' + email + '</div>'+
								'<div class="createDate-user col-lg-2">' + $res[i]["formatedctime"] + '</div>'+
								'<div class="other-action col-lg-2">'+
									'<div class="user-hidden-icons">'+
						                '<span class="glyphicon glyphicon-user" id="b_obj_set" title="' + lang.user.set_objuser +'"></span>'+
										'<span class="glyphicon glyphicon-pencil" id="b_local_modi" data-toggle="modal" data-target="#localuserModiModal" title="' + lang.user.modify_local_user +'"></span>'+
										'<span class="glyphicon glyphicon-trash" id="b_local_del" data-toggle="modal" data-target="#localuserDelModal" title="'+ lang.user.del_user +'"></span>'+
										'<span class="glyphicon glyphicon-th"  id="b_reset_local" title="' + lang.user.reset_pwd +'"></span>'+
										'</div>'+
								'</div>'+
							'</div>';
				}
			}
		$('.js-local-user .magtable_list').append(html);
		autoMagtabHeight();
	}
    //对象储存用户显示
	var objusercallback = function (data){
		$('.dt_system_bar').LoadData('hide');
		removeWaitMask();
		if (data == undefined)
			return;
		if (data.code == 200) {
			var usernamearr=[];
			var $this = $('.js-local-user .magtable_list .js-user');
			for (var n = 0; n < $this.length; n++) {
				var usernamestring=$('.js-local-user .magtable_list .js-user:eq('+n+')').data('username')+'';
				usernamearr.push(usernamestring);
			}
			for (var i = 0; i < data.result.length; i++) {
				var html ='';
				var arrnum=usernamearr.indexOf(data.result[i].user);
				if (arrnum>=0){
					//$('.js-local-user .magtable_list .other-action:eq('+arrnum+')').find('#b_obj_del').remove();
					$('.js-local-user .magtable_list .other-action:eq('+arrnum+')').find('#b_obj_set').remove();
					html += '<span class="glyphicon glyphicon-edit" id="b_obj_del" title="' + lang.user.find_objuser + '" data-access="'+data.result[i].access_key+'" data-secret="'+data.result[i].secret_key+'"></span>';
				}
                else{

				}
				$('.js-local-user .magtable_list .user-hidden-icons:eq('+arrnum+')').prepend(html);
			}
		}else {
			DisplayTips( lang.user.list_objuser_fail + "(" + data.msg + ")");
		}
	}

	//管理员用户列表显示
	function adminUserList (data) {
		var html = '';
		$('.js-mag-user .magtable_list').html('');
			var $res = data.result;
			if ( $res.length < 1 ) {
				html = '<div class="no-record-parent">' +
							'<span class="no-record">' +
					   		lang.user.no_record +
					   		'</span>'+
					   '</div>';
			} else {
				for (var i = 0; i < $res.length; i++) {
					var email = '';
					if ($res[i]["email"]) {
						email = $res[i]["email"];
					} else{
						email = '';
					}
					var role = '';
					if ( $res[i]["role"]==2 ) {
						role = lang.user.administrator;
					} else {
						role = lang.user.audit_user;
					}
					html += '<div class="user-mag js-user"' + '" data-userid=' + $res[i]["userid"] + '" data-username="' + $res[i]["username"] + '" data-groupid="' + $res[i]["groupid"] + '" data-nickname='+ $res[i]['nickname'] + '>'+
								'<div class="pic-user col-lg-1">'+
									'<img src="css/image/user-mag.png" width="28px" height="28px" alt="' + $res[i]["username"] + lang.user.personal_photo +'" title="' + $res[i]["username"] + '">'+
									'<input type="checkbox" class="mg-user-checked">'+
								'</div>'+
								'<div class="name-matched">'+
									'<div class="name-user col-lg-2 ellipsis">'+
										'<span id="username-create" title="'+ $res[i]["username"] +'">' + $res[i]["username"] + '</span>'+
									'</div>'+
									'<div class="permit-user col-lg-2 ellipsis" title="' + role + '">' + role +
									'</div>'+
								'</div>'+
								'<div class="email-user col-lg-3 ellipsis" title="' + $res[i]["email"] + '">' + email + '</div>'+
								'<div class="createDate-user col-lg-2">' + $res[i]["formatedctime"] + '</div>'+
								'<div class="other-action col-lg-2">'+
									'<div class="user-hidden-icons">'+
										'<span class="glyphicon glyphicon-pencil" id="b_modi_adminuser" data-toggle="modal" data-target="#adminUserModiModal" title="'+ lang.user.modify_user +'"></span>'+
										'<span class="glyphicon glyphicon-trash" id="b_del_adminuser" data-toggle="modal" data-target="#adminUserDelModal" title="' + lang.user.del_user +'"></span>'+
										'<span class="glyphicon glyphicon-th" id="b_reset_adminuser" data-toggle="modal" data-target="#resetAdminPwdModal" title="'+ lang.user.reset_pwd +'"></span>'+
									'</div>'+
								'</div>'+
							'</div>';
				};
			}
		$('.js-mag-user .magtable_list').append(html);
		autoMagtabHeight();
	}

	//域用户列表显示
	function domainUserList (data) {
		var html = '';
		var $res = data.result;
		if ( $res.length < 1 ) {
			html = '<div class="no-record-parent">' +
						'<span class="no-record">' +
				   		lang.user.no_record +
				   		'</span>'+
				   '</div>';
		} else {
			for (var i = 0; i < $res.length; i++) {
				var sgroup = '';
				//获取次要组的值
				if ( $res[i].groups == null || $res[i].groups == '' || $res[i].groups == undefined || $res[i].groups.length < 1) {
					sgroup = '';
				} else {
					var glen = $res[i].groups.length;
					for (var j = 0; j < glen-2; j++) {
						sgroup += $res[i].groups[j] + '、';
					};
					sgroup += $res[i].groups[glen-1];
				}
				//当主要组为空的时候
				if ($res[i]["primarygroup"] == '' || $res[i]["primarygroup"] == undefined) {
					$res[i]["primarygroup"] = '';
				}

				html += '<div class="user-mag js-user">'+
							'<div class="pic-user col-lg-1">'+
								'<img src="css/image/user-mag.png" width="28px" height="28px" alt="' + $res[i]["username"] + lang.user.personal_photo +'" title="' + $res[i]["username"] + '">'+
								'<input type="checkbox" class="mg-user-checked">'+
							'</div>'+
							'<div class="name-matched">'+
								'<div class="name-user col-lg-2 ellipsis">'+
									'<span id="username-create" title="' + $res[i]["uname"] + '">' + $res[i]["uname"] + '</span>'+
								'</div>'+
							'</div>'+
							'<div class="ad-primary-g col-lg-2 ellipsis" title="' + $res[i]["primarygroup"] + '">'+ $res[i]["primarygroup"] +
							'</div>'+
							'<div class="ad-secondary-g col-lg-7 ellipsis" title="' + sgroup + '">' + sgroup +'</div>'+
						'</div>';
			}
		}
		return html;
	}


	//域用户回调函数
	function DomainUserCallback(data){
        $('.js-domain-user').LoadData('hide');
		if (data == undefined)
			return;
		if (data.code == 200) {
			$('.js-domain-user .magtable_list').html('');
			var htm = domainUserList(data);
			$('.js-domain-user .magtable_list').append(htm);
			autoMagtabHeight();
		} else {
			DisplayTips( lang.user.list_sub_domainuser_fail + "(" + data.msg + ")");
		}
	}

	//LDAP用户列表显示
	function ldapUserList (data) {
		var html = '';
		if (data.length < 1) {
			html = '<div class="no-record-parent">' +
						'<span class="no-record" style="font-weight:normal;">' +
				   		'</span>'+
				   '</div>';
		} else {
			for (var i = 0; i < data.length; i++) {
				html += '<tr>' +
							'<td>' + '<img src="css/image/user-mag.png" width="28px" height="28px">' +
							'<span>' + data[i].uname + '</span>' +
							'</td>' +
							'<td>' + data[i].uid + '</td>' +
							'<td>' + data[i].gid + '</td>' +
							'<td>' + data[i].alias + '</td>' +
						'</tr>';
			}
		}
		return html;
	}
	//LDAP分页栏
	function ldapPagination (total, curpage) {
		var html = '';
		var prevPages = 0;
		var nextPages = 0;

		if (curpage > total) {
			curpage = total;
		} else if (curpage < 1) {
			curpage = 1;
		}
		//计算前后页数
		if (total <= 11) {
			prevPages = curpage - 1;
			nextPages = total - curpage;
		} else {
			if (curpage <= 6) {
				prevPages = curpage - 1;
			} else {
				prevPages = 5;
			}
			if (total - curpage <= 6) {
				nextPages = total - curpage;
			} else {
				nextPages = 10 - prevPages;
			}
		}
		//上一页
		if (curpage !== 1) {
			html += '<li>' +
						'<a class="js-ldap-page" data-target="' + (curpage - 1) + '" aria-label="Previous">' +
							'<span aria-hidden="true">&laquo;</span>' +
						'</a>' +
					'</li>';
		} else {
			html += '<li class="disabled">' +
						'<a aria-label="Previous">' +
							'<span aria-hidden="true">&laquo;</span>' +
						'</a>' +
					'</li>';
		}

		if (prevPages + 1 === curpage) { 	//前页无省略
			for (var i = 0; i < prevPages; i++) {
				html += '<li><a class="js-ldap-page" data-target="' + (i + 1) + '">' + (i + 1) + '</a></li>';
			}
		} else {
			html += '<li><a class="js-ldap-page" data-target="1">1</a></li>' +
					'<li class="disabled"><a>…</a></li>';
			for (var i = 3; i > 0; i--) {
				html += '<li><a class="js-ldap-page" data-target="' + (curpage - i) + '">' + (curpage - i) + '</a></li>';
			}
		}

		//当前页
		html += '<li class="active"><a>' + curpage + '</a></li>';

		if (curpage + nextPages === total) {	//后页无省略
			for (var j = 0; j < nextPages; j++) {
				html += '<li><a class="js-ldap-page" data-target="' + (curpage + j + 1) + '">' + (curpage + j + 1) + '</a></li>';
			}
		} else {
			for (var j = 0; j < nextPages - 2; j++) {
				html += '<li><a class="js-ldap-page" data-target="' + (curpage + j + 1) + '">' + (curpage + j + 1) + '</a></li>';
			}
			html += '<li class="disabled"><a>…</a></li>' +
					'<li><a class="js-ldap-page" data-target="' + total + '">' + total + '</a></li>';
		}

		//下一页
		if (curpage !== total) {
			html += '<li>' +
						'<a class="js-ldap-page" data-target="' + (curpage + 1) + '" aria-label="Next">' +
							'<span aria-hidden="true">&raquo;</span>' +
						'</a>' +
					'</li>';
		} else {
			html += '<li class="disabled">' +
						'<a aria-label="Next">' +
							'<span aria-hidden="true">&raquo;</span>' +
						'</a>' +
					'</li>';
		}

		return html;
	}

	//LDAP域用户回调函数
	function ldapUserCallback (data) {
		$('.js-ldap-user').LoadData('hide');
		if (!data || data.code === 502) {
			return;
		}
		if (data.code === 200 && data.ps !=undefined) {
			$('.js-ldap-user #ldapTable').empty();
			var curpage = $('.js-ldap-user #js-ldap-pagination').data('curpage') || 1;
			if(data.ps != 0){
				var html = ldapUserList(data.result);
				var paginationHtml = ldapPagination(data.ps, curpage);
				$('.js-ldap-user #ldapTable').html(html);
				$('.js-ldap-user #js-ldap-pagination').html(paginationHtml);
			}
		} else {
			var html = ldapUserList([]);
			$('.js-ldap-user #ldapTable').html(html);
		}
	}

	function autoMagtabHeight() {
		var userlen = "";
		if ( $('.js-mag-user').css('display') != 'none' ) {
			userlen = $('.js-mag-user .magtable_list .js-user').length;
		} else if( $('.js-local-user').css('display') != 'none' ){
			userlen = $('.js-local-user .magtable_list .js-user').length;
		} else if( $('.js-domain-user').css('display') != 'none' ){
			userlen = $('.js-domain-user .magtable_list .js-user').length;
		}
		if ( userlen < 11 && userlen > 0 || userlen == 0) {
			$('.all_table_list').css('height', 'auto');
			$('.magtable_list_parent').css('overflow', 'hidden');
		} else {
			$('.all_table_list').css('height', '83%');
			$('.magtable_list_parent').css('overflow', 'auto');
		}
	}

	//毫秒转换为日期格式
	function dateFormat(time, format){
	    var t = new Date(time);
	    var tf = function(i){return (i < 10 ? '0' : '') + i};
	    return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a){
	        switch(a){
	            case 'yyyy':
	                return tf(t.getFullYear());
	            case 'MM':
	                return tf(t.getMonth() + 1);
	            case 'mm':
	                return tf(t.getMinutes());
	            case 'dd':
	                return tf(t.getDate());
	            case 'HH':
	                return tf(t.getHours());
	            case 'ss':
	                return tf(t.getSeconds());
	        }
	    })
	}
	//小三角上下旋转
	//ele 是旋转的小三角
	//parli 是小三角所在的li的id名
	// function rotateTriangle (ele, parli) {
	// 	var obj = document.getElementById(ele);
	// 	if (obj.style.webkitTransform) {
	// 		var r = obj.style.webkitTransform;
	// 	} else{
	// 		var r = obj.style.transform;
	// 	}
	// 	//获取rotate旋转的角度
	// 	var start = r.indexOf('(') + 1;
	// 	var end = r.indexOf('d');
	// 	var angle = r.substring(start, end);
	// 	if ( angle == -45) {
	// 		$('#' + parli).find('#'+ ele).rotate(225);
	// 	} else{
	// 		$('#' + parli).find('#'+ ele).rotate(-45);
	// 	}
	// }
	//点击左边本地用户、域用户、管理用户的任意li时，都要取消勾选
	function cancelSelectLi () {
		//input勾选取消
		$('.mg-user-checked[type="checkbox"]:checked').prop('checked', false);
		//取消添加pink类（求别吐槽pink类，因为一开始的颜色是pink）
		$user = $('.magtable_list').find('.user-mag-pink');
		$user.addClass('user-mag').removeClass('pink user-mag-pink');
		$('.magtable_list').find('.user-mag .pic-user img')
						   .css('display', '')
						   .css('float', 'left');
		$('.magtable_list').find('.user-mag .pic-user input').css('visibility', 'hidden');
		//移除userMouseout1这个事件，并重新绑定
		$('.magtable_list').off('mouseout', '.user-mag', userMouseout1);
		$('.magtable_list').on('mouseout', '.user-mag', userMouseout);

		//各种小图标的显示与消失
		//$('#b_reset_local').css('display', 'none');
		$('#b_reset_lotLocal').css('display', 'none');
		$('#b_del_lotLocal').css('display', 'none');
		$('#b_del_local').css('display', 'none');
		$('.b_modify_localuser').css('display', 'none');
		$('.b_add_localgroup').css('display', '');
		$('#b_add_localuser').css('display', '');
		$('.statistics-user').css('display', '');
		$('.search-bytext').css('display', '');
		$('.cancel-selectusers').css('display', 'none');
		$('.is-select-all').css('display', 'none');
		$('.js-local-user .statistics-user').css('display', 'inline');
		$('.js-local-user .has-matched-users').css('display', 'none');

		//这下面的都是管理员上面的图标，其实应该分情况（点击‘管理员的取消选择’和‘本地用户的取消选择’分别来操作）来判断，找个时间整理一下
		$('.js-mag-user .statistics-user').css('display', 'inline');
		$('.js-mag-user .has-matched-users').css('display', 'none');
		$('.has-selected-admins').css('display', 'none');
		$('#b_add_mag').css('display', 'inline');
		$('#b_reset_mag').css('display', 'none');
		$('#b_del_mag').css('display', 'none');
		$('.search-admin').css('display', 'inline');
		//排序的图标,点击左边的导航菜单的时候，列表上的排序图标一律显示升序（因为默认是升序的）
		$('.orderby_name_asc').css('display', '');
		$('.orderby_name_desc').css('display', 'none');
		$('.orderby_createtime_asc').css('display', '');
		$('.orderby_createtime_desc').css('display', 'none');
		$('.orderby_nickname_asc').css('display', '');
		$('.orderby_nickname_desc').css('display', 'none');
		$('.has-selected-users').css('display', 'none');
		$('.cancel-search').css('display', 'none');
	}

	//搜索管理员
	function searchAdmin (argument) {
		var str = trim($('#js-filter-mag').val());
		// if (str.length < 1) {
		// 	DisplayTips(lang.user.input_the_search_key);
		// 	return false;
		// }
		// var groupid = $('.nav-mag-gname span').data('groupid');
		var groupid = $('#mag-user-act').data('groupid');
		var parameter = {
			'key': str,
			'groupid': groupid,
		};
		var dncallback = function (result){
			if (result == undefined)
				return;
			if (result.code == 200) {
				//DisplayTips(lang.user.search_success);
				autoMagtabHeight();
				adminUserList(result);
				// autoMagtabHeight();

				var $namematch = $('.js-mag-user .magtable_list .name-matched');
				var len = $namematch.length;
				var keyword = str.toLowerCase();

				//len大于0，说明此时有用户列表，可以进行匹配
				if (len > 0 ) {
					for (var i = 0; i < $namematch.length; i++) {
						highlight( keyword, $namematch[i]);//把匹配的结果高亮显示
					}
				}

				if ( str != '' ) {
					$('.cancel-search').css('display', 'inline');
					$('.js-mag-user .statistics-user').css('display', 'none');
					$('.js-mag-user .has-matched-users').css('display', 'inline');
					var matchedlen = $('.js-mag-user .magtable_list .user-mag').length;
					$('.hasmatched-users-count').html('<span style="color:red;">' + matchedlen + '</span>');
				} else {
					$('.cancel-search').css('display', 'none');
					$('.js-mag-user .statistics-user').css('display', 'inline');
					$('.js-mag-user .has-matched-users').css('display', 'none');
				}
			}else {
				DisplayTips(lang.user.search_fail +　"(" + result.result + ")");
			}
		}
		DataModel["searchLocalUser"](parameter, dncallback, true, lang.search);
	}

	//搜索本地用户
	function searchLoacl (argument) {
		var str = trim($('#js-filter-local').val());
		var groupid = $('.nav-local-gname span').data('groupid');
		var parameter = {
			'key': str,
			'groupid': groupid,
			'role': 0,
		};
		var dncallback = function (result){
			if (result == undefined)
				return;
			if (result.code == 200) {
				//DisplayTips(lang.user.search_success);
				localUserList(result);

				var $namematch = $('.js-local-user .magtable_list .name-matched');
				var len = $namematch.length;
				//len大于0，说明此时有用户列表，可以进行匹配
				if (len > 0 ) {
					for (var i = 0; i < $namematch.length; i++) {
						highlight( str, $namematch[i]);//把匹配的结果高亮显示
					}
				}

				if ( str != '' ) {
					$('.js-local-user .statistics-user').css('display', 'none');
					$('.js-local-user .has-matched-users').css('display', 'inline');
					var matchedlen = $('.js-local-user .magtable_list .user-mag').length;
					$('.hasmatched-users-count').html('<span style="color:red;">' + matchedlen + '</span>');
				}
			}else {
				DisplayTips(lang.user.search_fail +　"(" + result.result + ")");
			}
		}
		DataModel["searchLocalUser"](parameter, dncallback, true, lang.search);
	}

	//搜索域用户
	function searchDomain (argument) {
		var str = trim($('#js-filter-domain').val());
		var groupname = $('#domain-user-act li.active').data('groupname');
		var parameter = {
			'groupname': groupname,
			'key': str,
		};
		var dncallback = function (result){
			$('.js-domain-user').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				//DisplayTips(lang.user.search_success);
				$('.js-domain-user .magtable_list').html('');
				var alldolen = $('#domain-user-act.active').length; //判断当前是否在所有域用户中搜索
				if (alldolen > 0) {
					window.domainAllUsersres = result;
					window.domainallLoaded = true;
				}
				var htm = domainUserList(result);
				$('.js-domain-user .magtable_list').html(htm);
				var $namematch = $('.js-domain-user .magtable_list .name-matched');
				var len = $namematch.length;
				//len大于0，说明此时有用户列表，可以进行匹配
				if (len > 0 ) {
					for (var i = 0; i < $namematch.length; i++) {
						highlight( str, $namematch[i]);//把匹配的结果高亮显示
						$user = $($namematch[i]).closest('.user-mag');
						if ( $($namematch[i]).find('.highlight').length == 0 && str != '' ) {
							$user.addClass('hidden');
						} else {
							$user.removeClass('hidden');
						}
					}
				}

				$('.js-domain-user .statistics-user').css('display', 'none');
				if ( str != '' ) {
					$('.js-domain-user .has-matched-users').css('display', 'inline');
					var matchedlen = $('.js-domain-user .magtable_list .user-mag').length;
					$('.hasmatched-users-count').html('<span style="color:red;">' + matchedlen + '</span>');
				}
				autoMagtabHeight();
			}else {
				DisplayTips(lang.user.search_fail +　"(" + result.result + ")");
			}
		}
		var aclen = $('#domain-user-act.active').length;
		if ( aclen > 0 ) {
			if ( window.domainallLoaded ) {
				var htm = domainUserList(window.domainAllUsersres);
				$('.js-domain-user .magtable_list').html(htm);
				var $namematch = $('.js-domain-user .magtable_list .name-matched');
				var len = $namematch.length;
				//len大于0，说明此时有用户列表，可以进行匹配
				if (len > 0 ) {
					for (var i = 0; i < $namematch.length; i++) {
						highlight( str, $namematch[i]);//把匹配的结果高亮显示
						$user = $($namematch[i]).closest('.user-mag');
						if ( $($namematch[i]).find('.highlight').length == 0 && str != '' ) {
							$user.addClass('hidden');
						} else {
							$user.removeClass('hidden');
						}
					}
				}

				$('.js-domain-user .statistics-user').css('display', 'none');
				if ( str != '' ) {
					$('.js-domain-user .has-matched-users').css('display', 'inline');
					var matchedlen = $('.js-domain-user .magtable_list .user-mag').length;
					$('.hasmatched-users-count').html('<span style="color:red;">' + matchedlen + '</span>');
				}
				autoMagtabHeight();

			} else {
				$('.js-domain-user').LoadData('show');
				DataModel["listAllDomainUserInfo"](parameter, dncallback, true, lang.search);
			}
		} else{
			$('.js-domain-user').LoadData('show');
			DataModel["listADUsersByName"](parameter, dncallback, true, lang.search);
		}
	}


	//各种用户（管理员、本地、域用户）排序的实现，封装在一起
	function orderByOption (ev) {
		var groupid = '';
		var roleid = '';
		var reverse = '';
		var order = '';
		var strclass = ev.data;

		//获取升序还是降序  false升序  true降序
		if ( $('.' + ev.data + '_asc').css('display') != 'none' ) {
			reverse = true;
		} else {
			reverse = false;
		}

		//获取groupid 和 roleid
		if ( $('.js-mag-user').css('display') != 'none' ) {
			//则此时是在管理员中
			groupid = 10000;
		} else if ($('.js-local-user').css('display') != 'none') {
			roleid = 0;
			groupid = $('#local-user-act ul>li.active').data('groupid');
			if (groupid == 10000) {

			}
		} else if($('.js-domain-user').css('display') != 'none'){

		}
		//获取order
		if ( ev.data == 'orderby_name' ) {
			order = 0;
		} else if ( ev.data == 'orderby_nickname' ) {
			order = 2;
		} else if ( ev.data == 'orderby_createtime' ) {
			order = 3;
		}
		var parameter = {
			'page': 1,
			'perpage': -1,
			'order': order,
			'reverse': reverse,
			'groupid': groupid,
			'role': roleid,
			'value':true,
		};
		var dncallback = function (result){
			if (result == undefined)
				return;
			if (result.code == 200) {
				if ( $('.js-mag-user').css('display') != 'none' ) {
					//调用管理员用户列表显示
					adminUserList(result);
				} else if ($('.js-local-user').css('display') != 'none') {
					//调用本地用户列表显示
					localUserList(result);
				} else if($('.js-domain-user').css('display') != 'none'){
					//调用域用户列表显示
					$('.js-domain-user .magtable_list').html('');
					var htm = domainUserList(result);
					$('.js-domain-user .magtable_list').append(htm);
				}
				autoMagtabHeight();
				if (reverse == true) {
					$('.' + strclass + '_asc').css('display', 'none');
					$('.' + strclass + '_desc').css('display', '');
				} else {
					$('.' + strclass + '_asc').css('display', '');
					$('.' + strclass + '_desc').css('display', 'none');
				}
			}else {
				// DisplayTips( lang.user.out_domain_fail + "(" + result.result + ")");
			}
		}
		if ( $('.js-mag-user').css('display') != 'none' ) {
			DataModel["allAdminList"](parameter, dncallback, true, lang.user.out_domain);
		} else if ($('.js-local-user').css('display') != 'none') {
			DataModel["listAllUser"](parameter, dncallback, true, lang.user.out_domain);
		} else if($('.js-domain-user').css('display') != 'none'){
			var groupname = $('#domain-user-act li.active').data('groupname');
			var para = '';
			if ( $('#domain-user-act.active').length > 0 ) {
				para = {
					'page': 1,
					'perpage': -1,
					'reverse': reverse,
				};
				DataModel["listAllDomainUserInfo"](para, dncallback, true, lang.user.out_domain);

			} else {
				para = {
					'page': 1,
					'perpage': -1,
					'reverse': reverse,
					'groupname': groupname,
				};
				DataModel["listADUsersByName"](para, dncallback, true, lang.user.out_domain);
			}

		}
	}

	function userMouseover (ev) {
		$(this).find('.pic-user img').css('display', 'none');
		$(this).find('.pic-user input').css('visibility', 'visible')
									   .css('float', 'left');
		$(this).find('.user-hidden-icons').css('display', 'block');
	}

	function userMouseout (ev) {
		$(this).find('.pic-user img').css('display', 'block')
									 .css('float', 'left');
		$(this).find('.user-hidden-icons').css('display', 'none');
		$(this).find('.pic-user input').css('visibility', 'hidden');
	}

	function userMouseover1 (ev) {
		$(this).find('.pic-user img').css('display', 'none');
		$(this).find('.pic-user input').css('visibility', 'visible')
									   .css('float', 'left');
		$(this).find('.user-hidden-icons').css('display', 'block');
	}

	function userMouseout1 (ev) {
		$(this).find('.pic-user img').css('display', 'none');
		$(this).find('.pic-user input').css('visibility', 'visible')
									   .css('float', 'left');
		$(this).find('.user-hidden-icons').css('display', 'none');
	}

	//复选框被勾选时调用
	function selectInputSingle (el) {
		if (el.prop('checked') == true) {
			//事件绑定样式一致，会覆盖掉我之前的样式
			if ($('.js-mag-user').css('display') !=  'none') {
				$('#b_add_mag').css('display', 'none');
				$('#b_reset_mag').css('display', 'inline');
				$('#b_del_mag').css('display', 'inline');
				$('.search-admin').css('display', 'none');
				$('.has-selected-admins').css('display', 'inline');
			} else if( $('.js-local-user').css('display') !=  'none' ){
				$('#b_reset_local').css('display', '');
				$('#b_reset_lotLocal').css('display', '');
				$('#b_del_lotLocal').css('display', '');
				$('#b_del_local').css('display', '');
				$('.b_modify_localuser').css('display', '');
				$('.b_add_localgroup').css('display', 'none');
				$('.b_del_localgroup').css('display', 'none');
				$('#b_add_localuser').css('display', 'none');
			}

			$('.cancel-search').css('display', 'none');
			$('.has-matched-users').css('display', 'none');
			$('.statistics-user').css('display', 'none');
			$('.search-bytext').css('display', 'none');
			$('.cancel-selectusers').css('display', 'inline');
			$('.is-select-all').css('display', 'inline');
			$('.has-selected-users').css('display', 'inline');
			$se = el.closest('.user-mag').find('.other-action .user-hidden-icons');
			$se.css('display', 'inline-block');
			//添加pink 、user-mag-pink类，移除user-mag
			el.closest('.user-mag').addClass('pink user-mag-pink')
										.removeClass('user-mag');

			//解除mouseout的绑定事件
			$('.magtable_list').off('mouseout', '.user-mag', userMouseout);
			el.closest('.magtable_list').find('.user-mag .pic-user img').css('display', 'none');
			el.closest('.magtable_list').find('.user-mag .pic-user input').css('visibility', 'visible')
									   .css('float', 'left');
			//重新添加绑定的mouseout事件
			$('.magtable_list').on('mouseout', '.user-mag', userMouseout1);
			if ( $('.js-mag-user').css('display') != 'none' ) {
				if( $('.js-mag-user .magtable_list').find('.js-user').length == $('.js-mag-user .magtable_list').find('.user-mag-pink').length ) {
					$('.is-select-all').find('input').prop('checked', 'true');
				}
			} else if ( $('.js-local-user').css('display') != 'none' ) {
				if( $('.js-local-user .magtable_list').find('.js-user').length == $('.js-local-user .magtable_list').find('.user-mag-pink').length ) {
					$('.is-select-all').find('input').prop('checked', 'true');
				}
			}
		} else{
			//取消勾选，变换成之前的
			//如果页面上一个被勾选的都没有，此时重置密码和删除图标才消失，否则就出现
			var len = el.closest('.magtable_list').find('.pink').length - 1;
			$('.is-select-all').find('input').removeAttr('checked');
			if (len < 1) {
				if ($('.js-mag-user').css('display') !=  'none') {
					$('#b_add_mag').css('display', 'inline');
					$('#b_reset_mag').css('display', 'none');
					$('#b_del_mag').css('display', 'none');
					$('.search-admin').css('display', 'inline-block');
					$('.has-selected-admins').css('display', 'none');
				} else if( $('.js-local-user').css('display') !=  'none' ){
					//$('#b_reset_local').css('display', 'none');
					$('#b_reset_lotLocal').css('display', 'none');
					$('#b_del_lotLocal').css('display', 'none');
					$('#b_del_local').css('display', 'none');
					$('.b_modify_localuser').css('display', 'none');
					$('.b_add_localgroup').css('display', '');
					$('#b_add_localuser').css('display', '');
					$('.b_del_localgroup').css('display', 'inline');
				}
				$('.statistics-user').css('display', '');
				$('.search-bytext').css('display', '');
				$('.cancel-selectusers').css('display', 'none');
				$('.is-select-all').css('display', 'none');
				$('.has-selected-users').css('display', 'none');

				el.closest('.user-mag-pink').find('.user-hidden-icons').css('display', 'none');
				el.closest('.magtable_list').find('.user-mag .pic-user img').css('display', '');
				el.closest('.magtable_list').find('.user-mag .pic-user input')
											.css('visibility', 'hidden')
										   .css('float', 'left');
				el.closest('.magtable_list').find('.user-mag-pink .pic-user img').css('display', '');
				el.closest('.magtable_list').find('.user-mag-pink .pic-user input').css('visibility', 'hidden')
										   .css('float', 'left');
				//移除userMouseout1这个事件，并重新绑定
				$('.magtable_list').off('mouseout', '.user-mag', userMouseout1);
				$('.magtable_list').on('mouseout', '.user-mag', userMouseout);
				el.closest('.dt_g_right_subdiv').find('.dt_system_bar .is-select-all input').prop('checked', false);
			}
			//一旦勾选取消，立刻移除user-mag-pink类和pink类
			el.closest('.user-mag-pink').addClass('user-mag')
										.removeClass('user-mag-pink pink');
			$se = el.closest('.user-mag').find('.other-action .user-hidden-icons');
			$se.css('display', 'none');
		}
		if ($('.js-mag-user').css('display') !=  'none') {
			var selen = $('.js-mag-user .magtable_list').find('.pink').length;
			$('.hasselected-admins-count').html('<span style="color:rgb(219,74,55);font-weight:bolder;">' +selen + '</span>');
		} else if( $('.js-local-user').css('display') !=  'none' ){
			var selen = $('.js-local-user .magtable_list').find('.pink').length;
			$('.hasselected-users-count').html('<span style="color:rgb(219,74,55);font-weight:bolder;">' +selen + '</span>');
		}
		if ( selen < 1 ) {
			$last = $('.js-mag-user .magtable_list .user-mag:last');
			$last.find('.pic-user img').css('display', '');
			$last.find('.pic-user input').css('visibility', 'hidden');
		}
	}

	//这个是监听整个body滚动到底部的状态
    // $(window).scroll(function(){
    //     //下面这句主要是获取网页的总高度，主要是考虑兼容性所以把Ie支持的documentElement也写了，这个方法至少支持IE8
    //     var htmlHeight=document.body.scrollHeight||document.documentElement.scrollHeight;
    //     //clientHeight是网页在浏览器中的可视高度，
    //     var clientHeight=document.body.clientHeight||document.documentElement.clientHeight;
    //     //scrollTop是浏览器滚动条的top位置，
    //     var scrollTop=document.body.scrollTop||document.documentElement.scrollTop;
    //     //通过判断滚动条的top位置与可视网页之和与整个网页的高度是否相等来决定是否加载内容；
    //     if(scrollTop+clientHeight==htmlHeight){
    //          addLi();
    //     }
    // })

    window.onhashchange = function(ev){
        var hash = location.hash;
        if (hash == '#admin') {
            //先取消勾选的状态
            cancelSelectLi();
            //本地用户和域用户的小三角形都是-45deg
            // $('#local-triangle-rotate').rotate(-45);
            // $('#domain-triangle-rotate').rotate(-45);
            //右边对应用户列表显示，之前的消失
            $('.js-mag-user').siblings().css('display', 'none');
            $('.js-mag-user').css('display', 'block');
            //菜单，当前点击的有颜色，其余恢复原状
            $mag = $('#mag-user-act');
            $mag.siblings().removeClass('active')
                        .find('ul').hide(250);
            $mag.siblings().find('ul li.active').removeClass('active');
            $mag.addClass('active');
            $mag.find('ul').toggle(250);
            var parameter = {
                'value': true
            };
            var dncallback = function (data){
                if (data == undefined)
                    return;
                if (data.code == 200) {
                    // $('.nav-local-ucount').html( '(' + '<span>' + data.count + '</span>' + lang.user.the_users +')');
                    adminUserList(data);
                    // autoMagtabHeight();

                }else {
                    DisplayTips( lang.user.list_subuser_fail + "(" + data.msg + ")");
                }
            }
            autoMagtabHeight();//用来自适应高度
            DataModel["listAllAdminUser"](parameter, dncallback, true, lang.user.list_sub_local_user);
        } else if (hash == '#local') {
            //此时删除组的小图标消失
            $('.b_del_localgroup').css('display', 'none');
            //先取消勾选的状态
            cancelSelectLi();
            //本地用户对应的用户列表出现，其余消失
            $('.js-local-user').siblings().css('display', 'none');
            $('.js-local-user').css('display', 'block');
            //给本地用户Li添加active类，其余的active类移除
            $local = $('#local-user-act');
            $local.siblings().removeClass('active')
                            .find('ul').hide(250);
            $local.siblings().find('ul li.active').removeClass('active');
            $local.addClass('active');
            //本地用户的子元素的active类也要删除
            $local.find('ul li.active').removeClass('active');
            //修改导航条组名和组成员的个数
            var gname = lang.user.all_local_users;
            $('.nav-local-gname').html(gname);
            //点击“本地用户”，本地用户列表出现
            var parameter = {
                'role':0,
                'page': 1,
                'perpage': -1,
            };
            var dncallback = localUserCallback;
            autoMagtabHeight();//用来自适应高度
            DataModel["listAllUser"](parameter, dncallback, true, lang.user.list_sub_local_user);
        } else if (hash == '#domain') {
            //先取消勾选的状态
            cancelSelectLi();
            $('.js-domain-user').LoadData('show');
            //域用户相关列表显示，其余消失
            $('.js-domain-user').siblings().css('display', 'none');
            $('.js-domain-user').css('display', 'block');
            //当前点击的添加active类，其余消失
            $domain = $('#domain-user-act');
            $domain.siblings().removeClass('active')
                            .find('ul').hide(250);
            $domain.siblings().find('ul li.active').removeClass('active');
            $domain.addClass('active');
            //域用户的子元素的active类也要删除
            $domain.find('ul li.active').removeClass('active');
            //列举出所有的域用户
            var parameter = {
                'page': 1,
                'perpage':30,
            };
            autoMagtabHeight();
            DataModel["listAllDomainUserInfo"](parameter, DomainUserCallback, true, lang.user.list_sub_domain_users);
		} else if (hash == '#ldap') {
            cancelSelectLi();
			//当前页
			var curPage = 1;
			$('.js-ldap-user #js-ldap-pagination').data('curpage', curPage);

            $('.js-ldap-user').LoadData('show');
			$('.js-ldap-user').siblings().css('display', 'none');
            $('.js-ldap-user').css('display', 'block');

			$ldap = $('#ldap-user-act');
			$ldap.siblings().removeClass('active')
                            .find('ul').hide(250);
            $ldap.siblings().find('ul li.active').removeClass('active');
            $ldap.addClass('active');
            //域用户的子元素的active类也要删除
            $ldap.find('ul li.active').removeClass('active');

			autoMagtabHeight();
			$('.js-ldap-user').LoadData('show')
            DataModel["listLDAPUser"](null, ldapUserCallback, true, null);
		}
    }

    window.onload = function(ev){
        var hash = location.hash;
        if(hash.slice(0,6) == '#local'){
            //此时删除组的小图标消失
            $('.b_del_localgroup').css('display', 'none');
            //先取消勾选的状态
            cancelSelectLi();
            //本地用户对应的用户列表出现，其余消失
            $('.js-local-user').siblings().css('display', 'none');
            $('.js-local-user').css('display', 'block');
            //给本地用户Li添加active类，其余的active类移除
            $local = $('#local-user-act');
            $local.siblings().removeClass('active')
                            .find('ul').hide(250);
            $local.siblings().find('ul li.active').removeClass('active');
            $local.addClass('active');
            $local.find('ul').toggle(250);
            //本地用户的子元素的active类也要删除
            $local.find('ul li.active').removeClass('active');
            //修改导航条组名和组成员的个数
            var gname = lang.user.all_local_users;
            $('.nav-local-gname').html(gname);
            //点击“本地用户”，本地用户列表出现
            var parameter = {
                'role':0,
                'page': 1,
                'perpage': -1,
            };
            var dncallback = localUserCallback;
            autoMagtabHeight();//用来自适应高度
            DataModel["listAllUser"](parameter, dncallback, true, lang.user.list_sub_local_user);
        } else if(hash.slice(0,7) == '#domain'){
            //先取消勾选的状态
            cancelSelectLi();
            //当前点击的小三角折叠，其余的小三角恢复原状，即一开始的-45度
            // rotateTriangle('domain-triangle-rotate', 'domain-user-act');
            // $('#local-triangle-rotate').rotate(-45);
            $('.js-domain-user').LoadData('show');

            //域用户相关列表显示，其余消失
            $('.js-domain-user').siblings().css('display', 'none');
            $('.js-domain-user').css('display', 'block');
            //当前点击的添加active类，其余消失
            $domain = $('#domain-user-act');
            $domain.siblings().removeClass('active')
                            .find('ul').hide(250);
            $domain.siblings().find('ul li.active').removeClass('active');
            $domain.addClass('active');
			$domain.find('ul').toggle(250);
            //域用户的子元素的active类也要删除
            $domain.find('ul li.active').removeClass('active');
            //列举出所有的域用户
            var parameter = {
                'page': 1,
                'perpage':30,
            };
            autoMagtabHeight();
            DataModel["listAllDomainUserInfo"](parameter, DomainUserCallback, true, lang.user.list_sub_domain_users);
		} else if (hash.slice(0,5) == '#ldap') {
            cancelSelectLi();
			//当前页
			var curPage = 1;
			$('.js-ldap-user #js-ldap-pagination').data('curpage', curPage);

            $('.js-ldap-user').LoadData('show');

			$('.js-ldap-user').siblings().css('display', 'none');
            $('.js-ldap-user').css('display', 'block');

			$ldap = $('#ldap-user-act');
			$ldap.siblings().removeClass('active')
                            .find('ul').hide(250);
            $ldap.siblings().find('ul li.active').removeClass('active');
            $ldap.addClass('active');
            $ldap.find('ul').toggle(250);
            //域用户的子元素的active类也要删除
            $ldap.find('ul li.active').removeClass('active');

			autoMagtabHeight();
			$('.js-ldap-user').LoadData('show')
            DataModel["listLDAPUser"](null, ldapUserCallback, true, null);
		}
    }
});
