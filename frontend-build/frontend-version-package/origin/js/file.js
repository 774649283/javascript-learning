$(function (ev) {
	//全局变量，存储当前目录的权限
	var ownLocalUsersData = '';//存储本地用户
	var ownDomainUsersData = '';//存储本地域用户
	var ownLocalGroupData = ''; //存储本地用户组
	var ownDomainGroupData = ''; //存储域用户组
	var ownLdapGroupData = '';//储存LDAP域用户
	var gauthData, uauthData;//存储组权限和用户权限
	var mountPointData = ''; //存储挂载点信息
	var domainNameData = ''; //存储属于域
	var ldapGroupDetailedList = ''; //存储所有域用户，按域用户组分类好了的

	var editwebdevLoadedUg = "no"; //列举用户 WEBDEV
	var editcifsLoadedUg = "no"; //列举用户 CIFS
	var editafpLoadedUg = "no"; //列举用户 CIFS
	var editftpLoadedUg = "no"; //列举用户 CIFS
	var t = ''; //搜索目录 定时器
	var timeClick = null;//避免单击和双击冲突
	var tTime = null; //共享搜索的时候

	//统计共享中的用户组和用户的个数
	$sharemodals = $('.cifs-share');
	$sharemodals.each(function (i) {
		$this = $(this);
		$groups = $this.find('.basic_content_list .js-group-share');
		$this.find('.js-count-group').text($groups.length);
		$users = $this.find('.basic_content_list .js-user-share');
		$this.find('.js-count-user').text($users.length);
	});
	for(var i=0;i < $('.share-grid .ellipsis').length;i++){
		var sharename = $('.share-grid .ellipsis:eq('+i+')');
		if(sharename.text().length > 8){
			var poolnamestr = sharename.text().substr(0,8)+ '...';
			sharename.html(poolnamestr);
		}
	}

	$(document)
		//移动到共享页面的每个显示共享的框上，删除、编辑图标出现
		.on('mouseover', '.share-grid', function (ev) {
			$this = $(this);
			$this.find('.js-monitor-share').removeClass('hidden');
			$this.find('.js-edit-share').removeClass('hidden');
			$this.find('.js-delete-share').removeClass('hidden');
		})
		.on('mouseout', '.share-grid', function (ev) {
			$this = $(this);
			$this.find('.js-monitor-share').addClass('hidden');
			$this.find('.js-edit-share').addClass('hidden');
			$this.find('.js-delete-share').addClass('hidden');
		})
		//创建页面的共享
		.on('click', '#create-cifs-share', function (ev) {
			$modal = $('#cifsShareModal');

			var context = null;
			var e = null;
			$modal.find('.btn-danger').hide();
			var ispageedit = true;
			var path = '';
			cifsShare(context, e, path, ispageedit);
		})
		.on('shown.bs.modal', '#cifsShareModal', function (ev) {
			$("#share_name").focus();
		})
		//cifs 页面编辑
		.on('click', '.js-edit-cifs-share', function (ev) {
			$this = $(this);
			var context = null;
			var e = null;
			$cifsmodal = $('#cifsShareModal');

			var path = $this.closest('.cifs-share').data('path');
			var name = $this.closest('.cifs-share').data('name');
			$cifsmodal.find('.share-name').val(name);
			$cifsmodal.find('.btn-danger').hide();
			var ispageedit = true;
			cifsShare(context, e, path, ispageedit);
		})
		//cifs 页面监控
		.on('click', '.js-monitor-cifs-share', function (ev) {
			$this = $(this);
			var sharename = $this.closest('.cifs-share').data('name');
			$cifsmonitormodal = $('#cifsMonitorModal');
			var parameter = {
				'share_name': sharename,
			}
			var monitorCallback = function (res) {
				if (res.code === 200) {
					cifsMonitorInfo(res.result);
				} else {
					DisplayTips(lang.wizard.get_fail);
				}
			}
			DataModel['getSessionStatus'](parameter, monitorCallback, true, '');
			$cifsmonitormodal.modal('show');
		})
		.on('click', '#create-nfs-share', function (ev) {
			$modal = $('#nfsShareModal');
			var context = null;
			var e = null;
			var ispageedit = true;
			var path = '';
			$modal.find('.btn-danger').hide();
			nfsShare(context, e, path, ispageedit);
			$modal.find('#dirname').val('');
			$modal.find('.share-name').val('');
			$modal.find('.text-area-style').text('');
		})
		.on('shown.bs.modal', '#nfsShareModal', function (ev) {
			$("#add_nfs_machine").focus();
		})
		.on('click', '.js-edit-nfs-share', function (ev) {
			$this = $(this);
			var context = null;
			var e = null;
			var ispageedit = true;
			$nfsmodal = $('#nfsShareModal');
			var path = $this.closest('.nfs-share').data('path');
			var name = $this.closest('.nfs-share').data('name');
			$nfsmodal.find('#dirname').val(path);
			$nfsmodal.find('.share-name').val(name);
			$nfsmodal.find('.btn-danger').hide();

			nfsShare(context, e, path, ispageedit);
		})
		.on('click', '#js-trash-ip', function (ev) {
			$this = $(this);
			$this.closest('.js-machine').remove();
		})
		.on('click', '#create-afp-share', function (ev) {
			var context = null;
			var e = null;
			var ispageedit = true;
			var path = '';
			$('#afpShareModal input#dirname').removeClass('disabled');
			$('#afpShareModal .btn-danger').hide();
			afpShare(context, e, path, ispageedit);
		})
		.on('shown.bs.modal', '#afpShareModal', function (ev) {
			$('.js-afp-share-name').focus();
		})
		.on('click', '.js-edit-afp-share', function (ev) {
			$this = $(this);
			var context = null;
			var e = null;
			var ispageedit = true;
			$afpmodal = $('#afpShareModal');
			var path = $this.closest('.afp-share').data('path');
			var name = $this.closest('.afp-share').data('name');
			$afpmodal.find('#dirname').val(path);
			$afpmodal.find('.share-name').val(name);
			$afpmodal.find('.btn-danger').hide();
			afpShare(context, e, path, ispageedit);
		})
		.on('click', '#create-ftp-share', function (ev) {
			var context = null;
			var e = null;
			var ispageedit = true;
			var path = "";
			$('#ftpShareModal input#dirname').removeClass('disabled');
			$('#ftpShareModal .btn-danger').hide();
			ftpShare(context, e, path, ispageedit);
		})
		.on('click', '.js-edit-ftp-share', function (ev) {
			$this = $(this);
			var context = null;
			var e = null;
			var ispageedit = true;
			$ftpmodal = $('#ftpShareModal');
			var path = $this.closest('.ftp-share').data('path');
			var name = $this.closest('.ftp-share').data('name');
			$ftpmodal.find('#dirname').val(path);
			$ftpmodal.find('.share-name').val(name);
			$ftpmodal.find('.btn-danger').hide();
			ftpShare(context, e, path, ispageedit);
		})
		.on('click', '#create-http-share', function (ev) {
			var context = null;
			var e = null;
			var ispageedit = true;
			var path = "";
			$('#httpShareModal input#dirname').removeClass('disabled');
			$('#httpShareModal .btn-danger').hide();
			webdavShare(context, e, path, ispageedit)
		})
		.on('shown.bs.modal', '#httpShareModal', function (ev) {
			$('.js-http-share-name').focus();
		})
		.on('click', '.js-edit-http-share', function (ev) {
			$this = $(this);
			var context = null;
			var e = null;
			var ispageedit = true;
			$httpmodal = $('#httpShareModal');
			var path = $this.closest('.http-share').data('path');
			var name = $this.closest('.http-share').data('name');
			$httpmodal.find('#dirname').val(path);
			$httpmodal.find('.share-name').val(name);
			$httpmodal.find('.btn-danger').hide();
			webdavShare(context, e, path, ispageedit);
		})
		//cifs 删除
		.on('click', '.js-delete-cifs-share', 'cifs', deleteSingleShare)
		.on('click', '.js-delete-nfs-share', 'nfs', deleteSingleShare)
		.on('click', '.js-delete-afp-share', 'afp', deleteSingleShare)
		.on('click', '.js-delete-ftp-share', 'ftp', deleteSingleShare)
		.on('click', '.js-delete-http-share', 'http', deleteSingleShare)

		.on('click', '#delShareModel .btn-danger', function (ev) {
			$modal = $('#delShareModel');
			var path = $modal.data('path');
			var share = $modal.data('share');
			var folderPath = formatPath3(path) + ',1';
			var parameter = {
				"path": formatPath4(folderPath),
				"operator": "admin",
			};
			$modal.find('.modal-header').LoadData('show');
			addWaitMask();
			if (share == 'cifs') {
				DataModel["delCifs"](parameter, delShareCallback, true, lang.file.del_cifs_share);
			} else if (share == 'nfs') {
				DataModel["delNFS"](parameter, delShareCallback, true, lang.file.del_nfs_share);
			} else if (share == 'afp') {
				DataModel["delAfp"](parameter, delShareCallback, true, lang.file.del_afp_share);
			} else if (share == 'ftp') {
				DataModel["delFtp"](parameter, delShareCallback, true, lang.file.del_ftp_share);
			} else if (share == 'http') {
				DataModel["delHttp"](parameter, delShareCallback, true, lang.file.del_http_share);
			}
		})
		//无论如何，删除模态框消失后移除to-be-deleted类
		.on('hidden.bs.modal', '#delShareModel', function (ev) {
			$('.to-be-deleted').removeClass('to-be-deleted');
		})

		.on('mouseover', '.dt_g_right_bar .all-folder-page li.js-dir, .dt_g_right_bar .all-root-page li.js-dir,.dt_g_right_bar .all-folder-page .js-file', function (ev) {
			ev.stoppropagation;
			$this = $(this);
			$this.find('img').css({ width: "112px", height: "112px;" });
			$this.css('padding', '0px');

			$this.find(".tooltip-hide").tooltip({ delay: { "show": 200, "hide": 100 } });//延迟显示tooltip,否则会影响这个mouseover事件的执行
		})
		.on('mouseout', '.dt_g_right_bar .all-folder-page li.js-dir, .dt_g_right_bar .all-root-page li.js-dir, .dt_g_right_bar .all-folder-page .js-file', function (ev) {
			ev.stoppropagation;
			$this = $(this);
			$this.find('img').css({ width: "84px", height: "84px;" });
			$this.css('padding', '14px');
			$this.find(".tooltip-hide").tooltip({ delay: { "show": 200, "hide": 100 } });
		})
		//单击模态框的目录
		.on('click', '#showDirPathModal .js-dir', function (ev) {
			ev.stopPropagation();
			clearTimeout(timeClick);
			$this = $(this);

			timeClick = setTimeout(function () {
				$modal.find('#showDirPathModal');
				if (!$this.hasClass('clicked')) {
					if ($this.siblings('.js-dir.clicked').length > 0) {
						//说明当前有被单击的目录
						//移除最后一个显示的路径
						$ul.find('li.js-goto-path:last').remove();
					}
					$this.addClass('clicked');
					$this.siblings('.js-dir').removeClass('clicked');
					$this.find('img').css({ width: "112px", height: "112px;" });
					$this.css({ "border-style": "solid", "border-color": "#00a2e6", "padding": "0px" });
					$this.siblings('.js-dir').find('img').css({ width: "84px", height: "84px;" });
					//$this.siblings('.js-dir').css('padding', '14px');
					$this.siblings('.js-dir').css({ "border-style": "none", "padding": "14px" });

					$this.find(".tooltip-hide").tooltip({ delay: { "show": 200, "hide": 100 } });
					//获取当前选择的目录路径，并显示到模态框最上面
					var path = $this.data('path');
					var name = $this.data('name');
					var htm = "";
					htm += '<li class="js-goto-path disabled" data-path="' + path + '">' +
						'<a href="javascript:;" style="display:flex;" title="' + name + '">' +
						'<span class="ellipsis" style="display:block;">' + name + '</span>' +
						'<span>/</span>' +
						'</a>'
					'</li>';
					$ul = $modal.find('ul.js-dirpath');
					$ul.find('li.js-goto-path:last').removeClass('disabled');
					//还需要判断当前是否有被单击的目录
					$ul.append(htm);
				}
			}, 300);
		})
		.on('dblclick', '.dt_g_right_bar li.js-dir', function (ev) {
			$this = $(this);
			var str = '';
			var path = '';
			var s = '';
			var arr = [];
			var name = $this.data('name');
			var mount = $this.data('mount');
			if ($('.all-folder-page').length < 1) {
				mpath = mount.split('/')[1];
			} else {
				mpath = mount;
			}
			if ($('.all-folder-page').length < 1) {
				str = mount.split('/');
			} else {
				$ul = $('.js-dirpath').find('li.js-goto-path');
				for (var i = 1; i < $ul.length; i++) {
					s += trim($($ul[i]).find('a span').text());
				};
				s += name;
				s = '/' + s;
				str = s.split('/');
			}
			path = formatPath1(str);
			path = path.substring(0, path.length - 1);
			loadDir(path, name, mpath, '', '');
			//显示上级菜单链接
			if ($('.js-goto-path').eq(-2).data('path') != undefined) {
				$('#gotoParentDir').removeClass('hidden');
			}
		})
		//模态框中的双击目录
		.on('dblclick', '#showDirPathModal li.js-dir', function (ev) {
			clearTimeout(timeClick);
			$this = $(this);
			$modal = $('#showDirPathModal');
			//先判断当前要双击的目录是否含有“clicked”类，有的话则说明当前目录已经执行过一次单击事件
			if ($this.hasClass('clicked')) {
				$modal.find('ul.js-dirpath').find('li.js-goto-path:last').remove();
				$modal.find('ul.js-dirpath').find('li.js-goto-path:last').removeClass('disabled');
			}
			var str = '';
			var path = '';
			var s = '';
			var arr = [];
			var name = $this.data('name');
			var mount = $this.data('mount');
			if ($modal.find('.all-folder-page').length < 1) {
				mpath = mount.split('/')[1];
			} else {
				mpath = mount;
			}
			if ($modal.find('.all-folder-page').length < 1) {
				path = formatPath3(mount) + ',1';
			} else {
				path = $this.data('path');
			}
			loadDir(path, name, mpath, '', '', true);
		})
		//点击home目录的时候
		.on('click', '.dt_g_right_bar .js-goto-path:first', function (ev) {
			var isclickpath = true;
			listMountPoint(isclickpath);
		})
		.on('click', '.dt_g_right_bar .js-goto-path:gt(0)', function (ev) {
			$this = $(this);
			var path = $this.data('path');
			//隐藏和显示上级菜单链接
			if ($('.js-goto-path').eq(-3).data('path') == 'undefined') {
				$('#gotoParentDir').addClass('hidden');
			}
			else {
				$('#gotoParentDir').removeClass('hidden');
			}
			var page = '';
			var perpage = '';
			var parameter = {
				'path': formatPath4(path),
				'page': page,
				'perpage': perpage
			};
			var callback = function (result) {
				$(".all_table_list_third").LoadData("hide");
				if (result == undefined)
					return;
				if (result.code == 200) {
					totalpage = Math.ceil( result.count/150 )
					var paginationHtml = renderPagination(totalpage, 1);
					$('#js-audit-pagination').html(paginationHtml);
					var curpos = $('.js-goto-path').index($this);
					$this.addClass('disabled');
					$('.js-goto-path:gt(' + curpos + ')').remove();
					showDirsList(result);
					//省略路径
					var dirDepth = $('.js-dirpath>li').length;
					if (dirDepth > 4) {
						$('.js-dirpath>li:gt(0)').addClass('hidden');
						$('.js-dirpath>li:gt(' + (dirDepth - 5) + ')').removeClass('hidden');

						if (dirDepth == 5)
							$('#showEllipsis').addClass('hidden');
					}
					else {
						$('.js-dirpath>li:gt(0)').removeClass('hidden');
						$('#showEllipsis').addClass('hidden');
					}
				} else {
					$el = $('.all-folder-page');
					noRecord($el);
				}
			}
			$(".all_table_list_third").LoadData("show");

			DataModel['listDirs'](parameter, callback, true, '');
		})
		.on('click', '#gotoMount', function (ev) {
			var isclickpath = true;
			var ismodal = true;
			listMountPoint(isclickpath, ismodal);
			$('#gotoParentDir').addClass('hidden');
		})
		.on('click', '#showDirPathModal .js-goto-path:gt(0)', function (ev) {
			$this = $(this);
			var path = $this.data('path');
			var page = '';
			var perpage = '';
			var parameter = {
				'path': formatPath4(path),
				'page': page,
				'perpage': perpage
			};
			var ismodal = true;
			var callback = function (result) {
				$(".all_table_list_third").LoadData("hide");
				if (result == undefined)
					return;
				if (result.code == 200) {
					var curpos = $('.js-goto-path').index($this);
					$this.addClass('disabled');
					$('.js-goto-path:gt(' + curpos + ')').remove();
					showDirsList(result, ismodal);
					//添加完整路径title
					$('#showPath').attr('title', getPathStr());
					//省略路径
					var dirDepth = $('.js-dirpath>li').length;
					if (dirDepth > 4) {
						$('.js-dirpath>li:gt(0)').addClass('hidden');
						$('.js-dirpath>li:gt(' + (dirDepth - 5) + ')').removeClass('hidden');

						if (dirDepth == 5)
							$('#showEllipsis').addClass('hidden');
					}
					else {
						$('.js-dirpath>li:gt(0)').removeClass('hidden');
						$('#showEllipsis').addClass('hidden');
					}
				} else {
					$el = $('.all-folder-page');
					noRecord($el);
				}
			}
			$(".all_table_list_third").LoadData("show");

			DataModel['listDirs'](parameter, callback, true, '');
		})

		//返回上级菜单
		.on('click', '#gotoParentDir', function (ev) {
			$this = $('.js-goto-path').eq(-2);
			var path = $this.data('path');
			//隐藏上级菜单链接
			if ($('.js-goto-path').eq(-3).data('path') == 'undefined') {
				$('#gotoParentDir').addClass('hidden');
			}
			var page = '';
			var perpage = '';
			var parameter = {
				'path': formatPath4(path),
				'page': page,
				'perpage': perpage
			};
			var callback = function (result) {
				$(".all_table_list_third").LoadData("hide");
				if (result == undefined)
					return;
				if (result.code == 200) {
					totalpage = Math.ceil( result.count/150 )
					var paginationHtml = renderPagination(totalpage, 1);
					$('#js-audit-pagination').html(paginationHtml);
					var curpos = $('.js-goto-path').index($this);
					$this.addClass('disabled');
					$('.js-goto-path:gt(' + curpos + ')').remove();
					showDirsList(result);

					//省略路径
					var dirDepth = $('.js-dirpath>li').length;
					if (dirDepth > 4) {
						$('.js-dirpath>li:eq(' + (dirDepth - 4) + ')').removeClass('hidden');
					}
					if (dirDepth < 6) {
						$('#showEllipsis').addClass('hidden');
					}

				} else {
					$el = $('.all-folder-page');
					noRecord($el);
				}
			}
			$(".all_table_list_third").LoadData("show");
			DataModel['listDirs'](parameter, callback, true, '');
		})


		//创建目录
		.on('click', '#addNewFolderModal .btn-primary', function (ev) {
			createNewFolder();
		})
		.on( 'keypress','#newdirname', function (ev) {
			var keycode = ev.which;
			if (keycode == 13) {
				createNewFolder();
			}
		})
		//删除文件
		.on('click', '#delFileModel .btn-primary', function (ev) {
			$modal = $('#delFileModel');
			var path = $modal.data('path');
			var username = $.cookie('login_user');
			var parameter = {
				path: formatPath4(path),
				username: username,
			};
			var callback = function (result) {
				$modal.find('.modal-header').LoadData('hide');
				if (result == undefined)
					return;
				if (result.code == 200) {
					DisplayTips(lang.file.del_file_success);
					$('.folder-ul .pop-right-menu').remove();
				} else {
					DisplayTips(lang.file.del_file_fail + '(' + result.result + ')');
				}
				$modal.modal('hide');
			}
			$modal.find('.modal-header').LoadData('show');
			DataModel['delDir'](parameter, callback, true, lang.file.del_file);
		})
		//删除目录
		.on('click', '#delDirModel .btn-primary', function () {
			$modal = $('#delDirModel');
			var path = $modal.data('path');
			var username = $.cookie('login_user');
			var parameter = {
				path: formatPath4(path),
				username: username,
			};
			var callback = function (result) {
				$modal.find('.modal-header').LoadData('hide');
				if (result == undefined)
					return;
				if (result.code == 200) {
					DisplayTips(lang.file.del_dir_success);
					$('.folder-ul .pop-right-menu').remove();
				} else {
					DisplayTips(lang.file.del_dir_fail + '(' + result.result + ')');
				}
				$modal.modal('hide');
			}
			$modal.find('.modal-header').LoadData('show');
			DataModel['delDir'](parameter, callback, true, lang.file.del_dir);
		})
		.on('click', '#cifsShareModal .btn-default', function (ev) {
			//点击 取消 的时候，重新列举cifs
		})
		/*
		 islist 是否列举还是编辑来着，好像被我改的没什么作用了，传true或者false
		 issearch 用来区分是否在搜索，如果当前是在搜索，则高亮匹配
		 */
		.on('click', '.js-plus-subusers', function (ev, islist, issearch) {
			$this = $(this);
			var ulist = [];
			var modalname = $this.closest('tr.js-group').closest('.modal').attr('id');
			if (modalname === 'cifsShareModal') {
				ulist = window.cifsuser;
			} else if (modalname === 'afpShareModal') {
				ulist = window.afpuser;
			};
			//缓存一个loaded，如果已经加载过，赋值为yes，不再发送ajax请求
			$tr = $(this).closest('tr');
			var groupid = $(this).data('gid') || $(this).data('uid');
			//if ( $('#index'+groupid).length > 0 ) {
			//	$this.closest('tr').next('tr.subusers').removeClass('hidden');
			//	$this.siblings('.js-minus-subusers').removeClass('hidden');
			//	$this.addClass('hidden');
			//	return;
			//}
			//若还未加载
			var parameter = '';
			var glododncallback = function (result) {
				if (result == undefined)
					return;
				if (result.code == 200) {
					listUsersAddHtmlAfterGroup(result, groupid, ulist, issearch);
				} else {
					DisplayTips(result.result);
				}
			}
			if (modalname === 'cifsShareModal') {
				if ($this.closest('tr.domain').length > 0) {
					//域用户
					var group = $this.data('uname');
					parameter = {
						'groupname': group,
						'page': 1,
						'perpage': -1,
					};
					DataModel["listADUsersByName"](parameter, glododncallback, false);
				} else if ($this.closest('tr').hasClass('ldapDomain')) {
					//LDAP域用户
					var group = $this.data('uname');
					parameter = {
						'group': group,
						'perpage': -1
					}
					DataModel["listLDAPByGroup"](parameter, glododncallback, false);
				} else {
					//本地用户
					parameter = {
						'groupid': groupid,
						'page': 1,
						'perpage': -1,
					};
					DataModel["listUsersByGroupid"](parameter, glododncallback, false, null);
				}
			} else {
				parameter = {
					'groupid': groupid,
					'page': 1,
					'perpage': -1,
				};
				DataModel["listUsersByGroupid"](parameter, glododncallback, false, null);
			}
		})
		//属性列举子用户
		.on('click', '.js-plus-pro-subusers', function (ev) {
			$this = $(this);
			//缓存一个loaded，如果已经加载过，赋值为yes，不再发送ajax请求
			var loaded = $this.data('loaded');
			if (loaded == 'yes') {
				$this.closest('tr').next('tr.subusers').removeClass('hidden');
				$this.siblings('.js-minus-pro-subusers').removeClass('hidden');
				$this.addClass('hidden');
				return;
			}
			//若还未加载
			$this.data('loaded', 'yes');
			$tr = $(this).closest('tr');
			var groupid = $(this).data('gid') || $(this).data('uid');
			var parameter = '';
			var dncallback = function (result) {
				if (result == undefined)
					return;
				if (result.code == 200) {
					var data = result.result;
					var htm = '';
					htm += '<tr class="subusers" id="index' + groupid + '" data-id="' + groupid + '"><td colspan="5"><table class="table table-condensed table-hover ">';
					for (var i = 0; i < data.length; i++) {
						if (data[i].userid == undefined) {
							userid = '';
						} else {
							userid = data[i].userid;
						}
						if (data[i].username == undefined) {
							name = domainNameData + '\\' + data[i].uname;
						} else {
							name = data[i].username;
						}
						if (data[i].username == undefined) {
							tname = data[i].uname;
						} else {
							tname = data[i].username;
						}

						htm += '<tr class="js-user" data-name="' + name + '">' +
							'<td class="left" style="width:30%;padding-left:20px;">' +
							'<a href="javascript:;" data-userid="' + userid + '"></a>' +
							'<span>' + tname + '</span>' +
							'</td>';
						var tmp = false;
						if (uauthData.length > 0) {
							var ischecked = false;
							var isauth, issub;
							for (var k = 0; k < uauthData.length; k++) {
								if (uauthData[k]['user'] === name) {
									ischecked = true;
									isauth = uauthData[k]['auth'];
									issub = uauthData[k]['issub'];
									tmp = true;
								}
							};

							if (tmp) {
								if (getACLType(isauth) == 'read') {
									htm += '<td style="width:15%;"><input type="checkbox" value="read" class="sub-pro-r" checked="checked";/></td>' +
										'<td style="width:15%;"><input type="checkbox" value="write" class="sub-pro-r-w"/></td>' +
										'<td style="width:15%;"><input type="checkbox"  value="forbidden" class="sub-pro-noauth"/></td>';
								} else if (getACLType(isauth) == 'write') {
									htm += '<td style="width:15%;"><input type="checkbox" value="read" class="sub-pro-r";/></td>' +
										'<td style="width:15%;"><input type="checkbox" value="write" class="sub-pro-r-w" checked="checked"/></td>' +
										'<td style="width:15%;"><input type="checkbox"  value="forbidden" class="sub-pro-noauth"/></td>';
								} else if (getACLType(isauth) == 'forbidden') {
									htm += '<td style="width:15%;"><input type="checkbox" value="read" class="sub-pro-r";/></td>' +
										'<td style="width:15%;"><input type="checkbox" value="write" class="sub-pro-r-w"/></td>' +
										'<td style="width:15%;"><input type="checkbox"  value="forbidden" class="sub-pro-noauth" checked="checked"/></td>';
								}
								if (issub == 1) {
									htm += '<td style="width:25%;"><input type="checkbox" value="forsubdir" class="sub-dir-apply" checked="checked";/></td>';
								} else if (issub == 0) {
									htm += '<td style="width:25%;"><input type="checkbox" value="forsubdir" class="sub-dir-apply"/></td>';
								}
							} else {
								if ($tr.find('.sub-pro-r').prop('checked') == true) {
									htm += '<td style="width:15%;"><input type="checkbox" value="read" class="sub-pro-r" checked="checked";/></td>';
								} else {
									htm += '<td style="width:15%;"><input type="checkbox" value="read" class="sub-pro-r"/></td>';
								}
								if ($tr.find('.sub-pro-r-w').prop('checked') == true) {
									htm += '<td style="width:15%;"><input type="checkbox" value="write" class="sub-pro-r-w" checked="checked";/></td>';
								} else {
									htm += '<td style="width:15%;"><input type="checkbox" value="write" class="sub-pro-r-w"/></td>';
								}
								if ($tr.find('.sub-pro-noauth').prop('checked') == true) {
									htm += '<td style="width:15%;"><input type="checkbox"  value="forbidden" class="sub-pro-noauth" checked="checked";/></td>';
								} else {
									htm += '<td style="width:15%;"><input type="checkbox"  value="forbidden" class="sub-pro-noauth"/></td>';
								}
								if ($tr.find('.sub-dir-apply').prop('checked') == true) {
									htm += '<td style="width:25%;"><input type="checkbox" value="forsubdir" class="sub-dir-apply" checked="checked";/></td>';
								} else {
									htm += '<td style="width:25%;"><input type="checkbox" value="forsubdir" class="sub-dir-apply"/></td>';
								}
								htm += '</tr>';
							}
						} else {
							if ($tr.find('.sub-pro-r').prop('checked') == true) {
								htm += '<td style="width:15%;"><input type="checkbox" value="read" class="sub-pro-r" checked="checked";/></td>';
							} else {
								htm += '<td style="width:15%;"><input type="checkbox" value="read" class="sub-pro-r"/></td>';
							}
							if ($tr.find('.sub-pro-r-w').prop('checked') == true) {
								htm += '<td style="width:15%;"><input type="checkbox" value="write" class="sub-pro-r-w" checked="checked";/></td>';
							} else {
								htm += '<td style="width:15%;"><input type="checkbox" value="write" class="sub-pro-r-w"/></td>';
							}
							if ($tr.find('.sub-pro-noauth').prop('checked') == true) {
								htm += '<td style="width:15%;"><input type="checkbox"  value="forbidden" class="sub-pro-noauth" checked="checked";/></td>';
							} else {
								htm += '<td style="width:15%;"><input type="checkbox"  value="forbidden" class="sub-pro-noauth"/></td>';
							}
							if ($tr.find('.sub-dir-apply').prop('checked') == true) {
								htm += '<td style="width:25%;"><input type="checkbox" value="forsubdir" class="sub-dir-apply" checked="checked";/></td>';
							} else {
								htm += '<td style="width:25%;"><input type="checkbox" value="forsubdir" class="sub-dir-apply"/></td>';
							}
						}

						htm += '</tr>';
					};
					htm += '</table></td></tr>';
					$this.siblings('.js-minus-pro-subusers').removeClass('hidden');
					$this.addClass('hidden');
					$tr.after(htm);
					if ($('.js-clear-dir-property span').text() == lang.file.clear_sub_file) {
						$('.sub-dir-apply').parent().addClass('hidden')
					}
				} else {
					DisplayTips(result.result);
				}
			}

			if ($this.closest('tr.domain').length > 0) {
				var group = $this.data('uname');
				parameter = {
					'groupname': group,
					'page': 1,
					'perpage': -1,
				};
				DataModel["listADUsersByName"](parameter, dncallback, false);
			} else if ($this.closest('tr').hasClass('ldapDomain')) {
				//LDAP域用户
				var group = $this.data('uname');
				parameter = {
					'group': group,
					'perpage': -1
				}
				DataModel["listLDAPByGroup"](parameter, dncallback, false);
			} else {
				parameter = {
					'groupid': groupid,
					'page': 1,
					'perpage': -1,
				};
				DataModel["listUsersByGroupid"](parameter, dncallback, false);
			}
		})
		.on('click', '.js-minus-subusers', function (ev) {
			$this = $(this);
			$this.closest('tr').next().addClass('hidden');
			$this.siblings('.js-plus-subusers').removeClass('hidden');
			$this.addClass('hidden');
		})
		.on('click', '.js-minus-pro-subusers', function (ev) {
			$this = $(this);
			$this.closest('tr').next().addClass('hidden');
			$this.siblings('.js-plus-pro-subusers').removeClass('hidden');
			$this.addClass('hidden');
		})
		//只读 全选
		.on('click', '.read-only-all', function (ev) {
			$this = $(this);
			var $inputs = $(this).closest('table').siblings('.share-table').find('table tr td .sub-r');
			var $inputother = $(this).closest('table').siblings('.share-table').find('table tr td .sub-r-w');

			if ($(this).prop('checked') == true) {
				$inputs.each(function (i) {
					$(this).prop("checked", true);
				})
				$inputother.each(function (i) {
					$(this).prop("checked", false);
				})
				$('.r-and-w-all').prop("checked", false);
			} else {
				$inputs.each(function (i) {
					$(this).prop("checked", false);
				})
			}
		})
		//读写 全选
		.on('click', '.r-and-w-all', function (ev) {
			$this = $(this);
			var $inputs = $this.closest('table').siblings('.share-table').find('table tr td .sub-r-w');
			var $inputother = $this.closest('table').siblings('.share-table').find('table tr td .sub-r');

			if ($this.prop('checked') == true) {
				$inputs.each(function (i) {
					$(this).prop("checked", true);
				})
				$inputother.each(function (i) {
					$(this).prop("checked", false);
				})
				$('.read-only-all').prop("checked", false);
			} else {
				$inputs.each(function (i) {
					$(this).prop("checked", false);
				})
			}
		})
		//用户组只读 全选(且只读、读写只能选择一个)
		//属性
		.on('click', '.js-group .sub-pro-r', function (ev) {
			$this = $(this);
			$tr = $(this).closest('tr');
			$subtrs = $tr.next('tr.subusers');
			$inputs = $subtrs.find('table input.sub-pro-r');

			if ($this.prop('checked') == true) {
				//同一级的用户组 读写和禁止访问 不勾选
				$tr.find('.sub-pro-r-w').prop("checked", false);
				$tr.find('.sub-pro-noauth').prop("checked", false);
				//下一级的 读写和禁止访问 不勾选
				$tr.next('.subusers').find('.sub-pro-r-w').prop("checked", false);
				$tr.next('.subusers').find('.sub-pro-noauth').prop("checked", false);

				$inputs.each(function (i) {
					$(this).prop("checked", true);
				})
			} else {
				$inputs.each(function (i) {
					$(this).prop("checked", false);
				})
			}
		})
		//共享框中
		.on('click', '.js-group .sub-r', function (ev) {
			$this = $(this);
			$tr = $(this).closest('tr');
			$subtrs = $tr.next('tr.subusers');
			$inputs = $subtrs.find('table input.sub-r');

			if ($this.prop('checked') == true) {
				$tr.find('.sub-r-w').prop("checked", false);
				$tr.next('.subusers').find('.sub-r-w').prop("checked", false);
				// 读写全选 取消勾选
				$('.r-and-w-all').prop("checked", false);
				$inputs.each(function (i) {
					$(this).prop("checked", true);
				})
			} else {
				// 读写全选 取消勾选
				$('.read-only-all').prop("checked", false);
				$inputs.each(function (i) {
					$(this).prop("checked", false);
				})
			}
		})
		//单个点击只读，只读选中，其余消失
		.on('click', '.subusers .sub-pro-r', function (ev) {
			$this = $(this);
			$tr = $this.closest('tr.js-user');
			if ($this.prop('checked') == true) {
				$tr.find('.sub-pro-r-w').prop("checked", false);
				$tr.find('.sub-pro-noauth').prop("checked", false);
				//只要有一个 只读权限被选，那么上一级的全选取消勾选
				$tr.closest('.subusers').prev('.js-group').find('.sub-pro-r-w').prop("checked", false);
				$tr.closest('.subusers').prev('.js-group').find('.sub-pro-noauth').prop("checked", false);
			}
			var len = 0;
			$inputs = $this.closest('.subusers').find('table input.sub-pro-r');
			if ($this.prop('checked') == true) {
				$inputs.each(function (i) {
					if ($(this).prop("checked") == true) {
						++len;
						if (len == $inputs.length) {
							$this.closest('.subusers').prev('tr.js-group').find('.sub-pro-r').prop("checked", true);
						}
					}
				});
			} else {
				$inputs.each(function (i) {
					if ($(this).prop("checked") == true) {
						--len;
						if (len != $inputs.length) {
							$this.closest('.subusers').prev('tr.js-group').find('.sub-pro-r').prop("checked", false);
						}
					}
				});
			}
		})
		.on('click', '.subusers .sub-r', function (ev) {
			$this = $(this);
			$tr = $this.closest('tr.js-user');
			if ($this.prop('checked') == true) {
				$tr.find('.sub-r-w').prop("checked", false);
				//上一级的 只读全选取消勾选
				$tr.closest('.subusers').prev('.js-group').find('.sub-r-w').prop("checked", false);
				// 读写全选 取消勾选
				$('.r-and-w-all').prop("checked", false);
			}
			var len = 0;
			$inputs = $this.closest('.subusers').find('table input.sub-r');
			if ($this.prop('checked') == true) {
				$inputs.each(function (i) {
					if ($(this).prop("checked") == true) {
						++len;
						if (len == $inputs.length) {
							$this.closest('.subusers').prev('tr.js-group').find('.sub-r').prop("checked", true);
						}
					}
				});
			} else {
				// 只读全选 取消勾选
				$('.read-only-all').prop("checked", false);
				$inputs.each(function (i) {
					if ($(this).prop("checked") == true) {
						--len;
						if (len != $inputs.length) {
							$this.closest('.subusers').prev('tr.js-group').find('.sub-r').prop("checked", false);
						}
					}
				});
			}
		})
		.on('click', '.subusers .sub-r-w', function (ev) {
			$this = $(this);
			$inputs = $this.closest('.subusers').find('table input.sub-r-w');
			$tr = $this.closest('tr.js-user');
			var len = 0;
			if ($this.prop('checked') == true) {
				$tr.find('.sub-r').prop("checked", false);
				//上一级的 只读全选取消勾选
				$tr.closest('.subusers').prev('.js-group').find('.sub-r').prop("checked", false);
				// 只读全选 取消勾选
				$('.read-only-all').prop("checked", false);
				$inputs.each(function (i) {
					if ($(this).prop("checked") == true) {
						++len;
						if (len == $inputs.length) {
							$this.closest('.subusers').prev('tr.js-group').find('.sub-r-w').prop("checked", true);
						}
					}
				});
			} else {
				// 读写全选 取消勾选
				$('.r-and-w-all').prop("checked", false);
				$inputs.each(function (i) {
					--len;
					if (len != $inputs.length) {
						$this.closest('.subusers').prev('tr.js-group').find('.sub-r-w').prop("checked", false);
					}
				});
			}
		})
		.on('click', '.subusers .sub-pro-r-w', function (ev) {
			$this = $(this);
			$tr = $this.closest('tr.js-user');
			$inputs = $this.closest('.subusers').find('table input.sub-pro-r-w');
			var len = 0;
			if ($this.prop('checked') == true) {
				$tr.find('.sub-pro-r').prop("checked", false);
				$tr.find('.sub-pro-noauth').prop("checked", false);
				//只要有一个 读写权限被选，那么上一级的全选取消勾选
				$tr.closest('.subusers').prev('.js-group').find('.sub-pro-r').prop("checked", false);
				$tr.closest('.subusers').prev('.js-group').find('.sub-pro-noauth').prop("checked", false);
				$inputs.each(function (i) {
					if ($(this).prop("checked") == true) {
						++len;
						if (len == $inputs.length) {
							$this.closest('.subusers').prev('tr.js-group').find('.sub-pro-r-w').prop("checked", true);
						}
					}
				});
			} else {
				$inputs.each(function (i) {
					--len;
					if (len != $inputs.length) {
						$this.closest('.subusers').prev('tr.js-group').find('.sub-pro-r-w').prop("checked", false);
					}
				});
			}
		})
		//用户组读写 全选
		.on('click', '.js-group .sub-r-w', function (ev) {
			$this = $(this);
			$tr = $(this).closest('tr');
			$subtrs = $tr.next('tr.subusers');
			$inputs = $subtrs.find('table input.sub-r-w');

			if ($(this).prop('checked') == true) {
				$tr.find('.sub-r').prop("checked", false);
				//下一级的 读写和禁止访问 不勾选
				$tr.next('.subusers').find('.sub-r').prop("checked", false);
				// 只读全选 取消勾选
				$('.read-only-all').prop("checked", false);
				$inputs.each(function (i) {
					$(this).prop("checked", true);
				})
			} else {
				// 读写全选 取消勾选
				$('.r-and-w-all').prop("checked", false);
				$inputs.each(function (i) {
					$(this).prop("checked", false);
				})
			}
		})
		//属性 用户组读写  全选
		.on('click', '.js-group .sub-pro-r-w', function (ev) {
			$this = $(this);
			$tr = $(this).closest('tr');
			$subtrs = $tr.next('tr.subusers');
			$inputs = $subtrs.find('table input.sub-pro-r-w');

			if ($(this).prop('checked') == true) {
				$tr.find('.sub-pro-r').prop("checked", false);
				$tr.find('.sub-pro-noauth').prop("checked", false);
				//下一级的 读写和禁止访问 不勾选
				$tr.next('.subusers').find('.sub-pro-r').prop("checked", false);
				$tr.next('.subusers').find('.sub-pro-noauth').prop("checked", false);
				$inputs.each(function (i) {
					$(this).prop("checked", true);
				})
			} else {
				$inputs.each(function (i) {
					$(this).prop("checked", false);
				})
			}
		})
		//属性 禁止访问  全选
		.on('click', '.js-group .sub-pro-noauth', function (ev) {
			$this = $(this);
			$subtrs = $(this).closest('tr').next('tr.subusers');
			$tr = $this.closest('tr');
			$inputs = $subtrs.find('table input.sub-pro-noauth');

			if ($(this).prop('checked') == true) {
				$tr.find('.sub-pro-r').prop("checked", false);
				$tr.find('.sub-pro-r-w').prop("checked", false);
				//下一级的 读写和禁止访问 不勾选
				$tr.next('.subusers').find('.sub-pro-r').prop("checked", false);
				$tr.next('.subusers').find('.sub-pro-r-w').prop("checked", false);
				$inputs.each(function (i) {
					$(this).prop("checked", true);
				})
			} else {
				$inputs.each(function (i) {
					$(this).prop("checked", false);
				})
			}
		})
		//属性 下一级子用户 单击禁止访问
		.on('click', '.subusers .sub-pro-noauth', function (ev) {
			$this = $(this);
			$tr = $this.closest('tr.js-user');
			$inputs = $this.closest('.subusers').find('table input.sub-pro-noauth');
			var len = 0;
			if ($this.prop('checked') == true) {
				$tr.find('.sub-pro-r').prop("checked", false);
				$tr.find('.sub-pro-r-w').prop("checked", false);
				//只要有一个 读写权限被选，那么上一级的全选取消勾选
				$tr.closest('.subusers').prev('.js-group').find('.sub-pro-r').prop("checked", false);
				$tr.closest('.subusers').prev('.js-group').find('.sub-pro-r-w').prop("checked", false);
				$inputs.each(function (i) {
					if ($(this).prop("checked") == true) {
						++len;
						if (len == $inputs.length) {
							$this.closest('.subusers').prev('tr.js-group').find('.sub-pro-noauth').prop("checked", true);
						}
					}
				});
			} else {
				$inputs.each(function (i) {
					--len;
					if (len != $inputs.length) {
						$this.closest('.subusers').prev('tr.js-group').find('.sub-pro-noauth').prop("checked", false);
					}
				});
			}
		})
		//属性 应用到子目录  全选
		.on('click', '.js-group .sub-dir-apply', function (ev) {
			$this = $(this);
			$subtrs = $(this).closest('tr').next('tr.subusers');
			$tr = $this.closest('tr');
			$inputs = $subtrs.find('table input.sub-dir-apply');

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
		//属性 下一级子用户 单击应用到子目录
		.on('click', '.subusers .sub-dir-apply', function (ev) {
			$this = $(this);
			$tr = $this.closest('tr.js-user');
			$inputs = $this.closest('.subusers').find('table input.sub-dir-apply');
			var len = 0;
			if ($this.prop('checked') == true) {
				$inputs.each(function (i) {
					if ($(this).prop("checked") == true) {
						++len;
						if (len == $inputs.length) {
							$this.closest('.subusers').prev('tr.js-group').find('.sub-dir-apply').prop("checked", true);
						}
					}
				});
			} else {
				$inputs.each(function (i) {
					--len;
					if (len != $inputs.length) {
						$this.closest('.subusers').prev('tr.js-group').find('.sub-dir-apply').prop("checked", false);
					}
				});
			}
		})
		//属性 当前组  禁止访问 勾选
		.on('click', '.js-cur-group .sub-pro-noauth', curgroupNoauthChecked)
		//属性 当前组  禁止访问 勾选
		.on('click', '.js-cur-group .sub-pro-r', curgroupReadChecked)
		//属性 当前组  禁止访问 勾选
		.on('click', '.js-cur-group .sub-pro-r-w', curgroupWriteChecked)
		//属性 当前组  禁止访问 勾选
		.on('click', '.js-other-users .sub-pro-noauth', curgroupNoauthChecked)
		//属性 当前组  禁止访问 勾选
		.on('click', '.js-other-users .sub-pro-r', curgroupReadChecked)
		//属性 当前组  禁止访问 勾选
		.on('click', '.js-other-users .sub-pro-r-w', curgroupWriteChecked)
		//创建afp共享
		.on('click', '#afpShareModal .btn-primary', function (ev) {
			$modal = $('#afpShareModal');
			var path = trim($modal.find('#dirname').val() );
			var folderPath = formatPath3(path) + ',1';
			//处理路径传空白字符
			if (folderPath == 'infinityfs1,1,,1') {
				folderPath = 'infinityfs1,1'
			}
			var name = trim($modal.find('#share_name').val());
			var uname, value;
			if (name == '') {
				DisplayTips(lang.file.input_share_name);
				return;
			}
			if (name.length > 32) {
				DisplayTips(lang.file.input_share_name_long);
				return;
			}
			var isGuest = "0";// 获取匿名登录信息
			//获取用户列表和组
			var ulist = '';
			var glist = '';
			$input = $modal.find('.share-table').find('input[type="checkbox"]:checked');
			if ($input.length < 1) {
				DisplayTips(lang.file.select_users);
				return;
			}
			//判断是否有用户组(只是单纯的判断选出组)
			$ginput = $modal.find('.share-table').find('.js-group input[type="checkbox"]:checked');
			if ($ginput.length > 0) {
				glist = groupPermit($ginput, glist);
			}
			//获取被选的用户（只获取用户不考虑组）
			$uinput = $('.js-user').find('input[type="checkbox"]:checked');
			ulist = userPermit($uinput, ulist);
			var parameter = {
				"path": formatPath4(folderPath),
				"name": name,
				"uauth": ulist,
				"gauth": glist,
				"isguest": isGuest,
				"operator": "admin"
			};
			var dncallback = function (result) {
				removeWaitMask();
				$modal.find('.modal-header').LoadData('hide');
				if (result == undefined)
					return;
				if (result.code == 200) {
					var ispageedit = $modal.data('ispageedit');
					DisplayTips(lang.file.edit_afp_share_success);
					$img = $('.js-dir.pop-right-menu').find('img');
					$img.attr('src', 'css/image/folder_normal_share.png');
					if (ispageedit) {
						refresh();
					}
					updateTipShareInfo('AFP');
				} else {
					DisplayTips(lang.file.edit_afp_share_fail + '(' + result.result + ')');
				}
				$modal.modal('hide');
			}
			$modal.find('.modal-header').LoadData('show');
			addWaitMask();
			DataModel["createAfp"](parameter, dncallback, true, lang.file.edit_afp);
		})
		//删除afp共享
		.on('click', '#afpShareModal .btn-danger', function (ev) {
			var path = $('#afpShareModal #dirname').val();
			var folderPath = formatPath3(path) + ',1';
			var parameter = {
				"path": formatPath4(folderPath),
				"operator": "admin",
			};
			var dncallback = function (result) {
				if (result == undefined)
					return;
				if (result.code == 200) {
					DisplayTips(lang.file.del_afp_share_success);
					$img = $('.js-dir.pop-right-menu').find('img');
					$img.attr('src', 'css/image/folder_normal.png');
				} else {
					DisplayTips(lang.file.del_afp_share_fail + '(' + result.result + ')');
				}
				$('#afpShareModal').modal('hide');
			}
			DataModel["delAfp"](parameter, dncallback, true, lang.file.del_afp_share);
		})
		//ftp共享选择不同用户组时显示对应用户信息
		.on('change', '#ftpShareModal .share-local-group', function (ev) {
			$this = $(this);
			var $userTable = $('#ftpShareModal .share-table tbody');
			var gid = $this.find('option:selected').data('gid');
			var isftp = true;
			var ishttp = false;
			$userTable.html(getUsersByGid(gid, isftp, ishttp));
		})
		//创建ftp共享
		.on('click', '#ftpShareModal .btn-primary', function (ev) {
			$modal = $('#ftpShareModal');
			var path = trim($modal.find('#dirname').val() );
			var folderPath = formatPath3(path) + ',1';
			//处理路径传空白字符
			if (folderPath == 'infinityfs1,1,,1') {
				folderPath = 'infinityfs1,1'
			}
			//获取用户列表和组
			var ulist = '';
			$input = $modal.find('.js-user').find('input[type="checkbox"]:checked');
			if ($input.length < 1) {
				DisplayTips(lang.file.select_users_only);
				return;
			}
			//获取被选的用户（只获取用户不考虑组）
			$uinput = $(this).closest('#ftpShareModal').find('.js-user input[type="checkbox"]:checked');
			if ($uinput.length < 1) {
				DisplayTips(lang.file.select_users_only);
				return;
			}
			ulist = getUserAuth($uinput, ulist);
			var parameter = {
				"path": formatPath4(folderPath),
				"uauth": ulist,
			};
			var dncallback = function (result) {
				removeWaitMask();
				$modal.find('.modal-header').LoadData('hide');
				if (result == undefined)
					return;
				if (result.code == 200) {
					var ispageedit = $('#ftpShareModal').data('ispageedit');
					DisplayTips(lang.file.edit_ftp_share_success);
					$img = $('.js-dir.pop-right-menu').find('img');
					$img.attr('src', 'css/image/folder_normal_share.png');
					if (ispageedit) {
						refresh();
					}
					updateTipShareInfo('FTP');
				} else {
					DisplayTips(lang.file.edit_ftp_share_fail);
				}
				$modal.modal('hide');
			}
			$modal.find('.modal-header').LoadData('show');
			addWaitMask();
			DataModel["createFtp"](parameter, dncallback, true, lang.file.edit_ftp_share);
		})
		//删除ftp共享
		.on('click', '#ftpShareModal .btn-danger', function (ev) {
			var path = $('#ftpShareModal #dirname').val();
			var folderPath = formatPath3(path) + ',1';
			var parameter = {
				"path": formatPath4(folderPath),
				"operator": "admin",
			};
			var dncallback = function (result) {
				if (result == undefined)
					return;
				if (result.code == 200) {
					DisplayTips(lang.file.del_ftp_share_success);
					$img = $('.js-dir.pop-right-menu').find('img');
					$img.attr('src', 'css/image/folder_normal.png');
				} else {
					DisplayTips(lang.file.del_ftp_share_fail + '(' + result.result + ')');
				}
				$('#ftpShareModal').modal('hide');
			}
			DataModel["delFtp"](parameter, dncallback, true, lang.file.del_ftp_share);
		})
		//http共享选择不同用户组时显示对应用户信息
		.on('change', '#httpShareModal .share-local-group', function (ev) {
			$this = $(this);
			var $userTable = $('#httpShareModal .share-table tbody');
			var gid = $this.find('option:selected').data('gid');
			var isftp = false;
			var ishttp = true;
			$userTable.html(getUsersByGid(gid, isftp, ishttp));
		})
		//创建http共享
		.on('click', '#httpShareModal .btn-primary', function (ev) {
			$modal = $('#httpShareModal');
			var path = $modal.find('#dirname').val();
			var folderPath = formatPath3(path) + ',1';
			//处理路径传空白字符
			if (folderPath == 'infinityfs1,1,,1') {
				folderPath = 'infinityfs1,1'
			}
			var name = trim($modal.find('.share-name').val());
			//var unit = trim( $modal.find(".modal-body #unit").val() );
			//var size = trim( $modal.find('.share-allocation-size').val() );
			var unit = 'T';
			var size = '100';
			if (name == '') {
				DisplayTips(lang.file.input_share_name);
				return;
			}
			if (name.length > 32) {
				DisplayTips(lang.file.input_share_name_long);
				return;
			}
			if (size == '') {
				DisplayTips(lang.file.input_allocation_size);
				return;
			}
			if (isNaN(size)) {
				DisplayTips(lang.file.allocation_size_not_num);
				return;
			}
			if (unit === "M") {
				size *= 1024;
			} else if (unit === "G") {
				size *= 1024 * 1024;
			} else if (unit === "T") {
				size *= 1024 * 1024 * 1024;
			}
			var ulist = '';
			$uinput = $(this).closest('#httpShareModal').find('.js-user input[type="checkbox"]:checked');
			if ($uinput.length < 1) {
				DisplayTips(lang.file.select_users_only);
				return;
			}
			ulist = getUserAuth($uinput, ulist);
			var parameter = {
				"path": formatPath4(folderPath),
				"name": name,
				"quota": size,
				"auths": ulist,
				"operator": "admin"
			};
			var dncallback = function (result) {
				removeWaitMask();
				$modal.find('.modal-header').LoadData('hide');
				if (result == undefined)
					return;
				if (result.code == 200) {
					var ispageedit = $('#httpShareModal').data('ispageedit');
					DisplayTips(lang.file.edit_http_share_success);
					$img = $('.js-dir.pop-right-menu').find('img');
					$img.attr('src', 'css/image/folder_normal_share.png');
					if (ispageedit) {
						refresh();
					}
					updateTipShareInfo('HTTP');
				} else {
					DisplayTips(lang.file.edit_http_share_fail + '(' + result.result + ')');
				}
				$modal.modal('hide');
			}
			$modal.find('.modal-header').LoadData('show');
			addWaitMask();
			DataModel["createHttp"](parameter, dncallback, true, lang.file.edit_http_share);
		})
		//删除http共享
		.on('click', '#httpShareModal .btn-danger', function (ev) {
			var path = $('#httpShareModal #dirname').val();
			var folderPath = formatPath3(path) + ',1';
			var parameter = {
				"path": formatPath4(folderPath),
				"operator": "admin",
			};
			var dncallback = function (result) {
				if (result == undefined)
					return;
				if (result.code == 200) {
					DisplayTips(lang.file.del_http_share_success);
					$img = $('.js-dir.pop-right-menu').find('img');
					$img.attr('src', 'css/image/folder_normal.png');
				} else {
					DisplayTips(lang.file.del_http_share_fail + '(' + result.result + ')');
				}
				$('#httpShareModal').modal('hide');
			}
			DataModel["delHttp"](parameter, dncallback, true, lang.file.del_http_share);
		})
		//nfs添加ip
		.on('keypress', '#nfsShareModal #add_nfs_machine', function (ev) {
			var keycode = ev.which;
			if (keycode == 13) {
				var machine = trim($(this).val());
				if (typeof (machine) === "undefined" || machine === "") {
					DisplayTips(lang.file.input_machine_ip);
					return;
				}
				var isall = machine.toLowerCase();
				if (isall === "all") {
					machine = "*";
				}
				if (!valifySubNetIP(machine)) {
					if (!valifyIP(machine)) {
						DisplayTips(lang.file.machine_format_error);
						return;
					}
				}
				var auth = $('input:radio[name="auth"]:checked').val();
				var str = '';
				if (auth == "1") {
					str += lang.file.only_read;
				} else if (auth == "2") {
					str += lang.file.read_and_write;
				}
				var htm = '';
				//判断是否重复添加ip
				$ips = $('#nfsShareModal .js-machine');
				var ison = true;
				$ips.each(function (i) {
					if ($(this).data('ip') == machine) {
						ison = false;
						DisplayTips(lang.file.the_machineip_added);
						return;
					}
				})
				if (ison) {
					htm = '<div class="js-machine" data-ip="' + machine + '" data-v="' + auth + '">' +
						'<span>' + machine + '</span>' +
						'<span>' + str + '</span>' +
						'<a class="fl-rt">' +
						'<span class="glyphicon glyphicon-trash" style="color:red"></span>' +
						'</a>' +
						'</div>';
				}

				$('#nfsShareModal .text-area-style').append(htm);
			}
		})
		//nfs删除IP
		.on('click', '#nfsShareModal .js-machine a', function (ev) {
			$this = $(this);
			$machinerow = $this.closest('.js-machine');
			$machinerow.remove();
		})
		//创建nfs共享
		.on('click', '#nfsShareModal .btn-primary', function (ev) {
			$modal = $('#nfsShareModal');
			var path = $('#nfsShareModal #dirname').val();
			if (path == '') {
				DisplayTips(lang.file.please_add_share_path);
				return false;
			}
			var folderPath = formatPath3(path) + ',1';
			//处理路径传空白字符
			if (folderPath == 'infinityfs1,1,,1') {
				folderPath = 'infinityfs1,1'
			}
			$ips = $('.text-area-style .js-machine');
			var auths = '';
			var ip = '';
			var v = '';
			$ips.each(function (i) {
				ip = $(this).data('ip');
				v = $(this).data('v');
				auths += ip + ',' + v + ',';
			});
			auths = auths.substring(0, auths.length - 1);

			if (auths == '') {
				DisplayTips(lang.file.input_sharemachine_ip);
				return false;
			}
			var parameter = {
				"path": formatPath4(folderPath),
				"auths": auths,
				"operator": "admin"
			};
			var dncallback = function (result) {
				removeWaitMask();
				$modal.find('.modal-header').LoadData('hide');
				if (result == undefined)
					return;
				if (result.code == 200) {
					var ispageedit = $modal.data('ispageedit');
					DisplayTips(lang.file.edit_nfs_share_success);
					$img = $('.js-dir.pop-right-menu').find('img');
					$img.attr('src', 'css/image/folder_normal_share.png');
					if (ispageedit) {
						refresh();
					}
					updateTipShareInfo('NFS');
				} else {
					DisplayTips(lang.file.edit_nfs_share_fail + '(' + result.result + ')');
				}
				$modal.modal('hide');
			}
			$modal.find('.modal-header').LoadData('show');
			addWaitMask();
			DataModel["createNfs"](parameter, dncallback, true, lang.file.edit_nfs_share);
		})
		.on('click', '#nfsShareModal .btn-danger', function (ev) {
			var path = $('#nfsShareModal #dirname').val();
			var folderPath = formatPath3(path) + ',1';
			var parameter = {
				"path": formatPath4(folderPath),
				"operator": "admin",
			};
			var dncallback = function (result) {
				if (result == undefined)
					return;
				if (result.code == 200) {
					DisplayTips(lang.file.del_nfs_share_success);
					$img = $('.js-dir.pop-right-menu').find('img');
					$img.attr('src', 'css/image/folder_normal.png');
				} else {
					DisplayTips(lang.file.del_nfs_share_fail + '(' + result.result + ')');
				}
				$('#nfsShareModal').modal('hide');
			}
			DataModel["delNFS"](parameter, dncallback, true, lang.file.del_nfs_share);
		})
		.on('change', '#guestuser', function (ev) {
			var type = $(this).val();
			$modal = $('#cifsShareModal');
			if (type == 0) {
				$('#cifs-usergroup-list').show();
				$('#cifs-left-setting').addClass('col-lg-5 col-md-5').removeClass('col-lg-12 col-md-12');
				$modal.find('.modal-dialog').css('width', '900px');
				$modal.find('.js-guestacl').addClass('hidden');
			} else if (type == 1) {
				$('#cifs-usergroup-list').hide();
				$('#cifs-left-setting').removeClass('col-lg-5 col-md-5').addClass('col-lg-12 col-md-12');
				$modal.find('.modal-dialog').css('width', '400px');
				$modal.find('.js-guestacl').removeClass('hidden');
			}
		})
		//创建cifs共享
		.on('click', '#cifsShareModal .btn-primary', function (ev) {
			$modal = $('#cifsShareModal');
			var path = $modal.find('#dirname').val();
			if (path == '' || path == undefined) {
				DisplayTips(lang.file.please_add_share_path);
				return false;
			}
			var folderPath = formatPath3(path) + ',1';
			//处理路径传空白字符
			if (folderPath == 'infinityfs1,1,,1') {
				folderPath = 'infinityfs1,1'
			}
			var name = trim($modal.find('.share-name').val());
			var uname, value;
			if (name == '') {
				DisplayTips(lang.file.input_share_name);
				return;
			}
			if (name.length > 32) {
				DisplayTips(lang.file.input_share_name_long);
				return;
			}
			if(valifySpecialfiletype(name)){
				var filename = valifySpecialfile(name)[0];
				DisplayTips(lang.cluster.key_not_special +　filename);
				return;
			}
			// 获取匿名登录信息
			var isGuest = trim($modal.find('#guestuser').val());
			var guestAcl = trim($modal.find('#guestacl').val());

			//获取文件所有者和文件权限
			var defaultOwner = trim($modal.find('#default-owner').val());
			var defaultAcl = trim($modal.find('#default-acl').val());

			//审计
			var audit = parseInt($modal.find('#cifs-audit').val())

			//客户端缓存
			var clientCache = $modal.find('#cifs-client-cache').val();

			//获取过滤信息
			//文件类型
			var filter = '';
			var $filetyperows = $('.text-area-filter-filetype').find('.js-file-type');
			for (var i = 0; i < $filetyperows.length; i++) {
				var title = trim($($filetyperows[i]).attr('title'));
				filter += '*.' + title + ',';
			};
			var $keywordrows = $('.text-area-filter-keywords').find('.js-file-keyword');
			for (var i = 0; i < $keywordrows.length; i++) {
				var title = trim($($keywordrows[i]).attr('title'));
				filter += '*' + title + '*' + ',';
			};
			filter = filter.substring(0, filter.length - 1);

			//获取用户列表和组
			var ulist = '';
			var glist = '';
			$input = $modal.find('.share-table').find('input[type="checkbox"]:checked');
			if ($input.length < 1 && isGuest != 1) {
				DisplayTips(lang.file.select_users);
				return;
			}
			//判断是否有用户组(只是单纯的判断选出组)
			$ginput = $modal.find('.share-table').find('.js-group input[type="checkbox"]:checked');
			if ($ginput.length > 0) {
				glist = groupPermit($ginput, glist);
			}
			// //获取被选的用户（只获取用户不考虑组）
			$uinput = $modal.find('.js-user').find('input[type="checkbox"]:checked');
			ulist = userPermit($uinput, ulist);
			var parameter = {
				"path": formatPath4(folderPath),
				"name": name,
				"filter": filter,
				"uauth": ulist,
				"gauth": glist,
				"isguest": isGuest,
				"guestacl": guestAcl,
				"defaultowner": defaultOwner,
				"defaultacl": defaultAcl,
				"audit": audit,
				"oplocks": clientCache,
			};
			var dncallback = function (result) {
				removeWaitMask();
				$modal.find('.modal-header').LoadData('hide');
				if (result == undefined)
					return;
				if (result.code == 200) {
					var ispageedit = $('#cifsShareModal').data('ispageedit');
					DisplayTips(lang.file.edit_cifs_share_success);
					$img = $('.js-dir.pop-right-menu').find('img');
					$img.attr('src', 'css/image/folder_normal_share.png');
					if (ispageedit) {
						refresh();
					}
					updateTipShareInfo('CIFS');
				} else {
					DisplayTips(lang.file.edit_cifs_share_fail + '(' + result.result + ')');
				}
				$modal.modal('hide');
			}
			$modal.find('.modal-header').LoadData('show');
			addWaitMask();
			DataModel["createCifs"](parameter, dncallback, true, lang.file.edit_cifs_share);
		})
		//删除cifs共享
		.on('click', '#cifsShareModal .btn-danger', function (ev) {
			var path = $('#cifsShareModal #dirname').val();
			var folderPath = formatPath3(path) + ',1';
			var parameter = {
				"path": formatPath4(folderPath),
				"operator": "admin",
			};
			var dncallback = function (result) {
				$modal.find('.modal-header').LoadData('hide');
				if (result == undefined)
					return;
				if (result.code == 200) {
					DisplayTips(lang.file.del_cifs_share_success);
					$img = $('.js-dir.pop-right-menu').find('img');
					$img.attr('src', 'css/image/folder_normal.png');
				} else {
					DisplayTips(lang.file.del_cifs_share_fail + '(' + result.result + ')');
				}
				$('#cifsShareModal').modal('hide');
			}
			$modal.find('.modal-header').LoadData('show');
			DataModel["delCifs"](parameter, dncallback, true, lang.file.del_cifs_share);
		})
		//设置目录配额
		.on ( 'click', '#morePropertyModal .quota-sure', function (ev) {
			$modal = $('#morePropertyModal');
			var path = trim( $modal.find('#dirname').val() );
			var quotavalue = $('#setdir_quota input').val();
			var quotaunit = $('#unit1 option:selected').html();
			var filequotavalue = $('#quantity_quota input').val();
			var parameter = {
				"path":formatPath4(path),
				"quotavalue": quotavalue,
				"quotaunit": quotaunit
			}
			var dncallback = function (result) {
				removeWaitMask();
				if (result == undefined)
					return;
				if (result.code == 200) {
					DisplayTips(lang.file.set_quota_success);
				} else {
					DisplayTips(lang.file.set_quota_fail);
				}
			}
			var para = {
				"path":formatPath4(path),
				"quotavalue": filequotavalue,
			}
			var filecallback = function (result) {
				removeWaitMask();
				if (result == undefined)
					return;
				if (result.code == 200) {
					DisplayTips(lang.file.set_quota_success);
				} else {
					DisplayTips(lang.file.set_quota_fail);
				}
			}
			if(quotavalue != ''){
				if(!valifyNumber(quotavalue) || quotavalue >= 1024 || quotavalue < 1){
					DisplayTips(lang.file.quotavalue_range);
					return;
				}
				addWaitMask()
				DataModel["quotaSet"](parameter, dncallback, true, null);
			}
			if(filequotavalue != '') {
				if (!valifyNumber(filequotavalue) || filequotavalue < 1) {
					DisplayTips(lang.file.interval_over_one);
					return;
				}
				addWaitMask()
				DataModel["quotaFileSet"](para, filecallback, true, null);
			}
		})
		// 删除目录配额
		.on ( 'click', '#morePropertyModal .quota-del', function (ev) {
			$modal = $('#morePropertyModal');
			var path = trim( $modal.find('#dirname').val() );
			var parameter = {
				"path":formatPath4(path),
				"quotavalue": 0,
				"quotaunit": 'KB'
			}
			var dncallback = function (result) {
				removeWaitMask();
				if (result == undefined)
					return;
				if (result.code == 200) {
					$('#setdir_quota input').val('');
					DisplayTips(lang.file.del_quota_success);
				} else {
					DisplayTips(lang.file.del_quota_fail);
				}
			}
			var para = {
				"path":formatPath4(path),
				"quotavalue": 0,
			}
			var filecallback = function (result) {
				removeWaitMask();
				if (result == undefined)
					return;
				if (result.code == 200) {
					$('#quantity_quota input').val('');
					DisplayTips(lang.file.del_quota_success);
				} else {
					DisplayTips(lang.file.del_quota_fail);
				}
			}
			addWaitMask();
			DataModel["quotaSet"](parameter, dncallback, true, null);
			DataModel["quotaFileSet"](para, filecallback, true, null);
		})
		//修改所有者（属性框）
		.on('change', '#morePropertyModal #dir-owner', function (ev) {
			$modal = $('#morePropertyModal');
			var path = trim($modal.find('#dirname').val());
			path = formatPath3(path) + ',1';
			var owner = trim($modal.find("#dir-owner").val());
			var parameter = {
				"path": formatPath4(path),
				"owner": owner,
				"recursive": 0,
				"operator": "admin"
			}
			var dncallback = function (result) {
				if (result == undefined)
					return;
				if (result.code == 200) {
					var tipTitle = $('.pop-right-menu .tooltip-hide:first').attr('data-original-title');

          $('#dir-owner > option').each(function () {
            if ($(this).val() !== owner) {
              if ( tipTitle.indexOf($(this).text()) !== -1) {
                tipTitle = tipTitle.replace(new RegExp('(.*)'+$(this).text()), '$1'+(owner == 'root' ? 'admin' : owner));
              }
            }
          });

					$('.pop-right-menu .tooltip-hide:first').attr('data-original-title',tipTitle);
          $('.ellipsis > a').attr('data-original-title', tipTitle);
					DisplayTips(lang.file.set_dir_owner_success);
				} else {
					DisplayTips(lang.file.set_dir_owner_fail + '(' + result.result + ')');
				}
			}
			DataModel["setDirOwner"](parameter, dncallback, true, lang.file.set_dir_owner);
		})
		//选中应用到子目录显示确定按钮
		.on('click', '#morePropertyModal #dir-recursive', function (ev) {
			$('.dir-recursive-makesure').removeClass('hidden');
		})
		//应用到子目录
		.on('click', '#morePropertyModal .dir-recursive-sure', function (ev) {
			$modal = $('#morePropertyModal');
			var path = trim($modal.find('#dirname').val());
			path = formatPath3(path) + ',1';
			var owner = trim($modal.find("#dir-owner").val());
			var recursive = $('#dir-recursive').prop('checked') == true ? 1 : 0;
			var parameter = {
				"path": formatPath4(path),
				"owner": owner,
				"recursive": recursive,
				"operator": "admin"
			}
			var dncallback = function (result) {
				if (result == undefined)
					return;
				if (result.code == 200) {
					DisplayTips(lang.file.set_dir_owner_chidren_success);
				} else {
					DisplayTips(lang.file.set_dir_owner_chidren_fail + '(' + result.result + ')');
				}
			}
			if ($("input[type = 'checkbox']").eq(0).is(':checked')) {
				DataModel["setDirOwner"](parameter, dncallback, true, lang.file.set_dir_owner);
			}
		})
		//清除目录及子目录属性
		.on('click', '.js-clear-dir-property', function (ev) {
			$modal = $('#morePropertyModal');
			var path = trim($modal.find('#dirname').val());
			path = formatPath3(path) + ',1';
			var owner = trim($modal.find("#dir-owner").val());
			var parameter = {
				"path": formatPath4(path),
				"issub": 1,
				"operator": "admin"
			}
			var dncallback = function (result) {
				if (result == undefined)
					return;
				if (result.code == 200) {
					if ($('.js-clear-dir-property span').text() == lang.file.clear_sub_dir) {
						DisplayTips(lang.file.clear_sub_dir_success);
					} else {
						DisplayTips(lang.file.clear_sub_file_success);
					}
				} else {
					if ($('.js-clear-dir-property span').text() == lang.file.clear_sub_dir) {
						DisplayTips(lang.file.clear_sub_dir_fail + '(' + result.result + ')');
					} else {
						DisplayTips(lang.file.clear_sub_file_fail + '(' + result.result + ')');
					}
				}
				$modal.modal('hide');
			}
			DataModel["clear"](parameter, dncallback, true, lang.file.clear_sub_dir);
		})
		.on('click', '#morePropertyModal .btn-primary', function (ev) {
			$modal = $('#morePropertyModal');
			var initepath = trim($modal.find('#dirname').val());
			var path = formatPath3(initepath) + ',1';
			var cgauth = '';//当前用户组的权限
			var oauth = '';//其他用户组的权限

			//获取当前用户组的权限
			$ctr = $modal.find('.js-cur-group');
			$otr = $modal.find('.js-other-users');
			if ($ctr.find('.sub-pro-r').prop('checked') == true) {
				cgauth = 5;
			} else if ($ctr.find('.sub-pro-r-w').prop('checked') == true) {
				cgauth = 7;
			} else if ($ctr.find('.sub-pro-noauth').prop('checked') == true) {
				cgauth = 0;
			} else if ($ctr.find('.sub-pro-r').prop('checked') == false && $ctr.find('.sub-pro-r-w').prop('checked') == false && $ctr.find('.sub-pro-noauth').prop('checked') == false) {
				DisplayTips(lang.file.curgroup_select_onein_r_w_noauth);
				return false;
			}
			if ($ctr.find('.sub-dir-apply').prop('checked') == true) {
				cgauth += ',1';
			} else {
				cgauth += ',0';
			}
			//获取其他用户的权限
			if ($otr.find('.sub-pro-r').prop('checked') == true) {
				oauth = 5;
			} else if ($otr.find('.sub-pro-r-w').prop('checked') == true) {
				oauth = 7;
			} else if ($otr.find('.sub-pro-noauth').prop('checked') == true) {
				oauth = 0;
			} else if ($otr.find('.sub-pro-r').prop('checked') == false && $otr.find('.sub-pro-r-w').prop('checked') == false && $otr.find('.sub-pro-noauth').prop('checked') == false) {
				DisplayTips(lang.file.otherusers_select_onein_r_w_noauth);
				return false;
			}
			if ($otr.find('.sub-dir-apply').prop('checked') == true) {
				oauth += ',1';
			} else {
				oauth += ',0';
			}
			//获取当前被选的用户
			var ulist = '';
			var glist = '';
			$users = $('#morePropertyModal .js-user').find('input[type="checkbox"]:checked').closest('.js-user');
			if (getUserAuthPro($users, ulist) == 'dandelion') {
				return false;
			} else {
				ulist = getUserAuthPro($users, ulist);
			}
			$groups = $('#morePropertyModal .share-property-body').find('.js-group input[type="checkbox"]:checked').closest('.js-group');
			if (groupPermitPro($groups, glist) != 'dandelion') {
				glist = groupPermitPro($groups, glist);
			} else {
				return false;
			}
			var parameter = {
				"path": formatPath4(path),
				"gauths": glist,
				"cgauth": cgauth,
				"uauths": ulist,
				"oauth": oauth,
				"operator": "admin"
			}
			var dncallback = function (result) {
				removeWaitMask();
				$modal.find('.modal-header').LoadData('hide');
				if (result == undefined)
					return;
				if (result.code == 200) {
					DisplayTips(lang.file.set_dir_success);
				} else {
					DisplayTips(lang.file.set_dir_fail + '(' + result.result + ')');
				}
				$modal.modal('hide');
			}
			$modal.find('.modal-header').LoadData('show');
			addWaitMask();
			DataModel["setDir"](parameter, dncallback, true, lang.file.set_dir);
		})
		.on('click', '#morePropertyModal .btn-default', function (ev) {
			$(":radio").prop("checked", "checked").siblings().removeAttr("checked")
		})
		.on('change', '#option-type', function (ev) {
			var $this = $(this);
			var type = $this.val() || '';
			//$('.dir-type-makesure').removeClass('hidden');
			if ((type == 0) || (type == 3)) {
				$('#ensurecode-conf-container').addClass('hide');
				$('#option-copy-container').removeClass('hide').addClass('form-group');
				$('#option-span-container').addClass('hide');
			} else if (type == 1) {
				$('#ensurecode-conf-container').addClass('hide');
				$('#option-copy-container').removeClass('hide').removeClass('form-group');
				$('#option-span-container').removeClass('hide').addClass('form-group');
			} else if (type == 2) {
				$('#ensurecode-conf-container').removeClass('hide').addClass('form-group');
				$('#option-copy-container').addClass('hide');
				$('#option-span-container').addClass('hide');
			}
		})
		//获取目录
		.on('click', '.js-get-dirpath', function (ev) {
			ev.stopPropagation();
			var htm = '<div class="modal fade" id="showDirPathModal">' +
				'<div class="modal-dialog modal-lg">' +
				'<div class="modal-content">' +
				'<div class="modal-header">' +
				'<button type="button" class="btn btn-default" data-dismiss="modal">' + lang.button_cancel + '</button>' +
				'<button type="button" class="btn btn-primary">' + lang.button_ok + '</button>' +
				'<div style="float:right;width:400px;height:30px;line-height:30px;">' +
				'<span id="showPath" style="float:left;"><span class="glyphicon glyphicon-info-sign" style="margin-right:5px;"></span>' + lang.file.path + '</span>' +
				'<span>' +
				'<ul class="js-dirpath" style="list-style:none;height:30px;margin:0px;"> ' +
				'</ul>' +
				'</span>' +
				'</div>' +
				'<h4 class="modal-title" id="showDirPathModalLabel">' + lang.file.select_dirpath + '</h4>' +
				'</div>' +
				'<div class="modal-body flex-modal-body" style="height:420px;">' +
				'<div class="all_table_list_third" style="box-shadow: 0 0 0;height:100%;">' +
				'</div>' +
				'</div>' +
				'</div>' +
				'</div>' +
				'  </div>';
			$('#showDirPathModal').remove();
			$('body').append(htm);
			//在模态框显示之前，要把目录信息列举显示出来
			var htm, res, str;
			res = addDirMountPointInfinity(mountPointData, htm, str);
			htm = res.htm;
			str = res.str;

			$('#showDirPathModal .modal-body .all_table_list_third').html(htm);
			blankRightMenu();
			$('.js-dirpath .js-goto-path').remove();
			$('.js-dirpath .js-goto-path:first').addClass('disabled');

			var lihtm = '<li class="js-goto-path ellipsis disabled" data-path="' + str + '">' +
				'<a href="javascript:;"><span>/</span><span class="hidden" id="showEllipsis"> . . . /</span></a>' +
				'</li>';
			$('.js-dirpath').append(lihtm);
			$('#showDirPathModal').modal('show');
		})
		//点击确定，路径显示在 '浏览更多'旁边的input框里
		.on('click', '#showDirPathModal .btn-primary', function (ev) {
			ev.stopPropagation();
			$modal = $('#showDirPathModal');
			var path, curpath;
			$ul = $modal.find('ul.js-dirpath');
			$curli = $ul.find('li.js-goto-path:last');
			path = $curli.data('path');
			if (path === 'infinityfs1,1' || path === 'undefined' || path === undefined) {
				DisplayTips(lang.file.select_cursubdir_edit_share);
				return false;
			}
			curpath = formatPath2($curli);
			$('.modal-body a.js-get-dirpath').siblings('input#dirname').val('');
			$('.modal-body a.js-get-dirpath').siblings('input#dirname').val(curpath);
			$modal.modal('hide');
		})
		//添加过滤文件类型
		.on('keypress', '#cifsShareModal .js-filter-filetype', function (ev) {
			//获取当前已存在文件过滤类型
			var curfiletype = $('.text-area-filter-filetype').find('.js-file-type');
			var arrfiletype = [];
			for (var i = 0; i < curfiletype.length; i++) {
				var type = curfiletype.eq(i).attr("title");
				arrfiletype.push(type);
			}
			var keycode = ev.which;
			$this = $(this);
			if (keycode == 13) {
				var filetype = trim($this.val());
				var arr = filetype.split(',');
				var arr = uniqPureArr(arr);
				for (var m = 0; m < arr.length; m++) {
					if (arrfiletype.indexOf(arr[m]) >= 0) {
						DisplayTips(lang.file.file_type_exsited);
						return;
					}
				}
				var htm = '';
				for (var i = 0; i < arr.length; i++) {
					if (arr[i] != '') {
						htm += '<i title="' + arr[i] + '" class="checkable word-break js-file-type" style="max-width:300px;">' +
							'<span class="filetype">' + arr[i] + '</span>' +
							'<span class="checked glyphicon glyphicon-remove js-remove-filter" aria-hidden="true"></span>' +
							'</i>';
					}
				};
				$('#cifsShareModal .text-area-filter-filetype').append(htm);
			}
		})
		//添加过滤文件名的关键字
		.on('keypress', '#cifsShareModal .js-filter-keywords', function (ev) {
			//获取当前已存在关键字
			var curkeywords = $('.text-area-filter-keywords').find('.js-file-keyword');
			var arrkeywords = [];
			for (var i = 0; i < curkeywords.length; i++) {
				var keyword = curkeywords.eq(i).attr("title");
				arrkeywords.push(keyword);
			}
			var keycode = ev.which;
			$this = $(this);
			if (keycode == 13) {
				var keyword = trim($this.val());
				var arr = keyword.split(',');
				var arr = uniqPureArr(arr);
				for (var m = 0; m < arr.length; m++) {
					if (arrkeywords.indexOf(arr[m]) >= 0) {
						DisplayTips(lang.file.key_word_exsited);
						return;
					}
				}
				var htm = '';
				for (var i = 0; i < arr.length; i++) {
					htm += '<i title="' + arr[i] + '" class="checkable word-break js-file-keyword" style="max-width:300px;">' +
						'<span class="keyword">' + arr[i] + '</span>' +
						'<span class="checked glyphicon glyphicon-remove js-remove-filter" aria-hidden="true"></span>' +
						'</i>';
				};
				$('#cifsShareModal .text-area-filter-keywords').append(htm);
			}
		})
		//鼠标移上去关键字显示提示
		.on('mouseover', '#cifsShareModal .filter-filetype', function (ev) {
			$(this).find('span:last').css('display', 'block');
		})
		.on('mouseout', '#cifsShareModal .filter-filetype', function (ev) {
			$(this).find('span:last').css('display', 'none');
		})
		.on('mouseover', '#cifsShareModal .js-file-keyword,#cifsShareModal .js-file-type', function (ev) {
			$this = $(this);
			$this.find('.js-remove-filter').show();
		})
		.on('mouseout', '#cifsShareModal .js-file-keyword,#cifsShareModal .js-file-type', function (ev) {
			$this = $(this);
			$this.find('.js-remove-filter').hide();
		})
		.on('click', '#cifsShareModal .js-remove-filter', function (ev) {
			$this = $(this);
			$this.closest('.js-file-keyword').remove();
			$this.closest('.js-file-type').remove();
			$this.remove();
		})
		//cifs共享搜索用户
		.on('keyup', '#cifsShareModal input.js-search', function (ev) {
			$modal = $('#cifsShareModal');
			var keywords = trim($modal.find('input.js-search').val());
			onSearcCifsAfpShareUsers(keywords);
		})
		//afp共享搜索用户
		.on('keyup', '#afpShareModal input.js-search', function (ev) {
			$modal = $('#afpShareModal');
			var keywords = trim($modal.find('input.js-search').val());
			onSearcFtpHttpShareUsers(keywords);
		})
		//ftp共享搜索用户
		.on('keyup', '#ftpShareModal input.js-search', function (ev) {
			$modal = $('#ftpShareModal');
			var keywords = trim($modal.find('input.js-search').val());
			onSearcFtpHttpShareUsers(keywords);
		})
		//http共享搜索用户
		.on('keyup', '#httpShareModal input.js-search', function (ev) {
			$modal = $('#httpShareModal');
			var keywords = trim($modal.find('input.js-search').val());
			onSearcFtpHttpShareUsers(keywords);
		})
		//文件共享首页搜索目录
		.on('keyup', '.search-byfile #textSearchPath', function (ev) {
			clearTimeout(t);
			t = setTimeout(onSearchPathDir, 600);
		});

	function onSearchPathDir() {
		var keywords = trim($(".search-byfile #textSearchPath").val());
		if (typeof (keywords) === "undefined" || keywords === "") {

		}
		$ulpath = $('ul.js-dirpath');
		var searchpath = $ulpath.find(".js-goto-path.disabled:last").data("path");
		var ishome = false;
		if (searchpath === "undefined") {
			ishome = true;
			searchpath = formatPath3(mountPointData) + ',1';
		}
		var parameter = {
			'path': formatPath4(searchpath),
			'keyword': keywords,
		};
		var callback = function (result) {
			if (result == undefined)
				return;
			if (result.code == 200) {
				totalpage = Math.ceil( result.count/150 );
				var paginationHtml = renderPagination(totalpage, 1);
				$('#js-audit-pagination').html(paginationHtml);
				var data = result.result;
				var ismodal = false;
				if (result.count > 0) {
					showDirsList(result, ismodal);
					for (var j = 0; j < data.length; j++) {
						$('.dt_g_right_bar .all_table_list_third').find('.folder-ul li:eq(' + j + ')').data('path', data[j].path);
					}
					var $keymatch = $('.all-folder-page .folder-ul li');
					var len = $keymatch.length;
					//len大于0，说明此时有用户列表，可以进行匹配
					if (len > 0) {
						for (var i = 0; i < $keymatch.length; i++) {
							highlight(keywords, $keymatch[i]);//把匹配的结果高亮显示
						}
					}
				} else {
					$(".all_table_list_third").LoadData("hide");
					$el = $('.all-folder-page');
					if ($el.length > 0) {
						noRecord($el);
					}
					dirRightMenu();
					fileRightMeun();
					blankRightMenu();
				}
			}
		}
		var rootpath = formatPath3(mountPointData) + ',1';

		if (!ishome) {
			if (keywords == '' && searchpath == rootpath) {
				// loadDir(searchpath);
				var parameter = {
					'path': formatPath4(searchpath),
				};
				var callback = function (result) {
					$(".all_table_list_third").LoadData("hide");
					if (result == undefined)
						return;
					if (result.code == 200) {
						if (result.count > 0) {
							var ismodal = false;
							showDirsList(result, ismodal);
						} else {
							$el = $('.all-folder-page');
							noRecord($el);

							dirRightMenu();
							fileRightMeun();
							blankRightMenu();
						}
					} else {
						$el = $('.all-folder-page');
						noRecord($el);
					}
				}
				$(".all_table_list_third").LoadData("show");
				DataModel['listDirs'](parameter, callback, true, '');
			} else {
				$(".all_table_list_third").LoadData("show");
				DataModel['searchDir'](parameter, callback, true, "");
			}
		}

	}

	//搜索ftp、http用户
	function onSearcFtpHttpShareUsers(keywords) {
		$groups = $modal.find('tr.js-group');
		$groups.each(function (argument) {
			$this = $(this);
			if ($this.hasClass('hidden')) {
				$this.removeClass('hidden');
			}
			if ($this.siblings('tr.subusers').length > 0) {
				$this.siblings('tr.subusers').remove();
				$this.find('.js-plus-subusers').removeClass('hidden');
				$this.find('.js-minus-subusers').addClass('hidden');
			}
		});
		var trigGroups = [], //用来存放已经触发过click事件的组id
			istriggerarr = [],//用来判断组是否被click 存的是 arr[key] = true
			isfirst = 0;
		if (keywords == '') {
			//恢复之前的
			$groups.each(function (argument) {
				$this = $(this);
				$this.find('.js-plus-subusers').removeClass('hidden');
				$this.find('.js-minus-subusers').addClass('hidden');
				$this.removeClass('hidden');
				if ($this.siblings('tr.subusers').length > 0) {
					$this.siblings('tr.subusers').addClass('hidden');
				}
			});
		} else {
			for (var i = 0; i < ownLocalUsersData.length; i++) {
				(function (user) {
					var gid = user['groupid'];
					if (user['username'].indexOf(keywords) >= 0) {
						if ($("#index" + gid).length == 0) {
							isfirst++;
							trigGroups.push(gid);
							istriggerarr[gid] = true;
							$('#g' + gid).removeClass('hidden');
							$modal.find('#g' + gid).find('.js-plus-subusers').trigger('click', [false, true]);
						}
					} else {
						if (trigGroups.length > 0 && isfirst > 0) {
							for (var j = 0; j < trigGroups.length; j++) {
								var tgid = trigGroups[j];
								if (tgid != gid && !istriggerarr[gid]) {
									$('#g' + gid).addClass('hidden');
									if ($('#index' + gid).length > 0) {
										$('#index' + gid).remove();
										$('#g' + gid).find('.js-plus-subusers').removeClass('hidden');
										$('#g' + gid).find('.js-minus-subusers').addClass('hidden');
									}
								}
							};
						} else if (isfirst === 0) {
							$('#g' + gid).addClass('hidden');
							if ($('#index' + gid).length > 0) {
								$('#index' + gid).remove();
								$('#g' + gid).find('.js-plus-subusers').removeClass('hidden');
								$('#g' + gid).find('.js-minus-subusers').addClass('hidden');
							}
						}
					}
				})(ownLocalUsersData[i])
			};
		};
		$users = $modal.find('.share-users-body').find('.js-user');
		var $keymatch = $users.find('td:first');
		var len = $keymatch.length;
		//len大于0，说明此时有用户列表，可以进行匹配
		if (len > 0) {
			for (var i = 0; i < $keymatch.length; i++) {
				highlight(keywords, $keymatch[i]);//把匹配的结果高亮显示
			}
		}
		$users.each(function (argument) {
			$this = $(this);
			if ($this.find('.highlight').length === 0) {
				$this.addClass('hidden');
			} else {
				$this.removeClass('hidden');
			}
		})
	}

	//搜索afp共享用户
	function onSearcCifsAfpShareUsers(argument) {
		// body...
	}

	//获取被选的用户（只获取用户不考虑组）
	function getUserAuth($uinput, ulist) {
		var uname, value;
		for (var i = 0; i < $uinput.length; i++) {
			uname = $($uinput[i]).closest('.js-user').data('name');
			value = $($uinput[i]).attr('value');
			if (value == 'read') {
				value = 1;
			} else if (value == 'write') {
				value = 2;
			}
			ulist += uname + ',' + value + ',';
		};
		ulist = ulist.substring(0, ulist.length - 1);
		return ulist;
	}
	//属性框   获取被选的用户（只获取用户不考虑组）
	function getUserAuthPro($users, ulist) {
		var uname, value;
		//首先，被选中的input最多只有两个，最少一个
		var subdir = 0;
		for (var i = 0; i < $users.length; i++) {
			uname = $($users[i]).data('name');
			$uinput = $($users[i]).find('input[type="checkbox"]:checked');
			if ($uinput.length == 1 && $uinput.hasClass('sub-dir-apply')) {
				DisplayTips(lang.file.please + ' ' + uname + ' ' + lang.file.user_select_onein_r_w_noauth)
				return 'dandelion';
			}
			value = $($uinput[0]).attr('value');
			if ($uinput.length > 1) {
				subdir = $($uinput[1]).attr('value');
			}
			if (value == 'read') {
				value = 5;
			} else if (value == 'write') {
				value = 7;
			} else if (value == 'forbidden') {
				value = 0;
			}
			if ($uinput.length > 1 && subdir == 'forsubdir') {
				subdir = 1;
			} else {
				subdir = 0;
			}
			ulist += uname + ',' + value + ',' + subdir + ',';
		};
		ulist = ulist.substring(0, ulist.length - 1);
		return ulist;
	}
	// 属性框   获取用户组权限
	function groupPermitPro($groups, glist) {
		var gname, value;
		//首先，被选中的input最多只有两个，最少一个
		var subdir = 0;
		for (var i = 0; i < $groups.length; i++) {
			gname = $($groups[i]).find('.js-plus-pro-subusers').data('uname');
			$ginput = $($groups[i]).find('input[type="checkbox"]:checked');
			if ($ginput.length == 1 && $ginput.hasClass('sub-dir-apply')) {
				DisplayTips(lang.file.please + ' ' + gname + ' ' + lang.file.group_select_onein_r_w_noauth)
				return 'dandelion';
			}
			gid = $($groups[i]).find('.js-plus-pro-subusers').data('gid');
			value = $($ginput[0]).attr('value');
			if ($ginput.length > 1) {
				subdir = $($ginput[1]).attr('value');
			}
			if (value == 'read') {
				value = 5;
			} else if (value == 'write') {
				value = 7;
			} else if (value == 'forbidden') {
				value = 0;
			}
			if ($ginput.length > 1 && subdir == 'forsubdir') {
				subdir = 1;
			} else {
				subdir = 0;
			}
			glist += gid + ',' + value + ',' + subdir + ',';
		};
		glist = glist.substring(0, glist.length - 1);
		return glist;
	}
	//获取用户组权限
	function groupPermit($ginput, glist) {
		for (var i = 0; i < $ginput.length; i++) {
			//判断是域用户组还是普通用户组
			if ($($ginput[i]).closest('.js-group.domain').length == 1) {
				//则说明为域用户组
				uname = $($ginput[i]).closest('.js-group').find('.js-plus-subusers').data('uname');
				value = $($ginput[i]).attr('value');
				if (value == 'read') {
					value = 1;
				} else if (value == 'write') {
					value = 2;
				}
				glist += domainNameData + '\\' + uname + ',' + value + ',';
			} else {
				//普通用户组
				uname = $($ginput[i]).closest('.js-group').data('groupname');
				value = $($ginput[i]).attr('value');
				if (value == 'read') {
					value = 1;
				} else if (value == 'write') {
					value = 2;
				}
				glist += uname + ',' + value + ',';
			}
		};
		glist = glist.substring(0, glist.length - 1);
		return glist;
	}
	//获取用户权限
	function userPermit($uinput, ulist) {
		for (var i = 0; i < $uinput.length; i++) {
			$t = $($uinput[i]).closest('.subusers');
			$tp = $t.prev('.js-group');
			//判断如果当前组没有被选中
			if ($t.data('id') == $tp.data('id') && $tp.find('input[type="checkbox"]:checked').length == 0) {
				$ut = $t.find('input[type="checkbox"]:checked');
				var uname = $($uinput[i]).closest('.js-user').data('name');
				value = $($uinput[i]).attr('value');
				if (value == 'read') {
					value = 1;
				} else if (value == 'write') {
					value = 2;
				}
				ulist += uname + ',' + value + ',';
			}
		}
		ulist = ulist.substring(0, ulist.length - 1);
		return ulist;
	}
	//新建目录
	function addNewDir(context, e) {
		$modal = $('#addNewFolderModal');
		$modal.find('#newdirname').val('');
		$modal.modal('show');
		setTimeout(function () {
			$("#newdirname").focus();
		}, 500);
	}
	function moreDirPropertyFile(context, e) {
		//路径、类型、所有者、权限等的信息要展现出来
		$modal = $('#morePropertyModal');
		var path = '';
		$dir = $('.js-dir.pop-right-menu');
		$file = $('.js-file.pop-right-menu');
		if ($dir.length > 0) {
			//文件夹的时候
			path = formatPath2(context);
			$modal.find('#dirname').val(path);
			$modal.find('#dir-style').val(lang.file.folder);
		} else if ($file.length > 0) {
			//文件的时候
			path = formatPath2(context);
			$modal.find('#dirname').val(path);
			$modal.find('#dir-style').val(lang.file.file);
		} else if ($dir.length == 0 && $file.length == 0) {
			//点击空白处的时候
			$context1 = $('.navbar-left .js-dirpath .js-goto-path.disabled:last');
			path = formatPath2($context1);
			$modal.find('#dirname').val(path);
			$modal.find('#dir-style').val(lang.file.folder);
		}
		var htm = '';//存储组信息
		htm = propertyGroupHtml();
		$('.group-property-body .share-property-body').html(htm);

		//文件的时候去掉子目录属性
		if ($file.length > 0) {
			$('.js-clear-dir-property').attr('data-original-title', lang.file.clear_sub_file);
			$('.js-clear-dir-property span').text(lang.file.clear_sub_file);
			$('#dir-recursive').addClass('hidden');
			$('#dir-recursive').next().addClass('hidden');
			$('.group-property-body .table-condensed th:last').addClass('hidden');
			for (var i = 0; i < $('.group-property-body .table-condensed tr').length - 1; i++) {
				$('.group-property-body .table-condensed:last tr:eq(' + i + ')').find('td:last').addClass('hidden');
			}
		} else {
			$('.js-clear-dir-property').attr('data-original-title', lang.file.clear_sub_dir);
			$('.js-clear-dir-property span').text(lang.file.clear_sub_dir);
			$('#dir-recursive').removeClass('hidden');
			$('#dir-recursive').next().removeClass('hidden');
			$('.group-property-body .table-condensed th:last').removeClass('hidden');
		}

		var ownerhtm = '';//存储所有者
		ownerhtm += '<option type="local" value="root" selected>admin</option>';
		for (var i = 0; i < ownLocalUsersData.length; i++) {
			ownerhtm += '<option type="local" value="' + ownLocalUsersData[i].username + '">' + ownLocalUsersData[i].username + '</option>';
		}
		//因为域用户列举权限取出来的域用户名最前面有一个反斜杠
		for (var i = 0; i < ownDomainUsersData.length; i++) {
			ownerhtm += '<option type="AD" value="' + domainNameData + '\\' + ownDomainUsersData[i].uname + '">' + ownDomainUsersData[i].uname + '</option>';
		}
		$modal.find('#dir-owner').html(ownerhtm);

		//获取权限
		var folderpath = formatPath3(path) + ',1';
		var parameter = {
			'path': formatPath4(folderpath),
		};
		var aclcallback = function (result) {
			$modal.find('.modal-header').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				data = result.result;
				gauthData = data.gauth; //组的权限
				uauthData = data.uauth; //用户的权限
				//获取所有者
				var owner = data.owner;
				if (owner == '') {
					owner = 'root';
				}
				$modal.find('select#dir-owner').val(owner);
				//权限
				//当前组
				$curgroup = $modal.find('tr.js-cur-group');
				if (getACLType(data.cgauth.auth) == 'write') {
					//读写
					$curgroup.find('.sub-pro-r-w').prop('checked', true);
					$curgroup.find('.sub-pro-r').prop('checked', false);
					$curgroup.find('.sub-pro-noauth').prop('checked', false);
				} else if (getACLType(data.cgauth.auth) == 'read') {
					//只读
					$curgroup.find('.sub-pro-r-w').prop('checked', false);
					$curgroup.find('.sub-pro-r').prop('checked', true);
					$curgroup.find('.sub-pro-noauth').prop('checked', false);
				} else if (getACLType(data.cgauth.auth) == 'forbidden') {
					//禁止访问
					$curgroup.find('.sub-pro-r-w').prop('checked', false);
					$curgroup.find('.sub-pro-r').prop('checked', false);
					$curgroup.find('.sub-pro-noauth').prop('checked', true);
				}
				if (data.cgauth.issub != 0) {
					//应用到子目录
					$curgroup.find('.forsubdir').prop('checked', true);
				} else {
					//不应用到子目录
					$curgroup.find('.forsubdir').prop('checked', false);
				}

				//其他用户组
				$othgroup = $modal.find('tr.js-other-users');
				if (getACLType(data.oauth.auth) == 'write') {
					$othgroup.find('.sub-pro-r-w').prop('checked', true);
					$othgroup.find('.sub-pro-r').prop('checked', false);
					$othgroup.find('.sub-pro-noauth').prop('checked', false);
				} else if (getACLType(data.oauth.auth) == 'read') {
					$othgroup.find('.sub-pro-r-w').prop('checked', false);
					$othgroup.find('.sub-pro-r').prop('checked', true);
					$othgroup.find('.sub-pro-noauth').prop('checked', false);
				} else if (getACLType(data.oauth.auth) == 'forbidden') {
					$othgroup.find('.sub-pro-r-w').prop('checked', false);
					$othgroup.find('.sub-pro-r').prop('checked', false);
					$othgroup.find('.sub-pro-noauth').prop('checked', true);
				}
				if (data.oauth.issub != 0) {
					$othgroup.find('.forsubdir').prop('checked', true);
				} else {
					$othgroup.find('.forsubdir').prop('checked', false);
				}

				//先清除一下，这里只展示组，去除和组下的用户
				$grouprows = $modal.find('tr.js-group');
				for (var i = 0; i < $grouprows.length; i++) {
					(function ($tr) {
						var id = $tr.data('id');
						if ($('#index' + id).length > 0) {
							$tr.find('.js-minus-pro-subusers').addClass('hidden');
							$tr.find('.js-plus-pro-subusers').removeClass('hidden');
							$('#index' + id).remove();
						}
					})($($grouprows[i]))
				};
				//用户组
				for (var j = 0; j < $grouprows.length; ++j) {
					var tds = $($grouprows[j]).children("td");
					var gId = tds.closest("tr.js-group").data("id");
					for (var k = 0; k < gauthData.length; ++k) {
						if (gId == gauthData[k]["group"]) {
							if (getACLType(gauthData[k]["auth"]) == "write") {
								$(tds[1]).find("input.sub-pro-r").prop("checked", false);
								$(tds[2]).find("input.sub-pro-r-w").prop("checked", true);
								$(tds[2]).find("input.sub-pro-noauth").prop("checked", false);
							} else if (getACLType(gauthData[k]["auth"]) == "read") {
								$(tds[1]).find("input.sub-pro-r").prop("checked", true);
								$(tds[2]).find("input.sub-pro-r-w").prop("checked", false);
								$(tds[2]).find("input.sub-pro-noauth").prop("checked", false);
							} else if (getACLType(gauthData[k]["auth"]) == "forbidden") {
								$(tds[1]).find("input.sub-pro-r").prop("checked", false);
								$(tds[2]).find("input.sub-pro-r-w").prop("checked", false);
								$(tds[2]).find("input.sub-pro-noauth").prop("checked", true);
							}

							if (gauthData[k]["issub"] != "0") {
								$(tds[4]).find("input.sub-dir-apply").prop("checked", true);
							} else {
								$(tds[4]).find("input.sub-dir-apply").prop("checked", false);
							};

							break;
						}
					}
				}
				//用户
				for (var k = 0; k < $grouprows.length; k++) {
					$row = $($grouprows[k]);
					var gid = $row.data('id');
					for (var m = 0; m < uauthData.length; m++) {
						(function (user) {
							if (user['gid'].indexOf(gid) >= 0) {
								if ($("#index" + gid).length == 0) {
									var islist = true;
									$modal.find('#g' + gid).find('.js-plus-pro-subusers').trigger('click', islist);
								}
							}
						})(uauthData[m])
					};
				};
			} else {
				DisplayTips(lang.file.list_acl_fail);
			}
		}
		$modal.find('.modal-header').LoadData('show');
		DataModel['listDirAcl'](parameter, aclcallback, true, lang.file.list_acl);

		//获取目录配额
		var quotaParam={
			'dirpath':formatPath4(path),
		};
		var quotaCallback=function(result){
			var data=result.result;
			if(result.code==200) {
					var size = unitConver(data.quota_value);
					var str1 = size.substring(0,size.length-2);
					var str2 = size.substring(size.length-2,size.length-1);
				    if(str2 == 0){
					str2 = 'K'
				    }
					$('#setdir_quota input').val(str1);
					$('#unit1').val(str2);
			}else{
				DisplayTips(lang.file.get_quota_fail + '(' + result.result.error_str + ')');
			}
		}
		var quotafileParam={
			'dirpath':formatPath4(path),
		};
		var quotafileCallback=function(result){
			var data=result.result;
			if(result.code==200) {
				if(data.quota_value != 0) {
					$('#quantity_quota input').val(data.quota_value);
				}else{
					$('#quantity_quota input').val('');
				}
			}else{
				DisplayTips(lang.file.get_quota_fail + '(' + result.result.error_str + ')');
			}
		}
		if($('.pop-right-menu').attr('class')=='js-dir pop-right-menu'){
			$('#quota').css('display','block');
			DataModel['quotaGet'](quotaParam, quotaCallback, true, null);
			DataModel['quotaFileGet'](quotafileParam, quotafileCallback, true, null);
		}else if($('.pop-right-menu').attr('class')=='js-file pop-right-menu'){
			$('#quota').css('display','none');
		}
		$modal.modal('show');
	}

	//列举属性框里面的用户组
	function propertyGroupHtml(argument) {
		var htm = '';
		htm += '<tr class="js-cur-group">' +
			'<td class="left" style="width:30%;">' + lang.file.cur_user_group + '</td>' +
			'<td style="width:15%;"><input type="checkbox" name="other" value="read" class="sub-pro-r"/></td>' +
			'<td style="width:15%;"><input type="checkbox" name="other" value="write" class="sub-pro-r-w"/></td>' +
			'<td style="width:15%;"><input type="checkbox" name="other" value="forbidden" class="sub-pro-noauth"/></td>' +
			'<td style="width:25%;"><input type="checkbox" class="forsubdir other" value="subfile"/></td>' +
			'</tr>' +
			'<tr class="js-other-users">' +
			'<td class="left" style="width:30%;">' + lang.file.other_user + '</td>' +
			'<td style="width:15%;"><input type="checkbox" name="other" value="read" class="sub-pro-r"/></td>' +
			'<td style="width:15%;"><input type="checkbox" name="other" value="write" class="sub-pro-r-w"/></td>' +
			'<td style="width:15%;"><input type="checkbox" name="other" value="forbidden" class="sub-pro-noauth"/></td>' +
			'<td style="width:25%;"><input type="checkbox" class="forsubdir other" value="subfile"/></td>' +
			'</tr>';

		//列举出本地用户组和域用户组
		var data1 = ownLocalGroupData;
		for (var i = 0; i < data1.length; i++) {
			if (data1[i].groupname != 'system') {
				htm += '<tr class="js-group" id="g' + data1[i].groupid + '" data-id="' + data1[i].groupid + '" data-groupname="' + data1[i].groupname + '">' +
					'<td class="left" style="width:30%;">' +
					'<a href="javascript:;" class="js-plus-pro-subusers" data-gid="' + data1[i].groupid + '" data-uname="' + data1[i].groupname + '">' +
					'<span class="glyphicon glyphicon-plus-sign"></span>' +
					'</a>' +
					'<a href="javascript:;" class="js-minus-pro-subusers hidden" data-gid="' + data1[i].groupid + '">' +
					'<span class="glyphicon glyphicon-minus-sign"></span>' +
					'</a>' +
					'<span>' + data1[i].groupname + '</span>' +
					'</td>' +
					'<td style="width:15%;"><input type="checkbox" value="read" class="sub-pro-r" /></td>' +
					'<td style="width:15%;"><input type="checkbox" value="write" class="sub-pro-r-w"/></td>' +
					'<td style="width:15%;"><input type="checkbox" value="forbidden" class="sub-pro-noauth"/></td>' +
					'<td style="width:25%;"><input type="checkbox" value="forsubdir" class="sub-dir-apply"/></td>' +
					'</tr>';
			}
		}
		//列举域用户组
		var data2 = ownDomainGroupData;
		for (var i = 0; i < data2.length; i++) {
			htm += '<tr class="js-group domain" id="g' + data2[i].gid + '" data-id="' + data2[i].gid + '">' +
				'<td class="left" style="width:30%;">' +
				'<a href="javascript:;" class="js-plus-pro-subusers" data-gid="' + data2[i].gid + '" data-uname="' + data2[i].gname + '">' +
				'<span class="glyphicon glyphicon-plus-sign"></span>' +
				'</a>' +
				'<a href="javascript:;" class="js-minus-pro-subusers hidden" data-gid="' + data2[i].gid + '">' +
				'<span class="glyphicon glyphicon-minus-sign"></span>' +
				'</a>' +
				'<span>' + data2[i].gname + '</span>' +
				'</td>' +
				'<td style="width:15%;"><input type="checkbox" value="read" class="sub-pro-r"/></td>' +
				'<td style="width:15%;"><input type="checkbox" value="write" class="sub-pro-r-w"/></td>' +
				'<td style="width:15%;"><input type="checkbox" value="forbidden" class="sub-pro-noauth"/></td>' +
				'<td style="width:25%;"><input type="checkbox" value="forsubdir" class="sub-dir-apply"/></td>' +
				'</tr>';
		}
		//列举LDAP用户组
		var data3 = ownLdapGroupData;
		for (var i = 0; i < data3.length; i++) {
			htm += '<tr class="js-group ldapDomain" id="g' + data3[i].gid + '" data-id="' + data3[i].gid + '">' +
				'<td class="left" style="width:30%;">' +
				'<a href="javascript:;" class="js-plus-pro-subusers" data-gid="' + data3[i].gid + '" data-uname="' + data3[i].gname + '">' +
				'<span class="glyphicon glyphicon-plus-sign"></span>' +
				'</a>' +
				'<a href="javascript:;" class="js-minus-pro-subusers hidden" data-gid="' + data3[i].gid + '">' +
				'<span class="glyphicon glyphicon-minus-sign"></span>' +
				'</a>' +
				'<span>' + data3[i].gname + '</span>' +
				'</td>' +
				'<td style="width:15%;"><input type="checkbox" value="read" class="sub-pro-r"/></td>' +
				'<td style="width:15%;"><input type="checkbox" value="write" class="sub-pro-r-w"/></td>' +
				'<td style="width:15%;"><input type="checkbox" value="forbidden" class="sub-pro-noauth"/></td>' +
				'<td style="width:25%;"><input type="checkbox" value="forsubdir" class="sub-dir-apply"/></td>' +
				'</tr>';
		}
		return htm;
	}

	function refrshCurDir(context, e) {
		$li = $('.js-dirpath .js-goto-path.disabled:last');
		var path = '';
		path = $li.data('path');
		var parameter = {
			'path': formatPath4(path),
			'page': 1,
			'perpage': -1
		};
		var callback = function (result) {
			$(".all_table_list_third").LoadData("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips(lang.file.refresh_success);
				showDirsList(result);
			} else {
				$el = $('.all-folder-page');
				noRecord($el);
			}
		}
		$(".all_table_list_third").LoadData("show");

		DataModel['listDirs'](parameter, callback, true, '');
	}
	function delFile(context, e) {
		$li = context;
		var path = $li.data('path');
		var name = $li.data('name');

		$('#delFileModel .modal-body p').html(lang.file.sureto_del_the_file + ' ' + '<span style="color:red;">' + name + '</span>' + '?');
		$('#delFileModel').modal('show');
		$('#delFileModel').data('path', path);
		$('#delFileModel').modal('show');
	}
	//path 路径
	//
	function cifsShare(context, e, path, ispageedit) {
		$modal = $('#cifsShareModal');
		$modal.find('#dirname').val(path);

		var issupportdomain = true,
			isgroup = false,
			isrw = true,
			isr = true;
		if (editcifsLoadedUg == 'no') {
			editcifsLoadedUg = 'yes';
			listAllgroups('cifsShareModal', issupportdomain, isgroup, isrw, isr);
		}
		//这个时候页面上已经有用户了，现在需要列举出当前共享的信息，用来填充编辑框
		var formatpath = formatPath3(path) + ',1';

		var parameter = {
			'path': formatPath4(formatpath),
		};
		if (path != ',1' && path != '') {
			//除了点击“+”创建的时候，会出现“浏览”，其余情况都不会出现
			$modal.find('.js-get-dirpath').addClass('hidden');
			$modal.find('#dirname').addClass('disabled');
			var callback = function (result) {
				if (result == undefined)
					return;
				if (result.code == 200) {
					var data = result.result;
					var defaultacl,
						defaultowner,
						filter,
						gauth,
						guest,
						guestauth,
						name,
						uauth,
						audit,
						clientCache;
					defaultacl = data['defaultacl'];
					defaultowner = data['defaultowner'];
					filter = data['filter'];
					glist = data['gauth'];
					guest = data['guest'];
					guestauth = data['guestauth'];
					name = data['name'];
					ulist = data['uauth'];
					if(name == ''){
						audit = data['audit']+1;
					}else{
					audit = data['audit'];
					}
					clientCache = data['oplocks'];
					window.cifsuser = ulist;
					//共享名显示出来
					$modal.find('#share_name').val(name);
					//登录方式
					//$modal.find('#guestuser checked').removeAttr("checked");
					var boxState = false;
					if (guest == 1) {
						boxState = true;
					}
					$modal.find('#guestuser').attr("checked", boxState);

					//所有者
					$modal.find('#default-owner option:selected').removeAttr("selected");
					$modal.find('#default-owner option[value="' + defaultowner + '"]').attr("selected", "selected");
					//文件权限
					$modal.find('#default-acl option:selected').removeAttr("selected");
					$modal.find('#default-acl option[value="' + defaultacl + '"]').attr("selected", "selected");
					//审计权限
					$modal.find('#cifs-audit').val(audit);
					//客户端缓存
					$modal.find('#cifs-client-cache').val(clientCache);
					//如果为匿名登录

					if (guest == 1) {
						//是匿名登录
						$('.js-guestacl').removeClass('hidden');
						$('#cifs-usergroup-list').hide();
						$modal.find('#guestuser option:eq(1)').prop('selected',true);
						$('#cifs-left-setting').removeClass('col-lg-5 col-md-5').addClass('col-lg-12 col-md-12');
						$modal.find('.modal-dialog').css('width', '400px');
						$modal.find('#guestacl option[value="' + guestauth + '"]').attr("selected", "selected");
					} else {
						$('#cifs-usergroup-list').show();
						$('#cifs-left-setting').addClass('col-lg-5 col-md-5').removeClass('col-lg-12 col-md-12');
						$modal.find('.modal-dialog').css('width', '900px');
						$modal.find('.js-guestacl').addClass('hidden');
					}
					var filtertype = '';
					var filterkeywords = '';
					var typehtm = '';
					var keyhtm = '';
					//过滤文件类型
					//过滤关键字
					if (filter.length > 0) {
						for (var i = 0; i < filter.length; i++) {
							var key = filter[i]['key'];
							//获取key的第一个字符和最后一个字符
							var fkeystr = key.substring(0, 1);
							var lkeystr = key.substring(key.length - 1, key.length);
							if (fkeystr == '*' && lkeystr == '*') {
								//说明首尾字符均为*，则是关键字
								key = key.substring(1, key.length - 1);
								keyhtm += '<i title="' + key + '" class="checkable word-break js-file-keyword" style="max-width:300px;">' +
									'<span class="filetype">' + key + '</span>' +
									'<span class="checked glyphicon glyphicon-remove js-remove-filter" aria-hidden="true"></span>' +
									'</i>';
							} else if (fkeystr == '*' && lkeystr != '*') {
								//过滤类型
								key = key.substring(2, key.length);
								typehtm += '<i title="' + key + '" class="checkable word-break js-file-type" style="max-width:300px;">' +
									'<span class="filetype">' + key + '</span>' +
									'<span class="checked glyphicon glyphicon-remove js-remove-filter" aria-hidden="true"></span>' +
									'</i>';
							}

						};
					}
					$modal.find('.text-area-filter-filetype').html(typehtm);
					$modal.find('.text-area-filter-keywords').html(keyhtm);

					$modal.find(".modal-body table input:checkbox").each(function () {
						$(this).attr("checked", false);
					});
					$grouprows = $modal.find('tr.js-group');
					//先清除一下，这里只展示组，去除和组下的用户
					for (var i = 0; i < $grouprows.length; i++) {
						(function ($tr) {
							var id = $tr.data('id');
							if ($('#index' + id).length > 0) {
								$tr.find('.js-minus-subusers').addClass('hidden');
								$tr.find('.js-plus-subusers').removeClass('hidden');
								$('#index' + id).remove();
							}
						})($($grouprows[i]))
					};

					//用户组
					for (var j = 0; j < $grouprows.length; ++j) {
						$group = $($grouprows[i]);
						var groid = $group.data('id');
						var tds = $($grouprows[j]).children("td");
						var gName = tds.closest("tr.js-group").data("groupname");
						for (var k = 0; k < glist.length; ++k) {
							if (gName == glist[k]["group"]) {
								if (getShareType(glist[k]["auth"]) == "read") {
									$(tds[1]).find("input.sub-r").prop("checked", true);
									$(tds[2]).find("input.sub-r-w").prop("checked", false);
								}
								else if (getShareType(glist[k]["auth"]) == "write") {
									$(tds[1]).find("input.sub-r").prop("checked", false);
									$(tds[2]).find("input.sub-r-w").prop("checked", true);
								}
								else {

								}

								break;
							}
						}
					}

					//用户
					for (var k = 0; k < $grouprows.length; k++) {
						$row = $($grouprows[k]);
						var gid = $row.data('id');
						for (var m = 0; m < ulist.length; m++) {
							(function (user) {
								if (user['gid'].indexOf(gid) >= 0) {
									if ($("#index" + gid).length == 0) {
										var islist = true;
										$modal.find('#g' + gid).find('.js-plus-subusers').trigger('click', islist);
									}
									//      			else if ( $("#index" + gid).length > 0 ) {
									//      				//则说明当前已经有了，不需要再去触发click事件
									//      				if ( $('#g'+gid).hasClass('domain') ) {
									// 	//域用户
									// 	var isdchecked = false;
									// 	var isdauth;
									// 	$users = $('#index'+gid).find('table').find('.js-user');
									// 	$users.each( function () {
									// 		var udname = $this.data('name');
									// 		for (var n = 0; n < ulist.length; n++) {
									// 			if (ulist[n]['user'] === udname) {
									// 				isdchecked = true;
									// 				isdauth = ulist[n]['auth'];

									// 				if ( isdchecked ) {
									// 		        	if ( isdauth == 1 ) {
									// 		        		$tr.find('.sub-r').prop('checked', true);
									// 		        		$tr.find('.sub-r-w').prop('checked', false);
									// 		        	} else if ( isdauth == 2 ) {
									// 		        		$tr.find('.sub-r').prop('checked', false);
									// 		        		$tr.find('.sub-r-w').prop('checked', true);
									// 		        	} else {
									// 		        		$tr.find('.sub-r').prop('checked', false);
									// 		        		$tr.find('.sub-r-w').prop('checked', false);
									// 		        	}
									// 		        }
									// 			}
									// 		};
									// 	} )
									// } else {
									// 	//本地用户
									// 	var isdchecked = false;
									// 	var isdauth;
									// 	$users = $('#index'+gid).find('table').find('.js-user');
									// 	$users.each( function () {
									// 		var udname = $this.data('name');
									// 		for (var n = 0; n < ulist.length; n++) {
									// 			if (ulist[n]['user'] === udname) {
									// 				isdchecked = true;
									// 				isdauth = ulist[n]['auth'];
									// 			}
									// 		};
									//         if ( isdchecked ) {
									//         	if ( isdauth == 1 ) {
									//         		$tr.find('.sub-r').prop('checked', true);
									//         		$tr.find('.sub-r-w').prop('checked', false);
									//         	} else if ( isdauth == 2 ) {
									//         		$tr.find('.sub-r').prop('checked', false);
									//         		$tr.find('.sub-r-w').prop('checked', true);
									//         	} else {
									//         		$tr.find('.sub-r').prop('checked', false);
									//         		$tr.find('.sub-r-w').prop('checked', false);
									//         	}
									//         }
									//     })
									// }
									//      			}
								}
							})(ulist[m])
						};
					};
				}
			}
			DataModel['listCifs'](parameter, callback, true, "");
		} else {
			//“创建共享”的时候，去除隐藏的“浏览”
			//除了点击“+”创建的时候，会出现“浏览”，其余情况都不会出现
			$modal.find('.js-get-dirpath').removeClass('hidden');
			$modal.find('input#dirname').removeClass('disabled');

			//清空CIFS共享模态框中的内容
			//共享名
			$modal.find('#share_name').val('');
			//登录方式
			$modal.find('#guestuser option:selected').removeAttr("selected");
			//$modal.find('#guestuser checked').removeAttr("checked");
			$('#cifs-usergroup-list').show();
			$('#cifs-left-setting').addClass('col-lg-5 col-md-5').removeClass('col-lg-12 col-md-12');
			$modal.find('.modal-dialog').css('width', '900px');
			$modal.find('.js-guestacl').addClass('hidden');
			//所有者
			$modal.find('#default-owner option:selected').removeAttr("selected");
			//文件权限
			$modal.find('#default-acl option:selected').removeAttr("selected");
			$modal.find('.text-area-filter-filetype').html('');
			$modal.find('.text-area-filter-keywords').html('');
			//审计权限
			$modal.find('#cifs-audit').val('1');

			$modal.find(".modal-body table input:checkbox").each(function () {
				$(this).attr("checked", false);
			});
			//没有展开的用户组
			$groups = $modal.find('tr.js-group');
			$groups.each(function (argument) {
				$tr = $(this);
				$tr.find('.js-minus-subusers').addClass('hidden');
				$tr.find('.js-plus-subusers').removeClass('hidden');
				if ($tr.next('.subusers').length > 0) {
					$tr.next('.subusers').removeClass('hidden').addClass('hidden');
				}
			})
		}

		$modal.modal('show');
		$modal.data('ispageedit', ispageedit);
	}

	function getShareType(num) {
		if (0 == num)
			return "forbidden";
		else if (1 == num)
			return "read";
		else if (2 == num)
			return "write";
		else
			return "forbidden";
	}

	function getShareType1(num) {
		if (0 == num)
			return lang.file.noauth;
		else if (1 == num)
			return lang.file.only_read;
		else if (2 == num)
			return lang.file.read_and_write;
		else
			return lang.file.noauth;
	}

	function ftpShare(context, e, path, ispageedit) {
		$modal = $('#ftpShareModal');
		if (context != null) {
			var path = formatPath2(context);
			$('#ftpShareModal #dirname').val(path);
		}
		var issupportdomain = false;
		var isgroup = false;
		var isrw = true;
		var isr = true;

		if (editftpLoadedUg == 'no') {
			editftpLoadedUg = 'yes';
			listAllgroups('ftpShareModal', issupportdomain, isgroup, isrw, isr);
		}

		listEditedFtp(path);

		$modal.modal('show');
		$modal.data('ispageedit', ispageedit);
		//$(".js-plus-subusers").trigger("click");
		//$('tbody').find('.subusers').addClass('hidden');
		//$('.js-minus-subusers span').addClass('glyphicon-plus-sign').removeClass('glyphicon-minus-sign');
		if ($modal.find('h4').text().indexOf('FTP') >= 0) {
			$modal.find('.sub-r').css('display', 'none');
			$modal.find('.subusers .sub-r').css('display', 'none');
		}
		if ($('.v-menu').find('.active').text().indexOf('FTP') >= 0) {
			$(".js-plus-subusers").trigger("click");
		}
	}
	//列举当前指定的ftp共享相关信息
	function listEditedFtp(path) {
		//这个时候页面上已经有用户了，现在需要列举出当前共享的信息，用来填充编辑框
		var formatpath = formatPath3(path) + ',1';
		var parameter = {
			'path': formatPath4(formatpath),
		};
		if (path != ',1' && path != '') {
			//除了点击“+”创建的时候，会出现“浏览”，其余情况都不会出现
			$modal.find('.js-get-dirpath').addClass('hidden');
			$modal.find('input#dirname').addClass('disabled');
			var callback = function (result) {
				if (result == undefined)
					return;
				if (result.code == 200) {
					var data = result.result;
					getSuccessftp(data, $modal);
					var $uinput = $('.js-user').find('input[type="checkbox"]:checked');
					if ($uinput.length < 1) {
						$('.js-plus-subusers').trigger('click');
					}
				};

			}
			DataModel['listFtp'](parameter, callback, true, "");
		} else {
			//除了点击“+”创建的时候，会出现“浏览”，其余情况都不会出现
			$modal.find('.js-get-dirpath').removeClass('hidden');
			$modal.find('input#dirname').removeClass('disabled');
			//清空Ftp模态框的内容
			$modal = $('#ftpShareModal');
			$modal.find('#dirname').val('');
			$modal.find(".modal-body .js-table-all input:checkbox").each(function () {
				$(this).prop("checked", false);
			});
		}
	}

	//列举当前特定的ftp共享成功之后的操作
	function getSuccessftp(data, $modal) {
		$userrows = $modal.find('.share-users-body').find('.js-user');
		$modal.find(".modal-body .js-table-all input:checkbox").each(function () {
			$(this).prop("checked", false);
		});

		for (var i = 0; i < data.length; i++) {
			for (var j = 0; j < $userrows.length; j++) {
				$userrow = $($userrows[j]);
				var uname = $userrow.data('name');
				if (data[i]["user"] == uname) {
					if (data[i]["auth"] == 2) {
						$userrow.find("input.sub-r-w").prop("checked", true);
					}
				}
			};
		};
	}
	function nfsShare(context, e, path, ispageedit) {
		$modal = $('#nfsShareModal');
		if (context != null) {
			var path = formatPath2(context);
			$('#nfsShareModal #dirname').val(path);
		}
		listEditedNfs(path);
		$modal.modal('show');
		$modal.data('ispageedit', ispageedit);
	}

	//列举当前已经编辑过的nfs共享
	function listEditedNfs(path) {
		var formatpath = formatPath3(path) + ',1';
		var parameter = {
			'path': formatPath4(formatpath),
		};
		if (path != ',1' && path != '') {
			//除了点击“+”创建的时候，会出现“浏览”，其余情况都不会出现
			$modal.find('.js-get-dirpath').addClass('hidden');
			$modal.find('input#dirname').addClass('disabled');
			var callback = function (result) {
				if (result == undefined)
					return;
				if (result.code == 200) {
					var data = result.result;
					var htm = "";
					$('#nfsShareModal .text-area-style').html(htm);
					for (var i = 0; i < data.length; i++) {
						htm += '<div class="js-machine" data-ip="' + data[i]['ipaddr'] + '" data-v="' + data[i]['auth'] + '">' +
							'<span>' + data[i]['ipaddr'] + '</span>' +
							'<span>' + getShareType1(data[i]["auth"]) + '</span>' +
							'<a class="fl-rt" id="js-trash-ip">' +
							'<span class="glyphicon glyphicon-trash style="color:red""></span>' +
							'</a>' +
							'</div>';
					};
					$('#nfsShareModal .text-area-style').html(htm);
				}
			}
			DataModel['listNfs'](parameter, callback, true, "");
		} else {
			//除了点击“+”创建的时候，会出现“浏览”，其余情况都不会出现
			$modal.find('.js-get-dirpath').removeClass('hidden');
			$modal.find('input#dirname').removeClass('disabled');
		}
	}

	function afpShare(context, e, path, ispageedit) {
		$modal = $('#afpShareModal');
		if (context != null) {
			var path = formatPath2(context);
			$modal.find('#dirname').val(path);
		}
		var issupportdomain = false;
		var isgroup = false;
		var isrw = true;
		var isr = true;

		if (editafpLoadedUg == 'no') {
			editafpLoadedUg = 'yes';
			listAllgroups('afpShareModal', issupportdomain, isgroup, isrw, isr);
		}
		//这个时候页面上已经有用户了，现在需要列举出当前共享的信息，用来填充编辑框
		//如果当前文件夹没有创建afp共享；就清空框里面的信息
		listEditedAfp(path);
		$modal.modal('show');
		$modal.data('ispageedit', ispageedit);
	}
	//点击AFP共享，列出当前afp共享的相关信息并显示在页面上
	function listEditedAfp(path) {
		var formatpath = formatPath3(path) + ',1';
		var parameter = {
			'path': formatPath4(formatpath),
		};
		if (path != ',1' && path != '') {
			//除了点击“+”创建的时候，会出现“浏览”，其余情况都不会出现
			$modal.find('.js-get-dirpath').addClass('hidden');
			$modal.find('input#dirname').addClass('disabled');
			var callback = function (result) {
				if (result == undefined)
					return;
				if (result.code == 200) {
					var data = result.result;
					getSuccessAfp(data, $modal);
				};

			}
			DataModel['listAfp'](parameter, callback, true, "");
		} else {
			//除了点击“+”创建的时候，会出现“浏览”，其余情况都不会出现
			$modal.find('.js-get-dirpath').removeClass('hidden');
			$modal.find('input#dirname').removeClass('disabled');
			//清空所有的afp共享模态框内容
			$modal = $('#afpShareModal');
			$modal.find('#share_name').val('');
			$modal.find('#dirname').val('');
			$groups = $modal.find('tr.js-group');
			$modal.find(".modal-body table input:checkbox").each(function () {
				$(this).attr("checked", false);
			});
			$groups.each(function (argument) {
				$tr = $(this);
				$tr.find('.js-minus-subusers').addClass('hidden');
				$tr.find('.js-plus-subusers').removeClass('hidden');
				if ($tr.next('.subusers').length > 0) {
					$tr.next('.subusers').removeClass('hidden').addClass('hidden');
				}
			})
		}
	}
	//afp 回调函数里面的处理
	function getSuccessAfp(data, $modal) {
		var glist = data['gauth'];
		var sharename = data['name'];
		var ulist = data['uauth'];
		window.afpuser = data['uauth'];
		var rBool = false;
		var rwBool = false;
		var rlen = 0, rwlen = 0;
		$grouprows = $modal.find('tr.js-group');
		$rinput = $grouprows.find('input.sub-r');
		$rwinput = $grouprows.find('input.sub-r-w');

		$modal.find(".modal-body table input:checkbox").each(function () {
			$(this).attr("checked", false);
		});
		//将共享名显示出来
		$modal.find('.js-afp-share-name').val(sharename);
		//先清除一下，这里只展示组，去除和组下的用户
		for (var i = 0; i < $grouprows.length; i++) {
			(function ($tr) {
				var id = $tr.data('id');
				if ($('#index' + id).length > 0) {
					$tr.find('.js-minus-subusers').addClass('hidden');
					$tr.find('.js-plus-subusers').removeClass('hidden');
					$('#index' + id).remove();
				}
			})($($grouprows[i]))
		};


		//勾选用户组
		for (var j = 0; j < $grouprows.length; ++j) {
			$group = $($grouprows[j]);
			var gname = $group.data("groupname");
			for (var k = 0; k < glist.length; ++k) {
				if (gname == glist[k]["group"]) {
					if (getShareType(glist[k]["auth"]) == "read") {
						$group.find("input.sub-r").prop("checked", true);
						$group.find("input.sub-r-w").prop("checked", false);
					} else if (getShareType(glist[k]["auth"]) == "write") {
						$group.find("input.sub-r").prop("checked", false);
						$group.find("input.sub-r-w").prop("checked", true);
					}

					break;
				}
			}
		}

		//勾选用户
		var ugidarr = [];
		if (ulist.length > 0) {
			//说明当前有用户
			for (var k = 0; k < $grouprows.length; k++) {
				$row = $($grouprows[k]);
				var gid = $row.data('id');
				for (var m = 0; m < ulist.length; m++) {
					(function (user) {
						if (user['gid'].indexOf(gid) >= 0) {
							if ($("#index" + gid).length == 0) {
								var islist = true;
								$modal.find('#g' + gid).find('.js-plus-subusers').trigger('click', islist);
							}
						}
					})(ulist[m])
				};
			};
		} else {
			//没有展开的用户组
			$groups = $modal.find('tr.js-group');
			$groups.each(function (argument) {
				$tr = $(this);
				$tr.find('.js-minus-subusers').addClass('hidden');
				$tr.find('.js-plus-subusers').removeClass('hidden');
				if ($tr.next('.subusers').length > 0) {
					$tr.next('.subusers').removeClass('hidden').addClass('hidden');
				}
			})
		}
	}

	function delDir(context, e, ispageedit) {
		$li = context;
		var path = $li.data('path');
		var name = $li.data('name');

		$('#delDirModel .modal-body p').html(lang.file.sureto_del_the_dir + ' ' + '<span style="color:red;">' + name + '</span>' + '?');
		$('#delDirModel').modal('show');
		$('#delDirModel').data('path', path);
	}
	function webdavShare(context, e, path, ispageedit) {
		$modal = $('#httpShareModal');
		if (context != null) {
			var path = formatPath2(context);
			$modal.find('#dirname').val(path);
		}
		//列举组（本地用户组和域用户组）
		var issupportdomain = false;
		var isgroup = false;
		var isrw = true;
		var isr = true;
		if (editwebdevLoadedUg == 'no') {
			editwebdevLoadedUg = 'yes';
			listAllgroups('httpShareModal', issupportdomain, isgroup, isrw, isr);
		}
		//这个时候页面上已经有用户了，现在需要列举出当前共享的信息，用来填充编辑框
		listEditedHttp(path);
		//$(".js-plus-subusers").trigger("click");
		$modal.modal('show');
		$modal.data('ispageedit', ispageedit);
		if ($('.v-menu').find('.active').text().indexOf('WebDAV') >= 0) {
			$(".js-plus-subusers").trigger("click");
		}
	}
	//列出当前特定的http共享信息
	function listEditedHttp(path) {
		$modal = $('#httpShareModal');
		var formatpath = formatPath3(path) + ',1';
		var parameter = {
			'path': formatPath4(formatpath),
		};
		if (path != ',1' && path != '') {
			//除了点击“+”创建的时候，会出现“浏览”，其余情况都不会出现
			$modal.find('.js-get-dirpath').addClass('hidden');
			$modal.find('input#dirname').addClass('disabled');
			var callback = function (result) {
				if (result == undefined)
					return;
				if (result.code == 200) {
					var data = result.result;
					getSuccessHttp(data, $modal);
					var $uinput = $('.js-user').find('input[type="checkbox"]:checked');
					if ($uinput.length < 1) {
						$('.js-plus-subusers').trigger('click');
					}
				};

			}
			DataModel['listHttp'](parameter, callback, true, "");
		} else {
			//清空共享框的中的信息
			//除了点击“+”创建的时候，会出现“浏览”，其余情况都不会出现
			$modal.find('.js-get-dirpath').removeClass('hidden');
			$modal.find('input#dirname').removeClass('disabled');
			$modal.find('#dirname').val('');
			$modal.find('.js-http-share-name').val('');
			$modal.find('.share-allocation-size').val('');
			$modal.find(".modal-body .js-table-all input:checkbox").each(function () {
				$(this).prop("checked", false);
			});
		}
	}

	//创建hTTP共享成功之后的操作
	function getSuccessHttp(data, $modal) {
		$userrows = $modal.find('.share-users-body').find('.js-user');
		$modal.find(".modal-body .js-table-all input:checkbox").each(function () {
			$(this).prop("checked", false);
		});
		//单位
		var size = parseFloat(data["quota"]);
		var sharename = data["name"];
		$modal.find('.js-http-share-name').val(sharename);
		var str = 0;
		if (size == 0 || size == "" || isNaN(size)) {
			$modal.find(".modal-body .share-allocation-size").val("");
			$modal.find(".modal-body #unit option[value='M']").attr("selected", true);
		} else {
			if ((size / (1024 * 1024 * 1024)) >= 1) { // T
				str = ((Math.round((size / (1024 * 1024 * 1024)) * 100)) / 100);//100保留两位
				$modal.find(".modal-body #unit option[value='T']").attr("selected", true);
			} else if (size / (1024 * 1024) >= 1) { //G
				str = ((Math.round((size / (1024 * 1024)) * 100)) / 100);
				$modal.find(".modal-body #unit option[value='G']").attr("selected", true);
			} else if (size / (1024) >= 0) { //M
				str = ((Math.round((size / (1024)) * 100)) / 100);
				$modal.find(".modal-body #unit option[value='M']").attr("selected", true);
			}
			$modal.find(".modal-body .share-allocation-size").val(str);
		}
		var ulist = data['authlist'];
		for (var i = 0; i < ulist.length; i++) {
			for (var j = 0; j < $userrows.length; j++) {
				$userrow = $($userrows[j]);
				var uname = $userrow.data('name');
				if (data["authlist"][i]["user"] == uname) {
					if (data["authlist"][i]["auth"] == 1) {
						$userrow.find("input.sub-r").prop("checked", true);
						$userrow.find("input.sub-r-w").prop("checked", false);
					} else if (data["authlist"][i]["auth"] == 2) {
						$userrow.find("input.sub-r").prop("checked", false);
						$userrow.find("input.sub-r-w").prop("checked", true);
					}
				}
			};
		};
	}

	function createAfpShare(context, e) {
		if (context != null) {
			var path = formatPath2(context);
			$('#createAfpShareModal #newdirname').val(path);
		}
		//列举组（本地用户组和域用户组）
		var issupportdomain = true;
		var isgroup = false;
		var isrw = true;
		var isr = true;
		listAllgroups('createAfpShareModal', issupportdomain, isgroup, isrw, isr);
		$('#createAfpShareModal').modal('show');
	}
	function createWebdavShare(context, e) {
		$('#createHttpShareModal').modal('show');
	}
	//列举组（本地用户组和域用户组）
	/*
	 modal 模态框名
	 issupportdomain 判断是否列举域用户组
	 isgroup 判断是否有select分组
	 isrw 判断是否有读写权限
	 isr 判断是否有只读权限
	 */
	function listAllgroups(modal, issupportdomain, isgroup, isrw, isr) {
		var data = ownLocalGroupData;
		var htm = '';
		if (isgroup) {
			htm += listLocalGroup(data, htm);
			$('#' + modal + ' .share-local-group').html(htm);

		} else if (!isgroup && (isrw || isr)) {
			htm += listLocalGroupAndUsers(data, htm, isrw, isr);
			$('#' + modal + ' .share-users-body tbody').html(htm);
		}
		if (issupportdomain) {
			var data = ownDomainGroupData;
			var htm = '';
			for (var i = 0; i < data.length; i++) {
				var gname = domainNameData + '\\' + data[i].gname;
				htm += '<tr class="js-group domain" id="g' + data[i].gid + '" data-id="' + data[i].gid + '" data-groupname = "' + gname + '" >' +
					'<td class="left" style="width:49.5%;">' +
					'<a href="javascript:;" class="js-plus-subusers" data-uid="' + data[i].gid + '" data-uname="' + data[i].gname + '"><span class="glyphicon glyphicon-plus-sign"></span></a>' +
					'<a href="javascript:;" class="js-minus-subusers hidden" data-uid="' + data[i].gid + '" data-uname="' + data[i].gname + '"><span class="glyphicon glyphicon-minus-sign"></span></a>' +
					'<span>' + data[i].gname + '</span>' +
					'</td>' +
					'<td style="width:25%;"><input type="checkbox" value="read" class="sub-r"/></td>' +
					'<td style="width:25%;"><input type="checkbox"  value="write" class="sub-r-w"/></td>' +
					'</tr>';
			}
			var ldapGroupData = ownLdapGroupData;
			for (var i = 0; i < ldapGroupData.length; i++) {
				var gname = ldapData.domain + '\\' + ldapGroupData[i].gname;

				htm += '<tr class="js-group ldapDomain" id="g' + ldapGroupData[i].gid + '" data-id="' + ldapGroupData[i].gid + '" data-groupname = "' + gname + '" >' +
					'<td class="left" style="width:50%;">' +
					'<a href="javascript:;" class="js-plus-subusers" data-uid="' + ldapGroupData[i].gid + '" data-uname="' + ldapGroupData[i].gname + '"><span class="glyphicon glyphicon-plus-sign"></span></a>' +
					'<a href="javascript:;" class="js-minus-subusers hidden" data-uid="' + ldapGroupData[i].gid + '" data-uname="' + ldapGroupData[i].gname + '"><span class="glyphicon glyphicon-minus-sign"></span></a>' +
					'<span>' + ldapGroupData[i].gname + '</span>' +
					'</td>' +
					'<td style="width:25%;"><input type="checkbox" value="read" class="sub-r"/></td>' +
					'<td style="width:25%;"><input type="checkbox"  value="write" class="sub-r-w"/></td>' +
					'</tr>';
			}


			$('#' + modal + ' .share-users-body tbody').append(htm);
		}
		if (isgroup) {
			var data = ownLocalUsersData;
			var htm = '';
			if (isrw && isr) {
				for (var i = 0; i < data.length; i++) {
					htm += '<tr  class="js-user" data-name="' + data[i].username + '">' +
						'<td  class="left" style="width:49.5%;">' + data[i].username + '</td>' +
						'<td style="width:25%;"><input type="checkbox" value="read" class="sub-r"/></td>' +
						'<td style="width:25%;"><input type="checkbox" value="write" class="sub-r-w"/></td>' +
						'</tr>';
				}
			} else if (isrw && !isr) {
				for (var i = 0; i < data.length; i++) {
					htm += '<tr  class="js-user" data-name="' + data[i].username + '">' +
						'<td style="float: left;">' + data[i].username + '</td>' +
						'<td style="width:25%;"><input type="checkbox" value="write" class="sub-r-w"/></td>' +
						'</tr>';
				}
			}
			$('#' + modal + ' .share-users-body tbody').append(htm);
		}
	}
	/*isrw 读写； isr 只读*/
	function listLocalGroupAndUsers(data, htm, isrw, isr) {
		if (isrw && isr) {
			for (var i = 0; i < data.length; i++) {
				if (data[i].groupname != 'system' && $('.dt_g_left_bar .active').text().indexOf('FTP') == -1) {
					htm += '<tr class="js-group" id="g' + data[i].groupid + '" data-id="' + data[i].groupid + '" data-groupname="' + data[i].groupname + '">' +
						'<td class="left" style="width:51.5%;">' +
						'<a href="javascript:;" class="js-plus-subusers" data-gid="' + data[i].groupid + '" data-groupname="' + data[i].groupname + '"><span class="glyphicon glyphicon-plus-sign"></span></a>' +
						'<a href="javascript:;" class="js-minus-subusers hidden" data-gid="' + data[i].groupid + '"><span class="glyphicon glyphicon-minus-sign"></span></a>' +
						'<span>' + data[i].groupname + '</span>' +
						'</td>' +
						'<td style="width:21.5%;"><input type="checkbox" value="read" class="sub-r"></td>' +
						'<td style="width:27%;"><input type="checkbox" value="write" class="sub-r-w"></td>' +
						'</tr>';
				}
				else if (data[i].groupname != 'system' && $('#ftpShareModalLabel').html().indexOf('FTP') >= 0) {
					htm += '<tr class="js-group" id="g' + data[i].groupid + '" data-id="' + data[i].groupid + '" data-groupname="' + data[i].groupname + '">' +
						'<td class="left" style="width:51.5%;">' +
						'<a href="javascript:;" class="js-plus-subusers" data-gid="' + data[i].groupid + '" data-groupname="' + data[i].groupname + '"><span class="glyphicon glyphicon-plus-sign"></span></a>' +
						'<a href="javascript:;" class="js-minus-subusers hidden" data-gid="' + data[i].groupid + '"><span class="glyphicon glyphicon-minus-sign"></span></a>' +
						'<span>' + data[i].groupname + '</span>' +
						'</td>' +
						'<td style="width:27%;"><input type="checkbox" value="write" class="sub-r-w"></td>' +
						'</tr>';
				}
			}
		}
		return htm;
	}
	function listLocalGroup(data, htm) {
		htm += '<option value="all" data-gid="">all</option>';
		for (var i = 0; i < data.length; i++) {
			if (data[i].groupname != 'system') {
				htm += '<option value="' + data[i].groupname + '" data-gid="' + data[i].groupid + '">' + data[i].groupname + '</option>';
			}
		}
		return htm;
	}
	function createNewFolder(argument) {
		var name = trim($('#newdirname').val());
		var curdir = $('li.js-goto-path.disabled:last').data('path');
		var mpath = $('.all-folder-page .js-dir:first').data('mount');
		var username = $.cookie('login_user');
		if (name === "") {
			DisplayTips(lang.file.please_input_dir_name);
			return false;
		}
		if (name.length > 32) {
			DisplayTips(lang.cluster.name_too_long);
			return false;
		}
		if(valifySpecialCh(name)){
			var speaclname = valifySpecialword(name)[0];
			DisplayTips(lang.cluster.name_not_special + speaclname );
			return false;
		}
		var path = curdir + ',' + name + ',1';
		var page = '';
		var perpage = '';
		var parameter = {
			'path': formatPath4(path),
			'username': username,
		};
		var callback = function (result) {
			removeWaitMask();
			$('#addNewFolderModal').find('.modal-header').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips(lang.file.create_dir_success);
				var titletip = lang.file.name + name + "<br>" + lang.file.owners + username + "<br>";
				var htm = '';
				if ($('.folder-ul').length < 1) {
					htm += '<ul class="box-shadow folder-ul">';
				}
				htm += '<li class="js-dir" data-name="' + name + '" data-mount="' + mpath + '" data-path="' + path + '">' +
					'<div class="">' +
					'<a href="javascript:;">' +
					'<img src="css/image/folder_normal.png" class="tooltip-hide" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="' + titletip + '">' +
					'</a>' +
					'</div>' +
					'<div class="ellipsis">' +
					'<a href="javascript:;" class="tooltip-hide" data-toggle="tooltip" data-placement="bottom" data-html="true" data-original-title="' + titletip + '">' +
					'<span>' + name + '</span>' +
					'</a>' +
					'</div>' +
					'</li>';
				if ($('.folder-ul').length < 1) {
					htm += '</ul>';
					$('.all-folder-page').html('').append(htm);
				} else {
					$('.all-folder-page .folder-ul').prepend(htm);
				}
				dirRightMenu();
			} else {
				DisplayTips(lang.file.create_dir_fail + '(' + result.result + ')');
			}
			$('#addNewFolderModal').modal('hide');
		}
		$('#addNewFolderModal').find('.modal-header').LoadData('show');
		addWaitMask();
		DataModel['createDir'](parameter, callback, true, lang.file.create_dir);
	}

	function blankRightMenu(argument) {
		$('.all-folder-page').contextmenu({
			target: '#blank-menu',
			before: function (e, context) {
				// execute code before context menu if shown
				e.preventDefault();
				$('#file-right-menu').hide();
				$('#dir-right-menu').hide();
				$('.js-dir.pop-right-menu').removeClass('pop-right-menu');
			},
			onItem: function (context, e) {
				var $el = $(e.target);
				var action = $el.attr('action');
				var map = {
					'add-new-dir': addNewDir,
					'more-dir-property': moreDirPropertyFile,
					'refresh-cur-dir': refrshCurDir,
				}
				if ($.isFunction(map[action])) {
					map[action](context, e);
				}
			}
		});
	}
	function dirRightMenu(argument) {
		$('.all-folder-page .js-dir').contextmenu({
			target: '#dir-right-menu',
			before: function (e, context) {
				// execute code before context menu if shown
				e.preventDefault();
				$('#file-right-menu').hide();
				$('#blank-menu').hide();
				context.siblings().removeClass('pop-right-menu');
				context.addClass('pop-right-menu');
			},
			onItem: function (context, e) {
				var $el = $(e.target);
				var action = $el.attr('action');
				var path = formatPath2(context);
				var map = {
					'js-create-afp': createAfpShare,
					'js-create-webdav': createWebdavShare,
					'js-cifs': cifsShare,
					'js-nfs': nfsShare,
					'js-afp': afpShare,
					'js-ftp': ftpShare,
					'js-webdav': webdavShare,
					'js-property': moreDirPropertyFile,
					'js-del-dir': delDir,
				}
				if ($.isFunction(map[action])) {
					map[action](context, e, path);
				}
			}
		});
	}
	function fileRightMeun(argument) {
		$('.all-folder-page .js-file').contextmenu({
			target: '#file-right-menu',
			before: function (e, context) {
				// execute code before context menu if shown
				e.preventDefault();
				$('#dir-right-menu').hide();
				$('#blank-menu').hide();
				context.siblings().removeClass('pop-right-menu');
				context.addClass('pop-right-menu');
			},
			onItem: function (context, e) {
				var $el = $(e.target);
				var action = $el.attr('action');
				var map = {
					'js-del-file': delFile,
					'js-property': moreDirPropertyFile,
				}
				if ($.isFunction(map[action])) {
					map[action](context, e);
				}
			}
		});
	}
	function curgroupNoauthChecked(argument) {
		$this = $(this);
		$tr = $this.closest('tr');
		if ($(this).prop('checked') == true) {
			$tr.find('.sub-pro-r').prop("checked", false);
			$tr.find('.sub-pro-r-w').prop("checked", false);
		}
	}
	function curgroupReadChecked(argument) {
		$this = $(this);
		$tr = $this.closest('tr');
		if ($(this).prop('checked') == true) {
			$tr.find('.sub-pro-noauth').prop("checked", false);
			$tr.find('.sub-pro-r-w').prop("checked", false);
		}
	}
	function curgroupWriteChecked(argument) {
		$this = $(this);
		$tr = $this.closest('tr');
		if ($(this).prop('checked') == true) {
			$tr.find('.sub-pro-noauth').prop("checked", false);
			$tr.find('.sub-pro-r').prop("checked", false);
		}
	}
	//显示目录列表
	function showDirsList(result, ismodal) {
		$modal = $('#showDirPathModal');
		var data = result.result;
		var htm = '';
		htm += '<div class="all-folder-page"><ul class="box-shadow folder-ul">';
		var dirpath = '';
		for (var i = 0; i < data.length; i++) {
			if (ismodal) {
				dirpath = $modal.find('.js-dirpath').find('.js-goto-path.disabled:last').data('path');
			} else {
				dirpath = $('.dt_g_right_bar .js-dirpath').find('.js-goto-path.disabled:last').data('path');
			}
			dirpath += ',' + data[i].name + ',' + 1;
			//首先判断文件类型，是普通文件还是目录
			var titletip = lang.file.name + data[i].name + "<br>" + lang.file.owners + data[i].owner + "<br>";
			if (data[i].isdir == 1) {
				htm += '<li class="js-dir" data-name="' + data[i].name + '" data-mount="' + mpath + '" data-path="' + dirpath + '">';
				//判断文件是否被共享
				if (data[i].isshared == 0) {
					htm += '<div class="">' +
						'<a href="javascript:;">' +
						'<img src="css/image/folder_normal.png" class="tooltip-hide" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="' + titletip + '">' +
						'</a>' +
						'</div>';
				} else {
					titletip += lang.file.share_way + data[i].sharenames;
					htm += '<div>' +
						'<a href="javascript:;">' +
						'<img src="css/image/folder_normal_share.png" class="tooltip-hide" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="' + titletip + '">' +
						'</a>' +
						'</div>';
				}
				htm += '<div class="ellipsis">' +
					'<a href="javascript:;" class="tooltip-hide" data-toggle="tooltip" data-placement="bottom" data-html="true" data-original-title="' + titletip + '">' +
					'<span>' + data[i].name + '</span>' +
					'</a>' +
					'</div>' +
					'</li>';
			} else {
				htm += '<li class="js-file" data-name="' + data[i].name + '" data-path="' + dirpath + '">' +
					'<div class="">' +
					'<a href="javascript:;">' +
					'<img src="css/image/file_normal.png" class="tooltip-hide" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="' + titletip + '">' +
					'</a>' +
					'</div>' +
					'<div class="ellipsis">' +
					'<a href="javascript:;" class="tooltip-hide" data-toggle="tooltip" data-placement="bottom" data-html="true" data-original-title="' + titletip + '">' +
					'<span>' + data[i].name + '</span>' +
					'</a>' +
					'</div>' +
					'</li>';
			};
		}
		htm += '</ul></div>';

		if (ismodal) {
			$('#showDirPathModal').find('.all_table_list_third').html(htm);
		} else {
			$('.dt_g_right_bar .all_table_list_third').html(htm);
		}

		// $('.all_table_list_third').html(htm);
		dirRightMenu();
		fileRightMeun();
		blankRightMenu();
	}
	//加载根目录下的目录以及文件

	//列举挂载点
	function listMountPoint(isclickpath) {
		var parameter = null;
		var callback = function (result) {
			if (result == undefined)
				return;
			if (result.code == 200) {
				$(".all_table_list_third").LoadData("hide");
				mountPointData = result.result;
				var data = result.result;
				var htm, res, str;
				res = addDirMountPointInfinity(data, htm, str);
				htm = res.htm;
				str = res.str;
				$('.all_table_list_third').html(htm);
				if (isclickpath == true) {
					$('.js-dirpath .js-goto-path').remove();
					$('.js-dirpath .js-goto-path:first').addClass('disabled');
				}
				var lihtm = '<li class="js-goto-path ellipsis disabled" data-path="' + str + '">' +
					'<a href="javascript:;"><span>/</span><span class="hidden" id="showEllipsis"> . . . /</span></a>' +
					'</li>';
				$('.js-dirpath').append(lihtm);
			} else {
				$el = $('.all_table_list_third');
				noRecord($el);
			}
		}
		$(".all_table_list_third").LoadData("show");
		DataModel['listMount'](parameter, callback, true, '');
	}
	listMountPoint();
	//列举挂载点的时候，给首页添加目录
	function addDirMountPoint(data, htm, str) {
		var titletip;
		htm = '<div class="all-root-page"><ul class="box-shadow folder-ul">';

		for (var i = 0; i < data.length; i++) {
			str = data[i].mountpoint;
			if (str == '') {
				continue;
			}
			titletip = lang.file.name + data[i].name;
			htm += '<li class="js-dir" data-mount="' + data[i].mountpoint + '" data-name="' + data[i].name + '" data-path="' + data[i].mountpoint + '">' +
				'<div class="">' +
				'<a href="javascript:;">' +
				'<img src="css/image/folder_normal.png" class="tooltip-hide" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="' + titletip + '">' +
				'</a>' +
				'</div>' +
				'<div class="ellipsis">' +
				'<a href="javascript:;" class="tooltip-hide" data-toggle="tooltip" data-placement="bottom" data-html="true" data-original-title="' + titletip + '">' +
				'<span>' + data[i].name + '</span>' +
				'</a>' +
				'</div>' +
				'</li>';
		}
		htm += '</ul>' +
			'</div>';
		return {
			htm: htm,
			str: str
		};
	}

	//列举挂载点的时候，给首页添加目录
	function addDirMountPointInfinity(data, htm, str) {
		var titletip;
		var name = data.substring(1, data.length);

		if (data.length > 0) {
			htm = '<div class="all-root-page"><ul class="box-shadow folder-ul">';
			titletip = lang.file.name + name;
			htm += '<li class="js-dir" data-mount="' + data + '" data-name="' + name + '" data-path="' + data + '">' +
				'<div class="">' +
				'<a href="javascript:;">' +
				'<img src="css/image/folder_normal.png" class="tooltip-hide" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="' + titletip + '">' +
				'</a>' +
				'</div>' +
				'<div class="ellipsis">' +
				'<a href="javascript:;" class="tooltip-hide" data-toggle="tooltip" data-placement="bottom" data-html="true" data-original-title="' + titletip + '">' +
				'<span>' + name + '</span>' +
				'</a>' +
				'</div>' +
				'</li>';
			htm += '</ul>' +
				'</div>';
		} else {
			$el = $('.all_table_list_third');
			noRecord($el);
		}

		return {
			htm: htm,
			str: str
		};
	}

	//列举指定目录下的目录以及文件
	function loadDir(path, name, mpath, page, perpage, ismodal) {
		var parameter = {
			'path': formatPath4(path),
			'page': page,
			'perpage': perpage
		};
		$('.js-dirpath').data('path', path);
		var dirpath1 = $('.js-dirpath').data('path');
		var callback = function (result) {
			$(".all_table_list_third").LoadData("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
				totalpage = Math.ceil( result.count/150 );
				var showLog = function (targetPage) {
					var paginationHtml = renderPagination(totalpage, targetPage);
					$('#js-audit-pagination').html(paginationHtml);
					var parameter = {
						'path': formatPath4($('.js-dirpath li:last').data('path')),
						'page': targetPage,
						'perpage': 150,
					};
					var callback = function (result) {
						if (result == undefined)
							return;
						if (result.code == 200) {
							if (result.count > 0) {
								showDirsList(result, ismodal);
							} else {
								$el = $('.all-folder-page');
								if ($el.length > 0) {
									noRecord($el);
								} else {
									var htm1 = "";
									htm1 += '<div class="all-folder-page"><ul class="box-shadow folder-ul">';
									htm1 += '</ul></div>';

									if (ismodal) {
										$('#showDirPathModal').find('.all_table_list_third').html(htm1);
									} else {
										$('.dt_g_right_bar .all_table_list_third').html(htm1);
									}
									noRecord($('.all-folder-page'));
								}
								dirRightMenu();
								fileRightMeun();
								blankRightMenu();
							}

							//省略路径
							var dirDepth = $('.js-dirpath>li').length;
							if (dirDepth > 5) {
								$('.js-dirpath>li:eq(' + (dirDepth - 5) + ')').addClass('hidden');
								$('#showEllipsis').removeClass('hidden');
							}
							//添加完整路径title
							$('#showPath').attr('title', getPathStr());
						} else {
							DisplayTips( lang.optlog.list_logs_fail );
						}
					}
					DataModel['listDirs'](parameter, callback, true, '')
				}

				var searchLog = function (keyword, targetPage) {
					var parameter = {
						'path': formatPath4($('.js-dirpath li:last').data('path')),
						'keyword': keyword,
						'page':targetPage
					};

					var callback = function (result) {
						$('.dt_system_bar').LoadData('hide')
						if (!result) {
							return;
						}
						if (result.code === 200) {
							var totalPages = Math.ceil( result.count / 150 );
							var paginationHtml = renderPagination(totalPages, targetPage);
							$('#js-audit-pagination').html(paginationHtml);
							var data = result.result;
							var ismodal = false;
							if (result.count > 0) {
								showDirsList(result, ismodal);
								for (var j = 0; j < data.length; j++) {
									$('.dt_g_right_bar .all_table_list_third').find('.folder-ul li:eq(' + j + ')').data('path', data[j].path);
								}
								var $keymatch = $('.all-folder-page .folder-ul li');
								var len = $keymatch.length;
								//len大于0，说明此时有用户列表，可以进行匹配
								if (len > 0) {
									for (var i = 0; i < $keymatch.length; i++) {
										highlight(keyword, $keymatch[i]);//把匹配的结果高亮显示
									}
								}
							} else {
								$(".all_table_list_third").LoadData("hide");
								$el = $('.all-folder-page');
								if ($el.length > 0) {
									noRecord($el);
								}
								dirRightMenu();
								fileRightMeun();
								blankRightMenu();
							}
						} else {
							console.log('fail!');
						}
					}

					$('.dt_system_bar').LoadData('show')
					DataModel['searchDir'](parameter, callback, true, "");
				}

				showLog(1);

				$(document)
				//点击页码
					.on('click', '.js-audit-page', function (ev) {
						var target = $(this).data('target');
						if ($('#textSearchPath').val() != '') {
							searchLog($('#textSearchPath').val(), target);
						} else {
							showLog(target);
						}
					})


				$('.js-goto-path:gt(0)').removeClass('disabled');
				htm = '<li class="js-goto-path disabled" data-path="' + dirpath1 + '">' +
					'<a href="javascript:;" style="display:flex;" title="' + name + ' "><span class="ellipsis" style="display:block;">' + name + '</span>' + '<span>' + '/' + '</span></a>' +
					'</li>';
				$('.js-dirpath').append(htm);
				if (result.count > 0) {
					showDirsList(result, ismodal);
				} else {
					$el = $('.all-folder-page');
					if ($el.length > 0) {
						noRecord($el);
					} else {
						var htm1 = "";
						htm1 += '<div class="all-folder-page"><ul class="box-shadow folder-ul">';
						htm1 += '</ul></div>';

						if (ismodal) {
							$('#showDirPathModal').find('.all_table_list_third').html(htm1);
						} else {
							$('.dt_g_right_bar .all_table_list_third').html(htm1);
						}
						noRecord($('.all-folder-page'));
					}
					dirRightMenu();
					fileRightMeun();
					blankRightMenu();
				}

				//省略路径
				var dirDepth = $('.js-dirpath>li').length;
				if (dirDepth > 5) {
					$('.js-dirpath>li:eq(' + (dirDepth - 5) + ')').addClass('hidden');
					$('#showEllipsis').removeClass('hidden');
				}
				//添加完整路径title
				$('#showPath').attr('title', getPathStr());

			} else {
				$el = $('.all-folder-page');
				noRecord($el);
			}
		}
		$(".all_table_list_third").LoadData("show");

		DataModel['listDirs'](parameter, callback, true, '');
	}
	//删除共享页面的共享  前期工作 模态框出现
	function deleteSingleShare(ev) {
		$this = $(this);
		var name = $this.closest('.' + ev.data + '-share').data('name');
		var spanVal = $this.closest('.share_header').find('span').text();
		if (ev.data == 'ftp') { name = spanVal; }
		else if (ev.data == 'nfs') { name = spanVal; }
		var path = $this.closest('.' + ev.data + '-share').data('path');
		$this.closest('.share-grid').addClass('to-be-deleted');
		$modal = $('#delShareModel');
		$modal.find('.modal-body p').html(lang.file.sure_to_del_share + '<span style="color:red;">' + ' ' + name + '</span>' + '?');
		$modal.modal('show');
		$modal.data('path', path);
		$modal.data('share', ev.data);
	}
	//删除共享页面上的共享的 回调函数
	function delShareCallback(result) {
		removeWaitMask();
		$modal.find('.modal-header').LoadData('hide');
		var sharename = $modal.data('share');
		if (result == undefined)
			return;
		if (result.code == 200) {
			DisplayTips(eval('lang.file.del_' + sharename + '_share_success'));
			//移除该共享
			$('.to-be-deleted').remove();
			$('.grid').masonry({
				itemSelector: '.grid-item',
				columnWidth: '.col-lg-6',
				percentPosition: true
			})
		} else {
			DisplayTips(eval('lang.file.del_' + sharename + '_share_fail') + '(' + result.result + ')');
		}
		$modal.modal('hide');
	}

	//列举本地用户和本地用户组；判断是否加入域，如果加入域，再列出所有域用户组和所有域用户
	function listAllOwnerUsers() {
		var parameter = {
			'role': 0,
			'page': 1,
			'perpage': -1,
		};
		var domainpara = {
			'page': 1,
			'perpage': -1,
		};
		//列举本地用户
		var localUserCallback = function (result) {
			if (result == undefined)
				return;
			if (result.code == 200) {
				ownLocalUsersData = result.result;
			} else {
			}
		}
		DataModel['listAllUser'](parameter, localUserCallback, true, null);

		//列举本地用户组
		var localGroupCallback = function (result) {
			if (result == undefined)
				return;
			if (result.code == 200) {
				ownLocalGroupData = result.result;
			} else {
			}
		}
		DataModel['listGroup'](null, localGroupCallback, true, null);

		//判断是否加入域
		var domainInfoCallback = function (result) {
			if (result == undefined)
				return;
			if (result.code == 200) {
				var data = result.result;
				domainNameData = data['domain'];
				if (domainNameData != '' && domainNameData != undefined && domainNameData != null) {
					//继续列举出所有的域用户组

				}
			}
		}
		DataModel['listDomainInfo'](null, domainInfoCallback, true, null);

		var domainGroupCallback = function (result) {
			if (result == undefined)
				return;
			if (result.code == 200) {
				ownDomainGroupData = result.result;
			}
		}
		DataModel['listAllDomainGroups'](domainpara, domainGroupCallback, true, lang.user.list_group);

		// 列举出所有的域用户
		//var domainUserCallback = function (result) {
		//	if (result == undefined)
		//		return;
		//	if (result.code == 200) {
		//		ldapGroupDetailedList = result.result;
		//	}
		//}
		// DataModel['domainUsersListBygroup'](null, domainUserCallback, true, lang.user.list_group);

		//判断是否加入LDAP域
		var ldapJoined = true;
		var ldapInfoCallback = function (result) {
			if (!result) {
				return;
			}
			if (result.code === 200) {
				ldapData = result.result;
				if (ldapData.server === '') {
					ldapJoined = false;
				}
			}
		}
		DataModel['listLDAPInfo'](null, ldapInfoCallback, true, null);

		//列举LDAP用户组
		var ldapGroupCallback = function (result) {
			if (!result) {
				return;
			}
			if (result.code === 200) {
				ownLdapGroupData = result.result;
			}
		}
		DataModel['listLDAPGroup'](null, ldapGroupCallback, true, null);
	}
	listAllOwnerUsers();

	//折叠展开的时候调用
	function listUsersAddHtmlAfterGroup(result, groupid, ulist, issearch) {
		var gdata = result.result;
		var htm = '';
		var tname = '';
		$tr = $('tr#g' + groupid);
		htm += '<tr class="subusers" id="index' + groupid + '" data-id="' + groupid + '"><td colspan="4"><table class="table table-condensed table-hover ">';
		for (var j = 0; j < gdata.length; j++) {
			if (gdata[j].userid == undefined) {
				userid = '';
			} else {
				userid = gdata[j].userid;
			}
			if (gdata[j].username == undefined) {
				name = domainNameData + '\\' + gdata[j].uname;
			} else {
				name = gdata[j].username;
			}
			if (gdata[j].username == undefined) {
				tname = gdata[j].uname;
			} else {
				tname = gdata[j].username;
			}
			var ischecked = false;
			var isauth;
			if (ulist) {
				for (var k = 0; k < ulist.length; k++) {
					if (ulist[k]['user'] === name) {
						ischecked = true;
						isauth = ulist[k]['auth'];
					}
				};
			}
			htm += '<tr class="js-user" data-name="' + name + '">' +
				'<td class="left" style="width:49.5%;padding-left:20px;">' +
				'<a href="javascript:;" data-userid="' + userid + '"></a>' +
				'<span>' + tname + '</span>' +
				'</td>';
			if (ischecked) {
				if (isauth == 1) {
					htm += '<td style="width:25%;"><input type="checkbox" value="read" class="sub-r" checked="checked"/></td>';
					htm += '<td style="width:25%;"><input type="checkbox" value="write" class="sub-r-w"/></td>';
				} else if (isauth == 2) {
					htm += '<td style="width:25%;"><input type="checkbox" value="read" class="sub-r"/></td>';
					htm += '<td style="width:25%;"><input type="checkbox" value="write" class="sub-r-w"  checked="checked"/></td>';
				} else {
					htm += '<td style="width:25%;"><input type="checkbox" value="read" class="sub-r"/></td>';
					htm += '<td style="width:25%;"><input type="checkbox" value="write" class="sub-r-w"/></td>';
				}
			} else {
				if ($('.dt_g_left_bar .active').text().indexOf('FTP') == -1) {
					htm += '<td style="width:25%;"><input type="checkbox" value="read" class="sub-r"/></td>';
				}
				htm += '<td style="width:25%;"><input type="checkbox" value="write" class="sub-r-w"/></td>';
			}
			htm += '</tr>';
		};
		htm += '</table></td></tr>';
		$tr.find('.js-minus-subusers').removeClass('hidden');
		$tr.find('.js-plus-subusers').addClass('hidden');

		if ($('tr#index' + groupid).length > 0) {
			$('tr#index' + groupid).remove();
		}
		$tr.after(htm);
		if ($modal.find('h4').text().indexOf('FTP') >= 0) {
			$modal.find('.subusers .sub-r').css('display', 'none');
		}
		for (var i = 0; i < $('.js-group .sub-r-w').length; i++) {
			if ($('.js-group .sub-r-w:eq(' + i + ')').is(':checked') == true) {
				$('.js-group .sub-r-w:eq(' + i + ')').parent().parent().next().find('.sub-r-w').attr('checked', true)
			} else if ($('.js-group .sub-r:eq(' + i + ')').is(':checked') == true) {
				$('.js-group .sub-r:eq(' + i + ')').parent().parent().next().find('.sub-r').attr('checked', true)
			}
		}

		if (issearch) {
			$users = $modal.find('tr#index' + groupid).find('.js-user');
			var keywords = trim($modal.find('input.js-search').val());
			var $keymatch = $users.find('td:first');
			var len = $keymatch.length;
			//len大于0，说明此时有用户列表，可以进行匹配
			if (len > 0) {
				for (var i = 0; i < $keymatch.length; i++) {
					highlight(keywords, $keymatch[i]);//把匹配的结果高亮显示
				}
			}
		}
	}

	//获取当前路径字符串
	function getPathStr() {
		var pathStr = $('.js-goto-path:last').data('path').replace().replace(/,1,/g, '/');
		pathStr = pathStr.slice(0, pathStr.length - 2);
		pathStr = '/' + pathStr + '/';
		return pathStr;
	}

	//由分组id获取不同格式的用户列表
	function getUsersByGid(gid, isftp, ishttp) {
		var data = ownLocalUsersData;
		var htm = '';
		if (isftp) {
			for (var i = 0; i < data.length; i++) {
				//选择all时gid为空，列出所有用户
				if ((gid == data[i].groupid) || (gid == '')) {
					htm += '<tr  class="js-user" data-name="' + data[i].username + '">' +
						'<td class="left" style="width:75%;">' + data[i].username + '</td>' +
						'<td style="width:25%;"><input type="checkbox" value="write" class="sub-r-w"/></td>' +
						'</tr>';
				}
			}
			return htm;
		}

		else if (ishttp) {
			for (var i = 0; i < data.length; i++) {
				if ((gid == data[i].groupid) || (gid == '')) {
					htm += '<tr  class="js-user" data-name="' + data[i].username + '">' +
						'<td class="left" style="width:49.5%;">' + data[i].username + '</td>' +
						'<td style="width:25%;"><input type="checkbox" value="read" class="sub-r"/></td>' +
						'<td style="width:25%;"><input type="checkbox" value="write" class="sub-r-w"/></td>' +
						'</tr>';
				}
			}
			return htm;
		}
		else
			return;
	}

	//更新共享信息
	function updateTipShareInfo(shareNameStr) {
		var $imgTip = $('.pop-right-menu .tooltip-hide:first');
		var $aTip = $('.pop-right-menu .tooltip-hide:last');
		if (($imgTip == undefined) || ($aTip == undefined))
			return;
		var tipTitle = $imgTip.attr('data-original-title')
		//用字符串判断有无共享
		if (tipTitle.indexOf(lang.file.share_way) == -1) {
			//当前无共享
			tipTitle += lang.file.share_way + shareNameStr;
			$imgTip.attr('data-original-title', tipTitle);
			$aTip.attr('data-original-title', tipTitle);
		}
		else {
			//有共享
			if (tipTitle.indexOf(shareNameStr) == -1) {
				//无当前名称共享
				tipTitle += '/' + shareNameStr;
				$imgTip.attr('data-original-title', tipTitle);
				$aTip.attr('data-original-title', tipTitle);
			}
		}
		return;
	}

	//CIFS监控信息
	function cifsMonitorInfo(data) {
		var nodeHtml = "";
		var totalNum = data.count;
		$('#total-nodes-num').text(totalNum);
		for (var i = 0; i < totalNum; i++) {
			nodeHtml += '<div class="panel panel-default">' +
				'<div class="panel-heading">' +
				'<h4 class="panel-title">' +
				'<a data-toggle="collapse" data-parent="#accordion" href="#collapse' + i + '">' +
				'<span>' + data.info[i].server + '</span>' +
				'<span class="badge" style="margin-bottom: 4px;color:lightgrey;float:right">' + data.info[i].count + '</span>' +
				'</a>' +
				'</h4>' +
				'</div>' +
				'<div class="table-responsive panel-collapse collapse" id="collapse' + i + '">' +
				'<table class="table table-striped panel-body">' +
				'<thead>' +
				'<tr>' +
				'<th>' + lang.file.user_name + '</th>' +
				'<th>' + lang.file.group_name + '</th>' +
				'<th>' + lang.file.client_ip + '</th>' +
				'<th>' + lang.file.file_path + '</th>' +
				'<th>' + lang.file.open_time + '</th>' +
				'</tr>' +
				'</thead>' +
				'<tbody>';
			var tableTr = "";
			if (data.info[i].count === 0) {
				tableTr = '<tr>' +
					'<td></td>' +
					'<td></td>' +
					'<td></td>' +
					'<td></td>' +
					'<td></td>' +
					'</tr>';
			} else {
				for (var j = 0; j < data.info[i].count; j++) {
					tableTr += '<tr>' +
						'<td>' + data.info[i].sessions[j].username + '</td>' +
						'<td>' + data.info[i].sessions[j].groupname + '</td>' +
						'<td>' + data.info[i].sessions[j].client_ip + '</td>' +
						'<td>' + data.info[i].sessions[j].file + '</td>' +
						'<td>' + formatTime(data.info[i].sessions[j].start_time) + '</td>' +
						'</tr>';
				}
			}
			nodeHtml += tableTr +
				'</tbody>' +
				'</table>' +
				'</div>' +
				'</div>';
		}
		// $('#cifsMonitorModal .main').append(nodeHtml);
		$('#cifsMonitorModal .main').html(nodeHtml);
	}

	//生成分页
	function renderPagination (total, curpage) {
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
				'<a class="js-audit-page" data-target="' + (curpage - 1) + '" aria-label="Previous">' +
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
				html += '<li><a class="js-audit-page" data-target="' + (i + 1) + '">' + (i + 1) + '</a></li>';
			}
		} else {
			html += '<li><a class="js-audit-page" data-target="1">1</a></li>' +
				'<li class="disabled"><a>…</a></li>';
			for (var i = 3; i > 0; i--) {
				html += '<li><a class="js-audit-page" data-target="' + (curpage - i) + '">' + (curpage - i) + '</a></li>';
			}
		}

		//当前页
		html += '<li class="active"><a>' + curpage + '</a></li>';

		if (curpage + nextPages === total) {	//后页无省略
			for (var j = 0; j < nextPages; j++) {
				html += '<li><a class="js-audit-page" data-target="' + (curpage + j + 1) + '">' + (curpage + j + 1) + '</a></li>';
			}
		} else {
			for (var j = 0; j < nextPages - 2; j++) {
				html += '<li><a class="js-audit-page" data-target="' + (curpage + j + 1) + '">' + (curpage + j + 1) + '</a></li>';
			}
			html += '<li class="disabled"><a>…</a></li>' +
				'<li><a class="js-audit-page" data-target="' + total + '">' + total + '</a></li>';
		}

		//下一页
		if (curpage !== total) {
			html += '<li>' +
				'<a class="js-audit-page" data-target="' + (curpage + 1) + '" aria-label="Next">' +
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
})
