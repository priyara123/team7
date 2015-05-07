	var myApp = angular.module('scrumApp',[]);
	myApp.controller('ScrumAppCtrl', function($scope, $http) {
	

	var refresh = function() {
		
		//get user all user stories
		$http.get('/userStoryList').success(function (response) {
			$scope.userStoryList = response;		
		});

		//get all sprintIds
		$http.get('/sprintIdList').success(function (response) {
			$scope.sprintIdList = response;	
		});

		//calc actualPts
		$http.get('/points').success(function(response) {
			if(response[0]) {
				//handles the case where there are stories created; actualpoints = completed points.
				if (response[0].actualPoints)
					$scope.actualPoints = response[0].actualPoints;
				//handles the case where no stories created.
				else {
					$scope.actualPoints = "0"; 
					$scope.completionDate = "Cannot compute as there are no stories created!";
				}
				//handles the case where there are sprints created.
				if (response[0].expectedPoints)
					$scope.expectedPoints = response[0].expectedPoints;		
				//handles the case where there are no sprints created.
				else {
					$scope.expectedPoints = "0";
					$scope.completionDate = "Cannot compute as there are no sprints created!";
				}
				//handles the case where we have atleast one sprint created.
				if($scope.expectedPoints > 0) {
					//1 point = 1/3rd of the day; remainingDays = (diff in points)/3
					var remainingDays = Math.ceil((Math.abs(($scope.expectedPoints - $scope.actualPoints)/3) ));
					var myDate = new Date();
					myDate.setDate(myDate.getDate() + remainingDays);
					var dd = myDate.getDate();
					var mm = myDate.getMonth() + 1;
					var y = myDate.getFullYear();
					$scope.completionDate = dd + "/" + mm + "/" + y;
				}
			}
			//handles the case where there no stories and sprints created.
			else {
				$scope.expectedPoints = 0;
				$scope.actualPoints = 0;
				$scope.completionDate = "Cannot compute completion date. Looks like there are no stories/sprints created or assigned! Create & assign stories and come back!";
			}
		}); 
	};

	refresh();
	
	var list = new Object();
	var populateColumns =  function() {
		console.log("popuate columns..");
	    $http.get('/scrumColumnList').success(function(response) {
	       if(response[0]) {
	       		list = response[0].columnList.split(',');
	       		$scope.columnList = list;
	       		console.log($scope.columnList);
	       }
	    });
	};
	
	populateColumns();

	//hideSprintTable()
	$scope.hideSprintTable = function(){
		$scope.showMarkBtn ="";
		$scope.showTable = "";
		$scope.showWarning = "";
		$scope.markCompletedSuccessMessage ="";
	};
	
	
	var sprintStories = function(sprintId) {
		$http.get('/sprintStoryList/' + sprintId).success(function(response) {
				$scope.sprintStoryList = response;
				console.log("sprintid:  " + sprintId + "  reponse is: ");
				console.log(response);
				if(response[0])
				{
					$scope.showMarkBtn = "1";
				}
				else 
					$scope.showWarning = 1;
			});
	};

	 //get user stories for a sprintId
	$scope.getSprintStories = function (sprintId) { 
		$scope.markCompletedSuccessMessage = "";
		if(sprintId) {
			$scope.showTable = 1;
			sprintStories(sprintId);
		} 
	};

	//add story
	$scope.addStory = function recreateStoryObject() {
		console.log("entered add story");
		var i =0;
		var newStory = new Object();
		
    	$("#storyForm *").filter("input[class ='story']").each(function() {
        	var columnName = list[i];
        	var columnValue = $(this).val();
        	newStory[columnName] = columnValue;
        	i++;
    	});
    
    	//append sprintId to the item
    	//sprIdSelected = $("#storyForm *").filter("select[class='sprintPicker']");
    	newStory.sprintId = $("#addStorySprintPicker option:selected").text();
    	newStory.points = parseInt($("#storyForm *").filter("input[id='points']").val());
    	newStory.name = $("#storyForm *").filter("input[id='storyName']").val();
    	console.log("new stry..");
    	console.log(newStory);
    	
    	$http.post('/userStoryList', newStory).success(function(response) {
			refresh();
		});
		//reset the values to null after posting story
		$("#storyForm *").filter(":input").each(function() {
        	$(this).val('');
		});
		$("#storyForm *").filter("select[class='sprintPicker']").val('');
	};

	//add sprint
	$scope.addSprint = function() {
		$http.post('/sprintIdList', $scope.sprint).success(function(response) {
			refresh();
			$scope.sprint = "";
		});
	};

	//edit story
	$scope.editStory = function(id) {
		$http.get('/userStoryList/' + id).success(function(response) {
			$scope.userStory = response;
		});
	};

	//update story
	$scope.updateStory = function() {
		var id = $scope.userStory._id;
		$http.put('/userStoryList/' + id, $scope.userStory).success(function(response) {
			$scope.userStory = response;
			refresh();
		});
	};

	//remove story
	$scope.removeStory = function(id) {
		$http.delete('/userStoryList/' + id).success(function(response) {				
			refresh();
		});
	};

	//mark sprint complete --> update all the userStories corresponding to this sprint to userStoryStatus = 2; also update the sprintStatus = 2
	//(sprintStatus = 2 means completed; 0 means not assigned; 1 means assigned but not complete)
	$scope.markSprintComplete = function(sprintId) {
		$scope.markCompletedSuccessMessage = "";
			$http.put('/' + sprintId).success(function(response) {
				$scope.markCompletedSuccessMessage = " Success! Selected sprint is marked as complete!";
				sprintStories(sprintId);
				//refresh to update the project status.
				refresh();
			});
	};

	// var actualPts = function() {
	// 	$http.get('/actualPoints').success(function(response) {
	// 		$scope.actualPoints = response;		
	// 	});
	// };

});

 	
	