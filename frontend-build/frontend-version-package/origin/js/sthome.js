$(function (ev) {
	//1、首页列举所有存储池的使用情况
	var poolcallback = function (result){
		$("#dt_home_topleft1 table:last").LoadData ("hide");
		if (result == undefined)
			return;
		if (result.code == 200) {
			var htm = "";
			var poolData = result.result.pools;
			for (var i = 0; i < poolData.length; i++) {
				var poolstats = poolData[i]['stats'];
				var percent = 0;
				if ( poolstats['bytes_used'] === 0 || poolstats['max_avail'] === 0) {
					percent = 0;
				} else {
					percent = poolstats['bytes_used']*100/poolstats['max_avail'];
					percent = percent.toFixed(2);
				}
				var usedSpace = formatCapacity(poolstats['bytes_used']);
				var totalSpace = formatCapacity(poolstats['max_avail']);
				htm +=  '<tr>'+
							'<td>' + poolData[i]['name'] + '</td>'+
								'<td>'+
								'<div class="homeprogress fl-lt">';
								if ( percent < 90 ) {
							htm += 	'<div class="homeprogressbar progress-bar-info" role="progressbar" aria-valuenow="'+ percent + '" aria-valuemin="0" aria-valuemax="100" style="width: '+ percent +'%">';
								} else {
							htm += 	'<div class="homeprogressbar progress-bar-danger" role="progressbar" aria-valuenow="'+ percent + '" aria-valuemin="0" aria-valuemax="100" style="width: '+ percent +'%">';
								}
								    	if ( percent < 20 ) {
								  htm +='<span style="color:#000;">'+ percent + '%' +'</span>';
								    	}else{
								  htm +='<span>'+ percent + '%' +'</span>';
								    	}
							htm+=	'</div>'+
								'</div>'+
								'<div class="fl-lt" style="margin-left:10px;">'+
									'<span class="js-pool-avail">' + lang.node.system_space_used + usedSpace +'</span>' + '，' + lang.node.system_space_total + '<span class="js-pool-total">' + totalSpace + '</span>' +
								'</div>'+
							'</td>'+
						'</tr>';
			};
			$('tbody.allpool-usedspace-body').html(htm);
		}
	}	
	// setTimeout() ;
	DataModel['listAllPoolsHome'](null, poolcallback, true, null);
	setInterval(function() { DataModel['listAllPoolsHome'](null, poolcallback, true, null); }, 30*1000);

	var listdatastatus = function(result){
		percent = result.result.ratio * 100;
		percent = percent.toFixed(2);
		if (result == undefined) {
			return;
		}	
		if (result.code == 200) {			
			htm = '<tr>'+
						'<td style="color:#52677a;width:15%;">'+lang.data_status+'</td>'+
						'<td>';
							if (percent == 100) {
								htm +='<span style="color:green;">'+lang.normal+'</span>';
							}else{
							htm += '<div class="homeprogress fl-lt">';
									htm += 	'<div class="homeprogressbar progress-bar-info" role="progressbar" aria-valuenow="'+ percent + '" aria-valuemin="0" aria-valuemax="100" style="width: '+ percent +'%">';
										htm +='<span>'+ percent + '%' +'</span>';
									htm +=	'</div>';
								
							htm += '</div>';
						}
						htm += '</td>'+
					'</tr>';
			$('tbody.data_status').html(htm);
		}
	}
	$('#dt_home_topleft1 table:last').LoadData ('show');
	DataModel['recoverget'](null, listdatastatus, true, null);
	setInterval(function() { DataModel['recoverget'](null, listdatastatus, true, null);}, 30*1000);

	// echarts 路径配置
    require.config({
        paths: {
            echarts: 'js/lib/dist/'
        }
    });
	var healthcallback = function (result) {
		$("#whole-state").LoadData ("hide");
		if (result == undefined)
				return;
		if (result.code == 200) {
			var data = result.result;
			//var ishealth = data.overall_status;
			var countnum = data.count;
			var healthData, unHealthData;
			var summary = data.records;
			if ( countnum == 0 ) {
				var html = '';
				html += '<table style="height:90%;width:100%;text-align:center;vertical-align:middle">'+
							'<tr style="height:100%;" title="'+ lang.health +'">'+
								'<td><a><img width="170px" height="170px" src="css/image/healthok.png"/></a></td>'+
							'</tr>'+
						 '</table>';
			} else {
				var html = '';

				html += '<table class="table">'+
							'<thead>'+
								'<tr>'+
									'<th width="20%">' + lang.node.node_name + '</th>'+
									'<th width="20%">' + lang.optlog.alarm_level + '</th>'+
									'<th>' + lang.optlog.detail_info + '</th>'+
								'</tr>'+
							'</thead>'+
							'<tbody class="all-alarm-body">';
						for (var i = 0; i < summary.length; i++) {
							var alarm = summary[i];
							html += '<tr>'+
										'<td>' + alarm['hostname'] + '</td>'+
										'<td>' + alarm['severity'] + '</td>'+
										'<td>' + alarm['description'] + '</td>'+
									'</tr>';
						};
					html+=	'</tbody>'
						'</table>'
			}

			$('#whole-state').html( html );
		} else if (result.code == INFI_STATUS.uninitialized) {}
		else {
		
			//DisplayTips(result.result);
		}
	}

	var alarmpara = {
		    'page' : 0,
		    'perpage' : 0,
		};
	$("#whole-state").LoadData ("show");
	DataModel['listAlarms'](alarmpara, healthcallback, true, null);
	setInterval(function() { DataModel['listAlarms'](alarmpara, healthcallback, true, null); }, 30*1000);

	//查看所有的节点信息
	var allcallback = function (result) {
		$("#dt_home_bottom3 table").LoadData ("hide");
		if (result == undefined)
				return;
		if (result.code == 200) {
			var data = result.result;
			var htm = "";
			for (var i = 0; i < data.length; i++) {
				var node = data[i];
				var hostname, ip, cpupercent, mempercent, storStats, monStats, mdsStats, nasStats;
				hostname = (node['hostname'] != '') ? node['hostname'] : '-';
				ip = (node['ip'] != '') ? node['ip'] :  '-';
				cpupercent = node['cpu_usage'] ;
				cpupercent = parseFloat(cpupercent);
				// cpupercent = cpupercent.toFixed(2);
				mempercent = node['mem_usage'] ;
				mempercent = parseFloat(mempercent);
				// mempercent = mempercent.toFixed(2);
				storStats = (node['storage_status'] != '') ? node['storage_status'] : '-' ;
				monStats = (node['mon_status'] != '') ? node['mon_status'] : '-' ;
				mdsStats = (node['mds_status'] != '') ? node['mds_status'] : '-' ;
				nasStats = (node['nas_status'] != '') ? node['nas_status'] : '-' ;
				htm += '<tr>'+
						'<td>' + hostname + '</td>'+
						'<td>' + ip + '</td>';
				if (cpupercent != 0) {
					htm += '<td>' + cpupercent +'%</td>';
				} else {
					htm += '<td style="color:red;">0</td>';
				}
				if (mempercent != 0) {
					htm += '<td>' + mempercent +'%</td>';
				} else {
					htm += '<td style="color:red;">0</td>';
				}
					if ( storStats == '1' ) {
				htm += '<td style="color:green;">' + getNodeState(storStats) + '</td>';
					}else {
				htm += '<td style="color:red;">' + getNodeState(storStats) + '</td>';
					}

					if ( monStats == '1' ) {
				htm += '<td style="color:green;">' + getNodeState( monStats ) + '</td>';
					} else {
				htm += '<td style="color:red;">' + getNodeState( monStats ) + '</td>';
					}

					if ( mdsStats == '1' ) {
				htm += '<td style="color:green;">' + getNodeState( mdsStats ) + '</td>';
					} else {
				htm += '<td style="color:red;">' + getNodeState( mdsStats ) + '</td>';
					}

					if ( nasStats == '1' ) {
				htm += '<td style="color:green;">' + getNodeState( nasStats ) + '</td>';
					} else {
				htm += '<td style="color:red;">' + getNodeState( nasStats ) + '</td>';
					}
			htm += '</tr>';
			};
			$('.all-nodeinfo-body').html(htm);
		} else if (result.code == INFI_STATUS.uninitialized) {}
		else {
			//DisplayTips(result.result);
		}
	}
	$("#dt_home_bottom3 table").LoadData ("show");
	DataModel['listOverAll'](null, allcallback, true, null);
	setInterval(function() { DataModel['listOverAll'](null, allcallback, true, null); }, 30*1000);
})