(function($){
	function create(state){
		var target = state.target;
		//var state = $.data(target, 'navAside');
		var options = state.options;
		
		$(target).addClass('navAside');

		if (options.data) { 
			$(target).html(createLis(state));
		}
		if (options.url) { 
			loader(state);
		}
		return $(target);
	}

	//创建根节点ul的子元素
	function createLis(state) { 
		var target = state.target;
		var options = state.options;
		var data = options.data;
		if (data.length) { 
			var len = data.length,
				arr = [];
			//创建菜单分类标题
			var createClassify = function(d) { 
				if (d.id) { 
					var id = ' id="_easyBootstrap_navAside_' + d.id + '"';
				}
				return '<a' + id + '>' + 
							'<i class="' + (d.iconCls || '') + '"></i>' + 
							'<span>' + d.text + '</span>' +
							'<i class="pull-right ' + (d.state === 'closed' ? options.collapsibleIcon : options.expandIcon) + '"></i>' + 
						'</a>'
			};
			//定义如何渲染节点的文本
			var formatter = function(d) { 
				options.formatter.call(target, d)
			};
			for (var i = 0; i < len; i++) { 
				var d = data[i];
				formatter(d);
				arr.push('<li>');
				arr.push(createClassify(d));
				(function fn(d) { 
					var child = d.children;
					if (child) { 
						var jlen = child.length;
						arr.push(d.state === 'closed' ? '<ul style="display:none;">' : '<ul>')
						for (var j = 0; j < jlen; j++) { 
							arr.push('<li>');
							formatter(child[j]);
							if (child[j].children) { 
								arr.push(createClassify(child[j]));
								fn(child[j]);
							} else { 
								if (child[j].id) { 
									var id = ' id="_easyBootstrap_navAside_' + child[j].id + '"';
								}
								var url = ' href="' + (child[j].attributes && child[j].attributes.url || '#') + '"';
								arr.push('<a' + id + url + (child[j].checked ? ' class="active"': '') + '>' + child[j].text + '</a>');
							}
							arr.push('</li>');
						}
						arr.push('</ul>');
					}
				})(d);
				arr.push('</li>');
			}
			return arr.join(' ');
		}
	}

	//异步加载数据
	function loader(state) { 
		var options = state.options;
		var target = state.target;
		var url = options.url,
			type = options.method,
			param = options.param;
		if (options.onBeforeLoad.call(target, target, param) == false) return;
		if (url) { 

			$.ajax({ 
				type: type,
				url: url,
				data: param,
				dataType: 'json'
			}).done(function(data) { 
				options.onLoadSuccess.call(target, target, data);
				options.data = data;
				options.loadFilter.call(target, data);
				$(target).html(createLis(state));
			}).fail(function(XMLHttpRequest, textStatus, errorThrown) {
				throw new Error(textStatus);
				options.onLoadError.call(target, XMLHttpRequest, textStatus, errorThrown);
			});
		}
	}

	//返回被点击的节点的相关数据对象
	function getNode(target, clickedEle) { 
		var txt = $(clickedEle).text();
		//var data = state.options.data;
		var data = $.data(target, 'navAside').options.data;
		var obj = {};
		for (var i = 0; i < data.length; i++) { 
			var d = data[i];
			if (d.text === txt) { 
				obj = d;
				break;
			} else { 
				(function fn(d) { 
					var child = d.children;
					if (child) { 
						var jLen = child.length;
						for (var j = 0; j < jLen; j++) { 
							if (child[j].text === txt) { 
								obj = child[j];
								break;
							} else { 
								fn(child[j]);
							}
						}
					}
				})(d);
			}
		}
		obj.target = clickedEle;
		return obj;
	}

	//切换菜单
	function bindEvent(state) { 
		var options = state.options;
		var target = state.target;
		//var timer = null;
		$(document).on('click.navAside', '.navAside li a', function(e) { 
			e.preventDefault();
			var node = getNode(target, this);
			if (node.state === 'closed') {
				if (options.onBeforeExpand.call(target, node) == false) return;
			} else { 
				node.state = 'open';
				if (options.onBeforeCollapse.call(target, node) == false) return;
			}

			var _this = this;
			//clearTimeout(timer);
			//timer = setTimeout(function() { 
				var $this = $(_this);
				var $ul = $this.siblings('ul');
				if (node.state === 'closed') { 
					node.state = 'open';
					options.onExpand.call(target, node);
				} else { 
					node.state = 'closed';
					options.onCollapse.call(target, node);
				}
					options.animate ? $ul.slideToggle() : $ul.toggle();
					$this.children().last().toggleClass(options.collapsibleIcon + ' ' +  options.expandIcon);
				if (!$ul.length) { 
					$this.parents('.navAside').find('a').removeClass('active');
					$this.addClass('active');
				}
				options.onClick.call(state.target, node);
				
			//}, 200);
		});
		/*$(document).on('dblclick.navAside', '.navAside li a', function(e) { 
			e.preventDefault();
			clearTimeout(timer);
			options.onDblClick.call(state.target, getNode(target, this));
		});*/
	}

	//初始化navAside导航菜单
	$.fn.navAside = function(options, param){
		//如果第一个参数是字符串，说明用户在调用progressbar原型上的方法
		if (typeof options == 'string'){
			var method = $.fn.navAside.methods[options];
			if (method){
				return method(this, param);
			}
		}
		
		options = options || {};
		return this.each(function(){
			/*
			 * 获取当前元素上键值为'navAside'的缓存对象
			 * state对象最终保存了合并后的参数options，和初始化后的组件jq元素
			*/
			var state = $.data(this, 'navAside');
			if (state){
				//如果当前元素上有缓存参数对象，把用户传参options合并到state上的options
				$.extend(state.options, options);
			} else {
				//如果没有缓存，则在当前元素上设置键为'navAside'，值为一个新对象，并返回结果
				state = $.data(this, 'navAside', {
					/*
						*键名options为合并后的参数
						*第2个参数$.fn.navAside.defaults为组件默认参数
						*第3个参数$.fn.navAside.parseOptions(this)的返回值为用户在元素上定义的参数
						*第4个参数options为用户js调用时传入的对象参数
						*第4个参数覆盖第3个参数同名属性值，第3个参数覆盖第2个参数同名属性值
					*/
					options: $.extend({}, $.fn.navAside.defaults, $.fn.navAside.parseOptions(this), options),
					target: this
				});
			}
			create(state);
			bindEvent(state);
		});
	};

	function select(container, target){
		$(container).find('a').removeClass('active');
		$(target).addClass('active');
	};
	
	$.fn.navAside.methods = {
		options: function(jq){
			return $.data(jq[0], 'navAside');
		},
		getData: function(jq, clickedEle){
			return getNode(jq[0], clickedEle);
		},
		loadData: function(jq, data) { 
			return $.data(jq[0], 'navAside').options.data;
		},
		select: function(jq, target){
			return jq.each(function(){
				select(this, target);
			});
		}
	};
	
	//合并参数
	$.fn.navAside.parseOptions = function(target){
			/*
			　* $.parser.parseOptions(target)没有传第2个参数properties，是禁用了非data-options的传参形式
			*/
		var obj = $.extend({}, $.parser.parseOptions(target));
		return obj;
	};
	
	//默认参数
	$.fn.navAside.defaults = {
		url: null,
		param: null,
		method: 'get',
		animate: true,
		data: null,
		collapsibleIcon: 'glyphicon glyphicon-menu-right',
		expandIcon: 'glyphicon glyphicon-menu-down',
		formatter: function(node) { //定义如何渲染节点的文本
		},
		loadFilter: function(data){
			return data;
		},

		onClick: function(node){},
		//onDblClick: function(node) {},
		onBeforeLoad: function(node, param){},
		onLoadSuccess: function(node, data) {},
		onLoadError: function() {},
		onBeforeExpand: function(node) {},
		onExpand: function(node) {},
		onBeforeCollapse: function(node) {},
		onCollapse: function(node) {}
	};
})(jQuery);