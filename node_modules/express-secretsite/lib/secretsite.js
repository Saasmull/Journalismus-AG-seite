var fs = require('fs');
var path = require('path');
var url = require('url');

var defaultOptions =
{
	entryPoint: "/unlock-access/",
	password: "guest",
	ipHeader: null,
	passwordInputPagePath: path.resolve(__dirname, "..", "data", "passwordForm.html"),
	passwordConfirmationPath: path.resolve(__dirname, "..", "data", "passwordConfirmation.html"),
	respondWith403: false
};

module.exports = function(incomingOptions)
{
	//import options, loading defaults first and replacing specified options
	var options = defaultOptions;
	for(var option in incomingOptions || {})
	{
		if(incomingOptions[option]!==undefined)
		{
			options[option] = incomingOptions[option];
		}
	}

	//declare list of allowed IPs for this instance of the secret site
	var allowedIPs = [];

	//load the password form content
	var passwordFormContent = fs.readFileSync(options.passwordInputPagePath, 'utf8');
	var passwordConfirmationContent = fs.readFileSync(options.passwordConfirmationPath, 'utf8');

	//return the actual middleware function
	return function(req,res,next)
	{
		//get the incoming ip
		var ip = req.headers[options.ipHeader] || req.connection.remoteAddress;

		//if the IP is allowed, move to the next middleware
		if(allowedIPs.indexOf(ip) != -1)
		{
			next();
			return;
		}

		//parse the url components
		var urlComponents = url.parse(req.url, true);

		//is the url allowed?
		if(!options.entryPoint || urlComponents.pathname == options.entryPoint)
		{
			if(urlComponents.query.password == options.password)
			{
				//add them to the allowed IPs list
				allowedIPs.push(ip);

				//display the password confirmation
				res.statusCode = 200;
				res.end(passwordConfirmationContent);
				return;
			}

			//display the password form
			res.statusCode = 200;
			res.end(passwordFormContent);
		}

		if(options.respondWith403)
		{
			res.statusCode = 403;
			res.end("<h1>403 - Forbidden</h1><p>You do not have permission to see this page.</p>");
		}
	}
};