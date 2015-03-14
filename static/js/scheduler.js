var app = angular.module('scheduler', ['ui.directives']);

app.config(['$interpolateProvider',
  function($interpolateProvider) {
        $interpolateProvider.startSymbol('{[{');
        $interpolateProvider.endSymbol('}]}');
  }
]);

app.controller('schedulerCtrl', function($scope, $http) {

    $(document).ready(function(){
      $scope.loadSched();	
      $(document).on('keyup', '#searchfield', function(event){
        if (event.which==13){
          $('#searchbtn').click();
          $('#searchbox').val('');
          $('.ui-autocomplete').hide();
        }
      });
    });
    $scope.terms = [];
    $scope.klasses = [];
    $scope.schedules = [];
    $scope.newSched = function(){
    	var input = $('#scheduletitle');
    	var defalt = $('#defcheck');
    	var def = false
    	if (defalt.is(':checked')){
    		def = true
    	}
  		$http.post('/scheduler/schedule/newSched', {
  			title: input.val(),
  			defalt: def,
  		}).success(function(data, status, headers, config) {
  			opt = $('<option/>').html(input.val()).appendTo('#schedselect');
  			opt.attr('value', data);
        input.val('');
        defalt.removeAttr('checked');
  		});
    };
    $scope.addClassToSched = function(){
    	var input = $('#searchbox');
  		$http.post('/scheduler/schedule/addClassToSched', {
  			title: input.val(),
  			term_id: $scope.termId,
  			sched_id: $scope.scheduleSelect,
  		}).success(function(data, status, headers, config) {
        	input.val('');
        	$scope.loadSched();
  		});
    };
    $scope.loadSched = function (){
    	var id = $scope.scheduleSelect;
    	$http.get('/scheduler/schedule/loadSched?id=' + id)
    		.success(function(data, status, headers, config) {
    			angular.element('#ourcal').fullCalendar( 'removeEventSource', $scope.events);
    			$scope.events=[];
	    		$scope.events.splice(0);
	    		angular.forEach(data, function(entry, key){
	    			startOfWeek = moment().startOf('week');
	    			day = startOfWeek.add(entry.meet_day, 'days');
	    			start = moment(day.format('YYYY-MM-DD:Z') + ' ' + entry.start_time, 'YYYY-MM-DD:Z H:mm:ss');
				  	end = moment(day.format('YYYY-MM-DD:Z') + ' ' + entry.end_time, 'YYYY-MM-DD:Z H:mm:ss');
	    			$scope.events.push({
    					title: entry.title,
			  			description: entry.description,
			  			start: start.format(),
			  			end: end.format(),
			  			allDay: false,
	    			});
	    		});
	    		angular.element('#ourcal').fullCalendar( 'addEventSource', $scope.events);

	    	});
    }
    $scope.getTerms = function(){
	    $http.get('/scheduler/schedule/getTerms?id=' + $scope.netId)
	    	.success(function(data, status, headers, config) {
	    		$scope.terms.splice(0);
	        	$scope.terms = data;
	    	});
    };
    $scope.getKlasses = function(){
	    $http.get('/scheduler/schedule/getKlasses?id=' + $scope.termId)
	    	.success(function(data, status, headers, config) {
	    		$scope.klasses.splice(0);
	        	$scope.klasses = data;
		        $( "#searchbox" ).autocomplete({
			    	source: $scope.klasses
		        });
	    	});
    };
	$scope.events = [];
	$scope.eventSources = [
		$scope.events,
	];
	$scope.klasses = [];
	/* config object */
	$scope.uiConfig = {
	  calendar:{
		defaultView: 'agendaWeek',
	    minTime: '8:00 am',
	    maxTime: '8:00 pm',
	    header:{
	      left: '',
	      center: '',
	      right: '',
        },
        contentHeight: 1000,
	    editable: false,
	    allDaySlot: false,
		
        eventRender: function(event, element) { 
            element.find('.fc-event-title').append('<div class="eventDescription">' + event.description + '</div>'); 
        },
	  }
	};
});