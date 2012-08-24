include("test/loadall.js");

var state;
var shutdown;

var WatchTests = Class.create(
{
	testWatch1: function(report)
	{
		var want = "12C";
		root.AppAssistant = Class.create(
		{
			getConfiguration: function()
			{
				return { 
					services: 
					[
						{
							name: "com.palm.test.servicewatch",
							commands:
							[
								{
									name: "sub",
									assistant: "CommandAssistant",
									watch: true
								}
							]
						}
					] 
				};
			}
		});
		root.CommandAssistant = Class.create(
		{
			run: function(future, watch)
			{
				future.now(function(f)
				{
					f.result = { reply: 1 };
				});
				watch && watch.now(function(f)
				{
					f.result = { reply : 2 };
				});
			},

			cleanup: function()
			{
				shutdown += "C";
			}
		});
		var app = new exports.AppController();
		
		state = "";
		shutdown = "";
		Foundations.Comms.PalmCall.call("palm://com.palm.test.servicewatch/", "sub", { watch: true })
			.then(function(future)
			{
				state += future.result.reply;
			})
			.then(function(future)
			{
				state += future.result.reply;
				future.result = null;
			})
			.then(function(future)
			{
				state += shutdown;
				report(state === want ? MojoTest.passed : "Wrong state: want " + want + " got " + state);
			}
		);
	},
	
	testWatch2: function(report)
	{
		var want = "1C";
		//var app = new exports.AppController(); - still launched from last time
		
		state = "";
		shutdown = "";
		Foundations.Comms.PalmCall.call("palm://com.palm.test.servicewatch/", "sub", { watch: true })
			.then(function(future)
			{
				state += future.result.reply;
				Foundations.Comms.PalmCall.cancel(future);
				setTimeout(function()
				{
					future.result = null;
				}, 0.2);
			})
			.then(function(future)
			{
				state += shutdown;
				report(state === want ? MojoTest.passed : "Wrong state: want " + want + " got " + state);
			}
		);
	},
	
	testWatch3: function(report)
	{
		var want = "1C";
		//var app = new exports.AppController(); - still launched from last time
		
		state = "";
		shutdown = "";
		Foundations.Comms.PalmCall.call("palm://com.palm.test.servicewatch/", "sub", {})
			.then(function(future)
			{
				state += future.result.reply;
				Foundations.Comms.PalmCall.cancel(future);
				setTimeout(function()
				{
					future.result = null;
				}, 0.2);
			})
			.then(function(future)
			{
				state += shutdown;
				report(state === want ? MojoTest.passed : "Wrong state: want " + want + " got " + state);
			}
		);
	},
});