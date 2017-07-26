(function($){
	function getUrlData(state) { 
		var options = state.options;
		return $.ajax({ 
			type: options.method,
			url: options.url
		});
	}

	function init(state) { 
		var $target = state.$target;

		$target.addClass('treeTable table table-bordered table-hover');
		$target.append(initThead(state));

		if (state.options.url) { 
			getUrlData(state)
				.done(function(res) { 
					state.options.data = res.data;
					$target.find('#loading').remove();
					$target.append(initTbody(state));
				})
				.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
					$.error(XMLHttpRequest.status)
				});
		} else { 
			$target.append(initTbody(state));
		}
		
	}

	function initThead(state) { 
		var columns = state.options.columns,
			cLen = columns.length,
			ths = [];

		state.options.rownumbers && ths.push('<th style="width:30px;"></th>');

		for (var i = 0; i < cLen; i++) { 
			var title = (columns[i].title);
			
			if (title) { 
				ths.push('<th>' + title + '</th>');
			} else { 
				$.error('参数columns中没有title');
			}
		}

		if (state.options.rownumbers) { 
			cLen += 1;
		}

		var loading = state.options.url && '<tr id="loading"><th class="text-center" colspan="' + cLen + '">加载中<span class="dotting"></span></th></tr>';

		return '<thead><tr>' + ths + '</tr>' + loading + '</thead>';
	}

	function initTbody(state) { 
		var datas = state.options.data,
			dLen = datas.length,
			trs = [],
			id = 1,
			treeField = state.options.treeField,
			idField = state.options.idField,
			toString = Object.prototype.toString;

		var getTd = function(data, column) { 
			var field = column.field;
			if (field === treeField) { 
				var collapsibleIcon = state.options.collapsibleIcon;
				var hasChild = data.functions.length;
				var funname = '<td class="indent-' + data.functionlevel + '">' + 
							(hasChild ? '<span><i class="' + collapsibleIcon + '"></i></span>' : '') +
							'<span>' + data[field] + '</span>' +
						'</td>';
				return funname;
			} else if (field === 'operate') { 
				var formatter = column.formatter;
				if (toString.call(formatter) === "[object String]") { 
					return '<td>' + formatter + '</td>';
				} else if (toString.call(formatter) === "[object Array]") { 
					return '<td>' + formatter.join('') + '</td>';;
				} else if (toString.call(formatter) === "[object Function]") { 
					return '<td>' + formatter() + '</td>';
				}
			} else { 
				return '<td>' + data[field] + '</td>';
			}
		};

		var getTds = function(data) { 
			var columns = state.options.columns,
				cLen = columns.length,
				tds = [];
			tds.push(state.options.rownumbers && '<td>' + (id++) + '</td>');
			for (var i = 0; i < cLen; i++) { 
				tds.push(getTd(data, columns[i]));
			}

			return tds.join('');
		};

		for (var i = 0; i < dLen; i++) { 
			var data = datas[i];
			trs.push('<tr' + (idField ? ' id="' + data[idField] + '"' : '') + '>');
			trs.push(getTds(data));
			(function fn(data) { 
				var data = data.functions;
				if (data) { 
					var jlen = data.length;
					for (var j = 0; j < jlen; j++) { 
						trs.push('<tr style="display:none;"' + (idField ? ' id="' + data[j][idField] + '"' : '') + '>');
						trs.push(getTds(data[j]));
						if (data[j].functions) { 
							fn(data[j]);
						}
						trs.push('</tr>');
					}
				}
			})(data);
			trs.push('</tr>');
		}
		return '<tbody>' + trs.join('') + '</tbody>';
	}

	function bindEvent() { 
		$('body').on('click', '.glyphicon-minus, .glyphicon-plus', function(e) { 
			var $this = $(this),
				nextUntil = null;
			$this.toggleClass('glyphicon-plus glyphicon-minus');
			
			if ($this.hasClass('glyphicon-minus')) { 
				nextUntil = $this.parents('tr').nextUntil('tr:visible');
				nextUntil.show(200).attr('expand', 'true');
			} else { 
				nextUntil = $this.parents('tr').nextUntil('tr[expand!="true"]');
				nextUntil.hide(200).removeAttr('expand');
			}
		});
	}
	
	$.fn.treeTable = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.treeTable.methods[options];
			if (method){
				return method(this, param);
			}
		}
		
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'treeTable');
			if (state){
				$.extend(state.options, options);
			} else {
				state = $.data(this, 'treeTable', {
					options: $.extend({}, $.fn.treeTable.defaults, $.fn.treeTable.parseOptions(this), options),
					$target: $(this)
				});
			}
			init(state);
			bindEvent();
		});
	};

	$.fn.treeTable.methods = {
		
	};
	
	//合并参数
	$.fn.treeTable.parseOptions = function(target){
		var obj = $.extend({}, $.parser.parseOptions(target));
		return obj;
	};
	
	//默认参数
	$.fn.treeTable.defaults = {
		url: null,
		data: null,
		collapsibleIcon: 'glyphicon glyphicon-plus',
		expandIcon: 'glyphicon glyphicon-minus',
		rownumbers: false,
		treeField: null,
		idField: null,
		method: 'GET'
	};
})(jQuery);