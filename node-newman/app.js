var newman = require('newman'); // require newman in your project
var fs=require('fs');

var file_name = './testScript/MK_Community_Share_Internal_Service.json';
//var file_environment='./testScript/MK.Community.Weather.API.postman_environment.json';
//console.log("run test: " + file_name);

var collection = require(file_name);
//var file_environments=require(file_environment);

var csv = require('fast-csv');

var async = require("async");

var promises = [];

//process.env.UV_THREADPOOL_SIZE = 10

for (var index = 0; index <1; index++) {
    promises.push(run_test_script())
}

Promise.all(promises).then(function() {
    console.log("run test completed. " )
    console.log("" )
    getResult();


}, function(err) {
    // error occurred
}).then(function(){
   // deleteFile('./newman')
},function(err){});

function run_test_script() {
    return new Promise(function (resolve, reject) {
        newman.run({
            collection: collection,
            //environment:file_environments,
            iterationCount: 1,
            reporters: 'cli'
        }, function (err) {
            if (err) { return reject(err) }
            resolve()
        });
    })
}

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] == obj) {
            return true;
        }
    }
    return false;
}

function getJson(jsonReult){

    var total=new Object();
    var info = new Object();
    var project =new Object();

    var apiInfo=new Array();

    var projectArray=new Array();

    var totalTime=0;

    for(var k=0;k<jsonReult.run.executions.length;k++){
        //infoArray[m].testUrlInfo[j].url == jsonReult.run.executions[k].item.request.url
        var hasRepeatResultst=false;
        for(var j=0;j<apiInfo.length;j++){
            if(apiInfo[j].url==jsonReult.run.executions[k].item.request.url){
                //console.log("old")
                apiInfo[j].responseTime+=jsonReult.run.executions[k].response.responseTime;
                //apiInfo[j].responseSize+=","+jsonReult.run.executions[k].response.responseSize;
                totalTime+=jsonReult.run.executions[k].response.responseTime;

                apiInfo[j].count+=1;
                hasRepeatResultst=true;
                if(jsonReult.run.executions[k].response.responseTime>apiInfo[j].maxtime){
                    apiInfo[j].maxtime=jsonReult.run.executions[k].response.responseTime;
                }
                if(jsonReult.run.executions[k].response.responseTime<apiInfo[j].mintime){
                    apiInfo[j].mintime=jsonReult.run.executions[k].response.responseTime;
                }

                break;
            }
        }
        if(!hasRepeatResultst){
            //console.log("new")
            var api = new Object();
            api.url=jsonReult.run.executions[k].item.request.url;
            api.responseTime=jsonReult.run.executions[k].response.responseTime;
            api.responseSize=jsonReult.run.executions[k].response.responseSize;

            totalTime+=jsonReult.run.executions[k].response.responseTime;

            api.maxtime=jsonReult.run.executions[k].response.responseTime;
            api.mintime=jsonReult.run.executions[k].response.responseTime;
            api.count=1

            apiInfo.push(api);
        }
    }

    //project.name=jsonReult.collection.info.name;

    //project.testUrl=apiInfo;

    total.iterationsExecuted=jsonReult.run.stats.iterations.total;
    total.iterationsFailed=jsonReult.run.stats.iterations.failed;

    total.requestsExecuted=jsonReult.run.stats.requests.total;
    total.requestsFailed=jsonReult.run.stats.requests.failed;

    total.testScriptsExecuted=jsonReult.run.stats.testScripts.total;
    total.testScriptsFailed=jsonReult.run.stats.testScripts.failed;

    total.prerequestExecuted=jsonReult.run.stats.prerequestScripts.total;
    total.prerequestFailed=jsonReult.run.stats.prerequestScripts.failed;

    total.assertionsExecuted=jsonReult.run.stats.assertions.total;
    total.assertionsFailed=jsonReult.run.stats.assertions.failed;

    total.totalRunDuration=totalTime
    total.totalDataReceived=jsonReult.run.transfers.responseTotal;
    total.AverageresponseTime=jsonReult.run.timings.responseAverage;
    total.runCount=1;
    //total.totalRunDuration=(tatalTime/1000).toFixed(1)+'s';
    //total.totalDataReceived=(jsonReult.run.transfers.responseTotal/1024).toFixed(1)+'kb';
    //total.AverageresponseTime=(jsonReult.run.timings.responseAverage/1000).toFixed(1)+'s';

    projectArray.push(project);
    info.testScriptName=jsonReult.collection.info.name;
    //info.project=projectArray;
    info.testUrlInfo=apiInfo;
    info.testTotalInfo=total;

    return info;
}

