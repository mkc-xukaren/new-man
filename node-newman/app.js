var newman = require('newman'), fs = require('fs');
	
 fs.readdir('./testScript', function (err, files) {
     if (err) { throw err; }

     files = files.filter(function (file) {
         return (file.substr(-5) === '.json');
     });
	 	  
     // now wer iterate on each file name and call newman.run using each file name
     files.forEach(function (file) {
		 for (var index = 0; index < 20; index++){
			 console.log("run test: " + index)
			 newman.run({
				 collection: require(`${__dirname}/testScript/${file}`),
				 //collection: require('./testScript/MK.Community.Article.Service.copy.postman_collection.json'),
				 iterationCount: 2,
				 reporters: 'json'
			 }, function (err) {
			 if (err) { throw err; }
				console.log('collection run complete!');
			 });
			
			 console.error("index------------: " + index + "is finished")
		}	
    }); 
 });
//http://www.tuicool.com/articles/F7JrMjj