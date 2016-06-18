var fs = require('fs');
var path = require('path');
var marked = require('marked');


module.exports = {
	publicClasses: function(context, options)
	{
		'use strict';
		var ret = "";

		for(var i = 0; i < context.length; i++)
		{
			if(!context[i].itemtype && context[i].access === 'public')
			{
				ret = ret + options.fn(context[i]);
			}
			else if(context[i].itemtype)
			{
				ret = ret + options.fn(context[i]);
			}
		}
		return ret;
	},

	codeView: function(context, options)
	{
		return context;
	},

	cleanDisplayName: function(context, options)
	{
		var displayName = context.substr(context.lastIndexOf('.')+1);
		var namespace = context.substr(0, context.lastIndexOf('.'));
		return options.fn({displayName:displayName, namespace:namespace});
	},

	dump: function(context, options, data) {

		function type(value){
			var type = '';
			if( Object.prototype.toString.call( value ) === '[object Array]' ){
				type = 'array';
			} else if(typeof value == 'object' ) {
				type = 'object';
			} else {
				type = 'primitive';
			}

			return type;
		}

		function loop(value, callback){
			if( Object.prototype.toString.call( value ) === '[object Array]' ) {
				for(var i = 0; i < value.length; i++)
				{
					callback(value[i], i);
				}
			} else if(typeof value == 'object' ) {
				for(var i in value)
				{
					callback(value[i], i);
				}
			} else {
				callback(value, 0);
			}
		}

		var dump;
		dump = function(context){
			var self = this;
			var ret = "";
			ret += '<ul>';

			loop(context, function(value, index){
				ret += '<li>';
				ret += 'index: ' + index;
				ret += '<br />';

				if( type(value) != 'primitive' ){
					ret += dump(value);
				} else {
					ret += 'value:' + value;
				}
				data += '</li>';
			});

			ret += '</ul>';
			return ret;
		}

		return dump(context);
	},

	parseDocumentation: function(documentationUrl, options){

		var fileData = '';
		var location = path.resolve(path.dirname(options.data.root.file), documentationUrl);

		if( fs.existsSync(location) ){
			fileData = fs.readFileSync(location, 'utf-8');
		}

		return marked(fileData);
	},

	tree: function(context, options)
	{
		'use strict';

		var createNameSpaceThree = function(namespace, data, obj){
			var arrNamespace = namespace.split('.');
			var name = arrNamespace.shift();

			if(!obj[name]){
				obj[name] = {};
			}

			if( arrNamespace.length > 0 ){
				createNameSpaceThree(arrNamespace.join('.'), data, obj[name] );
			} else {
				obj[name] = data;
			}
		}

		var createNameSpaceHtmlThree = function(three)
		{
			var html = '<ul class="list-unstyled">';
			for(var name in three)
			{
				if( three.hasOwnProperty(name) ){
					html += '<li>';

					var data = three[name];
					if( data.displayName ){
						var data2 = JSON.parse(JSON.stringify(data));
						data2.displayName = data2.displayName.replace(data2.namespace+'.', '');
						html += options.fn(data2);
					} else {
						html += '<strong name="'+data.namespace+'">' + name.replace(data.namespace, '') + '</strong>';
						html += createNameSpaceHtmlThree(data);
					}

					html += '</li>';
				}
			}
			html += '</ul>';

			return html;
		}

		var three = {};

		for(var i = 0; i < context.length; i++)
		{
			var data = context[i];
			createNameSpaceThree(data.name, data, three );
		}

		// generate context
		return createNameSpaceHtmlThree(three);
	},
	search: function(classes, modules)
	{
		'use strict';
		var ret = '';

		for(var i = 0; i < classes.length; i++)
		{
			if(i > 0)
			{
				ret += ', ';
			}
			ret += "\"" + 'classes/' + classes[i].displayName + "\"";
		}

		if(ret.length > 0 && modules.length > 0)
		{
			ret += ', ';
		}

		for(var j = 0; j < modules.length; j++)
		{
			if(j > 0)
			{
				ret += ', ';
			}
			ret += "\"" + 'modules/' + modules[j].displayName + "\"";
		}

		return ret;
	}
};