function getResult(){
    fs.readdir('./newman',function(err, files){
        if (err) { throw err; }

        files = files.filter(function (file) {
            return (file.substr(-5) === '.json');
        });

        var testScriptsName = new Array();

        var finalInfo=new Object();

        var infoArray=new Array();

        var projectArray=new Array();

        for(var i=0;i<files.length;i++){

            var jsonReult=require('./newman/'+files[i]);

            if(i==0||!contains(testScriptsName,jsonReult.collection.info.name))
            {
                //console.log("new");
                testScriptsName.push(jsonReult.collection.info.name);

                var info= new Object();
                info=getJson(jsonReult);
                infoArray.push(info);
            }else{
                //console.log("old");

                for(var m=0;m<infoArray.length;m++)
                    //infoArray.forEach(function(projectJsonCollection)
                {
                    var taotalTime = 0;
                    //projectJsonCollection.project.forEach(function(projectJson){
                    //console.log(projectJson)

                    for (var j = 0; j < infoArray[m].testUrlInfo.length; j++) {
                        for (var k = 0; k < jsonReult.run.executions.length; k++) {
                            if (infoArray[m].testUrlInfo[j].url == jsonReult.run.executions[k].item.request.url) {
                                //console.log(infoArray[m].testUrlInfo[j].url+"="+jsonReult.run.executions[k].item.request.url)
                                infoArray[m].testUrlInfo[j].responseTime += jsonReult.run.executions[k].response.responseTime;
                                //infoArray[m].testUrlInfo[j].responseSize+=","+jsonReult.run.executions[k].response.responseSize;
                                //infoArray[m].testUrlInfo[j].count+=1;
                                taotalTime += jsonReult.run.executions[k].response.responseTime;
                                infoArray[m].testUrlInfo[j].count+=1;

                                if(jsonReult.run.executions[k].response.responseTime>infoArray[m].testUrlInfo[j].maxtime){
                                    infoArray[m].testUrlInfo[j].maxtime=jsonReult.run.executions[k].response.responseTime;
                                }
                                if(jsonReult.run.executions[k].response.responseTime<infoArray[m].testUrlInfo[j].mintime){
                                    infoArray[m].testUrlInfo[j].mintime=jsonReult.run.executions[k].response.responseTime;
                                }
                            }
                        }
                    }

                    if (jsonReult.collection.info.name == infoArray[m].testScriptName) {
                        //console.log("11111");

                        //projectJsonCollection.testTotalInfo.
                        infoArray[m].testTotalInfo.iterationsExecuted +=  jsonReult.run.stats.iterations.total;
                        infoArray[m].testTotalInfo.iterationsFailed +=  jsonReult.run.stats.iterations.failed;

                        infoArray[m].testTotalInfo.requestsExecuted +=  jsonReult.run.stats.requests.total;
                        infoArray[m].testTotalInfo.requestsFailed +=jsonReult.run.stats.requests.failed;

                        infoArray[m].testTotalInfo.testScriptsExecuted +=  + jsonReult.run.stats.testScripts.total;
                        infoArray[m].testTotalInfo.testScriptsFailed += + jsonReult.run.stats.testScripts.failed;

                        infoArray[m].testTotalInfo.prerequestExecuted +=  + jsonReult.run.stats.prerequestScripts.total;
                        infoArray[m].testTotalInfo.prerequestFailed +=  + jsonReult.run.stats.prerequestScripts.failed;

                        infoArray[m].testTotalInfo.assertionsExecuted +=  + jsonReult.run.stats.assertions.total;
                        infoArray[m].testTotalInfo.assertionsFailed +=  + jsonReult.run.stats.assertions.failed;

                        infoArray[m].testTotalInfo.totalRunDuration +=  taotalTime;
                        infoArray[m].testTotalInfo.totalDataReceived += jsonReult.run.transfers.responseTotal;
                        infoArray[m].testTotalInfo.AverageresponseTime += jsonReult.run.timings.responseAverage;
                        infoArray[m].testTotalInfo.runCount+=1;
                    }
                }
            }
        }

        finalInfo.projects=infoArray;


        var finalInfoStr = JSON.stringify(finalInfo);
        //console.log(finalInfoStr);

        //将对象转换为json格式
        console.log('------------------------Url test detail      -------------------------------------')
        //console.log(infoArray[0].testUrlInfo);
        var csvArray=new Array();
        infoArray[0].testUrlInfo.forEach(function(testInfo){
            var csv=new Object();
            csv.url=testInfo.url;
            csv.responseMaxTime=testInfo.maxtime+"ms";
            csv.responseMinTime=testInfo.mintime+"ms";
            csv.responseAvergeTime=(testInfo.responseTime/testInfo.count).toFixed(1)+"ms";
            csv.responseSize=testInfo.responseSize+'b';
            csv.requestCount=testInfo.count;
            csvArray.push(csv);
            console.log("url:"+testInfo.url);
            console.log("responseMaxTime:"+testInfo.maxtime+"ms");
            console.log("responseMinTime:"+testInfo.mintime+"ms");
            console.log("responseTime:"+(testInfo.responseTime/testInfo.count).toFixed(1)+"ms");
            console.log("responseSize:"+testInfo.responseSize+'b');
            console.log("requestCount:"+testInfo.count);
            console.log('-----------------------------------------------------------------')
        });
        console.log('------------------------end-------------------------------------')
        console.log("");
        console.log("");
        console.log('-----------------------------------------------------------------')
        console.log("                    	 executed        |      failed                     ")
        console.log('-----------------------------------------------------------------')
        console.log("iterations	   	 executed:"+infoArray[0].testTotalInfo.iterationsExecuted+"		failed:"+infoArray[0].testTotalInfo.iterationsFailed);
        console.log('-----------------------------------------------------------------')
        console.log("request	   	 	 executed:"+infoArray[0].testTotalInfo.requestsExecuted+"		failed:"+infoArray[0].testTotalInfo.requestsFailed);
        console.log('-----------------------------------------------------------------')
        console.log("test-scripts	   	 executed:"+infoArray[0].testTotalInfo.testScriptsExecuted+"		failed:"+infoArray[0].testTotalInfo.testScriptsFailed);
        console.log('-----------------------------------------------------------------')
        console.log("prerequest-scripts	 executed:"+infoArray[0].testTotalInfo.prerequestExecuted+"		failed:"+infoArray[0].testTotalInfo.prerequestFailed);
        console.log('-----------------------------------------------------------------')
        console.log("assertions		 executed:"+infoArray[0].testTotalInfo.assertionsExecuted+"		failed:"+infoArray[0].testTotalInfo.assertionsFailed);
        console.log('-----------------------------------------------------------------')
        console.log("total run duration: "+(infoArray[0].testTotalInfo.totalRunDuration/1000).toFixed(1)+"s");
        console.log('-----------------------------------------------------------------')
        console.log("total data received: "+(infoArray[0].testTotalInfo.totalDataReceived/1024).toFixed(1)+"kb");
        console.log('-----------------------------------------------------------------')
        console.log("average response time: "+(infoArray[0].testTotalInfo.AverageresponseTime/infoArray[0].testTotalInfo.runCount).toFixed(1)+"ms");
        console.log('-----------------------------------------------------------------')


        CreateCSV( csvArray);

        //res.writeHead(200, {'Content-Type': 'application/json'});
        //res.end(finalInfoStr);

        // console.log("total run duration:");
        // console.log("total data received:"+jsonReult.run.transfers.responseTotal/1024);
        // console.log("average response time:"+jsonReult.run.timings.responseAverage);
    });
}


var stream = null;
var paramArgus = process.argv.splice(2);
if(!paramArgus || paramArgus.length == 0){
    stream = fs.createWriteStream("./CSV/new.csv");
}else{
    stream = fs.createWriteStream(paramArgus[0]);
}
stream.on("finish", function(){
    console.log("dump to csv ok!");
});


function CreateCSV(jsonContent){
    csv.write(jsonContent, {headers: true}).pipe(stream);
}

function deleteFile(path) {

    var files = [];

    if( fs.existsSync(path) ) {

        files = fs.readdirSync(path);

        files.forEach(function(file,index){

            var curPath = path + "/" + file;

            if(fs.statSync(curPath).isDirectory()) { // recurse

                deleteFolderRecursive(curPath);

            } else { // delete file

                fs.unlinkSync(curPath);

            }

        });

        fs.rmdirSync(path);

    }

}
