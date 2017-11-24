'use strict';

$(function() {
	
	const COLLEGEBOARD_URL = "https://api.data.gov/ed/collegescorecard/v1/schools";
	const api_key = "1RCrlaQaswzTn4LBsSyTPN5XTrk0BlVxGH4HlqdD";

	let total_results;
	let page_number;

	function getDataFromApi(callback) {
	  const settings = {
	    url: COLLEGEBOARD_URL,
	    data: {
	      api_key: api_key,
	      fields: "school.name,school.school_url,school.city,school.state,2015.student.size,2015.cost.avg_net_price.overall,2015.repayment.3_yr_default_rate",
	      "school.degrees_awarded.highest":4,
	      _zip: 30308,
	      _distance: 60,
	      _page: page_number
	    },
	    dataType: 'json',
	    type: 'GET',
	    success: callback
	  };
	  console.log(settings)
	  $.ajax(settings);
	}

	function getNameString(result) {
		return `${result['school.name']}`;
	}

	function getCityAndState(result) {
		return `${result['school.city']}, ${result['school.state']}`;
	}

	function getTotalStudentString(result) {
		return `${result['2015.student.size']} students`;
	}

	function getNetPriceString(result) {
		return `$${result['2015.cost.avg_net_price.overall']}`;
	}

	// function getSchoolUrlString(result) {
	// 	return `${result['school.school_url']}`;
	// }

	function getRepaymentString(result) {
		return `${result['2015.repayment.3_yr_default_rate']}`;
	}

	function displayThumbnails(data) {
		console.log(data);
		$('.thumbnail-list').empty()
		total_results = data['metadata']['total'];
		page_number =  data['metadata']['page']
		let results = data['results'];
		for (let i = 0; i < results.length; i++) {
			let name = getNameString(results[i]);
			let total_students = getTotalStudentString(results[i]);
			let city_and_state = getCityAndState(results[i]);
			let net_price = getNetPriceString(results[i]);
			let repayment_rate = getRepaymentString(results[i]);
			// let school_url = getSchoolUrlString(results[i]);
			let html_to_append = `<div class="col-md-3 thumbnail"><a target="_blank" href=${results[i]['school.school_url']} class='school-name'>${name}</a><span class='city-and-state'>${city_and_state}</span><span class='total-students'>${total_students}</span><span class='net-price'>${net_price}</span><span class='repayment-rate'>${repayment_rate}</span></div>`;
			$('.thumbnail-list').append(html_to_append);
		}
	}

	function doesPageExist() {
		let total_pages = total_results / 20;
		if (page_number <= total_pages) {
			return true;
		} else {
			return false;
		}
	}

	function nextOrBackButtonClicked() {
		if (doesPageExist()) {
			getDataFromApi(displayThumbnails);
		} 
	}

	$('#search').submit(function(event) {
		event.preventDefault();
		page_number = 0;
		getDataFromApi(displayThumbnails);
	});

	$('.next-button').click(function(event) {
		event.preventDefault();
		page_number++;
		nextOrBackButtonClicked()
	});

	$('.back-button').click(function(event) {
		event.preventDefault();
		if (page_number > 0) {
			page_number--;
			nextOrBackButtonClicked();
		}
	});

});