$(function() {
	$('html, body').css('overflow-y', 'visible');
	$('.alert').hide();

	o = JSON.parse(o);
	var checked = [];
	var radio = '';

	if (o[1] === true)  {
		$('button.form-control').click((e) => {
			$(e.target).toggleClass('glow');
			(checked.indexOf($(e.target).text()) === -1) ? checked.push($(e.target).text()) : checked.splice(checked.indexOf($(e.target).text()), 1);
		});
	} else {
		$('button.form-control').click((e) => {
			$('button.form-control').removeClass('glow'); //remove glow from all form-control buttons
			radio = $(e.target).text();
			$(e.target).addClass('glow'); //add glow only to the button clicked
		});
	}

	$('button:contains("mit")').click(() => {
		if ((checked.length) || (radio)) {
			var send = (o[1] === true) ? checked : radio
			$.post(window.location.pathname + '/vote', {vote: send}, (res) => {
				if (res === "true")
					$('.alert').fadeIn();
				else
					window.location = window.location.pathname + '/r';
			});
		}
	});

	$('button:contains("sult")').click(() => {
		window.location = window.location.pathname + '/r';
	});


	$('input[name="add"]').bind('keypress', function(e) {
		if (e.which === 13) { //enter key pressed
			$('button:contains("+")').trigger( "click" );
		}
	});

	$('button:contains("+")').click(() => {
		if (!/\S/g.test($('input[name="add"]').val()))
			return; //return if only spaces

		var newChoice = $('input[name="add"]').serialize();
		$.post(window.location.pathname + '/add', newChoice, () => {
			$('input[name="add"]').val('');
			 window.location.reload();
		});
	});
});
