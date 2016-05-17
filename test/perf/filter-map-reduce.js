var Benchmark = require('benchmark');
var most = require('../../most');
var rx = require('rx');
var rxjs = require('@reactivex/rxjs')
var kefir = require('kefir');
var bacon = require('baconjs');
var highland = require('highland');
var lodash = require('lodash');

var runners = require('./runners');
var kefirFromArray = runners.kefirFromArray;

// Create a stream from an Array of n integers
// filter out odds, map remaining evens by adding 1, then reduce by summing
var n = runners.getIntArg(24*7);
var a = new Array(n);
for (var i = 0; i < a.length; ++i) {
    a[i] = { data: i, other: i % 2 === 0 };
}

var suite = Benchmark.Suite('filter -> map -> reduce ' + n + ' integers');
var options = {
    defer: true,
    onError: function(e) {
        e.currentTarget.failure = e.error;
    }
};

suite
	 .add('array2', function(deferred) {
        runners.runArray(deferred, runArray2);
    }, options)
    .add('most', function(deferred) {
        runners.runMost(deferred, most.from(a).filter(even).map(add1).reduce(sum, {}));
    }, options)
    //.add('rx 4', function(deferred) {
    //    runners.runRx(deferred, rx.Observable.fromArray(a).filter(even).map(add1).reduce(sum, 0));
    //}, options)
    .add('rx 5', function(deferred) {
        runners.runRx5(deferred,
            rxjs.Observable.from(a).filter(even).map(add1).reduce(sum, 0));
    }, options)
    //.add('kefir', function(deferred) {
    //    runners.runKefir(deferred, kefirFromArray(a).filter(even).map(add1).scan(sum, 0).last());
    //}, options)
    //.add('bacon', function(deferred) {
    //    runners.runBacon(deferred, bacon.fromArray(a).filter(even).map(add1).reduce(0, sum));
    //}, options)
    //.add('highland', function(deferred) {
    //    runners.runHighland(deferred, highland(a).filter(even).map(add1).reduce(0, sum));
    //}, options)
    .add('lodash', function(deferred) {
        runners.runLodash(deferred, runLodash);
    }, options)
    .add('array', function(deferred) {
        runners.runArray(deferred, runArray);
    }, options);

runners.runSuite(suite);

function add1(x) {
    x.data += 1;
    return x;
}

function even(x) {
    return x.data % 2 === 0;
}

function sum(acc, y) {
   acc.data =+ y.data;
   if (!acc.others) acc.others = [];
   acc.others.push(y.other);
   return acc;
}

function add12(x) {
    return x + 1;
}

function even2(x) {
    return x % 2 === 0;
}

function sum2(x, y) {
    return x + y;
}

function runLodash(cb) {
    return lodash.chain(a).filter(even).map(add1).reduce(sum, {}).value();
}

function runArray(cb) {
    return a.filter(even).map(add1).reduce(sum, {});
}

function runLodash3(cb) {
    return lodash.chain(a).filter(even).map(add1).reduce(sum, 0).value();
}

function runArray3(cb) {
    return a.filter(even).map(add1).reduce(sum, 0);
}

function runArray2() {
	let x1 = [];
	for(var i=0, n=a.length; i < n; i++) {
		if(even(a[i])===true) x1.push(a[i]);
	}

	let x2 = x1;//new Array(x1.length); //new Array(x1.length);
	for(var i=0, n=x1.length; i < n; i++) {
        const v = x1[i];
		x2[i] = add1(v);
	}


	let reduce = 0;
	for(var i=0, n=x1.length; i < n; i++) {
        const v = x2[i];
		reduce = sum(reduce, v);
	}

	return reduce;
}