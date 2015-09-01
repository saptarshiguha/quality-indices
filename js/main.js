(function() {
    'use strict'

    $('ul.switch li a.pill').on('click', function(event) {
        event.preventDefault();
        $('ul.switch li a.pill').removeClass('active');
        $(this).addClass('active');

        var section = $(this).attr('id').slice(5);
        document.location.hash = section;

        //switch content
        $('.charts').addClass('hidden');
        $('.charts.' + section).removeClass('hidden');

        return false;
    });

    var mouseover = function() {
        return function(d, i) {
            d3.select('.revision-data')
                .html('Revision <a target="_blank" href="https://hg.mozilla.org/mozilla-central/rev/' + d.revision + '">' + d.revision + '</a> analyzed on ' + d.date);
        };
    }

    d3.json('data/avgForSuiteBucket.json', function(dataSuiteBucket) {
    d3.json('data/avgForSuites.json', function(dataSuite) {
    d3.json('data/importanceCoef.json', function(dataImportanceCoef) {
    d3.json('data/avgForSuiteAndHW.json', function(dataHw) {
        var dataSuiteBucketNested = nestBy(dataSuiteBucket, 'suiteBucket');
        var dataSuiteNested = nestBy(dataSuite, 'suiteBucket', 'suite');

        //draw each of the charts for suite buckets
        dataSuiteBucketNested.forEach(function(chart, i) {
            MG.data_graphic({
                title: chart.key,
                data: chart.values,
                width: 500,
                height: 250,
                area: false,
                inflator: 1.6,
                decimals: 4,
                y_extended_ticks: true,
                show_confidence_band: ['idxUnscaledLB', 'idxUnscaledUB'],
                target: '#' + chart.key,
                x_accessor: 'date',
                y_accessor: 'idxUnscaledLoess'
            });
        });

        //draw each of the charts for suites
        dataSuiteNested.forEach(function(chart, i) {
            var data_chart = [];
            var legend = [];
            chart.values.forEach(function(suite) {
                legend.push((suite.key.length > 20) ? suite.key.substring(0,20) + '...' : suite.key);
                data_chart.push(suite.values);
            });

            MG.data_graphic({
                title: chart.key,
                data: data_chart,
                width: 600,
                height: 250,
                area: false,
                right: 100,
                inflator: 1.6,
                decimals: 4,
                y_extended_ticks: true,
                show_confidence_band: ['idxUnscaledLB', 'idxUnscaledUB'],
                target: '#suites-' + chart.key,
                x_accessor: 'date',
                y_accessor: 'idxUnscaledLoess',
                legend: legend
            });
        });

        //draw each of the charts for regressions by suite
        dataSuiteBucketNested.forEach(function(chart, i) {
            var data_regressions = [];
            var suite_names = [];
            dataImportanceCoef.forEach(function(d) {
                var suite_regression = d.reg['bu' + chart.key];
                suite_regression.dateFrom = new Date(d.dateFrom);
                data_regressions.push(suite_regression);
            });

            var arr = [];
            if(data_regressions.length > 0) {
                suite_names = Object.keys(data_regressions[0]);
                suite_names.sort();

                arr = [];
                suite_names.forEach(function(d) {
                    if(d !== 'overall' && d !== 'dateFrom') {
                        arr.push(d);
                    }
                });
            }

            MG.data_graphic({
                title: chart.key,
                data: data_regressions,
                width: 600,
                height: 250,
                area: false,
                right: 100,
                inflator: 1.6,
                format: 'perc',
                interpolate: 'basic',
                max_y: 1.1,
                y_extended_ticks: true,
                target: '#regressions-by-suite-' + chart.key,
                x_accessor: 'dateFrom',
                y_accessor: arr,
                legend: arr
            });
        });

        //draw each of the charts for improvements by suite
        dataSuiteBucketNested.forEach(function(chart, i) {
            var data_improvements = [];
            var suite_names = [];
            dataImportanceCoef.forEach(function(d) {
                var suite_improvements = d.imp['bu' + chart.key];
                suite_improvements.dateFrom = new Date(d.dateFrom);
                data_improvements.push(suite_improvements);
            });

            var arr = [];
            if(data_improvements.length > 0) {
                suite_names = Object.keys(data_improvements[0]);
                suite_names.sort();

                arr = [];
                suite_names.forEach(function(d) {
                    if(d !== 'overall' && d !== 'dateFrom') {
                        arr.push(d);
                    }
                });
            }

            MG.data_graphic({
                title: chart.key,
                data: data_improvements,
                width: 600,
                height: 250,
                area: false,
                right: 100,
                inflator: 1.6,
                format: 'perc',
                interpolate: 'basic',
                max_y: 1.1,
                y_extended_ticks: true,
                target: '#improvements-by-suite-' + chart.key,
                x_accessor: 'dateFrom',
                y_accessor: arr,
                legend: arr
            });
        });
        
        //draw each of the charts for regressions
        (function() {
            var data_regressions = [];
            dataImportanceCoef.forEach(function(d) {
                var datum = {};
                datum.dateFrom = new Date(d.dateFrom);
                datum.fsuite = d.reg.fsuite;
                datum.fmachine = d.reg.fmachine;
                datum.foch = d.reg.foch;
                datum.bustartup = d.reg.bustartup.overall;
                datum.bupageload = d.reg.bupageload.overall;
                datum.burendering = d.reg.burendering.overall;
                datum.buscrolling = d.reg.buscrolling.overall;
                datum.bujavascript = d.reg.bujavascript.overall;
                
                data_regressions.push(datum);
            });

            MG.data_graphic({
                data: data_regressions,
                width: 800,
                height: 250,
                area: false,
                right: 100,
                inflator: 1.6,
                format: 'perc',
                interpolate: 'basic',
                max_y: 1.1,
                y_extended_ticks: true,
                target: '#regressions',
                x_accessor: 'dateFrom',
                y_accessor: ['fsuite', 'fmachine', 'foch'],
                legend: ['fsuite', 'fmachine', 'foch']
            });

            MG.data_graphic({
                data: data_regressions,
                width: 800,
                height: 250,
                area: false,
                right: 100,
                inflator: 1.6,
                format: 'perc',
                interpolate: 'basic',
                max_y: 1.1,
                y_extended_ticks: true,
                target: '#regressions-by-suite-bucket',
                x_accessor: 'dateFrom',
                y_accessor: ['bustartup', 'bupageload', 'burendering', 'buscrolling', 'bujavascript'],
                legend: ['startup', 'pageload', 'rendering', 'scrolling', 'javascript']
            });
        })();
        
        //draw each of the charts for improvements
        (function() {
            var data_improvements = [];
            dataImportanceCoef.forEach(function(d) {
                var datum = {};
                datum.dateFrom = new Date(d.dateFrom);
                datum.fsuite = d.imp.fsuite;
                datum.fmachine = d.imp.fmachine;
                datum.foch = d.imp.foch;
                datum.bustartup = d.imp.bustartup.overall;
                datum.bupageload = d.imp.bupageload.overall;
                datum.burendering = d.imp.burendering.overall;
                datum.buscrolling = d.imp.buscrolling.overall;
                datum.bujavascript = d.imp.bujavascript.overall;
                
                data_improvements.push(datum);
            });

            MG.data_graphic({
                data: data_improvements,
                width: 800,
                height: 250,
                area: false,
                right: 100,
                inflator: 1.6,
                format: 'perc',
                interpolate: 'basic',
                max_y: 1.1,
                y_extended_ticks: true,
                target: '#improvements',
                x_accessor: 'dateFrom',
                y_accessor: ['fsuite', 'fmachine', 'foch'],
                legend: ['fsuite', 'fmachine', 'foch']
            });

            MG.data_graphic({
                data: data_improvements,
                width: 800,
                height: 250,
                area: false,
                right: 100,
                inflator: 1.6,
                format: 'perc',
                interpolate: 'basic',
                max_y: 1.1,
                y_extended_ticks: true,
                target: '#improvements-by-suite-bucket',
                x_accessor: 'dateFrom',
                y_accessor: ['bustartup', 'bupageload', 'burendering', 'buscrolling', 'bujavascript'],
                legend: ['startup', 'pageload', 'rendering', 'scrolling', 'javascript']
            });
        })();

        //draw each of the charts for our raw data
        (function() {
            var dataHwNested = nestBy(dataHw, 'suiteBucket', 'suite', 'machine_platform');
            dataHwNested.forEach(function(chart, i) {
                //build legend
                var legend = [];
                var platforms = [];
                chart.values.forEach(function(platform, i) {
                    //each platform.values element is a series for a machine-suite combo
                    //create a new array, push to it those series as naked arrays
                    platform.values.forEach(function(platform_machine, i) {
                        //console.log(platform);
                        legend.push(platform.key + '-' + platform_machine.key);
                        platforms.push(platform_machine.values);
                    });
                });
                
                console.log(chart.key, legend, platforms);
            
                MG.data_graphic({
                    title: chart.key,
                    data: platforms,
                    width: 600,
                    height: 250,
                    area: false,
                    right: 100,
                    inflator: 1.6,
                    decimals: 4,
                    y_extended_ticks: true,
                    //show_confidence_band: ['idxUnscaledLB', 'idxUnscaledUB'],
                    target: '#raw-' + chart.key,
                    x_accessor: 'date',
                    y_accessor: 'ag',
                    interpolate: 'basic',
                    legend: legend
                });
            });
        })();

        //hide 'suites' charts on page load
        
        //set the active pill and section on first load
        var section = (document.location.hash) ? document.location.hash.slice(1) : 'suite-buckets';
        $('.charts').addClass('hidden');
        $('.charts').css('opacity', 1);
        $('.charts.' + section).removeClass('hidden');
        $('.switch li a#goto-' + section).addClass('active');
    });
    });
    });
    });
    
    function nestBy(data, key, key2, key3) {
        var data_transformed = objToArray(data);

        //nest the data on suitebucket, then optionally on suite
        if(key3) {
            return d3.nest()
                .key(function(d) {
                    return d[key];
                })
                .key(function(d) {
                    return d[key2];
                })
                .key(function(d) {
                    return d[key3];
                })
                .entries(data_transformed);
        } else if(key2) {
            return d3.nest()
                .key(function(d) {
                    return d[key];
                })
                .key(function(d) {
                    return d[key2];
                })
                .entries(data_transformed);
        } else {
            return d3.nest()
                .key(function(d) {
                    return d[key];
                })
                .entries(data_transformed);
        }
    }
    
    function objToArray(data) {
        var data_transformed = [];
    
        //transform the data object
        data.date.forEach(function(d, i) {
            var obj = {};
            Object.keys(data).forEach(function(param) {
                if(param === 'date') {
                    var d = new Date('1970-01-01');
                    obj[param] = new Date(d.setDate(d.getDate() + data[param][i]));
                } else {
                    obj[param] = data[param][i];
                }
            });

            data_transformed.push(obj);
        });

        return data_transformed;
    }
}());