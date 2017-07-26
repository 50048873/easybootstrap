/**
 * jQuery EasyBootstrap 1.0.0
 * 
 * Copyright (c) 2009-2014 www.jeasyui.com. All rights reserved.
 *
 * Licensed under the GPL license: http://www.gnu.org/licenses/gpl.txt
 * To use it on other terms please contact us at info@jeasyui.com
 *
 */
/**
 * parser - jQuery EasyBootstrap
 * 
 */

(function($){
	$.parser = {
		auto: true,
		onComplete: function(context){},
		plugins:['navAside'],
		parse: function(context){
			var aa = [];
			//循环plugins
			for(var i=0; i<$.parser.plugins.length; i++){
				//获取某个插件名
				var name = $.parser.plugins[i];
				//获取以.easyui-开头的类名元素r
				var r = $('.easyui-' + name, context);
				//如果r存在
				if (r.length){
					//如果r的原型上有name方法
					if (r[name]){
						r[name]();
					//如果没有name方法，说明首页中没有引入easyui.js库
					} else {
						//把插件名和r元素放入aa数组
						aa.push({name:name,jq:r});
					}
				}
			}
			//如果aa数组有长度（代码执行到这，说明首页中没有引入easyui.js库），且window.easyloader为true。这时进入easyloader智能加载流程
			if (aa.length && window.easyloader){
				//获取所有插件名
				var names = [];
				for(var i=0; i<aa.length; i++){
					names.push(aa[i].name);
				}
				//开始智能加载插件
				easyloader.load(names, function(){
					for(var i=0; i<aa.length; i++){
						var name = aa[i].name;
						var jq = aa[i].jq;
						jq[name]();
					}
					//智能加载完成后调用回调
					$.parser.onComplete.call($.parser, context);
				});
			} else {
				//r上的name方法执行完成后调用回调
				$.parser.onComplete.call($.parser, context);
			}
		},
		
		/**
		 * parse options, including standard 'data-options' attribute.
		 * 
		 * calling examples:
		 * $.parser.parseOptions(target);
		 * $.parser.parseOptions(target, ['id','title','width',{fit:'boolean',border:'boolean'},{min:'number'}]);
		 */
		parseOptions: function(target, properties){
			/**
			 * target是组件所在的元素对象
			 * properties是组件api中属性一项中可供用户配置的属性
			 */
			var t = $(target);
			/**
			 * options是此parseOptions方法要返回的值，包含了用户定义在元素上的data-options属性里的键值对，和如value='30'的键值对形式
			 */
			var options = {};
			
			//如果元素上有data-options属性名
			var s = $.trim(t.attr('data-options'));
			if (s){
				if (s.substring(0, 1) != '{'){
					s = '{' + s + '}';
				}
				options = (new Function('return ' + s))();
			}
			
			
			//传入的第二个参数properties，是预先定义给用户可配置的数组
			if (properties){
				//此处opts是为了获取元素上以非'data-options'方式保存的相应的属性定义，如style="height:30px;"（字符串）, value='30'（对象）
				var opts = {};
				for(var i=0; i<properties.length; i++){
					//获取每项参数
					var pp = properties[i];
					//如果是字符串
					if (typeof pp == 'string'){
						//如果是这几个字符
						if (pp == 'width' || pp == 'height' || pp == 'left' || pp == 'top'){
							//获取当前元素的样式中包含上面几个字符的样式值并转成数字，获取不到就是undefined
							opts[pp] = parseInt(target.style[pp]) || undefined;
						} else {
							//获取元素上非样式的对应属性
							opts[pp] = t.attr(pp);
						}
					} else {
						//否则就是对象
						for(var name in pp){
							var type = pp[name];
							if (type == 'boolean'){
								opts[name] = t.attr(name) ? (t.attr(name) == 'true') : undefined;
							} else if (type == 'number'){
								opts[name] = t.attr(name)=='0' ? 0 : parseFloat(t.attr(name)) || undefined;
							}
						}
					}
				}
				$.extend(options, opts);
			}
			return options;
		}
	};
	$(function(){
		if ($.parser.auto){
			$.parser.parse();
		}
	});
})(jQuery);