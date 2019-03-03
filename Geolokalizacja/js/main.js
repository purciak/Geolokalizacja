function initApp(){

	$(document).ready(function(){
		var hqCoords,
			userCoords, 
			map, 
			marker,
			$localizeUserBtn,
			$calculateRouteBtn,
			$travelModeSelect;


		var directionsService = new google.maps.DirectionsService();
        var directionsDisplay = new google.maps.DirectionsRenderer();

        var routeDetailsDisplay = (function(){
            var placeholders = {
                'from': $('.js--route-from'),
                'to':  $('.js--route-to'),
                'distance': $('.js--route-distance'),
                'duration': $('.js--route-duration')
            };

            var $stepsPlaceholder = $('.js--route-steps');

            var set = function (name, value) {
                if (typeof placeholders[name] != 'undefined') {
                    placeholders[name].text(value);
                }
            };

            var clearSteps = function (){
                $stepsPlaceholder.empty();
            };

            var getNextFreeStepIndex = function (){
                return ($stepsPlaceholder.find('li').length);
            };

            var addStep = function (stepDetails) {
                var $node = $('<li>');
                var stepIndex = getNextFreeStepIndex() + 1;

                
                $node.attr('class', 'list-group-item list-group-item-action flex-column align-items-start');

                var $div = $('<div>');
                $div
                    .attr('class', 'd-flex w-100 justify-content-between')
                    .append(
                        $('<p>').addClass('mb-1').html(stepDetails.instructions)
                    )
                    .append(
                        $('<small>').text('Krok: ' + stepIndex)
                    );

                $node.append($div);

                var $p = $('<p>');
                $p.addClass('mb-1');
                $p.html('Dystans: '+stepDetails.distance.text+'<br> Czas: '+stepDetails.duration.text);

                $node.append($p);

                $stepsPlaceholder.append($node);
            };

            return {
                set: set,
                clearSteps: clearSteps,
                addStep: addStep
            };
        })();

        var calculateRoute = function(){
        	if (typeof userCoords == 'undefined'){
        		alert('Nie znam Twojego położenia!');
        		return;
        	}
    		
  			var request = {
  				origin: userCoords,
  				destination: hqCoords,
  				travelMode: $travelModeSelect.val()
  			};

  			directionsService.route(request, function(result, status){
  				console.log(result);
				if ('OK' == status){
					directionsDisplay.setDirections(result);
					renderRouteDetails(result.routes[0].legs[0]);
				}
  			});
        };

        var renderRouteDetails = function (routeDetails){
            routeDetailsDisplay.set('from', routeDetails.start_address);
            routeDetailsDisplay.set('to', routeDetails.end_address);
            routeDetailsDisplay.set('distance', routeDetails.distance.text);
            routeDetailsDisplay.set('duration', routeDetails.duration.text);

    		routeDetailsDisplay.clearSteps();

    		$.each(routeDetails.steps, function(index, stepDetails){
                routeDetailsDisplay.addStep(stepDetails);
    		});
        };

		$localizeUserBtn = $('#localize-user-btn');
		$calculateRouteBtn = $('#calculate-route-btn');
		$travelModeSelect = $('#travel-modes');

        hqCoords = {
            lat: 52.2133157, 
            lng: 21.0261473
        }

        map = new google.maps.Map(
                document.getElementById('gmap'), 
                {
                    center: hqCoords,
                    zoom: 14
                }
            );

        marker = new google.maps.Marker({
              position: hqCoords,
              map: map
        });
		directionsDisplay.setMap(map);

        $localizeUserBtn.click(function(){
        	if (typeof navigator.geolocation == 'undefined') {
        		alert('Geolokalizacja jest niedostępna!');
        		return;
        	}

        	var onSuccess = function(position){
				console.log('success');
    			console.log(position);

				unlockBtn();

				$calculateRouteBtn.prop('disabled', '');
				$travelModeSelect.prop('disabled', '');

    			userCoords = {
    				lat: position.coords.latitude,
    					lng: position.coords.longitude
    			}

    			var userMarker = new google.maps.Marker({
    				position: userCoords,
    				map: map
    			});

    			map.setCenter(userCoords);
        	};

        	var onError = function(error){
        		unlockBtn();

				console.log('error');
    			console.log(error);
        	};

        	var lockBtn = function(){
        		$localizeUserBtn.prop('disabled', 'disabled');
        		$localizeUserBtn.addClass('localizing');
        	};

        	var unlockBtn = function(){
        		$localizeUserBtn.prop('disabled', '');
        		$localizeUserBtn.removeClass('localizing');
        	};

        	lockBtn();

        	navigator.geolocation.getCurrentPosition(
    			onSuccess,
    			onError
    		);
        });

        $calculateRouteBtn.click(calculateRoute);
        $travelModeSelect.change(calculateRoute);

	});

}