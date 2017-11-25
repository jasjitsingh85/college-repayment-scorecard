'use strict';

$(function() {
	
	const COLLEGEBOARD_URL = "https://api.data.gov/ed/collegescorecard/v1/schools";
	const api_key = "1RCrlaQaswzTn4LBsSyTPN5XTrk0BlVxGH4HlqdD";

	let total_results;
	let page_number;
	let total_pages;

	function getDataFromApi(callback) {
	  const settings = {
	    url: COLLEGEBOARD_URL,
	    data: {
	      api_key: api_key,
	      fields: "school.name,school.school_url,school.city,school.state,2015.student.size,2015.cost.avg_net_price.overall,2015.repayment.3_yr_default_rate,2015.aid.median_debt.completers.monthly_payments,2015.aid.cumulative_debt.25th_percentile,2015.aid.cumulative_debt.75th_percentile",
	      "school.degrees_awarded.highest":4,
	      _zip: getZipcode(),
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
		return `${result['school.city']}, ${result['school.state']} &bull; ${numeral(result['2015.student.size']).format('0,0')} students`;
	}

	function getTotalStudentString(result) {
		var num = numeral(result['2015.student.size']).format('0,0');
		return `${num} students`;
	}

	function getNetPriceString(result) {
		var num = numeral(result['2015.cost.avg_net_price.overall']).format('$0,0')
		return `Cost (per year): ${num}`;
	}

	function getRepaymentString(result) {
		var num = numeral(result['2015.repayment.3_yr_default_rate']).format('0%');
		return `3-year default rate: ${num}`;
	}

	function showOrHideResults(total_results) {
		if (total_results > 20) {
			$('.pagination').show();
		} else {
			$('.pagination').hide();
		}
	}

	function getCumulativeDebt(result) {
		var num1 = numeral(result['2015.aid.cumulative_debt.25th_percentile']).format('$0,0');
		var num2 = numeral(result['2015.aid.cumulative_debt.75th_percentile']).format('$0,0');
		return `Debt range: ${num1}-${num2}`;
	}

	function getMonthlyPayment(result) {
		var num = numeral(result['2015.aid.median_debt.completers.monthly_payments']).format('$0,0');
		return `Avg monthly payment: ${num}`;
	}

	function setPageValues(data) {
		page_number = 0;
		total_results = data['metadata']['total'];
		page_number =  data['metadata']['page']
		total_pages = Math.floor(total_results / 20);
	}

	function displayThumbnails(data) {
		console.log(data);
		$('.thumbnail-list').empty()
		setPageValues(data);
		let results = data['results'];
		showOrHideResults(total_results);
		for (let i = 0; i < results.length; i++) {
			let name = getNameString(results[i]);
			// let total_students = getTotalStudentString(results[i]);
			let city_and_state = getCityAndState(results[i]);
			let net_price = getNetPriceString(results[i]);
			let repayment_rate = getRepaymentString(results[i]);
			let cumulative_debt = getCumulativeDebt(results[i]);
			let monthly_payments = getMonthlyPayment(results[i]);
			let html_to_append = `<div class="col-md-4 thumbnail"><a target="_blank" href=${results[i]['school.school_url']} class='school-name'>${name}</a><span class='city-and-state'>${city_and_state}</span><div class="key-stats"><span class='net-price'>${net_price}</span><span class='repayment-rate'>${cumulative_debt}</span><span class='repayment-rate'>${monthly_payments}</span><span class='repayment-rate'>${repayment_rate}</span></div></div>`;
			$('.thumbnail-list').append(html_to_append);
		}
	}

	function doesPageExist() {
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

	function getZipcode() {
		return $(".query").val();
	}

	$('#search').submit(function(event) {
		event.preventDefault();
		getDataFromApi(displayThumbnails);
	});

	$('.next-button').click(function(event) {
		event.preventDefault();
		console.log(total_pages);
		if (page_number < total_pages) {
			page_number++;
			console.log(page_number);
			nextOrBackButtonClicked();
		}
	});

	$('.back-button').click(function(event) {
		event.preventDefault();
		if (page_number > 0) {
			page_number--;
			nextOrBackButtonClicked();
		}
	});

});